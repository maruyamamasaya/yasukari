import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../../../components/dashboard/DashboardLayout";
import type { Reservation } from "../../../../lib/reservations";
import styles from "../../../../styles/Dashboard.module.css";

type ReservationCounts = {
  current: number;
  completed: number;
  isLoading: boolean;
  error: boolean;
};

const formatCount = (value: number) => value.toLocaleString();

export default function ReservationAnalyticsPage() {
  const [reservationCounts, setReservationCounts] = useState<ReservationCounts>({
    current: 0,
    completed: 0,
    isLoading: true,
    error: false,
  });

  useEffect(() => {
    let isMounted = true;

    const loadReservations = async () => {
      try {
        setReservationCounts((prev) => ({ ...prev, isLoading: true, error: false }));
        const response = await fetch("/api/reservations");
        if (!response.ok) {
          throw new Error("Failed to fetch reservations");
        }
        const data = (await response.json()) as { reservations?: Reservation[] };
        const reservations = data.reservations ?? [];
        if (isMounted) {
          setReservationCounts({
            current: reservations.filter((reservation) => !reservation.reservationCompletedFlag)
              .length,
            completed: reservations.filter((reservation) => reservation.reservationCompletedFlag)
              .length,
            isLoading: false,
            error: false,
          });
        }
      } catch (error) {
        console.error("Failed to load reservation analytics", error);
        if (isMounted) {
          setReservationCounts({
            current: 0,
            completed: 0,
            isLoading: false,
            error: true,
          });
        }
      }
    };

    loadReservations();
    return () => {
      isMounted = false;
    };
  }, []);

  const displayValues = useMemo(() => {
    if (reservationCounts.isLoading) {
      return { current: "計測中...", completed: "計測中..." };
    }

    if (reservationCounts.error) {
      return { current: "取得に失敗しました", completed: "取得に失敗しました" };
    }

    return {
      current: formatCount(reservationCounts.current),
      completed: formatCount(reservationCounts.completed),
    };
  }, [reservationCounts]);

  return (
    <>
      <Head>
        <title>予約分析 | 管理ダッシュボード</title>
      </Head>
      <DashboardLayout
        title="予約分析"
        description="現在の予約数と予約完了数を確認する分析ページです。"
        showDashboardLink
      >
        <section className={styles.menuSection}>
          <div className={styles.dashboardStatsHeader}>
            <div>
              <p className={styles.dashboardSectionKicker}>Reservation analytics</p>
              <h2 className={styles.dashboardSectionTitle}>予約ステータスの内訳</h2>
              <p className={styles.dashboardSectionNote}>
                予約完了フラグを使って進行中・完了済みの件数を表示しています。
              </p>
            </div>
          </div>

          <div className={styles.analyticsGrid}>
            <article className={styles.analyticsCard}>
              <header className={styles.analyticsCardHeader}>
                <div>
                  <p className={styles.dashboardSectionKicker}>現在値</p>
                  <h3 className={styles.dashboardSectionTitle}>予約件数サマリー</h3>
                  <p className={styles.dashboardSectionNote}>
                    受付中の予約と完了済みの予約数を把握できます。
                  </p>
                </div>
              </header>
              <div className={styles.statGrid}>
                <div className={styles.statCard}>
                  <p className={styles.statLabel}>現在の予約数</p>
                  <p className={styles.statValue}>{displayValues.current}</p>
                </div>
                <div className={styles.statCard}>
                  <p className={styles.statLabel}>予約完了数</p>
                  <p className={styles.statValue}>{displayValues.completed}</p>
                </div>
              </div>
            </article>

            <article className={styles.analyticsCard}>
              <header className={styles.analyticsCardHeader}>
                <div>
                  <p className={styles.dashboardSectionKicker}>次のステップ</p>
                  <h3 className={styles.dashboardSectionTitle}>予約推移メモ</h3>
                  <p className={styles.dashboardSectionNote}>
                    日別・月別の推移グラフを配置するためのプレースホルダーです。
                  </p>
                </div>
              </header>
              <div className={styles.chartPlaceholder}>
                <p className={styles.chartPlaceholderLabel}>予約推移チャート</p>
                <p className={styles.chartPlaceholderNote}>
                  今後、予約数の推移グラフを追加する予定です。
                </p>
              </div>
            </article>
          </div>
        </section>
      </DashboardLayout>
    </>
  );
}
