import React, { useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import FaqAccordion, { FAQItem } from './FaqAccordion';

export interface FaqCategory {
  id: string;
  title: string;
  faqs: FAQItem[];
}

export default function FaqCategoryAccordion({
  categories,
}: {
  categories: FaqCategory[];
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className="faq-category-accordion space-y-4">
      {categories.map((cat, idx) => (
        <div key={cat.id}>
          <button
            type="button"
            onClick={() => toggle(idx)}
            className={`flex items-center gap-2 w-full text-left font-semibold p-2 ${
              openIndex === idx ? '' : 'collapsed'
            }`}
          >
            <span className="flex-1">{cat.title}</span>
            <FaChevronDown
              className={`transition-transform ${openIndex === idx ? 'rotate-180' : ''}`}
            />
          </button>
          {openIndex === idx && (
            <div className="mt-2">
              <FaqAccordion faqs={cat.faqs} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
