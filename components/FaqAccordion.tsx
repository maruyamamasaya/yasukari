import React, { useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';

export interface FAQItem {
  q: string;
  a: string;
}

export default function FaqAccordion({ faqs }: { faqs: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className="faq-accordion">
      {faqs.map((faq, idx) => {
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
    </div>
  );
}
