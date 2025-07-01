import Head from 'next/head';
import Link from 'next/link';

export default function Custom404() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6">
      <Head>
        <title>ページが見つかりません - yasukari</title>
      </Head>
      <h1 className="text-4xl font-bold mb-4">404 - ページが見つかりません</h1>
      <p className="mb-6">お探しのページは存在しないか、移動した可能性があります。</p>
      <Link href="/" className="text-red-600 underline">
        ホームへ戻る
      </Link>
    </main>
  );
}
