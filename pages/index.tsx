import React, { useMemo } from "react";
import Head from "next/head";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import fs from "fs";
import path from "path";
import { GetStaticProps } from "next";
import {
  FaClock,
  FaTruck,
  FaStar,
  FaHashtag,
  FaMotorcycle,
  FaMapMarkerAlt,
} from "react-icons/fa";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import BikeModelCarousel, { BikeItem } from "../components/BikeModelCarousel";
import GenreCarousel, { GenreItem } from "../components/GenreCarousel";
import BikeLineup from "../components/BikeLineup";
import HeroSlider from "../components/HeroSlider";
import RecentlyViewed from "../components/RecentlyViewed";
import HowToUse from "../components/HowToUse";
import SectionHeading from "../components/SectionHeading";
import FaqAccordion, { FAQItem } from "../components/FaqAccordion";
import faqData from "../data/faq.json";
import { getBikeClasses, getBikeModels, BikeClass, BikeModel } from "../lib/bikes";

type BlogSlide = {
  title: string;
  href: string;
  img: string;
};

interface Props {
  blogSlides: BlogSlide[];
  bikeModelsAll: BikeModel[];
  bikeClasses: BikeClass[];
}

export default function HomePage({ blogSlides, bikeModelsAll, bikeClasses }: Props) {
  const heroSlides = [
    { img: "https://yasukari.com/static/images/home/slide.jpg" },
    { img: "https://yasukari.com/static/images/home/slide2.jpg" },
  ];

  const faqs: FAQItem[] = useMemo(() => {
    const all: FAQItem[] = (faqData as any).categories.flatMap((c: any) => c.faqs);
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
    {
      label: "原付スクーター",
      href: "/rental_bike/tag/%E5%8E%9F%E4%BB%98%E3%82%B9%E3%82%AF%E3%83%BC%E3%82%BF%E3%83%BC?click_from=top_keywords",
    },
    {
      label: "ジャイロキャノビー原付",
      href: "/rental_bike/tag/%E3%82%B8%E3%83%A3%E3%82%A4%E3%83%AD%E3%82%AD%E3%83%A3%E3%83%8E%E3%83%93%E3%83%BC%E5%8E%9F%E4%BB%98?click_from=top_keywords",
    },
    {
      label: "ジャイロキャノビーミニカー",
      href: "/rental_bike/tag/%E3%82%B8%E3%83%A3%E3%82%A4%E3%83%AD%E3%82%AD%E3%83%A3%E3%83%8E%E3%83%93%E3%83%BC%E3%83%9F%E3%83%8B%E3%82%AB%E3%83%BC?click_from=top_keywords",
    },
    {
      label: "原付二種スクーター",
      href: "/rental_bike/tag/%E5%8E%9F%E4%BB%98%E4%BA%8C%E7%A8%AE%E3%82%B9%E3%82%AF%E3%83%BC%E3%82%BF%E3%83%BC?click_from=top_keywords",
    },
    {
      label: "原付ミッション",
      href: "/rental_bike/tag/%E5%8E%9F%E4%BB%98%E3%83%9F%E3%83%83%E3%82%B7%E3%83%A7%E3%83%B3?click_from=top_keywords",
    },
    { label: "126〜250cc", href: "/rental_bike/tag/126%E3%80%9C250cc?click_from=top_keywords" },
    { label: "251〜400cc", href: "/rental_bike/tag/251%E3%80%9C400cc?click_from=top_keywords" },
    { label: "400cc超", href: "/rental_bike/tag/400cc%E8%B6%85?click_from=top_keywords" },
  ];

  const featureHighlights = [
    {
      icon: <FaClock className="text-3xl text-red-500" />,
      title: "24時間スマート予約",
      text: "お支払いまでオンラインで完結。マイページで変更も柔軟に行えます。",
    },
    {
      icon: <FaTruck className="text-3xl text-red-500" />,
      title: "メンテナンス済みの安心車両",
      text: "プロの整備士がコンディションをチェックし、いつでもベストな状態でご用意。",
    },
    {
      icon: <FaStar className="text-3xl text-red-500" />,
      title: "レンタル特典とサポート",
      text: "充実の装備レンタルとロードサービスで、初めての長距離でも安心です。",
    },
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
      icon: <FaMotorcycle className="h-16 w-16 text-red-500" />,
      keywords: "\u00A0",
    },
  ];

  const bikeModels: BikeItem[] = [
    {
      modelName: "ドラックスター250",
      modelCode: "dragstar250",
      img: "https://yasukari.com/storage/models/DXD10WTKLvRB45VWYVtm.jpg",
      price24h: "7,980円",
    },
    {
      modelName: "クロスカブ110",
      modelCode: "crosscub110",
      img: "https://yasukari.com/storage/models/yIj7Bnk5KSgr05pITe8y.jpg",
      price24h: "6,980円",
    },
    {
      modelName: "CB400SFVボルドール",
      modelCode: "cb400sfv",
      img: "https://yasukari.com/storage/models/nXUvT7KLr38W99F5xmqy.jpg",
      price24h: "11,980円",
    },
    {
      modelName: "CB1300SFボルドール",
      modelCode: "cb1300sf",
      img: "https://yasukari.com/storage/models/nP97p32L9F4o2mL4TtX6.jpg",
      price24h: "14,980円",
    },
    {
      modelName: "CBR400R",
      modelCode: "cbr400r",
      img: "https://yasukari.com/storage/models/c9kas47ob2ulkaeppka0.jpg",
      price24h: "11,980円",
    },
    {
      modelName: "トゥデイ-2",
      modelCode: "today2",
      img: "https://yasukari.com/storage/models/chzPCoSkTibLXYsrMN93.jpg",
    },
    {
      modelName: "タクト　ベーシック",
      modelCode: "tact-basic",
      img: "https://yasukari.com/storage/models/cai2v0vob2uptbmdc4n0.jpg",
    },
  ];

  const stores = [
    {
      name: "足立小台本店",
      description: "足立区にある格安バイク屋です。",
      img: "https://lh3.googleusercontent.com/gps-cs-s/AC9h4nqVQEu7iamQVzNqnomQOvgsiEUR7DIW3ZdaAHEnxWggYWnC73HV5doQ1TwHabb2CW_mPNIfW1bbR8gKFCRrVYybhzd5kZ7iuU0cOLGuamr8lRc_onfgLsFbYbPWL0AaoCn9v30=s680-w680-h510-rw",
      href: "/stores#adachi",
    },
    {
      name: "三ノ輪店",
      description: "東京都台東区の国道4号線沿いにあるレンタルバイク店です。",
      img: "https://lh3.googleusercontent.com/p/AF1QipO9gfqTiOGXc1xWxE90p1a7asvUFDH4smOC7R48=s680-w680-h510-rw",
      href: "/stores#minowa",
    },
  ];

  return (
    <>
      <Head>
        <title>yasukari - バイクレンタルサイト</title>
      </Head>

      <HeroSlider slides={heroSlides} />

      <RecentlyViewed />

      <BikeLineup bikes={bikeModelsAll} classes={bikeClasses} />

      <section className="section-surface section-padding">
        <SectionHeading
          eyebrow="Stores"
          title="お近くの店舗を選ぶ"
          description="都内2店舗で営業中。アクセスの良い立地と広々としたピットで、受け取りから返却まで快適にご利用いただけます。"
        />
        <div className="grid gap-6 md:grid-cols-2">
          {stores.map((store) => (
            <article
              key={store.name}
              className="group overflow-hidden rounded-2xl border border-white/60 bg-white/80 shadow-[0_28px_42px_-30px_rgba(15,23,42,0.6)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_36px_62px_-34px_rgba(220,38,38,0.45)]"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={store.img}
                  alt={store.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-red-500 shadow">
                  <FaMapMarkerAlt />
                  {store.name}
                </span>
              </div>
              <div className="flex flex-col gap-3 px-6 py-6">
                <p className="text-sm text-slate-600">{store.description}</p>
                <Link href={store.href} className="inline-flex items-center gap-2 text-sm font-semibold text-red-500">
                  詳細を見る
                  <span aria-hidden>→</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <BikeModelCarousel
        items={bikeModels}
        title="人気モデル"
        subtitle="ライダーに選ばれる定番モデル"
        headingTitle="ライダーに選ばれる定番モデル"
        headingDescription="快適さとデザイン、価格のバランスに優れ、初めてのレンタルにもおすすめのラインアップです。"
      />

      <GenreCarousel
        items={genreItems}
        title="おすすめジャンル"
        subtitle="利用シーンから探す"
        headingTitle="利用シーンから探す"
        headingDescription="利用シーンがイメージしやすいカテゴリから、ぴったりのバイクを見つけましょう。"
      />

      <section className="section-surface section-padding">
        <SectionHeading
          eyebrow="Why yasukari"
          title="選ばれる3つの理由"
          description="スムーズな予約体験、整備士による徹底管理、そしてライダー目線のサポート。最新のオンライン体験で、旅の準備時間をぐっと短縮します。"
        />
        <div className="grid gap-6 md:grid-cols-3">
          {featureHighlights.map((feature) => (
            <FeatureHighlight key={feature.title} {...feature} />
          ))}
        </div>
      </section>

      <HowToUse />

      <section className="section-surface section-padding faq-section">
        <div className="faq-section__inner">
          <SectionHeading
            eyebrow="FAQ"
            title="よくある質問"
            description="料金・保険・予約変更など、よくいただく質問をまとめました。もっと詳しく知りたいときは、ヘルプページもご覧ください。"
          />
          <FaqAccordion faqs={faqs} />
          <div className="faq-section__actions mt-8">
            <Link href="/beginner" className="btn-primary w-full justify-center sm:w-auto">
              はじめてガイドで利用の流れを詳しく知る
            </Link>
            <Link href="/help" className="btn-primary w-full justify-center sm:w-auto">
              その他のよくあるご質問をもっと見る
            </Link>
          </div>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: faqs.map((f) => ({
                  "@type": "Question",
                  name: f.q,
                  acceptedAnswer: { "@type": "Answer", text: f.a },
                })),
              }),
            }}
          />
        </div>
      </section>

      <section className="section-surface section-padding">
        <SectionHeading
          eyebrow="News & Blog"
          title="新着ブログ・お知らせ"
          description="店舗からのお知らせや、レンタルのコツをスタッフが発信中。旅前の準備に役立つコンテンツを毎週更新しています。"
        />
        <div className="mt-8">
          <Swiper
            modules={[Autoplay, Navigation, Pagination]}
            spaceBetween={16}
            navigation
            pagination={{ clickable: true }}
            autoplay={{ delay: 3200 }}
            loop
            breakpoints={{
              0: { slidesPerView: 1 },
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
          >
            {blogSlides.map((card, index) => (
              <SwiperSlide key={index}>
                <Link href={card.href} className="block h-full">
                  <div className="blog-slide h-full">
                    <img src={card.img} alt={card.title} className="h-full w-full object-cover" />
                    <div className="blog-slide-title">{card.title}</div>
                  </div>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      <section className="section-surface section-padding">
        <SectionHeading
          eyebrow="Trending Now"
          title="注目キーワード"
          description="季節のおすすめや人気カテゴリから、気になるトピックをすぐにチェックできます。気軽な散策から本格ツーリングまで、あなたの目的に合うキーワードをピックアップ。"
        />
        <div className="flex flex-wrap justify-center gap-3">
          {hotKeywords.map((k, idx) => (
            <Link
              key={idx}
              href={k.href}
              className="group inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-[0_12px_28px_-18px_rgba(220,38,38,0.35)] transition hover:-translate-y-0.5 hover:border-red-200 hover:bg-white"
            >
              <FaHashtag className="text-base text-red-500 transition group-hover:text-red-600" />
              <span>{k.label}</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

function FeatureHighlight({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <article className="flex h-full flex-col gap-4 rounded-2xl border border-white/60 bg-white/80 p-6 text-center shadow-[0_20px_40px_-28px_rgba(15,23,42,0.4)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_32px_52px_-28px_rgba(220,38,38,0.4)]">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100/70 text-red-500">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
      <p className="text-sm leading-relaxed text-slate-600">{text}</p>
    </article>
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
  const [bikeModelsAll, bikeClasses] = await Promise.all([
    getBikeModels(),
    getBikeClasses(),
  ]);

  return { props: { blogSlides, bikeModelsAll, bikeClasses }, revalidate: 60 };
};
