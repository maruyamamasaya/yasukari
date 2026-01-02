import nodemailer, { Transporter, SentMessageInfo } from 'nodemailer';

import { addMailHistory } from './mailHistory';

const MAX_RETRY_ATTEMPTS = 3;
const MAIL_FROM = process.env.MAIL_FROM ?? 'ヤスカリ <info@yasukaribike.com>';

export type MailPayload = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
  category?: string;
};

type QueueItem = MailPayload & {
  attempts: number;
  resolve: (value: SentMessageInfo) => void;
  reject: (reason?: unknown) => void;
};

let transporterPromise: Promise<Transporter> | null = null;
const queue: QueueItem[] = [];
let processing = false;

function buildTransporter(): Transporter {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error('SMTP_HOST, SMTP_USER, and SMTP_PASS must be configured to send emails.');
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

async function getTransporter(): Promise<Transporter> {
  if (!transporterPromise) {
    transporterPromise = Promise.resolve(buildTransporter());
  }

  return transporterPromise;
}

async function sendMailOnce(payload: MailPayload): Promise<SentMessageInfo> {
  const transporter = await getTransporter();
  const replyToAddress = payload.replyTo?.trim() || MAIL_FROM;

  return transporter.sendMail({
    from: MAIL_FROM,
    to: payload.to,
    subject: payload.subject,
    text: payload.text,
    html: payload.html,
    replyTo: replyToAddress,
  });
}

async function processQueue(): Promise<void> {
  if (processing) return;
  processing = true;

  while (queue.length > 0) {
    const item = queue.shift();
    if (!item) break;

    try {
      const info = await sendMailOnce(item);
      addMailHistory({
        to: item.to,
        subject: item.subject,
        status: 'sent',
        category: item.category ?? 'その他',
      });
      item.resolve(info);
    } catch (error) {
      const nextAttempts = item.attempts + 1;
      if (nextAttempts < MAX_RETRY_ATTEMPTS) {
        queue.push({ ...item, attempts: nextAttempts });
      } else {
        addMailHistory({
          to: item.to,
          subject: item.subject,
          status: 'failed',
          category: item.category ?? 'その他',
          errorMessage:
            error instanceof Error ? error.message : 'メール送信中にエラーが発生しました。',
        });
        item.reject(error);
      }
    }
  }

  processing = false;
}

export async function enqueueEmail(payload: MailPayload): Promise<SentMessageInfo> {
  return new Promise<SentMessageInfo>((resolve, reject) => {
    queue.push({ ...payload, attempts: 0, resolve, reject });
    void processQueue();
  });
}
