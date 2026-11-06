jest.mock('next/server', () => ({
  NextResponse: class {
    status: number; headers: Headers; body: string;
    constructor(body: string, init: any = {}) { this.body = body; this.status = init.status ?? 200; this.headers = new Headers(init.headers); }
    static next() { return { status: 200, headers: new Headers() }; }
    static redirect() { return { status: 307, headers: new Headers() }; }
  },
}));
jest.mock('../lib/rateLimit', () => ({ checkAccess: () => false }));
import { middleware } from '../middleware';
import { recordAdminFailure } from '../lib/adminLockout';
const request = (path: string, authorization?: string) => ({
  nextUrl: { pathname: path }, url: `https://example.com${path}`, ip: '127.0.0.1',
  headers: new Headers(authorization ? { authorization } : {}), cookies: { get: () => undefined },
} as any);
const good = `Basic ${Buffer.from('admin:secret').toString('base64')}`;
beforeAll(() => {
  process.env.ADMIN_BASIC_USER = 'admin'; process.env.ADMIN_BASIC_PASS = 'secret';
  global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ enabled: false }) });
});
afterAll(() => { delete process.env.ADMIN_BASIC_USER; delete process.env.ADMIN_BASIC_PASS; });
test('admin APIs require authentication without page redirects', async () => {
  expect((await middleware(request('/api/admin/license-uploads'))).status).toBe(401);
  expect((await middleware(request('/api/admin/license-uploads', good))).status).toBe(200);
});
test('global lock blocks valid admin credentials and APIs, but not public pages', async () => {
  for (let i = 0; i < 99; i++) recordAdminFailure();
  const trigger = await middleware(request('/admin', 'Basic invalid'));
  expect(trigger.status).toBe(503);
  expect(trigger.headers.get('Retry-After')).toBe('1800');
  expect((await middleware(request('/admin/dashboard', good))).status).toBe(503);
  expect((await middleware(request('/api/admin/license-uploads', good))).status).toBe(503);
  expect((await middleware(request('/'))).status).toBe(200);
});
