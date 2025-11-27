import type { NextApiRequest, NextApiResponse } from 'next';

import { COGNITO_ACCESS_TOKEN_COOKIE } from '../../../lib/cognitoServer';

const region = process.env.COGNITO_REGION ?? process.env.NEXT_PUBLIC_COGNITO_REGION ?? 'ap-northeast-1';
const cognitoEndpoint = `https://cognito-idp.${region}.amazonaws.com/`;

type CognitoAttribute = { Name: string; Value?: string };

type GetUserResponse = { Username?: string; UserAttributes?: CognitoAttribute[] };

type CognitoError = { __type?: string; message?: string };

type UpdatePayload = {
  phone_number?: string;
  name?: string;
  handle?: string;
  locale?: string;
  phone_number_verified?: boolean;
};

const normalizePhoneNumber = (value: unknown): string => {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (!trimmed.startsWith('+')) {
    return `+${trimmed.replace(/[^0-9]/g, '')}`;
  }
  return trimmed.replace(/\s+/g, '');
};

const normalizeText = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

async function callCognito<T>(target: string, accessToken: string, body: Record<string, unknown>): Promise<T> {
  const response = await fetch(cognitoEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-amz-json-1.1',
      'X-Amz-Target': target,
    },
    body: JSON.stringify({ ...body, AccessToken: accessToken }),
  });

  if (!response.ok) {
    let message = `Failed to call Cognito (${response.status})`;
    try {
      const data = (await response.json()) as CognitoError;
      if (data.message) {
        message = data.message;
      }
    } catch (error) {
      // ignore JSON parse error
    }
    throw new Error(message);
  }

  const data = (await response.json()) as T;
  return data;
}

const mapAttributes = (attributes: CognitoAttribute[] | undefined): Record<string, string> => {
  const result: Record<string, string> = {};
  (attributes ?? []).forEach((attribute) => {
    if (attribute.Name) {
      result[attribute.Name] = attribute.Value ?? '';
    }
  });
  return result;
};

const validateUpdate = (payload: UpdatePayload): { attributes: CognitoAttribute[]; message?: string } => {
  const attributes: CognitoAttribute[] = [];

  const phone = normalizePhoneNumber(payload.phone_number);
  if (phone) {
    if (!/^\+[0-9]{8,20}$/.test(phone)) {
      return { attributes, message: '電話番号の形式が正しくありません。国番号を含めて入力してください。' };
    }
    attributes.push({ Name: 'phone_number', Value: phone });
  }

  const name = normalizeText(payload.name);
  if (name) {
    attributes.push({ Name: 'name', Value: name });
  }

  const handle = normalizeText(payload.handle);
  if (handle) {
    if (handle.length < 3 || handle.length > 30) {
      return { attributes, message: 'ハンドルネームは3文字以上30文字以内で入力してください。' };
    }
    attributes.push({ Name: 'custom:handle', Value: handle });
  }

  const locale = normalizeText(payload.locale);
  if (locale) {
    if (locale.length < 2 || locale.length > 5) {
      return { attributes, message: 'ロケールは2〜5文字で入力してください。' };
    }
    attributes.push({ Name: 'custom:locale', Value: locale });
  }

  if (payload.phone_number_verified) {
    attributes.push({ Name: 'phone_number_verified', Value: 'true' });
  }

  return { attributes };
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const accessToken = req.cookies?.[COGNITO_ACCESS_TOKEN_COOKIE];
  if (!accessToken) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  if (req.method === 'GET') {
    try {
      const user = await callCognito<GetUserResponse>('AWSCognitoIdentityProviderService.GetUser', accessToken, {});
      return res.status(200).json({ username: user.Username, attributes: mapAttributes(user.UserAttributes) });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'ユーザー情報の取得に失敗しました。';
      return res.status(500).json({ message });
    }
  }

  if (req.method === 'POST') {
    const { attributes, message } = validateUpdate(req.body ?? {});
    if (message) {
      return res.status(400).json({ message });
    }
    if (attributes.length === 0) {
      return res.status(400).json({ message: '更新する属性がありません。' });
    }

    try {
      await callCognito('AWSCognitoIdentityProviderService.UpdateUserAttributes', accessToken, {
        UserAttributes: attributes,
      });
      return res.status(200).json({ message: 'ユーザー情報を更新しました。' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'ユーザー情報の更新に失敗しました。';
      return res.status(500).json({ message: errorMessage });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
