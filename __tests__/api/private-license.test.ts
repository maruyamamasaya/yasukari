jest.mock('../../lib/registrationEmails', () => ({ deliverFullRegistrationEmail: jest.fn() }));
jest.mock('../../lib/cognitoServer', () => ({ COGNITO_ID_TOKEN_COOKIE: 'id', verifyCognitoIdToken: jest.fn() }));
jest.mock('../../lib/dynamodb', () => ({ getDocumentClient: () => ({ send: mockDb }), scanAllItems: jest.fn() }));
jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({ send: mockS3 })),
  HeadObjectCommand: jest.fn().mockImplementation(input => input),
  GetPublicAccessBlockCommand: jest.fn().mockImplementation(input => input),
  GetObjectCommand: jest.fn().mockImplementation(input => input),
  PutObjectCommand: jest.fn().mockImplementation(input => input),
}));
jest.mock('@aws-sdk/s3-request-presigner', () => ({ getSignedUrl: jest.fn().mockResolvedValue('https://signed.example/image') }));
const mockDb = jest.fn();
const mockS3 = jest.fn();
import handler from '../../pages/api/license-image';
import upload from '../../pages/api/register/license-uploads';
import adminList from '../../pages/api/admin/license-uploads';
import store from '../../pages/api/register/store-user';
import userRecord from '../../pages/api/register/user';
import { REQUIRED_REGISTRATION_FIELDS } from '../../types/registration';
import { verifyCognitoIdToken } from '../../lib/cognitoServer';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { scanAllItems } from '../../lib/dynamodb';
function response() {
  const res: any = { setHeader: jest.fn(), status: jest.fn(), end: jest.fn(), json: jest.fn(), redirect: jest.fn() };
  res.status.mockReturnValue(res); res.end.mockReturnValue(res); res.json.mockReturnValue(res);
  return res;
}
const req = (query = {}, method = 'GET') => ({ method, headers: {}, cookies: {}, query } as any);
beforeEach(() => {
  jest.clearAllMocks();
  (verifyCognitoIdToken as jest.Mock).mockResolvedValue({ sub: 'alice' });
  mockS3.mockResolvedValue({ PublicAccessBlockConfiguration: { BlockPublicAcls: true, IgnorePublicAcls: true, BlockPublicPolicy: true, RestrictPublicBuckets: true }, ContentType: 'image/jpeg' });
});
test('unauthenticated request cannot access images or storage', async () => {
  (verifyCognitoIdToken as jest.Mock).mockResolvedValue(null);
  const res = response(); await handler(req({ userId: 'alice', slot: '1' }), res);
  expect(res.status).toHaveBeenCalledWith(401); expect(mockDb).not.toHaveBeenCalled(); expect(mockS3).not.toHaveBeenCalled();
});
test('cannot read another user or preview their key', async () => {
  for (const query of [{ userId: 'bob', slot: '1' }, { key: 'LicenseUploads/bob/a.jpg' }]) {
    const res = response(); await handler(req(query), res); expect(res.status).toHaveBeenCalledWith(403);
  }
  expect(getSignedUrl).not.toHaveBeenCalled(); expect(mockDb).not.toHaveBeenCalled();
});
test('owner gets a 60 second URL with no-store on redirect and object', async () => {
  mockDb.mockResolvedValue({ Item: { license_image_key: 'LicenseUploads/alice/a.jpg' } });
  const res = response(); await handler(req({ userId: 'alice', slot: '1' }), res);
  expect(getSignedUrl).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ Key: 'LicenseUploads/alice/a.jpg', ResponseCacheControl: 'private, no-store, max-age=0' }), { expiresIn: 60 });
  expect(res.redirect).toHaveBeenCalledWith(302, 'https://signed.example/image');
  expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', 'private, no-store, max-age=0');
});
test('legacy record is signed only after ownership check', async () => {
  mockDb.mockResolvedValue({ Item: { license_image_url: 'https://yasukari-file.s3.ap-northeast-1.amazonaws.com/LicenseUploads/old.jpg' } });
  await handler(req({ slot: '1' }), response());
  expect(getSignedUrl).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ Key: 'LicenseUploads/old.jpg' }), { expiresIn: 60 });
});
test('admin with explicit credentials can view a saved record', async () => {
  process.env.ADMIN_BASIC_USER = 'admin'; process.env.ADMIN_BASIC_PASS = 'secret';
  try {
    mockDb.mockResolvedValue({ Item: { license_image_key: 'LicenseUploads/bob/a.jpg' } });
    const request = req({ userId: 'bob', slot: '1' });
    request.headers.authorization = `Basic ${Buffer.from('admin:secret').toString('base64')}`;
    const res = response(); await handler(request, res);
    expect(res.redirect).toHaveBeenCalled(); expect(verifyCognitoIdToken).not.toHaveBeenCalled();
  } finally { delete process.env.ADMIN_BASIC_USER; delete process.env.ADMIN_BASIC_PASS; }
});
test('public bucket fails closed before issuing URL', async () => {
  mockS3.mockResolvedValue({});
  await handler(req({ key: 'LicenseUploads/alice/a.jpg' }), response());
  expect(getSignedUrl).not.toHaveBeenCalled();
});
test('admin list rejects anonymous access before scanning', async () => {
  const res = response(); await adminList(req(), res);
  expect(res.status).toHaveBeenCalledWith(401); expect(scanAllItems).not.toHaveBeenCalled();
});
test('upload and registration save reject missing identity', async () => {
  (verifyCognitoIdToken as jest.Mock).mockResolvedValue(null);
  for (const fn of [upload, store]) {
    const res = response(); await fn(req({}, 'POST'), res); expect(res.status).toHaveBeenCalledWith(401);
  }
  expect(mockS3).not.toHaveBeenCalled(); expect(mockDb).not.toHaveBeenCalled();
});
test('registration cannot attach another users image', async () => {
  mockDb.mockResolvedValue({ Item: {} });
  const request = req({}, 'POST'); request.body = { license_image_key: 'LicenseUploads/bob/a.jpg' };
  const res = response(); await store(request, res);
  expect(res.status).toHaveBeenCalledWith(400); expect(mockDb).toHaveBeenCalledTimes(1);
});

test('registration writes keys and removes legacy URLs without breaking completion fields', async () => {
  mockDb.mockResolvedValueOnce({ Item: { license_image_url: 'https://yasukari-file.s3.ap-northeast-1.amazonaws.com/LicenseUploads/old.jpg' } }).mockResolvedValueOnce({});
  const request = req({}, 'POST');
  request.body = Object.fromEntries(REQUIRED_REGISTRATION_FIELDS.map(field => [field, 'value']));
  request.body.user_id = 'alice';
  request.body.license_image_url = '/api/license-image?userId=alice&slot=1';
  const res = response(); await store(request, res);
  expect(res.status).toHaveBeenCalledWith(200);
  const item = mockDb.mock.calls[1][0].input.Item;
  expect(item.license_image_key).toBe('LicenseUploads/old.jpg');
  expect(item).not.toHaveProperty('license_image_url');
});
test('user response keeps compatible display URLs for existing forms', async () => {
  mockDb.mockResolvedValue({ Item: { user_id: 'alice', license_image_key: 'LicenseUploads/alice/a.jpg' } });
  const res = response(); await userRecord(req(), res);
  expect(res.json).toHaveBeenCalledWith({ registration: { user_id: 'alice', license_image_url: '/api/license-image?userId=alice&slot=1', license_image_url_2: '' } });
});
test('upload stores a user-scoped key and never returns a public S3 URL', async () => {
  const request = req({}, 'POST');
  request.body = { data: Buffer.from([0xff, 0xd8, 0xff, 0]).toString('base64'), fileName: 'photo.jpg', contentType: 'image/jpeg' };
  const res = response(); await upload(request, res);
  expect(mockS3).toHaveBeenCalledWith(expect.objectContaining({ Key: expect.stringMatching(/^LicenseUploads\/alice\//), CacheControl: 'private, no-store, max-age=0' }));
  expect(res.json).toHaveBeenCalledWith({ url: expect.stringMatching(/^\/api\/license-image\?key=/) });
});
