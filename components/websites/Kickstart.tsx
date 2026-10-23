"use client";

import { ArrowUpRight } from "lucide-react";
import { useCalendly, CALENDLY_BOOKING_URL } from "@/components/sections/CalendlyModal";
import { Eyebrow, Hairlines } from "./parts";

/* ----------------------------------------------------------------------
   Kickstart: the website package, as a rate card on the page, in the
   same paper as the home page's (gilded top edge, a hairline plate just
   inside the sheet, a soft gold bloom in the paper). Beside it, a few
   words and the way to the monthly plans.
   ---------------------------------------------------------------------- */

export type KickstartPlan = {
  name: string;
  price: string;
  body: string;
  features: string[];
  buyLabel: string;
  buyUrl: string;
};

export default function Kickstart({ plan }: { plan: KickstartPlan }) {
  const { open: openCalendly } = useCalendly();

  return (
    <section aria-labelledby="kickstart-title" className="relative w-full overflow-hidden bg-[#ededd5] py-24 text-[#261f15] md:py-32">
      <Hairlines />

      <div className="relative mx-auto grid w-full max-w-[1480px] items-center gap-14 px-6 md:px-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-20">
        {/* the words */}
        <div>
          <Eyebrow>Pricing</Eyebrow>
          <h2
            id="kickstart-title"
            className="mt-8 font-heading font-thin not-italic text-[clamp(2.3rem,4.4vw,4rem)] leading-[1.04] tracking-[-0.02em]"
          >
            One site, <span className="text-[#a67c3d]">one fixed price</span>
          </h2>
          <p className="mt-7 max-w-[30rem] font-sans text-[1rem] leading-[1.75] text-[#261f15]/70">
            The whole build, priced up front and designed around your brand. Rather talk it through first? Book a call and we&apos;ll
            go over it together.
          </p>
          <a
            href="/pricing"
            className="group/plans mt-9 inline-flex items-center gap-2 border-b border-[#261f15]/30 pb-1 font-sans text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#261f15] transition-colors duration-300 hover:border-[#8f6a2f] hover:text-[#8f6a2f] sm:text-xs"
          >
            SEO after launch? See the monthly plans
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover/plans:-translate-y-0.5 group-hover/plans:translate-x-0.5" />
          </a>
        </div>

        {/* the rate card */}
        <div className="relative overflow-hidden rounded-2xl border border-[#c6a66a]/30 bg-[#f7f5e8] shadow-[0_1px_2px_rgba(38,31,21,0.08),0_50px_90px_-45px_rgba(38,31,21,0.5)]">
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-0 z-10 h-[3px] bg-gradient-to-r from-[#c6a66a]/20 via-[#c6a66a] to-[#c6a66a]/20"
          />
          <span aria-hidden="true" className="pointer-events-none absolute inset-2.5 z-10 rounded-xl border border-[#261f15]/10 sm:inset-3" />
          <span aria-hidden="true" className="pointer-events-none absolute -right-24 -top-28 h-[22rem] w-[22rem] rounded-full bg-[#c6a66a]/35 blur-3xl" />
          <span aria-hidden="true" className="pointer-events-none absolute -bottom-24 -left-20 h-[18rem] w-[18rem] rounded-full bg-[#c6a66a]/20 blur-3xl" />

          <div className="relative p-7 sm:p-10 md:p-12">
            <div className="flex items-center gap-4">
              <p className="font-sans text-[0.55rem] font-semibold uppercase tracking-[0.3em] text-[#261f15]/45">
                LocalEyes{" "}
                <span aria-hidden="true" className="text-[#c6a66a]">
                  ✦
                </span>{" "}
                Rate Card
              </p>
              <span aria-hidden="true" className="h-px flex-1 bg-[#261f15]/10" />
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-2">
              <h3 className="font-heading text-[1.7rem] font-thin not-italic leading-[1.05] sm:text-3xl">{plan.name}</h3>
              <span className="rounded-full bg-[#c6a66a]/15 px-2.5 py-1 font-sans text-[0.5rem] font-semibold uppercase tracking-[0.22em] text-[#8a6f3d]">
                Fixed price
              </span>
            </div>
            <p className="mt-4 font-heading text-[clamp(3.6rem,7vw,5.6rem)] font-thin not-italic leading-none tracking-[-0.02em]">
              {plan.price}
            </p>
            <p className="mt-5 max-w-[30rem] font-sans text-[0.95rem] leading-relaxed text-[#261f15]/70">{plan.body}</p>

            <p className="mt-9 flex items-center gap-3 font-sans text-[0.58rem] font-semibold uppercase tracking-[0.3em] text-[#8a6f3d]">
              What&apos;s included
              <span aria-hidden="true" className="h-px flex-1 bg-[#261f15]/10" />
            </p>
            <ul className="mt-2 grid sm:grid-cols-2 sm:gap-x-8">
              {plan.features.map((f) => (
                <li key={f} className="flex gap-3 border-b border-[#261f15]/10 py-4 font-sans text-sm leading-relaxed text-[#261f15]/75">
                  <span aria-hidden="true" className="mt-[0.3em] shrink-0 text-[0.6rem] text-[#c6a66a]">
                    ✦
                  </span>
                  {f}
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-5">
              <a
                href={plan.buyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group/btn relative inline-flex cursor-pointer items-center gap-3 overflow-hidden rounded-full bg-[#c6a66a] py-2 pl-7 pr-2 font-sans text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#261f15] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8f6a2f] sm:text-xs"
              >
                <span className="relative z-10 py-2 transition-colors duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/btn:text-[#ededd5]">
                  {plan.buyLabel}
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
              </a>
              <a
                href={CALENDLY_BOOKING_URL}
                onClick={(e) => {
                  e.preventDefault();
                  openCalendly();
                }}
                className="group/call inline-flex items-center gap-2 border-b border-[#261f15]/30 pb-1 font-sans text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#261f15] transition-colors duration-300 hover:border-[#8f6a2f] hover:text-[#8f6a2f] sm:text-xs"
              >
                Book a call
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover/call:-translate-y-0.5 group-hover/call:translate-x-0.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
