const DEFAULT_SOURCE_EMAIL = 'no-reply@yasukari.com';

type SesModule = {
  SESClient: new (config: { region: string }) => { send(command: unknown): Promise<void> };
  SendEmailCommand: new (input: unknown) => unknown;
};

let cachedSesModule: SesModule | null | undefined;

async function getSesModule(): Promise<SesModule | null> {
  if (cachedSesModule !== undefined) {
    return cachedSesModule;
  }

  const region = process.env.AWS_REGION;
  if (!region) {
    cachedSesModule = null;
    return null;
  }

  try {
    // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
    const module = require('@aws-sdk/client-ses') as SesModule;
    cachedSesModule = module;
    return cachedSesModule;
  } catch (error) {
    console.warn('[mock:verification-email] AWS SDK for SES is not available. Falling back to mock sender.', error);
    cachedSesModule = null;
    return null;
  }
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
  const fromAddress = process.env.AWS_SES_SOURCE_EMAIL ?? DEFAULT_SOURCE_EMAIL;
  const sesModule = await getSesModule();
  const region = process.env.AWS_REGION;
  
  const subject = 'ヤスカリ会員 ご登録のお願い';
  const expirationText = new Date(expiresAt).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
  const textBody = `この度はヤスカリに仮登録頂き、誠にありがとうございます。\n※現時点で会員登録は完了しておりません。\n\n下記URLから本登録を行ってください。\nこのURLは発行から24時間有効です。有効時間内に本登録を完了してください。\n${verificationUrl}\n\n■認証コード\n${code}\n\n■メールアドレス\n${email}\n\n※このメールにお心当たりのない場合、どなたかが誤ってあなたのメールアドレスを入力した可能性があります。\nこのメールを破棄していただき、一定時間を過ぎますとあなたのメールアドレス情報は削除されますのでご安心ください。\n\n※このメールは送信専用です。ご返信いただきましても対応いたしかねます。\n\n有効期限: ${expirationText}\n`; // eslint-disable-line max-len

  const htmlBody = `<!DOCTYPE html><html lang="ja"><body><p>この度はヤスカリに仮登録頂き、誠にありがとうございます。<br />※現時点で会員登録は完了しておりません。</p><p>下記URLから本登録を行ってください。<br />このURLは発行から24時間有効です。有効時間内に本登録を完了してください。</p><p><a href="${verificationUrl}" style="color:#d63c2b;">${verificationUrl}</a></p><p><strong>■認証コード</strong><br /><span style="font-size:20px; letter-spacing:4px;">${code}</span></p><p><strong>■メールアドレス</strong><br />${email}</p><p>※このメールにお心当たりのない場合、どなたかが誤ってあなたのメールアドレスを入力した可能性があります。<br />このメールを破棄していただき、一定時間を過ぎますとあなたのメールアドレス情報は削除されますのでご安心ください。</p><p>※このメールは送信専用です。ご返信いただきましても対応いたしかねます。</p><p>有効期限: ${expirationText}</p></body></html>`;

  if (!sesModule || !region) {
    console.info('[mock:verification-email] send', {
      to: email,
      from: fromAddress,
      subject,
      verificationUrl,
      code,
      expiresAt,
    });
    return { simulated: true };
  }

  const { SESClient, SendEmailCommand } = sesModule;
  const sesClient = new SESClient({ region });
  const command = new SendEmailCommand({
    Source: fromAddress,
    Destination: { ToAddresses: [email] },
    Message: {
      Subject: { Data: subject, Charset: 'UTF-8' },
      Body: {
        Text: { Data: textBody, Charset: 'UTF-8' },
        Html: { Data: htmlBody, Charset: 'UTF-8' },
      },
    },
  });

  await sesClient.send(command);
  return { simulated: false };
}
