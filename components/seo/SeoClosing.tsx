"use client";

import { ArrowUpRight } from "lucide-react";
import { useGrowthDiagnostic } from "@/components/growth-diagnostic/GrowthDiagnosticProvider";
import { useCalendly, CALENDLY_BOOKING_URL } from "@/components/sections/CalendlyModal";
import { Hairlines } from "@/components/websites/parts";

/* ----------------------------------------------------------------------
   SeoClosing: the last word on the SEO page, on the dark of the other
   pages' closing bands. A wide ring of lettering turns slowly behind it,
   the house line set round it; still with reduced motion.
   ---------------------------------------------------------------------- */

export default function SeoClosing({ lead, accent, body }: { lead: string; accent: string; body: string }) {
  const { open: openQuiz } = useGrowthDiagnostic();
  const { open: openCalendly } = useCalendly();
  const link =
    "font-sans text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[#ededd5]/55 underline decoration-[#ededd5]/25 underline-offset-[6px] transition-colors hover:text-[#ededd5] hover:decoration-[#ededd5]/60 sm:text-xs";

  return (
    <section aria-labelledby="seo-closing-title" className="relative w-full overflow-hidden bg-[#261f15] py-28 text-[#ededd5] md:py-40">
      <Hairlines dark />
      {/* the house line, round a ring */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[min(118vw,700px)] w-[min(118vw,700px)] -translate-x-1/2 -translate-y-1/2"
      >
        <svg viewBox="0 0 100 100" className="h-full w-full animate-le-spin-slow" fill="none">
          <defs>
            <path id="le-seo-closing-circle" d="M 50,50 m -44,0 a 44,44 0 1,1 88,0 a 44,44 0 1,1 -88,0" />
          </defs>
          <circle cx="50" cy="50" r="40.5" stroke="#c6a66a" strokeOpacity="0.1" strokeWidth="0.1" />
          <text className="font-sans" fill="#c6a66a" fillOpacity="0.11" fontSize="2.3" fontWeight="600" letterSpacing="1.9">
            <textPath href="#le-seo-closing-circle" startOffset="0">
              RANKINGS GET YOU FOUND ✦ THE PLAYBOOK GETS YOU BOOKED ✦ LOCALEYES ✦ EST. MMXXIII ✦
            </textPath>
          </text>
        </svg>
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(45% 50% at 50% 50%, rgba(198,166,106,0.12), rgba(198,166,106,0) 70%)" }}
      />

      <div className="relative mx-auto flex w-full max-w-[1480px] flex-col items-center px-6 text-center md:px-12">
        <p className="flex items-center gap-3 font-sans text-[0.62rem] font-semibold uppercase tracking-[0.3em] text-[#c6a66a] sm:text-xs">
          <span aria-hidden="true" className="text-[0.8em]">
            ✦
          </span>
          Free growth diagnostic
          <span aria-hidden="true" className="text-[0.8em]">
            ✦
          </span>
        </p>
        <h2 id="seo-closing-title" className="mt-8 max-w-[52rem] text-balance font-heading text-[clamp(2.6rem,6vw,5.4rem)] font-thin not-italic leading-[1.02] tracking-[-0.02em]">
          {lead} <span className="text-[#c6a66a]">{accent}</span>
        </h2>
        <p className="mt-7 max-w-[32rem] font-sans text-[1rem] leading-[1.7] text-[#ededd5]/60">{body}</p>

        <button
          type="button"
          onClick={openQuiz}
          className="group/btn relative mt-11 inline-flex cursor-pointer items-center gap-3 overflow-hidden rounded-full bg-[#c6a66a] py-2 pl-7 pr-2 font-sans text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#261f15] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c6a66a] sm:text-xs"
        >
          <span className="relative z-10 py-2 transition-colors duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/btn:text-[#ededd5]">
            Run my free growth diagnostic
          </span>
          <span className="relative flex h-9 w-9 shrink-0 items-center justify-center">
            <span
              aria-hidden="true"
              className="absolute inset-0 scale-100 rounded-full bg-[#3a3020] transition-transform duration-500 ease-[cubic-bezier(0.33,1,0.68,1)] group-hover/btn:scale-[25] group-hover/btn:duration-[1100ms]"
            />
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-full bg-[#3a3020] transition-colors duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/btn:bg-[#ededd5]"
            />
            <span className="relative z-10 flex rotate-0 transition-transform duration-700 ease-[cubic-bezier(0.34,1.2,0.4,1)] group-hover/btn:rotate-45">
              <ArrowUpRight className="h-4 w-4 text-[#ededd5] transition-colors duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/btn:text-[#3a3020]" />
            </span>
          </span>
        </button>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
          <a
            href={CALENDLY_BOOKING_URL}
            onClick={(e) => {
              e.preventDefault();
              openCalendly();
            }}
            className={link}
          >
            Book a call
          </a>
          <a href="/pricing" className={link}>
            View pricing
          </a>
        </div>
      </div>
    </section>
  );
}
