import React from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

export default function HeroSlider({ slides }: { slides: { img: string }[] }) {
  return (
    <section className="relative flex items-center justify-center" style={{ height: 560 }}>
      <Swiper modules={[Autoplay]} autoplay={{ delay: 4000 }} loop className="absolute inset-0">
        {slides.map((s, idx) => (
          <SwiperSlide key={idx}>
            <img src={s.img} alt="slide" width={960} height={560} className="w-full h-full object-cover" />
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10 text-center px-4 text-white">
        <h1 className="text-3xl md:text-5xl font-bold mb-4">Ride the Future</h1>
        <p className="mb-6 max-w-xl mx-auto">最新モデルからクラシックまで、多彩なバイクを簡単レンタル。</p>
        <Link href="/products" className="btn-primary inline-block">バイクを探す</Link>
      </div>
    </section>
  );
}
