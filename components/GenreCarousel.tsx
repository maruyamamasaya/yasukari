import React from "react";
import Link from "next/link";

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
      <div className="bike-lineup-scroll">
        <div className="bike-lineup-list">
          {items.map((item, index) => (
            <div key={index} className="bike-lineup-card">
              <Link href={item.href}>
                <div className="relative">
                  {item.img ? (
                    <img src={item.img} alt={item.title} className="bike-lineup-image" />
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
          ))}
        </div>
      </div>
    </section>
  );
}
