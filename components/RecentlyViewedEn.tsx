import React, { useEffect, useState } from "react";
import Link from "next/link";
import { BikeModel } from "../lib/bikes";
import SectionHeading from "./SectionHeading";

export default function RecentlyViewedEn() {
  const [bikes, setBikes] = useState<BikeModel[]>([]);
  const [visibleCount, setVisibleCount] = useState(3);

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

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(max-width: 640px)");
    const handleChange = () => setVisibleCount(mediaQuery.matches ? 1 : 3);

    handleChange();
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  if (bikes.length === 0) return null;

  return (
    <section className="section-surface section-padding">
      <SectionHeading
        eyebrow="Recently Viewed"
        title="Your browsing history"
        description="Quickly revisit bikes you checked earlier and compare specs without searching again."
      />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {bikes.slice(0, visibleCount).map((bike) => (
          <article
            key={bike.modelCode}
            className="group overflow-hidden rounded-2xl border border-white/60 bg-white/80 shadow-[0_28px_42px_-30px_rgba(15,23,42,0.6)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_36px_62px_-34px_rgba(220,38,38,0.45)]"
          >
            <Link href={`/products/${bike.modelCode}`} className="flex h-full flex-col">
              <div className="relative h-44 overflow-hidden">
                <img
                  src={bike.img}
                  alt={bike.modelName}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col gap-3 px-5 pb-5 pt-4">
                <h3
                  className="text-base font-semibold text-slate-800"
                  dangerouslySetInnerHTML={{ __html: bike.modelName.replace(/\\n/g, "<br>") }}
                />
                <span className="text-sm font-semibold text-red-500">View details →</span>
              </div>
            </Link>
          </article>
        ))}
        {bikes.length > visibleCount ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-red-200 bg-red-50/60 p-6 text-center text-sm text-red-600">
            <p className="font-semibold">See the full history</p>
            <Link href="/products" className="btn-primary">
              Explore more
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
