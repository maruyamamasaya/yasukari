import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { FaUser, FaQuestionCircle, FaClipboardList, FaBars } from 'react-icons/fa';
import AnnouncementBar from './AnnouncementBar';

export default function HeaderEn() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLElement | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(target)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [menuOpen]);
  return (
    <div className="sticky top-0 z-50">
      {/* Top bar */}
      <AnnouncementBar />
      <header className="bg-white shadow-md border-b-2 border-red-600 relative">
        <div className="mx-auto flex items-center justify-between px-4 py-3 w-full max-w-screen-xl">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 transition-colors hover:border-red-600 hover:text-red-600"
            >
              日本語
            </Link>
            {/* Logo */}
            <Link href="/en" className="flex items-center">
              <img
                src="https://yasukari.com/static/images/logo/250x50.png"
                alt="yasukari logo"
                className="h-8 w-auto"
              />
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <button
              className="sm:hidden text-gray-700"
              onClick={() => setMenuOpen((o) => !o)}
              ref={menuButtonRef}
            >
              <FaBars size={20} />
            </button>

            {/* Navigation buttons */}
            <nav className="hidden sm:flex items-center gap-6 text-sm font-medium">
              <Link href="/en">
                <NavItem label="Home" />
              </Link>
              <Link href="/en/login">
                <NavItem icon={<FaUser />} label="Login" />
              </Link>
              <Link href="/en/mypage">
                <NavItem icon={<FaUser />} label="My Page" />
              </Link>
              <Link href="/en/pricing">
                <NavItem icon={<FaClipboardList />} label="Bikes & Pricing" />
              </Link>
              <Link href="/en/beginner">
                <NavItem icon={<FaQuestionCircle />} label="Beginner Guide" />
              </Link>
              <Link href="/en/help">
                <NavItem label="Help" />
              </Link>
            </nav>
          </div>
        </div>
        {menuOpen && (
          <nav
            ref={menuRef}
            className="sm:hidden absolute left-0 top-full w-full bg-white border-b shadow-md"
          >
            <ul className="flex flex-col p-4 gap-4 text-sm font-medium">
              <li>
                <Link href="/en">
                  <NavItem label="Home" />
                </Link>
              </li>
              <li>
                <Link href="/en/login">
                  <NavItem icon={<FaUser />} label="Login" />
                </Link>
              </li>
              <li>
                <Link href="/en/mypage">
                  <NavItem icon={<FaUser />} label="My Page" />
                </Link>
              </li>
              <li>
                <Link href="/en/pricing">
                  <NavItem icon={<FaClipboardList />} label="Bikes & Pricing" />
                </Link>
              </li>
              <li>
                <Link href="/en/beginner">
                  <NavItem icon={<FaQuestionCircle />} label="Beginner Guide" />
                </Link>
              </li>
              <li>
                <Link href="/en/help">
                  <NavItem label="Help" />
                </Link>
              </li>
            </ul>
          </nav>
        )}
      </header>
    </div>
  );
}

function NavItem({ icon, label }: { icon?: React.ReactNode; label: string }) {
  return (
    <button className="flex items-center gap-1 text-gray-700 hover:text-red-600 transition-colors">
      {icon && <span>{icon}</span>}
      <span>{label}</span>
    </button>
  );
}
