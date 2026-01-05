import type { NextApiRequest, NextApiResponse } from 'next';

import { exchangeCognitoCode, createCognitoAuthCookies, verifyCognitoIdToken } from '../../../lib/cognitoServer';

const redirectUri = process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI ?? '';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { code } = req.body ?? {};
  if (typeof code !== 'string' || !code.trim()) {
    return res.status(400).json({ message: 'code is required' });
  }

  if (!redirectUri) {
    return res.status(500).json({ message: 'COGNITO_REDIRECT_URI is not configured.' });
  }

  try {
    const tokenResponse = await exchangeCognitoCode(code, redirectUri);
    if (!tokenResponse.id_token) {
      return res.status(401).json({ message: 'Failed to exchange token.' });
    }

    const payload = await verifyCognitoIdToken(tokenResponse.id_token);
    if (!payload) {
      return res.status(401).json({ message: 'Invalid ID token.' });
    }

    const cookies = createCognitoAuthCookies({
      idToken: tokenResponse.id_token,
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token,
      expiresIn: tokenResponse.expires_in ?? 3600,
    });

    if (cookies.length > 0) {
      res.setHeader('Set-Cookie', cookies);
    }

    return res.status(200).json({ message: 'Stored tokens' });
  } catch (error) {
    console.error('Failed to exchange Cognito code', error);
    return res.status(500).json({ message: 'Failed to exchange token.' });
  }
}
