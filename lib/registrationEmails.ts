import { enqueueEmail } from './mailQueue';

const DEFAULT_SOURCE_EMAIL = '格安レンタルバイクならヤスカリ <info@yasukaribike.com>';

function buildBaseEmail(subject: string, bodyLines: string[]) {
  const text = bodyLines.join('\n');
  const html =
    `<!DOCTYPE html><html lang="ja"><body style="font-family:Arial, sans-serif; color:#111;">` +
    bodyLines.map((line) => `<p>${line.replace(/\n/g, '<br />')}</p>`).join('') +
    `</body></html>`;

  return { subject, text, html };
}

export async function deliverProvisionalRegistrationEmail(email: string) {
  const fromAddress = process.env.MAIL_FROM ?? DEFAULT_SOURCE_EMAIL;
  const { subject, text, html } = buildBaseEmail('【ヤスカリ】仮登録が完了しました', [
    'ヤスカリへの仮登録が完了しました。',
    'マイページにログインし、必要情報を入力して本登録を完了してください。',
    '※このメールは自動送信です。ご返信いただいてもお返事ができませんのでご了承ください。',
  ]);

  await enqueueEmail({
    to: email,
    subject,
    text,
    html,
    replyTo: fromAddress,
    category: '仮登録',
    userIdForNotification: email,
    notificationBody: text,
    mirrorToSite: true,
  });

  return { simulated: false } as const;
}

export async function deliverFullRegistrationEmail(email: string) {
  const fromAddress = process.env.MAIL_FROM ?? DEFAULT_SOURCE_EMAIL;
  const { subject, text, html } = buildBaseEmail('【ヤスカリ】本登録が完了しました', [
    'ヤスカリの本登録が完了しました。',
    '入力いただいた内容を保存し、ご利用の準備が整いました。',
    '今後ともよろしくお願いいたします。',
    '※このメールは自動送信です。ご返信いただいてもお返事ができませんのでご了承ください。',
  ]);

  await enqueueEmail({
    to: email,
    subject,
    text,
    html,
    replyTo: fromAddress,
    category: '本登録',
    userIdForNotification: email,
    notificationBody: text,
    mirrorToSite: true,
  });

  return { simulated: false } as const;
}
