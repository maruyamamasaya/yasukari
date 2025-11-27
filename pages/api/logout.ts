import type { NextApiRequest, NextApiResponse } from 'next';

import { COGNITO_ACCESS_TOKEN_COOKIE, COGNITO_ID_TOKEN_COOKIE } from '../../lib/cognitoHostedUi';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  const base = `Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT${secure}`;
  res.setHeader('Set-Cookie', [
    `${COGNITO_ID_TOKEN_COOKIE}=; ${base}`,
    `${COGNITO_ACCESS_TOKEN_COOKIE}=; ${base}`,
  ]);

  return res.status(200).json({ message: 'Logged out locally. Redirect to Cognito logout next.' });
}
