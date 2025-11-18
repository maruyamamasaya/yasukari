import { KeyboardEvent } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

import DashboardLayout from "../../../../components/dashboard/DashboardLayout";
import { Reservation, reservations } from "../../../../lib/reservations";
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

  const formatDatetime = (value: string) =>
    new Date(value).toLocaleString("ja-JP", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

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
                    onClick={() => void router.push(`/admin/dashboard/reservations/${reservation.id}`)}
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
        </section>
      </DashboardLayout>
    </>
  );
}
