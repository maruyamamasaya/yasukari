import Head from "next/head";
import Link from "next/link";

const infoSections = [
  {
    title: "予約完了時に届くメール",
    description: "最初の予約完了メールに記載されている決済内容です。マイページでも同じ情報を確認できます。",
    items: [
      { label: "件名", value: "【yasukari】ご予約が完了しました（決済情報のご案内）" },
      { label: "予約番号", value: "ABC123456" },
      { label: "決済方法", value: "クレジットカード（Visa・Mastercard・JCB など）" },
      { label: "決済日時", value: "2024/05/01 12:00" },
      { label: "合計金額", value: "¥8,800（税込）" },
      { label: "内訳", value: "レンタル料金 ¥7,000 / 保険・オプション ¥1,800" },
      { label: "領収書・請求内容", value: "カード会社からのご請求明細に「YASUKARI」と表示されます。" },
    ],
    notes: [
      "予約内容の変更やキャンセルを行うと決済も自動で調整されます。",
      "カードが利用できない場合は、別のカードでお試しください。",
    ],
  },
  {
    title: "レンタル延長時に届くメール",
    description: "レンタルを延長した際に追加決済が発生する場合のメール内容です。",
    items: [
      { label: "件名", value: "【yasukari】レンタルを延長しました（追加決済のご案内）" },
      { label: "予約番号", value: "ABC123456" },
      { label: "延長分の決済日時", value: "2024/05/02 09:30" },
      { label: "追加決済額", value: "¥3,300（税込）" },
      { label: "内訳", value: "延長レンタル料金 ¥3,000 / 税金等 ¥300" },
      { label: "合計請求額", value: "初回決済 ¥8,800 + 追加決済 ¥3,300 = ¥12,100" },
      {
        label: "確認方法",
        value: "マイページの「決済情報を確認」から、初回分と延長分それぞれの決済内容を参照できます。",
      },
    ],
    notes: [
      "延長後にさらに変更があった場合は、最新のメールの金額が優先されます。",
      "銀行の明細では追加決済が別トランザクションで表示されます。",
    ],
  },
];

export default function PaymentInfoIndexPage() {
  return (
    <>
      <Head>
        <title>決済情報の確認 | yasukari</title>
      </Head>
      <main className="min-h-screen bg-gray-50 pb-16">
        <div className="mx-auto max-w-4xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
          <header className="space-y-3 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Payment Information</p>
            <h1 className="text-3xl font-bold text-gray-900">マイページで決済情報を確認できます</h1>
            <p className="text-sm text-gray-600">
              予約完了時やレンタル延長時にメールで送られる決済内容を、マイページからいつでも再確認できます。
            </p>
            <div className="flex flex-wrap justify-center gap-3 text-sm text-gray-700">
              <Link
                href="/mypage"
                className="inline-flex items-center justify-center rounded-full bg-red-500 px-4 py-2 font-semibold text-white shadow transition hover:bg-red-600"
              >
                マイページへ戻る
              </Link>
              <Link
                href="/mypage/past-reservations"
                className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-4 py-2 font-semibold text-gray-700 shadow-sm hover:border-gray-300"
              >
                過去の予約を確認
              </Link>
            </div>
          </header>

          <div className="grid gap-6 lg:grid-cols-2">
            {infoSections.map((section) => (
              <article key={section.title} className="space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                <header className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Email Preview</p>
                  <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
                  <p className="text-sm text-gray-600">{section.description}</p>
                </header>

                <dl className="space-y-3 rounded-lg bg-gray-50 p-4 text-sm text-gray-800">
                  {section.items.map((item) => (
                    <div key={item.label} className="grid gap-1 sm:grid-cols-[120px,1fr] sm:items-start">
                      <dt className="font-semibold text-gray-700">{item.label}</dt>
                      <dd className="text-gray-900">{item.value}</dd>
                    </div>
                  ))}
                </dl>

                <div className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-900">
                  <p className="font-semibold">補足とヒント</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    {section.notes.map((note) => (
                      <li key={note}>{note}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>

          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Need Help?</p>
                <h3 className="text-lg font-bold text-gray-900">決済内容が見当たらない場合</h3>
                <p className="mt-1 text-sm text-gray-700">
                  マイページの「決済情報を確認」ボタンから、最新の決済メールと同じ内容を表示できます。
                  それでも見つからないときは、お手数ですがサポートまでご連絡ください。
                </p>
              </div>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-800 transition hover:border-sky-300 hover:bg-sky-100"
              >
                サポートに問い合わせる
              </Link>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
