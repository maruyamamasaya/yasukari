import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  getBikeModels,
  BikeModel,
  BikeSpec,
  getBikeClasses,
  getVehiclesByModel,
  BikeVehicle,
} from "../../lib/bikes";
import { readVehicleRentalPrices } from "../../lib/server/vehicleRentalPrices";
import RecentlyViewed from "../../components/RecentlyViewed";

interface Props {
  bike: BikeModel;
  className?: string;
  vehicles: BikeVehicle[];
  priceGuide: Partial<Record<DurationKey, string>>;
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

const durationDays = {
  "24h": 1,
  "2d": 2,
  "1w": 7,
  "2w": 14,
  "1m": 31,
} as const;

type DurationKey = keyof typeof durationDays;

export default function ProductDetailPage({
  bike,
  className,
  vehicles,
  priceGuide,
}: Props) {
  const [selectedVehicle, setSelectedVehicle] = useState<string>(
    vehicles[0]?.managementNumber ?? ""
  );

  const vehicleOptions = useMemo(
    () =>
      vehicles.map((vehicle) => ({
        value: vehicle.managementNumber,
        label: vehicle.managementNumber,
        storeId: vehicle.storeId,
      })),
    [vehicles]
  );

  const hasStock = vehicleOptions.length > 0;
  const showPrice = Boolean(bike.price24h);

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

  const selectedVehicleStore = useMemo(
    () => vehicleOptions.find((option) => option.value === selectedVehicle)?.storeId,
    [selectedVehicle, vehicleOptions]
  );

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
            <div className="lg:grid lg:grid-cols-[1.1fr_0.9fr]">
              <div className="relative h-72 sm:h-96 lg:aspect-[4/3] lg:h-auto">
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
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                      {bike.modelName}
                    </h1>
                    {className ? (
                      <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                        {className}
                      </span>
                    ) : null}
                  </div>
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
                  <div className="space-y-4">
                    {showPrice ? (
                      <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-red-50 to-white p-4 shadow-sm">
                        <p className="text-3xl font-bold text-gray-900">{bike.price24h}</p>
                      </div>
                    ) : null}
                    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-900">在庫の選択</p>
                        <span className="text-xs text-gray-500">{vehicles.length}件</span>
                      </div>
                      <select
                        value={selectedVehicle}
                        onChange={(e) => setSelectedVehicle(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-red-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100"
                        disabled={vehicleOptions.length === 0}
                      >
                        {vehicleOptions.length === 0 ? (
                          <option value="" disabled>
                            在庫がありません
                          </option>
                        ) : (
                          <>
                            <option value="" disabled>
                              管理番号を選択してください
                            </option>
                            {vehicleOptions.map((vehicle) => (
                              <option key={vehicle.value} value={vehicle.value}>
                                {vehicle.label}
                              </option>
                            ))}
                          </>
                        )}
                      </select>
                      {selectedVehicleStore ? (
                        <p className="text-xs text-gray-600">
                          紐づく店舗ID: <span className="font-semibold">{selectedVehicleStore}</span>
                        </p>
                      ) : null}
                      {hasStock ? (
                        <Link
                          href={`/reserve/models/${selectedVehicle}`}
                          className="inline-flex w-full items-center justify-center rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-red-600 transition"
                        >
                          この車種をレンタル予約する
                        </Link>
                      ) : (
                        <button
                          className="inline-flex w-full items-center justify-center rounded-lg bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-500 shadow cursor-not-allowed"
                          disabled
                          aria-disabled="true"
                        >
                          在庫がありません
                        </button>
                      )}
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
                  <div className="space-y-4 w-full">
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

                    <div className="rounded-2xl bg-gradient-to-br from-red-50 via-red-100 to-red-200 p-6 text-red-900 shadow-md">
                      <h3 className="text-lg font-semibold">安心のサポート</h3>
                      <p className="mt-2 text-sm leading-relaxed text-red-900/80">
                        ヘルメットや装備のレンタル、万が一のトラブル対応など、お客様の快適なツーリングをサポートします。
                      </p>
                      <Link
                        href="/insurance"
                        className="group mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-red-700 shadow-md ring-1 ring-red-200 transition duration-200 hover:-translate-y-0.5 hover:bg-red-50 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
                      >
                        サポート内容を確認
                        <span
                          aria-hidden
                          className="translate-x-0 text-base transition duration-200 group-hover:translate-x-0.5"
                        >
                          →
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="space-y-4">
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
                    { label: "24時間", value: priceGuide["24h"] ?? "お問い合わせ" },
                    { label: "2日間", value: priceGuide["2d"] ?? "お問い合わせ" },
                    { label: "1週間", value: priceGuide["1w"] ?? "お問い合わせ" },
                    { label: "2週間", value: priceGuide["2w"] ?? "お問い合わせ" },
                    { label: "1ヶ月", value: priceGuide["1m"] ?? "お問い合わせ" },
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
          </section>

          <RecentlyViewed />
        </div>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ params }) => {
  const modelCode = params?.modelCode as string | undefined;
  if (!modelCode) return { notFound: true };

  const [bikes, classes] = await Promise.all([getBikeModels(), getBikeClasses()]);
  const bike = bikes.find((b) => b.modelCode === modelCode);

  if (!bike) {
    return { notFound: true };
  }

  const [className, vehicles, rentalPrices] = await Promise.all([
    Promise.resolve(classes.find((cls) => cls.classId === bike.classId)?.className),
    bike.modelId != null ? getVehiclesByModel(bike.modelId) : Promise.resolve([]),
    bike.modelId != null ? readVehicleRentalPrices(bike.modelId) : Promise.resolve([]),
  ]);

  const rentalPriceMap = rentalPrices.reduce<Record<number, number>>((acc, record) => {
    acc[record.days] = record.price;
    return acc;
  }, {});

  const priceGuide = (Object.entries(durationDays) as [DurationKey, number][])
    .map(([key, days]) => {
      const price = rentalPriceMap[days];
      if (typeof price === "number") {
        return [key, `${price.toLocaleString()}円`] as [DurationKey, string];
      }
      if (key === "24h" && bike.price24h) {
        return [key, bike.price24h] as [DurationKey, string];
      }
      return null;
    })
    .filter((entry): entry is [DurationKey, string] => Boolean(entry))
    .reduce<Partial<Record<DurationKey, string>>>((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});

  return {
    props: {
      bike,
      className: className ?? undefined,
      vehicles,
      priceGuide,
    },
  };
};
