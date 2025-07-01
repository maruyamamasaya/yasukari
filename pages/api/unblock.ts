import type { NextApiRequest, NextApiResponse } from 'next';
import { clearBlock } from '../../lib/rateLimit';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const ip = req.socket.remoteAddress || '';
  clearBlock(ip);
  return res.status(200).json({ message: 'Unblocked' });
}
