import type { NextApiRequest, NextApiResponse } from 'next';
import { recordLoginResult } from '../../lib/rateLimit';
import {
  authenticateTestUser,
  normalizeLoginInput,
} from '../../lib/testUser';
import { createAuthCookie, signAuthToken } from '../../lib/authToken';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const ip = req.socket.remoteAddress || '';
  const normalizedInput = normalizeLoginInput(req.body ?? {});
  const member = authenticateTestUser(normalizedInput.identifier, normalizedInput.password);

  const blocked = recordLoginResult(ip, Boolean(member));
  if (blocked) {
    return res.status(429).json({ message: 'Too many attempts. Please wait.' });
  }

  if (!member) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = signAuthToken(member);
  res.setHeader('Set-Cookie', createAuthCookie(token));

  const phoneForFutureUse = normalizedInput.phone;
  void phoneForFutureUse;

  return res.status(200).json({
    message: 'Logged in',
    member: {
      id: member.id,
      username: member.username,
      email: member.email,
      registrationStatus: member.registrationStatus,
    },
  });
}
