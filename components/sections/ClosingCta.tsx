"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "lucide-react";
import { Noise } from "@/components/effects/Noise";
import {
  useCalendly,
  CALENDLY_BOOKING_URL,
} from "../../components/sections/CalendlyModal";

gsap.registerPlugin(ScrollTrigger);

/* ----------------------------------------------------------------------
   Closing CTA — the last word
   A deep-ink closing statement: one big confident heading, one quiet
   line under it, and two actions with unmistakable hierarchy.
   - "Book a Call" is the primary — a solid gold pill in the header
     button's exact animation language: on hover the ink circle floods
     the pill, the icon chip inverts to gold and the arrow turns — all
     transform/color, GPU-friendly.
   - "Or apply for the Solo Plan" is the genuine-alternative secondary:
     a quiet text link with a small gold ✦ and a standing gold
     underline; on hover it lifts gently with a soft gold bloom.
   - Staggered scroll-in: heading, then sub-text, then the actions,
     with the same premium easing as the rest of the page. GSAP tweens
     only the three wrapper divs (.le-cta-head / .le-cta-sub /
     .le-cta-actions); all CSS transitions live on the links, so the
     two never fight.
   - The whole composition is centered as a group, horizontally and
     vertically, with generous air — but the band stays compact.
   - Grain sits ABOVE the ink ground, BELOW every word and button.
   - Accessible: real links, visible gold focus rings, generous hit
     areas; prefers-reduced-motion strips every reveal and hover move.
   - NO italics, no divider lines.
   Wire the two placeholder hrefs below to the real pages.
   ---------------------------------------------------------------------- */

type QuizModalComponent = ComponentType<{ open: boolean; onClose: () => void }>;

export default function ClosingCta() {
  const sectionRef = useRef<HTMLElement>(null);
  const { open: openCalendly } = useCalendly();

  /* Growth Diagnostic quiz — lazy-loaded on first click (same pattern as
     the Hero), then kept mounted so reopening is instant */
  const [quizOpen, setQuizOpen] = useState(false);
  const [QuizModal, setQuizModal] = useState<QuizModalComponent | null>(null);

  const openQuiz = () => {
    setQuizOpen(true);
    if (!QuizModal) {
      import("../growth-diagnostic/GrowthDiagnosticModal").then((m) =>
        setQuizModal(() => m.default),
      );
    }
  };

  /* Staggered reveal — heading, sub-text, actions; plays once,
     skipped entirely under reduced motion */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const parts = [
      section.querySelector<HTMLElement>(".le-cta-head"),
      section.querySelector<HTMLElement>(".le-cta-sub"),
      section.querySelector<HTMLElement>(".le-cta-actions"),
    ].filter((part): part is HTMLElement => part !== null);

    const tweens = parts.map((part, i) =>
      gsap.fromTo(
        part,
        { autoAlpha: 0, y: 34 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1,
          delay: i * 0.16,
          ease: "power3.out",
          scrollTrigger: { trigger: section, start: "top 80%", once: true },
        },
      ),
    );

    return () => {
      tweens.forEach((tween) => {
        tween.scrollTrigger?.kill();
        tween.kill();
      });
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="closing-cta"
      className="relative w-full overflow-hidden bg-[#261f15] text-[#ededd5]"
    >
      <style>{`
        /* secondary — gold underline present from the start, and the
           same hover language as the primary: a lift with a soft gold
           bloom swelling behind it (transform/opacity only) */
        .le-cta-secondary {
          transition:
            transform 0.55s cubic-bezier(0.22, 1, 0.36, 1),
            color 0.45s cubic-bezier(0.22, 1, 0.36, 1);
          will-change: transform;
        }
        .le-cta-secondary::after {
          content: "";
          position: absolute;
          inset: -30% -14%;
          border-radius: 9999px;
          background: radial-gradient(
            closest-side,
            rgba(198, 166, 106, 0.26),
            transparent 72%
          );
          opacity: 0;
          transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1);
          pointer-events: none;
        }
        .le-cta-secondary .le-cta-underline { position: relative; }
        .le-cta-secondary .le-cta-underline::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          bottom: -5px;
          height: 1px;
          background: #c6a66a;
        }
        .le-cta-secondary:hover {
          color: #ededd5;
          transform: translateY(-3px);
        }
        .le-cta-secondary:hover::after { opacity: 1; }

        @media (prefers-reduced-motion: reduce) {
          .le-cta-secondary,
          .le-cta-secondary::after { transition: none; }
          .le-cta-secondary:hover { transform: none; }
        }
      `}</style>

      {/* Film grain — above the ink ground, below every word and button */}
      <Noise patternAlpha={12} />

      {/* centered as a group — horizontally AND vertically — with
         generous air, but still a compact band */}
      <div className="relative z-20 mx-auto flex w-full max-w-[1480px] flex-col items-center justify-center px-6 py-24 text-center md:px-12 md:py-36">
        {/* ------------------------- heading --------------------------- */}
        <div className="le-cta-head">
          <h2 className="font-heading font-thin not-italic text-[clamp(2.7rem,8vw,6.25rem)] leading-[1.04] tracking-[-0.02em] text-[#ededd5]">
            Ready to Book More&nbsp;Events?
          </h2>
        </div>

        {/* ------------------------ sub-text --------------------------- */}
        <div className="le-cta-sub mt-5 md:mt-6">
          <p className="mx-auto max-w-md font-sans text-[0.8rem] leading-relaxed text-[#ededd5]/60 sm:text-sm">
            Stop wasting your time — get free leads that pay for SEO in no time.
          </p>
        </div>

        {/* ------------------------- actions ---------------------------
           Primary first (also first in the mobile stack); the secondary
           reads as a genuine alternative, not a second equal button. */}
        <div className="le-cta-actions mt-10 flex w-full flex-col items-center gap-6 sm:w-auto sm:flex-row sm:gap-9 md:mt-12">
          {/* the header's button language: on hover the ink circle
             floods the pill, the icon chip inverts to gold, the arrow
             turns — same animation, closing-CTA colors */}
          <a
            href={CALENDLY_BOOKING_URL}
            onClick={(e) => {
              e.preventDefault();
              openCalendly();
            }}
            className="group/btn relative inline-flex cursor-pointer items-center gap-3 overflow-hidden rounded-full bg-[#c6a66a] py-2 pl-7 pr-2 font-sans text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#261f15] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c6a66a] sm:gap-3.5 sm:pl-8 sm:text-xs"
          >
            <span className="relative z-10 py-2 transition-colors duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/btn:text-[#ededd5]">
              Book a Call
            </span>
            <span className="relative flex h-10 w-10 shrink-0 items-center justify-center sm:h-11 sm:w-11">
              {/* ink wash — slow flood in, quicker retreat out */}
              <span
                aria-hidden="true"
                className="absolute inset-0 scale-100 rounded-full bg-[#261f15] transition-transform duration-500 ease-[cubic-bezier(0.33,1,0.68,1)] group-hover/btn:scale-[12] group-hover/btn:duration-[1100ms]"
              />
              {/* icon chip — ink at rest, inverts to gold on hover */}
              <span
                aria-hidden="true"
                className="absolute inset-0 rounded-full bg-[#261f15] transition-colors duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/btn:bg-[#c6a66a]"
              />
              <span className="relative z-10 flex rotate-0 will-change-transform transition-transform duration-700 ease-[cubic-bezier(0.34,1.2,0.4,1)] group-hover/btn:rotate-45">
                <ArrowUpRight className="h-4 w-4 text-[#ededd5] transition-colors duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/btn:text-[#261f15]" />
              </span>
            </span>
          </a>

          <button
            type="button"
            onClick={openQuiz}
            className="le-cta-secondary relative inline-flex cursor-pointer items-center gap-2.5 px-2 py-3 font-sans text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#ededd5]/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c6a66a] sm:text-xs"
          >
            <span aria-hidden="true" className="text-[0.8em] text-[#c6a66a]">
              ✦
            </span>
            <span className="le-cta-underline">Assessments</span>
          </button>
        </div>
      </div>

      {/* Growth Diagnostic modal — mounted after the first open */}
      {QuizModal && (
        <QuizModal open={quizOpen} onClose={() => setQuizOpen(false)} />
      )}
    </section>
  );
}
