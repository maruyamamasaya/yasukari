import { createHmac, timingSafeEqual } from 'crypto';

import type { AuthenticatedUser } from './testUser';

export const AUTH_COOKIE_NAME = 'auth_token';
export const AUTH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24; // 1 day

const JWT_SECRET = process.env.JWT_SECRET ?? 'development-secret';

export type AuthTokenPayload = {
  sub: string;
  username?: string;
  email?: string;
  registrationStatus: AuthenticatedUser['registrationStatus'];
  iat: number;
  exp: number;
};

function base64UrlEncode(value: string | Buffer): string {
  return Buffer.from(value)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(value: string): Buffer {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
  return Buffer.from(padded, 'base64');
}

export function signAuthToken(
  user: AuthenticatedUser,
  expiresInSeconds: number = AUTH_COOKIE_MAX_AGE_SECONDS
): string {
  const issuedAt = Math.floor(Date.now() / 1000);
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload: AuthTokenPayload = {
    sub: user.id,
    username: user.username,
    email: user.email,
    registrationStatus: user.registrationStatus,
    iat: issuedAt,
    exp: issuedAt + expiresInSeconds,
  };
  const payloadEncoded = base64UrlEncode(JSON.stringify(payload));
  const signature = createHmac('sha256', JWT_SECRET)
    .update(`${header}.${payloadEncoded}`)
    .digest();
  const signatureEncoded = base64UrlEncode(signature);
  return `${header}.${payloadEncoded}.${signatureEncoded}`;
}

export function verifyAuthToken(token: string | undefined | null): AuthTokenPayload | null {
  if (!token) {
    return null;
  }

  const segments = token.split('.');
  if (segments.length !== 3) {
    return null;
  }

  const [headerSegment, payloadSegment, signatureSegment] = segments;

  const expectedSignature = createHmac('sha256', JWT_SECRET)
    .update(`${headerSegment}.${payloadSegment}`)
    .digest();
  const actualSignature = base64UrlDecode(signatureSegment);

  if (expectedSignature.length !== actualSignature.length) {
    return null;
  }

  if (!timingSafeEqual(expectedSignature, actualSignature)) {
    return null;
  }

  try {
    const payloadJson = base64UrlDecode(payloadSegment).toString('utf8');
    const payload = JSON.parse(payloadJson) as AuthTokenPayload;
    if (typeof payload.exp !== 'number') {
      return null;
    }
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp <= now) {
      return null;
    }
    return payload;
  } catch (error) {
    return null;
  }
}

export function createAuthCookie(token: string, maxAgeSeconds = AUTH_COOKIE_MAX_AGE_SECONDS): string {
  const parts = [
    `${AUTH_COOKIE_NAME}=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAgeSeconds}`,
  ];
  if (process.env.NODE_ENV === 'production') {
    parts.push('Secure');
  }
  return parts.join('; ');
}

export function createLogoutCookie(): string {
  const parts = [`${AUTH_COOKIE_NAME}=`, 'Path=/', 'HttpOnly', 'SameSite=Lax', 'Max-Age=0'];
  if (process.env.NODE_ENV === 'production') {
    parts.push('Secure');
  }
  parts.push('Expires=Thu, 01 Jan 1970 00:00:00 GMT');
  return parts.join('; ');
}
