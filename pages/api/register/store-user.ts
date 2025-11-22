import type { NextApiRequest, NextApiResponse } from 'next';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { getDocumentClient } from '../../../lib/dynamodb';
import { AUTH_COOKIE_NAME, verifyAuthToken } from '../../../lib/authToken';

const TABLE_NAME = 'yasukariUserMain';

type RegisterPayload = {
  user_id: string;
  email: string;
  password: string;
  name1: string;
  name2: string;
  kana1: string;
  kana2: string;
  sex: string;
  birth: string;
  zip: string;
  address1: string;
  address2: string;
  mobile: string;
  tel?: string;
  license?: string;
  license_file_name?: string;
  work_place?: string;
  work_address?: string;
  work_tel?: string;
  other_name?: string;
  other_address?: string;
  other_tel?: string;
  enquete_purpose: string;
  enquete_want: string;
  enquete_touring: string;
  enquete_magazine: string;
  enquete_chance: string;
};

const requiredFields: (keyof RegisterPayload)[] = [
  'user_id',
  'email',
  'password',
  'name1',
  'name2',
  'kana1',
  'kana2',
  'sex',
  'birth',
  'zip',
  'address1',
  'address2',
  'mobile',
  'enquete_purpose',
  'enquete_want',
  'enquete_touring',
  'enquete_magazine',
  'enquete_chance',
];

const toTrimmedString = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

const normalizePhone = (value: unknown): string => toTrimmedString(value).replace(/\D/g, '');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const authToken = req.cookies?.[AUTH_COOKIE_NAME];
  const authPayload = verifyAuthToken(authToken);

  if (!authPayload) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const body = req.body ?? {};

  const payload: RegisterPayload = {
    user_id: authPayload.sub,
    email: toTrimmedString(body.email).toLowerCase(),
    password: toTrimmedString(body.password),
    name1: toTrimmedString(body.name1),
    name2: toTrimmedString(body.name2),
    kana1: toTrimmedString(body.kana1),
    kana2: toTrimmedString(body.kana2),
    sex: toTrimmedString(body.sex),
    birth: toTrimmedString(body.birth),
    zip: toTrimmedString(body.zip),
    address1: toTrimmedString(body.address1),
    address2: toTrimmedString(body.address2),
    mobile: normalizePhone(body.mobile),
    tel: normalizePhone(body.tel),
    license: toTrimmedString(body.license),
    license_file_name: toTrimmedString(body.license_file_name),
    work_place: toTrimmedString(body.work_place),
    work_address: toTrimmedString(body.work_address),
    work_tel: normalizePhone(body.work_tel),
    other_name: toTrimmedString(body.other_name),
    other_address: toTrimmedString(body.other_address),
    other_tel: normalizePhone(body.other_tel),
    enquete_purpose: toTrimmedString(body.enquete_purpose),
    enquete_want: toTrimmedString(body.enquete_want),
    enquete_touring: toTrimmedString(body.enquete_touring),
    enquete_magazine: toTrimmedString(body.enquete_magazine),
    enquete_chance: toTrimmedString(body.enquete_chance),
  };

  const missing = requiredFields.filter((field) => !payload[field]);

  if (missing.length > 0) {
    return res.status(400).json({ message: `${missing.join(', ')} is required.` });
  }

  try {
    const client = getDocumentClient();

    await client.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          ...payload,
          created_at: new Date().toISOString(),
        },
      })
    );

    return res.status(200).json({ message: 'ユーザー情報を保存しました。' });
  } catch (error) {
    const message = error instanceof Error ? error.message : '保存に失敗しました。';
    return res.status(500).json({ message });
  }
}
