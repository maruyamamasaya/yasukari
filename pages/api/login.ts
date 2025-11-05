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
  const isAdminUser = Boolean(
    member && (member.username === 'adminuser' || member.email === 'adminuser@example.com')
  );
  const blocked = recordLoginResult(ip, isAdminUser);
  if (blocked) {
    return res.status(429).json({ message: 'Too many attempts. Please wait.' });
  }

  if (!member) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  if (!isAdminUser) {
    return res.status(403).json({ message: 'このデモでは管理者ユーザーのみログインできます' });
  }

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
