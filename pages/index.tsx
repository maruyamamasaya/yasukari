import React from "react";
import Head from "next/head";
import Link from "next/link";
import { FaClock, FaTruck, FaStar, FaHashtag } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import BikeModelCarousel, { BikeItem } from "../components/BikeModelCarousel";
import HeroSlider from "../components/HeroSlider";
import RecentlyViewed from "../components/RecentlyViewed";
import FaqAccordion, { FAQItem } from "../components/FaqAccordion";
import HowToUse from "../components/HowToUse";

type GenreItem = {
  title: string;
  keywords?: string;
  img: string;
  href: string;
  badge?: string;
};

export default function HomePage() {
  const heroSlides = [
    { img: "https://yasukari.com/static/images/home/slide.jpg" },
    { img: "https://yasukari.com/static/images/home/slide2.jpg" },
  ];

  const faqs: FAQItem[] = [
    {
      q: '予約はいつまで可能ですか？',
      a: 'ご利用予定日の前営業日17時までご予約いただけます。',
    },
    {
      q: '定休日はいつですか？',
      a: '2023年11月23日より月曜と木曜が定休日となります。定休日は貸出・返却・延長など全ての業務を行っておりません。',
    },
    {
      q: 'ヘルメットをレンタルできますか？',
      a: 'オプションとしてヘルメットレンタルをご用意しています。お申込みがない場合はご持参ください。',
    },
    {
      q: '走行距離の上限はありますか？',
      a: '車種クラスごとの目安距離を設定しています。詳しくは表をご確認ください。',
    },
  ];
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

  const hotKeywords = [
    { label: "夏のツーリング", href: "/t/scene/summer?click_from=top_keywords" },
    { label: "初心者おすすめ", href: "/t/tag/beginner?click_from=top_keywords" },
    {
      label: "キャンプツーリング",
      href: "/blog/camp-touring?click_from=top_keywords",
    },
    { label: "ヘルメット", href: "/search?q=ヘルメット&click_from=top_keywords" },
  ];

  const genreItems: GenreItem[] = [
    {
      title: "原付スクーター",
      keywords: "50cc",
      img: "https://images.unsplash.com/photo-1518600324302-04d4683cf19d?auto=format&fit=crop&w=70&q=60",
      href: "/t/genre/scooter-50cc?click_from=top_genres",
    },
    {
      title: "ジャイロキャノビー原付",
      img: "https://images.unsplash.com/photo-1596991367806-58714a22747c?auto=format&fit=crop&w=70&q=60",
      href: "/t/genre/gyrocanopy-moped?click_from=top_genres",
    },
    {
      title: "ジャイロキャノビーミニカー",
      img: "https://images.unsplash.com/photo-1600788907411-28fe8e361f25?auto=format&fit=crop&w=70&q=60",
      href: "/t/genre/gyrocanopy-minicar?click_from=top_genres",
    },
    {
      title: "原付二種スクーター",
      keywords: "〜125cc",
      img: "https://images.unsplash.com/photo-1521033630360-8da27f438aab?auto=format&fit=crop&w=70&q=60",
      href: "/t/genre/scooter-125cc?click_from=top_genres",
    },
    {
      title: "原付ミッション",
      img: "https://images.unsplash.com/photo-1558980664-10abf19c5c99?auto=format&fit=crop&w=70&q=60",
      href: "/t/genre/moped-manual?click_from=top_genres",
    },
    {
      title: "126〜250cc",
      img: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=70&q=60",
      href: "/t/genre/cc126-250?click_from=top_genres",
    },
    {
      title: "251〜400cc",
      img: "https://images.unsplash.com/photo-1527059815533-5e3217fe272b?auto=format&fit=crop&w=70&q=60",
      href: "/t/genre/cc251-400?click_from=top_genres",
    },
    {
      title: "400cc超",
      img: "https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=70&q=60",
      href: "/t/genre/cc400-plus?click_from=top_genres",
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
      modelName: "\u30C9\u30E9\u30C3\u30B0\u30B9\u30BF\u30FC250",
      modelCode: "dragstar250",
      img: "https://yasukari.com/storage/models/DXD10WTKLvRB45VWYVtm.jpg",
      price24h: "7,980\u5186",
    },
    {
      modelName: "\u30AF\u30ED\u30B9\u30AB\u30D6110",
      modelCode: "crosscub110",
      img: "https://yasukari.com/storage/models/yIj7Bnk5KSgr05pITe8y.jpg",
      price24h: "6,980\u5186",
    },
    {
      modelName: "CB400SFV\u30DC\u30EB\u30C9\u30FC\u30EB",
      modelCode: "cb400sfv",
      img: "https://yasukari.com/storage/models/nXUvT7KLr38W99F5xmqy.jpg",
      price24h: "11,980\u5186",
    },
    {
      modelName: "CB1300SF\u30DC\u30EB\u30C9\u30FC\u30EB",
      modelCode: "cb1300sf",
      img: "https://yasukari.com/storage/models/nP97p32L9F4o2mL4TtX6.jpg",
      price24h: "14,980\u5186",
    },
    {
      modelName: "CBR400R",
      modelCode: "cbr400r",
      img: "https://yasukari.com/storage/models/c9kas47ob2ulkaeppka0.jpg",
      price24h: "11,980\u5186",
    },
    {
      modelName: "\u30C8\u30A5\u30C7\u30A4-2",
      modelCode: "today2",
      img: "https://images.unsplash.com/photo-1529429612084-bd3517b6be0e?auto=format&fit=crop&w=400&q=60",
    },
    {
      modelName: "\u30BF\u30AF\u30C8\u3000\u30D9\u30FC\u30B7\u30C3\u30AF",
      modelCode: "tact-basic",
      img: "https://images.unsplash.com/photo-1618322076062-3d90e649b6ce?auto=format&fit=crop&w=400&q=60",
    },
  ];


  return (
    <>
      <Head>
        <title>yasukari - バイクレンタルサイト</title>
      </Head>


      {/* ヒーローセクション */}
      <HeroSlider slides={heroSlides} />

      {/* 注目キーワード */}
      <section className="py-4 px-4">
        <h2 className="text-sm font-semibold mb-2">注目キーワード</h2>
        <div className="flex flex-wrap gap-2">
          {hotKeywords.map((k, idx) => (
            <Link
              key={idx}
              href={k.href}
              className="inline-flex items-center gap-1 rounded-full shadow-sm border border-gray-200 bg-white text-black text-[13px] font-bold px-2 py-1.5"
            >
              <FaHashtag className="text-primary text-[16px]" />
              {k.label}
            </Link>
          ))}
        </div>
      </section>

      {/* 特徴紹介 */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-5xl mx-auto grid gap-6 md:grid-cols-3 text-center px-4">
          <FeatureItem icon={<FaClock size={28} />} title="24時間予約" text="スマホからいつでも申し込み" />
          <FeatureItem icon={<FaTruck size={28} />} title="格安レンタル" text="オンラインで簡単手続き" />
          <FeatureItem icon={<FaStar size={28} />} title="整備済み車両" text="プロメカニックによる点検済み" />
        </div>
      </section>

      {/* カルーセル（新着ブログカード） */}
      <section className="py-6 px-4">
        <h2 className="text-lg font-semibold mb-4">新着ブログ・お知らせ</h2>
        <Swiper
          modules={[Autoplay, Navigation, Pagination]}
          spaceBetween={12}
          slidesPerView={3}
          navigation
          pagination={{ clickable: true }}
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

      <RecentlyViewed />

      {/* おすすめのジャンルセクション（バイク） */}
      <section className="py-6 px-4">
        <h2 className="text-lg font-semibold mb-4">今借りたい！おすすめのジャンル</h2>
        <Swiper modules={[Pagination]} spaceBetween={12} slidesPerView={4} pagination={{ clickable: true }}>
          {genreItems.map((item, index) => (
            <SwiperSlide key={index}>
              <Link href={item.href}>
                <div className="text-center shadow-sm rounded bg-white p-2 hover:bg-gray-50 transition">
                  <div className="relative w-fit mx-auto">
                    <img src={item.img} alt={item.title} width={70} height={73} className="object-cover" />
                    {item.badge && (
                      <div className="absolute top-1 left-1 bg-red-500 text-white text-xs px-1 py-0.5 rounded">
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
      <RecentlyViewed />
      <HowToUse />

      <section className="py-8 px-4">
        <h2 className="text-lg font-semibold mb-4 text-center">よくある質問</h2>
        <FaqAccordion faqs={faqs} />
        <div className="mt-6 flex flex-col sm:flex-row justify-center gap-2">
          <Link href="/beginner" className="btn-primary text-center w-full sm:w-auto">
            はじめてガイドで利用の流れを詳しく知る
          </Link>
          <Link href="/help" className="btn-primary text-center w-full sm:w-auto">
            その他のよくあるご質問をもっと見る
          </Link>
        </div>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: faqs.map((f) => ({
                '@type': 'Question',
                name: f.q,
                acceptedAnswer: { '@type': 'Answer', text: f.a },
              })),
            }),
          }}
        />
      </section>
    </>
  );
}

function NavItem({ icon, label }: { icon?: React.ReactNode; label: string }) {
  return (
    <button className="flex items-center gap-1 text-gray-700 hover:text-red-600 transition-colors">
      {icon && <span>{icon}</span>}
      <span>{label}</span>
    </button>
  );
}

function FeatureItem({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="bg-white rounded shadow-sm p-4">
      <div className="text-primary mb-2">{icon}</div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{text}</p>
    </div>
  );
}

