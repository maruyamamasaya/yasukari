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
    <dl className="space-y-2">
      {faqs.map((faq, idx) => (
        <div key={idx} className="border rounded-lg bg-white shadow-sm overflow-hidden">
          <dt>
            <button
              type="button"
              onClick={() => toggle(idx)}
              className="flex items-center justify-between w-full px-4 py-3 font-semibold text-left"
            >
              <span>{faq.q}</span>
              <FaChevronDown
                className={`transition-transform ${openIndex === idx ? 'rotate-180' : ''}`}
              />
            </button>
          </dt>
          <dd
            className={`faq-answer px-4 pb-4 text-sm text-gray-700 ${openIndex === idx ? 'open' : ''}`}
          >
            {faq.a}
          </dd>
        </div>
      ))}
    </dl>
  );
}
