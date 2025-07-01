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
      {faqs.map((faq, idx) => (
        <dl key={idx} className="py-2 sm:py-3">
          <dt className="mt-0">
            <button
              type="button"
              onClick={() => toggle(idx)}
              className={`flex items-baseline gap-2 w-full text-left ${openIndex === idx ? '' : 'collapsed'}`}
            >
              <span className="text-primary">Q</span>
              <span className="flex-1">{faq.q}</span>
              <FaChevronDown
                className={`transition-transform ${openIndex === idx ? 'rotate-180' : ''}`}
              />
            </button>
          </dt>
          <dd
            className={`faq-answer my-0 ${openIndex === idx ? 'open' : ''}`}
          >
            <p>{faq.a}</p>
          </dd>
        </dl>
      ))}
    </div>
  );
}
