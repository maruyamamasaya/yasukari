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
      img: "/image/howto02_touka.png",
      alt: "予約イラスト",
      title: "2. ご予約",
      desc:
        "車両ページでスケジュールを確認しクレジットカードで予約。変更やキャンセルはお問い合わせから連絡してください。",
    },
    {
      img: "/image/howto03_touka.png",
      alt: "来店イラスト",
      title: "3. ご来店",
      desc:
        "10:00〜18:30の間に免許証とヘルメットを持参し、リバイクルK-JETスタッフにお声かけください。",
    },
    {
      img: "/image/howto04_touka.png",
      alt: "返却イラスト",
      title: "4. ご利用・返却",
      desc:
        "契約者本人のみが乗車・返却可能です。返却は10:00〜18:30の間にガソリン満タンでお願いします。",
    },
  ];

  return (
    <section className="py-5 md:py-7">
      <div className="text-center mb-1">
        <span className="text-red-600 font-bold text-sm tracking-wide">
          How to use
        </span>
      </div>
      <p className="text-center font-bold text-lg mt-2 text-red-600">
        yasukariの利用方法
      </p>
      <div className="flex flex-col md:flex-row justify-center items-center gap-6 md:gap-2 mt-4">
        {steps.map((step, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && (
              <FaCaretRight className="hidden md:block text-gray-400 text-2xl" />
            )}
            <div className="text-center max-w-xs">
              <div className="mx-auto">
                <img
                  className="w-full h-auto"
                  height={220}
                  alt={step.alt}
                  loading="lazy"
                  decoding="async"
                  src={step.img}
                />
              </div>
              <p className="font-bold mt-3 md:mt-5">{step.title}</p>
              <p className="text-start mt-2 md:mt-3 text-sm">{step.desc}</p>
            </div>
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}
