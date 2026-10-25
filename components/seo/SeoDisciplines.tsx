"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { useCalendly, CALENDLY_BOOKING_URL } from "@/components/sections/CalendlyModal";
import { Hairlines, useOnScreen, useReducedMotion } from "@/components/websites/parts";

/* ----------------------------------------------------------------------
   SeoDisciplines: "What the work actually includes", set like the
   pricing page's rate card on the dark desk. On the right, the five
   disciplines as a ledger, each with how often it runs; on the left,
   the card for the one chosen: its name, its number of five set large
   where a price would be, what it is, and what it includes as hairline
   rows. The ledger takes turns on its own while on screen, a gold rule
   drawing under the chosen line for as long as it is shown; pointing at
   a line, or tabbing to it, shows it and holds the ledger there. The card's paper takes
   on a soft bloom and its lines change with a fade. No turns with
   reduced motion.
   ---------------------------------------------------------------------- */

export type Discipline = { title: string; cadence: string; body: string; includes: [string, string][] };

const TURN_S = 7;
const pad = (n: number) => String(n).padStart(2, "0");

export default function SeoDisciplines({ lead, accent, intro, items }: { lead: string; accent: string; intro: string; items: Discipline[] }) {
  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false);
  const still = useReducedMotion();
  const { open: openCalendly } = useCalendly();
  const sectionRef = useRef<HTMLElement>(null);
  const onScreen = useOnScreen(sectionRef);
  const running = onScreen && !held && !still;
  const d = items[active];

  const advance = useEffectEvent(() => setActive((a) => (a + 1) % items.length));
  useEffect(() => {
    if (!running) return;
    const id = window.setTimeout(advance, TURN_S * 1000);
    return () => window.clearTimeout(id);
  }, [running, active]);

  return (
    <section ref={sectionRef} aria-labelledby="seo-disciplines-title" className="relative w-full overflow-hidden bg-[#261f15] text-[#ededd5]">
      <style>{`
        .le-work-fill { transform-origin: left center; animation: le-work-fill ${TURN_S}s linear both; }
        .le-work-fill[data-paused="true"] { animation-play-state: paused; }
        @keyframes le-work-fill { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        .le-work-turn > * { animation: le-work-turn 0.8s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .le-work-turn > *:nth-child(2) { animation-delay: 0.05s; }
        .le-work-turn > *:nth-child(3) { animation-delay: 0.1s; }
        .le-work-turn > *:nth-child(4) { animation-delay: 0.15s; }
        @keyframes le-work-turn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
        @media (prefers-reduced-motion: reduce) { .le-work-turn > * { animation: none; } }
      `}</style>
      {/* the desk: a vignette, and a warm light where the card lies */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_140%_at_50%_50%,transparent_55%,rgba(0,0,0,0.35)_100%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_55%_at_70%_45%,rgba(198,166,106,0.09),transparent_65%)]" />
      <Hairlines dark />

      <div className="relative mx-auto w-full max-w-[1480px] px-6 py-20 md:px-12 md:py-28">
        <p className="flex items-center gap-4 font-sans text-[0.62rem] font-semibold uppercase tracking-[0.3em] text-[#c6a66a] sm:text-xs">
          <span aria-hidden="true" className="text-[0.8em]">
            ✦
          </span>
          The work
          <span aria-hidden="true" className="h-px flex-1 bg-[#ededd5]/10" />
        </p>
        <div className="mt-8 flex flex-col gap-6 md:mt-10 md:flex-row md:items-end md:justify-between md:gap-12">
          <h2 id="seo-disciplines-title" className="max-w-3xl text-balance font-heading text-4xl font-thin not-italic leading-[1.08] tracking-[-0.01em] sm:text-5xl md:text-6xl">
            {lead} <span className="text-[#c6a66a]">{accent}</span>
          </h2>
          <p className="max-w-sm shrink-0 font-sans text-sm leading-relaxed text-[#ededd5]/60 md:pb-2 md:text-[0.95rem]">{intro}</p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-10 md:mt-16 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
          {/* the ledger */}
          <div className="lg:order-2" onMouseEnter={() => setHeld(true)} onMouseLeave={() => setHeld(false)}>
            <p className="font-sans text-[0.58rem] font-semibold uppercase tracking-[0.3em] text-[#ededd5]/50">Five disciplines</p>
            <div role="tablist" aria-label="Disciplines" className="mt-5 border-t border-[#ededd5]/10">
              {items.map((x, i) => {
                const on = i === active;
                return (
                  <button
                    key={x.title}
                    id={`le-work-tab-${i}`}
                    type="button"
                    role="tab"
                    aria-selected={on}
                    aria-controls="le-work-panel"
                    onClick={() => {
                      setActive(i);
                      setHeld(true);
                    }}
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    className={`group relative block w-full cursor-pointer border-b border-[#ededd5]/10 text-left transition-opacity duration-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c6a66a] ${
                      on ? "opacity-100" : "opacity-55 hover:opacity-90"
                    }`}
                  >
                    <span className={`grid grid-cols-[auto_1fr_auto] items-baseline gap-x-4 py-5 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:gap-x-5 md:py-6 ${on ? "translate-x-1.5 pr-1.5" : ""}`}>
                      <span className="font-heading text-lg font-thin not-italic text-[#c6a66a]">{pad(i + 1)}</span>
                      <span className="font-heading text-[1.4rem] font-thin not-italic leading-[1.12] tracking-[-0.01em] sm:text-[1.65rem]">{x.title}</span>
                      <span className="hidden justify-self-end font-sans text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-[#ededd5]/60 sm:block">{x.cadence}</span>
                    </span>
                    {on && (
                      <span
                        key={`${active}-${held}-${still}`}
                        aria-hidden="true"
                        data-paused={!running}
                        className={`absolute inset-x-0 bottom-0 h-px bg-[#c6a66a]/80 ${still ? "" : "le-work-fill"}`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
            <p className="mt-8 flex items-center gap-3 font-sans text-[0.58rem] font-semibold uppercase tracking-[0.3em] text-[#ededd5]/45">
              <span aria-hidden="true" className="text-[#c6a66a]">
                ✦
              </span>
              Every plan runs on the same system
            </p>
          </div>

          {/* the card, one sheet on the desk; on a wide screen it lies to the left of the ledger */}
          <div
            id="le-work-panel"
            role="tabpanel"
            aria-labelledby={`le-work-tab-${active}`}
            className="relative overflow-hidden rounded-2xl border border-[#c6a66a]/25 bg-[#f7f5e8] text-[#261f15] shadow-[0_1px_2px_rgba(0,0,0,0.2),0_44px_88px_-32px_rgba(0,0,0,0.6)] lg:order-1"
          >
            {/* the gilded top edge, and a frame just inside the sheet */}
            <span aria-hidden="true" className="absolute inset-x-0 top-0 z-10 h-[3px] bg-gradient-to-r from-[#c6a66a]/20 via-[#c6a66a] to-[#c6a66a]/20" />
            <span aria-hidden="true" className="pointer-events-none absolute inset-2.5 z-10 rounded-xl border border-[#261f15]/10 sm:inset-3" />
            {/* the paper's soft bloom */}
            <span aria-hidden="true" className="pointer-events-none absolute -right-24 -top-28 z-0 h-[22rem] w-[22rem] rounded-full bg-[#d6be91]/35 blur-3xl" />
            <span aria-hidden="true" className="pointer-events-none absolute -bottom-24 -left-20 z-0 h-[18rem] w-[18rem] rounded-full bg-[#cecda8]/40 blur-3xl" />

            <div className="relative z-10 p-7 sm:p-9 md:p-11">
              <div className="flex items-center gap-4">
                <p className="font-sans text-[0.55rem] font-semibold uppercase tracking-[0.3em] text-[#261f15]/45">
                  LocalEyes{" "}
                  <span aria-hidden="true" className="text-[#c6a66a]">
                    ✦
                  </span>{" "}
                  The work
                </p>
                <span aria-hidden="true" className="h-px flex-1 bg-[#261f15]/10" />
              </div>

              <div key={active} className="le-work-turn">
                <div className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-2">
                  <h3 className="font-heading text-[1.7rem] font-thin not-italic leading-[1.05] sm:text-3xl">{d.title}</h3>
                  <span className="rounded-full bg-[#c6a66a]/15 px-2.5 py-1 font-sans text-[0.5rem] font-semibold uppercase tracking-[0.22em] text-[#8a6f3d]">{d.cadence}</span>
                </div>

                <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <p className="font-heading text-[clamp(3.6rem,7vw,5.2rem)] font-thin not-italic leading-none tracking-[-0.02em]">
                    {pad(active + 1)}
                    <span className="ml-1 align-baseline text-[0.32em] tracking-[0.08em] text-[#261f15]/55">/{pad(items.length)}</span>
                  </p>
                  <p className="font-sans text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[#8a6f3d]">Runs alongside the other four</p>
                </div>

                <div className="mt-9 grid grid-cols-1 gap-9 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] md:gap-10">
                  {/* what it is */}
                  <div>
                    <p className="flex items-center gap-3 font-sans text-[0.58rem] font-semibold uppercase tracking-[0.3em] text-[#8a6f3d]">
                      What it is
                      <span aria-hidden="true" className="h-px flex-1 bg-[#261f15]/10" />
                    </p>
                    <p className="mt-5 font-sans text-sm leading-relaxed text-[#261f15]/75">{d.body}</p>
                    <a
                      href={CALENDLY_BOOKING_URL}
                      onClick={(e) => {
                        e.preventDefault();
                        openCalendly();
                      }}
                      className="group/btn relative mt-8 inline-flex cursor-pointer items-center justify-center gap-2.5 overflow-hidden rounded-full border border-[#261f15]/30 py-1 pl-5 pr-1 font-sans text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#261f15] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8a6f3d]"
                    >
                      <span className="relative z-10 py-1 transition-colors duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/btn:text-[#ededd5]">Book a call</span>
                      <span className="relative flex h-8 w-8 shrink-0 items-center justify-center sm:h-9 sm:w-9">
                        <span
                          aria-hidden="true"
                          className="absolute inset-0 scale-100 rounded-full bg-[#4a3421] transition-transform duration-500 ease-[cubic-bezier(0.33,1,0.68,1)] group-hover/btn:scale-[14] group-hover/btn:duration-[1100ms]"
                        />
                        <span className="relative z-10 flex text-[#ededd5] transition-transform duration-700 ease-[cubic-bezier(0.34,1.2,0.4,1)] group-hover/btn:rotate-45">
                          <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
                        </span>
                      </span>
                    </a>
                  </div>

                  {/* what it includes */}
                  <div>
                    <p className="flex items-center gap-3 font-sans text-[0.58rem] font-semibold uppercase tracking-[0.3em] text-[#8a6f3d]">
                      What&apos;s included
                      <span aria-hidden="true" className="h-px flex-1 bg-[#261f15]/10" />
                    </p>
                    <dl className="mt-2">
                      {d.includes.map(([k, v]) => (
                        <div key={k} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] items-baseline gap-x-4 border-b border-[#261f15]/8 py-3 last:border-b-0">
                          <dt className="font-sans text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-[#261f15]/50">{k}</dt>
                          <dd className="m-0 text-right font-sans text-[0.8rem] font-semibold leading-snug">{v}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
