import React from "react";
import dynamic from "next/dynamic";
import { Autoplay, Navigation, Pagination } from "swiper/modules";

const Swiper = dynamic(() => import("swiper/react").then((mod) => mod.Swiper), {
  ssr: false,
});
const SwiperSlide = dynamic(
  () => import("swiper/react").then((mod) => mod.SwiperSlide),
  { ssr: false }
);
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function HeroSlider({ slides }: { slides: { img: string }[] }) {
  return (
    <section
      className="relative flex items-center justify-center mx-auto mb-12"
      style={{ width: 960, maxWidth: "100%", height: 560 }}
    >
      <Swiper
        modules={[Autoplay, Navigation, Pagination]}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 4000 }}
        loop
        className="absolute inset-0"
      >
        {slides.map((s, idx) => (
          <SwiperSlide key={idx}>
            <img
              src={s.img}
              alt="slide"
              width={960}
              height={560}
              className="w-full h-full object-cover"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
