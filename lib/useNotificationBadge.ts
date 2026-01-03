import { useEffect, useState } from 'react';

type NotificationSummaryItem = {
  readAt?: string;
  channels?: string[];
};

type NotificationsResponse = {
  notifications?: NotificationSummaryItem[];
};

const countUnreadNotifications = (items: NotificationSummaryItem[]): number =>
  items.filter((item) => !item.readAt && item.channels?.includes('site')).length;

const fetchUnreadCount = async (): Promise<number> => {
  const response = await fetch('/api/notifications?limit=50', { credentials: 'include' });
  if (!response.ok) return 0;

  const data = (await response.json()) as NotificationsResponse;
  const notifications = Array.isArray(data.notifications) ? data.notifications : [];
  return countUnreadNotifications(notifications);
};

export default function useNotificationBadge(enabled: boolean): number {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let active = true;

    if (!enabled) {
      setUnreadCount(0);
      return () => {
        active = false;
      };
    }

    const load = async () => {
      try {
        const count = await fetchUnreadCount();
        if (!active) return;
        setUnreadCount(count);
      } catch (error) {
        if (!active) return;
        console.error('Failed to load notification count', error);
        setUnreadCount(0);
      }
    };

    const handleRefresh = () => {
      void load();
    };

    void load();
    window.addEventListener('notifications:refresh', handleRefresh);

    return () => {
      active = false;
      window.removeEventListener('notifications:refresh', handleRefresh);
    };
  }, [enabled]);

  return unreadCount;
}
