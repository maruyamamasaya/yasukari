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
          <h1 className={styles.title}>ただいまページを準備中です。</h1>
          <p className={styles.message}>
            年末年始休業のため、1/5まで休業中となります。
            <br />
            1/6より順次対応いたします。
          </p>
          <p className={styles.subMessage}>
            お急ぎの場合は、恐れ入りますが 営業再開後にお問い合わせください。
          </p>
        </section>
      </main>
    </>
  );
}
