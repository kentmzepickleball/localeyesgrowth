"use client";

import { useEffect, useState } from "react";
import { Play, X } from "lucide-react";

/* ----------------------------------------------------------------------
   Floating podcast teaser — homepage only.
   Appears automatically ~3s after the page loads (not scroll-gated —
   it shows over the Hero too) and then stays fixed in the corner for
   the rest of the visit. A richer entrance than BackToTop's plain
   fade: slides up and scales in from slightly below full size, with a
   springy overshoot easing instead of a flat curve.
   Dismissible — the X just hides it for the current page view; it's
   not remembered across reloads, so it shows again every fresh visit.
   ---------------------------------------------------------------------- */

const YOUTUBE_ID = "WtfVjOL8TiU";
const THUMBNAIL = `https://i.ytimg.com/vi/${YOUTUBE_ID}/hqdefault.jpg`;
const APPEAR_DELAY_MS = 3000;

export function PodcastPromoCard() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const showTimer = window.setTimeout(
      () => setVisible(true),
      reduced ? 0 : APPEAR_DELAY_MS,
    );
    return () => window.clearTimeout(showTimer);
  }, []);

  const shown = visible && !dismissed;

  return (
    <div
      aria-hidden={!shown}
      className={`fixed bottom-6 left-6 z-40 w-[min(27rem,calc(100vw-3rem))] transition-all duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] md:bottom-10 md:left-10 ${
        shown
          ? "translate-y-0 scale-100 opacity-100"
          : "pointer-events-none translate-y-10 scale-90 opacity-0"
      }`}
    >
      <div className="group/promo relative flex items-center gap-4 rounded-[1.25rem] border border-[#261f15]/12 bg-[#ededd5]/95 py-3.5 pl-3.5 pr-9 shadow-[0_24px_60px_-20px_rgba(38,31,21,0.5)] backdrop-blur-sm transition-colors duration-500 hover:border-[#8a6f3d]/40">
        <a
          href="/podcast/episode-1-catering-seo-lessons"
          tabIndex={shown ? 0 : -1}
          className="flex min-w-0 flex-1 items-center gap-4"
        >
          <span className="relative h-28 w-44 shrink-0 overflow-hidden rounded-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={THUMBNAIL}
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/promo:scale-110"
            />
            <span aria-hidden="true" className="absolute inset-0 bg-[#150f09]/25" />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#c6a66a] shadow-[0_6px_16px_-2px_rgba(21,15,9,0.6)] transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover/promo:scale-110">
                <Play
                  className="h-4 w-4 translate-x-px fill-[#261f15] text-[#261f15]"
                  strokeWidth={0}
                />
              </span>
            </span>
          </span>

          <span className="min-w-0">
            <span className="flex items-center gap-1.5 font-sans text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[#8a6f3d]">
              <span aria-hidden="true">✦</span>
              New — Podcast
            </span>
            <span className="mt-1.5 block font-heading font-thin not-italic text-[1.25rem] leading-[1.2] text-[#261f15] transition-colors duration-300 group-hover/promo:text-[#8a6f3d]">
              What 3 Years of Catering SEO Taught Us
            </span>
          </span>
        </a>

        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          tabIndex={shown ? 0 : -1}
          className="absolute right-2.5 top-2.5 flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#261f15]/40 transition-colors duration-300 hover:bg-[#261f15]/10 hover:text-[#261f15]"
        >
          <X className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
