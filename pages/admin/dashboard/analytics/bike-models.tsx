import Head from "next/head";
import DashboardLayout from "../../../../components/dashboard/DashboardLayout";
import styles from "../../../../styles/Dashboard.module.css";

export default function BikeModelAnalyticsPage() {
  return (
    <>
      <Head>
        <title>車種分析 | 管理ダッシュボード</title>
      </Head>
      <DashboardLayout
        title="車種分析"
        description="登録車種に関する分析ページです。今後の実装に備えたプレースホルダーです。"
        showDashboardLink
      >
        <section className={styles.menuSection}>
          <p className={styles.menuGroupNote}>
            こちらのページは準備中です。車種データの分析結果をここに表示予定です。
          </p>
        </section>
      </DashboardLayout>
    </>
  );
}
