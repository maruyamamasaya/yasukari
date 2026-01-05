import type { NextApiRequest, NextApiResponse } from 'next';

import { createCognitoAuthCookies } from '../../../lib/cognitoServer';

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

  const { idToken, accessToken, refreshToken, expiresIn } = req.body ?? {};

  if (typeof idToken !== 'string' || !idToken.trim()) {
    return res.status(400).json({ message: 'id_token is required' });
  }

  const maxAge = parseExpiresIn(expiresIn) ?? 3600;
  const cookies = createCognitoAuthCookies({
    idToken,
    accessToken: typeof accessToken === 'string' ? accessToken : undefined,
    refreshToken: typeof refreshToken === 'string' ? refreshToken : undefined,
    expiresIn: maxAge,
  });

  res.setHeader('Set-Cookie', cookies);
  return res.status(200).json({ message: 'Stored tokens' });
}
