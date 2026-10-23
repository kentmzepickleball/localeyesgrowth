"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { Noise } from "@/components/effects/Noise";
import { useGrowthDiagnostic } from "@/components/growth-diagnostic/GrowthDiagnosticProvider";
import {
  useCalendly,
  CALENDLY_BOOKING_URL,
} from "@/components/sections/CalendlyModal";
import { SHOWCASE_SITES } from "./sites";
import type { Billboard } from "./billboardScene";

/* ----------------------------------------------------------------------
   WebsitesHero: "Websites Built to Rank, Not Just Look Good", over a
   still from an old American road film (three.js, in billboardScene): a
   roadside billboard in an empty field of dry grass, a two-lane road,
   telephone poles walking off to a hazy tree line, a low warm sun. On
   the billboard, the site of a client we built, pasted up in sheets;
   every so often it is changed for the next. The words sit in the sky.
   Click the poster to open the site live. Grain and a soft vignette, as
   on film.
   - The scene is fetched after first paint and drawn only on screen.
     Without WebGL, the site on show stands in as a plain image.
   - Reduced motion: nothing moves; the poster changes only when asked.
   ---------------------------------------------------------------------- */

const MOTION = "(prefers-reduced-motion: reduce)";
const subscribeMotion = (cb: () => void) => {
  const query = window.matchMedia(MOTION);
  query.addEventListener("change", cb);
  return () => query.removeEventListener("change", cb);
};
const useReducedMotion = () =>
  useSyncExternalStore(
    subscribeMotion,
    () => window.matchMedia(MOTION).matches,
    () => false,
  );

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

export default function WebsitesHero() {
  const reduced = useReducedMotion();
  const { open: openQuiz } = useGrowthDiagnostic();
  const { open: openCalendly } = useCalendly();
  const [shown, setShown] = useState(0);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<Billboard | null>(null);
  const shownRef = useRef(0);
  const site = SHOWCASE_SITES[shown];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let dead = false;
    let scene: Billboard | null = null;
    let io: IntersectionObserver | null = null;
    let ro: ResizeObserver | null = null;
    const fonts = siteFonts();
    Promise.all([import("./billboardScene"), document.fonts.load(`700 40px ${fonts.body}`)])
      .then(([{ createBillboard }]) => {
        if (dead) return;
        try {
          scene = createBillboard({
            canvas,
            sites: SHOWCASE_SITES,
            still: reduced,
            fonts,
            onShow: (i) => {
              shownRef.current = i;
              setShown(i);
            },
            onReady: () => setReady(true),
          });
        } catch {
          setFailed(true);
          return;
        }
        sceneRef.current = scene;
        io = new IntersectionObserver(([e]) => scene?.setActive(e.isIntersecting), { rootMargin: "120px 0px" });
        io.observe(canvas);
        ro = new ResizeObserver(() => scene?.resize());
        ro.observe(canvas);
      })
      .catch(() => setFailed(true));
    return () => {
      dead = true;
      io?.disconnect();
      ro?.disconnect();
      scene?.dispose();
      sceneRef.current = null;
    };
  }, [reduced]);

  const step = (d: number) => {
    const i = (shownRef.current + d + SHOWCASE_SITES.length) % SHOWCASE_SITES.length;
    if (sceneRef.current) sceneRef.current.go(i);
    else {
      shownRef.current = i;
      setShown(i);
    }
  };

  return (
    <section
      aria-labelledby="websites-hero-title"
      className="relative isolate h-[100svh] min-h-[680px] w-full overflow-hidden bg-[#eadcc0] text-[#261f15]"
    >
      <style>{`
        .le-wh-rise > * { animation: le-wh-rise 1.2s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .le-wh-rise > *:nth-child(2) { animation-delay: 0.12s; }
        .le-wh-rise > *:nth-child(3) { animation-delay: 0.24s; }
        .le-wh-rise > *:nth-child(4) { animation-delay: 0.36s; }
        .le-wh-in { animation: le-wh-rise 0.8s cubic-bezier(0.22, 1, 0.36, 1) both; }
        @keyframes le-wh-rise {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          .le-wh-rise > *, .le-wh-in { animation: none; }
        }
      `}</style>

      {/* the still */}
      {failed && (
        <Image
          src={site.image}
          alt={`${site.name}'s website, built by LocalEyes`}
          fill
          sizes="100vw"
          className="object-cover object-top opacity-40"
        />
      )}
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={`A roadside billboard in an empty field, showing ${site.name}'s website, ${site.domain}. Click it to open the site.`}
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - r.left;
          const y = e.clientY - r.top;
          sceneRef.current?.pointer(x, y);
          e.currentTarget.style.cursor = sceneRef.current?.hitBoard(x, y) ? "pointer" : "default";
        }}
        onClick={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          if (sceneRef.current?.hitBoard(e.clientX - r.left, e.clientY - r.top)) {
            window.open(site.url, "_blank", "noopener,noreferrer");
          }
        }}
        className="absolute inset-0 block h-full w-full transition-opacity duration-[1400ms]"
        style={{ opacity: ready ? 1 : 0 }}
      />
      {/* as on film: grain, and the corners a little darker */}
      <Noise patternAlpha={12} patternRefreshInterval={reduced ? 1_000_000_000 : 2} />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(120% 95% at 55% 45%, rgba(60,40,15,0) 55%, rgba(60,40,15,0.22) 100%)" }}
      />
      {/* a breath of haze behind the words, so they read over any sky */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-[#efe5cf]/90 via-[#efe5cf]/55 to-transparent lg:inset-y-0 lg:left-0 lg:right-auto lg:h-auto lg:w-[56%] lg:bg-gradient-to-r lg:from-[#f1e8d3]/75 lg:via-[#f1e8d3]/35"
      />

      {/* the words */}
      <div className="pointer-events-none relative z-10 mx-auto flex h-full w-full max-w-[1480px] flex-col justify-end px-6 pb-32 pt-28 md:px-12 lg:justify-center lg:pb-16">
        <div className="le-wh-rise pointer-events-auto max-w-[34rem]">
          <p className="flex items-center gap-4 font-sans text-[0.62rem] font-semibold uppercase tracking-[0.3em] text-[#8a6630] sm:text-xs">
            <span aria-hidden="true" className="text-[0.8em]">
              ✦
            </span>
            Websites
            <span aria-hidden="true" className="h-px w-16 bg-[#261f15]/[0.2]" />
          </p>
          <h1
            id="websites-hero-title"
            className="mt-6 font-heading font-thin not-italic text-[clamp(2.8rem,5vw,4.9rem)] leading-[1] tracking-[-0.02em] text-[#261f15]"
          >
            Websites Built to Rank,{" "}
            <span className="text-[#8f6a2f]">Not Just Look Good</span>
          </h1>
          <p className="mt-6 max-w-[29rem] font-sans text-[1rem] leading-[1.7] text-[#261f15]/75 sm:text-[1.05rem]">
            A beautiful site that Google can&apos;t find is a brochure. Every
            site we build is engineered for search from the first line of
            code, not decorated with SEO afterward.
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
        </div>
      </div>

      {/* the poster's client */}
      <div className="absolute inset-x-0 bottom-0 z-10">
        <div className="mx-auto flex w-full max-w-[1480px] items-end justify-between gap-6 px-6 pb-7 md:px-12 lg:justify-end">
          <div key={site.key} className="le-wh-in min-w-0 text-left lg:text-right">
            <p className="font-sans text-[0.58rem] font-semibold uppercase tracking-[0.26em] text-[#261f15]/60">
              Now showing · N°{String(shown + 1).padStart(2, "0")} of {String(SHOWCASE_SITES.length).padStart(2, "0")}
            </p>
            <a
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group/v mt-1 inline-flex items-baseline gap-2 font-heading font-thin not-italic text-[1.5rem] leading-tight tracking-[-0.01em] text-[#261f15] transition-colors duration-300 hover:text-[#8f6a2f]"
            >
              {site.name}
              <span className="font-sans text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-[#261f15]/55">{site.place}</span>
              <ArrowUpRight className="h-4 w-4 self-center text-[#261f15]/45 transition-transform duration-500 group-hover/v:-translate-y-0.5 group-hover/v:translate-x-0.5" />
            </a>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              aria-label="Previous site"
              onClick={() => step(-1)}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-[#261f15]/25 bg-[#f1e8d3]/60 backdrop-blur-[2px] transition-colors duration-300 hover:border-[#261f15] hover:bg-[#261f15] hover:text-[#ededd5]"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Next site"
              onClick={() => step(1)}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-[#261f15]/25 bg-[#f1e8d3]/60 backdrop-blur-[2px] transition-colors duration-300 hover:border-[#261f15] hover:bg-[#261f15] hover:text-[#ededd5]"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
