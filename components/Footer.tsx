import React from "react";
import Link from "next/link";
import { FaFacebookF, FaXTwitter, FaInstagram, FaYoutube, FaLine } from "react-icons/fa6";

export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t border-gray-300 py-10 text-sm text-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 1. ブランド紹介・SEO対策 */}
        <div className="mb-10">
          <p>
            <strong>Rebikele（リバイクル）</strong>は、バイクのレンタル・サブスク専門サイトです。<br />
            原付から大型バイク、ビジネス用スクーター、ツーリングバイク、EVバイクまで豊富なラインナップをご用意。<br />
            1日からレンタル可能で、月額プランや法人向けも対応。<br />
            はじめての方にも安心のサポートと充実の車種解説で、あなたにぴったりのバイクが見つかります。
          </p>
        </div>

        {/* 2. サイトマップリンク */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
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

          {/* 3. サービスカテゴリ */}
          <div>
            <h4 className="font-bold mb-2">サービス案内</h4>
            <ul className="space-y-1">
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
          </div>

          {/* 4. SNS リンク */}
          <div>
            <h4 className="font-bold mb-2">SNS・動画</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2"><FaFacebookF /> <a href="#" className="hover:underline">Facebook</a></li>
              <li className="flex items-center gap-2"><FaXTwitter /> <a href="#" className="hover:underline">X (Twitter)</a></li>
              <li className="flex items-center gap-2"><FaInstagram /> <a href="#" className="hover:underline">Instagram</a></li>
              <li className="flex items-center gap-2"><FaYoutube /> <a href="#" className="hover:underline">YouTube</a></li>
              <li className="flex items-center gap-2"><FaLine /> <a href="#" className="hover:underline">LINE公式</a></li>
            </ul>
          </div>
        </div>

        {/* 5. ロゴ＋コピーライト */}
        <div className="text-center mt-10">
          <img src="/logo-rebikele.svg" alt="Rebikele ロゴ" width={120} className="mx-auto" />
          <p className="text-gray-400 mt-2">© 2025 Rebikele Inc.</p>
        </div>
      </div>
    </footer>
  );
}
