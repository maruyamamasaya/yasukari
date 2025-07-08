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
    <section className="bike-lineup my-5">
      <h2 className="bike-lineup-title">最近チェックした商品</h2>
      <div className="bike-lineup-scroll">
        <div className="bike-lineup-list">
          {bikes.slice(0, 7).map((b) => (
            <div key={b.modelCode} className="bike-lineup-card">
              <Link href={`/products/${b.modelCode}`}>
                <img src={b.img} alt={b.modelName} className="bike-lineup-image" />
                <div className="bike-lineup-info">
                  <h3 className="bike-lineup-name truncate" dangerouslySetInnerHTML={{ __html: b.modelName.replace(/\\n/g, '<br>') }} />
                </div>
              </Link>
            </div>
          ))}
          {bikes.length > 7 && (
            <div className="bike-lineup-card">
              <Link href="/products" className="flex items-center justify-center w-full h-full text-sm font-semibold text-red-600">
                もっと見る
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
