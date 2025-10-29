import type { NextApiRequest, NextApiResponse } from 'next';
import { createLightMember } from '../../lib/mockUserDb';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { username, password } = req.body || {};

  try {
    const member = createLightMember(username ?? '', password ?? '');
    res.setHeader('Set-Cookie', `auth=${member.id}; Path=/; HttpOnly; Max-Age=${60 * 60 * 24}; SameSite=Lax`);

    return res.status(201).json({
      message: 'ライト会員として登録しました',
      member: {
        id: member.id,
        username: member.username,
        plan: member.plan,
        createdAt: member.createdAt,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : '登録に失敗しました';
    return res.status(400).json({ message });
  }
}
