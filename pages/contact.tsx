import Head from 'next/head';
import Link from 'next/link';

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto p-6 text-sm leading-relaxed">
      <Head>
        <title>お問い合わせ - yasukari</title>
      </Head>
      <h1 className="text-xl font-bold mb-4 text-center">お問い合わせ</h1>
      <p className="mb-4">下記の連絡先までお気軽にご連絡ください。</p>
      <ul className="space-y-2">
        <li>電話: 03-5856-8075</li>
        <li>メール: info@rebikele.com</li>
        <li>住所: 東京都足立区小台2-9-7 1階</li>
      </ul>
      <p className="mt-6">
        よくある質問は
        <Link href="/guide" className="text-teal-600 underline ml-1">
          ご利用案内
        </Link>
        でもご確認いただけます。
      </p>
    </div>
  );
}
