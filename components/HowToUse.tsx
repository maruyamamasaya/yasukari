import React from 'react';
import { FaCaretRight } from 'react-icons/fa';

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
    <section className="py-6 md:py-8">
      <div className="text-center mb-0">
        <span className="text-red-600 font-bold text-sm tracking-wide">
          How to use
        </span>
      </div>
      {/* 利用方法の見出しは周りのテキストと同じ色にする */}
      <p className="text-center font-bold text-lg mt-1">
        yasukariの利用方法
      </p>
      <div className="flex flex-col md:flex-row justify-center items-center gap-6 md:gap-2 mt-3">
        {steps.map((step, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && (
              <FaCaretRight className="hidden md:block text-gray-400 text-2xl" />
            )}
            <div className="howto-step">
              <div className="mx-auto w-full">
                <img
                  className="howto-img"
                  alt={step.alt}
                  loading="lazy"
                  decoding="async"
                  src={step.img}
                />
              </div>
              <p className="howto-title md:mt-5">{step.title}</p>
              <p className="howto-desc md:mt-3">{step.desc}</p>
            </div>
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}
