import Link from 'next/link';
import { FaUserPlus } from 'react-icons/fa';

type AuthHeaderProps = {
  highlightHref: string;
  highlightLabel: string;
  highlightDescription?: string;
  mobileCtaHref: string;
  mobileCtaLabel: string;
};

export default function AuthHeader({
  highlightHref,
  highlightLabel,
  highlightDescription = '激安・便利なレンタルバイクのヤスカリ',
  mobileCtaHref,
  mobileCtaLabel,
}: AuthHeaderProps) {
  return (
    <header className="border-b border-gray-100 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label="ヤスカリトップページへ戻る">
          <img
            src="/static/images/logo/250x50.png"
            alt="ヤスカリ"
            width={200}
            height={40}
            className="hidden md:block"
          />
          <div className="flex items-center gap-2 md:hidden">
            <img src="/static/images/logo/300x300.jpg" alt="ヤスカリ" width={44} height={44} className="rounded-full" />
            <span className="text-sm font-semibold text-gray-800">レンタルバイクのヤスカリ</span>
          </div>
        </Link>
        <div className="hidden flex-col text-right text-sm md:flex">
          <div className="flex items-center justify-end gap-2 text-red-600">
            <FaUserPlus aria-hidden="true" className="h-4 w-4" />
            <Link href={highlightHref} className="font-semibold text-red-600">
              {highlightLabel}
            </Link>
          </div>
          <span className="mt-1 text-gray-600">{highlightDescription}</span>
        </div>
        <Link
          href={mobileCtaHref}
          className="inline-flex items-center gap-2 rounded-full border border-red-600 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-600 hover:text-white md:hidden"
        >
          {mobileCtaLabel}
        </Link>
      </div>
      <div className="hidden bg-red-700 text-white md:block">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-8 text-sm">
          {[
            { href: '/guide', label: 'ご利用案内' },
            { href: '/stores', label: '店舗' },
            { href: '/products', label: '車種・料金' },
            { href: '/insurance', label: '保険と補償' },
            { href: '/faq', label: 'よくあるご質問' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 border-b-2 border-transparent py-3 text-center font-medium transition hover:bg-red-600"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
