import React from "react";
import Head from "next/head";
import Link from "next/link";
import { FaUser, FaQuestionCircle, FaShoppingCart, FaMotorcycle } from "react-icons/fa";
import { IoMdSearch } from "react-icons/io";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import BikeModelCarousel, { BikeItem } from "../components/BikeModelCarousel";
import Footer from "../components/Footer";

export default function HomePage() {
  const blogCards = [
    { title: "最新モデル入荷！", content: "今週の注目バイクをご紹介", genre: "new-models" },
    { title: "レンタルガイド", content: "初めての方への安心サポート", genre: "guide" },
    { title: "ユーザーインタビュー", content: "実際に使った人の声", genre: "interview" },
    { title: "キャンペーン情報", content: "今週の特価セール！", genre: "campaign" },
    { title: "整備のこだわり", content: "安全・快適なレンタルのために", genre: "maintenance" },
  ];

  const genreItems = [
    {
      title: "ネイキッドバイク",
      img: "https://fastly.rentio.jp/storage/70wiuv60d6h3y0rsl7fwvgaz0n7i?fit=crop&height=73&width=70",
      href: "/t/genre/naked?click_from=top_genres",
      badge: "人気No.1",
    },
    {
      title: "アドベンチャー",
      img: "https://fastly.rentio.jp/storage/cmjolgp2t7mmpepnd0i7498j32ek?fit=crop&height=73&width=70",
      href: "/t/genre/adventure?click_from=top_genres",
      badge: "10%OFF",
    },
    {
      title: "スクーター",
      img: "https://fastly.rentio.jp/storage/pqsolpklt9uvn3fgefol8hl4gqz6?fit=crop&height=73&width=70",
      href: "/t/genre/scooter?click_from=top_genres",
      badge: null,
    },
    {
      title: "大型バイク",
      img: "https://fastly.rentio.jp/storage/hnkdjqth7yvm2ri83w7mlowcxprf?fit=crop&height=73&width=70",
      href: "/t/genre/large?click_from=top_genres",
      badge: "免許サポートあり",
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
        <Swiper spaceBetween={20} slidesPerView={2.5}>
          {blogCards.map((card, index) => (
            <SwiperSlide key={index}>
              <Link href={`/t/genre/${card.genre}?click_from=top_mainvisual`}>
                <div className="cursor-pointer bg-white rounded-lg shadow-md p-4 h-[250px] flex flex-col justify-center hover:bg-gray-50 transition">
                  <h3 className="text-md font-bold mb-2">{card.title}</h3>
                  <p className="text-sm text-gray-600">{card.content}</p>
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

