"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Noise } from "@/components/effects/Noise";

gsap.registerPlugin(ScrollTrigger);

/* ----------------------------------------------------------------------
   Add-ons & Builds — a quiet modular price list
   Four substantial rows on the light cream ground, each one a "module"
   you could pick up and stack: deliberate 01–04 numerals, big thin-cut
   names, prices with real presence, tight small descriptions, hairline
   rules between rows.
   Hover interaction is deliberately light — pure CSS, no JS work:
   the hovered row stays crisp (numeral warms to gold, row nudges right
   a touch) while every sibling row soft-blurs and dims, pulling focus
   like a camera racking onto the module under the cursor.
   - Touch devices: no blur at all — every row fully legible by default.
   - prefers-reduced-motion: static rows, no blur, no transitions.
   - NO italic type anywhere in this section (hard rule).
   Edit everything in ADDONS below — names, prices, notes — in one place.
   ---------------------------------------------------------------------- */

type AddOn = {
  id: string;
  num: string;
  name: string;
  /* Price is split so the "From" qualifier and "/mo" cadence can be set
     small while the figure itself keeps real presence */
  prefix?: string;
  price: string;
  per?: string;
  desc: string;
};

const ADDONS: AddOn[] = [
  {
    id: "ads",
    num: "01",
    name: "Ads Management",
    price: "$850",
    per: "/mo",
    desc: "Google Ads for event-intent traffic. Ad spend separate.",
  },
  {
    id: "website",
    num: "02",
    name: "Website Kickstart",
    prefix: "From",
    price: "$2,400",
    desc: "Custom 6-page site, 1 GBP setup, tracking + Lead Form integration.",
  },
  {
    id: "shopify",
    num: "03",
    name: "Shopify Store",
    prefix: "From",
    price: "$8,000",
    desc: "For caterers selling retail beans, merch, gift cards, or event packages.",
  },
  {
    id: "branding",
    num: "04",
    name: "Branding Refresh",
    prefix: "From",
    price: "$8,000",
    desc: "Full identity refresh — logo, palette, type, brand guidelines, applied across web.",
  },
];

export default function AddOns() {
  const headerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  /* Entrance — header first, then the rows stack in; plays once,
     skipped entirely under reduced motion */
  useEffect(() => {
    const header = headerRef.current;
    const list = listRef.current;
    if (!header || !list) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rows = list.querySelectorAll<HTMLElement>(".le-addon");
    const tweens: gsap.core.Tween[] = [];

    tweens.push(
      gsap.fromTo(
        header,
        { autoAlpha: 0, y: 26 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: { trigger: header, start: "top 86%", once: true },
        },
      ),
    );

    tweens.push(
      gsap.fromTo(
        rows,
        { autoAlpha: 0, y: 26 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.09,
          ease: "power3.out",
          scrollTrigger: { trigger: list, start: "top 84%", once: true },
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
      id="addons"
      className="relative w-full overflow-hidden bg-[#ededd5] text-[#261f15]"
    >
      {/* Scoped styles — the sibling-blur rule lives in plain (unlayered)
         CSS so the :not(:hover) cascade behaves predictably. Hover-only:
         touch devices never blur, reduced motion gets no transitions. */}
      <style>{`
        .le-addon-inner {
          transition:
            opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1),
            filter 0.5s cubic-bezier(0.22, 1, 0.36, 1),
            transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .le-addon-num { transition: color 0.5s cubic-bezier(0.22, 1, 0.36, 1); }
        @media (hover: hover) {
          .le-addons:hover .le-addon:not(:hover) .le-addon-inner {
            filter: blur(2px);
            opacity: 0.6;
          }
          .le-addon:hover .le-addon-inner { transform: translateX(0.75rem); }
          .le-addon:hover .le-addon-num { color: #a67c3d; }
        }
        @media (prefers-reduced-motion: reduce) {
          .le-addon-inner, .le-addon-num { transition: none; }
          .le-addons:hover .le-addon:not(:hover) .le-addon-inner {
            filter: none;
            opacity: 1;
          }
          .le-addon:hover .le-addon-inner { transform: none; }
        }
      `}</style>

      {/* Faint warm wash leaning toward the list — barely-there depth */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(60%_50%_at_75%_35%,rgba(166,124,61,0.10),transparent_65%)]"
      />

      {/* Film grain — above the cream ground, below every row and price */}
      <Noise patternAlpha={10} />

      <div className="relative z-20 mx-auto w-full max-w-[1480px] px-6 py-16 md:px-12 md:py-24">
        {/* ------------------------- header --------------------------- */}
        <div ref={headerRef}>
          <p className="flex items-center gap-4 font-sans text-[0.62rem] font-semibold uppercase tracking-[0.3em] text-[#8a6f3d] sm:text-xs">
            <span aria-hidden="true" className="text-[0.8em]">
              ✦
            </span>
            Add-ons
            <span aria-hidden="true" className="h-px flex-1 bg-[#261f15]/10" />
          </p>

          <div className="mt-7 flex flex-col gap-5 md:mt-9 md:flex-row md:items-end md:justify-between md:gap-12">
            <h2 className="max-w-3xl font-heading font-thin not-italic text-4xl leading-[1.08] tracking-[-0.01em] sm:text-5xl md:text-6xl">
              Add-ons &amp; Builds
            </h2>
            <p className="max-w-xs shrink-0 font-sans text-sm leading-relaxed text-[#261f15]/60 md:pb-2 md:text-[0.95rem]">
              Modular. Stack what you need, drop what you don&apos;t.
            </p>
          </div>
        </div>

        {/* --------------------- the module rows ----------------------- */}
        <ul
          ref={listRef}
          className="le-addons mt-10 list-none border-t border-[#261f15]/12 p-0 md:mt-14"
        >
          {ADDONS.map((addon) => (
            <li
              key={addon.id}
              className="le-addon border-b border-[#261f15]/12"
            >
              <a
                href="#contact"
                className="relative block cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#a67c3d]"
              >
                {/* Numeral / name + description / price — everything
                   stays fully visible in every state */}
                <span className="le-addon-inner relative z-10 grid grid-cols-[auto_1fr] items-baseline gap-x-4 gap-y-2 py-6 sm:gap-x-6 md:grid-cols-[4rem_minmax(0,1fr)_auto] md:gap-x-8 md:py-8">
                  {/* Deliberate numeral — quiet gold, warms on hover */}
                  <span
                    aria-hidden="true"
                    className="le-addon-num font-sans text-[0.6rem] font-semibold tracking-[0.3em] text-[#8a6f3d]"
                  >
                    {addon.num}
                  </span>

                  <span className="min-w-0">
                    <span className="block font-heading font-thin not-italic text-3xl leading-[1.05] tracking-[-0.01em] text-[#261f15] sm:text-4xl md:text-[2.75rem]">
                      {addon.name}
                    </span>
                    <span className="mt-2 block max-w-md font-sans text-[0.85rem] leading-relaxed text-[#261f15]/65">
                      {addon.desc}
                    </span>
                  </span>

                  {/* Price — real presence, never hidden */}
                  <span className="col-start-2 flex items-baseline gap-2 md:col-start-3 md:justify-self-end">
                    {addon.prefix && (
                      <span className="font-sans text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-[#8a6f3d]">
                        {addon.prefix}
                      </span>
                    )}
                    <span className="font-heading font-thin not-italic text-2xl leading-none text-[#261f15] sm:text-3xl">
                      {addon.price}
                    </span>
                    {addon.per && (
                      <span className="font-sans text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[#261f15]/55">
                        {addon.per}
                      </span>
                    )}
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
