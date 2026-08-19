"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "lucide-react";
import { Noise } from "@/components/effects/Noise";
import { useGrowthDiagnostic } from "@/components/growth-diagnostic/GrowthDiagnosticProvider";

gsap.registerPlugin(ScrollTrigger);

/* ----------------------------------------------------------------------
   Reusable vertical/industry SEO landing page — one component, one
   content shape, instantiated per business type (see app/coffee-cart-seo,
   app/mobile-bar-seo, app/charcuterie-catering-seo). Same brand
   vocabulary as the rest of the site: hairline grid, gilded pull-stat,
   ledger-style approach list, closing CTA into the Growth Diagnostic.
   ---------------------------------------------------------------------- */

export type IndustryContent = {
  eyebrow: string;
  h1: string;
  subhead: string;
  statValue: string;
  statLabel: string;
  intro: { heading: string; paragraphs: string[] };
  approach: { heading: string; intro: string; items: { title: string; body: string }[] };
  closing: { heading: string; body: string };
};

export default function IndustryLandingPage({ content }: { content: IndustryContent }) {
  const sectionRef = useRef<HTMLElement>(null);
  const { open: openQuiz } = useGrowthDiagnostic();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const blocks = section.querySelectorAll<HTMLElement>(".le-ind-block");
    const tweens: gsap.core.Tween[] = [];
    blocks.forEach((block, i) => {
      tweens.push(
        gsap.fromTo(
          block,
          { autoAlpha: 0, y: 30 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            delay: i === 0 ? 0 : 0,
            ease: "power3.out",
            scrollTrigger: { trigger: block, start: "top 85%", once: true },
          },
        ),
      );
    });

    return () => {
      tweens.forEach((tween) => {
        tween.scrollTrigger?.kill();
        tween.kill();
      });
    };
  }, []);

  return (
    <main className="relative w-full overflow-x-clip bg-[#ededd5] text-[#261f15] selection:bg-[#c9932b] selection:text-[#261f15]">
      <section ref={sectionRef} className="relative w-full pb-24 pt-40 md:pb-32 md:pt-48">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 mx-auto flex w-full max-w-[1480px] justify-between px-6 md:px-12"
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} className="h-full w-px bg-[#261f15]/[0.07]" />
          ))}
        </div>

        <div className="relative z-20 mx-auto w-full max-w-[1480px] px-6 md:px-12">
          {/* ---------------------------- hero ---------------------------- */}
          {/* grain scoped to just the hero block (relative + its own
             bounded height) — the Noise canvas is a fixed 1024x1024
             texture stretched via CSS, so pinning it across the whole,
             much-taller page (hero through closing CTA) badly distorts
             it; every other page on the site scopes it to one section
             the same way. */}
          <div className="le-ind-block relative mx-auto max-w-3xl text-center">
            <Noise patternAlpha={5} />

            <div className="relative z-10">
              <p className="flex items-center justify-center gap-3 font-sans text-[0.62rem] font-semibold uppercase tracking-[0.3em] text-[#8a6f3d] sm:text-xs">
                <span aria-hidden="true" className="text-[0.8em]">
                  ✦
                </span>
                {content.eyebrow}
                <span aria-hidden="true" className="text-[0.8em]">
                  ✦
                </span>
              </p>

              <h1 className="mx-auto mt-5 font-heading font-thin not-italic text-[clamp(2.4rem,5.2vw,4.2rem)] leading-[1.06] tracking-[-0.01em] text-[#261f15]">
                {content.h1}
              </h1>

              <p className="mx-auto mt-6 max-w-xl font-sans text-sm leading-relaxed text-[#261f15]/65 sm:text-base">
                {content.subhead}
              </p>

              <div className="mt-9 flex flex-col items-center justify-center gap-5 sm:flex-row">
                <button
                  type="button"
                  onClick={openQuiz}
                  className="group/btn relative inline-flex cursor-pointer items-center gap-3 overflow-hidden rounded-full bg-[#c6a66a] py-2 pl-7 pr-2 font-sans text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#261f15] transition-colors duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:text-xs"
                >
                  <span className="relative z-10 py-2 transition-colors duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/btn:text-[#ededd5]">
                    Free Growth Score
                  </span>
                  <span className="relative flex h-9 w-9 shrink-0 items-center justify-center">
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 scale-100 rounded-full bg-[#261f15] transition-transform duration-500 ease-[cubic-bezier(0.33,1,0.68,1)] group-hover/btn:scale-[12] group-hover/btn:duration-[1100ms]"
                    />
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 rounded-full bg-[#261f15] transition-colors duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/btn:bg-[#c6a66a]"
                    />
                    <span className="relative z-10 flex rotate-0 transition-transform duration-700 ease-[cubic-bezier(0.34,1.2,0.4,1)] group-hover/btn:rotate-45">
                      <ArrowUpRight className="h-4 w-4 text-[#ededd5] transition-colors duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/btn:text-[#261f15]" />
                    </span>
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* ------------------------- pull-stat --------------------------- */}
          <div className="le-ind-block mx-auto mt-16 flex max-w-md items-baseline justify-center gap-4 border-y border-[#261f15]/10 py-8 text-center md:mt-20">
            <p className="font-heading font-thin not-italic text-[3.2rem] leading-none tracking-[-0.02em] text-[#8a6f3d] sm:text-[3.8rem]">
              {content.statValue}
            </p>
            <p className="max-w-[14rem] text-left font-sans text-[0.78rem] font-semibold leading-snug text-[#261f15]/60">
              {content.statLabel}
            </p>
          </div>

          {/* --------------------------- intro ----------------------------- */}
          <div className="le-ind-block mx-auto mt-16 max-w-3xl md:mt-20">
            <h2 className="font-heading font-thin not-italic text-[clamp(1.8rem,3.4vw,2.6rem)] leading-[1.15] tracking-[-0.01em] text-[#261f15]">
              {content.intro.heading}
            </h2>
            <div className="mt-6 flex flex-col gap-5">
              {content.intro.paragraphs.map((p, i) => (
                <p key={i} className="font-sans text-[1.05rem] leading-[1.75] text-[#261f15]/75">
                  {p}
                </p>
              ))}
            </div>
          </div>

          {/* -------------------------- approach --------------------------- */}
          <div className="le-ind-block mx-auto mt-16 max-w-3xl md:mt-20">
            <h2 className="font-heading font-thin not-italic text-[clamp(1.8rem,3.4vw,2.6rem)] leading-[1.15] tracking-[-0.01em] text-[#261f15]">
              {content.approach.heading}
            </h2>
            <p className="mt-5 font-sans text-[1.05rem] leading-[1.75] text-[#261f15]/75">
              {content.approach.intro}
            </p>

            <div className="mt-10 flex flex-col">
              {content.approach.items.map((item, i) => (
                <div
                  key={item.title}
                  className={`flex flex-col gap-2 py-7 sm:flex-row sm:gap-8 ${
                    i > 0 ? "border-t border-[#261f15]/10" : ""
                  }`}
                >
                  <span className="font-heading font-thin not-italic text-2xl text-[#c6a66a] sm:w-14 sm:shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-heading font-thin not-italic text-xl text-[#261f15]">
                      {item.title}
                    </h3>
                    <p className="mt-2 font-sans text-[0.95rem] leading-relaxed text-[#261f15]/70">
                      {item.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* --------------------------- closing ---------------------------- */}
          <div className="le-ind-block mx-auto mt-20 max-w-2xl rounded-[1.75rem] border border-[#c6a66a]/35 bg-[#261f15] px-8 py-12 text-center text-[#ededd5] md:mt-24 md:px-14 md:py-16">
            <h2 className="font-heading font-thin not-italic text-[clamp(1.7rem,3vw,2.3rem)] leading-[1.15] tracking-[-0.01em]">
              {content.closing.heading}
            </h2>
            <p className="mx-auto mt-4 max-w-md font-sans text-sm leading-relaxed text-[#ededd5]/65">
              {content.closing.body}
            </p>
            <button
              type="button"
              onClick={openQuiz}
              className="group/btn2 relative mt-8 inline-flex cursor-pointer items-center gap-3 overflow-hidden rounded-full bg-[#c6a66a] py-2 pl-7 pr-2 font-sans text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#261f15] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c6a66a] sm:text-xs"
            >
              <span className="relative z-10 py-2 transition-colors duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/btn2:text-[#ededd5]">
                Run My Free Growth Diagnostic
              </span>
              <span className="relative flex h-9 w-9 shrink-0 items-center justify-center">
                <span
                  aria-hidden="true"
                  className="absolute inset-0 scale-100 rounded-full bg-[#3a3020] transition-transform duration-500 ease-[cubic-bezier(0.33,1,0.68,1)] group-hover/btn2:scale-[25] group-hover/btn2:duration-[1100ms]"
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full bg-[#3a3020] transition-colors duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/btn2:bg-[#ededd5]"
                />
                <span className="relative z-10 flex rotate-0 transition-transform duration-700 ease-[cubic-bezier(0.34,1.2,0.4,1)] group-hover/btn2:rotate-45">
                  <ArrowUpRight className="h-4 w-4 text-[#ededd5] transition-colors duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/btn2:text-[#3a3020]" />
                </span>
              </span>
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
