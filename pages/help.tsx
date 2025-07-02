import Head from 'next/head';
import { FAQItem } from '../components/FaqAccordion';
import FaqCategoryAccordion, { FaqCategory } from '../components/FaqCategoryAccordion';
import faqData from '../data/faq.json';

export default function HelpPage() {
  const categories: FaqCategory[] = (faqData as any).categories;
  const faqs: FAQItem[] = categories.flatMap((c) => c.faqs);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8 text-sm leading-relaxed">
      <Head>
        <title>ヘルプ - yasukari</title>
      </Head>

      <img
        src="https://yasukari.com/static/images/faq/barner.jpg"
        alt="ヘルプバナー"
        className="w-full h-[300px] object-cover mb-6"
      />

      <h1 className="text-2xl font-bold mb-6 text-center">ヘルプ</h1>

      <section>
        <h2 className="text-lg font-semibold mb-4 text-center">よくある質問</h2>
        <FaqCategoryAccordion categories={categories} />
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

      <section className="space-y-2 text-center">
        <h2 className="text-lg font-semibold">お問い合わせ</h2>
        <ul className="space-y-1">
          <li>電話: 03-5856-8075</li>
          <li>メール: info@yasukari.com</li>
          <li>住所: 東京都足立区小台2-9-7 1階</li>
        </ul>
      </section>
    </div>
  );
}
