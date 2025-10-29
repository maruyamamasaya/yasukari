import type { NextApiRequest, NextApiResponse } from 'next';
import { recordLoginResult } from '../../lib/rateLimit';
import { authenticateUser } from '../../lib/mockUserDb';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const ip = req.socket.remoteAddress || '';
  const { username, password } = req.body || {};

  const user = authenticateUser(username, password);
  const success = Boolean(user);
  const blocked = recordLoginResult(ip, success);
  if (blocked) {
    return res.status(429).json({ message: 'Too many attempts. Please wait.' });
  }

  if (success && user) {
    res.setHeader('Set-Cookie', `auth=${user.id}; Path=/; HttpOnly; Max-Age=86400`);
    return res.status(200).json({ message: 'Logged in', user: { id: user.id, email: user.email, plan: user.plan } });
  }

  return res.status(401).json({ message: 'Invalid credentials' });
}
