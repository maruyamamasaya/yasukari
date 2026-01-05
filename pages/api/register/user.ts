import type { NextApiRequest, NextApiResponse } from 'next';
import { GetCommand } from '@aws-sdk/lib-dynamodb';

import { getDocumentClient } from '../../../lib/dynamodb';
import { getCognitoAuthFromRequest } from '../../../lib/cognitoServer';
import type { RegistrationData } from '../../../types/registration';

const TABLE_NAME = 'yasukariUserMain';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const auth = await getCognitoAuthFromRequest({
      cookies: req.cookies,
      authorization: req.headers.authorization,
      setCookie: (cookies) => res.setHeader('Set-Cookie', cookies),
    });

    if (!auth?.payload.sub) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const client = getDocumentClient();
    const { Item } = await client.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { user_id: auth.payload.sub },
      })
    );

    if (!Item) {
      return res.status(404).json({ message: '本登録情報が見つかりません。', registration: null });
    }

    return res.status(200).json({ registration: Item as RegistrationData });
  } catch (error) {
    console.error('Failed to load registration', error);
    const message = error instanceof Error ? error.message : '本登録情報の取得に失敗しました。';
    return res.status(500).json({ message });
  }
}
