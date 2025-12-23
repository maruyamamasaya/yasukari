import React, { useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';

export interface FAQItem {
  q: string;
  a: string;
}

export default function FaqAccordion({
  faqs,
  showAll = false,
}: {
  faqs: FAQItem[];
  showAll?: boolean;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [expandedAll, setExpandedAll] = useState(showAll);

  const toggle = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  const visibleFaqs = showAll || expandedAll ? faqs : faqs.slice(0, 3);

  return (
    <div className="faq-accordion">
      {visibleFaqs.map((faq, idx) => {
        const isOpen = openIndex === idx;

        return (
          <dl key={idx} className="faq-row">
            <dt>
              <button
                type="button"
                onClick={() => toggle(idx)}
                className={`faq-question ${isOpen ? 'open' : ''}`}
                aria-expanded={isOpen}
              >
                <span className="faq-question__eyebrow">Q</span>
                <span className="flex-1">{faq.q}</span>
                <FaChevronDown
                  className={`faq-question__icon ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>
            </dt>
            <dd className={`faq-answer ${isOpen ? 'open' : ''}`} aria-hidden={!isOpen}>
              <div className="faq-answer__surface">
                <p>{faq.a}</p>
              </div>
            </dd>
          </dl>
        );
      })}
      {!showAll && faqs.length > 3 ? (
        <button
          type="button"
          onClick={() => setExpandedAll((prev) => !prev)}
          className="btn-primary mt-2 w-full justify-center"
        >
          {expandedAll ? "閉じる" : "もっと見る"}
        </button>
      ) : null}
    </div>
  );
}
