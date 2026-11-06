import type { NextApiRequest, NextApiResponse } from 'next';
import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { getDocumentClient } from '../../../lib/dynamodb';
import { COGNITO_ID_TOKEN_COOKIE, verifyCognitoIdToken } from '../../../lib/cognitoServer';
import { RegistrationData, REQUIRED_REGISTRATION_FIELDS } from '../../../types/registration';
import { deliverFullRegistrationEmail } from '../../../lib/registrationEmails';

import { noStore, licenseKey, ownerPrefix, imageRoute } from '../../../lib/privateLicense';

const USER_TABLE = process.env.USER_TABLE ?? 'yasukariUserMain';

// ...（型定義やユーティリティは従来通り）
const toTrimmedString = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

const normalizePhone = (value: unknown): string => toTrimmedString(value).replace(/\D/g, '');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  noStore(res);
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const authToken = req.cookies?.[COGNITO_ID_TOKEN_COOKIE];
    const authPayload = await verifyCognitoIdToken(authToken);
    if (!authPayload?.sub) return res.status(401).json({ message: 'ログインが必要です。' });
    const body = req.body ?? {};
    const client = getDocumentClient();
    const existing = await client.send(new GetCommand({ TableName: USER_TABLE, Key: { user_id: authPayload.sub } }));
    const existingItem = existing.Item ?? {};
    const keys: Record<string, string> = {};
    for (const slot of [1, 2]) {
      const suffix = slot === 1 ? '' : '_2';
      const supplied = body[`license_image_key${suffix}`] || body[`license_image_url${suffix}`];
      const previous = licenseKey(existingItem[`license_image_key${suffix}`] || existingItem[`license_image_url${suffix}`]);
      const key = supplied === imageRoute(authPayload.sub, slot) ? previous : licenseKey(supplied);
      if (supplied && (!key || (!key.startsWith(ownerPrefix(authPayload.sub)) && key !== previous))) {
        return res.status(400).json({ message: '画像の所有者が一致しません。' });
      }
      keys[`license_image_key${suffix}`] = key ?? '';
    }

    const userIdFromBody = toTrimmedString(body.user_id);
    const userId = authPayload?.sub ?? userIdFromBody;

    if (authPayload && userIdFromBody && authPayload.sub !== userIdFromBody) {
      return res.status(400).json({ message: 'ユーザーIDが一致しません。' });
    }

    if (!userId) {
      return res.status(400).json({ message: 'ユーザーIDが取得できませんでした。' });
    }

    const payload: RegistrationData = {
      user_id: userId,
      email: toTrimmedString(body.email || authPayload?.email).toLowerCase(),
      name1: toTrimmedString(body.name1),
      name2: toTrimmedString(body.name2),
      kana1: toTrimmedString(body.kana1),
      kana2: toTrimmedString(body.kana2),
      sex: toTrimmedString(body.sex),
      birth: toTrimmedString(body.birth),
      zip: toTrimmedString(body.zip),
      address1: toTrimmedString(body.address1),
      address2: toTrimmedString(body.address2),
      mobile: normalizePhone(body.mobile) || undefined,
      tel: normalizePhone(body.tel) || undefined,
      license: toTrimmedString(body.license),
      license_file_name: toTrimmedString(body.license_file_name),
      license_image_key: keys.license_image_key,
      license_uploaded_at: toTrimmedString(body.license_uploaded_at),
      license_file_name_2: toTrimmedString(body.license_file_name_2),
      license_image_key_2: keys.license_image_key_2,
      license_uploaded_at_2: toTrimmedString(body.license_uploaded_at_2),
      work_place: toTrimmedString(body.work_place),
      work_address: toTrimmedString(body.work_address),
      work_tel: normalizePhone(body.work_tel) || undefined,
      other_name: toTrimmedString(body.other_name),
      other_address: toTrimmedString(body.other_address),
      other_tel: normalizePhone(body.other_tel) || undefined,
      enquete_purpose: toTrimmedString(body.enquete_purpose),
      enquete_want: toTrimmedString(body.enquete_want),
      enquete_touring: toTrimmedString(body.enquete_touring),
      enquete_magazine: toTrimmedString(body.enquete_magazine),
      enquete_chance: toTrimmedString(body.enquete_chance),
    };

    const missing = REQUIRED_REGISTRATION_FIELDS.filter((field) => !(field === 'license_image_url' ? payload.license_image_key : payload[field]));

    if (missing.length > 0) {
      return res.status(400).json({ message: `${missing.join(', ')} is required.` });
    }

    delete existingItem.license_image_url;
    delete existingItem.license_image_url_2;

    await client.send(
      new PutCommand({
        TableName: USER_TABLE,
        Item: {
          ...existingItem,
          ...payload,
          created_at: existingItem.created_at ?? new Date().toISOString(),
          rental_terms_agreed_at: existingItem.rental_terms_agreed_at,
        },
      })
    );

    await deliverFullRegistrationEmail(payload.email, authPayload?.['custom:locale']);

    return res.status(200).json({ message: 'ユーザー情報を保存しした。' });
  } catch (error) {
    const message = error instanceof Error ? error.message : '保存に失敗しました。';
    return res.status(500).json({ message });
  }
}
