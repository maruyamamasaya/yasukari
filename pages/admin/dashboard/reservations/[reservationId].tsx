import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo } from "react";

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

export default function ReservationDetailPage() {
  const router = useRouter();
  const { reservationId } = router.query;

  const reservation = useMemo(
    () => reservations.find((item) => item.id === reservationId),
    [reservationId]
  );

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

  return (
    <>
      <Head>
        <title>予約詳細 | 管理ダッシュボード</title>
      </Head>
      <DashboardLayout title="予約詳細" description="予約内容の確認・更新ができます。">
        <section className={styles.section}>
          <div className={styles.sectionHeaderRow}>
            <div>
              <p className={styles.breadcrumb}>
                <Link href="/admin/dashboard/reservations">予約一覧</Link>
                <span aria-hidden> / </span>
                <span>{(reservationId as string) ?? "詳細"}</span>
              </p>
              <h2 className={styles.sectionTitle}>予約詳細</h2>
              <p className={styles.sectionDescription}>
                予約内容、車両情報、会員情報を確認できます。
              </p>
            </div>
            <div className={styles.sectionActions}>
              <button className={styles.iconButton} onClick={() => router.back()} type="button">
                一覧に戻る
              </button>
              <button className={`${styles.iconButton} ${styles.iconButtonAccent}`} type="button">
                貸渡契約書
              </button>
            </div>
          </div>

          {!reservation ? (
            <div className={styles.placeholderCard}>
              <p>指定された予約が見つかりませんでした。</p>
              <Link className={styles.link} href="/admin/dashboard/reservations">
                予約一覧に戻る
              </Link>
            </div>
          ) : (
            <div className={styles.detailStack}>
              <div className={styles.detailPanel}>
                <div className={styles.detailHeader}>
                  <div>
                    <p className={styles.tagline}>予約番号: {reservation.id}</p>
                    <h3 className={styles.detailTitle}>{reservation.vehicleModel}</h3>
                    <p className={styles.sectionDescription}>{reservation.notes}</p>
                  </div>
                  <span className={statusClassName(reservation.status)}>{reservation.status}</span>
                </div>

                <dl className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <dt>店舗</dt>
                    <dd>{reservation.storeName}</dd>
                  </div>
                  <div className={styles.detailItem}>
                    <dt>貸出日時</dt>
                    <dd>{formatDatetime(reservation.pickupAt)}</dd>
                  </div>
                  <div className={styles.detailItem}>
                    <dt>返却日時</dt>
                    <dd>{formatDatetime(reservation.returnAt)}</dd>
                  </div>
                  <div className={styles.detailItem}>
                    <dt>決済金額</dt>
                    <dd>{reservation.paymentAmount}</dd>
                  </div>
                  <div className={styles.detailItem}>
                    <dt>決済番号 (pay.jp)</dt>
                    <dd className={styles.monospace}>{reservation.paymentId}</dd>
                  </div>
                  <div className={styles.detailItem}>
                    <dt>決済日時</dt>
                    <dd>{reservation.paymentDate}</dd>
                  </div>
                  <div className={styles.detailItem}>
                    <dt>予約状態</dt>
                    <dd>
                      <span className={statusClassName(reservation.status)}>{reservation.status}</span>
                    </dd>
                  </div>
                </dl>
              </div>

              <div className={styles.detailPanel}>
                <div className={styles.detailHeader}>
                  <h3 className={styles.detailTitle}>車両情報</h3>
                </div>
                <dl className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <dt>管理番号</dt>
                    <dd className={styles.monospace}>{reservation.vehicleCode}</dd>
                  </div>
                  <div className={styles.detailItem}>
                    <dt>ナンバープレート</dt>
                    <dd>
                      <div>{reservation.vehiclePlate}</div>
                      <button className={styles.detailEditButton} type="button">
                        車両を変更
                      </button>
                    </dd>
                  </div>
                  <div className={styles.detailItem}>
                    <dt>オプション</dt>
                    <dd>
                      <div>車両補償: {reservation.options.vehicleCoverage}</div>
                      <div>盗難補償: {reservation.options.theftCoverage}</div>
                    </dd>
                  </div>
                </dl>
              </div>

              <div className={styles.detailPanel}>
                <div className={styles.detailHeader}>
                  <h3 className={styles.detailTitle}>会員情報</h3>
                </div>
                <dl className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <dt>会員番号</dt>
                    <dd className={styles.monospace}>{reservation.memberId}</dd>
                  </div>
                  <div className={styles.detailItem}>
                    <dt>会員名</dt>
                    <dd>{reservation.memberName}</dd>
                  </div>
                  <div className={styles.detailItem}>
                    <dt>メールアドレス</dt>
                    <dd>{reservation.memberEmail}</dd>
                  </div>
                  <div className={styles.detailItem}>
                    <dt>電話番号</dt>
                    <dd>{reservation.memberPhone || "-"}</dd>
                  </div>
                </dl>
              </div>

              <div className={styles.detailPanel}>
                <div className={styles.detailHeader}>
                  <h3 className={styles.detailTitle}>クーポン情報</h3>
                </div>
                <dl className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <dt>クーポン・コード</dt>
                    <dd>{reservation.couponCode || "(なし)"}</dd>
                  </div>
                  <div className={styles.detailItem}>
                    <dt>割引額</dt>
                    <dd>{reservation.couponDiscount}</dd>
                  </div>
                </dl>
              </div>
            </div>
          )}
        </section>
      </DashboardLayout>
    </>
  );
}
