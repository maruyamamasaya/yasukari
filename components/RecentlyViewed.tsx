import React, { useEffect, useState } from "react";
import Link from "next/link";
import { BikeModel } from "../lib/bikes";

export default function RecentlyViewed() {
  const [bikes, setBikes] = useState<BikeModel[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem("recentBikes");
      if (stored) {
        setBikes(JSON.parse(stored));
      }
    } catch {
      // ignore parsing errors
    }
  }, []);

  if (bikes.length === 0) return null;

  return (
    <section className="my-6 px-4">
      <h2 className="text-lg font-semibold mb-2">最近チェックした商品</h2>
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
        {bikes.slice(0, 4).map((b) => (
          <Link key={b.modelCode} href={`/products/${b.modelCode}`}
            className="block">
            <div className="relative overflow-hidden rounded shadow-sm hover:bg-gray-50 transition aspect-square">
              <img
                src={b.img}
                alt={b.modelName}
                className="object-cover w-full h-full"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs py-1 px-1 truncate text-center">
                {b.modelName}
              </div>
            </div>
          </Link>
        ))}
        {bikes.length > 4 && (
          <Link href="/products" className="block">
            <div className="flex items-center justify-center rounded shadow-sm hover:bg-gray-50 transition aspect-square bg-white text-sm font-semibold text-red-600">
              もっと見る
            </div>
          </Link>
        )}
      </div>
    </section>
  );
}
