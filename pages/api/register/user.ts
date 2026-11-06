import type { NextApiRequest, NextApiResponse } from 'next';
import { GetCommand } from '@aws-sdk/lib-dynamodb';

import { getDocumentClient } from '../../../lib/dynamodb';
import { COGNITO_ID_TOKEN_COOKIE, verifyCognitoIdToken } from '../../../lib/cognitoServer';
import type { RegistrationData } from '../../../types/registration';

import { noStore, imageRoute } from '../../../lib/privateLicense';

const USER_TABLE = process.env.USER_TABLE ?? 'yasukariUserMain';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  noStore(res);
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const token = req.cookies?.[COGNITO_ID_TOKEN_COOKIE];
    const payload = await verifyCognitoIdToken(token);

    if (!payload?.sub) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const client = getDocumentClient();
    const { Item } = await client.send(
      new GetCommand({
        TableName: USER_TABLE,
        Key: { user_id: payload.sub },
      })
    );

    if (!Item) {
      return res.status(404).json({ message: '本登録情報が見つかりません。', registration: null });
    }

    const registration = { ...Item } as RegistrationData;
    registration.license_image_url = Item.license_image_key || Item.license_image_url ? imageRoute(payload.sub, 1) : '';
    registration.license_image_url_2 = Item.license_image_key_2 || Item.license_image_url_2 ? imageRoute(payload.sub, 2) : '';
    delete registration.license_image_key;
    delete registration.license_image_key_2;
    return res.status(200).json({ registration });
  } catch (error) {
    console.error('Failed to load registration', error);
    const message = error instanceof Error ? error.message : '本登録情報の取得に失敗しました。';
    return res.status(500).json({ message });
  }
}
