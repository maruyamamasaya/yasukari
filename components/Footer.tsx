import React from "react";
import Link from "next/link";
import {
  FaFacebookF,
  FaXTwitter,
  FaInstagram,
  FaYoutube,
  FaLine,
} from "react-icons/fa6";

export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 text-sm text-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {/* ブランド紹介と問い合わせ */}
          <div>
            <h4 className="font-bold mb-2">yasukari（リバイクル）</h4>
            <p className="mb-3">
              バイクのレンタル・サブスク専門サイトです。原付から大型・EVバイクまで豊富なラインナップをご用意。
              1日からレンタルでき、月額プランや法人向けサービスも充実しています。
            </p>
            <Link href="/contact" className="text-teal-600 hover:underline">
              お問い合わせはこちら
            </Link>
          </div>

          {/* サイトポリシー */}
          <div>
            <h4 className="font-bold mb-2">サイトポリシー</h4>
            <ul className="space-y-1">
              <li>
                <Link href="/tokusyouhou" className="hover:underline">
                  特定商取引法に基づく表記
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:underline">
                  利用規約
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:underline">
                  プライバシーポリシー
                </Link>
              </li>
              <li>
                <Link href="/external" className="hover:underline">
                  情報の外部送信について
                </Link>
              </li>
              <li>
                <Link href="/company" className="hover:underline">
                  運営会社情報
                </Link>
              </li>
              <li>
                <Link href="/support-policy" className="hover:underline">
                  お問い合わせ・サポートポリシー
                </Link>
              </li>
            </ul>
          </div>

          {/* サービス案内 + SNS */}
          <div>
            <h4 className="font-bold mb-2">サービス案内</h4>
            <ul className="space-y-1 mb-4">
              <li>
                <Link href="/popular" className="hover:underline">
                  人気カテゴリ：原付・250cc・大型バイク・EVバイク
                </Link>
              </li>
              <li>
                <Link href="/guide" className="hover:underline">
                  はじめての方へ（ガイド）
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:underline">
                  よくある質問（FAQ）
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:underline">
                  配送・返却について
                </Link>
              </li>
              <li>
                <Link href="/maintenance" className="hover:underline">
                  メンテナンス体制について
                </Link>
              </li>
            </ul>
            <h4 className="font-bold mb-2">SNS・動画</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <FaFacebookF /> <a href="#" className="hover:underline">Facebook</a>
              </li>
              <li className="flex items-center gap-2">
                <FaXTwitter /> <a href="#" className="hover:underline">X (Twitter)</a>
              </li>
              <li className="flex items-center gap-2">
                <FaInstagram /> <a href="#" className="hover:underline">Instagram</a>
              </li>
              <li className="flex items-center gap-2">
                <FaYoutube /> <a href="#" className="hover:underline">YouTube</a>
              </li>
              <li className="flex items-center gap-2">
                <FaLine /> <a href="#" className="hover:underline">LINE公式</a>
              </li>
            </ul>
          </div>
        </div>

        {/* ロゴとコピーライト */}
        <div className="border-t border-gray-300 mt-8 pt-6 text-center">
          <img
            src="/logo-rebikele.svg"
            alt="yasukari ロゴ"
            width={120}
            className="mx-auto mb-2"
          />
          <p className="text-gray-400">© 2025 yasukari Inc.</p>
        </div>
      </div>
    </footer>
  );
}
