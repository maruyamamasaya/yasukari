import type { NextApiRequest, NextApiResponse } from 'next';
import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { GetObjectCommand, HeadObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { COGNITO_ID_TOKEN_COOKIE, verifyCognitoIdToken } from '../../lib/cognitoServer';
import { getDocumentClient } from '../../lib/dynamodb';
import { isLicenseAdmin, licenseBucket, licenseKey, licenseRegion, noStore, ownerPrefix, requirePrivateLicenseBucket } from '../../lib/privateLicense';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  noStore(res);
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).end(); }
  try {
    const admin = isLicenseAdmin(req);
    const user = admin ? null : await verifyCognitoIdToken(req.cookies?.[COGNITO_ID_TOKEN_COOKIE]);
    if (!admin && !user?.sub) return res.status(401).end();
    let key: string | null = null;
    if (typeof req.query.key === 'string') {
      // Only the uploader can preview a pending upload; administrators use saved records.
      key = licenseKey(req.query.key);
      if (!user?.sub || !key?.startsWith(ownerPrefix(user.sub))) return res.status(403).end();
    } else {
      const userId = typeof req.query.userId === 'string' ? req.query.userId : user?.sub;
      if (!userId || (!admin && userId !== user?.sub)) return res.status(403).end();
      if (req.query.slot !== '1' && req.query.slot !== '2') return res.status(400).end();
      const { Item } = await getDocumentClient().send(new GetCommand({
        TableName: process.env.USER_TABLE ?? 'yasukariUserMain', Key: { user_id: userId },
      }));
      const suffix = req.query.slot === '2' ? '_2' : '';
      key = licenseKey(Item?.[`license_image_key${suffix}`] || Item?.[`license_image_url${suffix}`]);
    }
    if (!key) return res.status(404).end();
    const s3 = new S3Client({ region: licenseRegion });
    await requirePrivateLicenseBucket(s3);
    const metadata = await s3.send(new HeadObjectCommand({ Bucket: licenseBucket, Key: key }));
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(metadata.ContentType ?? '')) return res.status(415).end();
    const url = await getSignedUrl(s3, new GetObjectCommand({
      Bucket: licenseBucket, Key: key,
      ResponseCacheControl: 'private, no-store, max-age=0',
      ResponseContentType: metadata.ContentType,
      ResponseContentDisposition: 'inline',
    }), { expiresIn: 60 });
    return res.redirect(302, url);
  } catch {
    return res.status(503).json({ message: '画像を取得できません。' });
  }
}
