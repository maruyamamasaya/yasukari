import type { Reservation } from './reservations';
import { enqueueEmail } from './mailQueue';
import { addMailHistory } from './mailHistory';

// Link to the saved reservation instead of embedding another QR that can become stale.
export async function sendKeyboxUpdateEmail(reservation: Reservation): Promise<boolean> {
  const subject = '【ヤスカリ】解錠用QRコードを更新しました';
  if (!reservation.memberEmail) {
    await addMailHistory({
      category: 'その他', to: '(メール未入力)', subject, status: 'skipped',
      errorMessage: '会員のメールアドレスが未設定のためQR更新通知を送信できませんでした。',
    });
    return false;
  }
  const myPageUrl = `${(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://yasukari.com').replace(/\/$/, '')}/mypage`;
  const formatTime = (value: string | undefined) => value
    ? new Date(value).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo', hour12: false })
    : 'マイページでご確認ください';
  const text = [
    'ご予約の解錠用QRコードを更新しました。',
    `予約ID: ${reservation.id}`,
    `有効開始（日本時間）: ${formatTime(reservation.keyboxWindowStart)}`,
    `有効終了（日本時間）: ${formatTime(reservation.keyboxWindowEnd)}`,
    '',
    '以前のメールや保存した画像ではなく、マイページを再読み込みして最新のQRコードをご利用ください。',
    'マイページはこちら', myPageUrl,
    '', 'QRコードが表示されない場合は、お問い合わせください。',
  ].join('\n');
  await enqueueEmail({
    to: reservation.memberEmail, subject, text, category: 'その他',
    userIdForNotification: reservation.memberId || reservation.memberEmail,
    notificationBody: text, mirrorToSite: true,
  });
  return true;
}
