import type { ReactElement } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { FaBell, FaCheckCircle, FaEnvelopeOpenText } from 'react-icons/fa';

import styles from '../../styles/Notifications.module.css';

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  time: string;
  tag: string;
  unread?: boolean;
  actionLabel?: string;
  actionHref?: string;
  icon: ReactElement;
};

const notifications: NotificationItem[] = [
  {
    id: 'reservation-complete',
    title: 'Your rental reservation is confirmed',
    body:
      'We received your reservation for July 20th, 10:00–18:00. Please review pickup details and what to bring.',
    time: '5 min ago',
    tag: 'Reservation',
    unread: true,
    actionLabel: 'View reservation details',
    actionHref: '/rental-status',
    icon: <FaCheckCircle />,
  },
  {
    id: 'operator-message',
    title: 'A message from the team',
    body: 'We have secured a helmet for you. Please share your name at check-in.',
    time: 'Today 09:30',
    tag: 'Message',
    unread: true,
    actionLabel: 'Go to messages',
    actionHref: '/en/mypage',
    icon: <FaEnvelopeOpenText />,
  },
  {
    id: 'return-reminder',
    title: 'Return reminder',
    body: 'Your scheduled return time is July 20th at 18:00. Contact us in advance to extend.',
    time: 'Yesterday',
    tag: 'Notice',
    icon: <FaBell />,
  },
];

export default function NotificationsPage() {
  return (
    <>
      <Head>
        <title>Notifications | Rental Reservation</title>
      </Head>

      <section className={styles.page}>
        <header className={styles.header}>
          <div className={styles.headerIcon} aria-hidden="true">
            <FaBell />
          </div>
          <div>
            <p className={styles.eyebrow}>Notifications</p>
            <h1 className={styles.title}>Notifications</h1>
            <p className={styles.lead}>
              Review reservation confirmations and direct messages from the team in one place.
            </p>
          </div>
        </header>

        <div className={styles.summaryGrid}>
          <div className={styles.summaryCard}>
            <p className={styles.summaryLabel}>Unread</p>
            <p className={styles.summaryValue}>2</p>
            <p className={styles.summaryNote}>Stay on top of important updates.</p>
          </div>
          <div className={styles.summaryCard}>
            <p className={styles.summaryLabel}>Latest update</p>
            <p className={styles.summaryValue}>5 min ago</p>
            <p className={styles.summaryNote}>Your reservation confirmation just arrived.</p>
          </div>
          <div className={styles.summaryCard}>
            <p className={styles.summaryLabel}>Support</p>
            <p className={styles.summaryValue}>Anytime</p>
            <p className={styles.summaryNote}>Reach out via chat whenever you need help.</p>
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
