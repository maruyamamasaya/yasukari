import Head from 'next/head';

export default function TestPage() {
  return (
    <>
      <Head>
        <title>テストページ</title>
        <meta name="description" content="チャットボットの表示確認用ページ" />
      </Head>
      <main className="page-container">
        <h1 className="section-title">テストページ</h1>
        <p className="section-description">
          チャットボットのアイコンはこのページのみで表示されます。他のページでは非表示ですが、要素自体は保持されています。
        </p>
      </main>
    </>
  );
}
