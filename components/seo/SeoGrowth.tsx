"use client";

import { useEffect, useRef, useState } from "react";
import { Eyebrow, Hairlines, useReducedMotion, useSeen } from "@/components/websites/parts";

/* ----------------------------------------------------------------------
   SeoGrowth: one real client's leads from Google, month by month, from
   the month we started, redrawn from their Google Business Profile
   report in the house's gold. When the chart comes on screen the line
   draws itself left to right, the months' figures come in behind it,
   and the last month, the highest, glows. Pointing at a month shows its
   figure. Under the chart, four facts from it, set in the page's four
   columns, counting up; under those, what every client gets in writing
   each month. Reduced motion: drawn and counted already.
   - Only figures the report gives are printed. A month it gives no
     figure for has no label; a month it does not show has no point.
   ---------------------------------------------------------------------- */

export type Month = { month: string; year?: string; value: number | null; quiet?: boolean };
export type Fact = { value: number; prefix?: string; suffix?: string; label: string };

const W = 1200;
const H = 430;
const X0 = 70;
const X1 = 1150;
const Y0 = 360;
const TOP = 170;

/* a smooth line through the points, as the report draws it */
function curve(pts: [number, number][]) {
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const [p0, p1, p2, p3] = [pts[i - 1] ?? pts[i], pts[i], pts[i + 1], pts[i + 2] ?? pts[i + 1]];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}

function useCount(target: number, start: boolean, delayMs: number) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!start) return;
    let raf = 0;
    const t0 = performance.now() + delayMs;
    const step = (now: number) => {
      const t = Math.min(1, Math.max(0, (now - t0) / 1400));
      setN(Math.round(target * (1 - Math.pow(1 - t, 3))));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, start, delayMs]);
  return n;
}

function FactCell({ f, i, on, still }: { f: Fact; i: number; on: boolean; still: boolean }) {
  const n = useCount(f.value, on && !still, 900 + i * 180);
  return (
    <div className={`border-b border-[#261f15]/[0.13] py-7 lg:border-b-0 lg:py-2 ${i ? "lg:px-7" : "lg:pr-7"}`}>
      <p className="font-heading text-[clamp(2.8rem,4vw,3.8rem)] font-thin not-italic leading-none tracking-[-0.03em] tabular-nums">
        {f.prefix && <span className="text-[#b0904f]">{f.prefix}</span>}
        {(still ? f.value : n).toLocaleString("en-US")}
        {f.suffix && <span className="text-[#b0904f]">{f.suffix}</span>}
      </p>
      <p className="mt-3 max-w-[16rem] font-sans text-[0.85rem] leading-[1.55] text-[#6e6555]">{f.label}</p>
    </div>
  );
}

export default function SeoGrowth({
  eyebrow,
  lead,
  accent,
  intro,
  source,
  months,
  facts,
  report,
}: {
  eyebrow: string;
  lead: string;
  accent: string;
  intro: string;
  source: string;
  months: Month[];
  facts: Fact[];
  report: string;
}) {
  const still = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const seen = useSeen(ref, "0px 0px -25% 0px");
  const on = seen || still;
  const [hover, setHover] = useState<number | null>(null);

  const step = (X1 - X0) / (months.length - 1);
  const x = (i: number) => X0 + i * step;
  const y = (v: number) => Y0 - (v / TOP) * (Y0 - 30);
  const known = months.map((m, i) => ({ ...m, i })).filter((m) => m.value !== null) as (Month & { i: number; value: number })[];
  const pts = known.map((m) => [x(m.i), y(m.value)] as [number, number]);
  const line = curve(pts);
  const last = known[known.length - 1];
  const first = known[0];

  /* the nearest month the report has a figure for */
  const point = (clientX: number, el: SVGSVGElement) => {
    const r = el.getBoundingClientRect();
    const vx = ((clientX - r.left) / r.width) * W;
    let best = known[0];
    for (const m of known) if (Math.abs(x(m.i) - vx) < Math.abs(x(best.i) - vx)) best = m;
    setHover(best.quiet ? null : best.i);
  };
  const hovered = hover === null ? null : known.find((m) => m.i === hover) ?? null;
  const yearOf = (i: number) => {
    for (let k = i; k >= 0; k--) if (months[k].year) return months[k].year;
    return "";
  };

  return (
    <section aria-labelledby="seo-growth-title" className="relative w-full overflow-hidden bg-[#ededd5] py-20 text-[#261f15] md:py-28">
      <style>{`
        .le-grow-line { stroke-dasharray: 1; stroke-dashoffset: 1; transition: stroke-dashoffset 2.6s cubic-bezier(0.45, 0, 0.25, 1) 0.2s; }
        .le-grow-fill { opacity: 0; transition: opacity 1.4s ease 1.6s; }
        .le-grow-in { opacity: 0; transform: translateY(6px); transition: opacity 0.6s ease, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1); }
        [data-on="true"] .le-grow-line { stroke-dashoffset: 0; }
        [data-on="true"] .le-grow-fill { opacity: 1; }
        [data-on="true"] .le-grow-in { opacity: 1; transform: none; }
        .le-grow-pulse { transform-box: fill-box; transform-origin: center; animation: le-grow-pulse 2.8s ease-out 3s infinite; opacity: 0; }
        @keyframes le-grow-pulse { 0% { opacity: 0.45; transform: scale(0.6); } 70%, 100% { opacity: 0; transform: scale(2.2); } }
        @media (prefers-reduced-motion: reduce) {
          .le-grow-line, .le-grow-fill, .le-grow-in { transition: none; }
          .le-grow-pulse { display: none; }
        }
      `}</style>
      <Hairlines />

      <div className="relative mx-auto w-full max-w-[1480px] px-6 md:px-12">
        <Eyebrow>{eyebrow}</Eyebrow>
        <div className="mt-10 grid gap-6 lg:grid-cols-4 lg:items-end">
          <h2 id="seo-growth-title" className="text-balance font-heading text-[clamp(2.5rem,4.6vw,4.4rem)] font-thin not-italic leading-[1.02] tracking-[-0.02em] lg:col-span-2">
            {lead} <span className="text-[#a67c3d]">{accent}</span>
          </h2>
          <p className="max-w-[34rem] font-sans text-[1rem] leading-[1.7] text-[#261f15]/70 lg:col-span-2 lg:pb-2 lg:pl-7">{intro}</p>
        </div>

        {/* the chart */}
        <div ref={ref} data-on={on} className="mt-14 md:mt-16">
          <div className="relative overflow-hidden rounded-2xl border border-[#261f15]/[0.13] bg-[#f7f5e8] px-2 pb-3 pt-6 sm:px-6 sm:pt-8">
            <span aria-hidden="true" className="pointer-events-none absolute -right-24 -top-28 h-[22rem] w-[22rem] rounded-full bg-[#d6be91]/30 blur-3xl" />
            <span aria-hidden="true" className="pointer-events-none absolute -bottom-24 -left-20 h-[18rem] w-[18rem] rounded-full bg-[#cecda8]/35 blur-3xl" />
            <div className="relative flex items-center gap-4 px-3 sm:px-4">
              <p className="font-sans text-[0.55rem] font-semibold uppercase tracking-[0.3em] text-[#261f15]/45">
                Leads per month{" "}
                <span aria-hidden="true" className="text-[#c6a66a]">
                  ✦
                </span>{" "}
                Google Business Profile
              </p>
              <span aria-hidden="true" className="h-px flex-1 bg-[#261f15]/10" />
            </div>
            <div className="relative overflow-x-auto [mask-image:linear-gradient(to_right,#000_82%,transparent)] sm:[mask-image:none]">
              <svg
                viewBox={`0 0 ${W} ${H}`}
                role="img"
                aria-label={`Leads per month: ${known
                  .filter((m) => !m.quiet)
                  .map((m) => `${m.month} ${yearOf(m.i)}, ${m.value}`)
                  .join("; ")}.`}
                className="block h-auto w-full min-w-[40rem]"
                style={{ fontFamily: "var(--font-body)" }}
                onPointerMove={(e) => point(e.clientX, e.currentTarget)}
                onPointerLeave={() => setHover(null)}
              >
                <defs>
                  <linearGradient id="le-grow-gold" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#c6a66a" stopOpacity="0.32" />
                    <stop offset="1" stopColor="#c6a66a" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[50, 100, 150].map((g) => (
                  <g key={g}>
                    <line x1={X0} x2={X1} y1={y(g)} y2={y(g)} stroke="#261f15" strokeOpacity="0.08" />
                    <text x={X0 - 16} y={y(g) + 4} textAnchor="end" fontSize="12" fill="#8c7f63">
                      {g}
                    </text>
                  </g>
                ))}
                <line x1={X0} x2={X1} y1={Y0} y2={Y0} stroke="#261f15" strokeOpacity="0.2" />
                {months.map((m, i) => (
                  <g key={`${m.month}${i}`}>
                    <line x1={x(i)} x2={x(i)} y1={Y0} y2={Y0 + 6} stroke="#261f15" strokeOpacity="0.25" />
                    <text x={x(i)} y={Y0 + 26} textAnchor="middle" fontSize="11.5" fontWeight="600" letterSpacing="1.6" fill={hover === i ? "#261f15" : "#8c7f63"}>
                      {m.month.toUpperCase()}
                    </text>
                    {m.year && (
                      <text x={x(i)} y={Y0 + 45} textAnchor="middle" fontSize="11" fill="#b0904f">
                        {m.year}
                      </text>
                    )}
                  </g>
                ))}

                {/* the months, as the report gives them */}
                <path className="le-grow-fill" d={`${line} L${pts[pts.length - 1][0]} ${Y0} L${pts[0][0]} ${Y0} Z`} fill="url(#le-grow-gold)" />
                <path className="le-grow-line" pathLength={1} d={line} fill="none" stroke="#a67c3d" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                {known.map((m, k) => {
                  const end = m === last;
                  return (
                    <g key={m.i} className="le-grow-in" style={{ transitionDelay: `${0.35 + (k / known.length) * 2.4}s` }}>
                      {end && <circle cx={x(m.i)} cy={y(m.value)} r="9" fill="#c6a66a" className="le-grow-pulse" />}
                      <circle cx={x(m.i)} cy={y(m.value)} r={end ? 6.5 : 4.5} fill={end ? "#a67c3d" : "#f7f5e8"} stroke="#a67c3d" strokeWidth="1.8" />
                      {!m.quiet && (
                        <text
                          x={x(m.i)}
                          y={y(m.value) - (end ? 18 : 14)}
                          textAnchor="middle"
                          fontSize={end ? "15" : "12.5"}
                          fontWeight="700"
                          fill="#261f15"
                          fillOpacity={hover === null || hover === m.i ? 0.85 : 0.35}
                        >
                          {m.value}
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* where we started */}
                <g className="le-grow-in" style={{ transitionDelay: "0.3s" }}>
                  <line x1={x(first.i)} x2={x(first.i)} y1={y(first.value) - 10} y2={142} stroke="#261f15" strokeOpacity="0.3" strokeDasharray="2 4" />
                  <text x={x(first.i) + 10} y={140} fontSize="11.5" fontWeight="700" letterSpacing="1.6" fill="#8a6f3d">
                    WE STARTED HERE
                  </text>
                  <text x={x(first.i) + 10} y={160} fontSize="13" fill="#6e6555">
                    {`${first.value} leads that month`}
                  </text>
                </g>

                {/* the month pointed at */}
                {hovered && (
                  <g pointerEvents="none">
                    <line x1={x(hovered.i)} x2={x(hovered.i)} y1={30} y2={Y0} stroke="#a67c3d" strokeOpacity="0.45" strokeDasharray="3 4" />
                    <g transform={`translate(${Math.min(X1 - 150, Math.max(X0, x(hovered.i) - 75))} ${Math.max(6, y(hovered.value) - 92)})`}>
                      <rect width="150" height="46" rx="10" fill="#261f15" />
                      <text x="14" y="19" fontSize="10.5" fontWeight="700" letterSpacing="1.4" fill="#c6a66a">
                        {`${hovered.month.toUpperCase()} ${yearOf(hovered.i)}`}
                      </text>
                      <text x="14" y="36" fontSize="13" fontWeight="600" fill="#ededd5">
                        {`${hovered.value} leads`}
                      </text>
                    </g>
                  </g>
                )}
              </svg>
            </div>
            <p className="relative px-3 pb-2 pt-1 text-right font-sans text-[0.68rem] text-[#8c7f63] sm:px-4">{source}</p>
          </div>

          {/* what the chart says, in the page's four columns */}
          <div className="mt-12 grid border-t border-[#261f15]/[0.13] pt-8 lg:grid-cols-4">
            {facts.map((f, i) => (
              <FactCell key={f.label} f={f} i={i} on={on} still={still} />
            ))}
          </div>
        </div>

        {/* every month, in writing */}
        <div className="mt-12 flex flex-col gap-3 border-t border-[#261f15]/[0.13] pt-6 md:flex-row md:items-baseline md:gap-8">
          <p className="shrink-0 font-sans text-[0.58rem] font-semibold uppercase tracking-[0.26em] text-[#8c7f63]">
            <span aria-hidden="true" className="mr-2 text-[#b0904f]">
              ✦
            </span>
            Every month, in writing
          </p>
          <p className="flex-1 font-sans text-[0.9rem] leading-[1.6] text-[#6e6555]">{report}</p>
        </div>
      </div>
    </section>
  );
}
