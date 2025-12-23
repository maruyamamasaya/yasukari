import React from 'react';
import Link from 'next/link';
import { FaHome, FaUser, FaBell } from 'react-icons/fa';

export default function MobileNav() {
  const items = [
    { href: '/', label: 'ホーム', icon: <FaHome /> },
    { href: '/notifications', label: '通知', icon: <FaBell /> },
    { href: '/mypage', label: 'マイページ', icon: <FaUser /> },
  ];

  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const handler = () => setShow(window.innerWidth <= 640);
    handler();
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  if (!show) return null;

  return (
    <nav className="mobile-nav sm:hidden">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="flex flex-col items-center text-xs"
        >
          {item.icon}
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
