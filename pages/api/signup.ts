import type { NextApiRequest, NextApiResponse } from 'next';
import { hasLightMemberByEmail } from '../../lib/mockUserDb';
import { issueVerificationCode } from '../../lib/verificationCodeService';
import { deliverVerificationEmail } from '../../lib/verificationEmail';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { email } = req.body || {};
  const sanitizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

  if (!sanitizedEmail) {
    return res.status(400).json({ message: 'メールアドレスを入力してください。' });
  }

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail);
  if (!isEmailValid) {
    return res.status(400).json({ message: '有効なメールアドレスを入力してください。' });
  }

  if (hasLightMemberByEmail(sanitizedEmail)) {
    return res.status(409).json({ message: 'このメールアドレスは既に登録済みです。ログインしてください。' });
  }

  try {
    const { code, expiresAt } = issueVerificationCode(sanitizedEmail);

    const forwardedProto = req.headers['x-forwarded-proto'];
    const protoHeader = Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto;
    const hostHeader = Array.isArray(req.headers.host) ? req.headers.host[0] : req.headers.host;

    const fallbackBaseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://yasukari.com';
    const protocol = protoHeader ?? (hostHeader?.includes('localhost') ? 'http' : 'https');
    const baseUrl = hostHeader ? `${protocol}://${hostHeader}` : fallbackBaseUrl;
    const verificationUrl = `${baseUrl}/register/auth?email=${encodeURIComponent(sanitizedEmail)}`;

    await deliverVerificationEmail({
      email: sanitizedEmail,
      code,
      verificationUrl,
      expiresAt,
    });

    return res.status(200).json({
      message: '認証コードを送信しました。メールボックスをご確認ください。',
      expiresAt,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : '登録に失敗しました';
    return res.status(500).json({ message });
  }
}
