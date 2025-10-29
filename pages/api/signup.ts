import type { NextApiRequest, NextApiResponse } from 'next';
import { registerLightMember } from '../../lib/mockUserDb';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  try {
    const user = registerLightMember(email, password);
    res.setHeader('Set-Cookie', `auth=${user.id}; Path=/; HttpOnly; Max-Age=86400`);
    return res.status(201).json({ message: 'User registered', user: { id: user.id, email: user.email, plan: user.plan } });
  } catch (error) {
    if (error instanceof Error && error.message === 'USER_EXISTS') {
      return res.status(409).json({ message: 'このメールアドレスは既に登録されています。' });
    }
    return res.status(500).json({ message: '登録に失敗しました。しばらく経ってから再度お試しください。' });
  }
}
