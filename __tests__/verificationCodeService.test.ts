import {
  clearVerificationCodes,
  getCodeExpiration,
  getVerificationAttemptsRemaining,
  hasPendingVerification,
  issueVerificationCode,
  verifyVerificationCode,
} from '../lib/verificationCodeService';

const TEST_EMAIL = 'test@example.com';

describe('verificationCodeService', () => {
  afterEach(() => {
    clearVerificationCodes();
  });

  it('issues and verifies a code successfully', () => {
    const { code } = issueVerificationCode(TEST_EMAIL);

    expect(hasPendingVerification(TEST_EMAIL)).toBe(true);
    const expiration = getCodeExpiration(TEST_EMAIL);
    expect(expiration).not.toBeNull();

    const result = verifyVerificationCode(TEST_EMAIL, code);
    expect(result.success).toBe(true);
    expect(hasPendingVerification(TEST_EMAIL)).toBe(false);
  });

  it('rejects mismatched codes and tracks attempts', () => {
    issueVerificationCode(TEST_EMAIL);

    const mismatch = verifyVerificationCode(TEST_EMAIL, 'wrong1');
    expect(mismatch.success).toBe(false);
    expect(mismatch.reason).toBe('mismatch');
    expect(mismatch.attemptsRemaining).toBe(4);

    verifyVerificationCode(TEST_EMAIL, 'wrong2');
    verifyVerificationCode(TEST_EMAIL, 'wrong3');
    verifyVerificationCode(TEST_EMAIL, 'wrong4');
    const locked = verifyVerificationCode(TEST_EMAIL, 'wrong5');

    expect(locked.success).toBe(false);
    expect(locked.reason).toBe('too_many_attempts');
    expect(hasPendingVerification(TEST_EMAIL)).toBe(false);
  });

  it('expires the code when time passes', () => {
    const { code, expiresAt } = issueVerificationCode(TEST_EMAIL);
    expect(code).toHaveLength(6);

    const expiration = getCodeExpiration(TEST_EMAIL);
    expect(expiration).toBe(expiresAt);

    const now = Date.now;
    Date.now = () => expiresAt + 1;
    try {
      const result = verifyVerificationCode(TEST_EMAIL, code);
      expect(result.success).toBe(false);
      expect(result.reason).toBe('expired');
    } finally {
      Date.now = now;
    }
  });

  it('handles unknown emails', () => {
    const result = verifyVerificationCode('unknown@example.com', 'ABC123');
    expect(result.success).toBe(false);
    expect(result.reason).toBe('not_found');
  });

  it('reports attempts remaining', () => {
    issueVerificationCode(TEST_EMAIL);
    expect(getVerificationAttemptsRemaining(TEST_EMAIL)).toBe(5);
    verifyVerificationCode(TEST_EMAIL, 'wrong1');
    expect(getVerificationAttemptsRemaining(TEST_EMAIL)).toBe(4);
  });
});
