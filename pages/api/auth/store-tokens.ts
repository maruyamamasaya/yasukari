import type { NextApiRequest, NextApiResponse } from 'next';

import { COGNITO_ACCESS_TOKEN_COOKIE, COGNITO_ID_TOKEN_COOKIE } from '../../../lib/cognitoHostedUi';

const formatExpires = (maxAgeSeconds: number): string => {
  const expires = new Date(Date.now() + maxAgeSeconds * 1000);
  return expires.toUTCString();
};

const parseExpiresIn = (value: unknown): number | null => {
  const asNumber = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(asNumber) || asNumber <= 0) {
    return null;
  }
  return Math.floor(asNumber);
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { idToken, accessToken, expiresIn } = req.body ?? {};

  if (typeof idToken !== 'string' || !idToken.trim()) {
    return res.status(400).json({ message: 'id_token is required' });
  }

  const maxAge = parseExpiresIn(expiresIn) ?? 3600;
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  const cookieBase = `Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}; Expires=${formatExpires(maxAge)}${secure}`;

  const cookies = [`${COGNITO_ID_TOKEN_COOKIE}=${idToken}; ${cookieBase}`];
  if (typeof accessToken === 'string' && accessToken.trim()) {
    cookies.push(`${COGNITO_ACCESS_TOKEN_COOKIE}=${accessToken}; ${cookieBase}`);
  }

  res.setHeader('Set-Cookie', cookies);
  return res.status(200).json({ message: 'Stored tokens' });
}
