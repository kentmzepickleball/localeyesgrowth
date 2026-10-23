"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { WORK_SITES } from "./sites";

/* ----------------------------------------------------------------------
   WorkRing: every site we've built, as mounted prints standing in a ring
   on the page, seen from a little above. The ring turns on its own, one
   print at a time, and stops while the pointer is over it; drag or swipe
   to turn it by hand, with a little throw. The print at the front is the
   one named below; click it to open the site live, click any other to
   bring it round. Prints come in out of shadow at the sides and go back
   into it; going round the back they show their reverse, and the far
   side of the ring fades into the paper.
   - All CSS 3D: the ring's size comes from --card-w, so it is laid out
     right before any script runs; the script only turns it.
   - Turns only while on screen. Reduced motion: it never turns on its
     own, and moves straight to a print when asked.
   ---------------------------------------------------------------------- */

const N = WORK_SITES.length;
const STEP = 360 / N;
const TILT = 7; // deg, looking down on the ring a little
const ADVANCE_S = 4.6;
/* the gap between prints, as a share of a print's width */
const SPACING = 1.14;
const RADIUS = (N * SPACING) / (2 * Math.PI); // in print widths

const pad = (n: number) => String(n).padStart(2, "0");
const COUNT = ["None", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve"][N] ?? String(N);
const cosAt = (deg: number) => Math.cos((deg * Math.PI) / 180);
/* by a print's angle round the ring: how far into the paper it has
   faded (the far side), and how deep in shadow it is (turned away from
   the front) */
const fogAt = (deg: number) => Math.min(0.62, Math.max(0, -cosAt(deg)) * 0.62);
const shadeAt = (deg: number) => Math.min(0.34, (1 - cosAt(deg)) * 0.42);

export default function WorkRing() {
  const [active, setActive] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLUListElement>(null);
  const activeRef = useRef(0);
  const moved = useRef(false);
  const ctl = useRef<{ go: (i: number) => void; step: (d: number) => void } | null>(null);
  const site = WORK_SITES[active];

  useEffect(() => {
    const stage = stageRef.current;
    const ring = ringRef.current;
    if (!stage || !ring) return;
    const cards = Array.from(ring.children) as HTMLElement[];
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let rot = 0;
    let target = 0;
    let painted = 0;
    let shown = 0;
    let idle = 0;
    let raf = 0;
    let last = 0;
    let running = false;
    let hover = false;
    let drag: { x: number; y: number; axis: "x" | null; rot: number; lastX: number; t: number; v: number } | null = null;

    const cardWidth = () => Math.min(600, Math.max(232, window.innerWidth * 0.39));
    const paint = () => {
      painted = rot;
      ring.style.setProperty("--rot", `${rot}deg`);
      for (let i = 0; i < N; i++) {
        const deg = i * STEP + rot;
        cards[i].style.setProperty("--fog", fogAt(deg).toFixed(3));
        cards[i].style.setProperty("--shade", shadeAt(deg).toFixed(3));
      }
      const idx = ((Math.round(-rot / STEP) % N) + N) % N;
      if (idx !== shown) {
        shown = idx;
        activeRef.current = idx;
        setActive(idx);
      }
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
      last = now;
      if (!drag) {
        if (!still && !hover) {
          idle += dt;
          if (idle > ADVANCE_S) {
            idle = 0;
            target = Math.round(target / STEP) * STEP - STEP;
          }
        }
        rot += (target - rot) * (1 - Math.exp(-dt * (still ? 40 : 3.4)));
        if (Math.abs(target - rot) < 0.01) rot = target;
      }
      if (rot !== painted) paint();
    };
    const start = () => {
      if (running) return;
      running = true;
      last = 0;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    /* by hand: the ring follows the pointer, then is thrown on and settles on a print */
    const onMove = (e: PointerEvent) => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      /* a finger going up or down is scrolling the page, not turning the
         ring: let it go, so the ring carries on turning on its own */
      if (drag.axis === null) {
        const dy = e.clientY - drag.y;
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
        if (Math.abs(dy) > Math.abs(dx)) {
          onUp();
          return;
        }
        drag.axis = "x";
      }
      if (Math.abs(dx) > 6) moved.current = true;
      const k = STEP / (cardWidth() * SPACING);
      rot = drag.rot + dx * k;
      target = rot;
      const ms = Math.max(1, e.timeStamp - drag.t);
      drag.v = drag.v * 0.5 + (((e.clientX - drag.lastX) * k) / ms) * 1000 * 0.5;
      drag.lastX = e.clientX;
      drag.t = e.timeStamp;
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      if (!drag) return;
      const v = still ? 0 : drag.v;
      drag = null;
      idle = 0;
      target = Math.round((rot + v * 0.3) / STEP) * STEP;
    };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      drag = { x: e.clientX, y: e.clientY, axis: e.pointerType === "mouse" ? "x" : null, rot, lastX: e.clientX, t: e.timeStamp, v: 0 };
      moved.current = false;
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
    };
    const onEnter = (e: PointerEvent) => {
      if (e.pointerType === "mouse") hover = true;
    };
    const onLeave = () => {
      hover = false;
      idle = 0;
    };
    stage.addEventListener("pointerdown", onDown);
    stage.addEventListener("pointerenter", onEnter);
    stage.addEventListener("pointerleave", onLeave);

    ctl.current = {
      go: (i) => {
        const want = -i * STEP;
        target = want + Math.round((rot - want) / 360) * 360;
        idle = 0;
      },
      step: (d) => {
        target = Math.round(target / STEP) * STEP - d * STEP;
        idle = 0;
      },
    };

    const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()), { rootMargin: "80px 0px" });
    io.observe(stage);
    return () => {
      io.disconnect();
      stop();
      onUp();
      stage.removeEventListener("pointerdown", onDown);
      stage.removeEventListener("pointerenter", onEnter);
      stage.removeEventListener("pointerleave", onLeave);
      ctl.current = null;
    };
  }, []);

  return (
    <section aria-labelledby="work-ring-title" className="relative w-full overflow-hidden bg-[#ededd5] pb-14 pt-20 text-[#261f15] md:pb-28 md:pt-28">
      <style>{`
        .le-ring-stage {
          --card-w: clamp(232px, 39vw, 600px);
          --ring-r: calc(var(--card-w) * ${RADIUS.toFixed(4)});
          height: calc(var(--card-w) * 1.02);
          perspective: calc(var(--ring-r) * 2.4);
          perspective-origin: 50% calc(var(--card-w) * 0.37);
          touch-action: pan-y;
          /* the sides: prints come in out of the shade and go back into it */
          -webkit-mask-image: linear-gradient(to right, transparent, #000 16%, #000 84%, transparent);
          mask-image: linear-gradient(to right, transparent, #000 16%, #000 84%, transparent);
        }
        .le-ring {
          position: absolute;
          left: 50%;
          top: calc(var(--card-w) * 0.37);
          transform-style: preserve-3d;
          transform: translateZ(calc(var(--ring-r) * -1)) rotateX(${-TILT}deg) rotateY(var(--rot, 0deg));
        }
        .le-ring-card {
          position: absolute;
          left: calc(var(--card-w) / -2);
          top: calc(var(--card-w) * -0.36);
          width: var(--card-w);
          transform-style: preserve-3d;
          transform: rotateY(calc(var(--i) * ${STEP}deg)) translateZ(var(--ring-r));
        }
        .le-ring-face { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
        .le-ring-back { position: absolute; inset: 0; transform: rotateY(180deg); }
        .le-ring-in { animation: le-ring-in 0.7s cubic-bezier(0.22, 1, 0.36, 1) both; }
        @keyframes le-ring-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          .le-ring-in { animation: none; }
        }
      `}</style>

      {/* the page's hairlines */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 mx-auto flex w-full max-w-[1480px] justify-between px-6 md:px-12"
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className="h-full w-px bg-[#261f15]/[0.07]" />
        ))}
      </div>

      {/* the heading */}
      <div className="relative mx-auto w-full max-w-[1480px] px-6 md:px-12">
        <p className="flex items-center gap-4 font-sans text-[0.62rem] font-semibold uppercase tracking-[0.3em] text-[#8a6f3d] sm:text-xs">
          <span aria-hidden="true" className="text-[0.8em]">
            ✦
          </span>
          The work
          <span aria-hidden="true" className="h-px flex-1 bg-[#261f15]/[0.12]" />
        </p>
        <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <h2
            id="work-ring-title"
            className="font-heading font-thin not-italic text-[clamp(2.5rem,5vw,4.6rem)] leading-[1.02] tracking-[-0.02em]"
          >
            {COUNT} brands, <span className="text-[#a67c3d]">not one template</span>
          </h2>
          <div className="max-w-[23rem] lg:pb-2 lg:text-right">
            <p className="font-sans text-[0.95rem] leading-relaxed text-[#261f15]/65">
              Each one designed around the client&apos;s own look, all built on the same search-first foundation.
            </p>
            <p className="mt-4 font-sans text-[0.58rem] font-semibold uppercase tracking-[0.3em] text-[#261f15]/45">
              Drag to turn <span className="text-[#c6a66a]">✦</span>
            </p>
          </div>
        </div>
      </div>

      {/* the ring */}
      <div
        ref={stageRef}
        tabIndex={0}
        role="region"
        aria-roledescription="carousel"
        aria-label="Client websites. Use the arrow keys to turn."
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") ctl.current?.step(1);
          if (e.key === "ArrowLeft") ctl.current?.step(-1);
        }}
        className="le-ring-stage relative mt-10 cursor-grab select-none outline-none active:cursor-grabbing focus-visible:ring-1 focus-visible:ring-[#c6a66a] md:mt-14"
      >
        {/* the ring's shadow on the paper */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-[calc(var(--card-w)*0.84)] h-[calc(var(--card-w)*0.16)] w-[calc(var(--card-w)*2.6)] -translate-x-1/2 rounded-[50%]"
          style={{ background: "radial-gradient(closest-side, rgba(38,31,21,0.16), rgba(38,31,21,0.05) 60%, rgba(38,31,21,0))" }}
        />
        <ul ref={ringRef} className="le-ring">
          {WORK_SITES.map((s, i) => (
            <li
              key={s.key}
              className="le-ring-card"
              style={{ "--i": i, "--fog": fogAt(i * STEP).toFixed(3), "--shade": shadeAt(i * STEP).toFixed(3) } as CSSProperties}
            >
              <a
                href={s.url ?? undefined}
                target="_blank"
                rel="noopener noreferrer"
                draggable={false}
                tabIndex={i === active && s.url ? 0 : -1}
                aria-label={s.url ? `${s.name}, open the live site` : s.name}
                onClick={(e) => {
                  if (moved.current || i !== activeRef.current || !s.url) {
                    e.preventDefault();
                    if (!moved.current && i !== activeRef.current) ctl.current?.go(i);
                  }
                }}
                className="le-ring-face relative block cursor-pointer rounded-[6px] border border-[#261f15]/10 bg-[#f6f1e1] px-[2.2%] pt-[2.2%] shadow-[0_1px_2px_rgba(38,31,21,0.06),0_30px_50px_-30px_rgba(38,31,21,0.55)]"
              >
                <span className="relative block aspect-[16/10] overflow-hidden rounded-[3px] bg-[#e6dec8]">
                  <Image
                    src={s.image}
                    alt={`The home page of ${s.name}'s site, built by LocalEyes`}
                    fill
                    draggable={false}
                    sizes="(max-width: 640px) 240px, (max-width: 1536px) 39vw, 600px"
                    className="object-cover object-top"
                  />
                </span>
                <span className="flex items-center justify-between py-[3.2%] font-sans text-[clamp(0.48rem,0.7vw,0.6rem)] font-semibold uppercase tracking-[0.22em] text-[#261f15]/55">
                  <span>N°{pad(i + 1)}</span>
                  <span>{s.domain ?? s.place}</span>
                </span>
                {/* in shadow when turned away, and into the paper round the back */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-[6px] bg-[#261f15]"
                  style={{ opacity: "var(--shade)" }}
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-[6px] bg-[#ededd5]"
                  style={{ opacity: "var(--fog)" }}
                />
              </a>
              {/* the reverse of the print */}
              <div
                aria-hidden="true"
                className="le-ring-face le-ring-back flex flex-col items-center justify-center rounded-[6px] border border-[#261f15]/10 bg-[#efe8d3]"
              >
                <span className="font-heading text-[calc(var(--card-w)*0.11)] font-thin not-italic leading-none text-[#261f15]/60">
                  LE
                </span>
                <span className="mt-[4%] font-sans text-[clamp(0.45rem,0.65vw,0.56rem)] font-semibold uppercase tracking-[0.3em] text-[#261f15]/40">
                  LocalEyes · N°{pad(i + 1)} · {s.name}
                </span>
                <span
                  className="pointer-events-none absolute inset-0 rounded-[6px] bg-[#ededd5]"
                  style={{ opacity: "var(--fog)" }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* the print at the front */}
      <div className="relative mx-auto mt-4 w-full max-w-[1480px] px-6 md:mt-8 md:px-12">
        <div className="flex items-center justify-center gap-1.5">
          {WORK_SITES.map((s, i) => (
            <button
              key={s.key}
              type="button"
              aria-label={`Show ${s.name}`}
              aria-current={i === active}
              onClick={() => ctl.current?.go(i)}
              className="group/tick flex h-6 w-7 cursor-pointer items-center"
            >
              <span
                className={`block w-full transition-all duration-500 ${
                  i === active ? "h-[2px] bg-[#a67c3d]" : "h-px bg-[#261f15]/25 group-hover/tick:bg-[#261f15]/60"
                }`}
              />
            </button>
          ))}
        </div>

        <div className="mx-auto mt-8 grid max-w-3xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 sm:gap-8">
          <button
            type="button"
            aria-label="Previous site"
            onClick={() => ctl.current?.step(-1)}
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-[#261f15]/25 transition-colors duration-300 hover:border-[#261f15] hover:bg-[#261f15] hover:text-[#ededd5]"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div key={site.key} aria-live="polite" className="le-ring-in min-w-0 text-center">
            <p className="font-sans text-[0.58rem] font-semibold uppercase tracking-[0.26em] text-[#8a6f3d] sm:text-[0.62rem]">
              N°{pad(active + 1)} of {pad(N)} · {site.kind}
            </p>
            <h3 className="mt-3 truncate font-heading font-thin not-italic text-[clamp(2.1rem,4.2vw,3.4rem)] leading-[1.05] tracking-[-0.02em]">
              {site.name}
            </h3>
            <p className="mt-3 flex flex-col items-center gap-2 font-sans text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-[#261f15]/50 sm:flex-row sm:justify-center sm:gap-0 sm:text-[0.66rem]">
              {site.place}
              {site.url && (
                <>
                  <span aria-hidden="true" className="mx-2 hidden text-[#c6a66a] sm:inline">
                    ·
                  </span>
                  <a
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/visit inline-flex items-center gap-1 border-b border-[#261f15]/25 pb-0.5 text-[#261f15] transition-colors duration-300 hover:border-[#8f6a2f] hover:text-[#8f6a2f]"
                  >
                    Visit {site.domain}
                    <ArrowUpRight className="h-3 w-3 transition-transform duration-500 group-hover/visit:-translate-y-0.5 group-hover/visit:translate-x-0.5" />
                  </a>
                </>
              )}
            </p>
          </div>
          <button
            type="button"
            aria-label="Next site"
            onClick={() => ctl.current?.step(1)}
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-[#261f15]/25 transition-colors duration-300 hover:border-[#261f15] hover:bg-[#261f15] hover:text-[#ededd5]"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
