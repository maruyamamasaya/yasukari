import React from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination, Grid } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export type GenreItem = {
  title: string;
  keywords?: string;
  img?: string;
  href: string;
  badge?: string;
  icon?: React.ReactNode;
};

interface Props {
  items: GenreItem[];
  /**
   * メイン見出し(英語)。デフォルトは "RECOMMENDED GENRES"
   */
  title?: string;
  /**
   * 日本語のサブタイトル
   */
  subtitle?: string;
}

export default function GenreCarousel({
  items,
  title = "RECOMMENDED GENRES",
  subtitle = "すぐに借りれる！おすすめのジャンル",
}: Props) {
  return (
    <section className="bike-lineup my-5">
      <h2 className="bike-lineup-title">
        {title}
        {subtitle && <span className="bike-lineup-subtitle">{subtitle}</span>}
      </h2>
      <div className="genre-carousel">
        <Swiper
          modules={[Autoplay, Navigation, Pagination, Grid]}
          spaceBetween={12}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 2500, disableOnInteraction: false }}
          loop
          breakpoints={{
            0: { slidesPerView: 2, grid: { rows: 2, fill: "row" } },
            640: { slidesPerView: 7, grid: { rows: 1 } },
          }}
        >
          {items.map((item, index) => (
            <SwiperSlide key={index}>
              <div className="bike-lineup-card">
                <Link href={item.href}>
                  <div className="relative">
                    {item.img ? (
                      <img
                        src={item.img}
                        alt={item.title}
                        className="bike-lineup-image"
                      />
                    ) : (
                      <span className="text-gray-400 text-6xl flex items-center justify-center w-full h-full">
                        {item.icon}
                      </span>
                    )}
                    {item.badge && <div className="bike-lineup-badge">{item.badge}</div>}
                  </div>
                  <div className="bike-lineup-info">
                    <h3 className="bike-lineup-name truncate">{item.title}</h3>
                    {item.keywords && (
                      <span className="text-xs text-gray-500 ml-1">{item.keywords}</span>
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
