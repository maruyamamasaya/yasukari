import Head from 'next/head';
import Link from 'next/link';

const steps = [
  {
    title: '01. ご予約について',
    description:
      '各車両ページより、スケジュールを確認しご予約ください。※18歳未満のお客様はご利用出来ません。',
    points: [
      '予約可能時間：ご利用予定日90日前から前営業日17時まで',
      'お支払い方法：クレジットカード払い',
    ],
    note: (
      <>
        ご予約内容の変更や日程変更の際は、
        <Link href="/contact" className="text-red-600 underline">
          お問合せ
        </Link>
        からご連絡の上、再度ご予約ください。
      </>
    ),
    extra: (
      <>
        キャンセルは
        <Link href="/contact" className="text-red-600 underline">
          お問合せ
        </Link>
        よりご連絡ください。4日前まで無料、3日前〜当日はレンタル料金の50％を頂戴します。
      </>
    ),
  },
  {
    title: '02. ご来店',
    description:
      'ご来店時は下記をお持ちください。オプションでヘルメットをお申込みでないお客様はヘルメットをお持ちください。',
    points: ['免許書', 'ヘルメット'],
    note: 'ご予約日の10時から18時30分の間にお越しください。(手続きに時間がかかる為)',
    extra:
      'ヤスカリはリバイクルK-JETが運営しております。ご来店の際はリバイクルK-JETのスタッフまでお声かけ下さい。',
  },
  {
    title: '03. ご利用',
    description: '安全にご利用いただくためのご案内です。',
    points: [
      '契約者様以外の貸し出し、返却はお受けできませんので必ずご本人が時間内にご来店ください。',
      'ご契約者様以外の運転は不可です。(法人名でのお貸し出しの場合は可能ですのでご相談ください)',
      '駐車違反になった際は『放置車両確認標章』が貼られたら記載してある警察署に出頭して反則金をお支払い下さい。その後、必ず当店までお電話でご連絡いただき、バイク返却時に反則金の領収書をご提示ください。確認できない場合は駐車違反1件ごとに2万円お支払いしていただきます。',
    ],
  },
  {
    title: '04. ご返却',
    description: 'ご返却時のご案内です。',
    points: [
      'ご返却日の10時から18時30分の間にお越しください。(手続きに時間がかかる為)',
      '返却時にガソリンが満タンでない場合は、当社規定の費用をいただきます。',
      '原付 3000円 / 原付二種・ジャイロキャノピー 5000円 / それ以上 5000円',
    ],
  },
];

export default function BeginnerGuidePage() {
  return (
    <div className="bg-slate-50 text-slate-800">
      <Head>
        <title>はじめてガイド - yasukari</title>
      </Head>

      <section className="relative overflow-hidden">
        <img
          src="https://yasukari.com/static/images/guide/barner.jpg"
          alt="はじめてガイドバナー"
          className="h-[280px] w-full object-cover sm:h-[360px]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/70 via-slate-900/40 to-transparent" />
        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto w-full max-w-5xl px-6">
            <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white">
              Beginner Guide
            </span>
            <h1 className="mt-4 text-3xl font-bold text-white sm:text-4xl">はじめてガイド</h1>
            <p className="mt-3 max-w-xl text-sm text-white/90 sm:text-base">
              ご予約から返却までの流れを、ステップごとにわかりやすくまとめました。
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/pricing"
                className="rounded-full bg-white px-5 py-2 text-xs font-semibold text-slate-900 shadow-sm transition hover:bg-slate-100"
              >
                料金を見る
              </Link>
              <Link
                href="/contact"
                className="rounded-full border border-white/60 px-5 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
              >
                お問い合わせ
              </Link>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-10">
        <section className="grid gap-4 sm:grid-cols-3">
          {[
            {
              title: '受付時間',
              description: 'ご利用予定日90日前から前営業日17時まで',
            },
            { title: 'お支払い', description: 'クレジットカード払いのみ対応' },
            { title: '対象年齢', description: '18歳以上の方がご利用可能' },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-white bg-white p-5 text-sm shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                {item.title}
              </p>
              <p className="mt-3 text-sm font-medium text-slate-900">
                {item.description}
              </p>
            </div>
          ))}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-500">
                Steps
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">ご利用の流れ</h2>
            </div>
            <p className="text-sm text-slate-500">初めての方でも安心して進められます。</p>
          </div>

          <div className="space-y-6">
            {steps.map((step) => (
              <div
                key={step.title}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-5 sm:p-6"
              >
                <h3 className="text-lg font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{step.description}</p>
                <ul className="mt-4 space-y-2 text-sm text-slate-700">
                  {step.points.map((point) => (
                    <li key={point} className="flex gap-2">
                      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                {step.note ? (
                  <p className="mt-4 text-sm text-slate-600">{step.note}</p>
                ) : null}
                {step.extra ? (
                  <p className="mt-2 text-sm text-slate-600">{step.extra}</p>
                ) : null}

                {step.title.startsWith('03') ? (
                  <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                    <h4 className="text-sm font-semibold text-slate-900">走行距離の目安</h4>
                    <p className="mt-2 text-sm text-slate-600">
                      目安以上の距離を走行するためには整備が必要な場合があります。バイクを安全に乗るためには、オイル交換と整備が必要です。目安以上の距離を走行する場合、メンテナンスが必要な際にメンテナンスを怠り車両に故障や損害が発生した場合は、車両の時価額を請求いたします。
                    </p>
                    <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
                      <table className="w-full text-center text-xs">
                        <thead className="bg-slate-100 text-slate-600">
                          <tr>
                            <th className="border border-slate-200 px-2 py-2">クラス</th>
                            <th className="border border-slate-200 px-2 py-2">1日</th>
                            <th className="border border-slate-200 px-2 py-2">3日</th>
                            <th className="border border-slate-200 px-2 py-2">2週間</th>
                            <th className="border border-slate-200 px-2 py-2">1カ月</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white">
                          <tr>
                            <th className="border border-slate-200 px-2 py-2 text-left font-medium">
                              原付
                            </th>
                            <td className="border border-slate-200 px-2 py-2">200km</td>
                            <td className="border border-slate-200 px-2 py-2">600km</td>
                            <td className="border border-slate-200 px-2 py-2">800km</td>
                            <td className="border border-slate-200 px-2 py-2">一度持ち込みで+800km</td>
                          </tr>
                          <tr>
                            <th className="border border-slate-200 px-2 py-2 text-left font-medium">
                              125cc以下
                            </th>
                            <td className="border border-slate-200 px-2 py-2">300km</td>
                            <td className="border border-slate-200 px-2 py-2">800km</td>
                            <td className="border border-slate-200 px-2 py-2">1000km</td>
                            <td className="border border-slate-200 px-2 py-2">一度持ち込みで+1000km</td>
                          </tr>
                          <tr>
                            <th className="border border-slate-200 px-2 py-2 text-left font-medium">
                              126cc~
                            </th>
                            <td className="border border-slate-200 px-2 py-2">500km</td>
                            <td className="border border-slate-200 px-2 py-2">1000km</td>
                            <td className="border border-slate-200 px-2 py-2">1500km</td>
                            <td className="border border-slate-200 px-2 py-2">-</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <p className="mt-4 text-sm text-slate-600">
                      走行中の不具合については営業時間内に契約店舗へご連絡ください。営業時間外に走行不可能になった場合は、ロードサービスをご利用ください。
                    </p>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl bg-slate-900 px-6 py-8 text-white sm:px-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">
                Contact
              </p>
              <h2 className="mt-2 text-2xl font-bold">ご不明点はお気軽に</h2>
              <p className="mt-2 text-sm text-white/80">
                予約やご利用に関するご相談はスタッフが丁寧にサポートします。
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-100"
            >
              お問い合わせはこちら
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
