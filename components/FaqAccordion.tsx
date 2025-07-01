import React, { useState } from 'react';

export interface FAQItem {
  q: string;
  a: string;
}

export default function FaqAccordion({ faqs }: { faqs: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIndex(prev => (prev === idx ? null : idx));
  };

  return (
    <dl className="border rounded divide-y">
      {faqs.map((faq, idx) => (
        <div key={idx} className="p-2">
          <dt>
            <button
              type="button"
              onClick={() => toggle(idx)}
              className="flex justify-between w-full font-semibold"
            >
              <span>{faq.q}</span>
              <span>{openIndex === idx ? '−' : '+'}</span>
            </button>
          </dt>
          {openIndex === idx && (
            <dd className="mt-2 text-sm">{faq.a}</dd>
          )}
        </div>
      ))}
    </dl>
  );
}
