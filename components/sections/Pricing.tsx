"use client";

import { useEffect, useRef, useState } from "react";
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
   Pricing — "The Rate Card"
   A dark editorial split: the three plans sit in a hairline-ruled index
   on the left (same vocabulary as the Case Studies list), and selecting
   one swaps a single physical paper rate card on the right — enormous
   thin-cut price, commit note, "who this is for" bullets, CTA, and the
   full feature ledger. One plan in focus at a time; prices stay
   permanently comparable in the index rail.
   - Proper tabs semantics: role=tablist / tab / tabpanel with roving
     tabindex and arrow-key navigation (vertical).
   - "Most Popular" is pre-selected and carries the gold treatment —
     emphasized without overlapping or breaking the grid.
   - Mobile: index stacks above the card; no horizontal table anywhere.
   - prefers-reduced-motion: no entrance, no crossfade — instant swaps.
   - NO italic type anywhere in this section (hard rule).
   Edit everything in PLANS and FEATURE_ROWS below — names, prices,
   notes, bullets, CTAs, and every ledger row live in one place.
   ---------------------------------------------------------------------- */

type Plan = {
  id: string;
  name: string;
  price: string;
  per: string;
  note: string;
  /* Each plan gets its own soft-focus bobble colour on the rate card */
  glow: string;
  popular?: boolean;
  who: string[];
  ctaLabel: string;
  ctaHref: string;
};

const PLANS: Plan[] = [
  {
    id: "solo",
    name: "The Solo Plan",
    price: "$997",
    per: "/mo",
    note: "Exclusive entry plan",
    glow: "#a8703a",
    who: [
      "You run a single cart",
      "Under $10K/month, building to your first five-figure month",
      "Committed to growth and responsive to inquiries",
      "For serious operators not testing the waters",
    ],
    ctaLabel: "Apply Now",
    ctaHref: "#contact",
  },
  {
    id: "booking",
    name: "The Booking Engine",
    price: "$1440",
    per: "/mo",
    note: "6-month commit · $1800 month-to-month",
    glow: "#b2883c",
    popular: true,
    who: [
      "You've got 1–2 carts and a real business looking to generate mid-high 5-figure months",
      "You're getting bookings, but you want more — and better events",
      "You're full-time or planning to go full time soon",
      "You want someone running the whole system, not just SEO",
    ],
    ctaLabel: "Book a Call",
    ctaHref: CALENDLY_BOOKING_URL,
  },
  {
    id: "growth",
    name: "The Growth Engine",
    price: "$2200",
    per: "/mo",
    note: "6-month commit · $2800 month-to-month",
    glow: "#75804a",
    who: [
      "You've got 2+ carts (or one operation doing serious volume)",
      "You're expanding — new carts, new markets, premium events",
      "You want content, campaigns, and paid traffic working together",
      "You want someone strategic in the seat with you",
    ],
    ctaLabel: "Book a Call",
    ctaHref: CALENDLY_BOOKING_URL,
  },
];

/* Feature ledger — values are indexed by plan position (Solo, Booking
   Engine, Growth Engine). Edit a row's label or any value here. */
const FEATURE_ROWS: { label: string; values: [string, string, string] }[] = [
  { label: "Pages", values: ["3 / month", "4 / month", "6 / month"] },
  {
    label: "Backlinks",
    values: ["3 / month", "4 / month", "4 Standard + 2 Premium Posts"],
  },
  { label: "Citations", values: ["75 Once", "150 Once", "150 Quarterly"] },
  {
    label: "Google Business Profile",
    values: [
      "1 location managed",
      "All Locations Managed",
      "All Locations Managed + Posting",
    ],
  },
  {
    label: "Lead Intake Form",
    values: [
      "Basic Setup",
      "Basic Setup + 2 Automations",
      "Full Setup + Custom Automations",
    ],
  },
  {
    label: "CRO",
    values: ["—", "On-page Optimizing", "On-page + Quarterly Audit & Meeting"],
  },
  {
    label: "Tracking",
    values: [
      "Monthly Report – 10 Keywords",
      "Monthly Task Sheet + 15 Keywords",
      "Live Dashboard + 25 Keywords",
    ],
  },
  {
    label: "Client Communication Access",
    values: [
      "LE Text Group Communication Channel",
      "LE Text Group Communication Channel",
      "LE Text Group Communication Channel",
    ],
  },
];

export default function Pricing() {
  const sectionRef = useRef<HTMLElement>(null);
  const { open: openCalendly } = useCalendly();
  const headerRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  /* The card's inner content — crossfaded when the plan changes */
  const cardInnerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  /* "Most Popular" pre-selected — confident default, no overlap tricks */
  const [selected, setSelected] = useState(
    Math.max(
      PLANS.findIndex((plan) => plan.popular),
      0,
    ),
  );
  const plan = PLANS[selected];
  const firstRender = useRef(true);

  /* Crossfade the rate card when the plan changes — a quiet rise, never
     on first paint, never under reduced motion */
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const inner = cardInnerRef.current;
    if (!inner) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const tween = gsap.fromTo(
      inner,
      { autoAlpha: 0, y: 14 },
      { autoAlpha: 1, y: 0, duration: 0.5, ease: "power3.out" },
    );
    return () => {
      tween.kill();
    };
  }, [selected]);

  /* Roving tabindex + arrow keys — proper vertical tablist behavior */
  const onTabKeyDown = (e: React.KeyboardEvent, index: number) => {
    let next: number | null = null;
    if (e.key === "ArrowDown" || e.key === "ArrowRight")
      next = (index + 1) % PLANS.length;
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft")
      next = (index - 1 + PLANS.length) % PLANS.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = PLANS.length - 1;
    if (next === null) return;
    e.preventDefault();
    setSelected(next);
    tabRefs.current[next]?.focus();
  };

  /* Entrance — header, then the index rows, then the card rises; plays
     once, skipped under reduced motion */
  useEffect(() => {
    const header = headerRef.current;
    const rail = railRef.current;
    const card = cardRef.current;
    if (!header || !rail || !card) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rows = rail.querySelectorAll<HTMLElement>(".le-plan-row");
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
          scrollTrigger: { trigger: header, start: "top 84%", once: true },
        },
      ),
    );

    tweens.push(
      gsap.fromTo(
        rows,
        { autoAlpha: 0, y: 24 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: { trigger: rail, start: "top 82%", once: true },
        },
      ),
    );

    tweens.push(
      gsap.fromTo(
        card,
        { autoAlpha: 0, y: 34 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1.05,
          delay: 0.15,
          ease: "power3.out",
          scrollTrigger: { trigger: card, start: "top 84%", once: true },
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
      id="pricing"
      className="relative w-full overflow-hidden bg-[#261f15] text-[#ededd5]"
    >
      {/* Soft vignette — corners recede, same depth as Case Studies */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(120%_140%_at_50%_50%,transparent_55%,rgba(0,0,0,0.35)_100%)]"
      />
      {/* Faint gold aura leaning toward the rate card */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(70%_55%_at_70%_45%,rgba(198,166,106,0.09),transparent_65%)]"
      />

      {/* Film grain — above the ink, below every card, price and button.
         Kept quiet (8) so the dark ground reads as fabric, not static. */}
      <Noise patternAlpha={8} />

      <div className="relative z-20 mx-auto w-full max-w-[1480px] px-6 py-20 md:px-12 md:py-28">
        {/* ------------------------- header --------------------------- */}
        <div ref={headerRef}>
          <p className="flex items-center gap-4 font-sans text-[0.62rem] font-semibold uppercase tracking-[0.3em] text-[#c6a66a] sm:text-xs">
            <span aria-hidden="true" className="text-[0.8em]">
              ✦
            </span>
            Pricing
            <span aria-hidden="true" className="h-px flex-1 bg-[#ededd5]/10" />
          </p>

          <div className="mt-8 flex flex-col gap-6 md:mt-10 md:flex-row md:items-end md:justify-between md:gap-12">
            <h2 className="max-w-3xl font-heading font-thin not-italic text-4xl leading-[1.08] tracking-[-0.01em] sm:text-5xl md:text-6xl">
              Pricing for each{" "}
              <span className="not-italic text-[#c6a66a]">phase</span> of your
              journey
            </h2>
            <p className="max-w-sm shrink-0 font-sans text-sm leading-relaxed text-[#ededd5]/60 md:pb-2 md:text-[0.95rem]">
              We run the entire booking system for mobile event caterers — SEO,
              Google, Flashquotes, automations, reviews, campaigns — so your
              carts stay booked and your phone stops being your job.
            </p>
          </div>
        </div>

        {/* --------------------- selector + rate card ------------------ */}
        <div className="mt-12 grid grid-cols-1 gap-10 md:mt-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          {/* Plan index — hairline-ruled, always-comparable prices */}
          <div>
            <p
              id="le-pricing-label"
              className="font-sans text-[0.58rem] font-semibold uppercase tracking-[0.3em] text-[#ededd5]/50"
            >
              Choose Your Plan
            </p>

            <div
              ref={railRef}
              role="tablist"
              aria-orientation="vertical"
              aria-labelledby="le-pricing-label"
              className="mt-5 border-t border-[#ededd5]/10"
            >
              {PLANS.map((entry, index) => {
                const isSelected = selected === index;
                return (
                  <button
                    key={entry.id}
                    ref={(el) => {
                      tabRefs.current[index] = el;
                    }}
                    type="button"
                    role="tab"
                    id={`le-plan-tab-${entry.id}`}
                    aria-selected={isSelected}
                    aria-controls="le-plan-panel"
                    tabIndex={isSelected ? 0 : -1}
                    onClick={() => setSelected(index)}
                    onKeyDown={(e) => onTabKeyDown(e, index)}
                    className={`le-plan-row group relative block w-full cursor-pointer border-b border-[#ededd5]/10 text-left transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c6a66a] ${
                      isSelected ? "opacity-100" : "opacity-55 hover:opacity-90"
                    }`}
                  >
                    <span
                      className={`grid grid-cols-[1fr_auto] items-baseline gap-x-4 py-6 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:gap-x-6 md:py-7 ${
                        isSelected
                          ? "translate-x-2"
                          : "group-hover:translate-x-2"
                      }`}
                    >
                      {/* Plan name + quiet badge */}
                      <span className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                        <span className="font-heading font-thin not-italic text-2xl leading-[1.1] tracking-[-0.01em] text-[#ededd5] sm:text-3xl">
                          {entry.name}
                        </span>
                        {entry.popular && (
                          <span className="rounded-full border border-[#c6a66a]/50 px-2.5 py-1 font-sans text-[0.5rem] font-semibold uppercase tracking-[0.22em] text-[#c6a66a]">
                            Most Popular
                          </span>
                        )}
                      </span>

                      {/* Price — always visible, always comparable */}
                      <span className="justify-self-end font-sans text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#ededd5]/70 sm:text-xs">
                        {entry.price}
                        <span className="text-[#ededd5]/45">{entry.per}</span>
                      </span>
                    </span>

                    {/* Gold rule — sweeps in and STAYS on the selected plan */}
                    <span
                      aria-hidden="true"
                      className={`absolute inset-x-0 bottom-0 h-px origin-left bg-[#c6a66a]/80 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                        isSelected
                          ? "scale-x-100"
                          : "scale-x-0 group-hover:scale-x-100"
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Quiet editorial footnote */}
            <p className="mt-8 flex items-center gap-3 font-sans text-[0.58rem] font-semibold uppercase tracking-[0.3em] text-[#ededd5]/45">
              <span aria-hidden="true" className="text-[#c6a66a]">
                ✦
              </span>
              Every plan runs on the same system
            </p>
          </div>

          {/* The rate card — one physical paper sheet on the dark desk */}
          <div
            ref={cardRef}
            id="le-plan-panel"
            role="tabpanel"
            aria-labelledby={`le-plan-tab-${plan.id}`}
            className="relative overflow-hidden rounded-2xl border border-[#c6a66a]/25 bg-[#f7f5e8] text-[#261f15] shadow-[0_1px_2px_rgba(0,0,0,0.2),0_44px_88px_-32px_rgba(0,0,0,0.6)]"
          >
            {/* Gilded top edge — a thin gold-leaf strip, like the painted
               edge of an expensive card */}
            <span
              aria-hidden="true"
              className="absolute inset-x-0 top-0 z-10 h-[3px] bg-gradient-to-r from-[#c6a66a]/20 via-[#c6a66a] to-[#c6a66a]/20"
            />
            {/* Inset letterpress frame — a hairline plate border floating
               just inside the sheet */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-2.5 z-10 rounded-xl border border-[#261f15]/10 sm:inset-3"
            />

            <div ref={cardInnerRef} className="relative p-7 sm:p-9 md:p-11">
              {/* Soft-focus bobbles — each plan tints the paper with its own
                 out-of-focus bloom. Inside the crossfade layer so the colour
                 dissolves with the rest of the card on plan switch. */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-24 -top-28 z-0 h-[22rem] w-[22rem] rounded-full blur-3xl"
                style={{ backgroundColor: `${plan.glow}59` }}
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-24 -left-20 z-0 h-[18rem] w-[18rem] rounded-full blur-3xl"
                style={{ backgroundColor: `${plan.glow}38` }}
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute right-[18%] top-[38%] z-0 h-40 w-40 rounded-full bg-[#4a3421]/10 blur-2xl"
              />
              {/* Document masthead — small printed header, like a filed
                 rate sheet */}
              <div className="relative z-10 flex items-center gap-4">
                <p className="font-sans text-[0.55rem] font-semibold uppercase tracking-[0.3em] text-[#261f15]/45">
                  LocalEyes{" "}
                  <span aria-hidden="true" className="text-[#c6a66a]">
                    ✦
                  </span>{" "}
                  Rate Card
                </p>
                <span
                  aria-hidden="true"
                  className="h-px flex-1 bg-[#261f15]/10"
                />
              </div>

              {/* Card masthead — name + badge, price enormous */}
              <div className="relative z-10 mt-7 flex flex-wrap items-center gap-x-3 gap-y-2">
                <h3 className="font-heading font-thin not-italic text-[1.7rem] leading-[1.05] text-[#261f15] sm:text-3xl">
                  {plan.name}
                </h3>
                {plan.popular && (
                  <span className="rounded-full bg-[#c6a66a]/15 px-2.5 py-1 font-sans text-[0.5rem] font-semibold uppercase tracking-[0.22em] text-[#8a6f3d]">
                    Most Popular
                  </span>
                )}
              </div>

              <div className="relative z-10 mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <p className="font-heading font-thin not-italic text-[clamp(3.6rem,7vw,5.2rem)] leading-none tracking-[-0.02em] text-[#261f15]">
                  {plan.price}
                  <span className="ml-1 align-baseline text-[0.32em] tracking-[0.08em] text-[#261f15]/55">
                    {plan.per}
                  </span>
                </p>
                <p className="font-sans text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[#8a6f3d]">
                  {plan.note}
                </p>
              </div>

              {/* Two quiet columns: who-this-is-for + the feature ledger */}
              <div className="relative z-10 mt-9 grid grid-cols-1 gap-9 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] md:gap-10">
                {/* Who this is for */}
                <div>
                  <p className="flex items-center gap-3 font-sans text-[0.58rem] font-semibold uppercase tracking-[0.3em] text-[#8a6f3d]">
                    Who this is for
                    <span
                      aria-hidden="true"
                      className="h-px flex-1 bg-[#261f15]/10"
                    />
                  </p>
                  <ul className="mt-5 flex list-none flex-col gap-4 p-0">
                    {plan.who.map((line) => (
                      <li
                        key={line}
                        className="flex gap-3 font-sans text-sm leading-relaxed text-[#261f15]/75"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-[0.3em] shrink-0 text-[0.6rem] text-[#c6a66a]"
                        >
                          ✦
                        </span>
                        {line}
                      </li>
                    ))}
                  </ul>

                  {/* CTA — espresso chip that blooms to fill the pill,
                     the same mechanic as the Hero */}
                  <a
                    href={plan.ctaHref}
                    onClick={
                      plan.ctaHref === CALENDLY_BOOKING_URL
                        ? (e) => {
                            e.preventDefault();
                            openCalendly();
                          }
                        : undefined
                    }
                    className="group/btn relative mt-8 inline-flex w-auto cursor-pointer items-center justify-center gap-2.5 overflow-hidden rounded-full border border-[#261f15]/30 py-1 pl-5 pr-1 font-sans text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-[#261f15] transition-colors duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:gap-3 sm:py-1.5 sm:pl-6 sm:pr-1.5 sm:text-xs sm:tracking-[0.14em]"
                  >
                    <span className="relative z-10 py-1 transition-colors duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/btn:text-[#ededd5]">
                      {plan.ctaLabel}
                    </span>
                    <span className="relative flex h-8 w-8 shrink-0 items-center justify-center sm:h-9 sm:w-9">
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 rounded-full bg-[#4a3421] scale-100 transition-transform duration-500 ease-[cubic-bezier(0.33,1,0.68,1)] group-hover/btn:scale-[14] group-hover/btn:duration-[1100ms]"
                      />
                      <span className="relative z-10 flex text-[#ededd5] transition-transform duration-700 ease-[cubic-bezier(0.34,1.2,0.4,1)] group-hover/btn:rotate-45 will-change-transform">
                        <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
                      </span>
                    </span>
                  </a>
                </div>

                {/* Feature ledger — hairline rows, label / value */}
                <div>
                  <p className="flex items-center gap-3 font-sans text-[0.58rem] font-semibold uppercase tracking-[0.3em] text-[#8a6f3d]">
                    What's included
                    <span
                      aria-hidden="true"
                      className="h-px flex-1 bg-[#261f15]/10"
                    />
                  </p>
                  <dl className="mt-2">
                    {FEATURE_ROWS.map((row) => (
                      <div
                        key={row.label}
                        className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] items-baseline gap-x-4 border-b border-[#261f15]/8 py-3 last:border-b-0"
                      >
                        <dt className="font-sans text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-[#261f15]/50">
                          {row.label}
                        </dt>
                        <dd className="m-0 text-right font-sans text-[0.8rem] font-semibold leading-snug text-[#261f15]">
                          {row.values[selected]}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
