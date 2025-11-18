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
          <div className={styles.dashboardStatsHeader}>
            <div>
              <p className={styles.dashboardSectionKicker}>Analytics preview</p>
              <h2 className={styles.dashboardSectionTitle}>車種分析のモック</h2>
              <p className={styles.dashboardSectionNote}>
                クラス構成比や料金分布、予約数の推移などをここに集約する予定です。グラフ領域はダミーとして配置しています。
              </p>
            </div>
          </div>

          <div className={styles.analyticsGrid}>
            <article className={styles.analyticsCard}>
              <header className={styles.analyticsCardHeader}>
                <div>
                  <p className={styles.dashboardSectionKicker}>クラス別</p>
                  <h3 className={styles.dashboardSectionTitle}>構成比（円グラフ）</h3>
                  <p className={styles.dashboardSectionNote}>
                    車両クラスごとの台数構成比を可視化する予定です。
                  </p>
                </div>
              </header>
              <div className={styles.chartPlaceholder}>
                <div className={styles.chartPlaceholderLabel}>Pie Chart Placeholder</div>
                <p className={styles.chartPlaceholderNote}>クラスごとの割合がここに表示されます</p>
              </div>
            </article>

            <article className={styles.analyticsCard}>
              <header className={styles.analyticsCardHeader}>
                <div>
                  <p className={styles.dashboardSectionKicker}>料金</p>
                  <h3 className={styles.dashboardSectionTitle}>価格帯の分布</h3>
                  <p className={styles.dashboardSectionNote}>
                    ベース料金とオプション料金のレンジをヒストグラムで表示する想定です。
                  </p>
                </div>
              </header>
              <div className={styles.chartPlaceholder}>
                <div className={styles.chartPlaceholderLabel}>Bar Chart Placeholder</div>
                <p className={styles.chartPlaceholderNote}>車種別の料金帯がここに表示されます</p>
              </div>
            </article>
          </div>

          <div className={styles.analyticsGrid}>
            <article className={styles.analyticsCard}>
              <header className={styles.analyticsCardHeader}>
                <div>
                  <p className={styles.dashboardSectionKicker}>予約数</p>
                  <h3 className={styles.dashboardSectionTitle}>車種ごとの推移</h3>
                  <p className={styles.dashboardSectionNote}>
                    予約件数の時系列推移を折れ線グラフで予定しています。
                  </p>
                </div>
              </header>
              <div className={styles.chartPlaceholder}>
                <div className={styles.chartPlaceholderLabel}>Line Chart Placeholder</div>
                <p className={styles.chartPlaceholderNote}>予約推移グラフがここに入ります</p>
              </div>
            </article>

            <article className={styles.analyticsCard}>
              <header className={styles.analyticsCardHeader}>
                <div>
                  <p className={styles.dashboardSectionKicker}>料金ビュー</p>
                  <h3 className={styles.dashboardSectionTitle}>車種別料金カード</h3>
                  <p className={styles.dashboardSectionNote}>
                    料金テーブルのレイアウト案です。仮データで枠のみ配置しています。
                  </p>
                </div>
              </header>
              <div className={styles.placeholderList}>
                {["シティバイク", "マウンテンバイク", "Eバイク"].map((label) => (
                  <div key={label} className={styles.placeholderListItem}>
                    <div>
                      <div className={styles.placeholderLabel}>{label}</div>
                      <p className={styles.placeholderSubLabel}>料金詳細がここに入ります</p>
                    </div>
                    <div className={styles.placeholderBadge}>¥0,000</div>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>
      </DashboardLayout>
    </>
  );
}
