import React from 'react';
import { FaCaretRight } from 'react-icons/fa';

export default function HowToUse() {
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
        <div className="text-center max-w-xs">
          <div className="mx-auto">
            <img
              className="w-full h-auto"
              height={220}
              alt="利用方法のイラスト"
              loading="lazy"
              decoding="async"
              src="https://fastly.rentio.jp/packs/common/footer_howto_img_step1-0dcf870f8f81ea55e7e7.png"
            />
          </div>
          <div className="mt-3 md:mt-5">
            <img
              className="w-auto h-5 mx-auto"
              height={18}
              alt="1:ネット・アプリで注文"
              loading="lazy"
              decoding="async"
              src="https://fastly.rentio.jp/packs/common/footer_howto_subtitle_step1-dac27cc2731c87c46e9c.png"
            />
          </div>
          <p className="text-start mt-2 md:mt-3 text-sm">
            プランやお届け日を選択したら注文完了！ご自宅に商品が届きます。
          </p>
        </div>
        <FaCaretRight className="hidden md:block text-gray-400 text-2xl" />
        <div className="text-center max-w-xs">
          <div className="mx-auto">
            <img
              className="w-full h-auto"
              height={220}
              alt="利用方法のイラスト"
              loading="lazy"
              decoding="async"
              src="https://fastly.rentio.jp/packs/common/footer_howto_img_step2-6e9dd48f4776e72ff26d.png"
            />
          </div>
          <div className="mt-3 md:mt-5">
            <img
              className="w-auto h-5 mx-auto"
              height={18}
              alt="2:ご利用開始"
              loading="lazy"
              decoding="async"
              src="https://fastly.rentio.jp/packs/common/footer_howto_subtitle_step2-f19e309951a1207ec802.png"
            />
          </div>
          <p className="text-start mt-2 md:mt-3 text-sm">
            万が一の故障・破損の際も「トラブルあんしん宣言」でサポートします。
          </p>
        </div>
        <FaCaretRight className="hidden md:block text-gray-400 text-2xl" />
        <div className="text-center max-w-xs">
          <div className="mx-auto">
            <img
              className="w-full h-auto"
              height={220}
              alt="利用方法のイラスト"
              loading="lazy"
              decoding="async"
              src="https://fastly.rentio.jp/packs/common/footer_howto_img_step3-77e52caf06b1fa9b2bbb.png"
            />
          </div>
          <div className="mt-3 md:mt-5">
            <img
              className="w-auto h-5 mx-auto"
              height={18}
              alt="3:返送してレンタル終了"
              loading="lazy"
              decoding="async"
              src="https://fastly.rentio.jp/packs/common/footer_howto_subtitle_step3-b7ff0c0e2b0006c68e9f.png"
            />
          </div>
          <p className="text-start mt-2 md:mt-3 text-sm">
            返送するだけで自動的にレンタル終了までの手続きが進みます。
          </p>
        </div>
      </div>
    </section>
  );
}
