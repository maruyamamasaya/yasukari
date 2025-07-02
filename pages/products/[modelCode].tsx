import { GetStaticProps, GetStaticPaths } from "next";
import Head from "next/head";
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
      if (list.length > 6) list.length = 6;
      localStorage.setItem("recentBikes", JSON.stringify(list));
    } catch {
      // ignore write errors
    }
  }, [bike]);

  return (
    <> 
      <Head>
        <title>{bike.modelName} - yasukari</title>
      </Head>
      <main className="p-6">
        <h1 className="text-lg font-semibold mb-4">{bike.modelName}</h1>
        <img
          src={bike.img}
          alt={bike.modelName}
          className="w-full max-w-md object-cover mx-auto mb-4"
        />
        {bike.description && <p>{bike.description}</p>}
        {bike.spec && (
          <table className="mt-4 text-sm border-collapse">
            <tbody>
              {Object.entries(bike.spec).map(([key, value]) => (
                <tr key={key}>
                  <th className="pr-4 text-gray-500 text-left">
                    {specLabels[key as keyof BikeSpec]}
                  </th>
                  <td>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <RecentlyViewed />
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
