import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { GetStaticPaths, GetStaticProps } from "next";
import { BikeModel, getBikeModels } from "../../../lib/bikes";

interface Props {
  bike: BikeModel;
}

export default function ReserveModelPage({ bike }: Props) {
  const [store, setStore] = useState("");
  const [pickup, setPickup] = useState("");
  const [returnDate, setReturnDate] = useState("");

  const storeOptions = bike.stores ?? [];

  return (
    <>
      <Head>
        <title>{bike.modelName}の予約 - yasukari</title>
      </Head>
      <main className="min-h-screen bg-gray-50 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          <nav className="text-sm text-gray-500" aria-label="Breadcrumb">
            <ol className="flex items-center gap-2">
              <li>
                <Link href="/" className="hover:text-red-500 font-medium">
                  ホーム
                </Link>
              </li>
              <li className="text-gray-300">/</li>
              <li>
                <Link href="/products" className="hover:text-red-500 font-medium">
                  車種・料金
                </Link>
              </li>
              <li className="text-gray-300">/</li>
              <li>
                <Link
                  href={`/products/${bike.modelCode}`}
                  className="hover:text-red-500 font-medium"
                >
                  {bike.modelName}
                </Link>
              </li>
              <li className="text-gray-300">/</li>
              <li className="text-gray-900 font-semibold" aria-current="page">
                店舗・日時の選択
              </li>
            </ol>
          </nav>

          <header className="bg-white shadow-sm ring-1 ring-gray-100 rounded-2xl p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-wide text-red-500">
              Reservation
            </p>
            <h1 className="mt-2 text-2xl font-bold text-gray-900">店舗・日時の選択</h1>
            <p className="mt-2 text-gray-700">
              {bike.modelName} の予約リクエストです。店舗と日時を選択してお進みください。
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="#"
                className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-black transition"
              >
                車種の空き状況を見る
              </Link>
              <Link
                href={`/products/${bike.modelCode}`}
                className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-gray-300 transition"
              >
                車種ページに戻る
              </Link>
            </div>
          </header>

          <section className="bg-white shadow-sm ring-1 ring-gray-100 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Model
                </p>
                <p className="text-lg font-bold text-gray-900">{bike.modelName}</p>
                <p className="text-sm text-gray-600">モデルコード：{bike.modelCode}</p>
              </div>
              <img
                src={bike.img}
                alt={bike.modelName}
                className="h-20 w-32 object-cover rounded-lg ring-1 ring-gray-100"
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900" htmlFor="store">
                  店舗の選択
                </label>
                <p className="text-xs text-gray-500">店舗を選択してください</p>
                <select
                  id="store"
                  value={store}
                  onChange={(e) => setStore(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-red-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100"
                  disabled={storeOptions.length === 0}
                >
                  {storeOptions.length === 0 ? (
                    <option value="" disabled>
                      取扱店舗の準備中です
                    </option>
                  ) : (
                    <>
                      <option value="" disabled>
                        店舗を選択してください
                      </option>
                      {storeOptions.map((storeName) => (
                        <option key={storeName} value={storeName}>
                          {storeName}
                        </option>
                      ))}
                    </>
                  )}
                </select>
                <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-700 leading-relaxed">
                  三ノ輪店は無人店の為、詳しい操作の説明ができません。
                  <br />
                  バイクの操作に不安のある方、日本語での説明に不安がある方は、
                  <Link
                    href="/stores#adachi"
                    className="ml-1 font-semibold text-red-600 hover:underline"
                  >
                    足立小台本店の利用をお願いします。
                  </Link>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-900" htmlFor="pickup">
                    出発日時
                  </label>
                  <input
                    id="pickup"
                    type="datetime-local"
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm shadow-sm focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-900" htmlFor="return">
                    返却予定日時
                  </label>
                  <input
                    id="return"
                    type="datetime-local"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm shadow-sm focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-gray-600">
                フォーム送信後、スタッフが空き状況を確認し、メールにてご連絡いたします。
              </p>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-lg bg-red-500 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-red-600 transition"
              >
                予約内容を確認する
              </button>
            </div>
          </section>
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
