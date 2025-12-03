import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  FaUser,
  FaQuestionCircle,
  FaShoppingCart,
  FaMotorcycle,
  FaClipboardList,
  FaBars,
} from 'react-icons/fa';
import { IoMdSearch } from 'react-icons/io';
import AnnouncementBar from './AnnouncementBar';

export default function HeaderEn() {
  const suggestItems = [
    'Honda CB400',
    'Kawasaki Ninja',
    'Top model ranking',
    'Blog: Maintenance tips',
  ];

  const [query, setQuery] = useState('');
  const [showSuggest, setShowSuggest] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
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
  const filteredSuggest = suggestItems.filter((s) =>
    s.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="sticky top-0 z-50">
      {/* Top bar */}
      <AnnouncementBar />
      <header className="bg-white shadow-md border-b-2 border-red-600 relative">
        <div className="mx-auto flex items-center justify-between px-4 py-3 w-full max-w-screen-xl">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <img
              src="https://yasukari.com/static/images/logo/250x50.png"
              alt="yasukari logo"
              className="h-8 w-auto"
            />
          </Link>
          <div className="flex items-center gap-4">
            <button
              className="sm:hidden text-gray-700"
              onClick={() => setMobileSearchOpen((o) => !o)}
            >
              <IoMdSearch size={20} />
            </button>
            <button
              className="sm:hidden text-gray-700"
              onClick={() => setMenuOpen((o) => !o)}
              ref={menuButtonRef}
            >
              <FaBars size={20} />
            </button>
            {/* Search */}
            <div className="relative hidden sm:block">
              <input
                type="text"
                placeholder="Bike name or keyword"
                className="border rounded-full px-4 py-2 pl-10 w-40 sm:w-64"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowSuggest(true);
                }}
                onFocus={() => setShowSuggest(true)}
                onBlur={() => setTimeout(() => setShowSuggest(false), 100)}
              />
              <IoMdSearch className="absolute left-3 top-2.5 text-gray-500 text-lg" />
              {showSuggest && (
                <ul className="absolute left-0 mt-1 w-40 sm:w-64 bg-white border rounded shadow z-10">
                  {filteredSuggest.map((s) => (
                    <li key={s}>
                      <button
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setQuery(s);
                          setShowSuggest(false);
                        }}
                      >
                        {s}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Navigation buttons */}
            <nav className="hidden sm:flex items-center gap-6 text-sm font-medium">
              <Link href="/">
                <NavItem label="Home" />
              </Link>
              <Link href="/pricing">
                <NavItem icon={<FaClipboardList />} label="Bikes & Pricing" />
              </Link>
              <Link href="/beginner">
                <NavItem icon={<FaQuestionCircle />} label="Beginner Guide" />
              </Link>
              <Link href="/help">
                <NavItem label="Help" />
              </Link>
            </nav>
            <div className="hidden sm:flex items-center gap-3 text-sm font-medium">
              <Link
                href="https://yasukaribike.com/login"
                className="inline-flex items-center gap-2 rounded-full border border-red-600 px-4 py-2 text-red-600 transition-colors hover:bg-red-50"
              >
                <FaUser />
                <span>Log in</span>
              </Link>
              <Link
                href="https://yasukaribike.com/signup"
                className="inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
              >
                <FaUser />
                <span>Sign in</span>
              </Link>
            </div>
          </div>
        </div>
        {mobileSearchOpen && (
          <div className="sm:hidden absolute left-0 top-full w-full bg-white border-b shadow-md p-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Bike name or keyword"
                className="border rounded-full px-4 py-2 pl-10 w-full"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowSuggest(true);
                }}
                onFocus={() => setShowSuggest(true)}
                onBlur={() => {
                  setTimeout(() => setShowSuggest(false), 100);
                }}
              />
              <IoMdSearch className="absolute left-3 top-2.5 text-gray-500 text-lg" />
              {showSuggest && (
                <ul className="absolute left-0 mt-1 w-full bg-white border rounded shadow z-10">
                  {filteredSuggest.map((s) => (
                    <li key={s}>
                      <button
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setQuery(s);
                          setShowSuggest(false);
                          setMobileSearchOpen(false);
                        }}
                      >
                        {s}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
        {menuOpen && (
          <nav
            ref={menuRef}
            className="sm:hidden absolute left-0 top-full w-full bg-white border-b shadow-md"
          >
            <ul className="flex flex-col p-4 gap-4 text-sm font-medium">
              <li>
                <Link href="/">
                  <NavItem label="Home" />
                </Link>
              </li>
              <li>
                <Link href="/pricing">
                  <NavItem icon={<FaClipboardList />} label="Bikes & Pricing" />
                </Link>
              </li>
              <li>
                <Link href="/beginner">
                  <NavItem icon={<FaQuestionCircle />} label="Beginner Guide" />
                </Link>
              </li>
              <li>
                <Link href="/help">
                  <NavItem label="Help" />
                </Link>
              </li>
              <li className="flex flex-col gap-2">
                <Link
                  href="https://yasukaribike.com/login"
                  className="inline-flex items-center gap-2 rounded-full border border-red-600 px-4 py-2 text-red-600 transition-colors hover:bg-red-50"
                >
                  <FaUser />
                  <span>Log in</span>
                </Link>
                <Link
                  href="https://yasukaribike.com/signup"
                  className="inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
                >
                  <FaUser />
                  <span>Sign in</span>
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
