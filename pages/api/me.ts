import type { NextApiRequest, NextApiResponse } from 'next';

import { getCognitoAuthFromRequest } from '../../lib/cognitoServer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const auth = await getCognitoAuthFromRequest({
      cookies: req.cookies,
      authorization: req.headers.authorization,
      setCookie: (cookies) => res.setHeader('Set-Cookie', cookies),
    });
    if (!auth) {
      return res.status(200).json({ user: null });
    }

    return res.status(200).json({
      user: {
        id: auth.payload.sub,
        username: auth.payload['cognito:username'],
        email: auth.payload.email,
      },
    });
  } catch (error) {
    console.error('Failed to verify Cognito token', error);
    const status = error instanceof Error && error.message.includes('required') ? 400 : 503;
    const message =
      status === 400 ? 'Invalid authentication configuration.' : 'Authentication unavailable';
    return res.status(status).json({ message });
  }
}
