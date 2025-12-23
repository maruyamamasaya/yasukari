import Head from 'next/head';
import Link from 'next/link';
import { FaBell, FaCheckCircle, FaEnvelopeOpenText } from 'react-icons/fa';

import styles from '../styles/Notifications.module.css';

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  time: string;
  tag: string;
  unread?: boolean;
  actionLabel?: string;
  actionHref?: string;
  icon: JSX.Element;
};

const notifications: NotificationItem[] = [
  {
    id: 'reservation-complete',
    title: 'レンタル予約が完了しました',
    body: '7月20日 10:00〜18:00のご予約を受け付けました。受け取り場所や持ち物をご確認ください。',
    time: '5分前',
    tag: '予約',
    unread: true,
    actionLabel: '予約詳細を見る',
    actionHref: '/rental-status',
    icon: <FaCheckCircle />,
  },
  {
    id: 'operator-message',
    title: '運営からの個別メッセージ',
    body: 'ヘルメットの在庫確保が完了しました。当日受付でお名前をお知らせください。',
    time: '今日 09:30',
    tag: 'メッセージ',
    unread: true,
    actionLabel: 'メッセージを確認',
    actionHref: '/mypage',
    icon: <FaEnvelopeOpenText />,
  },
  {
    id: 'return-reminder',
    title: '返却予定のリマインド',
    body: '返却予定は7月20日 18:00です。延長をご希望の場合は事前にお知らせください。',
    time: '昨日',
    tag: 'お知らせ',
    icon: <FaBell />,
  },
];

export default function NotificationsPage() {
  return (
    <>
      <Head>
        <title>通知 | レンタル予約</title>
      </Head>

      <section className={styles.page}>
        <header className={styles.header}>
          <div className={styles.headerIcon} aria-hidden="true">
            <FaBell />
          </div>
          <div>
            <p className={styles.eyebrow}>Notifications</p>
            <h1 className={styles.title}>通知</h1>
            <p className={styles.lead}>
              予約完了のお知らせや運営からの個別メッセージをまとめて確認できます。
            </p>
          </div>
        </header>

        <div className={styles.summaryGrid}>
          <div className={styles.summaryCard}>
            <p className={styles.summaryLabel}>未読</p>
            <p className={styles.summaryValue}>2件</p>
            <p className={styles.summaryNote}>重要なお知らせを見逃さないように。</p>
          </div>
          <div className={styles.summaryCard}>
            <p className={styles.summaryLabel}>最新の通知</p>
            <p className={styles.summaryValue}>5分前</p>
            <p className={styles.summaryNote}>予約完了のお知らせが届いています。</p>
          </div>
          <div className={styles.summaryCard}>
            <p className={styles.summaryLabel}>サポート</p>
            <p className={styles.summaryValue}>いつでも</p>
            <p className={styles.summaryNote}>困ったときはチャットからお問い合わせください。</p>
          </div>
        </div>

        <div className={styles.list}>
          {notifications.map((notice) => (
            <article
              key={notice.id}
              className={`${styles.card} ${notice.unread ? styles.unread : ''}`}
            >
              <div className={styles.cardIcon}>{notice.icon}</div>
              <div className={styles.cardBody}>
                <div className={styles.cardMeta}>
                  <span className={styles.tag}>{notice.tag}</span>
                  <span className={styles.time}>{notice.time}</span>
                </div>
                <h2 className={styles.cardTitle}>{notice.title}</h2>
                <p className={styles.cardText}>{notice.body}</p>
                {notice.actionHref && notice.actionLabel ? (
                  <div className={styles.cardAction}>
                    <Link href={notice.actionHref} className={styles.actionLink}>
                      {notice.actionLabel}
                    </Link>
                  </div>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
