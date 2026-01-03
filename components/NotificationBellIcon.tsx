import React from 'react';
import { FaBell } from 'react-icons/fa';

type NotificationBellIconProps = {
  count: number;
  className?: string;
};

const formatCount = (count: number): string => {
  if (count > 99) return '99+';
  return String(count);
};

export default function NotificationBellIcon({ count, className }: NotificationBellIconProps) {
  const label = count > 0 ? formatCount(count) : '';

  return (
    <span className={`relative inline-flex items-center ${className ?? ''}`.trim()}>
      <FaBell />
      {count > 0 ? (
        <span className="absolute -right-2 -top-1 flex min-w-[1.1rem] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white shadow">
          {label}
        </span>
      ) : null}
    </span>
  );
}
