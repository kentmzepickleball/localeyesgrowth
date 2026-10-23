"use client";

import { useRef } from "react";
import { Eyebrow, Hairlines, useSeen } from "./parts";

/* ----------------------------------------------------------------------
   RankingClock: why design and SEO are one project, said once in words
   and once as a picture. Beside the text, a card holds two timelines of
   the same build: built first and optimized later, and built to rank
   from the brief. Both launch at the same moment and both sit out
   Google's sandbox, but only one can start ranking when it ends; the
   other still has its SEO to do. The gap between the two is marked.
   A schematic, said so on the card; the only number on it is the
   sandbox's. The bars draw in, left to right, when the card comes on
   screen (at once with reduced motion).
   ---------------------------------------------------------------------- */

type Span = { from: number; to: number; label: string; tone: "build" | "late" | "ours" | "sandbox" };
type Track = { name: string; note: string; ours: boolean; starts: number; spans: Span[] };

const LAUNCH = 34;
const TRACKS: Track[] = [
  {
    name: "Built, then optimized",
    note: "The usual order",
    ours: false,
    starts: 80,
    spans: [
      { from: 0, to: LAUNCH, label: "Design and build", tone: "build" },
      { from: LAUNCH, to: 52, label: "Sandbox", tone: "sandbox" },
      { from: 52, to: 80, label: "SEO, added later", tone: "late" },
    ],
  },
  {
    name: "Built to rank",
    note: "How we build",
    ours: true,
    starts: 52,
    spans: [
      { from: 0, to: LAUNCH, label: "Brief, design and SEO", tone: "ours" },
      { from: LAUNCH, to: 52, label: "Sandbox", tone: "sandbox" },
    ],
  },
];

const TONE: Record<Span["tone"], string> = {
  build: "bg-[#261f15]/25",
  late: "bg-[#261f15]/50",
  ours: "bg-[#c6a66a]",
  sandbox: "le-clock-sand border border-[#261f15]/15",
};

export default function RankingClock({
  lead,
  accent,
  paragraphs,
  stat,
  statLabel,
}: {
  lead: string;
  accent: string;
  paragraphs: string[];
  stat: string;
  statLabel: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const seen = useSeen(cardRef);

  return (
    <section aria-labelledby="ranking-clock-title" className="relative w-full overflow-hidden bg-[#ededd5] pb-24 pt-10 text-[#261f15] md:pb-32 md:pt-14">
      <style>{`
        .le-clock-sand { background: repeating-linear-gradient(135deg, rgba(38, 31, 21, 0.2) 0 1.5px, transparent 1.5px 6px); }
        .le-clock-bar { transform: scaleX(0); transform-origin: left center; transition: transform 1s cubic-bezier(0.22, 1, 0.36, 1); }
        .le-clock-fade { opacity: 0; transition: opacity 0.8s ease; }
        .le-clock-rise { stroke-dasharray: 1; stroke-dashoffset: 1; transition: stroke-dashoffset 1.4s cubic-bezier(0.22, 1, 0.36, 1); }
        [data-seen="true"] .le-clock-bar { transform: none; }
        [data-seen="true"] .le-clock-fade { opacity: 1; }
        [data-seen="true"] .le-clock-rise { stroke-dashoffset: 0; }
        @media (prefers-reduced-motion: reduce) {
          .le-clock-bar, .le-clock-fade, .le-clock-rise { transition: none; }
        }
      `}</style>
      <Hairlines />

      <div className="relative mx-auto grid w-full max-w-[1480px] gap-14 px-6 md:px-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)] lg:gap-20">
        {/* the words */}
        <div>
          <Eyebrow>Why the order matters</Eyebrow>
          <h2
            id="ranking-clock-title"
            className="mt-8 font-heading font-thin not-italic text-[clamp(2.3rem,4.4vw,4rem)] leading-[1.04] tracking-[-0.02em]"
          >
            {lead} <span className="text-[#a67c3d]">{accent}</span>
          </h2>
          <div className="mt-8 flex max-w-[34rem] flex-col gap-5">
            {paragraphs.map((p, i) => (
              <p key={i} className="font-sans text-[1rem] leading-[1.75] text-[#261f15]/70">
                {p}
              </p>
            ))}
          </div>
        </div>

        {/* the picture */}
        <div className="lg:pt-16">
          <div
            ref={cardRef}
            data-seen={seen}
            className="rounded-[1.6rem] border border-[#261f15]/10 bg-[#f4efdc] p-6 shadow-[0_1px_2px_rgba(38,31,21,0.05),0_40px_70px_-45px_rgba(38,31,21,0.45)] sm:p-9 lg:sticky lg:top-28"
          >
            <div className="flex items-end gap-5 border-b border-[#261f15]/10 pb-7">
              <p className="whitespace-nowrap font-heading font-thin not-italic text-[clamp(3.4rem,6vw,4.8rem)] leading-[0.85] tracking-[-0.03em] text-[#8a6f3d]">
                {stat}
              </p>
              <p className="max-w-[15rem] pb-1 font-sans text-[0.8rem] font-semibold leading-snug text-[#261f15]/60">
                {statLabel}
              </p>
            </div>

            <p className="mt-7 font-sans text-[0.58rem] font-semibold uppercase tracking-[0.3em] text-[#261f15]/45">
              The ranking clock
            </p>

            <div className="relative mt-6">
              {TRACKS.map((t, ti) => (
                <div key={t.name} className={ti > 0 ? "mt-9" : "mt-4"}>
                  <div className="flex items-baseline justify-between gap-4">
                    <p
                      className={`font-heading font-thin not-italic text-[1.35rem] leading-none tracking-[-0.01em] ${
                        t.ours ? "text-[#261f15]" : "text-[#261f15]/60"
                      }`}
                    >
                      {t.name}
                    </p>
                    <p
                      className={`font-sans text-[0.52rem] font-semibold uppercase tracking-[0.24em] ${
                        t.ours ? "text-[#8a6f3d]" : "text-[#261f15]/40"
                      }`}
                    >
                      {t.note}
                    </p>
                  </div>

                  <div className="relative mt-4 h-8">
                    <span className="absolute inset-x-0 top-1/2 h-px bg-[#261f15]/12" />
                    {/* launch, the same day for both */}
                    <span
                      aria-hidden="true"
                      className="absolute -bottom-3 -top-3 w-px border-l border-dashed border-[#261f15]/30"
                      style={{ left: `${LAUNCH}%` }}
                    />
                    {ti === 0 && (
                      <span
                        className="absolute -top-4 whitespace-nowrap font-sans text-[0.5rem] font-semibold uppercase tracking-[0.24em] text-[#261f15]/55"
                        style={{ left: `${LAUNCH + 1.2}%` }}
                      >
                        Launch
                      </span>
                    )}
                    {t.spans.map((s) => (
                      <span
                        key={s.label}
                        className={`le-clock-bar absolute top-1/2 h-[10px] -translate-y-1/2 rounded-full ${TONE[s.tone]}`}
                        style={{ left: `${s.from}%`, width: `${s.to - s.from}%`, transitionDelay: `${ti * 250 + s.from * 16}ms` }}
                      />
                    ))}
                    {/* ours: ranking, from the day the sandbox ends */}
                    {t.ours && (
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 100 32"
                        preserveAspectRatio="none"
                        className="absolute top-[-14px] h-[30px] overflow-visible"
                        style={{ left: `${t.starts}%`, width: `${100 - t.starts}%` }}
                      >
                        <path
                          d="M0 30 C 30 29, 55 22, 100 2"
                          pathLength={1}
                          fill="none"
                          stroke="#a67c3d"
                          strokeWidth="1.6"
                          vectorEffect="non-scaling-stroke"
                          className="le-clock-rise"
                          style={{ transitionDelay: "1.3s" }}
                        />
                      </svg>
                    )}
                    {/* the ranking clock starts */}
                    <span
                      className="le-clock-fade absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 border border-[#ededd5] bg-[#a67c3d]"
                      style={{ left: `${t.starts}%`, transitionDelay: `${ti * 250 + t.starts * 16 + 500}ms` }}
                    />
                  </div>

                  <div className="relative mt-2 h-9">
                    {t.spans.map((s) => (
                      <span
                        key={s.label}
                        className={`absolute pr-2 font-sans text-[0.52rem] font-semibold uppercase leading-tight tracking-[0.16em] sm:text-[0.56rem] ${
                          s.tone === "ours" ? "text-[#8a6f3d]" : "text-[#261f15]/50"
                        }`}
                        style={{ left: `${s.from}%`, width: `${s.to - s.from}%` }}
                      >
                        {s.label}
                      </span>
                    ))}
                    <span
                      className="le-clock-fade absolute whitespace-nowrap font-sans text-[0.52rem] font-semibold uppercase tracking-[0.16em] text-[#8a6f3d] sm:text-[0.56rem]"
                      style={{
                        ...(t.starts > 70 ? { right: `${100 - t.starts - 2}%` } : { left: `${t.starts + 1.5}%` }),
                        top: t.ours ? 0 : "1.1rem",
                        transitionDelay: `${ti * 250 + t.starts * 16 + 600}ms`,
                      }}
                    >
                      {t.ours ? "Ranking starts" : "Starts here"}
                    </span>
                  </div>
                </div>
              ))}

              {/* what the usual order costs */}
              <div className="le-clock-fade relative mt-3 h-12" style={{ transitionDelay: "1.9s" }}>
                <span
                  className="absolute top-0 h-3 rounded-b-[3px] border-x border-b border-[#a67c3d]/70"
                  style={{ left: "52%", width: "28%" }}
                />
                <span
                  className="absolute top-5 text-center font-sans text-[0.52rem] font-semibold uppercase leading-snug tracking-[0.18em] text-[#8a6f3d] sm:text-[0.56rem]"
                  style={{ left: "44%", width: "44%" }}
                >
                  Months later than it needed to
                </span>
              </div>
            </div>

            <p className="mt-4 border-t border-[#261f15]/10 pt-5 font-sans text-[0.72rem] leading-relaxed text-[#261f15]/45">
              A schematic, not to scale. The sandbox is the time Google holds a brand new domain back.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
