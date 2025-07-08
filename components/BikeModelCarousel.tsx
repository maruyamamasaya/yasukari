import React from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, EffectCoverflow, Pagination } from "swiper/modules";
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
    <section className="bike-lineup py-8 lg:py-6 mb-8 lg:mb-6">
      <h2 className="bike-lineup-title">{title}</h2>
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
            <div className="bike-lineup-card">
              <Link href={`/products/${item.modelCode}?click_from=top_modelcarousel`}>
                <img src={item.img} alt={item.modelName} className="bike-lineup-image" />
                {item.badge && <div className="bike-lineup-badge">{item.badge}</div>}
                <div className="bike-lineup-info">
                  <h3 className="bike-lineup-name truncate">{item.modelName}</h3>
                  {item.price24h && (
                    <div className="text-xs text-gray-500 mt-1">24時間 {item.price24h}</div>
                  )}
                </div>
              </Link>
            </div>
          </SwiperSlide>
        ))}
        </Swiper>
      </div>
    </section>
  );
}
