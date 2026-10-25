"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import Image, { type StaticImageData } from "next/image";
import { ArrowRight, ArrowUpRight, X } from "lucide-react";
import { Eyebrow, Hairlines, useReducedMotion, useSeen } from "@/components/websites/parts";
import { ACTIVE_USERS, KEYWORDS, MARKS, REVENUE } from "./results";

/* ----------------------------------------------------------------------
   SeoResults: "Rankings are the lever. Bookings are the point." Three
   screenshots from real client accounts, side by side as mounted prints
   in the order one causes the next: rankings, then traffic, then
   revenue. On each, a few marks in gold ink draw themselves, card after
   card, as the row comes on screen (the row that climbed, the line that
   rose, the badge that says 75%), and again whenever a mouse comes onto
   the print; everything under the ink is the screenshot as it was. Each
   card's figure counts up as its ink is drawn. A print tilts a little
   under the mouse and opens full size.
   - Narrow screens: the cards stack, each drawn as it comes on screen.
   - Reduced motion: the ink already drawn, the figures already counted.
   ---------------------------------------------------------------------- */

type Proof = { image: StaticImageData; caption: string };

const COUNT_MS = 1400;
/* on wide screens, each card starts this long after the one before */
const STEP_S = 1.1;
const INK = "#a8792c";
const MARKER = "#e4c27c";
const delay = (s: number, dur?: number) => ({ "--delay": `${s}s`, ...(dur ? { "--dur": `${dur}s` } : {}) }) as CSSProperties;

/* a loop of ink round something, as a hand draws it: once round and a
   little more, spiralling out a touch so the ends do not meet, tilted */
function loop(cx: number, cy: number, rx: number, ry: number, tilt = -0.05) {
  let d = "";
  for (let i = 0; i <= 64; i++) {
    const t = i / 64;
    const a = -2.55 + t * Math.PI * 2.24;
    const r = 1 + 0.035 * Math.sin(a * 2.5 + 1.2) + 0.07 * t;
    const x = Math.cos(a) * rx * r;
    const y = Math.sin(a) * ry * r;
    d += `${i ? "L" : "M"}${(cx + x * Math.cos(tilt) - y * Math.sin(tilt)).toFixed(1)} ${(cy + x * Math.sin(tilt) + y * Math.cos(tilt)).toFixed(1)}`;
  }
  return d;
}
/* an underline, bowed a little */
const underline = (x0: number, x1: number, y: number) => `M${x0} ${y} Q${(x0 + x1) / 2} ${y + 8} ${x1} ${y - 4}`;

const money = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const HERO = KEYWORDS[0];
const { line } = MARKS.traffic;
const TRACE = ACTIVE_USERS.map(([t, v], i) => `${i ? "L" : "M"}${(line.x0 + t * (line.x1 - line.x0)).toFixed(1)} ${(line.y0 - v * line.perUser).toFixed(1)}`).join(" ");

const CHAPTERS = [
  {
    n: "01",
    name: "Rankings",
    source: "Rank report",
    sign: "+",
    final: HERO.climbed,
    unit: "",
    caption: `positions one keyword climbed in weeks, from page seven of Google to first. All ${KEYWORDS.length} in the report now rank on page one.`,
    next: "Then traffic",
  },
  {
    n: "02",
    name: "Traffic",
    source: "Analytics",
    sign: "",
    final: 405,
    unit: "",
    caption: "active users a month on a client's site, trending up over the following 60 days.",
    next: "Then revenue",
  },
  {
    n: "03",
    name: "Revenue",
    source: "Booking report",
    sign: "+",
    final: Math.round((REVENUE.after.value / REVENUE.before.value - 1) * 100),
    unit: "%",
    caption: `quarterly revenue for a client over the quarter before: ${money(REVENUE.before.value)} to ${money(REVENUE.after.value)}.`,
    next: "",
  },
];

/* the gold marks on each screenshot, in its own pixels */
function Marks({ i }: { i: number }) {
  if (i === 0) {
    const { row, climb, pageOne } = MARKS.ranking;
    return (
      <>
        <rect className="le-mark" x={row.x} y={row.y} width={row.w} height={row.h} rx="16" fill={MARKER} fillOpacity="0.34" style={delay(0.1, 0.8)} />
        <path className="le-ink" pathLength={1} d={loop(climb.cx, climb.cy, climb.rx, climb.ry)} stroke={INK} strokeWidth="11" style={delay(0.75, 0.85)} />
        <path className="le-ink" pathLength={1} d={underline(pageOne.x0, pageOne.x1, pageOne.y)} stroke={INK} strokeWidth="10" style={delay(1.4, 0.55)} />
      </>
    );
  }
  if (i === 1) {
    const { total } = MARKS.traffic;
    return (
      <>
        <path className="le-ink" pathLength={1} d={TRACE} stroke={MARKER} strokeOpacity="0.6" strokeWidth="26" style={delay(0.05, 1.3)} />
        <path className="le-ink" pathLength={1} d={loop(total.cx, total.cy, total.rx, total.ry)} stroke={INK} strokeWidth="8" style={delay(1.15, 0.8)} />
      </>
    );
  }
  const { badge, total } = MARKS.revenue;
  return (
    <>
      <path className="le-ink" pathLength={1} d={loop(badge.cx, badge.cy, badge.rx, badge.ry)} stroke={INK} strokeWidth="8.5" style={delay(0.1, 0.9)} />
      <path className="le-ink" pathLength={1} d={underline(total.x0, total.x1, total.y)} stroke={INK} strokeWidth="8.5" style={delay(0.9, 0.65)} />
    </>
  );
}

function Card({ i, proof, still, onOpen }: { i: number; proof: Proof; still: boolean; onOpen: () => void }) {
  const c = CHAPTERS[i];
  const ref = useRef<HTMLElement>(null);
  const seen = useSeen(ref, "0px 0px -18% 0px");
  const on = seen || still;
  const [count, setCount] = useState(0);
  const [redraw, setRedraw] = useState(0);

  /* the figure counts up with the ink, after the cards before it on a wide screen */
  useEffect(() => {
    if (!seen || still) return;
    let raf = 0;
    const t0 = performance.now() + (window.matchMedia("(min-width: 1024px)").matches ? i * STEP_S * 1000 : 0);
    const step = (now: number) => {
      const t = Math.min(1, Math.max(0, (now - t0) / COUNT_MS));
      setCount(Math.round(c.final * (1 - Math.pow(1 - t, 3))));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [seen, still, c.final, i]);

  /* the print tilts a little toward a mouse, a light following it */
  const tilt = (e: PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType !== "mouse") return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--ry", `${((x - 0.5) * 7).toFixed(2)}deg`);
    el.style.setProperty("--rx", `${((0.5 - y) * 6).toFixed(2)}deg`);
    el.style.setProperty("--gx", `${(x * 100).toFixed(1)}%`);
    el.style.setProperty("--gy", `${(y * 100).toFixed(1)}%`);
  };
  const rest = (e: PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.style.setProperty("--rx", "0deg");
    e.currentTarget.style.setProperty("--ry", "0deg");
  };

  const { width: w, height: h } = proof.image;
  return (
    <article
      ref={ref}
      data-on={on}
      className="le-card relative rounded-[1.6rem] bg-[#f6f2e4] p-2.5 shadow-[0_1px_2px_rgba(38,31,21,0.04),0_32px_64px_-40px_rgba(38,31,21,0.45)] ring-1 ring-[#261f15]/[0.07] sm:p-3"
    >
      <header className="flex items-center justify-between gap-4 px-2.5 pb-3 pt-1.5">
        <p className="flex items-baseline gap-2.5">
          <span className="font-heading text-[1.5rem] font-thin not-italic leading-none text-[#c6a66a]">{c.n}</span>
          <span className="font-sans text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-[#261f15]/60">{c.name}</span>
        </p>
        {c.next && (
          <p className="le-then flex items-center gap-1.5 font-sans text-[0.56rem] font-semibold uppercase tracking-[0.24em] text-[#8a6f3d]">
            {c.next}
            <ArrowRight className="h-3 w-3" />
          </p>
        )}
      </header>

      {/* the screenshot, mounted, with the ink over it */}
      <button
        type="button"
        onClick={onOpen}
        onPointerEnter={(e) => e.pointerType === "mouse" && on && !still && setRedraw((r) => r + 1)}
        onPointerMove={tilt}
        onPointerLeave={rest}
        aria-label={`${proof.caption}. Open the screenshot full size`}
        className="group/print block w-full cursor-zoom-in text-left [perspective:1400px] focus-visible:outline-none"
      >
        <span className="le-print relative flex aspect-[16/10] items-center justify-center overflow-hidden rounded-[1.1rem] bg-white p-3 ring-1 ring-[#261f15]/[0.07] transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/print:shadow-[0_24px_40px_-24px_rgba(38,31,21,0.45)] group-focus-visible/print:ring-2 group-focus-visible/print:ring-[#8f6a2f]">
          <span className={`relative block ${w / h > 1.6 ? "w-full" : "h-full"}`} style={{ aspectRatio: `${w} / ${h}` }}>
            <Image src={proof.image} alt="" fill sizes="(min-width: 1024px) 31vw, 100vw" className="object-contain" />
            <svg viewBox={`0 0 ${w} ${h}`} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full mix-blend-multiply">
              <g key={redraw} className="le-ink-layer" style={redraw ? ({ "--base": "0s" } as CSSProperties) : undefined}>
                <Marks i={i} />
              </g>
            </svg>
          </span>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/print:opacity-100"
            style={{ background: "radial-gradient(420px circle at var(--gx, 50%) var(--gy, 50%), rgba(255,255,255,0.3), rgba(255,255,255,0) 60%)" }}
          />
          {/* what it is, on a hover; on a touch screen, only a small sign that it opens */}
          <span className="absolute bottom-2.5 right-2.5 flex items-center justify-center gap-1.5 rounded-full bg-[#261f15]/85 px-3 py-1.5 font-sans text-[0.55rem] font-semibold uppercase tracking-[0.2em] text-[#ededd5] opacity-0 transition-opacity duration-300 group-hover/print:opacity-100 group-focus-visible/print:opacity-100 [@media(hover:none)]:h-7 [@media(hover:none)]:w-7 [@media(hover:none)]:p-0 [@media(hover:none)]:opacity-100">
            <span className="[@media(hover:none)]:hidden">{c.source}</span>
            <ArrowUpRight className="h-3 w-3" />
          </span>
        </span>
      </button>

      {/* the figure, and what it means */}
      <div className="flex items-start gap-5 px-2.5 pb-2.5 pt-5">
        <p aria-hidden="true" className="shrink-0 font-heading text-[clamp(2.9rem,3.7vw,3.8rem)] font-thin not-italic leading-[0.84] tracking-[-0.035em] tabular-nums">
          {c.sign && <span className="text-[#a67c3d]">{c.sign}</span>}
          {still ? c.final : count}
          {c.unit && <span className="text-[#a67c3d]">{c.unit}</span>}
        </p>
        <p className="font-sans text-[0.84rem] leading-[1.55] text-[#261f15]/70">
          <span className="sr-only">
            {c.sign}
            {c.final}
            {c.unit}{" "}
          </span>
          {c.caption}
        </p>
      </div>
    </article>
  );
}

export default function SeoResults({ heading, paragraphs, proof }: { heading: string; paragraphs: string[]; proof: Proof[] }) {
  const still = useReducedMotion();
  const [open, setOpen] = useState<number | null>(null);
  const [lever, point] = heading.split(/(?<=\.)\s+/);

  /* the screenshot: Escape closes it */
  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <section aria-labelledby="seo-results-title" className="relative w-full overflow-hidden bg-[#ededd5] py-20 text-[#261f15] md:py-28">
      <style>{`
        .le-ink { fill: none; stroke-linecap: round; stroke-linejoin: round; stroke-dasharray: 1; stroke-dashoffset: 1; }
        .le-mark { transform: scaleX(0); transform-box: fill-box; transform-origin: left center; }
        .le-card[data-on="true"] .le-ink { animation: le-ink var(--dur, 0.9s) cubic-bezier(0.65, 0, 0.35, 1) calc(var(--base, 0s) + var(--delay, 0s)) forwards; }
        .le-card[data-on="true"] .le-mark { animation: le-mark var(--dur, 0.8s) cubic-bezier(0.65, 0, 0.35, 1) calc(var(--base, 0s) + var(--delay, 0s)) forwards; }
        .le-then { opacity: 0; transform: translateX(-6px); transition: opacity 0.7s ease, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1); }
        .le-card[data-on="true"] .le-then { opacity: 1; transform: none; transition-delay: calc(var(--base, 0s) + 1.5s); }
        .le-print { transform: rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)); }
        @keyframes le-ink { to { stroke-dashoffset: 0; } }
        @keyframes le-mark { to { transform: scaleX(1); } }
        @media (min-width: 1024px) {
          .le-card:nth-child(2) { --base: ${STEP_S}s; }
          .le-card:nth-child(3) { --base: ${STEP_S * 2}s; }
        }
        @media (prefers-reduced-motion: reduce) {
          .le-ink { stroke-dashoffset: 0; animation: none !important; }
          .le-mark { transform: none; animation: none !important; }
          .le-then { opacity: 1; transform: none; transition: none; }
          .le-print { transform: none; }
        }
      `}</style>
      <Hairlines />
      <div className="relative mx-auto w-full max-w-[1480px] px-6 md:px-12">
        {/* the words */}
        <Eyebrow>Real work, not mockups</Eyebrow>
        <div className="mt-8 grid gap-6 lg:grid-cols-4 lg:items-end">
          <h2 id="seo-results-title" className="text-balance font-heading text-[clamp(2.6rem,4.6vw,4.9rem)] font-thin not-italic leading-[0.98] tracking-[-0.025em] lg:col-span-3">
            <span className="block">{lever}</span>
            <span className="block text-[#8f6a2f]">{point}</span>
          </h2>
          <div className="max-w-[26rem] lg:pb-1.5 lg:pl-7">
            <p className="font-sans text-[0.95rem] leading-[1.65] text-[#261f15]/70">
              Three screenshots from real client accounts, in the order one causes the next.
            </p>
            <p className="mt-3 font-sans text-[0.58rem] font-semibold uppercase leading-[1.8] tracking-[0.22em] text-[#8a6f3d]">
              The gold marks are ours. Everything under them is untouched.
            </p>
          </div>
        </div>

        {/* the three prints, in order */}
        <div className="mt-12 grid gap-5 lg:mt-14 lg:grid-cols-3">
          {proof.slice(0, CHAPTERS.length).map((p, i) => (
            <Card key={CHAPTERS[i].n} i={i} proof={p} still={still} onOpen={() => setOpen(i)} />
          ))}
        </div>

        {/* behind the numbers */}
        <div className="relative mt-14 grid gap-x-10 gap-y-5 border-t border-[#261f15]/10 bg-[#ededd5] pt-10 lg:mt-16 lg:grid-cols-3">
          {paragraphs.map((t, i) => (
            <p key={i} className="font-sans text-[0.92rem] leading-[1.7] text-[#261f15]/72">
              {t}
            </p>
          ))}
        </div>
      </div>

      {/* a screenshot, full size */}
      {open !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={proof[open].caption}
          onClick={() => setOpen(null)}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#261f15]/80 p-4 backdrop-blur-sm sm:p-10"
        >
          <div className="relative w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <div className="overflow-hidden rounded-xl bg-white">
              <Image src={proof[open].image} alt={proof[open].caption} sizes="(max-width: 1100px) 100vw, 1024px" className="h-auto max-h-[78vh] w-full object-contain" />
            </div>
            <p className="mt-4 text-center font-sans text-[0.8rem] text-[#ededd5]/75">{proof[open].caption}</p>
            <button
              type="button"
              aria-label="Close"
              autoFocus
              onClick={() => setOpen(null)}
              className="absolute -top-3 right-0 flex h-10 w-10 -translate-y-full cursor-pointer items-center justify-center rounded-full border border-[#ededd5]/30 text-[#ededd5] transition-colors hover:bg-[#ededd5] hover:text-[#261f15]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
