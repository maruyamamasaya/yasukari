import Head from 'next/head';

export default function HelpPage() {
  const faqs = [
    {
      q: '予約はいつまで可能ですか？',
      a: 'ご利用予定日の前営業日17時までご予約いただけます。',
    },
    {
      q: '定休日はいつですか？',
      a: '2023年11月23日より月曜と木曜が定休日となります。定休日は貸出・返却・延長など全ての業務を行っておりません。',
    },
    {
      q: 'ヘルメットをレンタルできますか？',
      a: 'オプションとしてヘルメットレンタルをご用意しています。お申込みがない場合はご持参ください。',
    },
    {
      q: '走行距離の上限はありますか？',
      a: '車種クラスごとの目安距離を設定しています。詳しくは表をご確認ください。',
    },
  ];

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8 text-sm leading-relaxed">
      <Head>
        <title>ヘルプ - yasukari</title>
      </Head>

      <h1 className="text-2xl font-bold mb-6 text-center">ヘルプ</h1>

      <section className="space-y-2 text-center">
        <h2 className="text-lg font-semibold">お問い合わせ</h2>
        <ul className="space-y-1">
          <li>電話: 03-5856-8075</li>
          <li>メール: info@rebikele.com</li>
          <li>住所: 東京都足立区小台2-9-7 1階</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4 text-center">よくある質問</h2>
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
