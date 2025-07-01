import Head from 'next/head';

export default function GuidePage() {
  const faqs = [
    {
      q: '予約はいつまで可能ですか？',
      a: '基本的にはご利用日の前日まで受け付けています。ただし人気モデルは早めに埋まるため、お早めのご予約をおすすめします。',
    },
    {
      q: '車両の受け取り場所は？',
      a: '東京都足立区小台の店舗にてお渡ししています。配送オプションをご利用の場合はご指定の場所へお届けします。',
    },
    {
      q: '返却時に注意することは？',
      a: 'ガソリンは満タン返しが基本です。傷や破損がないかスタッフと一緒に確認し、鍵を返却して手続き完了となります。',
    },
  ];

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8 text-sm leading-relaxed">
      <Head>
        <title>レンタルガイド - yasukari</title>
      </Head>
      <article className="space-y-4">
        <h1 className="text-2xl font-bold mb-4 text-center">レンタルガイド</h1>
        <p>
          ここでは、yasukariでバイクをレンタルする際の流れをご紹介します。はじめての方でも安心してご利用いただけるよう、手順をブログ形式でまとめました。
        </p>
        <h2 className="text-lg font-semibold mt-4">1. 車両を選ぶ</h2>
        <p>
          トップページや検索機能からお気に入りのバイクを見つけましょう。原付から大型・EVまで多彩なラインナップを揃えています。
        </p>
        <h2 className="text-lg font-semibold mt-4">2. 予約する</h2>
        <p>
          車両ページの「予約する」ボタンから日程を入力し、必要情報を送信してください。予約確定後、登録メールアドレスに確認メールが届きます。
        </p>
        <h2 className="text-lg font-semibold mt-4">3. 受け取り</h2>
        <p>
          当日はスタッフが操作方法や注意点をご説明します。身分証明書とクレジットカードをご持参ください。オプションで配送もご利用いただけます。
        </p>
        <h2 className="text-lg font-semibold mt-4">4. 返却</h2>
        <p>
          返却前にガソリンを満タンにし、指定の時間までに店舗へお戻しください。延長をご希望の場合は事前にご連絡をお願いします。
        </p>
      </article>

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-4 text-center">よくある質問</h2>
        <ul className="space-y-4">
          {faqs.map((f, idx) => (
            <li key={idx} className="border rounded p-4">
              <p className="font-semibold">Q. {f.q}</p>
              <p className="mt-2">A. {f.a}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
