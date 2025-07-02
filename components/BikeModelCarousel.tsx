import React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Autoplay, Navigation, EffectCoverflow, Pagination } from "swiper/modules";

const Swiper = dynamic(() => import("swiper/react").then((mod) => mod.Swiper), {
  ssr: false,
});
const SwiperSlide = dynamic(
  () => import("swiper/react").then((mod) => mod.SwiperSlide),
  { ssr: false }
);
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";

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
};

export default function BikeModelCarousel({ items, title = "人気の型番" }: Props) {
  return (
    <section className="py-8 lg:py-6 px-4 mb-8 lg:mb-6">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <div className="bike-model-carousel">
        <Swiper
          modules={[Autoplay, Navigation, EffectCoverflow, Pagination]}
          spaceBetween={12}
          centeredSlides
          loop
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 2500, disableOnInteraction: false }}
          effect="coverflow"
          coverflowEffect={{ rotate: 0, stretch: 10, depth: 100, modifier: 1, slideShadows: false }}
          breakpoints={{
            0: { slidesPerView: 1.2 },
            640: { slidesPerView: 3.2 },
          }}
        >
        {items.map((item) => (
          <SwiperSlide key={item.modelCode}>
            <Link href={`/products/${item.modelCode}?click_from=top_modelcarousel`}>
              <div className="card text-center shadow-md hover:shadow-lg transition transform hover:-translate-y-1 p-2 w-[220px] h-[280px] mx-auto flex flex-col justify-between">
                <div className="relative">
                  <img
                    src={item.img}
                    alt={item.modelName}
                    width={220}
                    height={220}
                    className="object-cover w-[220px] h-[220px] mx-auto"
                  />
                  {item.badge && (
                    <div className="absolute top-1 left-1 bg-red-500 text-white text-xs flex items-center justify-center w-6 h-6 rounded">
                      {item.badge}
                    </div>
                  )}
                </div>
                <div className="text-sm mt-2 truncate">{item.modelName}</div>
                {item.price24h && (
                  <div className="text-xs text-gray-500 mt-1">
                    24時間 {item.price24h}
                  </div>
                )}
              </div>
            </Link>
          </SwiperSlide>
        ))}
        </Swiper>
      </div>
    </section>
  );
}
