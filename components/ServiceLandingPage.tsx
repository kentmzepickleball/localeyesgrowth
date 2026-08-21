"use client";

import Image, { type StaticImageData } from "next/image";
import { ArrowUpRight, Check } from "lucide-react";
import { Noise } from "@/components/effects/Noise";
import { useGrowthDiagnostic } from "@/components/growth-diagnostic/GrowthDiagnosticProvider";
import {
  useCalendly,
  CALENDLY_BOOKING_URL,
} from "@/components/sections/CalendlyModal";

/* ----------------------------------------------------------------------
   Reusable service landing page — one component, one content shape,
   instantiated per service line (see app/seo, app/websites, app/ads).
   Same brand vocabulary as IndustryLandingPage, but with a proof
   gallery up top: services sell on evidence, so real screenshots and
   real client work get first billing instead of waiting until "our
   approach."
   ---------------------------------------------------------------------- */

export type ProofItem = {
  image: StaticImageData;
  caption: string;
  /** "contain" for white-background data screenshots; omit for photos,
     which fill the frame edge-to-edge */
  fit?: "contain";
};

export type ServiceContent = {
  eyebrow: string;
  h1: string;
  subhead: string;
  statValue: string;
  statLabel: string;
  proof: ProofItem[];
  intro: { heading: string; paragraphs: string[] };
  approach: { heading: string; intro: string; items: { title: string; body: string }[] };
  /* Fixed-price services only (e.g. Websites) — renders a real pricing
     card with a buy button instead of just linking off to /pricing.
     Omit for retainer services (SEO, Ads), which stay Calendly-only. */
  pricing?: {
    eyebrow: string;
    heading: string;
    price: string;
    per?: string;
    body: string;
    features: string[];
    buyLabel: string;
    buyUrl: string;
  };
  closing: { heading: string; body: string };
};

export default function ServiceLandingPage({ content }: { content: ServiceContent }) {
  const { open: openQuiz } = useGrowthDiagnostic();
  const { open: openCalendly } = useCalendly();

  return (
    <main className="relative w-full overflow-x-clip bg-[#ededd5] text-[#261f15] selection:bg-[#c9932b] selection:text-[#261f15]">
      <section className="relative w-full pb-24 pt-40 md:pb-32 md:pt-48">
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
          <div className="relative mx-auto max-w-3xl text-center">
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
          <div className="mx-auto mt-16 flex max-w-md items-baseline justify-center gap-4 border-y border-[#261f15]/10 py-8 text-center md:mt-20">
            <p className="font-heading font-thin not-italic text-[3.2rem] leading-none tracking-[-0.02em] text-[#8a6f3d] sm:text-[3.8rem]">
              {content.statValue}
            </p>
            <p className="max-w-[14rem] text-left font-sans text-[0.78rem] font-semibold leading-snug text-[#261f15]/60">
              {content.statLabel}
            </p>
          </div>

          {/* --------------------------- proof gallery ---------------------- */}
          <div className="mx-auto mt-16 max-w-5xl md:mt-20">
            <p className="text-center font-sans text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-[#261f15]/45">
              Real work, not mockups
            </p>
            <div
              className={`mt-6 grid grid-cols-1 gap-6 ${
                content.proof.length > 1 ? "sm:grid-cols-2" : ""
              } ${content.proof.length > 2 ? "lg:grid-cols-3" : ""}`}
            >
              {content.proof.map((item, i) => (
                <figure
                  key={i}
                  className="overflow-hidden rounded-2xl border border-[#261f15]/12 bg-white shadow-[0_1px_2px_rgba(38,31,21,0.05),0_28px_56px_-28px_rgba(38,31,21,0.4)]"
                >
                  <div className="relative aspect-[4/3] w-full bg-[#f7f5e8]">
                    <Image
                      src={item.image}
                      alt={item.caption}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className={item.fit === "contain" ? "object-contain p-3" : "object-cover"}
                    />
                  </div>
                  <figcaption className="border-t border-[#261f15]/10 px-4 py-3 font-sans text-[0.72rem] leading-snug text-[#261f15]/65">
                    {item.caption}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>

          {/* --------------------------- intro ----------------------------- */}
          <div className="mx-auto mt-16 max-w-3xl md:mt-20">
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
          <div className="mx-auto mt-16 max-w-3xl md:mt-20">
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

          {/* --------------------------- pricing ----------------------------
             Fixed-price services only (content.pricing set — currently just
             Websites). A real price and a real buy button, not another link
             to the Growth Diagnostic. */}
          {content.pricing && (
            <div className="mx-auto mt-16 max-w-2xl md:mt-20">
              <div className="rounded-[1.75rem] border border-[#261f15]/12 bg-white px-8 py-10 shadow-[0_1px_2px_rgba(38,31,21,0.05),0_28px_56px_-28px_rgba(38,31,21,0.35)] sm:px-12 sm:py-12">
                <p className="text-center font-sans text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-[#8a6f3d]">
                  {content.pricing.eyebrow}
                </p>
                <h2 className="mt-4 text-center font-heading font-thin not-italic text-[clamp(1.7rem,3vw,2.2rem)] leading-[1.15] tracking-[-0.01em] text-[#261f15]">
                  {content.pricing.heading}
                </h2>
                <div className="mt-6 flex items-baseline justify-center gap-2">
                  <span className="font-heading font-thin not-italic text-[3.4rem] leading-none tracking-[-0.02em] text-[#261f15]">
                    {content.pricing.price}
                  </span>
                  {content.pricing.per && (
                    <span className="font-sans text-sm font-semibold text-[#261f15]/45">
                      {content.pricing.per}
                    </span>
                  )}
                </div>
                <p className="mx-auto mt-4 max-w-md text-center font-sans text-sm leading-relaxed text-[#261f15]/65">
                  {content.pricing.body}
                </p>
                <ul className="mx-auto mt-8 flex w-fit flex-col gap-3">
                  {content.pricing.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 font-sans text-sm text-[#261f15]/75">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#a67c3d]" strokeWidth={2} />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-9 flex justify-center">
                  <a
                    href={content.pricing.buyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/buy relative inline-flex cursor-pointer items-center gap-3 overflow-hidden rounded-full bg-[#261f15] py-2 pl-7 pr-2 font-sans text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#ededd5] transition-colors duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#261f15] sm:text-xs"
                  >
                    <span className="relative z-10 py-2">{content.pricing.buyLabel}</span>
                    <span className="relative flex h-9 w-9 shrink-0 items-center justify-center">
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 scale-100 rounded-full bg-[#c6a66a] transition-transform duration-500 ease-[cubic-bezier(0.33,1,0.68,1)] group-hover/buy:scale-[12] group-hover/buy:duration-1100"
                      />
                      <span className="relative z-10 flex rotate-0 transition-transform duration-700 ease-[cubic-bezier(0.34,1.2,0.4,1)] group-hover/buy:rotate-45">
                        <ArrowUpRight className="h-4 w-4 text-[#261f15] transition-colors duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]" />
                      </span>
                    </span>
                  </a>
                </div>
                <p className="mt-5 text-center font-sans text-[0.72rem] text-[#261f15]/45">
                  Secure checkout via Stripe. Prefer to talk it through first?{" "}
                  <a
                    href={CALENDLY_BOOKING_URL}
                    onClick={(e) => {
                      e.preventDefault();
                      openCalendly();
                    }}
                    className="cursor-pointer border-b border-[#261f15]/25 pb-0.5 text-[#261f15]/65 transition-colors hover:border-[#261f15]/50 hover:text-[#261f15]"
                  >
                    Book a call
                  </a>
                  .
                </p>
              </div>
            </div>
          )}

          {/* --------------------------- closing ---------------------------- */}
          <div className="mx-auto mt-20 max-w-2xl rounded-[1.75rem] border border-[#c6a66a]/35 bg-[#261f15] px-8 py-12 text-center text-[#ededd5] md:mt-24 md:px-14 md:py-16">
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
            <div className="mx-auto mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              <a
                href={CALENDLY_BOOKING_URL}
                onClick={(e) => {
                  e.preventDefault();
                  openCalendly();
                }}
                className="cursor-pointer font-sans text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#ededd5]/55 underline decoration-[#ededd5]/25 underline-offset-4 transition-colors hover:text-[#ededd5] hover:decoration-[#ededd5]/60 sm:text-xs"
              >
                Book a Call
              </a>
              <a
                href="/pricing"
                className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#ededd5]/55 underline decoration-[#ededd5]/25 underline-offset-4 transition-colors hover:text-[#ededd5] hover:decoration-[#ededd5]/60 sm:text-xs"
              >
                View Pricing
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
