import Head from 'next/head';

export default function WaitPage() {
  return (
    <main className="flex items-center justify-center min-h-screen p-6 bg-gray-50 text-center text-sm">
      <Head>
        <title>しばらくお待ちください</title>
      </Head>
      <div>
        <h1 className="text-xl font-bold mb-4">アクセス制限中です</h1>
        <p className="mb-4">短時間に多数のアクセスが検出されたため、一時的に閲覧を制限しています。1分ほど待ってから再度お試しください。</p>
        <p>お問い合わせ: <a href="mailto:info@rebikele.com" className="text-red-600 underline">info@rebikele.com</a></p>
      </div>
    </main>
  );
}
