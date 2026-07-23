"use client";

import { useState, type ComponentType } from "react";
import { ArrowUpRight } from "lucide-react";
import { HeroOptionWheel } from "./HeroOptionWheel";
import { Noise } from "../../components/effects/Noise";

type QuizModalComponent = ComponentType<{ open: boolean; onClose: () => void }>;

export default function Hero() {
  /* Growth Diagnostic — the whole quiz chunk (component + its CSS +
     canvas-confetti) stays OUT of the initial bundle and loads on the
     first click; afterwards it stays mounted so reopening is instant. */
  const [quizOpen, setQuizOpen] = useState(false);
  const [QuizModal, setQuizModal] = useState<QuizModalComponent | null>(null);

  const openQuiz = () => {
    setQuizOpen(true);
    if (!QuizModal) {
      import("../growth-diagnostic/GrowthDiagnosticModal")
        .then((m) => setQuizModal(() => m.default))
        .catch(() => setQuizOpen(false));
    }
  };

  return (
    <section className="relative flex h-full min-h-svh w-full flex-col overflow-hidden bg-[#ededd5] text-[#261f15]">
      {/* Vertical hairlines — quiet editorial grid behind everything */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 mx-auto flex w-full max-w-[1480px] justify-between px-6 md:px-12"
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className="h-full w-px bg-[#261f15]/[0.07]" />
        ))}
      </div>

      {/* React Bits Noise — animated film grain over the whole section */}
      <Noise patternAlpha={14} />

      {/* Flanking editorial micro-labels — quiet 70s magazine detail */}
      <span
        aria-hidden="true"
        className="absolute left-6 top-1/2 z-20 hidden -translate-y-1/2 -rotate-90 font-sans text-[0.58rem] font-semibold uppercase tracking-[0.34em] text-[#261f15]/35 lg:block"
      >
        MMXXIII
      </span>
      <span
        aria-hidden="true"
        className="absolute right-6 top-1/2 z-20 hidden -translate-y-1/2 rotate-90 font-sans text-[0.58rem] font-semibold uppercase tracking-[0.34em] text-[#261f15]/35 lg:block"
      >
        Tbilisi, Georgia
      </span>

      {/* Slow-spinning circular brand badge with a still star at its heart */}
      <div
        aria-hidden="true"
        className="absolute bottom-[9%] right-[6%] z-20 hidden h-32 w-32 items-center justify-center lg:flex"
      >
        <svg
          viewBox="0 0 100 100"
          className="h-full w-full animate-le-spin-slow"
          fill="none"
        >
          <defs>
            <path
              id="le-badge-circle"
              d="M 50,50 m -37,0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
            />
          </defs>
          <text
            className="font-sans"
            fill="#261f15"
            fillOpacity="0.5"
            fontSize="6.1"
            fontWeight="600"
            letterSpacing="1.9"
          >
            <textPath href="#le-badge-circle" startOffset="0">
              LOCALEYES ✦ SEO GROWTH SYSTEMS ✦ EST. MMXXIII ✦
            </textPath>
          </text>
        </svg>
        <span className="absolute font-heading text-3xl leading-none text-[#c6a66a]">
          ✦
        </span>
      </div>

      {/* ---------- Centered content ---------- */}
      <div className="relative z-20 mx-auto flex w-full max-w-6xl flex-col items-center px-6 pt-40 text-center md:pt-52">
        {/* Eyebrow — tracks in from wide letter-spacing with a soft focus pull */}
        <h1 className="flex items-center gap-3 font-sans text-[0.62rem] font-semibold uppercase tracking-[0.26em] text-[#c6a66a] sm:text-xs animate-le-eyebrow-in">
          <span aria-hidden="true" className="text-[0.8em]">
            ✦
          </span>
          Catering SEO Services for Coffee Carts, Mobile Bars & Every Kind of Caterer
          <span aria-hidden="true" className="text-[0.8em]">
            ✦
          </span>
        </h1>

        {/* Headline — each word rises out of its own clipping mask, staggered */}
        <p className="mt-[13px] max-w-6xl text-balance font-heading font-thin not-italic text-[2.6rem] leading-[1.05] tracking-[-0.015em] sm:text-6xl lg:text-[5.2rem]">
          {"Growing Event Brands that Dominate Their Cities Search"
            .split(" ")
            .map((word, i, arr) => (
              <span key={i}>
                <span className="inline-block overflow-hidden pb-[0.14em] -mb-[0.14em] pt-[0.08em] -mt-[0.08em] pl-[0.06em] -ml-[0.06em] align-baseline">
                  <span
                    className="inline-block animate-le-word-rise"
                    style={{ animationDelay: `${200 + i * 85}ms` }}
                  >
                    {word}
                  </span>
                </span>
                {i < arr.length - 1 && " "}
              </span>
            ))}
        </p>

        {/* CTA pair — same mechanic as the header CTA (pill + icon chip + slow bloom) */}
        <div
          className="mt-10 flex w-full flex-row flex-wrap items-center justify-center gap-3 sm:mt-12 sm:w-auto sm:gap-5 animate-le-fade-up"
          style={{ animationDelay: "760ms" }}
        >
          {/* Growth Diagnostic — same pill mechanic, gold chip; opens the
              quiz modal (lazy-loaded on first click) */}
          <button
            type="button"
            onClick={openQuiz}
            className="group/btn3 relative inline-flex w-auto cursor-pointer items-center justify-center gap-2.5 overflow-hidden rounded-full border border-[#261f15]/25 py-1 pl-4 pr-1 font-sans text-[0.62rem] font-semibold tracking-[0.12em] uppercase text-[#261f15] transition-colors duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:gap-3 sm:py-1.5 sm:pl-6 sm:pr-1.5 sm:text-xs sm:tracking-[0.14em]"
          >
            <span className="relative z-10 py-1 transition-colors duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/btn3:text-white">
              Free Growth Score
            </span>
            <span className="relative flex h-8 w-8 shrink-0 items-center justify-center sm:h-9 sm:w-9">
              <span
                aria-hidden="true"
                className="absolute inset-0 rounded-full bg-[#a67c3d] scale-100 transition-transform duration-500 ease-[cubic-bezier(0.33,1,0.68,1)] group-hover/btn3:scale-[14] group-hover/btn3:duration-[1100ms]"
              />
              <span
                aria-hidden="true"
                className="absolute inset-0 rounded-full bg-[#a67c3d] transition-colors duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/btn3:bg-white"
              />
              <span className="relative z-10 flex rotate-0 transition-transform duration-700 ease-[cubic-bezier(0.34,1.2,0.4,1)] group-hover/btn3:rotate-45 will-change-transform">
                <ArrowUpRight className="h-4 w-4 text-[#ededd5] transition-colors duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/btn3:text-[#a67c3d]" />
              </span>
            </span>
          </button>

          {/* Secondary — same pill, terracotta chip */}
          <a
            href="/pricing"
            className="group/btn2 relative inline-flex w-auto cursor-pointer items-center justify-center gap-2.5 overflow-hidden rounded-full border border-[#4a3421]/25 py-1 pl-4 pr-1 font-sans text-[0.62rem] font-semibold tracking-[0.12em] uppercase text-[#4a3421] transition-colors duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:gap-3 sm:py-1.5 sm:pl-6 sm:pr-1.5 sm:text-xs sm:tracking-[0.14em]"
          >
            <span className="relative z-10 py-1 transition-colors duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/btn2:text-white">
              Pricing
            </span>
            <span className="relative flex h-8 w-8 shrink-0 items-center justify-center sm:h-9 sm:w-9">
              <span
                aria-hidden="true"
                className="absolute inset-0 rounded-full bg-[#4a3421] scale-100 transition-transform duration-500 ease-[cubic-bezier(0.33,1,0.68,1)] group-hover/btn2:scale-[14] group-hover/btn2:duration-[1100ms]"
              />
              <span
                aria-hidden="true"
                className="absolute inset-0 rounded-full bg-[#4a3421] transition-colors duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/btn2:bg-white"
              />
              <span className="relative z-10 flex rotate-0 transition-transform duration-700 ease-[cubic-bezier(0.34,1.2,0.4,1)] group-hover/btn2:rotate-45 will-change-transform">
                <ArrowUpRight className="h-4 w-4 text-[#ededd5] transition-colors duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/btn2:text-[#a67c3d]" />
              </span>
            </span>
          </a>
        </div>

        {/* Stat line */}
        <p
          className="mt-10 font-sans text-[0.7rem] uppercase tracking-[0.12em] text-[#261f15]/55 sm:text-sm animate-le-fade-up"
          style={{ animationDelay: "880ms" }}
        >
          <span className="mr-1.5 font-heading normal-case tracking-normal text-xl text-[#c6a66a] sm:text-2xl align-[-0.08em]">
            $350k+
          </span>
          Generated in Client Bookings each Month
        </p>
      </div>

      {/* ---------- Bottom: React Bits OptionWheel — drag / scroll / arrow keys to spin ---------- */}
      <div className="relative z-20 w-full">
        {/* soft cream fades at both ends so items roll in/out gracefully */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#ededd5] to-transparent sm:w-40"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#ededd5] to-transparent sm:w-40"
        />
        <HeroOptionWheel />
      </div>

      {/* Scroll cue — micro label + hairline track with a dripping accent */}
      <a
        href="#results"
        aria-label="Scroll down to results"
        className="group/scroll relative z-20 mt-8 mb-8 flex cursor-pointer flex-col items-center gap-3 self-center animate-le-fade-up sm:mt-auto"
        style={{ animationDelay: "1000ms" }}
      >
        <span className="font-sans text-[0.58rem] font-semibold uppercase tracking-[0.34em] text-[#261f15]/45 transition-colors duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/scroll:text-[#c6a66a]">
          Scroll
        </span>
        <span className="relative block h-12 w-px overflow-hidden bg-[#261f15]/15">
          <span className="absolute left-0 top-0 h-1/2 w-px bg-[#c6a66a] animate-le-scroll-drip" />
        </span>
      </a>

      {/* Growth Diagnostic modal — mounted after the first open */}
      {QuizModal && (
        <QuizModal open={quizOpen} onClose={() => setQuizOpen(false)} />
      )}
    </section>
  );
}
