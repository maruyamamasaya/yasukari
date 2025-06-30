import Head from "next/head";
import Link from "next/link";
import { GetStaticProps } from "next";
import { getBikeModels, BikeModel } from "../../lib/bikes";

interface Props {
  bikes: BikeModel[];
}

export default function AllProductsPage({ bikes }: Props) {
  return (
    <>
      <Head>
        <title>全ての機種一覧 - yasukari</title>
      </Head>
      <main className="p-6">
        <h1 className="text-lg font-semibold mb-4 text-center">全ての機種一覧</h1>
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
          {bikes.map((bike) => (
            <Link key={bike.modelCode} href={`/products/${bike.modelCode}`}>
              <div className="bg-white rounded shadow-sm p-2 hover:bg-gray-50 transition text-center">
                <img
                  src={bike.img}
                  alt={bike.modelName}
                  className="w-full h-36 object-cover rounded mb-2"
                />
                <div className="text-sm truncate">{bike.modelName}</div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const bikes = await getBikeModels();
  return { props: { bikes } };
};
