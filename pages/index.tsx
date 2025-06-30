import React from "react";
import Head from "next/head";
import Link from "next/link";
import { FaUser, FaQuestionCircle, FaShoppingCart, FaMotorcycle } from "react-icons/fa";
import { IoMdSearch } from "react-icons/io";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import BikeModelCarousel, { BikeItem } from "../components/BikeModelCarousel";
import Footer from "../components/Footer";

type GenreItem = {
  title: string;
  keywords?: string;
  img: string;
  href: string;
  badge?: string;
};

export default function HomePage() {
  const blogSlides = [
    {
      title: "最新モデル入荷！",
      img: "https://images.unsplash.com/photo-1586216586175-8aa98895d72b?auto=format&fit=crop&w=400&q=60",
      href: "#",
    },
    {
      title: "レンタルガイド",
      img: "https://images.unsplash.com/photo-1558981403-c5f9891deab2?auto=format&fit=crop&w=400&q=60",
      href: "#",
    },
    {
      title: "ユーザーインタビュー",
      img: "https://images.unsplash.com/photo-1600788907411-28fe8e361f25?auto=format&fit=crop&w=400&q=60",
      href: "#",
    },
    {
      title: "キャンペーン情報",
      img: "https://images.unsplash.com/photo-1526045612212-70caf35c14df?auto=format&fit=crop&w=400&q=60",
      href: "#",
    },
    {
      title: "整備のこだわり",
      img: "https://images.unsplash.com/photo-1558980664-10abf19c5c99?auto=format&fit=crop&w=400&q=60",
      href: "#",
    },
    {
      title: "ツーリング特集",
      img: "https://images.unsplash.com/photo-1518098268026-4e89f1a2cd9d?auto=format&fit=crop&w=400&q=60",
      href: "#",
    },
    {
      title: "最新アクセサリ",
      img: "https://images.unsplash.com/photo-1596991367806-58714a22747c?auto=format&fit=crop&w=400&q=60",
      href: "#",
    },
    {
      title: "スタッフブログ",
      img: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=400&q=60",
      href: "#",
    },
    {
      title: "バイクの保管方法",
      img: "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=400&q=60",
      href: "#",
    },
    {
      title: "イベントレポート",
      img: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=400&q=60",
      href: "#",
    },
  ];

  const genreItems: GenreItem[] = [
    {
      title: "ネイキッドバイク",
      keywords: "街乗り・初心者向け",
      img: "https://fastly.rentio.jp/storage/70wiuv60d6h3y0rsl7fwvgaz0n7i?fit=crop&height=73&width=70",
      href: "/t/genre/naked?click_from=top_genres",
      badge: "人気No.1",
    },
    {
      title: "アドベンチャー",
      keywords: "長距離・ツーリング",
      img: "https://fastly.rentio.jp/storage/cmjolgp2t7mmpepnd0i7498j32ek?fit=crop&height=73&width=70",
      href: "/t/genre/adventure?click_from=top_genres",
      badge: "10%OFF",
    },
    {
      title: "スクーター",
      keywords: "通勤通学に最適",
      img: "https://fastly.rentio.jp/storage/pqsolpklt9uvn3fgefol8hl4gqz6?fit=crop&height=73&width=70",
      href: "/t/genre/scooter?click_from=top_genres",
      badge: null,
    },
    {
      title: "大型バイク",
      keywords: "迫力・高速走行",
      img: "https://fastly.rentio.jp/storage/hnkdjqth7yvm2ri83w7mlowcxprf?fit=crop&height=73&width=70",
      href: "/t/genre/large?click_from=top_genres",
      badge: "免許サポートあり",
    },
    {
      title: "全ての機種を見る",
      img: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=70&q=60",
      href: "/products",
      badge: null,
    },
  ];

  const bikeModels: BikeItem[] = [
    {
      modelName: "CT125 \u30CF\u30F3\u30BF\u30FC\u30AB\u30D6",
      modelCode: "ct125",
      img: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=220&q=60",
      badge: "\u4EBA\u6C17",
    },
    {
      modelName: "Rebel 250",
      modelCode: "rebel250",
      img: "https://images.unsplash.com/photo-1527059815533-5e3217fe272b?auto=format&fit=crop&w=220&q=60",
      badge: "\u65B0\u7740",
    },
    {
      modelName: "Monkey 125",
      modelCode: "monkey125",
      img: "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=220&q=60",
    },
    {
      modelName: "GB350",
      modelCode: "gb350",
      img: "https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=220&q=60",
    },
  ];

  return (
    <>
      <Head>
        <title>yasukari - バイクレンタルサイト</title>
      </Head>

      {/* トップバー（今週限定サービスなど） */}
      <div className="bg-yellow-300 text-black text-center py-2 text-sm animate__animated animate__pulse">
        🎉 今週限定：初回レンタル30%OFF + 新着モデル入荷！
      </div>

      {/* ヘッダー */}
      <header className="flex items-center justify-between p-4 border-b shadow-md bg-white animate__animated animate__fadeInDown">
        {/* ロゴ + 検索 */}
        <div className="flex items-center gap-4">
          <div className="text-xl font-bold text-red-600">yasukari</div>
          <div className="relative">
            <input
              type="text"
              placeholder="バイク名・キーワード"
              className="border rounded-full px-4 py-2 pl-10 w-64"
            />
            <IoMdSearch className="absolute left-3 top-2.5 text-gray-500 text-lg" />
          </div>
        </div>

        {/* ナビゲーションボタン */}
        <nav className="flex items-center gap-4 text-sm">
          <NavItem icon={<FaUser />} label="ログイン" />
          <NavItem icon={<FaQuestionCircle />} label="はじめてガイド" />
          <NavItem icon={<FaMotorcycle />} label="ジャンル" />
          <NavItem icon={<FaShoppingCart />} label="カート" />
          <NavItem label="ヘルプ" />
        </nav>
      </header>

      {/* カルーセル（新着ブログカード） */}
      <section className="py-6 px-4 animate__animated animate__fadeIn">
        <h2 className="text-lg font-semibold mb-4">新着ブログ・お知らせ</h2>
        <Swiper
          modules={[Autoplay, Navigation]}
          spaceBetween={12}
          slidesPerView={3}
          navigation
          autoplay={{ delay: 3000 }}
          loop
        >
          {blogSlides.map((card, index) => (
            <SwiperSlide key={index}>
              <Link href={card.href}>
                <div className="relative rounded-lg overflow-hidden shadow-md cursor-pointer">
                  <img
                    src={card.img}
                    alt={card.title}
                    className="w-full h-56 object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-sm p-2 text-center">
                    {card.title}
                  </div>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* おすすめのジャンルセクション（バイク） */}
      <section className="py-6 px-4 animate__animated animate__fadeIn">
        <h2 className="text-lg font-semibold mb-4">今借りたい！おすすめのジャンル</h2>
        <Swiper spaceBetween={12} slidesPerView={4}>
          {genreItems.map((item, index) => (
            <SwiperSlide key={index}>
              <Link href={item.href}>
                <div className="text-center shadow-sm rounded bg-white p-2 hover:bg-gray-50 transition">
                  <div className="relative w-fit mx-auto">
                    <img src={item.img} alt={item.title} width={70} height={73} className="object-cover" />
                    {item.badge && (
                      <div className="absolute top-1 left-1 bg-red-400 text-white text-xs px-1 py-0.5 rounded">
                        {item.badge}
                      </div>
                    )}
                  </div>
                  <div className="text-sm mt-1 truncate">{item.title}</div>
                  {item.keywords && (
                    <div className="text-xs text-gray-500 truncate">{item.keywords}</div>
                  )}
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      <BikeModelCarousel items={bikeModels} />
      <Footer />
    </>
  );
}

function NavItem({ icon, label }: { icon?: React.ReactNode; label: string }) {
  return (
    <button className="flex items-center gap-1 text-gray-700 hover:text-black">
      {icon && <span>{icon}</span>}
      <span>{label}</span>
    </button>
  );
}

