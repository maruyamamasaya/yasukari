/** Process-local, global admin circuit breaker. Restart clears the lock. */
const WINDOW_MS = 60_000;
const LOCK_MS = 30 * 60_000;
const LIMIT = 100;
let failures: number[] = [];
let blockedUntil = 0;

export function adminLockRemaining(now = Date.now()): number {
  if (blockedUntil && now >= blockedUntil) {
    blockedUntil = 0;
    failures = [];
  }
  return Math.max(0, blockedUntil - now);
}

export function recordAdminFailure(now = Date.now()): number {
  if (adminLockRemaining(now)) return adminLockRemaining(now);
  failures = failures.filter(time => time > now - WINDOW_MS);
  failures.push(now);
  if (failures.length >= LIMIT) {
    blockedUntil = now + LOCK_MS;
    failures = [];
  }
  return adminLockRemaining(now);
}
