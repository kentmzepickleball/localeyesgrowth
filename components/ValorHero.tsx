"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { Noise } from "@/components/effects/Noise";
import TiltedCard from "@/components/TiltedCard/TiltedCard";
import { useCalendly, CALENDLY_BOOKING_URL } from "@/components/sections/CalendlyModal";

/* /public/valor-photo.webp (640x640) — referenced root-relative. */
const IMG = (path: string) => `${"/"}${path.replace(/^\//, "")}`;

/* Card treatment for the podcast cover — a warm cream mat (thick border)
   plus a hairline ring, shared by the tilted card and the reduced-motion
   static fallback so both render identically. */
const CARD_IMG =
  "rounded-2xl border-[10px] border-[#f6f2e3] shadow-[0_30px_60px_-18px_rgba(38,31,21,0.4)] ring-1 ring-[#261f15]/15";

export default function ValorHero() {
  const containerRef = useRef<HTMLElement>(null);
  const [reduced, setReduced] = useState(false);
  const { open: openCalendly } = useCalendly();

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(motion.matches);
    const update = () => setReduced(motion.matches);
    motion.addEventListener("change", update);
    return () => motion.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      /* Staggered entrance — eyebrow, headline, copy, buttons, photo.
         fromTo keeps the server-rendered state fully visible (no
         opacity-0 initial styles baked into the markup). */
      gsap.fromTo(
        ".le-valor-reveal",
        { y: 40, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 1.2,
          stagger: 0.15,
          ease: "power3.out",
          delay: 0.2,
        },
      );
    }, containerRef);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section
      ref={containerRef}
      className="relative z-0 flex min-h-[90vh] w-full flex-col justify-center overflow-hidden bg-[#ededd5] pb-20 pt-40 text-[#261f15] md:pb-28 md:pt-48"
    >
      <Noise patternAlpha={10} patternRefreshInterval={reduced ? 1000000 : 2} />

      {/* Soft radial vignette for depth */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,#ffffff40_0%,transparent_70%)]"
      />

      {/* Vertical hairlines — the site's quiet editorial column grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 mx-auto flex w-full max-w-[1480px] justify-between px-6 md:px-12"
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="h-full w-px bg-gradient-to-b from-transparent via-[#261f15]/15 to-transparent"
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-[1480px] items-center gap-14 px-6 md:px-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
        {/* ---------------- Text column ---------------- */}
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <p className="le-valor-reveal font-sans text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-[#c6a66a] sm:text-xs">
            <span aria-hidden="true" className="mr-3 text-[0.8em]">
              ✦
            </span>
            Exclusive · Valor Listeners
            <span aria-hidden="true" className="ml-3 text-[0.8em]">
              ✦
            </span>
          </p>

          <h1 className="le-valor-reveal mt-5 font-heading font-thin not-italic text-[clamp(3.25rem,6.5vw,6.25rem)] leading-[0.92] tracking-[-0.02em] text-[#261f15]">
            Exclusive SEO Offers for{" "}
            <span className="text-[#8a6f3d] not-italic">Valor Listeners</span>
          </h1>

          <p className="le-valor-reveal mt-10 max-w-xl font-sans text-sm leading-relaxed text-[#261f15]/75 sm:text-base md:text-lg">
            If you&apos;re looking to start taking your SEO seriously, Valor
            listeners can also enjoy exclusive pricing for our plans.
          </p>

          <div className="le-valor-reveal mx-auto mt-10 flex w-fit flex-col items-stretch gap-3 sm:mx-0 sm:w-auto sm:flex-row">
            {/* Primary — same pill treatment as the header CTA.
               href is a placeholder (#) until the real URL is provided. */}
            <a
              href="#pricing"
              className="group/btn relative inline-flex cursor-pointer items-center justify-center gap-3 overflow-hidden whitespace-nowrap rounded-full border border-[#261f15]/25 py-1 pl-6 pr-1 font-sans text-[0.7rem] uppercase tracking-[0.12em] text-[#261f15] transition-colors duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:gap-4 sm:py-1.5 sm:pl-8 sm:pr-1.5 sm:text-xs"
            >
              <span className="relative z-10 py-1 transition-colors duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/btn:text-white group-active/btn:text-white">
                Exclusive Catering SEO Prices
              </span>
              <span className="relative flex h-10 w-10 shrink-0 items-center justify-center sm:h-11 sm:w-11">
                <span
                  aria-hidden="true"
                  className="absolute inset-0 scale-100 rounded-full bg-[#4a3421] transition-transform duration-500 ease-[cubic-bezier(0.33,1,0.68,1)] group-hover/btn:scale-[25] group-hover/btn:duration-[1100ms] group-active/btn:scale-[25] group-active/btn:duration-[1100ms]"
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full bg-[#4a3421] transition-colors duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/btn:bg-white group-active/btn:bg-white"
                />
                <span className="relative z-10 flex rotate-0 will-change-transform transition-transform duration-700 ease-[cubic-bezier(0.34,1.2,0.4,1)] group-hover/btn:rotate-45 group-active/btn:rotate-45">
                  <ArrowUpRight className="h-[1.15rem] w-[1.15rem] text-[#ededd5] transition-colors duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/btn:text-[#4a3421] group-active/btn:text-[#4a3421]" />
                </span>
              </span>
            </a>

            {/* Secondary — quiet bordered pill; stretches to match the
               primary's height in both row and column layouts. Opens the
               same Calendly modal as the header's "Book a Call". */}
            <a
              href={CALENDLY_BOOKING_URL}
              onClick={(e) => {
                e.preventDefault();
                openCalendly();
              }}
              className="inline-flex cursor-pointer items-center justify-center whitespace-nowrap rounded-full border border-[#261f15]/25 px-6 py-4 font-sans text-[0.7rem] uppercase tracking-[0.12em] text-[#261f15] transition-colors duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[#261f15] hover:text-[#ededd5] active:bg-[#261f15] active:text-[#ededd5] sm:px-8 sm:py-0 sm:text-xs"
            >
              Book A Call
            </a>
          </div>
        </div>

        {/* ---------------- Photo column ---------------- */}
        <div className="le-valor-reveal relative mx-auto w-full max-w-[420px] lg:max-w-[480px]">
          {/* Single symmetric gold frame behind the card — extends equally
             left + right, offset downward; one clean outline, no inner lines */}
          <div
            aria-hidden="true"
            className="absolute -left-6 -right-6 top-6 -bottom-6 rounded-2xl border-2 border-[#c9932b]/60 bg-[#c9932b]/5"
          />
          {reduced ? (
            <Image
              src={IMG("/valor-photo.webp")}
              alt="Valor Coffee Podcast cover — the three hosts at a table with Valor mugs"
              width={640}
              height={640}
              priority
              className={`relative w-full ${CARD_IMG}`}
            />
          ) : (
            <div className="relative aspect-square w-full">
              <TiltedCard
                imageSrc={IMG("/valor-photo.webp")}
                altText="Valor Coffee Podcast cover — the three hosts at a table with Valor mugs"
                containerHeight="100%"
                containerWidth="100%"
                imageHeight="100%"
                imageWidth="100%"
                rotateAmplitude={10}
                translateAmplitude={10}
                scaleOnHover={1.04}
                imageClassName={CARD_IMG}
              />
            </div>
          )}
          <p className="mt-8 text-center font-sans text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-[#261f15]/50">
            <span aria-hidden="true" className="mr-3 text-[0.8em] text-[#c6a66a]">
              ✦
            </span>
            As heard on the Valor Coffee Podcast
          </p>
        </div>
      </div>
    </section>
  );
}
