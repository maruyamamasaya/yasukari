import type { NextApiRequest, NextApiResponse } from 'next';

import { createLogoutCookie } from '../../lib/authToken';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  res.setHeader('Set-Cookie', createLogoutCookie());
  return res.status(200).json({ message: 'Logged out' });
}
