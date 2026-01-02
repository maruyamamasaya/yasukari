import { enqueueEmail } from './mailQueue';

const DEFAULT_SOURCE_EMAIL = 'ヤスカリ <info@yasukaribike.com>';

function formatExpiration(expiresAt: number): string {
  return new Date(expiresAt).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
}

type VerificationEmailParams = {
  email: string;
  code: string;
  verificationUrl: string;
  expiresAt: number;
};

export async function deliverVerificationEmail({
  email,
  code,
  verificationUrl,
  expiresAt,
}: VerificationEmailParams): Promise<{ simulated: boolean }> {
  const fromAddress = process.env.MAIL_FROM ?? DEFAULT_SOURCE_EMAIL;
  const subject = '【ヤスカリ】仮登録ありがとうございます（認証コードのご案内）';
  const expirationText = formatExpiration(expiresAt);

  const textBody = [
    'ヤスカリへの仮登録をお申し込みいただき、誠にありがとうございます。',
    '以下のリンクから本登録にお進みください。',
    '有効期限内にお手続きが完了しない場合、恐れ入りますが再度お申し込みをお願いいたします。',
    verificationUrl,
    '',
    '認証コード',
    code,
    '',
    'ご登録メールアドレス',
    email,
    '',
    `有効期限: ${expirationText}（日本時間）`,
    '',
    '※このメールは自動送信です。ご返信いただいてもお返事ができませんのでご了承ください。',
    '※お心当たりのない場合はこのメールを破棄していただければ、一定時間経過後に情報は無効化されます。',
  ].join('\n');

  const htmlBody = `<!DOCTYPE html><html lang="ja"><body style="font-family:Arial, sans-serif; color:#111;">` +
    `<p>ヤスカリへの仮登録をお申し込みいただき、誠にありがとうございます。<br />以下のリンクから本登録にお進みください。` +
    `有効期限内にお手続きが完了しない場合、恐れ入りますが再度お申し込みをお願いいたします。</p>` +
    `<p><a href="${verificationUrl}" style="color:#d63c2b; word-break:break-all;">${verificationUrl}</a></p>` +
    `<p><strong>認証コード</strong><br /><span style="font-size:20px; letter-spacing:4px;">${code}</span></p>` +
    `<p><strong>ご登録メールアドレス</strong><br />${email}</p>` +
    `<p>有効期限: ${expirationText}（日本時間）</p>` +
    `<p style="margin-top:16px;">※このメールは自動送信です。ご返信いただいてもお返事ができませんのでご了承ください。</p>` +
    `<p>※お心当たりのない場合はこのメールを破棄していただければ、一定時間経過後に情報は無効化されます。</p>` +
    `</body></html>`;

  await enqueueEmail({
    to: email,
    subject,
    text: textBody,
    html: htmlBody,
    replyTo: fromAddress,
  });

  return { simulated: false };
}
