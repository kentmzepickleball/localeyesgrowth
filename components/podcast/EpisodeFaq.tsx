"use client";

import { useState } from "react";

/* Accordion mechanic matches components/PricingFaq.tsx — CSS grid-rows
   trick (no JS height measurement), single item open at a time. */

export type EpisodeFaqItem = { q: string; a: string };

export function EpisodeFaq({ items }: { items: EpisodeFaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="mt-8">
      <style>{`
        .le-ep-faq-reveal {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows 0.55s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .le-ep-faq-reveal[data-open="true"] {
          grid-template-rows: 1fr;
        }
        .le-ep-faq-reveal-inner {
          overflow: hidden;
        }
      `}</style>
      {items.map((item, i) => {
        const open = openIndex === i;
        return (
          <div key={item.q} className="border-b border-[#261f15]/15 first:border-t">
            <button
              type="button"
              aria-expanded={open}
              aria-controls={`ep-faq-answer-${i}`}
              id={`ep-faq-question-${i}`}
              onClick={() => setOpenIndex(open ? null : i)}
              className="group flex w-full cursor-pointer items-start justify-between gap-6 py-6 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a3843f]"
            >
              <span className="font-heading font-thin not-italic text-xl leading-[1.2] tracking-tight text-[#261f15] transition-colors duration-300 group-hover:text-[#8a6f3d] sm:text-2xl">
                {item.q}
              </span>
              <span
                aria-hidden="true"
                className={`mt-1 shrink-0 text-[1rem] text-[#8a6f3d] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  open ? "rotate-45" : "rotate-0"
                }`}
              >
                ✦
              </span>
            </button>
            <div
              className="le-ep-faq-reveal"
              data-open={open}
              id={`ep-faq-answer-${i}`}
              role="region"
              aria-labelledby={`ep-faq-question-${i}`}
              aria-hidden={!open}
            >
              <div className="le-ep-faq-reveal-inner">
                <p className="pb-6 pr-10 font-sans text-sm leading-relaxed text-[#261f15]/75 sm:text-base">
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
