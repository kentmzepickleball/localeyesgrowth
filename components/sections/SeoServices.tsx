"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Noise } from "@/components/effects/Noise";
import ScrollStack, { ScrollStackItem } from "@/components/effects/ScrollStack";

gsap.registerPlugin(ScrollTrigger);

/* ----------------------------------------------------------------------
   SeoServices — bright editorial split with two showpieces
   A deliberate light break between the dark sections: warm cream, film
   grain tuned down to paper texture, compact height, copy and cards
   side by side.
   - Heading: static "SEO" in the brand font (IvyPresto Headline), its
     natural thin cut, no text effect. Single color (ink), italic off.
   - Cards: React Bits ScrollStack scoped to its OWN fixed-height frame
     (its default non-window mode) so cards stack inside the panel and
     the section never grows. Mobile / touch / reduced motion get the
     same cards as a clean static column.
   - Grain: Noise above the cream, below all content; under reduced
     motion it draws a single static frame instead of animating.
   - Stack spacing: the frame measures itself and centers the settled
     stack — visible space above the peeking cards equals the space
     below the top card, at every viewport.
   Tune: card copy in SERVICES, grain via patternAlpha, stack physics
   via the ScrollStack props.
   ---------------------------------------------------------------------- */

type SeoService = {
  number: string;
  kicker: string;
  title: string;
  description: string;
};

const SERVICES: SeoService[] = [
  {
    number: "01",
    kicker: "Rankings",
    title: "Site Search Results",
    description:
      "Strategic, precise SEO built to hit your ranking goals — and turn Google searches into real, qualified leads.",
  },
  {
    number: "02",
    kicker: "AI Search",
    title: "AI Features & Snippets",
    description:
      "Writing engineered to be cited — placing you at the very top of results, whatever your clients are searching for.",
  },
  {
    number: "03",
    kicker: "Google Maps",
    title: "Local Map Pack Results",
    description:
      "Google Business Profile optimization tailored to lift you into the local map pack — where nearby clients decide.",
  },
];

/* One generous card — used inside the ScrollStack AND in the static
   fallback column, so the two presentations never drift apart. */
function SeoCard({ service }: { service: SeoService }) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-[#261f15]/12 bg-[#f7f5e8] p-7 shadow-[0_1px_2px_rgba(38,31,21,0.05),0_28px_56px_-28px_rgba(38,31,21,0.4)] sm:p-9">
      {/* Numeral over a hairline, with a quiet kicker on the right */}
      <div className="flex items-baseline gap-5">
        <span className="font-heading font-thin not-italic text-5xl leading-none text-[#a67c3d]">
          {service.number}
        </span>
        <span
          aria-hidden="true"
          className="h-px flex-1 self-center bg-[#261f15]/10"
        />
        <span className="font-sans text-[0.58rem] font-semibold uppercase tracking-[0.3em] text-[#261f15]/55">
          {service.kicker}
        </span>
      </div>

      <h3 className="mt-6 font-heading font-thin not-italic text-[1.7rem] leading-[1.1] text-[#261f15] sm:text-[1.85rem]">
        {service.title}
      </h3>

      <p className="mt-3.5 max-w-[46ch] font-sans text-sm leading-relaxed text-[#261f15]/65 sm:text-[0.95rem]">
        {service.description}
      </p>
    </div>
  );
}

export default function SeoServices() {
  const copyRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  /* Card-stack frame — measured so the settled stack sits with EQUAL
     visible space above and below (see the effect below) */
  const frameRef = useRef<HTMLDivElement>(null);
  const [stackPad, setStackPad] = useState<number | null>(null);

  /* reduced — kills the grain animation and entrance.
     interactive — the scoped scroll stack only earns its keep on desktop
     with motion allowed; everywhere else the static column reads better. */
  const [reduced, setReduced] = useState(false);
  const [interactive, setInteractive] = useState(false);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setReduced(motion.matches);
      setInteractive(desktop.matches && !motion.matches);
    };
    update();
    desktop.addEventListener("change", update);
    motion.addEventListener("change", update);
    return () => {
      desktop.removeEventListener("change", update);
      motion.removeEventListener("change", update);
    };
  }, []);

  /* Symmetric stack spacing — measure the frame and the top (last) card,
     then solve for the padding that leaves EQUAL visible space above the
     peeking card edges and below the top settled card:
       pad = (frameH - 2 * itemStackDistance - cardH) / 2
     That pad becomes BOTH the inner padding-top (rest position) and the
     ScrollStack pin line (stackPosition in px), so the stack is optically
     centered at rest, while pinning, and when settled — at any viewport
     and any card height. Re-measures on resize/font load. */
  useEffect(() => {
    if (!interactive) return;
    const frame = frameRef.current;
    if (!frame) return;

    const measure = () => {
      const cards = frame.querySelectorAll<HTMLElement>(".scroll-stack-card");
      const last = cards[cards.length - 1];
      if (!last) return;
      /* 14 here MUST match itemStackDistance on <ScrollStack> below */
      const pad = Math.round(
        Math.max(20, (frame.clientHeight - 2 * 14 - last.offsetHeight) / 2),
      );
      setStackPad((prev) => (prev === pad ? prev : pad));
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(frame);
    frame
      .querySelectorAll<HTMLElement>(".scroll-stack-card")
      .forEach((card) => ro.observe(card));
    return () => ro.disconnect();
  }, [interactive]);

  /* Entrance — copy column first, then the card side; once, premium ease */
  useEffect(() => {
    const copy = copyRef.current;
    const right = rightRef.current;
    if (!copy || !right) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const tweens = [copy, right].map((el, i) =>
      gsap.fromTo(
        el,
        { autoAlpha: 0, y: 28 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1,
          delay: i * 0.14,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
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
      id="seo"
      className="relative w-full overflow-hidden bg-[#ededd5] text-[#261f15]"
    >
      {/* Film grain — above the cream, below every piece of content.
         patternAlpha ~10 reads as paper, not dirt; under reduced motion
         the huge refresh interval means it draws once and holds still. */}
      <Noise
        patternAlpha={10}
        patternRefreshInterval={reduced ? 1_000_000_000 : 2}
      />

      <div className="relative z-20 mx-auto w-full max-w-[1480px] px-6 py-20 md:px-12 md:py-24">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          {/* ------------------------- copy column --------------------- */}
          <div ref={copyRef}>
            <p className="flex items-center gap-4 font-sans text-[0.62rem] font-semibold uppercase tracking-[0.3em] text-[#a67c3d] sm:text-xs">
              <span aria-hidden="true" className="text-[0.8em]">
                ✦
              </span>
              What We Do
            </p>

            {/* The showpiece — static "SEO" in the brand font's natural
               thin cut, no effect. Plain h2 — fully readable by screen
               readers. */}
            <h2 className="mb-10 mt-6 font-heading font-thin not-italic text-[clamp(5.5rem,12vw,11rem)] leading-[0.85] tracking-[-0.03em] text-[#261f15] md:mb-12">
              SEO
            </h2>

            <p className="max-w-md font-sans text-sm leading-relaxed text-[#261f15]/70 sm:text-[0.95rem]">
              Only the newest practices that actually move rankings — applied as
              fast as Google allows. Never the outdated, box&#8209;ticking work
              that looks like effort and delivers little.
            </p>

            {/* Quiet editorial footnote + stack affordance cue */}
            <p className="mt-10 flex items-center gap-3 font-sans text-[0.58rem] font-semibold uppercase tracking-[0.3em] text-[#261f15]/55">
              <span aria-hidden="true" className="text-[#a67c3d]">
                ✦
              </span>
              Three disciplines. Found first.
            </p>
            {interactive && (
              <p
                aria-hidden="true"
                className="mt-4 flex items-center gap-3 font-sans text-[0.58rem] font-semibold uppercase tracking-[0.3em] text-[#261f15]/55"
              >
                <span className="text-[#a67c3d]">✦</span>
                Scroll the stack
                <span className="h-px w-12 bg-[#261f15]/15" />
              </p>
            )}
          </div>

          {/* ------------------------- card column --------------------- */}
          <div ref={rightRef}>
            {interactive ? (
              /* Framed, fixed-height panel — the stack scrolls inside it
                 (ScrollStack's own non-window mode), so the section stays
                 compact. Library overrides live under .le-seo-stack in
                 globals.css. */
              <div
                ref={frameRef}
                className="le-seo-stack relative h-[26rem] overflow-hidden rounded-2xl border border-[#261f15]/10 bg-[#e6e3cf]/60 xl:h-[29rem]"
                style={
                  {
                    "--le-stack-pad":
                      stackPad !== null ? `${stackPad}px` : undefined,
                  } as React.CSSProperties
                }
              >
                <ScrollStack
                  itemDistance={20}
                  itemScale={0.03}
                  itemStackDistance={14}
                  stackPosition={stackPad !== null ? `${stackPad}px` : "10%"}
                  scaleEndPosition={
                    stackPad !== null
                      ? `${Math.max(12, Math.round(stackPad * 0.6))}px`
                      : "6%"
                  }
                  baseScale={0.94}
                  blurAmount={1}
                  wheelMultiplier={1.6}
                >
                  {SERVICES.map((service) => (
                    <ScrollStackItem key={service.number}>
                      <SeoCard service={service} />
                    </ScrollStackItem>
                  ))}
                </ScrollStack>

                {/* Glassy fill at the frame's bottom edge — frosted blur +
                   translucent cream tint, masked so it dissolves upward.
                   Incoming cards rise up through the glass instead of a
                   flat opaque fade. */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-24 rounded-b-2xl bg-gradient-to-t from-[#e9e6d2]/70 via-[#e9e6d2]/25 to-transparent backdrop-blur-md"
                  style={{
                    WebkitMaskImage:
                      "linear-gradient(to top, black 35%, transparent 100%)",
                    maskImage:
                      "linear-gradient(to top, black 35%, transparent 100%)",
                  }}
                />
              </div>
            ) : (
              /* Static fallback — mobile, touch, and reduced motion */
              <div className="flex flex-col gap-6">
                {SERVICES.map((service) => (
                  <SeoCard key={service.number} service={service} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
