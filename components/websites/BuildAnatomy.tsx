"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Eyebrow, Hairlines, useSeen } from "./parts";

/* ----------------------------------------------------------------------
   BuildAnatomy: what goes into every build, drawn on a real one, the way
   an anatomy plate is labelled. Arbour's home page sits in the middle;
   from four marks on it, hairline leaders run out to the four points,
   two each side: the headline written for the search ("coffee catering
   for Raleigh"), the real photography, the instant quote button, the
   brand's own script. The leaders draw in when the plate comes on
   screen (at once with reduced motion); pointing at a point lights its
   leader and mark. Narrow screens: numbered marks on the page, the
   points listed under it.
   ---------------------------------------------------------------------- */

/* the plate, in its own units: 1000 across, the page 540 of it in the
   middle, the points either side */
const PLATE = { w: 1000, h: 331, page: { x: 230, w: 540 } };
/* where each point sits on the page, as a share of it (the screenshot's
   own white edge cropped off), and which side its label goes */
const MARKS = [
  { x: 0.03, y: 0.55, side: "left" }, // the headline: premium coffee catering for Raleigh
  { x: 0.575, y: 0.3, side: "right" }, // the photograph
  { x: 0.03, y: 0.886, side: "left" }, // "Get my instant quote"
  { x: 0.43, y: 0.69, side: "right" }, // "& the Carolinas", in the brand's script
] as const;
const LEAD = 22; // how far a leader reaches out past the page

const pad = (n: number) => String(n).padStart(2, "0");
const at = (m: (typeof MARKS)[number]) => ({ x: PLATE.page.x + PLATE.page.w * m.x, y: PLATE.h * m.y });
const edge = (m: (typeof MARKS)[number]) => (m.side === "left" ? PLATE.page.x : PLATE.page.x + PLATE.page.w);
const outer = (m: (typeof MARKS)[number]) => (m.side === "left" ? PLATE.page.x - LEAD : PLATE.page.x + PLATE.page.w + LEAD);

export default function BuildAnatomy({
  lead,
  accent,
  intro,
  items,
}: {
  lead: string;
  accent: string;
  intro: string;
  items: { title: string; body: string }[];
}) {
  const [lit, setLit] = useState<number | null>(null);
  const plateRef = useRef<HTMLDivElement>(null);
  const seen = useSeen(plateRef);
  const marks = MARKS.slice(0, items.length);

  /* the page itself, its white edge cropped away */
  const page = (
    <span className="absolute left-[-1.61%] top-[-2.63%] h-[105.26%] w-[103.23%]">
      <Image
        src="/websites/showcase/arbour.webp"
        alt="The home page of Arbour Coffee Co.'s site, built by LocalEyes"
        fill
        sizes="(max-width: 1024px) 100vw, 54vw"
        className="object-cover"
      />
    </span>
  );

  return (
    <section aria-labelledby="build-anatomy-title" className="relative w-full overflow-hidden bg-[#ededd5] pb-24 pt-8 text-[#261f15] md:pb-32 md:pt-12">
      <style>{`
        .le-plate-line { stroke-dasharray: 1; stroke-dashoffset: 1; transition: stroke-dashoffset 1.1s cubic-bezier(0.22, 1, 0.36, 1); }
        .le-plate-fade { opacity: 0; transform: translateY(8px); transition: opacity 0.8s ease, transform 0.9s cubic-bezier(0.22, 1, 0.36, 1); }
        [data-seen="true"] .le-plate-line { stroke-dashoffset: 0; }
        [data-seen="true"] .le-plate-fade { opacity: 1; transform: none; }
        @media (prefers-reduced-motion: reduce) {
          .le-plate-line, .le-plate-fade { transition: none; }
        }
      `}</style>
      <Hairlines />

      <div className="relative mx-auto w-full max-w-[1480px] px-6 md:px-12">
        <Eyebrow>Anatomy of a build</Eyebrow>
        <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <h2
            id="build-anatomy-title"
            className="font-heading font-thin not-italic text-[clamp(2.3rem,4.4vw,4rem)] leading-[1.04] tracking-[-0.02em]"
          >
            {lead} <span className="text-[#a67c3d]">{accent}</span>
          </h2>
          <p className="max-w-[22rem] font-sans text-[0.95rem] leading-relaxed text-[#261f15]/65 lg:pb-2 lg:text-right">{intro}</p>
        </div>

        {/* ---- wide screens: the plate ---- */}
        <div
          ref={plateRef}
          data-seen={seen}
          className="relative mb-20 mt-20 hidden lg:block"
          style={{ aspectRatio: `${PLATE.w} / ${PLATE.h}` }}
        >
          {/* the page */}
          <div
            className="absolute top-0 h-full overflow-hidden rounded-[14px] bg-[#3a3833] shadow-[0_1px_2px_rgba(38,31,21,0.08),0_60px_90px_-50px_rgba(38,31,21,0.6)]"
            style={{ left: `${(PLATE.page.x / PLATE.w) * 100}%`, width: `${(PLATE.page.w / PLATE.w) * 100}%` }}
          >
            {page}
          </div>

          {/* the leaders: in cream across the page, in ink outside it */}
          <svg
            aria-hidden="true"
            viewBox={`0 0 ${PLATE.w} ${PLATE.h}`}
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
          >
            {marks.map((m, i) => {
              const p = at(m);
              const on = lit === null || lit === i;
              return (
                <g key={i} style={{ opacity: on ? 1 : 0.3, transition: "opacity 0.4s" }}>
                  <path
                    d={`M ${outer(m)} ${p.y} L ${edge(m)} ${p.y}`}
                    pathLength={1}
                    fill="none"
                    stroke={lit === i ? "#a67c3d" : "#261f15"}
                    strokeOpacity={lit === i ? 1 : 0.4}
                    strokeWidth={1.1}
                    vectorEffect="non-scaling-stroke"
                    className="le-plate-line"
                    style={{ transitionDelay: `${0.2 + i * 0.18}s` }}
                  />
                  <path
                    d={`M ${edge(m)} ${p.y} L ${p.x} ${p.y}`}
                    pathLength={1}
                    fill="none"
                    stroke={lit === i ? "#c6a66a" : "#ededd5"}
                    strokeOpacity={0.9}
                    strokeWidth={lit === i ? 1.6 : 1.1}
                    vectorEffect="non-scaling-stroke"
                    className="le-plate-line"
                    style={{ transitionDelay: `${0.45 + i * 0.18}s` }}
                  />
                </g>
              );
            })}
          </svg>

          {/* the marks */}
          {marks.map((m, i) => {
            const p = at(m);
            return (
              <span
                key={i}
                aria-hidden="true"
                className="le-plate-fade absolute -ml-3.5 -mt-3.5 flex h-7 w-7 items-center justify-center rounded-full border font-sans text-[0.55rem] font-bold shadow-[0_6px_14px_-6px_rgba(0,0,0,0.6)]"
                style={{
                  left: `${(p.x / PLATE.w) * 100}%`,
                  top: `${(p.y / PLATE.h) * 100}%`,
                  transitionDelay: `${0.9 + i * 0.18}s`,
                  backgroundColor: lit === i ? "#a67c3d" : "#ededd5",
                  borderColor: lit === i ? "#a67c3d" : "#c6a66a",
                  color: lit === i ? "#ededd5" : "#261f15",
                }}
              >
                {pad(i + 1)}
              </span>
            );
          })}

          {/* the points */}
          {marks.map((m, i) => {
            const p = at(m);
            const left = m.side === "left";
            const on = lit === null || lit === i;
            return (
              <div
                key={i}
                onPointerEnter={() => setLit(i)}
                onPointerLeave={() => setLit(null)}
                className={`le-plate-fade absolute w-[20%] ${left ? "text-right" : "text-left"}`}
                style={{
                  ...(left ? { left: 0 } : { right: 0 }),
                  top: `${(p.y / PLATE.h) * 100}%`,
                  marginTop: "-0.8rem",
                  transitionDelay: `${0.5 + i * 0.18}s`,
                }}
              >
                <p className={`flex items-baseline gap-3 ${left ? "flex-row-reverse" : ""}`}>
                  <span className="font-heading text-[1.35rem] font-thin not-italic leading-none text-[#a67c3d]">{pad(i + 1)}</span>
                  <span
                    className={`font-heading text-[1.3rem] font-thin not-italic leading-[1.15] tracking-[-0.01em] transition-colors duration-300 ${
                      on ? "text-[#261f15]" : "text-[#261f15]/40"
                    }`}
                  >
                    {items[i].title}
                  </span>
                </p>
                <p className={`mt-2 font-sans text-[0.82rem] leading-relaxed transition-colors duration-300 ${on ? "text-[#261f15]/60" : "text-[#261f15]/30"}`}>
                  {items[i].body}
                </p>
              </div>
            );
          })}
        </div>

        {/* ---- narrow screens: the page with its marks, the points under it ---- */}
        <div className="mt-12 lg:hidden">
          <div className="relative aspect-[1860/1140] overflow-hidden rounded-[12px] bg-[#3a3833] shadow-[0_40px_70px_-45px_rgba(38,31,21,0.6)]">
            {page}
            {marks.map((m, i) => (
              <span
                key={i}
                aria-hidden="true"
                className="absolute -ml-3 -mt-3 flex h-6 w-6 items-center justify-center rounded-full border border-[#c6a66a] bg-[#ededd5] font-sans text-[0.5rem] font-bold text-[#261f15] shadow-[0_6px_14px_-6px_rgba(0,0,0,0.6)]"
                style={{ left: `${m.x * 100}%`, top: `${m.y * 100}%` }}
              >
                {pad(i + 1)}
              </span>
            ))}
          </div>
          <ol className="mt-10 grid gap-x-10 sm:grid-cols-2">
            {items.map((item, i) => (
              <li key={item.title} className="flex gap-5 border-t border-[#261f15]/10 py-6">
                <span className="w-9 shrink-0 font-heading text-[1.5rem] font-thin not-italic leading-none text-[#a67c3d]">{pad(i + 1)}</span>
                <span>
                  <span className="block font-heading text-[1.3rem] font-thin not-italic leading-tight tracking-[-0.01em]">{item.title}</span>
                  <span className="mt-2 block font-sans text-[0.92rem] leading-relaxed text-[#261f15]/65">{item.body}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>

        <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 font-sans text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-[#261f15]/45 lg:justify-center">
          Arbour Coffee Co. <span className="text-[#c6a66a]">·</span> Premium coffee catering, Raleigh, NC
          <span className="text-[#c6a66a]">·</span> One of the nine above
        </p>
      </div>
    </section>
  );
}
