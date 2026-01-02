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
          <h1 className={styles.title}>年末年始のため、サイト一次工事中です。</h1>
          <p className={styles.message}>
            サイトをご利用いただきありがとうございます。ただいま年末年始のため、一時的にメンテナンス作業を行っております。ご不便をおかけいたしますが、再開まで今しばらくお待ちください。
          </p>
          <p className={styles.subMessage}>
            お急ぎのご連絡やご予約に関するお問い合わせは、お電話または公式LINEよりお願いいたします。
          </p>
        </section>
      </main>
    </>
  );
}
