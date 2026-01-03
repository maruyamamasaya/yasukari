import { useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { FaBell } from 'react-icons/fa';

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
  },
  {
    id: 'return-reminder',
    title: 'Return reminder',
    body: 'Your scheduled return time is July 20th at 18:00. Contact us in advance to extend.',
    time: 'Yesterday',
    tag: 'Notice',
  },
];

export default function NotificationsPage() {
  const [activeId, setActiveId] = useState(notifications[0]?.id ?? null);
  const activeNotification = useMemo(
    () => notifications.find((notice) => notice.id === activeId) ?? notifications[0] ?? null,
    [activeId]
  );
  const unreadCount = notifications.filter((notice) => notice.unread).length;

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
            <p className={styles.summaryValue}>{unreadCount}</p>
            <p className={styles.summaryNote}>Stay on top of important updates.</p>
          </div>
          <div className={styles.summaryCard}>
            <p className={styles.summaryLabel}>Latest update</p>
            <p className={styles.summaryValue}>{notifications[0]?.time ?? '—'}</p>
            <p className={styles.summaryNote}>Your reservation confirmation just arrived.</p>
          </div>
          <div className={styles.summaryCard}>
            <p className={styles.summaryLabel}>Support</p>
            <p className={styles.summaryValue}>Anytime</p>
            <p className={styles.summaryNote}>Reach out via chat whenever you need help.</p>
          </div>
        </div>

        <div className={styles.threadLayout}>
          <div className={styles.threadList} role="tablist" aria-label="Notifications list">
            {notifications.map((notice) => {
              const isActive = notice.id === activeNotification?.id;
              return (
                <button
                  key={notice.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`${styles.threadItem} ${isActive ? styles.threadItemActive : ''} ${
                    notice.unread ? styles.threadItemUnread : ''
                  }`}
                  onClick={() => setActiveId(notice.id)}
                >
                  <div className={styles.threadItemHeader}>
                    <p className={styles.threadItemTitle}>{notice.title}</p>
                    <span className={styles.threadItemStatus}>
                      {notice.unread ? (
                        <>
                          <span className={styles.unreadDot} aria-hidden="true" />
                          Unread
                        </>
                      ) : (
                        'Read'
                      )}
                    </span>
                  </div>
                  <p className={styles.threadItemMeta}>{notice.time}</p>
                </button>
              );
            })}
          </div>
          <div className={styles.threadDetail} role="tabpanel">
            {activeNotification ? (
              <>
                <div className={styles.detailHeader}>
                  <div>
                    <p className={styles.detailEyebrow}>{activeNotification.tag}</p>
                    <h2 className={styles.detailTitle}>{activeNotification.title}</h2>
                  </div>
                  <span className={styles.detailStatus}>
                    {activeNotification.unread ? 'Unread' : 'Read'}
                  </span>
                </div>
                <div className={styles.detailMeta}>
                  <span className={styles.detailTime}>{activeNotification.time}</span>
                </div>
                <div className={styles.detailBody}>{activeNotification.body}</div>
                {activeNotification.actionHref && activeNotification.actionLabel ? (
                  <div className={styles.cardAction}>
                    <Link href={activeNotification.actionHref} className={styles.actionLink}>
                      {activeNotification.actionLabel}
                    </Link>
                  </div>
                ) : null}
              </>
            ) : (
              <div className={styles.detailEmpty}>
                <p className={styles.emptyTitle}>Select a notification</p>
                <p className={styles.emptyDescription}>Choose a notification to see details.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
