import React from 'react';
import { FaCaretRight } from 'react-icons/fa';

type Step = {
  img: string;
  alt: string;
  title: string;
  desc: string;
};

export default function HowToUseEn() {
  const steps: Step[] = [
    {
      img: '/image/howto01_touka.png',
      alt: 'Choose store illustration',
      title: '1. Choose a store',
      desc:
        'Select either the Adachi-Odai main store or the Minowa store along Route 4.',
    },
    {
      img: '/image/howto02.png',
      alt: 'Reservation illustration',
      title: '2. Reserve',
      desc:
        'Check the schedule on the bike page and reserve with a credit card. Contact us for changes or cancellations.',
    },
    {
      img: '/image/howto03.png',
      alt: 'Visit illustration',
      title: '3. Visit',
      desc:
        'Bring your license and helmet between 10:00 and 18:30 and speak to our staff.',
    },
    {
      img: '/image/howto04.png',
      alt: 'Return illustration',
      title: '4. Ride & Return',
      desc:
        'Only the contract holder may ride and return the bike. Please return between 10:00 and 18:30 with a full tank.',
    },
  ];

  return (
    <section className="py-6 md:py-8">
      <div className="text-center mb-0">
        <span className="text-red-600 font-bold text-sm tracking-wide">
          How to use
        </span>
      </div>
      <p className="text-center font-bold text-lg mt-1">How to use yasukari</p>
      <div className="flex flex-col md:flex-row justify-center items-center gap-6 md:gap-2 mt-3">
        {steps.map((step, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && (
              <FaCaretRight className="hidden md:block text-gray-400 text-2xl" />
            )}
            <div className="howto-step">
              <div className="mx-auto w-full">
                <img
                  className="howto-img"
                  alt={step.alt}
                  loading="lazy"
                  decoding="async"
                  src={step.img}
                />
              </div>
              <p className="howto-title md:mt-5">{step.title}</p>
              <p className="howto-desc md:mt-3">{step.desc}</p>
            </div>
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}
