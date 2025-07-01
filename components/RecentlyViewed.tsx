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
    <section className="my-6">
      <h2 className="text-lg font-semibold mb-2">最近チェックした商品</h2>
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        {bikes.map((b) => (
          <Link key={b.modelCode} href={`/products/${b.modelCode}`}>
            <div className="bg-white rounded shadow-sm p-2 hover:bg-gray-50 transition text-center">
              <img
                src={b.img}
                alt={b.modelName}
                className="w-full h-28 object-cover rounded mb-1"
              />
              <div className="text-sm truncate">{b.modelName}</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
