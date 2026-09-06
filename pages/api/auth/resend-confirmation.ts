import crypto from 'crypto';
import type { NextApiRequest, NextApiResponse } from 'next';

const region =
  process.env.COGNITO_REGION ?? process.env.NEXT_PUBLIC_COGNITO_REGION ?? 'ap-northeast-1';
const cognitoEndpoint = `https://cognito-idp.${region}.amazonaws.com/`;
const defaultCognitoClientId = 'vicsspgv2q7mtn6m6os2n893j';

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
  NotAuthorizedException:
    '確認コードを再送できませんでした。入力内容をご確認ください。',
  ResourceNotFoundException:
    '確認コードを再送できませんでした。時間をおいて再度お試しください。',
  ForbiddenException:
    '確認コードを再送できませんでした。時間をおいて再度お試しください。',
  InvalidLambdaResponseException:
    '確認メールを送信できませんでした。時間をおいて再度お試しください。',
  UnexpectedLambdaException:
    '確認メールを送信できませんでした。時間をおいて再度お試しください。',
  UserLambdaValidationException:
    '確認メールを送信できませんでした。入力内容をご確認ください。',
  InternalErrorException:
    '確認コードを再送できませんでした。時間をおいて再度お試しください。',
};

const getErrorName = (error: CognitoError): string =>
  (error.__type ?? '').split('#').pop() ?? '';

const maskEmail = (email: string): string => {
  const atIndex = email.indexOf('@');
  return atIndex > 0 ? `${email[0]}***${email.slice(atIndex)}` : `${email[0] ?? ''}***`;
};

export const createSecretHash = (
  username: string,
  clientId: string,
  clientSecret: string,
): string =>
  crypto
    .createHmac('sha256', clientSecret)
    .update(`${username}${clientId}`)
    .digest('base64');

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
    const clientId =
      process.env.COGNITO_CLIENT_ID ??
      process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID ??
      defaultCognitoClientId;
    const clientSecret = process.env.COGNITO_CLIENT_SECRET;
    const body: { ClientId: string; Username: string; SecretHash?: string } = {
      ClientId: clientId,
      Username: email,
    };
    if (clientSecret) {
      body.SecretHash = createSecretHash(email, clientId, clientSecret);
    }

    const response = await fetch(cognitoEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-amz-json-1.1',
        'X-Amz-Target': 'AWSCognitoIdentityProviderService.ResendConfirmationCode',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = (await response.json().catch(() => ({}))) as CognitoError;
      const errorType = getErrorName(error);
      const requestId = response.headers?.get('x-amzn-requestid') ?? 'unavailable';
      console.error(
        `ResendConfirmationCode failed: status=${response.status} errorType=${
          errorType || 'UnknownError'
        } requestId=${requestId} email=${maskEmail(email)}`,
      );
      const message = ERROR_MESSAGES[errorType] ??
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
