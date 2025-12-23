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
  // start with all categories expanded so questions are immediately visible
  const [openIndexes, setOpenIndexes] = useState<boolean[]>(
    categories.map(() => true)
  );

  const toggle = (idx: number) => {
    setOpenIndexes((prev) =>
      prev.map((open, i) => (i === idx ? !open : open))
    );
  };

  return (
    <div className="faq-category-accordion space-y-4">
      {categories.map((cat, idx) => {
        const isOpen = openIndexes[idx];

        return (
          <div key={cat.id} className="faq-category-card">
            <button
              type="button"
              onClick={() => toggle(idx)}
              className={`faq-category-trigger ${isOpen ? 'open' : ''}`}
              aria-expanded={isOpen}
            >
              <div className="faq-category-trigger__text">
                <span className="flex-1">{cat.title}</span>
              </div>
              <FaChevronDown
                className={`faq-category-trigger__icon ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>
            <div
              className={`faq-category-panel ${isOpen ? 'open' : ''}`}
              aria-hidden={!isOpen}
            >
              <FaqAccordion faqs={cat.faqs} showAll />
            </div>
          </div>
        );
      })}
    </div>
  );
}
