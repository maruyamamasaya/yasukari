import type { NextApiRequest, NextApiResponse } from 'next';

import { AUTH_COOKIE_NAME, verifyAuthToken } from '../../lib/authToken';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const token = req.cookies?.[AUTH_COOKIE_NAME];
  const payload = verifyAuthToken(token);

  if (!payload) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  return res.status(200).json({
    user: {
      id: payload.sub,
      username: payload.username,
      email: payload.email,
      registrationStatus: payload.registrationStatus,
    },
  });
}
