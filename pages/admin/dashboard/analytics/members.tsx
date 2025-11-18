import Head from "next/head";
import DashboardLayout from "../../../../components/dashboard/DashboardLayout";
import styles from "../../../../styles/Dashboard.module.css";

export default function MemberAnalyticsPage() {
  return (
    <>
      <Head>
        <title>会員分析 | 管理ダッシュボード</title>
      </Head>
      <DashboardLayout
        title="会員分析"
        description="会員数の分析ページです。今後の実装に備えたプレースホルダーです。"
        showDashboardLink
      >
        <section className={styles.menuSection}>
          <p className={styles.menuGroupNote}>
            こちらのページは準備中です。近日中に分析データを表示できるようにする予定です。
          </p>
        </section>
      </DashboardLayout>
    </>
  );
}
