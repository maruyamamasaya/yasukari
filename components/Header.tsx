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
} from 'react-icons/fa';
import AnnouncementBar from './AnnouncementBar';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [sessionUser, setSessionUser] = useState<{ email?: string; username?: string } | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [startingLogout, setStartingLogout] = useState(false);
  const menuRef = useRef<HTMLElement | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const router = useRouter();

  const startLogout = async () => {
    setStartingLogout(true);
    try {
      const response = await fetch('/api/logout', { method: 'POST', credentials: 'include' });
      if (!response.ok) {
        throw new Error(`failed to logout: ${response.status}`);
      }

      await router.push('/login');
      window.location.reload();
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
  useEffect(() => {
    const controller = new AbortController();
    const fetchSession = async () => {
      try {
        setAuthError(false);
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
          return;
        }

        setSessionUser(null);
        setAuthError(true);
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }
        console.error('Failed to check session', error);
        setSessionUser(null);
        setAuthError(true);
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
              onClick={() => setMenuOpen((o) => !o)}
              ref={menuButtonRef}
            >
              <FaBars size={20} />
            </button>

            {/* ナビゲーションボタン */}
            <nav className="hidden sm:flex items-center gap-6 text-sm font-medium">
              <Link href="/">
                <NavItem label="ホーム" />
              </Link>
              {authChecked && sessionUser ? (
                <>
                  <Link href="/mypage">
                    <NavItem icon={<FaUser />} label="マイページ" />
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
              ) : authChecked && authError ? (
                <button
                  type="button"
                  className="hidden sm:inline-flex"
                  onClick={startLogout}
                  disabled={startingLogout}
                >
                  <NavItem icon={<FaUser />} label="ログインエラー" />
                </button>
              ) : (
                <Link href="https://yasukaribike.com/login" className="hidden sm:inline-flex">
                  <NavItem icon={<FaUser />} label="ログイン" />
                </Link>
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
                ) : authChecked && authError ? (
                  <button
                    type="button"
                    className="inline-flex"
                    onClick={startLogout}
                    disabled={startingLogout}
                  >
                    <NavItem icon={<FaUser />} label="ログインエラー" />
                  </button>
                ) : (
                  <Link href="https://yasukaribike.com/login" className="inline-flex">
                    <NavItem icon={<FaUser />} label="ログイン" />
                  </Link>
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
