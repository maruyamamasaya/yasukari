import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function HeroSlider({ slides }: { slides: { img: string }[] }) {
  return (
    <section className="relative mx-auto w-full max-w-6xl">
      <div className="section-surface overflow-hidden rounded-3xl">
        <div className="relative aspect-[16/9] w-full">
          <Swiper
            modules={[Autoplay, Navigation, Pagination]}
            navigation
            pagination={{ clickable: true }}
            autoplay={{ delay: 4200, disableOnInteraction: false }}
            loop
            className="h-full w-full"
          >
            {slides.map((s, idx) => (
              <SwiperSlide key={idx}>
                <div className="relative h-full w-full">
                  <img
                    src={s.img}
                    alt="バイクレンタルの魅力"
                    width={1280}
                    height={720}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/50 via-black/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 px-8 pb-10 text-white drop-shadow-lg sm:max-w-xl">
                    <p className="text-sm font-semibold uppercase tracking-[0.35em] text-white/70">
                      Premium Rental Experience
                    </p>
                    <h1 className="text-2xl font-semibold leading-tight sm:text-4xl">
                      こだわりのラインアップで、もっと自由なツーリングを
                    </h1>
                    <p className="text-sm text-white/80 sm:text-base">
                      整備士が見極めたハイクオリティな車両を、最新のオンライン体験で。
                      予約から受け取りまで、あなたの旅をスマートにサポートします。
                    </p>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}
