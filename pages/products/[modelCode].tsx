import { GetStaticProps, GetStaticPaths } from "next";
import Head from "next/head";
import Link from "next/link";
import { useEffect } from "react";
import { getBikeModels, BikeModel, BikeSpec } from "../../lib/bikes";
import RecentlyViewed from "../../components/RecentlyViewed";

interface Props {
  bike: BikeModel;
}

const specLabels: Record<keyof BikeSpec, string> = {
  license: "必要免許",
  capacity: "乗車定員",
  length: "全長",
  width: "全幅",
  height: "全高",
  seatHeight: "シート高",
  weight: "車両重量",
  tank: "タンク容量",
  fuel: "使用燃料",
  output: "最高出力",
  displacement: "排気量",
  torque: "最大トルク",
};

export default function ProductDetailPage({ bike }: Props) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem("recentBikes");
      const list: BikeModel[] = stored ? JSON.parse(stored) : [];
      const existingIndex = list.findIndex((b) => b.modelCode === bike.modelCode);
      if (existingIndex !== -1) list.splice(existingIndex, 1);
      list.unshift(bike);
      if (list.length > 5) list.length = 5;
      localStorage.setItem("recentBikes", JSON.stringify(list));
    } catch {
      // ignore write errors
    }
  }, [bike]);

  const specEntries = Object.entries(bike.spec ?? {}).filter(
    ([, value]) => Boolean(value)
  );

  const tagItems = [...(bike.tags ?? []), bike.badge].filter(Boolean) as string[];

  return (
    <>
      <Head>
        <title>{bike.modelName} - yasukari</title>
      </Head>
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
          <nav className="text-sm text-gray-500" aria-label="Breadcrumb">
            <ol className="flex items-center gap-2">
              <li>
                <Link href="/" className="hover:text-red-500 font-medium">
                  ホーム
                </Link>
              </li>
              <li className="text-gray-300">/</li>
              <li>
                <Link
                  href="/products"
                  className="hover:text-red-500 font-medium"
                >
                  車種・料金
                </Link>
              </li>
              <li className="text-gray-300">/</li>
              <li className="text-gray-900 font-semibold" aria-current="page">
                {bike.modelName}
              </li>
            </ol>
          </nav>

          <section className="bg-white shadow-md rounded-2xl overflow-hidden ring-1 ring-gray-100">
            <div className="lg:grid lg:grid-cols-2">
              <div className="relative h-72 sm:h-96 lg:h-full">
                <img
                  src={bike.img}
                  alt={bike.modelName}
                  className="w-full h-full object-cover"
                />
                {bike.badge && (
                  <span className="absolute top-4 left-4 inline-flex items-center rounded-full bg-red-500/90 px-3 py-1 text-xs font-semibold text-white shadow">
                    {bike.badge}
                  </span>
                )}
              </div>

              <div className="p-6 lg:p-8 flex flex-col gap-6 justify-center">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-red-500">
                    model detail
                  </p>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {bike.modelName}
                  </h1>
                  <p className="text-gray-700 leading-relaxed">
                    {bike.description || "ヤスカリで人気のモデルです。スペックや料金の詳細は以下をご覧ください。"}
                  </p>
                </div>

                {tagItems.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tagItems.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-red-50 to-white p-4 shadow-sm">
                    <p className="text-sm text-gray-500">24時間の基本料金</p>
                    <p className="mt-2 text-2xl font-bold text-gray-900">
                      {bike.price24h || "料金はお問い合わせください"}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      料金は店舗・シーズンにより異なる場合があります。
                    </p>
                    <Link
                      href={`/reserve/models/${bike.modelCode}`}
                      className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-red-600 transition"
                    >
                      この車種をレンタル予約する
                    </Link>
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm flex flex-col gap-2">
                    <p className="text-sm font-semibold text-gray-900">予約・お問い合わせ</p>
                    <p className="text-xs text-gray-600">
                      料金プランや空き状況はお気軽にお問い合わせください。
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      <Link
                        href="/pricing"
                        className="inline-flex items-center justify-center rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-red-600 transition"
                      >
                        料金プランを見る
                      </Link>
                      <Link
                        href="/contact"
                        className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-gray-300 transition"
                      >
                        お問い合わせ
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">スペック</h2>
                <span className="text-xs font-medium text-gray-500">Spec</span>
              </div>
              <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 p-6">
                {specEntries.length > 0 ? (
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                    {specEntries.map(([key, value]) => (
                      <div
                        key={key}
                        className="flex flex-col gap-1 rounded-lg bg-gray-50 px-4 py-3"
                      >
                        <dt className="text-xs font-semibold text-gray-500">
                          {specLabels[key as keyof BikeSpec]}
                        </dt>
                        <dd className="text-sm font-medium text-gray-900">{value}</dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className="text-sm text-gray-600">
                    詳細なスペック情報は準備中です。お問い合わせいただければスタッフがご案内いたします。
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">料金の目安</h2>
                  <span className="text-xs font-medium text-gray-500">Price Guide</span>
                </div>
                <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 p-6 space-y-3">
                  <p className="text-sm text-gray-700">
                    24時間料金を基準に、長期レンタルほどお得になる料金プランをご用意しています。詳しい料金は店舗までお問い合わせください。
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                    {[
                      { label: "24時間", value: bike.price24h || "-" },
                      { label: "2日間", value: "お問い合わせ" },
                      { label: "1週間", value: "お問い合わせ" },
                      { label: "2週間", value: "お問い合わせ" },
                      { label: "1ヶ月", value: "お問い合わせ" },
                      { label: "補償プラン", value: "加入可能" },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-3 text-center"
                      >
                        <div className="text-xs font-semibold text-gray-500">
                          {item.label}
                        </div>
                        <div className="mt-1 text-base font-bold text-gray-900">
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <aside className="space-y-4">
              <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">取扱店舗</h3>
                  <span className="text-xs font-medium text-gray-500">Stores</span>
                </div>
                {bike.stores && bike.stores.length > 0 ? (
                  <ul className="space-y-2 text-sm text-gray-800">
                    {bike.stores.map((store) => (
                      <li
                        key={store}
                        className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2"
                      >
                        <span className="h-2 w-2 rounded-full bg-red-500" aria-hidden />
                        <span>{store}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-600">
                    店舗在庫は変動します。最寄りの店舗までお問い合わせください。
                  </p>
                )}
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-red-500 to-red-600 p-6 text-white shadow-md">
                <h3 className="text-lg font-semibold">安心のサポート</h3>
                <p className="mt-2 text-sm text-red-50 leading-relaxed">
                  ヘルメットや装備のレンタル、万が一のトラブル対応など、お客様の快適なツーリングをサポートします。
                </p>
                <Link
                  href="/help"
                  className="mt-4 inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-red-600 shadow hover:bg-red-50 transition"
                >
                  サポート内容を確認
                </Link>
              </div>
            </aside>
          </section>

          <RecentlyViewed />
        </div>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const bikes = await getBikeModels();
  return {
    paths: bikes.map((b) => ({ params: { modelCode: b.modelCode } })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const bikes = await getBikeModels();
  const bike = bikes.find((b) => b.modelCode === params?.modelCode) as BikeModel;
  return { props: { bike } };
};
