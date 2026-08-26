"use client";

import { ArrowUpRight } from "lucide-react";
import { useGrowthDiagnostic } from "@/components/growth-diagnostic/GrowthDiagnosticProvider";

/* Same pill-with-blooming-icon-chip mechanic used for every primary CTA
   sitewide (Hero, ServiceLandingPage). "/growth-diagnostic" isn't a real
   route — it's the quiz modal, intercepted on click, same pattern as
   BlogArticle's markdown link handling for this exact href. */

export function GrowthDiagnosticCta({ label }: { label: string }) {
  const { open: openQuiz } = useGrowthDiagnostic();

  return (
    <a
      href="/growth-diagnostic"
      onClick={(e) => {
        e.preventDefault();
        openQuiz();
      }}
      className="group/pcta relative inline-flex w-fit cursor-pointer items-center gap-3 overflow-hidden rounded-full bg-[#c6a66a] py-2 pl-7 pr-2 font-sans text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#261f15] transition-colors duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:text-xs"
    >
      <span className="relative z-10 py-2 transition-colors duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/pcta:text-[#ededd5]">
        {label}
      </span>
      <span className="relative flex h-9 w-9 shrink-0 items-center justify-center">
        <span
          aria-hidden="true"
          className="absolute inset-0 scale-100 rounded-full bg-[#261f15] transition-transform duration-500 ease-[cubic-bezier(0.33,1,0.68,1)] group-hover/pcta:scale-[12] group-hover/pcta:duration-[1100ms]"
        />
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full bg-[#261f15] transition-colors duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/pcta:bg-[#c6a66a]"
        />
        <span className="relative z-10 flex rotate-0 transition-transform duration-700 ease-[cubic-bezier(0.34,1.2,0.4,1)] group-hover/pcta:rotate-45">
          <ArrowUpRight className="h-4 w-4 text-[#ededd5] transition-colors duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/pcta:text-[#261f15]" />
        </span>
      </span>
    </a>
  );
}
