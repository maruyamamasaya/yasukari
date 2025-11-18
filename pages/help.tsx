import Head from 'next/head';
import { FAQItem } from '../components/FaqAccordion';
import FaqCategoryAccordion, { FaqCategory } from '../components/FaqCategoryAccordion';
import faqData from '../data/faq.json';

export default function HelpPage() {
  const categories: FaqCategory[] = (faqData as any).categories;
  const faqs: FAQItem[] = categories.flatMap((c) => c.faqs);

  return (
    <div className="help-page">
      <Head>
        <title>ヘルプ - yasukari</title>
      </Head>

      <section className="help-hero">
        <div className="help-hero__orbit" aria-hidden />
        <div className="help-hero__media">
          <img
            src="https://yasukari.com/static/images/faq/barner.jpg"
            alt="ヘルプバナー"
            className="help-hero__image"
          />
        </div>
        <div className="help-hero__content">
          <p className="help-hero__eyebrow">Support Center</p>
          <h1>ヘルプ</h1>
          <p>
            よくある質問やお問い合わせ方法をまとめました。必要な情報を最速で見つけられるよう、
            スムーズなアニメーションとシンプルな導線にアップデートしています。
          </p>
        </div>
      </section>

      <section className="help-section">
        <div className="help-section__header">
          <span className="help-section__eyebrow">FAQ</span>
          <h2>よくある質問</h2>
          <p>カテゴリ別に整理された質問をアコーディオンで確認できます。</p>
        </div>
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

      <section className="help-section help-contact">
        <div className="help-section__header">
          <span className="help-section__eyebrow">Contact</span>
          <h2>お問い合わせ</h2>
          <p>お急ぎの際はお電話で、その他はメールや来店でも承ります。</p>
        </div>
        <ul className="help-contact__list">
          <li>
            <span className="help-contact__label">電話</span>
            <span className="help-contact__value">03-5856-8075</span>
          </li>
          <li>
            <span className="help-contact__label">メール</span>
            <span className="help-contact__value">info@yasukari.com</span>
          </li>
          <li>
            <span className="help-contact__label">住所</span>
            <span className="help-contact__value">東京都足立区小台2-9-7 1階</span>
          </li>
        </ul>
      </section>
    </div>
  );
}
