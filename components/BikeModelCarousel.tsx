import React from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, EffectCoverflow } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/effect-coverflow";

export type BikeItem = {
  modelName: string;
  modelCode: string;
  img: string;
  badge?: string;
};

type Props = {
  items: BikeItem[];
  title?: string;
};

export default function BikeModelCarousel({ items, title = "人気の型番" }: Props) {
  return (
    <section className="py-6 px-4">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <Swiper
        modules={[Autoplay, Navigation, EffectCoverflow]}
        spaceBetween={12}
        slidesPerView={3.2}
        centeredSlides
        loop
        navigation
        autoplay={{ delay: 2500, disableOnInteraction: false }}
        effect="coverflow"
        coverflowEffect={{ rotate: 0, stretch: 10, depth: 100, modifier: 1, slideShadows: false }}
      >
        {items.map((item) => (
          <SwiperSlide key={item.modelCode}>
            <Link href={`/products/${item.modelCode}?click_from=top_modelcarousel`}>
              <div className="text-center bg-white rounded shadow-sm hover:bg-gray-50 transition p-2">
                <div className="relative">
                  <img
                    src={item.img}
                    alt={item.modelName}
                    width={220}
                    height={220}
                    className="object-cover w-[220px] h-[220px] mx-auto"
                  />
                  {item.badge && (
                    <div className="absolute top-1 left-1 bg-red-400 text-white text-xs px-1 py-0.5 rounded">
                      {item.badge}
                    </div>
                  )}
                </div>
                <div className="text-sm mt-2 truncate">{item.modelName}</div>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
