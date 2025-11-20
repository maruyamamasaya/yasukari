import type { NextApiRequest, NextApiResponse } from 'next';
import { clearPendingRegistration, getPendingRegistration } from '../../../lib/pendingRegistrations';
import { createLightMember, hasLightMemberByEmail } from '../../../lib/mockUserDb';
import type { LightMember } from '../../../lib/mockUserDb';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { email } = req.body || {};
  const sanitizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

  if (!sanitizedEmail) {
    return res.status(400).json({ message: 'メールアドレスを入力してください。' });
  }

  if (hasLightMemberByEmail(sanitizedEmail)) {
    return res.status(200).json({ message: 'すでに登録済みのメールアドレスです。ログインしてください。' });
  }

  const pendingRegistration = getPendingRegistration(sanitizedEmail);

  if (!pendingRegistration) {
    return res.status(404).json({ message: '仮登録情報が見つかりませんでした。最初からやり直してください。' });
  }

  let member: LightMember;

  try {
    member = createLightMember({
      email: pendingRegistration.email,
      username: pendingRegistration.fullName,
      password: pendingRegistration.password,
      phoneNumber: pendingRegistration.phoneNumber,
      registrationStatus: 'provisional',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : '登録処理に失敗しました。';
    return res.status(400).json({ message });
  } finally {
    clearPendingRegistration(sanitizedEmail);
  }

  res.setHeader('Set-Cookie', `auth=${member.id}; Path=/; HttpOnly; Max-Age=${60 * 60 * 24}; SameSite=Lax`);

  return res.status(200).json({
    message: '臨時登録が完了しました。マイページから続きの手続きを行ってください。',
    member: {
      id: member.id,
      email: member.email,
      username: member.username,
      plan: member.plan,
      createdAt: member.createdAt,
      phoneNumber: member.phoneNumber,
      registrationStatus: member.registrationStatus,
    },
  });
}
