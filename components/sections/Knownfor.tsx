"use client";

import ScrollReveal from "@/components/effects/ScrollReveal";
import { Noise } from "@/components/effects/Noise";

/* ----------------------------------------------------------------------
   KnownFor — "What we're known for" editorial statement
   A cream magazine-spread moment: one bold paragraph set in oversized
   display type, revealed word-by-word by ScrollReveal (rotates in from
   8deg, words rising with a 10px blur clearing, scrubbed by scroll).
   - Key phrases ("#1 lead source", "momentum") turn gold + italic via
     the highlightWords prop.
   - A small gold ✦ spins quietly at the end of the eyebrow rule.
   - A soft gold glow slowly breathes behind the copy; film grain on top.
   - prefers-reduced-motion: copy renders static and fully legible.
   Tweak the copy, rotation, and blur below; accents in highlightWords.
   ---------------------------------------------------------------------- */

const STATEMENT =
  "Search is the #1 lead source for event brands — but most are barely scratching the surface. We help you get found by the right people, convince them before they even reach out, and build the kind of momentum that doesn't stop at one location.";

export default function KnownFor() {
  return (
    <section
      id="about"
      className="relative w-full overflow-hidden bg-[#ededd5] text-[#261f15]"
    >
      {/* Soft gold glow — slowly breathes behind the statement */}
      <div
        aria-hidden="true"
        className="animate-le-breathe pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(90%_75%_at_28%_45%,rgba(166,124,61,0.18),transparent_62%)]"
      />

      {/* Vignette — edges recede ever so slightly for quiet depth */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(120%_140%_at_50%_50%,transparent_60%,rgba(38,31,21,0.06)_100%)]"
      />

      {/* Film grain — kept light so it never gets grubby */}
      <div className="pointer-events-none absolute inset-0 z-[5]">
        <Noise patternAlpha={7} />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1480px] px-6 py-24 md:px-12 md:py-36">
        {/* Eyebrow heading — hairline ends in a small spinning ✦ */}
        <h2 className="flex items-center gap-4 font-sans text-[0.62rem] font-semibold uppercase tracking-[0.3em] text-[#a67c3d] sm:text-xs">
          <span aria-hidden="true" className="text-[0.8em]">
            ✦
          </span>
          What we&rsquo;re known for
          <span aria-hidden="true" className="h-px flex-1 bg-[#261f15]/10" />
          <span
            aria-hidden="true"
            className="animate-le-spin inline-block text-[1.1em] leading-none"
          >
            ✦
          </span>
        </h2>

        {/* The statement — ScrollReveal is the centerpiece */}
        <div className="mt-10 max-w-[1180px] md:mt-14">
          <ScrollReveal
            baseRotation={8}
            blurStrength={10}
            baseOpacity={0.08}
            baseY={45}
            enableBlur
            textClassName="font-heading not-italic text-[#261f15]"
            highlightWords={["#1", "lead", "source", "momentum"]}
            highlightClassName="le-word-accent"
            boldWords={["#1"]}
          >
            {STATEMENT}
          </ScrollReveal>
        </div>

        {/* Quiet sign-off rule */}
        <div className="mt-12 flex items-center gap-4 md:mt-16">
          <span aria-hidden="true" className="h-px w-16 bg-[#a67c3d]/60" />
          <span className="font-sans text-[0.55rem] font-semibold uppercase tracking-[0.22em] text-[#261f15]/55 sm:text-[0.6rem]">
            SEO-first growth systems
          </span>
        </div>
      </div>
    </section>
  );
}
