import Head from 'next/head';
import Link from 'next/link';

export default function Custom404() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6 py-16 bg-gray-50">
      <Head>
        <title>ページが見つかりません - yasukari</title>
      </Head>
      <span className="text-sm font-semibold tracking-widest text-red-600 uppercase">SYS-404</span>
      <h1 className="mt-3 text-4xl font-bold">404 - ページが見つかりません</h1>
      <p className="mt-4 max-w-xl text-base text-gray-600">
        お探しのページは存在しないか、移動した可能性があります。以下のリンクから目的の情報に
        移動してください。
      </p>
      <nav className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md border border-red-600 px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-600 hover:text-white"
        >
          L0（トップページ）へ戻る
        </Link>
        <Link
          href="/help"
          className="inline-flex items-center justify-center rounded-md border border-transparent bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-gray-300 hover:text-gray-900"
        >
          FAQを確認する
        </Link>
      </nav>
    </main>
  );
}
