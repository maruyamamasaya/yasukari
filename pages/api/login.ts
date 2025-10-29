import type { NextApiRequest, NextApiResponse } from 'next';
import { recordLoginResult } from '../../lib/rateLimit';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const ip = req.socket.remoteAddress || '';
  const { username, password } = req.body || {};

  const success = username === 'adminuser' && password === 'adminuser';
  const blocked = recordLoginResult(ip, success);
  if (blocked) {
    return res.status(429).json({ message: 'Too many attempts. Please wait.' });
  }

  if (success) {
    res.setHeader('Set-Cookie', 'auth=loggedin; Path=/; HttpOnly; Max-Age=86400');
    return res.status(200).json({ message: 'Logged in' });
  }

  return res.status(401).json({ message: 'Invalid credentials' });
}
