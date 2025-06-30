import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { username, password } = req.body || {};

  if (username === 'admin' && password === 'password') {
    res.setHeader('Set-Cookie', 'auth=loggedin; Path=/; HttpOnly; Max-Age=86400');
    return res.status(200).json({ message: 'Logged in' });
  }

  return res.status(401).json({ message: 'Invalid credentials' });
}
