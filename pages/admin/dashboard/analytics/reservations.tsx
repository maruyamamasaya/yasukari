import Head from "next/head";
import DashboardLayout from "../../../../components/dashboard/DashboardLayout";
import styles from "../../../../styles/Dashboard.module.css";

export default function ReservationAnalyticsPage() {
  return (
    <>
      <Head>
        <title>予約分析 | 管理ダッシュボード</title>
      </Head>
      <DashboardLayout
        title="予約分析"
        description="予約データの分析ページです。今後の実装に備えたプレースホルダーです。"
        showDashboardLink
      >
        <section className={styles.menuSection}>
          <p className={styles.menuGroupNote}>
            こちらのページは準備中です。予約データの集計機能を追加予定です。
          </p>
        </section>
      </DashboardLayout>
    </>
  );
}
