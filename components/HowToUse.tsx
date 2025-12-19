import React from "react";
import SectionHeading from "./SectionHeading";

type Step = {
  img: string;
  alt: string;
  title: string;
  desc: string;
};

export default function HowToUse() {
  const steps: Step[] = [
    {
      img: "/image/howto01_touka.png",
      alt: "店舗選択イラスト",
      title: "1. 店舗を選ぶ",
      desc:
        "足立小台本店（足立区の格安バイク屋）と三ノ輪店（東京都台東区の国道4号線沿いのレンタルバイク店）のどちらから借りるか選択します。",
    },
    {
      img: "/image/howto02.png",
      alt: "予約イラスト",
      title: "2. ご予約",
      desc:
        "車両ページでスケジュールを確認しクレジットカードで予約。変更やキャンセルはお問い合わせから連絡してください。",
    },
    {
      img: "/image/howto03.png",
      alt: "来店イラスト",
      title: "3. ご来店",
      desc:
        "10:00〜18:30の間に免許証とヘルメットを持参し、リバイクルK-JETスタッフにお声かけください。",
    },
    {
      img: "/image/howto04.png",
      alt: "返却イラスト",
      title: "4. ご利用・返却",
      desc:
        "契約者本人のみが乗車・返却可能です。返却は10:00〜18:30の間にガソリン満タンでお願いします。",
    },
  ];

  return (
    <section className="section-surface section-padding">
      <SectionHeading
        eyebrow="How to use"
        title="yasukariの利用方法"
        description="初めてでも迷わずにステップを完了できるよう、予約から返却までの流れをシンプルにまとめました。"
      />
      <div className="relative mt-6">
        <div className="absolute inset-x-6 top-10 hidden h-px bg-gradient-to-r from-transparent via-red-200/70 to-transparent md:block" />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {steps.map((step, idx) => (
            <article
              key={idx}
              className="relative flex h-full flex-col gap-4 overflow-hidden rounded-2xl border border-white/70 bg-white/80 p-6 text-left shadow-[0_18px_40px_-25px_rgba(15,23,42,0.5)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_50px_-25px_rgba(220,38,38,0.35)]"
            >
              <div className="absolute -top-5 left-6 flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-red-500 via-orange-400 to-amber-300 text-lg font-bold text-white shadow-lg">
                  {idx + 1}
                </span>
                <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-900 shadow-sm ring-1 ring-black/5">
                  Step
                </span>
              </div>
              <div className="flex flex-col gap-3 pt-8">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-slate-100 to-white shadow-inner">
                  <img
                    className="h-full w-full object-contain"
                    alt={step.alt}
                    loading="lazy"
                    decoding="async"
                    src={step.img}
                  />
                </div>
                <p className="text-sm font-semibold text-slate-900 md:text-base">{step.title}</p>
              </div>
              <p className="text-xs leading-relaxed text-slate-600 md:text-sm">{step.desc}</p>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-red-50/70 via-white/0 to-transparent" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
