"use client";

import { useEffect, useRef, useState } from "react";

const CITIES = [
  { code: "LA", leads: 120 },
  { code: "NYC", leads: 110 },
  { code: "PHL", leads: 80 },
  { code: "CHI", leads: 65 },
  { code: "ORL", leads: 60 },
  { code: "ATL", leads: 50 },
];

const COUNT_DURATION = 1700;

function CountUp({
  value,
  started,
  delay,
  reduced,
}: {
  value: number;
  started: boolean;
  delay: number;
  reduced: boolean;
}) {
  const [display, setDisplay] = useState(reduced ? value : 0);

  useEffect(() => {
    if (reduced) {
      setDisplay(value);
      return;
    }
    if (!started) return;
    let raf: number;
    const t0 = performance.now() + delay;
    const tick = (now: number) => {
      const t = Math.min(Math.max((now - t0) / COUNT_DURATION, 0), 1);
      /* easeOutExpo — fast start, silky settle */
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setDisplay(Math.round(value * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, value, delay, reduced]);

  return <>{display}</>;
}

export default function CityRankings() {
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const [reduced, setReduced] = useState(false);

  /* Read the OS motion preference on the client */
  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  /* Trigger the count-up once, the first time the band scrolls into view */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const plates = (copy: number) => (
    <div
      key={copy}
      aria-hidden={copy === 1}
      className={reduced ? "contents" : "flex items-center"}
    >
      {CITIES.map((city, i) => (
        <div
          key={city.code}
          className="group/city flex items-center px-7 sm:px-10"
        >
          <div className="flex items-baseline">
            <span className="cursor-default font-heading font-thin not-italic text-6xl leading-none tracking-[-0.01em] text-[#ededd5] transition-colors duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/city:text-[#a67c3d] sm:text-7xl md:text-8xl">
              {city.code}
            </span>
            <span className="ml-4 flex flex-col sm:ml-5">
              <span className="font-heading not-italic text-2xl leading-none text-[#a67c3d] sm:text-3xl">
                <CountUp
                  value={city.leads}
                  started={inView}
                  delay={i * 140}
                  reduced={reduced}
                />
                +
              </span>
              <span className="mt-2 font-sans text-[0.55rem] font-semibold uppercase tracking-[0.22em] text-[#ededd5]/55 sm:text-[0.6rem]">
                Google leads / mo
              </span>
            </span>
          </div>
          {(!reduced || i < CITIES.length - 1) && (
            <span
              aria-hidden="true"
              className="pl-7 text-sm text-[#a67c3d]/50 sm:pl-10"
            >
              ✦
            </span>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <section
      id="results"
      ref={sectionRef}
      className="relative w-full overflow-hidden border-y border-[#ededd5]/10 bg-[#261f15] text-[#ededd5]"
    >
      {/* Soft vignette — corners recede for a quiet, expensive depth */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(120%_140%_at_50%_50%,transparent_55%,rgba(0,0,0,0.35)_100%)]"
      />

      {/* Eyebrow */}
      <div className="relative z-10 mx-auto w-full max-w-[1480px] px-6 pt-10 md:px-12 md:pt-12">
        <p className="flex items-center gap-4 font-sans text-sm font-semibold uppercase tracking-[0.3em] text-[#a67c3d] sm:text-base">
          <span aria-hidden="true" className="text-[0.8em]">
            ✦
          </span>
          RANKING #1 IN
          <span aria-hidden="true" className="h-px flex-1 bg-[#ededd5]/10" />
        </p>
      </div>

      {/* City band */}
      <div className="relative z-10 py-9 md:py-11">
        {!reduced && (
          <>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-[#261f15] to-transparent sm:w-36"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-[#261f15] to-transparent sm:w-36"
            />
          </>
        )}

        {reduced ? (
          /* Reduced motion — static, centered, final numbers */
          <div className="flex flex-wrap items-center justify-center gap-y-8">
            {plates(0)}
          </div>
        ) : (
          /* Seamless marquee — one duplicate set, track drifts -50%;
             hovering anywhere on the band pauses the drift */
          <div className="group relative w-full overflow-hidden">
            <div className="flex w-max items-center animate-le-cities will-change-transform">
              {plates(0)}
              {plates(1)}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
