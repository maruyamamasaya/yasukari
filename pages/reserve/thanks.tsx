import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

import ThanksCard from '../../components/ThanksCard';
import { PURCHASE_COMPLETE_KEY, trackPurchaseOnce } from '../../lib/conversionTracking';
import type { Reservation } from '../../lib/reservations';

const formatPeriod = (reservation: Reservation) => {
  const format = (value: string) => new Date(value).toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  return `${format(reservation.pickupAt)} 〜 ${format(reservation.returnAt)}`;
};

export default function ReserveThanksPage() {
  const router = useRouter();
  const [reservation, setReservation] = useState<Reservation | null>(null);

  useEffect(() => {
    if (!router.isReady || typeof router.query.reservationId !== 'string') return;
    const reservationId = router.query.reservationId;
    const controller = new AbortController();

    void fetch(`/api/reservations/${encodeURIComponent(reservationId)}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('予約情報を取得できませんでした。');
        return response.json() as Promise<{ reservation: Reservation }>;
      })
      .then(({ reservation: completedReservation }) => {
        setReservation(completedReservation);
        const pendingId = sessionStorage.getItem(PURCHASE_COMPLETE_KEY);
        if (pendingId === completedReservation.id) {
          sessionStorage.removeItem(PURCHASE_COMPLETE_KEY);
          trackPurchaseOnce(completedReservation.id, Number(completedReservation.paymentAmount.replace(/,/g, '')));
        }
      })
      .catch((error) => {
        if (!controller.signal.aborted) console.error(error);
      });

    return () => controller.abort();
  }, [router.isReady, router.query.reservationId]);

  const details = useMemo(() => reservation ? [
    { label: '予約番号', value: reservation.id },
    { label: '受取店舗', value: reservation.storeName },
    { label: '期間', value: formatPeriod(reservation) },
  ] : undefined, [reservation]);

  return (
    <>
      <Head><title>ご予約が完了しました｜ヤスカリ</title></Head>
      <ThanksCard
        title="ご予約が完了しました！"
        lead={<>ありがとうございます。<br />予約内容の詳細はマイページからご確認いただけます。</>}
        actionLabel="トップへ戻る"
        actionHref="/"
        details={details}
      />
    </>
  );
}
