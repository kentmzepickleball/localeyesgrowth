"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { CASES } from "@/lib/rankings";
import { Eyebrow, Hairlines, useOnScreen, useReducedMotion } from "./parts";

/* ----------------------------------------------------------------------
   RankingProof: "Real Google results", on the home page and the
   websites page. On the left, the searches, each a line in a
   ledger with its #1; on the right, the proof for the one chosen: the
   Google screenshot it was taken from, mounted like a print. The ledger
   takes turns on its own while on screen, a gold rule filling under the
   line being shown; pointing at a line shows it and holds the turn. Not
   with reduced motion.
   ---------------------------------------------------------------------- */

const TURN_S = 5;
const WORDS = ["None", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];
const count = WORDS[CASES.length] ?? String(CASES.length);

export default function RankingProof() {
  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false);
  const still = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const onScreen = useOnScreen(sectionRef);
  const running = onScreen && !held && !still;

  useEffect(() => {
    if (!running) return;
    const id = window.setTimeout(() => setActive((a) => (a + 1) % CASES.length), TURN_S * 1000);
    return () => window.clearTimeout(id);
  }, [running, active]);

  const entry = CASES[active];

  return (
    <section
      ref={sectionRef}
      aria-labelledby="ranking-proof-title"
      className="relative w-full overflow-hidden bg-[#261f15] py-24 text-[#ededd5] md:py-32"
    >
      <style>{`
        @keyframes le-proof-fill { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        .le-proof-fill { transform-origin: left center; animation: le-proof-fill ${TURN_S}s linear both; }
        .le-proof-fill[data-paused="true"] { animation-play-state: paused; }
      `}</style>
      <Hairlines dark />
      {/* a warm light behind the proof */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-10%] top-1/2 h-[70vmax] w-[70vmax] -translate-y-1/2 rounded-full"
        style={{ background: "radial-gradient(closest-side, rgba(198,166,106,0.16), rgba(198,166,106,0))" }}
      />

      <div className="relative mx-auto w-full max-w-[1480px] px-6 md:px-12">
        <Eyebrow dark>Real Google results</Eyebrow>
        <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <h2
            id="ranking-proof-title"
            className="font-heading font-thin not-italic text-[clamp(2.3rem,4.4vw,4rem)] leading-[1.04] tracking-[-0.02em]"
          >
            {count} searches, <span className="text-[#c6a66a]">first on every one</span>
          </h2>
          <p className="max-w-[22rem] font-sans text-[0.95rem] leading-relaxed text-[#ededd5]/60 lg:pb-2 lg:text-right">
            Client sites at the top of Google for the searches that book events, each with the screenshot it was taken from.
          </p>
        </div>

        <div
          className="mt-12 grid items-center gap-10 md:mt-16 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16"
          onPointerEnter={(e) => e.pointerType === "mouse" && setHeld(true)}
          onPointerLeave={() => setHeld(false)}
        >
          {/* the ledger */}
          <ol className="order-2 border-t border-[#ededd5]/10 lg:order-1">
            {CASES.map((c, i) => (
              <li key={`${c.keyword}-${c.city}`} className="border-b border-[#ededd5]/10">
                <button
                  type="button"
                  aria-pressed={active === i}
                  onPointerEnter={(e) => e.pointerType === "mouse" && setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => setActive(i)}
                  className="relative grid w-full cursor-pointer grid-cols-[3.2rem_minmax(0,1fr)_auto] items-baseline gap-3 py-4 text-left sm:grid-cols-[4rem_minmax(0,1fr)_auto] sm:py-5"
                >
                  <span
                    className={`font-heading text-[1.7rem] font-thin not-italic leading-none transition-colors duration-500 sm:text-[2rem] ${
                      active === i ? "text-[#c6a66a]" : "text-[#c6a66a]/35"
                    }`}
                  >
                    #1
                  </span>
                  <span
                    className={`font-heading text-[1.25rem] sm:truncate font-thin not-italic leading-tight tracking-[-0.01em] transition-colors duration-500 sm:text-[1.55rem] ${
                      active === i ? "text-[#ededd5]" : "text-[#ededd5]/45"
                    }`}
                  >
                    {c.keyword} <span className={active === i ? "text-[#c6a66a]" : ""}>{c.city}</span>
                  </span>
                  <span
                    className={`font-sans text-[0.55rem] font-semibold uppercase tracking-[0.22em] transition-colors duration-500 sm:text-[0.6rem] ${
                      active === i ? "text-[#ededd5]/80" : "text-[#ededd5]/35"
                    }`}
                  >
                    {c.client}
                  </span>
                  {active === i && (
                    <span aria-hidden="true" className="absolute inset-x-0 -bottom-px h-px overflow-hidden">
                      <span
                        key={`${active}-${still}`}
                        data-paused={!running}
                        className={`block h-full w-full bg-[#c6a66a] ${still ? "" : "le-proof-fill"}`}
                      />
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ol>

          {/* the proof */}
          <figure className="order-1 lg:order-2">
            <div className="rounded-[18px] bg-[#f4efdc] p-3 shadow-[0_60px_90px_-50px_rgba(0,0,0,0.75)] sm:p-4">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[10px] bg-[#eceef0]">
                {CASES.map((c, i) => (
                  <Image
                    key={`${c.keyword}-${c.city}`}
                    src={c.image}
                    alt={`Google results for ${c.keyword.toLowerCase()} in ${c.city}, with ${c.client} first`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 46vw"
                    className={`object-contain transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      active === i ? "scale-100 opacity-100" : "scale-[1.02] opacity-0"
                    }`}
                  />
                ))}
              </div>
              <figcaption className="flex items-center justify-between gap-4 px-1 pb-1 pt-3 font-sans text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-[#261f15]/55 sm:pt-4">
                <span>
                  {entry.client} <span className="text-[#a67c3d]">·</span> #1 on Google
                </span>
                <span>
                  {String(active + 1).padStart(2, "0")} / {String(CASES.length).padStart(2, "0")}
                </span>
              </figcaption>
            </div>
          </figure>
        </div>
      </div>
    </section>
  );
}
