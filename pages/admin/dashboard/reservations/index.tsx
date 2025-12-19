import { KeyboardEvent, useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

import DashboardLayout from "../../../../components/dashboard/DashboardLayout";
import { Reservation } from "../../../../lib/reservations";
import styles from "../../../../styles/Dashboard.module.css";
import tableStyles from "../../../../styles/AdminTable.module.css";

const statusClassName = (status: Reservation["status"]): string => {
  if (status === "予約受付完了") {
    return `${tableStyles.badge} ${tableStyles.badgeOn}`;
  }

  if (status === "入金待ち") {
    return `${tableStyles.badge} ${tableStyles.badgeNeutral}`;
  }

  if (status === "キャンセル") {
    return `${tableStyles.badge} ${tableStyles.badgeOff}`;
  }

  return tableStyles.badge;
};

export default function ReservationListPage() {
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchReservations = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/reservations", { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Failed to fetch reservations: ${response.status}`);
        }

        const data = (await response.json()) as { reservations?: Reservation[] };
        setReservations(data.reservations ?? []);
      } catch (fetchError) {
        if (!controller.signal.aborted) {
          const message =
            fetchError instanceof Error ? fetchError.message : "不明なエラーが発生しました";
          setError(message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void fetchReservations();
    return () => controller.abort();
  }, []);

  const formatDatetime = (value: string) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "-";

    return parsed.toLocaleString("ja-JP", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleRowKeyDown = (
    event: KeyboardEvent<HTMLTableRowElement>,
    reservationId: string
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      void router.push(`/admin/dashboard/reservations/${reservationId}`);
    }
  };

  return (
    <>
      <Head>
        <title>予約一覧 | 管理ダッシュボード</title>
      </Head>
      <DashboardLayout
        title="予約管理"
        description="予約内容と車両の紐付けを確認・更新できます。"
      >
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>予約一覧</h2>
            <p className={styles.sectionDescription}>
              店舗別の予約状況と車両割当を確認できます。行をクリックすると詳細が開きます。
            </p>
          </div>

          {isLoading ? (
            <div className={styles.placeholderCard}>
              <p>予約データを読み込み中です…</p>
            </div>
          ) : error ? (
            <div className={styles.placeholderCard}>
              <p>予約データの取得に失敗しました。</p>
              <p className={styles.sectionDescription}>{error}</p>
            </div>
          ) : reservations.length === 0 ? (
            <div className={styles.placeholderCard}>
              <p>まだ予約データが登録されていません。</p>
              <p className={styles.sectionDescription}>
                DynamoDB の yoyakuKanri テーブルに登録された最新のデータがここに表示されます。
              </p>
            </div>
          ) : (
            <div className={`${tableStyles.wrapper} ${tableStyles.tableWrapper}`}>
              <table className={`${tableStyles.table} ${tableStyles.dataTable}`}>
                <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">店舗</th>
                    <th scope="col">予約状態</th>
                    <th scope="col">車種</th>
                    <th scope="col">車両管理番号</th>
                    <th scope="col">貸出日時</th>
                    <th scope="col">返却日時</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map((reservation) => (
                    <tr
                      key={reservation.id}
                      className={tableStyles.clickableRow}
                      onClick={() =>
                        void router.push(`/admin/dashboard/reservations/${reservation.id}`)
                      }
                      onKeyDown={(event) => handleRowKeyDown(event, reservation.id)}
                      tabIndex={0}
                      aria-label={`${reservation.id} の詳細を開く`}
                    >
                      <td className={tableStyles.monospace}>{reservation.id}</td>
                      <td>{reservation.storeName}</td>
                      <td>
                        <span className={statusClassName(reservation.status)}>{reservation.status}</span>
                      </td>
                      <td>{reservation.vehicleModel}</td>
                      <td className={tableStyles.monospace}>{reservation.vehicleCode}</td>
                      <td>{formatDatetime(reservation.pickupAt)}</td>
                      <td>{formatDatetime(reservation.returnAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </DashboardLayout>
    </>
  );
}
