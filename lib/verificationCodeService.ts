import { randomBytes } from 'crypto';

export const VERIFICATION_CODE_LENGTH = 6;
const CODE_EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24時間
const MAX_ATTEMPTS = 5;

const CODE_CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';

type VerificationRecord = {
  code: string;
  expiresAt: number;
  attempts: number;
};

const records = new Map<string, VerificationRecord>();

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function generateCode(length: number): string {
  const bytes = randomBytes(length);
  let result = '';
  for (let i = 0; i < length; i += 1) {
    const index = bytes[i] % CODE_CHARSET.length;
    result += CODE_CHARSET[index];
  }
  return result;
}

export type IssuedVerificationCode = {
  email: string;
  code: string;
  expiresAt: number;
};

export function issueVerificationCode(rawEmail: string): IssuedVerificationCode {
  const email = normalizeEmail(rawEmail);
  if (!email) {
    throw new Error('メールアドレスを指定してください');
  }
  const code = generateCode(VERIFICATION_CODE_LENGTH);
  const expiresAt = Date.now() + CODE_EXPIRATION_MS;
  records.set(email, { code, expiresAt, attempts: 0 });
  return { email, code, expiresAt };
}

export type VerificationFailureReason = 'not_found' | 'expired' | 'mismatch' | 'too_many_attempts';

export type VerificationResult =
  | { success: true }
  | { success: false; reason: VerificationFailureReason; attemptsRemaining?: number };

export function verifyVerificationCode(rawEmail: string, rawCode: string): VerificationResult {
  const email = normalizeEmail(rawEmail);
  const code = rawCode.trim();
  if (!email || !code) {
    return { success: false, reason: 'not_found' };
  }
  const record = records.get(email);
  if (!record) {
    return { success: false, reason: 'not_found' };
  }
  if (Date.now() > record.expiresAt) {
    records.delete(email);
    return { success: false, reason: 'expired' };
  }
  if (record.code !== code) {
    record.attempts += 1;
    const attemptsRemaining = Math.max(0, MAX_ATTEMPTS - record.attempts);
    if (record.attempts >= MAX_ATTEMPTS) {
      records.delete(email);
      return { success: false, reason: 'too_many_attempts' };
    }
    return { success: false, reason: 'mismatch', attemptsRemaining };
  }
  records.delete(email);
  return { success: true };
}

export function hasPendingVerification(rawEmail: string): boolean {
  const email = normalizeEmail(rawEmail);
  if (!email) {
    return false;
  }
  return records.has(email);
}

export function clearVerificationCodes(): void {
  records.clear();
}

export function getVerificationAttemptsRemaining(rawEmail: string): number | null {
  const email = normalizeEmail(rawEmail);
  if (!email) {
    return null;
  }
  const record = records.get(email);
  if (!record) {
    return null;
  }
  return Math.max(0, MAX_ATTEMPTS - record.attempts);
}

export function getCodeExpiration(rawEmail: string): number | null {
  const email = normalizeEmail(rawEmail);
  if (!email) {
    return null;
  }
  const record = records.get(email);
  if (!record) {
    return null;
  }
  return record.expiresAt;
}
