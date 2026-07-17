"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Noise } from "../components/effects/Noise";
import {
  useCalendly,
  CALENDLY_BOOKING_URL,
} from "../components/sections/CalendlyModal";

type FAQ = {
  question: string;
  answer: string;
};

const FAQS: FAQ[] = [
  {
    question: "Why is there a 6-month commitment for The Booking Engine?",
    answer:
      "SEO and systemic growth require runway. We rebuild your local presence, restructure your citations, and engineer your site to capture search intent. It takes time for Google to index these changes and for the lead volume to stabilize. A 6-month commitment ensures we have the necessary time to deliver a measurable, permanent return on investment.",
  },
  {
    question: "Can I go month-to-month instead of committing?",
    answer:
      "Yes. The Booking Engine runs $1,800/mo and The Growth Engine $2,800/mo on a month-to-month basis. The committed rates — $1,440 and $2,200 — reward the six months of runway the work actually needs. The Solo Plan is month-to-month by design.",
  },
  {
    question: "What exactly do I get for the monthly rate?",
    answer:
      "Every plan is a working system, not a report. Depending on your tier: new SEO pages and backlinks every month, citation building, full Google Business Profile management, a lead intake form with automations, conversion optimization, and keyword tracking — from a monthly report on Solo up to a live dashboard on Growth.",
  },
  {
    question: "Are there any setup fees or hidden costs?",
    answer:
      "There are no hidden fees. Your monthly rate is comprehensive. The only additional costs would be if you choose to increase your own paid advertising budget or if you request custom, out-of-scope development work beyond the parameters of your chosen plan.",
  },
  {
    question: "Do you guarantee a specific number of bookings?",
    answer:
      "We guarantee the execution of a proven system built specifically for mobile coffee operators. We cannot honestly guarantee a specific number of bookings — your market, your pricing, and your sales process all play a role. What we control is the machine that puts high-intent, qualified inquiries in front of you.",
  },
  {
    question: "Can I upgrade from The Solo Plan to The Booking Engine later?",
    answer:
      "Absolutely. Many of our partners start on The Solo Plan to establish their baseline, and as their calendar fills and revenue grows, they graduate to The Booking Engine or Growth Engine to capture more market share and expand their fleet.",
  },
  {
    question: "How do we communicate throughout the month?",
    answer:
      "Every partner gets a dedicated LocalEyes text group channel. You have direct access to our team for quick questions, strategy adjustments, and updates. We don't hide behind a generic support desk.",
  },
];

export default function PricingFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [reduced, setReduced] = useState(false);
  const { open: openCalendly } = useCalendly();

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(motionQuery.matches);
    const update = () => setReduced(motionQuery.matches);
    motionQuery.addEventListener("change", update);
    return () => motionQuery.removeEventListener("change", update);
  }, []);

  return (
    <section
      id="faq"
      className="relative w-full overflow-hidden bg-[#ededd5] text-[#261f15]"
    >
      {/* reveal + slow-spin helpers (scoped names, no collisions) */}
      <style>{`
        .le-faq-reveal {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows 0.55s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .le-faq-reveal[data-open="true"] {
          grid-template-rows: 1fr;
        }
        .le-faq-reveal-inner {
          overflow: hidden;
        }
        .le-faq-spin-slow {
          animation: le-faq-spin 60s linear infinite;
        }
        @keyframes le-faq-spin {
          to {
            transform: rotate(360deg);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .le-faq-reveal {
            transition: none;
          }
          .le-faq-spin-slow {
            animation: none;
          }
        }
      `}</style>

      <Noise patternAlpha={10} />

      {/* Soft gold blurred circles */}
      <div
        className={`absolute top-[20%] right-[-10%] w-[50vw] h-[50vw] max-w-[800px] max-h-[800px] min-w-[400px] min-h-[400px] rounded-full bg-[#a3843f]/10 blur-[140px] pointer-events-none mix-blend-multiply ${!reduced ? "le-faq-spin-slow" : ""}`}
        aria-hidden="true"
      />
      <div
        className={`absolute bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] min-w-[300px] min-h-[300px] rounded-full bg-[#8a6f3d]/15 blur-[120px] pointer-events-none mix-blend-multiply ${!reduced ? "le-faq-spin-slow" : ""}`}
        style={{ animationDirection: "reverse" }}
        aria-hidden="true"
      />

      <div className="relative z-20 mx-auto w-full max-w-[1480px] px-6 pb-32 pt-24 md:px-12 md:pb-48 md:pt-32">
        {/* Masthead */}
        <motion.div
          initial={reduced ? false : { y: 20 }}
          whileInView={{ y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center text-center"
        >
          <p className="flex items-center justify-center gap-4 font-sans text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-[#c6a66a] sm:text-xs">
            <span aria-hidden="true" className="text-[0.8em]">
              ✦
            </span>
            Questions
            <span aria-hidden="true" className="text-[0.8em]">
              ✦
            </span>
          </p>
          <h2 className="mt-8 font-heading font-thin not-italic leading-[1.05] tracking-[-0.02em] text-[clamp(2.5rem,4vw,3.8rem)] text-[#261f15] md:mt-10">
            Frequently Asked
          </h2>
          <div aria-hidden="true" className="mt-6 h-px w-10 bg-[#a3843f]" />
        </motion.div>

        <div className="mt-16 md:mt-24 mx-auto max-w-[1000px]">
          <div className="flex flex-col">
            {FAQS.map((faq, i) => {
              const open = openIndex === i;
              const num = String(i + 1).padStart(2, "0");
              return (
                <motion.div
                  key={faq.question}
                  initial={reduced ? false : { y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true, margin: "-5%" }}
                  transition={{
                    duration: 0.7,
                    delay: i * 0.1,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="group relative border-b border-[#261f15]/20 last:border-b-0"
                >
                  {/* Soft Gold Glow behind open item */}
                  <div
                    className={`absolute inset-0 z-0 bg-gradient-to-r from-transparent via-[#a3843f]/[0.08] to-transparent transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${open ? "opacity-100" : "opacity-0"}`}
                  />

                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={`faq-answer-${i}`}
                    id={`faq-question-${i}`}
                    onClick={() => setOpenIndex(open ? null : i)}
                    className="relative z-10 flex w-full cursor-pointer items-start justify-between gap-4 py-8 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a3843f] sm:gap-8 sm:py-10"
                  >
                    {/* Oversized Ghost Numeral */}
                    <span className="absolute left-0 top-6 -z-10 font-heading not-italic text-[5rem] tabular-nums leading-none tracking-tighter text-[#261f15]/[0.04] transition-colors duration-500 sm:text-[6.5rem]">
                      {num}
                    </span>

                    <div className="flex flex-1 items-baseline gap-4 sm:gap-6 pt-2">
                      {/* Smaller visible numeral */}
                      <span className="pt-1 font-sans text-[0.6rem] font-semibold uppercase tabular-nums tracking-[0.2em] text-[#8a6f3d] shrink-0">
                        No. {num}
                      </span>

                      {/* Giant Thin-Serif Question */}
                      <span className="font-heading not-italic text-2xl leading-[1.15] tracking-tight text-[#261f15] transition-colors duration-300 group-hover:text-[#8a6f3d] sm:text-4xl">
                        {faq.question}
                      </span>

                      {/* Dotted Leader */}
                      <span className="hidden flex-1 translate-y-[-0.6em] border-b-[1.5px] border-dotted border-[#261f15]/20 sm:block" />
                    </div>

                    {/* Rotating Gold Stamp */}
                    <div className="relative mt-2 flex h-8 w-8 shrink-0 items-center justify-center sm:h-10 sm:w-10">
                      <span
                        aria-hidden="true"
                        className={`absolute text-xl text-[#8a6f3d] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] sm:text-2xl ${
                          open
                            ? "rotate-[135deg] scale-110"
                            : "rotate-0 scale-100"
                        }`}
                      >
                        ✦
                      </span>
                      <div
                        className={`absolute inset-0 rounded-full border border-[#8a6f3d]/30 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                          open ? "scale-125 opacity-0" : "scale-100 opacity-100"
                        }`}
                      />
                    </div>
                  </button>

                  <div
                    className="le-faq-reveal relative z-10"
                    data-open={open}
                    id={`faq-answer-${i}`}
                    role="region"
                    aria-labelledby={`faq-question-${i}`}
                    aria-hidden={!open}
                  >
                    <div className="le-faq-reveal-inner">
                      <div className="pb-10 pl-[3.5rem] pr-6 sm:pl-[6.5rem] sm:pr-20">
                        <p className="font-sans text-sm leading-loose text-[#261f15]/80 sm:text-base">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Final sign-off CTA */}
        <motion.div
          initial={reduced ? false : { y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-5%" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mt-24 text-center"
        >
          <p className="font-sans text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-[#8a6f3d]">
            Still have questions?
          </p>
          <a
            href={CALENDLY_BOOKING_URL}
            onClick={(e) => {
              e.preventDefault();
              openCalendly();
            }}
            className="group/cta relative mt-6 inline-flex items-center justify-center overflow-hidden rounded-full border border-[#c6a66a] bg-transparent px-8 py-3.5 font-sans text-xs font-semibold uppercase tracking-[0.15em] text-[#8a6f3d] transition-all duration-500 hover:border-[#261f15] hover:text-[#ededd5]"
          >
            <span className="relative z-10 transition-colors duration-500">
              Book a Call
            </span>
            <div className="absolute inset-0 z-0 -translate-y-full rounded-full bg-[#261f15] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/cta:translate-y-0" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
