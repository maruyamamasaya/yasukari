import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  FaUser,
  FaQuestionCircle,
  FaShoppingCart,
  FaMotorcycle,
  FaClipboardList,
  FaBars,
  FaGlobe,
} from 'react-icons/fa';
import { IoMdSearch } from 'react-icons/io';
import AnnouncementBar from './AnnouncementBar';
import { buildAuthorizeUrl, buildLogoutUrl, createAndStoreOauthState } from '../lib/cognitoHostedUi';

export default function Header() {
  const suggestItems = [
    'ホンダ CB400',
    'カワサキ Ninja',
    '人気モデルランキング',
    'ブログ:メンテナンス入門',
  ];

  const [query, setQuery] = useState('');
  const [showSuggest, setShowSuggest] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [sessionUser, setSessionUser] = useState<{ email?: string; username?: string } | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [startingLogin, setStartingLogin] = useState(false);
  const [startingLogout, setStartingLogout] = useState(false);
  const menuRef = useRef<HTMLElement | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const router = useRouter();
  const isEn = router.pathname.startsWith('/en');
  const langHref = isEn ? '/' : '/en';
  const langLabel = isEn ? 'JP' : 'EN';

  const startLogin = async () => {
    setStartingLogin(true);
    try {
      const state = createAndStoreOauthState();
      window.location.href = buildAuthorizeUrl(state);
    } catch (error) {
      console.error('Failed to start login', error);
      alert('ログイン処理を開始できませんでした。時間をおいて再度お試しください。');
    } finally {
      setStartingLogin(false);
    }
  };

  const startLogout = () => {
    setStartingLogout(true);
    try {
      window.location.href = buildLogoutUrl();
    } catch (error) {
      console.error('Failed to start logout', error);
      alert('ログアウト処理を開始できませんでした。時間をおいて再度お試しください。');
      setStartingLogout(false);
    }
  };

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

  useEffect(() => {
    const controller = new AbortController();
    const fetchSession = async () => {
      try {
        const response = await fetch(`/api/me`, {
          credentials: 'include',
          signal: controller.signal,
        });

        if (response.status === 401) {
          setSessionUser(null);
          return;
        }

        if (response.ok) {
          const data = (await response.json()) as { user?: { email?: string; username?: string } };
          setSessionUser(data.user ?? null);
        }
      } catch (error) {
        console.error('Failed to check session', error);
      } finally {
        setAuthChecked(true);
      }
    };

    void fetchSession();
    return () => controller.abort();
  }, []);

  return (
    <div className="sticky top-0 z-50">
      {/* トップバー */}
      <AnnouncementBar />
      <header className="bg-white shadow-md border-b-2 border-red-600 relative">
        <div className="mx-auto flex items-center justify-between px-4 py-3 w-full max-w-screen-xl">
          {/* ロゴ */}
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
            {/* 検索 */}
            <div className="relative hidden sm:block">
              <input
                type="text"
                placeholder="バイク名・キーワード"
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

            {/* ナビゲーションボタン */}
            <nav className="hidden sm:flex items-center gap-6 text-sm font-medium">
              <Link href="/">
                <NavItem label="ホーム" />
              </Link>
              {authChecked && sessionUser ? (
                <>
                  <Link href="/mypage">
                    <NavItem icon={<FaUser />} label="ログイン中" />
                  </Link>
                  <button
                    type="button"
                    className="hidden sm:inline-flex"
                    onClick={startLogout}
                    disabled={startingLogout}
                  >
                    <NavItem label={startingLogout ? '処理中…' : 'ログアウト'} />
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={startLogin}
                  className="hidden sm:inline-flex"
                  disabled={startingLogin}
                >
                  <NavItem icon={<FaUser />} label={startingLogin ? '接続中…' : 'ログイン'} />
                </button>
              )}
              <Link href="/pricing">
                <NavItem icon={<FaClipboardList />} label="車種・料金" />
              </Link>
              <Link href="/beginner">
                <NavItem icon={<FaQuestionCircle />} label="はじめてガイド" />
              </Link>
              <Link href="/help">
                <NavItem label="ヘルプ" />
              </Link>
              <Link href={langHref}>
                <NavItem icon={<FaGlobe />} label={langLabel} />
              </Link>
            </nav>
          </div>
        </div>
        {mobileSearchOpen && (
          <div className="sm:hidden absolute left-0 top-full w-full bg-white border-b shadow-md p-4">
            <div className="relative">
              <input
                type="text"
                placeholder="バイク名・キーワード"
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
                  <NavItem label="ホーム" />
                </Link>
              </li>
              <li>
                {authChecked && sessionUser ? (
                  <>
                    <Link href="/mypage">
                      <NavItem icon={<FaUser />} label="マイページ" />
                    </Link>
                    <button
                      type="button"
                      className="mt-2 inline-flex"
                      onClick={startLogout}
                      disabled={startingLogout}
                    >
                      <NavItem label={startingLogout ? '処理中…' : 'ログアウト'} />
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={startLogin}
                    className="inline-flex"
                    disabled={startingLogin}
                  >
                    <NavItem icon={<FaUser />} label={startingLogin ? '接続中…' : 'ログイン'} />
                  </button>
                )}
              </li>
              <li>
                <Link href="/pricing">
                  <NavItem icon={<FaClipboardList />} label="車種・料金" />
                </Link>
              </li>
              <li>
                <Link href="/beginner">
                  <NavItem icon={<FaQuestionCircle />} label="はじめてガイド" />
                </Link>
              </li>
              <li>
                <Link href="/help">
                  <NavItem label="ヘルプ" />
                </Link>
              </li>
              <li>
                <Link href={langHref}>
                  <NavItem icon={<FaGlobe />} label={langLabel} />
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
    <span className="flex items-center gap-1 text-gray-700 hover:text-red-600 transition-colors">
      {icon && <span>{icon}</span>}
      <span>{label}</span>
    </span>
  );
}
