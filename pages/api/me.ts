import type { NextApiRequest, NextApiResponse } from 'next';

import {
  COGNITO_ID_TOKEN_COOKIE,
  verifyCognitoIdToken,
} from '../../lib/cognitoServer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const token = req.cookies?.[COGNITO_ID_TOKEN_COOKIE];
    const payload = await verifyCognitoIdToken(token);

    if (!payload) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    return res.status(200).json({
      user: {
        id: payload.sub,
        username: payload['cognito:username'],
        email: payload.email,
      },
    });
  } catch (error) {
    console.error('Failed to verify Cognito token', error);
    return res.status(500).json({ message: 'Failed to verify authentication.' });
  }
}
