"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowUpRight, X } from "lucide-react";
import { Noise } from "@/components/effects/Noise";
import { useGrowthDiagnostic } from "@/components/growth-diagnostic/GrowthDiagnosticProvider";
import { useCalendly, CALENDLY_BOOKING_URL } from "@/components/sections/CalendlyModal";
import { useOnScreen, useReducedMotion } from "@/components/websites/parts";
import { CASES } from "@/lib/rankings";
import type { VanScene } from "./vanScene";

/* ----------------------------------------------------------------------
   SeoHero: "SEO That Turns Searches Into Booked Events", beside a vintage
   coffee bus on a round of meadow (three.js, in vanScene): it rolls in,
   opens its hatch into a striped awning, a gold map pin drops in over
   its roof, and the machine at the counter pours, again and again. The
   view turns a little with the pointer. Under the words, one of our
   real first places on Google, changed every few seconds; "See the
   proof" opens the screenshot.
   - The scene is fetched after first paint and drawn only on screen.
   - Reduced motion: the bus already parked and serving, nothing moving;
     the rankings change only when asked.
   ---------------------------------------------------------------------- */

const TURN_MS = 6500;
const query = (i: number) => `${CASES[i].keyword} ${CASES[i].city}`.toLowerCase();

function siteFonts() {
  const probe = (cls: string) => {
    const el = document.createElement("span");
    el.className = cls;
    el.style.cssText = "position:absolute;visibility:hidden;pointer-events:none";
    el.textContent = "x";
    document.body.appendChild(el);
    const family = getComputedStyle(el).fontFamily;
    el.remove();
    return family;
  };
  return { display: probe("font-heading"), body: probe("font-sans") };
}

export default function SeoHero() {
  const still = useReducedMotion();
  const { open: openQuiz } = useGrowthDiagnostic();
  const { open: openCalendly } = useCalendly();
  const [shown, setShown] = useState(0);
  const [proof, setProof] = useState<number | null>(null);
  const [ready, setReady] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<VanScene | null>(null);
  const onScreen = useOnScreen(canvasRef);
  const result = CASES[shown];

  /* the scene */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let dead = false;
    let scene: VanScene | null = null;
    let io: IntersectionObserver | null = null;
    let ro: ResizeObserver | null = null;
    const fonts = siteFonts();
    Promise.all([import("./vanScene"), document.fonts.load(`700 40px ${fonts.body}`)])
      .then(([{ createVanScene }]) => {
        if (dead) return;
        try {
          scene = createVanScene({ canvas, still, fonts, onReady: () => setReady(true) });
        } catch {
          return;
        }
        sceneRef.current = scene;
        io = new IntersectionObserver(([e]) => scene?.setActive(e.isIntersecting), { rootMargin: "120px 0px" });
        io.observe(canvas);
        ro = new ResizeObserver(() => scene?.resize());
        ro.observe(canvas);
      })
      .catch(() => {});
    return () => {
      dead = true;
      io?.disconnect();
      ro?.disconnect();
      scene?.dispose();
      sceneRef.current = null;
    };
  }, [still]);

  /* the next ranking, every few seconds, while on screen */
  useEffect(() => {
    if (still || !onScreen || proof !== null) return;
    const id = window.setTimeout(() => setShown((i) => (i + 1) % CASES.length), TURN_MS);
    return () => window.clearTimeout(id);
  }, [still, onScreen, proof, shown]);

  /* the proof: Escape closes it */
  useEffect(() => {
    if (proof === null) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setProof(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [proof]);

  return (
    <section aria-labelledby="seo-hero-title" className="relative isolate w-full overflow-hidden bg-[#ededd5] pb-4 pt-28 text-[#261f15] md:pb-16 md:pt-32">
      <style>{`
        .le-sh-rise > * { animation: le-sh-rise 1.1s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .le-sh-rise > *:nth-child(2) { animation-delay: 0.1s; }
        .le-sh-rise > *:nth-child(3) { animation-delay: 0.2s; }
        .le-sh-rise > *:nth-child(4) { animation-delay: 0.3s; }
        .le-sh-rise > *:nth-child(5) { animation-delay: 0.4s; }
        @keyframes le-sh-rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
        @media (prefers-reduced-motion: reduce) { .le-sh-rise > * { animation: none; } }
      `}</style>

      {/* the page's hairlines, and its grain */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 mx-auto flex w-full max-w-[1480px] justify-between px-6 md:px-12">
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className="h-full w-px bg-[#261f15]/[0.07]" />
        ))}
      </div>
      <Noise patternAlpha={9} patternRefreshInterval={still ? 1_000_000_000 : 2} />

      <div className="relative z-20 mx-auto grid w-full max-w-[1480px] items-center gap-6 px-6 md:px-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-4">
        {/* the words */}
        <div className="le-sh-rise max-w-[33rem]">
          <p className="flex items-center gap-4 font-sans text-[0.62rem] font-semibold uppercase tracking-[0.3em] text-[#8a6f3d] sm:text-xs">
            <span aria-hidden="true" className="text-[0.8em]">
              ✦
            </span>
            SEO
            <span aria-hidden="true" className="h-px w-16 bg-[#261f15]/[0.2]" />
          </p>
          <h1 id="seo-hero-title" className="mt-6 font-heading font-thin not-italic text-[clamp(2.8rem,4.8vw,4.7rem)] leading-[1] tracking-[-0.02em]">
            SEO That Turns Searches Into <span className="text-[#8f6a2f]">Booked Events</span>
          </h1>
          <p className="mt-6 max-w-[29rem] font-sans text-[1rem] leading-[1.7] text-[#261f15]/75 sm:text-[1.05rem]">
            Rankings, then traffic, then revenue: in that order, because one causes the next. Here is what we actually do, and the
            real client results behind it.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-5">
            <button
              type="button"
              onClick={openQuiz}
              className="group/btn relative inline-flex cursor-pointer items-center gap-3 overflow-hidden rounded-full bg-[#c6a66a] py-2 pl-7 pr-2 font-sans text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#261f15] transition-colors duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8f6a2f] sm:text-xs"
            >
              <span className="relative z-10 py-2 transition-colors duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/btn:text-[#ededd5]">
                Free Growth Score
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
            </button>
            <a
              href={CALENDLY_BOOKING_URL}
              onClick={(e) => {
                e.preventDefault();
                openCalendly();
              }}
              className="group/call inline-flex items-center gap-2 border-b border-[#261f15]/30 pb-1 font-sans text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#261f15] transition-colors duration-300 hover:border-[#8f6a2f] hover:text-[#8f6a2f] sm:text-xs"
            >
              Book a call
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-500 ease-[cubic-bezier(0.34,1.2,0.4,1)] group-hover/call:-translate-y-0.5 group-hover/call:translate-x-0.5" />
            </a>
          </div>
          {/* one of our first places on Google */}
          <p aria-live="polite" className="mt-10 border-t border-[#261f15]/10 pt-5 font-sans text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-[#261f15]/50">
            <span className="text-[#8a6f3d]">First on Google</span> · &ldquo;{query(shown)}&rdquo; · {result.client}{" "}
            <button
              type="button"
              onClick={() => setProof(shown)}
              className="ml-1 cursor-pointer border-b border-current pb-px text-[#261f15]/70 transition-colors hover:text-[#8f6a2f]"
            >
              See the proof
            </button>
          </p>
        </div>

        {/* the bus; its edges go soft into the page, so nothing is cut off */}
        <div
          className="relative aspect-[6/5] w-full lg:-mr-6"
          style={{
            WebkitMaskImage: "radial-gradient(ellipse 50% 50% at 50% 50%, #000 72%, transparent 100%)",
            maskImage: "radial-gradient(ellipse 50% 50% at 50% 50%, #000 72%, transparent 100%)",
          }}
        >
          <canvas
            ref={canvasRef}
            role="img"
            aria-label="A vintage coffee bus in cream and gold, parked on a round of meadow grass, its hatch open as a striped awning, the espresso machine at the counter pouring a coffee; a gold map pin marked one floats over its roof"
            onPointerMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              sceneRef.current?.pointer(e.clientX - r.left, e.clientY - r.top);
            }}
            onPointerLeave={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              sceneRef.current?.pointer(r.width / 2, r.height / 2);
            }}
            className="absolute inset-0 block h-full w-full transition-opacity duration-[1200ms]"
            style={{ opacity: ready ? 1 : 0 }}
          />
        </div>
      </div>

      {/* the proof: the Google screenshot the ranking was taken from */}
      {proof !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Google results for ${query(proof)}`}
          onClick={() => setProof(null)}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#261f15]/80 p-4 backdrop-blur-sm sm:p-10"
        >
          <div className="relative w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <Image
              src={CASES[proof].image}
              alt={`Google results for ${query(proof)}, with ${CASES[proof].client} first`}
              sizes="(max-width: 1100px) 100vw, 1024px"
              className="h-auto max-h-[82vh] w-full rounded-xl object-contain"
            />
            <button
              type="button"
              aria-label="Close"
              autoFocus
              onClick={() => setProof(null)}
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
