"use client";

import { useRef } from "react";
import Image from "next/image";
import { Eyebrow, Hairlines, useSeen } from "./parts";

/* ----------------------------------------------------------------------
   BuildAnatomy: what goes into every build, in four details of a real
   one, read left to right. Each card is a close crop of Arbour's home
   page on the part a point is about, that part lit and the rest of the
   page dimmed: the headline written for the search ("coffee catering
   for Raleigh"), the real photography, the instant quote button, the
   brand's own script. Under each, the point. The cards rise in turn when
   they come on screen (at once with reduced motion); pointing at one
   leans in a little closer.
   ---------------------------------------------------------------------- */

const SHOT = "/websites/showcase/arbour.webp";
const SHOT_ASPECT = 1920 / 1200;
const CARD_ASPECT = 4 / 3;
/* the page's own edge in the screenshot (a white margin, rounded corners) */
const EDGE = { x: 0.03, y: 0.045 };

/* each detail: where to centre the crop and how close to go, and the
   part to light, all as shares of the screenshot */
type Detail = { cx: number; cy: number; zoom: number; box: [number, number, number, number] };
const DETAILS: Detail[] = [
  { cx: 0.35, cy: 0.55, zoom: 1.6, box: [0.06, 0.48, 0.638, 0.62] }, // the headline
  { cx: 0.54, cy: 0.33, zoom: 2.2, box: [0.37, 0.2, 0.7, 0.46] }, // the photograph
  { cx: 0.2, cy: 0.85, zoom: 2.6, box: [0.06, 0.835, 0.266, 0.9] }, // "Get my instant quote"
  { cx: 0.25, cy: 0.67, zoom: 2.4, box: [0.068, 0.637, 0.417, 0.708] }, // "& the Carolinas"
];

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const pct = (v: number) => `${(v * 100).toFixed(2)}%`;

/* the crop, in shares of the card: where the screenshot sits and how
   big, and where the lit part falls */
function frame(d: Detail) {
  const iw = d.zoom;
  const ih = (d.zoom * CARD_ASPECT) / SHOT_ASPECT;
  const left = clamp(0.5 - d.cx * iw, 1 - (1 - EDGE.x) * iw, -EDGE.x * iw);
  const top = clamp(0.5 - d.cy * ih, 1 - (1 - EDGE.y) * ih, -EDGE.y * ih);
  const [x0, y0, x1, y1] = d.box;
  return {
    shot: { left: pct(left), top: pct(top), width: pct(iw), height: pct(ih) },
    lit: { left: pct(left + x0 * iw), top: pct(top + y0 * ih), width: pct((x1 - x0) * iw), height: pct((y1 - y0) * ih) },
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

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
  const gridRef = useRef<HTMLOListElement>(null);
  const seen = useSeen(gridRef);

  return (
    <section aria-labelledby="build-anatomy-title" className="relative w-full overflow-hidden bg-[#ededd5] pb-24 pt-8 text-[#261f15] md:pb-32 md:pt-12">
      <style>{`
        .le-detail { opacity: 0; transform: translateY(18px); transition: opacity 0.9s ease, transform 1s cubic-bezier(0.22, 1, 0.36, 1); }
        [data-seen="true"] .le-detail { opacity: 1; transform: none; }
        .le-detail-zoom { transition: transform 1.2s cubic-bezier(0.22, 1, 0.36, 1); }
        .le-detail:hover .le-detail-zoom { transform: scale(1.045); }
        @media (prefers-reduced-motion: reduce) {
          .le-detail, .le-detail-zoom { transition: none; }
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

        <ol ref={gridRef} data-seen={seen} className="mt-14 grid gap-x-6 gap-y-14 sm:grid-cols-2 md:mt-16 xl:grid-cols-4">
          {items.map((item, i) => {
            const d = DETAILS[i % DETAILS.length];
            const f = frame(d);
            return (
              <li key={item.title} className="le-detail" style={{ transitionDelay: `${i * 0.12}s` }}>
                {/* the detail */}
                <div className="relative aspect-[4/3] overflow-hidden rounded-[12px] bg-[#3a3833] shadow-[0_1px_2px_rgba(38,31,21,0.08),0_34px_60px_-38px_rgba(38,31,21,0.6)]">
                  <div className="le-detail-zoom absolute inset-0">
                    <span className="absolute" style={f.shot}>
                      <Image
                        src={SHOT}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 260vw, (max-width: 1280px) 130vw, 65vw"
                        className="object-cover"
                      />
                    </span>
                    {/* the part the point is about, lit; the rest of the page dimmed */}
                    <span
                      aria-hidden="true"
                      className="absolute rounded-[6px] border border-[#c6a66a] shadow-[0_0_0_9999px_rgba(24,19,12,0.5),0_0_24px_rgba(198,166,106,0.35)]"
                      style={f.lit}
                    />
                  </div>
                </div>

                {/* the point */}
                <div className="mt-6 border-t border-[#261f15]/12 pt-5">
                  <p className="font-sans text-[0.55rem] font-semibold uppercase tracking-[0.26em] text-[#8a6f3d]">
                    {pad(i + 1)} <span className="text-[#c6a66a]">/</span> {pad(items.length)}
                  </p>
                  <h3 className="mt-3 font-heading text-[1.4rem] font-thin not-italic leading-[1.15] tracking-[-0.01em]">{item.title}</h3>
                  <p className="mt-3 font-sans text-[0.9rem] leading-relaxed text-[#261f15]/65">{item.body}</p>
                </div>
              </li>
            );
          })}
        </ol>

        <p className="mt-14 flex flex-wrap items-center gap-x-3 gap-y-1 font-sans text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-[#261f15]/45">
          Details from Arbour Coffee Co.&apos;s home page <span className="text-[#c6a66a]">·</span> Raleigh, NC
          <span className="text-[#c6a66a]">·</span> One of the nine above
        </p>
      </div>
    </section>
  );
}
