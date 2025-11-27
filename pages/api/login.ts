import type { NextApiRequest, NextApiResponse } from 'next';

import { buildAuthorizeUrl } from '../../lib/cognitoHostedUi';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { state } = req.query;

  if (typeof state !== 'string' || !state) {
    return res.status(400).json({ error: 'state is required' });
  }

  const authorizeUrl = buildAuthorizeUrl(state);
  return res.status(200).json({ authorize_url: authorizeUrl });
}
