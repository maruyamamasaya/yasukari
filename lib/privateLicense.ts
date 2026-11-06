import { GetPublicAccessBlockCommand, S3Client } from '@aws-sdk/client-s3';
import { timingSafeEqual } from 'crypto';
import type { NextApiRequest, NextApiResponse } from 'next';

export const licenseBucket = process.env.LICENSE_UPLOADS_BUCKET ?? process.env.PHOTO_UPLOADS_BUCKET ?? 'yasukari-file';
export const licenseRegion = process.env.AWS_REGION ?? 'ap-northeast-1';
export const licensePrefix = (process.env.LICENSE_UPLOADS_PREFIX ?? 'LicenseUploads/').replace(/\/*$/, '/');
export const ownerPrefix = (userId: string) => `${licensePrefix}${encodeURIComponent(userId)}/`;
export const imageRoute = (userId: string, slot: number) => `/api/license-image?userId=${encodeURIComponent(userId)}&slot=${slot}`;
export const pendingImageRoute = (key: string) => `/api/license-image?key=${encodeURIComponent(key)}`;

export function noStore(res: NextApiResponse) {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Vary', 'Cookie, Authorization');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Content-Type-Options', 'nosniff');
}

// Do not use basicAuth.ts's development fallback credentials for private data.
export function isLicenseAdmin(req: NextApiRequest): boolean {
  const user = process.env.ADMIN_BASIC_USER;
  const pass = process.env.ADMIN_BASIC_PASS;
  const header = req.headers.authorization;
  if (!user || !pass || !header || !/^Basic\s+/i.test(header)) return false;
  const actual = Buffer.from(header.replace(/^Basic\s+/i, ''), 'base64');
  const expected = Buffer.from(`${user}:${pass}`);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

// Accept only keys within the license prefix, or exact legacy URLs for this bucket.
export function licenseKey(value: unknown): string | null {
  if (typeof value !== 'string' || !value) return null;
  let key = value;
  if (value.startsWith('/api/license-image?')) {
    key = new URL(value, 'https://local.invalid').searchParams.get('key') ?? '';
  } else if (/^https?:/i.test(value)) {
    try {
      const url = new URL(value);
      if (url.protocol !== 'https:' || url.username || url.password || url.port || url.search || url.hash) return null;
      if (url.hostname !== `${licenseBucket}.s3.${licenseRegion}.amazonaws.com` && url.hostname !== `${licenseBucket}.s3.amazonaws.com`) return null;
      key = decodeURIComponent(url.pathname.slice(1));
    } catch { return null; }
  }
  if (!key.startsWith(licensePrefix) || key.length <= licensePrefix.length || /[\x00-\x1f\\]/.test(key) || key.split('/').some(p => p === '..' || p === '.')) return null;
  return key;
}

// Refuse uploads and signed links until anonymous bucket access is blocked.
export async function requirePrivateLicenseBucket(client: S3Client): Promise<void> {
  const result = await client.send(new GetPublicAccessBlockCommand({ Bucket: licenseBucket }));
  const config = result.PublicAccessBlockConfiguration;
  if (!config?.BlockPublicAcls || !config.IgnorePublicAcls || !config.BlockPublicPolicy || !config.RestrictPublicBuckets) {
    throw new Error('License bucket must have all S3 Block Public Access settings enabled');
  }
}
