import React, { useMemo, useState } from "react";
import Link from "next/link";
import { BikeModel } from "../lib/bikes";
import SectionHeading from "./SectionHeading";

const categories = [
  { label: "401cc以上", value: 0 },
  { label: "251〜400cc", value: 1 },
  { label: "126〜250cc", value: 2 },
  { label: "51〜125cc", value: 3 },
  { label: "50cc以下", value: 4 },
];

function parseDisplacement(bike: BikeModel): number | null {
  const text = bike.spec?.displacement || bike.description;
  if (!text) return null;
  const m = text.match(/([0-9]+)cm/);
  return m ? parseInt(m[1], 10) : null;
}

function getCategory(cc: number | null): number {
  if (cc === null) return 2;
  if (cc <= 50) return 4;
  if (cc <= 125) return 3;
  if (cc <= 250) return 2;
  if (cc <= 400) return 1;
  return 0;
}

export default function BikeLineup({ bikes }: { bikes: BikeModel[] }) {
  const [filter, setFilter] = useState<number>(2);

  const filtered = useMemo(
    () => bikes.filter((b) => getCategory(parseDisplacement(b)) === filter),
    [bikes, filter]
  );

  const displayList = filtered.slice(0, 6);

  return (
    <section className="section-surface section-padding">
      <SectionHeading
        eyebrow="Bike Lineup"
        title="排気量から人気モデルをチェック"
        description="経験値別にセレクトされた多彩なラインアップ。初心者向けのコンパクトスクーターから、ロングツーリングで頼れる大型ネイキッドまで、好みに合わせて最適な1台が見つかります。"
      />

      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        {categories.map((c) => {
          const active = filter === c.value;
          return (
            <button
              key={c.value}
              type="button"
              onClick={() => setFilter(c.value)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                active
                  ? "bg-red-500 text-white shadow-lg shadow-red-200/60"
                  : "bg-white/70 text-slate-600 hover:bg-white/90 border border-white/60"
              }`}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {displayList.map((bike) => (
          <article
            key={bike.modelCode}
            className="group relative overflow-hidden rounded-2xl border border-white/60 bg-white/80 shadow-[0_28px_42px_-30px_rgba(15,23,42,0.6)] transition-transform duration-200 hover:-translate-y-1 hover:shadow-[0_32px_56px_-28px_rgba(220,38,38,0.4)]"
          >
            <Link href={`/products/${bike.modelCode}`} className="flex h-full flex-col">
              <div className="relative overflow-hidden">
                <img
                  src={bike.img}
                  alt={bike.modelName}
                  className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {bike.badge ? (
                  <span className="absolute left-4 top-4 inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-red-500 shadow">{bike.badge}</span>
                ) : null}
              </div>
              <div className="flex flex-1 flex-col gap-3 px-5 pb-5 pt-4">
                <h3
                  className="text-base font-semibold text-slate-800"
                  dangerouslySetInnerHTML={{ __html: bike.modelName.replace(/\\n/g, "<br>") }}
                />
                <p className="text-sm text-slate-500">
                  整備済み &amp; 24時間予約対応。用途や体格に合わせたフィット感で、週末のツーリングも安心です。
                </p>
                <span className="text-sm font-semibold text-red-500">
                  詳細を見る →
                </span>
              </div>
            </Link>
          </article>
        ))}
      </div>

      {filtered.length > displayList.length ? (
        <div className="mt-8 text-center">
          <Link href="/products" className="btn-primary">
            排気量別一覧を見る
          </Link>
        </div>
      ) : null}
    </section>
  );
}
