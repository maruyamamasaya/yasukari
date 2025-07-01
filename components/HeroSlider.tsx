import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function HeroSlider({ slides }: { slides: { img: string }[] }) {
  return (
    <section
      className="relative flex items-center justify-center mx-auto mb-8"
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
