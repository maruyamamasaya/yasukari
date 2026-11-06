import { licenseKey, ownerPrefix, imageRoute, pendingImageRoute, isLicenseAdmin, requirePrivateLicenseBucket } from '../lib/privateLicense';

describe('private license boundaries', () => {
  test('accepts only the configured license bucket and prefix', () => {
    expect(licenseKey('https://yasukari-file.s3.ap-northeast-1.amazonaws.com/LicenseUploads/old.jpg')).toBe('LicenseUploads/old.jpg');
    for (const value of ['https://evil.example/LicenseUploads/a.jpg', 'public/a.jpg', 'LicenseUploads/../a.jpg', 'https://yasukari-file.s3.ap-northeast-1.amazonaws.com/LicenseUploads/a?x=1']) {
      expect(licenseKey(value)).toBeNull();
    }
  });
  test('pending URL round trips without turning the key into a public URL', () => {
    const key = `${ownerPrefix('alice')}a.jpg`;
    expect(licenseKey(pendingImageRoute(key))).toBe(key);
    expect(imageRoute('alice', 1)).toBe('/api/license-image?userId=alice&slot=1');
  });
  test('admin credentials require explicit configuration and correct Basic scheme', () => {
    const oldUser = process.env.ADMIN_BASIC_USER, oldPass = process.env.ADMIN_BASIC_PASS;
    try {
      delete process.env.ADMIN_BASIC_USER; delete process.env.ADMIN_BASIC_PASS;
      const req = { headers: { authorization: `Basic ${Buffer.from('admin:secret').toString('base64')}` } } as any;
      expect(isLicenseAdmin(req)).toBe(false);
      process.env.ADMIN_BASIC_USER = 'admin'; process.env.ADMIN_BASIC_PASS = 'secret';
      expect(isLicenseAdmin(req)).toBe(true);
      req.headers.authorization = `Bearer ${Buffer.from('admin:secret').toString('base64')}`;
      expect(isLicenseAdmin(req)).toBe(false);
    } finally {
      if (oldUser === undefined) delete process.env.ADMIN_BASIC_USER; else process.env.ADMIN_BASIC_USER = oldUser;
      if (oldPass === undefined) delete process.env.ADMIN_BASIC_PASS; else process.env.ADMIN_BASIC_PASS = oldPass;
    }
  });
  test('refuses a publicly accessible or unverified bucket', async () => {
    await expect(requirePrivateLicenseBucket({ send: async () => ({}) } as any)).rejects.toThrow();
    await expect(requirePrivateLicenseBucket({ send: async () => ({ PublicAccessBlockConfiguration: {
      BlockPublicAcls: true, IgnorePublicAcls: true, BlockPublicPolicy: true, RestrictPublicBuckets: true,
    } }) } as any)).resolves.toBeUndefined();
  });
});
