import React from "react";
import Link from "next/link";
import SectionHeading from "./SectionHeading";

export type BikeItem = {
  modelName: string;
  modelCode: string;
  img: string;
  badge?: string;
  price24h?: string;
};

type Props = {
  items: BikeItem[];
  title?: string;
  subtitle?: string;
};

export default function BikeModelCarousel({
  items,
  title = "POPULAR MODELS",
  subtitle = "人気の型番",
}: Props) {
  const description = `${
    subtitle ?? "人気の型番"
  }。乗り心地、スタイル、コストのバランスが整った人気車種をピックアップ。初めてのレンタルにも安心しておすすめできるモデルたちです。`;
  return (
    <section className="section-surface section-padding">
      <SectionHeading
        eyebrow={title}
        title="ライダーに選ばれる定番モデル"
        description={description}
      />
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {items.slice(0, 6).map((item) => (
          <article
            key={item.modelCode}
            className="group overflow-hidden rounded-2xl border border-white/60 bg-white/80 shadow-[0_28px_42px_-30px_rgba(15,23,42,0.6)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_32px_54px_-30px_rgba(220,38,38,0.45)]"
          >
            <Link
              href={`/products/${item.modelCode}?click_from=top_modelcarousel`}
              className="flex h-full flex-col"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={item.img}
                  alt={item.modelName}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {item.badge ? (
                  <span className="absolute left-4 top-4 inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-red-500 shadow">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <div className="flex flex-1 flex-col gap-3 px-5 pb-5 pt-4">
                <h3 className="text-base font-semibold text-slate-800">{item.modelName}</h3>
                {item.price24h ? (
                  <p className="text-sm font-semibold text-red-500">24時間 {item.price24h}</p>
                ) : null}
                <span className="text-sm font-semibold text-red-500">詳細を見る →</span>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
