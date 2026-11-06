import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

test('installed S3 client and presigner generate a short-lived private image URL together', async () => {
  // Signing is local: these dummy credentials never contact AWS.
  const client = new S3Client({
    region: 'ap-northeast-1',
    credentials: { accessKeyId: 'TEST_ACCESS_KEY', secretAccessKey: 'test-secret-not-a-real-credential' },
  });
  try {
    const signed = await getSignedUrl(client, new GetObjectCommand({
      Bucket: 'private-license-test', Key: 'LicenseUploads/test/image.jpg',
      ResponseCacheControl: 'private, no-store, max-age=0',
    }), { expiresIn: 60 });
    const url = new URL(signed);
    expect(url.protocol).toBe('https:');
    expect(url.searchParams.get('X-Amz-Expires')).toBe('60');
    expect(url.searchParams.get('response-cache-control')).toBe('private, no-store, max-age=0');
    expect(url.searchParams.get('X-Amz-Signature')).toMatch(/^[a-f0-9]{64}$/);
  } finally { client.destroy(); }
});
