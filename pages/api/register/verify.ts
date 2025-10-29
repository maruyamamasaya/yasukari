import type { NextApiRequest, NextApiResponse } from 'next';
import { createLightMember, hasLightMemberByEmail } from '../../../lib/mockUserDb';
import { verifyVerificationCode } from '../../../lib/verificationCodeService';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { email, code } = req.body || {};
  const sanitizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  const sanitizedCode = typeof code === 'string' ? code.trim() : '';

  if (!sanitizedEmail || !sanitizedCode) {
    return res.status(400).json({ message: 'メールアドレスと認証コードを入力してください。' });
  }

  if (hasLightMemberByEmail(sanitizedEmail)) {
    return res.status(200).json({ message: 'すでに本登録が完了しています。ログイン画面からアクセスしてください。' });
  }

  const result = verifyVerificationCode(sanitizedEmail, sanitizedCode);

  if (result.success) {
    const member = createLightMember({ email: sanitizedEmail });
    res.setHeader('Set-Cookie', `auth=${member.id}; Path=/; HttpOnly; Max-Age=${60 * 60 * 24}; SameSite=Lax`);

    return res.status(200).json({
      message: '本登録が完了しました。マイページからご利用を開始できます。',
      member: {
        id: member.id,
        email: member.email,
        plan: member.plan,
        createdAt: member.createdAt,
      },
    });
  }

  switch (result.reason) {
    case 'expired':
      return res
        .status(400)
        .json({ message: '認証コードの有効期限が切れています。お手数ですが、もう一度メールアドレスを入力してください。' });
    case 'too_many_attempts':
      return res.status(400).json({ message: '認証コードの入力上限に達しました。最初からやり直してください。' });
    case 'mismatch': {
      const attemptsRemaining = result.attemptsRemaining;
      const message = attemptsRemaining
        ? `認証コードが正しくありません。入力内容をご確認ください。（あと${attemptsRemaining}回再試行できます）`
        : '認証コードが正しくありません。入力内容をご確認ください。';
      return res.status(400).json({ message });
    }
    default:
      return res.status(404).json({ message: '認証コードが見つかりませんでした。もう一度メールアドレスを入力してください。' });
  }
}
