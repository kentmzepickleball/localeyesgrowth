"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronDown } from "lucide-react";
import Image, { type StaticImageData } from "next/image";
import { Noise } from "@/components/effects/Noise";
import { useGrowthDiagnostic } from "@/components/growth-diagnostic/GrowthDiagnosticProvider";

gsap.registerPlugin(ScrollTrigger);

/* ----------------------------------------------------------------------
   /case-studies — five real clients, each as: an info matrix on one
   side, photo(s) on the other, and a full write-up that expands below.
   Placeholder entries (no `matrix`/`photo`/`story`) render as a quiet
   "coming soon" card instead of fabricated results.
   ---------------------------------------------------------------------- */

export type CaseStudy = {
  client: string;
  tagline: string;
  logo?: StaticImageData;
  photo?: StaticImageData;
  photoAlt?: string;
  matrix?: { label: string; value: string }[];
  story?: string[];
  comingSoon?: boolean;
};

function CaseStudyCard({ study, index }: { study: CaseStudy; index: number }) {
  const [expanded, setExpanded] = useState(false);

  if (study.comingSoon) {
    return (
      <div className="le-cs-block flex flex-col items-center justify-center gap-3 rounded-[1.75rem] border border-dashed border-[#261f15]/20 bg-[#f7f5e8]/40 px-8 py-16 text-center">
        <span className="font-heading font-thin not-italic text-3xl text-[#261f15]/40">
          {study.client}
        </span>
        <p className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#261f15]/40">
          {study.tagline}
        </p>
      </div>
    );
  }

  return (
    <div className="le-cs-block overflow-hidden rounded-[1.75rem] border border-[#261f15]/12 bg-[#f7f5e8] shadow-[0_1px_2px_rgba(38,31,21,0.05),0_28px_56px_-28px_rgba(38,31,21,0.4)]">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* ---------------------- info matrix ---------------------- */}
        <div className="flex flex-col justify-center p-8 sm:p-10 lg:p-12">
          <div className="flex items-center gap-3">
            <span className="font-heading font-thin not-italic text-3xl leading-none text-[#a67c3d] sm:text-4xl">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span aria-hidden="true" className="h-px flex-1 bg-[#261f15]/10" />
          </div>

          {study.logo ? (
            <Image
              src={study.logo}
              alt={`${study.client} logo`}
              className="mt-6 h-9 w-auto object-contain object-left"
            />
          ) : (
            <h3 className="mt-6 font-heading font-thin not-italic text-3xl text-[#261f15] sm:text-4xl">
              {study.client}
            </h3>
          )}

          <p className="mt-2 font-sans text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#8a6f3d]">
            {study.tagline}
          </p>

          {study.matrix && (
            <dl className="mt-8 flex flex-col">
              {study.matrix.map((row, i) => (
                <div
                  key={row.label}
                  className={`flex items-baseline justify-between gap-4 py-3 ${
                    i > 0 ? "border-t border-[#261f15]/10" : ""
                  }`}
                >
                  <dt className="font-sans text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[#261f15]/45">
                    {row.label}
                  </dt>
                  <dd className="text-right font-sans text-sm font-semibold text-[#261f15]">
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        {/* ------------------------- photo -------------------------- */}
        {study.photo && (
          <div className="relative min-h-[16rem] w-full lg:min-h-full">
            <Image
              src={study.photo}
              alt={study.photoAlt ?? `${study.client} — proof`}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        )}
      </div>

      {/* --------------------- expandable story ---------------------- */}
      {study.story && (
        <div className="border-t border-[#261f15]/10">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="flex w-full cursor-pointer items-center justify-between gap-4 px-8 py-5 font-sans text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#261f15]/70 transition-colors duration-300 hover:text-[#261f15] sm:px-10 lg:px-12"
          >
            {expanded ? "Hide the full story" : "Read the full story"}
            <ChevronDown
              className={`h-4 w-4 shrink-0 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
            />
          </button>
          <div
            className={`grid transition-[grid-template-rows] duration-400 ease-out ${
              expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            }`}
          >
            <div className="overflow-hidden">
              <div className="flex flex-col gap-4 px-8 pb-10 sm:px-10 lg:px-12">
                {study.story.map((p, i) => (
                  <p key={i} className="font-sans text-[0.95rem] leading-[1.75] text-[#261f15]/75">
                    {p}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CaseStudiesPage({ studies }: { studies: CaseStudy[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const { open: openQuiz } = useGrowthDiagnostic();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const blocks = section.querySelectorAll<HTMLElement>(".le-cs-block");
    const tweens: gsap.core.Tween[] = [];
    blocks.forEach((block) => {
      tweens.push(
        gsap.fromTo(
          block,
          { autoAlpha: 0, y: 32 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
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
        <div className="relative mx-auto max-w-3xl px-6 text-center md:px-12">
          <Noise patternAlpha={5} />
          <div className="relative z-10">
            <p className="flex items-center justify-center gap-3 font-sans text-[0.62rem] font-semibold uppercase tracking-[0.3em] text-[#8a6f3d] sm:text-xs">
              <span aria-hidden="true" className="text-[0.8em]">
                ✦
              </span>
              Case Studies
              <span aria-hidden="true" className="text-[0.8em]">
                ✦
              </span>
            </p>
            <h1 className="mx-auto mt-5 font-heading font-thin not-italic text-[clamp(2.4rem,5.2vw,4.2rem)] leading-[1.06] tracking-[-0.01em] text-[#261f15]">
              Real Clients, Real Rankings
            </h1>
            <p className="mx-auto mt-6 max-w-xl font-sans text-sm leading-relaxed text-[#261f15]/65 sm:text-base">
              Every result below is a real client, with real numbers. No composites, no projections.
            </p>
          </div>
        </div>

        <div className="relative z-20 mx-auto mt-16 flex w-full max-w-4xl flex-col gap-8 px-6 md:mt-20 md:px-12">
          {studies.map((study, i) => (
            <CaseStudyCard key={study.client} study={study} index={i} />
          ))}
        </div>

        <div className="le-cs-block relative z-20 mx-auto mt-16 max-w-2xl rounded-[1.75rem] border border-[#c6a66a]/35 bg-[#261f15] px-8 py-12 text-center text-[#ededd5] md:mt-20 md:px-14 md:py-16">
          <h2 className="font-heading font-thin not-italic text-[clamp(1.7rem,3vw,2.3rem)] leading-[1.15] tracking-[-0.01em]">
            Want to be the next one on this page?
          </h2>
          <p className="mx-auto mt-4 max-w-md font-sans text-sm leading-relaxed text-[#ededd5]/65">
            Run the free Growth Diagnostic to see where your rankings and Google presence stand today.
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
            </span>
          </button>
        </div>
      </section>
    </main>
  );
}
