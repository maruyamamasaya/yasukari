import type { NextApiRequest, NextApiResponse } from 'next';

import { cognitoClientId } from '../../../lib/cognitoHostedUi';

const region =
  process.env.COGNITO_REGION ?? process.env.NEXT_PUBLIC_COGNITO_REGION ?? 'ap-northeast-1';
const cognitoEndpoint = `https://cognito-idp.${region}.amazonaws.com/`;

type CognitoError = {
  __type?: string;
};

const ERROR_MESSAGES: Record<string, string> = {
  CodeDeliveryFailureException:
    '確認メールを送信できませんでした。時間をおいて再度お試しください。',
  InvalidParameterException:
    '確認コードを再送できませんでした。すでに確認済みの場合はサインインしてください。',
  LimitExceededException:
    '送信回数の上限に達しました。時間をおいて再度お試しください。',
  TooManyRequestsException:
    '短時間に多くのリクエストが送信されました。時間をおいて再度お試しください。',
  UserNotFoundException:
    '入力されたメールアドレスの登録状況を確認できませんでした。入力内容をご確認ください。',
};

const getErrorName = (error: CognitoError): string =>
  (error.__type ?? '').split('#').pop() ?? '';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'この操作は利用できません。' });
  }

  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  if (!email) {
    return res.status(400).json({ message: 'メールアドレスを入力してください。' });
  }

  try {
    const response = await fetch(cognitoEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-amz-json-1.1',
        'X-Amz-Target': 'AWSCognitoIdentityProviderService.ResendConfirmationCode',
      },
      body: JSON.stringify({ ClientId: cognitoClientId, Username: email }),
    });

    if (!response.ok) {
      const error = (await response.json().catch(() => ({}))) as CognitoError;
      const message =
        ERROR_MESSAGES[getErrorName(error)] ??
        '確認コードを再送できませんでした。時間をおいて再度お試しください。';
      return res.status(response.status >= 500 ? 502 : 400).json({ message });
    }

    return res
      .status(200)
      .json({ message: '確認コードを再送しました。メールをご確認ください。' });
  } catch {
    return res.status(502).json({
      message: '通信エラーが発生しました。時間をおいて再度お試しください。',
    });
  }
}
