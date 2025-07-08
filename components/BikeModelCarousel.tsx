import React from "react";
import Link from "next/link";

export type BikeItem = {
  modelName: string;
  modelCode: string;
  img: string;
  badge?: string;
  price24h?: string;
};

type Props = {
  items: BikeItem[];
  /**
   * メイン見出し(英語)。デフォルトは "POPULAR MODELS"
   */
  title?: string;
  /**
   * 日本語のサブタイトル
   */
  subtitle?: string;
};

export default function BikeModelCarousel({
  items,
  title = "POPULAR MODELS",
  subtitle = "人気の型番",
}: Props) {
  return (
    <section className="bike-lineup py-8 lg:py-6 my-5">
      <h2 className="bike-lineup-title">
        {title}
        {subtitle && <span className="bike-lineup-subtitle">{subtitle}</span>}
      </h2>
      <div className="bike-lineup-scroll">
        <div className="bike-lineup-list">
          {items.map((item) => (
            <div key={item.modelCode} className="bike-lineup-card">
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
          ))}
        </div>
      </div>
    </section>
  );
}
