import React, { useMemo } from "react";
import Head from "next/head";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import fs from "fs";
import path from "path";
import { GetStaticProps } from "next";
import { FaClock, FaTruck, FaStar, FaHashtag, FaMotorcycle } from "react-icons/fa";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import BikeModelCarousel, { BikeItem } from "../../components/BikeModelCarousel";
import GenreCarousel, { GenreItem } from "../../components/GenreCarousel";
import BikeLineupEn from "../../components/BikeLineupEn";
import HeroSlider from "../../components/HeroSlider";
import RecentlyViewedEn from "../../components/RecentlyViewedEn";
import FaqAccordion, { FAQItem } from "../../components/FaqAccordion";
import faqData from "../../data/faq_en.json";
import HowToUseEn from "../../components/HowToUseEn";
import { getBikeModels, BikeModel } from "../../lib/bikes";

type BlogSlide = {
  title: string;
  href: string;
  img: string;
};
interface Props {
  blogSlides: BlogSlide[];
  bikeModelsAll: BikeModel[];
}

export default function HomeEn({ blogSlides, bikeModelsAll }: Props) {
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
    { label: "Summer touring", href: "/t/scene/summer?click_from=top_keywords" },
    { label: "For beginners", href: "/t/tag/beginner?click_from=top_keywords" },
    { label: "Camping touring", href: "/blog/camp-touring?click_from=top_keywords" },
    { label: "Helmet", href: "/search?q=%E3%83%98%E3%83%AB%E3%83%A1%E3%83%83%E3%83%88&click_from=top_keywords" },
    { label: "Moped scooters", href: "/rental_bike/tag/%E5%8E%9F%E4%BB%98%E3%82%B9%E3%82%AF%E3%83%BC%E3%82%BF%E3%83%BC?click_from=top_keywords" },
    { label: "Gyro Canopy Moped", href: "/rental_bike/tag/%E3%82%B8%E3%83%A3%E3%82%A4%E3%83%AD%E3%82%AD%E3%83%A3%E3%83%8E%E3%83%93%E3%83%BC%E5%8E%9F%E4%BB%98?click_from=top_keywords" },
    { label: "Gyro Canopy Minicar", href: "/rental_bike/tag/%E3%82%B8%E3%83%A3%E3%82%A4%E3%83%AD%E3%82%AD%E3%83%A3%E3%83%8E%E3%83%93%E3%83%BC%E3%83%9F%E3%83%8B%E3%82%AB%E3%83%BC?click_from=top_keywords" },
    { label: "Class 2 scooters", href: "/rental_bike/tag/%E5%8E%9F%E4%BB%98%E4%BA%8C%E7%A8%AE%E3%82%B9%E3%82%AF%E3%83%BC%E3%82%BF%E3%83%BC?click_from=top_keywords" },
    { label: "Manual moped", href: "/rental_bike/tag/%E5%8E%9F%E4%BB%98%E3%83%9F%E3%83%83%E3%82%B7%E3%83%A7%E3%83%B3?click_from=top_keywords" },
    { label: "126-250cc", href: "/rental_bike/tag/126%E3%80%9C250cc?click_from=top_keywords" },
    { label: "251-400cc", href: "/rental_bike/tag/251%E3%80%9C400cc?click_from=top_keywords" },
    { label: "Over 400cc", href: "/rental_bike/tag/400cc%E8%B6%85?click_from=top_keywords" },
  ];

  const genreItems: GenreItem[] = [
    {
      title: "Moped Scooter",
      keywords: "50cc",
      img: "/image/category/\u539F\u4ED8\u30B9\u30AF\u30FC\u30BF\u30FC.png",
      href: "/t/genre/scooter-50cc?click_from=top_genres",
    },
    {
      title: "Gyro Canopy Moped",
      img: "/image/category/\u30B7\u3099\u30E3\u30A4\u30ED\u30AD\u30E3\u30CE\u30D3\u30FC\u539F\u4ED8.png",
      href: "/t/genre/gyrocanopy-moped?click_from=top_genres",
    },
    {
      title: "Gyro Canopy Minicar",
      img: "/image/category/\u30B7\u3099\u30E3\u30A4\u30ED\u30AD\u30E3\u30CE\u30D3\u30FC\u30DF\u30CB\u30AB\u30FC.png",
      href: "/t/genre/gyrocanopy-minicar?click_from=top_genres",
    },
    {
      title: "Class 2 Scooter",
      keywords: "~125cc",
      img: "/image/category/\u539F\u4ED8\u4E8C\u7A2E\u30B9\u30AF\u30FC\u30BF\u30FC.png",
      href: "/t/genre/scooter-125cc?click_from=top_genres",
    },
    {
      title: "Manual Moped",
      img: "/image/category/\u539F\u4ED8\u30DF\u30C3\u30B7\u30E7\u30F3.png",
      href: "/t/genre/moped-manual?click_from=top_genres",
    },
    {
      title: "126-250cc",
      img: "/image/category/126\u301C250cc.png",
      href: "/t/genre/cc126-250?click_from=top_genres",
    },
    {
      title: "251-400cc",
      img: "/image/category/251\u301C400cc.png",
      href: "/t/genre/cc251-400?click_from=top_genres",
    },
    {
      title: "Over 400cc",
      img: "/image/category/400cc\u8D85.png",
      href: "/t/genre/cc400-plus?click_from=top_genres",
    },
    {
      title: "See all models",
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
        <title>yasukari - Motorcycle Rentals</title>
      </Head>

      <HeroSlider slides={heroSlides} />

      <section className="py-6 px-4">
        <h2 className="text-sm font-semibold mb-2">Hot Keywords</h2>
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
              See more
            </Link>
          )}
        </div>
      </section>

      <section className="py-10 bg-gray-50">
        <div className="max-w-5xl mx-auto grid gap-6 md:grid-cols-3 text-center px-4">
          <FeatureItem icon={<FaClock size={28} />} title="24/7 Booking" text="Book anytime from your phone" />
          <FeatureItem icon={<FaTruck size={28} />} title="Affordable rentals" text="Easy online process" />
          <FeatureItem icon={<FaStar size={28} />} title="Well-maintained" text="Inspected by professionals" />
        </div>
      </section>

      <section className="py-8 px-4 mb-8">
        <h2 className="text-lg font-semibold mb-4">Latest Blogs & News</h2>
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
                  <img src={card.img} alt={card.title} className="square-img" />
                  <div className="blog-slide-title">{card.title}</div>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      <RecentlyViewedEn />

      <BikeLineupEn bikes={bikeModelsAll} />

      <BikeModelCarousel items={bikeModels} title="POPULAR MODELS" subtitle="Popular Models" />

      <GenreCarousel items={genreItems} title="RECOMMENDED GENRES" subtitle="Recommended categories" />

      <section className="py-10 lg:py-8 px-4">
        <h2 className="text-lg font-semibold mb-4 text-center">Which store will you use?</h2>
        <div className="max-w-4xl mx-auto grid gap-4 md:grid-cols-2">
          <div className="border rounded overflow-hidden shadow-sm">
            <img
              src="https://lh3.googleusercontent.com/gps-cs-s/AC9h4nqVQEu7iamQVzNqnomQOvgsiEUR7DIW3ZdaAHEnxWggYWnC73HV5doQ1TwHaab2CW_mPNIfW1bbR8gKFCRrVYybhzd5kZ7iuU0cOLGuamr8lRc_onfgLsFbYbPWL0AaoCn9v30=s680-w680-h510-rw"
              alt="Adachi-Odai"
              className="w-full h-32 object-cover"
            />
            <div className="p-4">
              <h3 className="font-bold mb-1 text-center">Adachi-Odai Main Store</h3>
              <p className="text-sm">Affordable bike shop in Adachi-ku.</p>
              <Link href="/stores#adachi" className="text-red-600 underline text-sm block mt-2 text-center">
                Details
              </Link>
            </div>
          </div>
          <div className="border rounded overflow-hidden shadow-sm">
            <img
              src="https://lh3.googleusercontent.com/p/AF1QipO9gfqTiOGXc1xWxE90p1a7asvUFDH4smOC7R48=s680-w680-h510-rw"
              alt="Minowa"
              className="w-full h-32 object-cover"
            />
            <div className="p-4">
              <h3 className="font-bold mb-1 text-center">Minowa Store</h3>
              <p className="text-sm">Rental bike shop on Route 4 in Taito, Tokyo.</p>
              <Link href="/stores#minowa" className="text-red-600 underline text-sm block mt-2 text-center">
                Details
              </Link>
            </div>
          </div>
        </div>
      </section>

      <HowToUseEn />

      <section className="py-8 px-4">
        <div className="text-center mb-0">
          <span className="text-red-600 font-bold text-sm tracking-wide">FAQ</span>
        </div>
        <h2 className="text-lg font-semibold mb-2 text-center">Frequently Asked Questions</h2>
        <FaqAccordion faqs={faqs} />
        <div className="mt-6 flex flex-col sm:flex-row justify-center gap-2">
          <Link href="/beginner" className="btn-primary text-center w-full sm:w-auto">
            Learn more in the beginner guide
          </Link>
          <Link href="/help" className="btn-primary text-center w-full sm:w-auto">
            See more FAQs
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
  const bikeModelsAll = await getBikeModels();

  return { props: { blogSlides, bikeModelsAll } };
};
