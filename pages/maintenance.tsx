import Head from "next/head";
import styles from "../styles/MaintenancePage.module.css";

export default function MaintenancePage() {
  return (
    <>
      <Head>
        <title>現在サイト工事中です | YASUKARI</title>
      </Head>
      <main className={styles.main}>
        <section className={styles.card}>
          <div className={styles.badge}>現在サイト工事中です</div>
          <h1 className={styles.title}>サイトを一時的に停止しています</h1>
          <p className={styles.message}>
            サイトをご利用いただきありがとうございます。現在、メンテナンス作業のため
            ページの閲覧を一時的に停止しております。作業完了まで今しばらくお待ち
            ください。
          </p>

          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <div className={styles.infoLabel}>メンテナンス状況</div>
              <p className={styles.infoText}>
                安定したサービス提供のため、システムのアップデートを実施しています。
                完了次第、順次公開いたします。
              </p>
            </div>
            <div className={styles.infoCard}>
              <div className={styles.infoLabel}>ご案内</div>
              <p className={styles.infoText}>
                ご不便をおかけし申し訳ございません。準備が整い次第、通常のページを再開
                いたしますので、しばらくお待ちください。
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
