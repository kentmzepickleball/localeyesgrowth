"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Pricing from "@/components/sections/Pricing";

gsap.registerPlugin(ScrollTrigger);

/* ----------------------------------------------------------------------
   /valor — Section 3: the main-page Pricing section (with the intro
   paragraph hidden via hideIntro), plus a premium gold offer badge
   pinned to the rate card itself — it overhangs the card's top-right
   corner like a gift tag stuck on the paper sheet, at every breakpoint.
   - Delivered through Pricing's cardBadge slot: rendered on a stable
     relative wrapper OUTSIDE the overflow-hidden tabpanel (so the
     overhang isn't clipped) and outside the crossfade layer (so it
     never dissolves when the visitor switches plans).
   - The badge is a gilded tag: gold-leaf gradient, soft gold aura,
     certificate double hairline frame, a hairline ✦ hairline divider,
     and a resting tilt.
   - Animation (all skipped under prefers-reduced-motion; the badge is
     fully visible and tilted without JS):
     · entrance — falls in and settles like a seal being placed
       (back.out overshoot), once on scroll into view — on badgeRef;
     · idle float — a slow 3s breathing bob — on the separate floatRef
       wrapper so it never fights the entrance tween;
     · shine — a light sweep crosses the gold every few seconds;
     · hover — pure CSS on the card: it straightens (-rotate against
       the resting tilt), lifts to 1.06 scale, and the aura deepens.
   - The corner it overhangs holds only the card's decorative eyebrow
     hairline — no interactive element is ever covered.
   - NO italics anywhere; ✦ is the only ornament.
   ---------------------------------------------------------------------- */

export default function ValorPricing() {
  const badgeRef = useRef<HTMLDivElement>(null);
  const floatRef = useRef<HTMLDivElement>(null);
  const shineRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const badge = badgeRef.current;
    const float = floatRef.current;
    const shine = shineRef.current;
    if (!badge || !float || !shine) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    /* Entrance — the badge falls in and settles into its resting tilt */
    const entrance = gsap.fromTo(
      badge,
      { autoAlpha: 0, y: -26, scale: 1.14, rotation: 12 },
      {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        rotation: 4,
        duration: 1.1,
        ease: "back.out(1.6)",
        scrollTrigger: { trigger: badge, start: "top 92%", once: true },
      },
    );

    /* Idle float — a slow breathing bob on the inner wrapper */
    const bob = gsap.to(float, {
      y: 6,
      duration: 3,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });

    /* Shine — a light sweep across the gold every few seconds */
    const sweep = gsap.fromTo(
      shine,
      { xPercent: -220, skewX: -12 },
      {
        xPercent: 480,
        skewX: -12,
        duration: 1.5,
        ease: "power2.inOut",
        repeat: -1,
        repeatDelay: 3.4,
        delay: 1.4,
      },
    );

    return () => {
      entrance.scrollTrigger?.kill();
      entrance.kill();
      bob.kill();
      sweep.kill();
    };
  }, []);

  return (
    <Pricing
      hideIntro
      cardBadge={
        /* Gold offer tag — overhangs the rate card's top-right corner */
        <div
          ref={badgeRef}
          className="group absolute -right-2 -top-7 z-30 rotate-[4deg] sm:-right-4 sm:-top-8 md:-right-6 md:-top-9"
        >
          <div ref={floatRef} className="relative">
            {/* soft gold aura — deepens on hover */}
            <span
              aria-hidden="true"
              className="absolute -inset-3 rounded-[14px] bg-[#c9932b]/25 blur-xl transition-colors duration-700 group-hover:bg-[#c9932b]/40"
            />
            <div className="relative overflow-hidden rounded-[9px] bg-gradient-to-br from-[#f0d99c] via-[#c9932b] to-[#8f6a22] px-4 py-3 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_24px_48px_-18px_rgba(0,0,0,0.7)] transition-transform duration-500 ease-out group-hover:-rotate-3 group-hover:scale-[1.06] motion-reduce:transition-none sm:px-6 sm:py-4">
              {/* certificate double frame — two fine hairlines */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-1 rounded-[6px] border border-[#261f15]/30"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-2 rounded-[4px] border border-[#f6f2e3]/25"
              />

              <p className="flex items-center justify-center gap-2.5 font-heading font-thin not-italic text-[1.25rem] leading-none text-[#261f15] sm:text-[1.6rem]">
                <span
                  aria-hidden="true"
                  className="text-[0.4em] text-[#261f15]/65"
                >
                  ✦
                </span>
                20% Discount
                <span
                  aria-hidden="true"
                  className="text-[0.4em] text-[#261f15]/65"
                >
                  ✦
                </span>
              </p>

              {/* hairline ✦ hairline divider */}
              <span
                aria-hidden="true"
                className="mt-2 flex items-center justify-center gap-2"
              >
                <span className="h-px w-7 bg-[#261f15]/30" />
                <span className="text-[0.45rem] leading-none text-[#261f15]/60">
                  ✦
                </span>
                <span className="h-px w-7 bg-[#261f15]/30" />
              </span>

              <p className="mt-2 font-sans text-[0.5rem] font-semibold uppercase tracking-[0.24em] text-[#261f15]/80 sm:text-[0.55rem]">
                to start any SEO plan
              </p>

              {/* light sweep — parked off-card statically, animated by gsap */}
              <span
                ref={shineRef}
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                style={{ transform: "translateX(-220%) skewX(-12deg)" }}
              />
            </div>
          </div>
        </div>
      }
    />
  );
}
