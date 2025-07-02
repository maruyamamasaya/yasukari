import React from "react";

export default function SwiperPagination() {
  return (
    <div className="swiper-pagination swiper-pagination-clickable swiper-pagination-bullets swiper-pagination-horizontal">
      <span className="swiper-pagination-bullet"></span>
      <span className="swiper-pagination-bullet"></span>
      <span className="swiper-pagination-bullet"></span>
      <span className="swiper-pagination-bullet swiper-pagination-bullet-active"></span>
    </div>
  );
}
