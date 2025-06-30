import Head from 'next/head';

export default function RentalStatus() {
  return (
    <div className="p-6 text-center">
      <Head>
        <title>レンタル状況</title>
      </Head>
      <h1 className="text-xl font-bold mb-4">レンタル状況</h1>
      <p>ご利用中のバイク情報を表示するページです。</p>
    </div>
  );
}
