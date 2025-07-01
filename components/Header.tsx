import React, { useState } from 'react';
import Link from 'next/link';
import { FaUser, FaQuestionCircle, FaShoppingCart, FaMotorcycle, FaClipboardList } from 'react-icons/fa';
import { IoMdSearch } from 'react-icons/io';

export default function Header() {
  const suggestItems = [
    'ホンダ CB400',
    'ヤマハ MT-25',
    'カワサキ Ninja',
    'スズキ GSX-S125',
    '人気モデルランキング',
    'ブログ:メンテナンス入門',
  ];

  const [query, setQuery] = useState('');
  const [showSuggest, setShowSuggest] = useState(false);
  const filteredSuggest = suggestItems.filter((s) =>
    s.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      {/* トップバー */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-500 text-white text-center py-2 text-sm">
        🎉 今週限定：初回レンタル30%OFF + 新着モデル入荷！
      </div>
      <header className="bg-white shadow-md border-b-2 border-teal-600">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
          {/* ロゴ */}
          <Link href="/" className="flex items-center">
            <img
              src="https://yasukari.com/static/images/logo/250x50.png"
              alt="yasukari logo"
              className="h-8 w-auto"
            />
          </Link>
          <div className="flex items-center gap-6">
            {/* 検索 */}
            <div className="relative">
              <input
                type="text"
                placeholder="バイク名・キーワード"
                className="border rounded-full px-4 py-2 pl-10 w-64"
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
                <ul className="absolute left-0 mt-1 w-64 bg-white border rounded shadow z-10">
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
            <nav className="flex items-center gap-6 text-sm font-medium">
              <Link href="/">
                <NavItem label="ホーム" />
              </Link>
              <Link href="/login">
                <NavItem icon={<FaUser />} label="ログイン" />
              </Link>
              <Link href="/pricing">
                <NavItem icon={<FaClipboardList />} label="車種・料金" />
              </Link>
              <NavItem icon={<FaQuestionCircle />} label="はじめてガイド" />
              <NavItem icon={<FaMotorcycle />} label="ジャンル" />
              <NavItem icon={<FaShoppingCart />} label="カート" />
              <Link href="/help">
                <NavItem label="ヘルプ" />
              </Link>
            </nav>
          </div>
        </div>
      </header>
    </>
  );
}

function NavItem({ icon, label }: { icon?: React.ReactNode; label: string }) {
  return (
    <button className="flex items-center gap-1 text-gray-700 hover:text-teal-600 transition-colors">
      {icon && <span>{icon}</span>}
      <span>{label}</span>
    </button>
  );
}
