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
  FaMapMarkerAlt,
} from "react-icons/fa";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import BikeModelCarousel from "../../components/BikeModelCarousel";
import BikeLineupEn from "../../components/BikeLineupEn";
import HeroSlider from "../../components/HeroSlider";
import RecentlyViewedEn from "../../components/RecentlyViewedEn";
import FaqAccordion, { FAQItem } from "../../components/FaqAccordion";
import faqData from "../../data/faq_en.json";
import HowToUseEn from "../../components/HowToUseEn";
import SectionHeading from "../../components/SectionHeading";
import { getBikeClasses, getBikeModels, BikeClass, BikeModel } from "../../lib/bikes";

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

export default function HomeEn({ blogSlides, bikeModelsAll, bikeClasses }: Props) {
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
    {
      label: "Moped scooters",
      href: "/rental_bike/tag/%E5%8E%9F%E4%BB%98%E3%82%B9%E3%82%AF%E3%83%BC%E3%82%BF%E3%83%BC?click_from=top_keywords",
    },
    {
      label: "Gyro Canopy Moped",
      href: "/rental_bike/tag/%E3%82%B8%E3%83%A3%E3%82%A4%E3%83%AD%E3%82%AD%E3%83%A3%E3%83%8E%E3%83%93%E3%83%BC%E5%8E%9F%E4%BB%98?click_from=top_keywords",
    },
    {
      label: "Gyro Canopy Minicar",
      href: "/rental_bike/tag/%E3%82%B8%E3%83%A3%E3%82%A4%E3%83%AD%E3%82%AD%E3%83%A3%E3%83%8E%E3%83%93%E3%83%BC%E3%83%9F%E3%83%8B%E3%82%AB%E3%83%BC?click_from=top_keywords",
    },
    {
      label: "Class 2 scooters",
      href: "/rental_bike/tag/%E5%8E%9F%E4%BB%98%E4%BA%8C%E7%A8%AE%E3%82%B9%E3%82%AF%E3%83%BC%E3%82%BF%E3%83%BC?click_from=top_keywords",
    },
    {
      label: "Manual moped",
      href: "/rental_bike/tag/%E5%8E%9F%E4%BB%98%E3%83%9F%E3%83%83%E3%82%B7%E3%83%A7%E3%83%B3?click_from=top_keywords",
    },
    { label: "126-250cc", href: "/rental_bike/tag/126%E3%80%9C250cc?click_from=top_keywords" },
    { label: "251-400cc", href: "/rental_bike/tag/251%E3%80%9C400cc?click_from=top_keywords" },
    { label: "Over 400cc", href: "/rental_bike/tag/400cc%E8%B6%85?click_from=top_keywords" },
  ];

  const featureHighlights = [
    {
      icon: <FaClock className="text-3xl text-red-500" />,
      title: "24/7 online booking",
      text: "Reserve anytime and manage your schedule through your personal dashboard.",
    },
    {
      icon: <FaTruck className="text-3xl text-red-500" />,
      title: "Professionally maintained",
      text: "Our mechanics inspect each bike before every rental for maximum peace of mind.",
    },
    {
      icon: <FaStar className="text-3xl text-red-500" />,
      title: "Premium support",
      text: "Rental gear, roadside assistance, and multilingual help keep your trip smooth.",
    },
  ];

  const stores = [
    {
      name: "Adachi-Odai Main Store",
      description: "Affordable rental bikes in Adachi-ku with a wide selection ready to ride.",
      img: "https://lh3.googleusercontent.com/gps-cs-s/AC9h4nqVQEu7iamQVzNqnomQOvgsiEUR7DIW3ZdaAHEnxWggYWnC73HV5doQ1TwHabb2CW_mPNIfW1bbR8gKFCRrVYybhzd5kZ7iuU0cOLGuamr8lRc_onfgLsFbYbPWL0AaoCn9v30=s680-w680-h510-rw",
      href: "/stores#adachi",
    },
    {
      name: "Minowa Store",
      description: "Located along Route 4 in Taito Ward, perfect for quick pick-ups and returns.",
      img: "https://lh3.googleusercontent.com/p/AF1QipO9gfqTiOGXc1xWxE90p1a7asvUFDH4smOC7R48=s680-w680-h510-rw",
      href: "/stores#minowa",
    },
  ];

  return (
    <>
      <Head>
        <title>yasukari - Motorcycle Rentals</title>
      </Head>

      <HeroSlider slides={heroSlides} />

      <RecentlyViewedEn />

      <BikeLineupEn bikes={bikeModelsAll} classes={bikeClasses} />

      <section className="section-surface section-padding">
        <SectionHeading
          eyebrow="Stores"
          title="Choose your pick-up location"
          description="Two stores in Tokyo offer quick access and spacious pits to prepare for your journey."
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
                  View details
                  <span aria-hidden>→</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <BikeModelCarousel
        items={bikeModelsAll}
        detailLabel="View details"
        pricePrefix="24 hours"
      />

      <section className="section-surface section-padding">
        <SectionHeading
          eyebrow="Why yasukari"
          title="Three reasons riders choose us"
          description="Enjoy a seamless digital experience, meticulously maintained bikes, and supportive staff ready to help before, during, and after your trip."
        />
        <div className="grid gap-6 md:grid-cols-3">
          {featureHighlights.map((feature) => (
            <FeatureHighlight key={feature.title} {...feature} />
          ))}
        </div>
      </section>

      <HowToUseEn />

      <section className="section-surface section-padding faq-section">
        <div className="faq-section__inner">
          <SectionHeading
            eyebrow="FAQ"
            title="Frequently asked questions"
            description="Find answers on pricing, insurance, and reservation changes. Our support team is only a chat away if you need more help."
          />
          <FaqAccordion faqs={faqs} />
          <div className="faq-section__actions mt-8">
            <Link href="/beginner" className="btn-primary w-full justify-center sm:w-auto">
              Learn more in the beginner guide
            </Link>
            <Link href="/help" className="btn-primary w-full justify-center sm:w-auto">
              See more FAQs
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
          title="Latest updates from the team"
          description="Stay informed with maintenance tips, touring ideas, and important service announcements updated weekly."
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
          title="Hot keywords"
          description="Discover seasonal picks and trending topics to plan your next ride in seconds."
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

  return { props: { blogSlides, bikeModelsAll, bikeClasses } };
};
