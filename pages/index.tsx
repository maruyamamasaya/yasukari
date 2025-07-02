import React, { useMemo } from "react";
import Head from "next/head";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination, Grid } from "swiper/modules";
import fs from "fs";
import path from "path";
import { GetStaticProps } from "next";
import { FaClock, FaTruck, FaStar, FaHashtag, FaMotorcycle } from "react-icons/fa";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import BikeModelCarousel, { BikeItem } from "../components/BikeModelCarousel";
import HeroSlider from "../components/HeroSlider";
import RecentlyViewed from "../components/RecentlyViewed";
import FaqAccordion, { FAQItem } from "../components/FaqAccordion";
import faqData from "../data/faq.json";
import HowToUse from "../components/HowToUse";

type GenreItem = {
  title: string;
  keywords?: string;
  img?: string;
  href: string;
  badge?: string;
  icon?: React.ReactNode;
};

type BlogSlide = {
  title: string;
  href: string;
  img: string;
};
interface Props {
  blogSlides: BlogSlide[];
}

export default function HomePage({ blogSlides }: Props) {
  const heroSlides = [
    { img: "https://yasukari.com/static/images/home/slide.jpg" },
    { img: "https://yasukari.com/static/images/home/slide2.jpg" },
  ];

  const faqs: FAQItem[] = useMemo(() => {
    const all: FAQItem[] = (faqData as any).categories.flatMap(
      (c: any) => c.faqs
    );
    for (let i = all.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [all[i], all[j]] = [all[j], all[i]];
    }
    return all.slice(0, 10);
  }, []);


  const hotKeywords = [
    { label: "夏のツーリング", href: "/t/scene/summer?click_from=top_keywords" },
    { label: "初心者おすすめ", href: "/t/tag/beginner?click_from=top_keywords" },
    {
      label: "キャンプツーリング",
      href: "/blog/camp-touring?click_from=top_keywords",
    },
    { label: "ヘルメット", href: "/search?q=ヘルメット&click_from=top_keywords" },
    { label: "原付スクーター", href: "/rental_bike/tag/%E5%8E%9F%E4%BB%98%E3%82%B9%E3%82%AF%E3%83%BC%E3%82%BF%E3%83%BC?click_from=top_keywords" },
    { label: "ジャイロキャノビー原付", href: "/rental_bike/tag/%E3%82%B8%E3%83%A3%E3%82%A4%E3%83%AD%E3%82%AD%E3%83%A3%E3%83%8E%E3%83%93%E3%83%BC%E5%8E%9F%E4%BB%98?click_from=top_keywords" },
    { label: "ジャイロキャノビーミニカー", href: "/rental_bike/tag/%E3%82%B8%E3%83%A3%E3%82%A4%E3%83%AD%E3%82%AD%E3%83%A3%E3%83%8E%E3%83%93%E3%83%BC%E3%83%9F%E3%83%8B%E3%82%AB%E3%83%BC?click_from=top_keywords" },
    { label: "原付二種スクーター", href: "/rental_bike/tag/%E5%8E%9F%E4%BB%98%E4%BA%8C%E7%A8%AE%E3%82%B9%E3%82%AF%E3%83%BC%E3%82%BF%E3%83%BC?click_from=top_keywords" },
    { label: "原付ミッション", href: "/rental_bike/tag/%E5%8E%9F%E4%BB%98%E3%83%9F%E3%83%83%E3%82%B7%E3%83%A7%E3%83%B3?click_from=top_keywords" },
    { label: "126〜250cc", href: "/rental_bike/tag/126%E3%80%9C250cc?click_from=top_keywords" },
    { label: "251〜400cc", href: "/rental_bike/tag/251%E3%80%9C400cc?click_from=top_keywords" },
    { label: "400cc超", href: "/rental_bike/tag/400cc%E8%B6%85?click_from=top_keywords" },
  ];


  const genreItems: GenreItem[] = [
    {
      title: "原付スクーター",
      keywords: "50cc",
      img: "/image/category/原付スクーター.png",
      href: "/t/genre/scooter-50cc?click_from=top_genres",
    },
    {
      title: "ジャイロキャノビー原付",
      img: "/image/category/ジャイロキャノビー原付.png",
      href: "/t/genre/gyrocanopy-moped?click_from=top_genres",
    },
    {
      title: "ジャイロキャノビーミニカー",
      img: "/image/category/ジャイロキャノビーミニカー.png",
      href: "/t/genre/gyrocanopy-minicar?click_from=top_genres",
    },
    {
      title: "原付二種スクーター",
      keywords: "〜125cc",
      img: "/image/category/原付二種スクーター.png",
      href: "/t/genre/scooter-125cc?click_from=top_genres",
    },
    {
      title: "原付ミッション",
      img: "/image/category/原付ミッション.png",
      href: "/t/genre/moped-manual?click_from=top_genres",
    },
    {
      title: "126〜250cc",
      img: "/image/category/126〜250cc.png",
      href: "/t/genre/cc126-250?click_from=top_genres",
    },
    {
      title: "251〜400cc",
      img: "/image/category/251〜400cc.png",
      href: "/t/genre/cc251-400?click_from=top_genres",
    },
    {
      title: "400cc超",
      img: "/image/category/400cc超.png",
      href: "/t/genre/cc400-plus?click_from=top_genres",
    },
    {
      title: "全ての機種を見る",
      href: "/products",
      icon: <FaMotorcycle className="w-[150px] h-[150px]" />,
      keywords: "\u00A0",
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
      img: "https://yasukari.com/storage/models/chzPCoSkTibLXYsrMN93.jpg",
    },
    {
      modelName: "\u30BF\u30AF\u30C8\u3000\u30D9\u30FC\u30B7\u30C3\u30AF",
      modelCode: "tact-basic",
      img: "https://yasukari.com/storage/models/cai2v0vob2uptbmdc4n0.jpg",
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
      <section className="py-6 px-4">
        <h2 className="text-sm font-semibold mb-2">注目キーワード</h2>
        <div className="flex flex-wrap gap-2">
          {hotKeywords.slice(0, 7).map((k, idx) => (
            <Link
              key={idx}
              href={k.href}
              className="inline-flex items-center gap-1 rounded-full shadow-sm border border-gray-200 bg-white text-black text-[13px] font-bold px-2 py-1.5"
            >
              <FaHashtag className="text-primary text-[16px]" />
              {k.label}
            </Link>
          ))}
          {hotKeywords.length > 7 && (
            <Link
              href="/rental_bike"
              className="inline-flex items-center gap-1 rounded-full shadow-sm border border-gray-200 bg-white text-black text-[13px] font-bold px-2 py-1.5"
            >
              もっと見る
            </Link>
          )}
        </div>
      </section>

      {/* 特徴紹介 */}
      <section className="py-10 bg-gray-50">
        <div className="max-w-5xl mx-auto grid gap-6 md:grid-cols-3 text-center px-4">
          <FeatureItem icon={<FaClock size={28} />} title="24時間予約" text="スマホからいつでも申し込み" />
          <FeatureItem icon={<FaTruck size={28} />} title="格安レンタル" text="オンラインで簡単手続き" />
          <FeatureItem icon={<FaStar size={28} />} title="整備済み車両" text="プロメカニックによる点検済み" />
        </div>
      </section>

      {/* カルーセル（新着ブログカード） */}
      <section className="py-8 px-4 mb-8">
        <h2 className="text-lg font-semibold mb-4">新着ブログ・お知らせ</h2>
        <Swiper
          modules={[Autoplay, Navigation, Pagination]}
          spaceBetween={12}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 3000 }}
          loop
          breakpoints={{
            0: { slidesPerView: 1 },
            640: { slidesPerView: 3 },
          }}
        >
          {blogSlides.map((card, index) => (
            <SwiperSlide key={index}>
              <Link href={card.href}>
                <div className="blog-slide cursor-pointer shadow-md hover-glow">
                  <img
                    src={card.img}
                    alt={card.title}
                    className="square-img"
                  />
                  <div className="blog-slide-title">
                    {card.title}
                  </div>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* 最近チェックした商品 */}
      <RecentlyViewed />

      {/* 人気の型番 */}
      <BikeModelCarousel items={bikeModels} />

      {/* おすすめのジャンルセクション（バイク） */}
      <section className="py-8 px-4 mb-8">
        <h2 className="text-lg font-semibold mb-4">すぐに借りれる！おすすめのジャンル</h2>
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
            640: { slidesPerView: 4, grid: { rows: 1 } },
          }}
        >
          {genreItems.map((item, index) => (
            <SwiperSlide key={index}>
              <Link href={item.href}>
                <div className="text-center shadow-sm rounded bg-white p-2 hover:bg-gray-50 transition w-[160px] h-[220px] mx-auto flex flex-col justify-between">
                  <div className="relative mx-auto w-[150px] h-[150px] flex items-center justify-center">
                    {item.img ? (
                      <img
                        src={item.img}
                        alt={item.title}
                        width={150}
                        height={150}
                        className="object-cover w-[150px] h-[150px]"
                      />
                    ) : (
                      <span className="text-gray-400 text-6xl">{item.icon}</span>
                    )}
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
        </div>
      </section>

      {/* 店舗を選ぶセクション */}
      <section className="py-10 px-4">
        <h2 className="text-lg font-semibold mb-4 text-center">どちらの店舗で借りますか？</h2>
        <div className="max-w-4xl mx-auto grid gap-4 md:grid-cols-2">
          <div className="border rounded overflow-hidden shadow-sm">
            <img
              src="https://lh3.googleusercontent.com/gps-cs-s/AC9h4nqVQEu7iamQVzNqnomQOvgsiEUR7DIW3ZdaAHEnxWggYWnC73HV5doQ1TwHaab2CW_mPNIfW1bbR8gKFCRrVYybhzd5kZ7iuU0cOLGuamr8lRc_onfgLsFbYbPWL0AaoCn9v30=s680-w680-h510-rw"
              alt="足立小台本店"
              className="w-full h-32 object-cover"
            />
            <div className="p-4">
              <h3 className="font-bold mb-1 text-center">足立小台本店</h3>
              <p className="text-sm">足立区にある格安バイク屋です。</p>
              <Link href="/stores#adachi" className="text-red-600 underline text-sm block mt-2 text-center">
                詳細を見る
              </Link>
            </div>
          </div>
          <div className="border rounded overflow-hidden shadow-sm">
            <img
              src="https://lh3.googleusercontent.com/p/AF1QipO9gfqTiOGXc1xWxE90p1a7asvUFDH4smOC7R48=s680-w680-h510-rw"
              alt="三ノ輪店"
              className="w-full h-32 object-cover"
            />
            <div className="p-4">
              <h3 className="font-bold mb-1 text-center">三ノ輪店</h3>
              <p className="text-sm">東京都台東区の国道4号線沿いにあるレンタルバイク店です。</p>
              <Link href="/stores#minowa" className="text-red-600 underline text-sm block mt-2 text-center">
                詳細を見る
              </Link>
            </div>
          </div>
        </div>
      </section>

      <HowToUse />

      <section className="py-12 px-4">
        <div className="text-center mb-1">
          <span className="text-red-600 font-bold text-sm tracking-wide">
            FAQ
          </span>
        </div>
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

export const getStaticProps: GetStaticProps<Props> = async () => {
  const dir = path.join(process.cwd(), "blog_for_custmor");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));
  const posts = files.map((file) => {
    const slug = file.replace(/\.md$/, "");
    const md = fs.readFileSync(path.join(dir, file), "utf8");
    const lines = md.split(/\r?\n/);
    let idx = 0;
    const meta: Record<string, string> = {};
    if (lines[idx] === "---") {
      idx++;
      while (idx < lines.length && lines[idx] !== "---") {
        const [k, ...v] = lines[idx].split(":");
        if (k) meta[k.trim()] = v.join(":").trim().replace(/^"|"$/g, "");
        idx++;
      }
      idx++;
    }
    const heading = lines.find((l) => l.startsWith("# "));
    const title = meta.title || (heading ? heading.replace(/^#\s*/, "") : slug);
    const date = meta.date || slug.match(/^\d{4}-\d{2}-\d{2}/)?.[0] || "";
    const eyecatch = meta.eyecatch;
    return { slug, title, date, eyecatch };
  });

  posts.sort((a, b) => b.date.localeCompare(a.date));

  const blogSlides: BlogSlide[] = posts.slice(0, 10).map((p) => ({
    title: p.title,
    href: `/blog_for_custmor/${p.slug}`,
    img: p.eyecatch || "",
  }));

  return { props: { blogSlides } };
};


