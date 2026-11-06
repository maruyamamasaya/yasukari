export {};
let breaker: typeof import('../lib/adminLockout');
beforeEach(() => { jest.resetModules(); breaker = require('../lib/adminLockout'); });
test('100 failures within a rolling minute lock all admins for 30 minutes', () => {
  const now = 100_000;
  for (let i = 0; i < 99; i++) expect(breaker.recordAdminFailure(now + i)).toBe(0);
  expect(breaker.recordAdminFailure(now + 99)).toBe(30 * 60_000);
  expect(breaker.adminLockRemaining(now + 100)).toBe(30 * 60_000 - 1);
});
test('old attempts expire at 60 seconds', () => {
  for (let i = 0; i < 99; i++) breaker.recordAdminFailure(100_000);
  expect(breaker.recordAdminFailure(160_000)).toBe(0);
});
test('blocked traffic does not extend the deadline and expiry resets the count', () => {
  for (let i = 0; i < 100; i++) breaker.recordAdminFailure(100_000);
  expect(breaker.recordAdminFailure(200_000)).toBe(1_700_000);
  expect(breaker.adminLockRemaining(1_900_000)).toBe(0);
  expect(breaker.recordAdminFailure(1_900_000)).toBe(0);
});
test('a restarted module begins unlocked', () => {
  for (let i = 0; i < 100; i++) breaker.recordAdminFailure(100_000);
  jest.resetModules(); breaker = require('../lib/adminLockout');
  expect(breaker.adminLockRemaining(100_000)).toBe(0);
});
