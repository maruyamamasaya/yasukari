import type { NextApiRequest, NextApiResponse } from 'next';
import { recordLoginResult } from '../../lib/rateLimit';
import { verifyLightMember } from '../../lib/mockUserDb';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const ip = req.socket.remoteAddress || '';
  const { username, password } = req.body || {};
  const member = verifyLightMember(username ?? '', password ?? '');
  const success = Boolean(member);
  const blocked = recordLoginResult(ip, success);
  if (blocked) {
    return res.status(429).json({ message: 'Too many attempts. Please wait.' });
  }

  if (member) {
    res.setHeader('Set-Cookie', `auth=${member.id}; Path=/; HttpOnly; Max-Age=86400; SameSite=Lax`);
    return res.status(200).json({
      message: 'Logged in',
      member: {
        id: member.id,
        username: member.username,
        plan: member.plan,
      },
    });
  }

  return res.status(401).json({ message: 'Invalid credentials' });
}
