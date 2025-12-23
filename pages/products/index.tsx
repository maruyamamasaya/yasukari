import Head from "next/head";
import Link from "next/link";
import { GetServerSideProps } from "next";
import { useMemo, useState } from "react";
import { getBikeModels, BikeModel, BikeClass, getBikeClasses } from "../../lib/bikes";
import RecentlyViewed from "../../components/RecentlyViewed";

interface Props {
  bikes: BikeModel[];
  classes: BikeClass[];
}

export default function AllProductsPage({ bikes, classes }: Props) {
  const [selectedClass, setSelectedClass] = useState<number | "all">("all");

  const classLabelMap = useMemo(
    () => new Map(classes.map((cls) => [cls.classId, cls.className])),
    [classes]
  );

  const filteredBikes = useMemo(
    () =>
      bikes.filter((bike) => {
        if (selectedClass === "all") return true;
        return bike.classId === selectedClass;
      }),
    [bikes, selectedClass]
  );

  return (
    <>
      <Head>
        <title>全ての車種一覧 - yasukari</title>
      </Head>
      <main className="p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-red-500">
              lineup
            </p>
            <h1 className="text-2xl font-bold">全ての車種一覧</h1>
            <p className="text-sm text-gray-600">
              DynamoDBに登録された最新の車種データを表示しています。
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-gray-700">
              {filteredBikes.length} 件 / 全 {bikes.length} 件
            </div>
            {classes.length > 0 ? (
              <label className="flex items-center gap-3 text-sm text-gray-700">
                <span className="font-semibold">クラスで絞り込む</span>
                <select
                  value={selectedClass}
                  onChange={(e) =>
                    setSelectedClass(
                      e.target.value === "all" ? "all" : Number(e.target.value)
                    )
                  }
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm focus:border-red-500 focus:outline-none"
                >
                  <option value="all">すべて</option>
                  {classes.map((cls) => (
                    <option key={cls.classId} value={cls.classId}>
                      {cls.className}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
          </div>

          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
            {filteredBikes.map((bike) => (
              <Link key={bike.modelCode} href={`/products/${bike.modelCode}`}>
                <div className="bg-white rounded-xl shadow-sm p-2 hover:-translate-y-0.5 hover:shadow-md transition text-center border border-gray-100">
                  <div className="relative">
                    <img
                      src={bike.img}
                      alt={bike.modelName}
                      className="w-full h-36 object-cover rounded-lg mb-2"
                    />
                    {bike.classId && classLabelMap.has(bike.classId) ? (
                      <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold text-red-500 shadow">
                        {classLabelMap.get(bike.classId)}
                      </span>
                    ) : null}
                  </div>
                  <div className="text-sm font-semibold truncate">{bike.modelName}</div>
                  {bike.description ? (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{bike.description}</p>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        </div>
        <RecentlyViewed />
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const [bikes, classes] = await Promise.all([getBikeModels(), getBikeClasses()]);
  return { props: { bikes, classes } };
};
