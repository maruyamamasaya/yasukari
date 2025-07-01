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
      img:
        "https://fastly.rentio.jp/packs/common/footer_howto_img_step1-0dcf870f8f81ea55e7e7.png",
      alt: "予約イラスト",
      title: "1. ご予約",
      desc:
        "車両ページでスケジュールを確認しクレジットカードで予約。変更やキャンセルはお問い合わせから連絡してください。",
    },
    {
      img:
        "https://fastly.rentio.jp/packs/common/footer_howto_img_step2-6e9dd48f4776e72ff26d.png",
      alt: "来店イラスト",
      title: "2. ご来店",
      desc:
        "10:00〜18:30の間に免許証とヘルメットを持参し、リバイクルK-JETスタッフにお声かけください。",
    },
    {
      img:
        "https://fastly.rentio.jp/packs/common/footer_howto_img_step3-77e52caf06b1fa9b2bbb.png",
      alt: "返却イラスト",
      title: "3. ご利用・返却",
      desc:
        "契約者本人のみが乗車・返却可能です。返却は10:00〜18:30の間にガソリン満タンでお願いします。",
    },
  ];

  return (
    <section className="py-5 md:py-7">
      <div className="text-center">
        <img
          className="w-auto h-3 mx-auto"
          height={12}
          alt="How to use"
          loading="lazy"
          decoding="async"
          src="https://fastly.rentio.jp/packs/common/footer_howto_title-5606d66ca8ed4c4fe108.png"
        />
      </div>
      <p className="text-center font-bold text-lg mt-2">yasukariの利用方法</p>
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
