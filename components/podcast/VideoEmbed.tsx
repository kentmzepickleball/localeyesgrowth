"use client";

import { useState } from "react";
import { Play } from "lucide-react";

/* ----------------------------------------------------------------------
   Branded YouTube embed — facade pattern.
   Shows the real YouTube thumbnail with a brand-styled play button, and
   only mounts the actual YouTube iframe (its ~1MB+ of embed JS) after a
   click. Same "don't pay for it until it's needed" instinct as every
   other lazy-loaded thing on this site — a video is the single heaviest
   thing a page can eagerly load, so it stays a plain <img> until a
   visitor actually asks to watch.
   ---------------------------------------------------------------------- */

export function VideoEmbed({
  youtubeId,
  title,
  runtime,
}: {
  youtubeId: string;
  title: string;
  runtime?: string;
}) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="relative mt-10 w-full overflow-hidden rounded-2xl border border-[#c6a66a]/25 bg-[#150f09] shadow-[0_1px_2px_rgba(38,31,21,0.05),0_28px_56px_-28px_rgba(38,31,21,0.5)]">
      {/* Ripple rings only run while the button is hovered — driven by
         group-hover so they start/stop cleanly rather than looping
         forever off-screen. Two rings staggered half a beat apart read
         as one continuous pulse instead of a single expanding circle. */}
      <style>{`
        @keyframes le-play-ripple {
          0% { transform: scale(0.9); opacity: 0.55; }
          100% { transform: scale(1.9); opacity: 0; }
        }
        .le-play-ripple {
          animation: none;
        }
        .group\\/play:hover .le-play-ripple {
          animation: le-play-ripple 1.6s cubic-bezier(0.22, 1, 0.36, 1) infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .group\\/play:hover .le-play-ripple {
            animation: none;
          }
        }
      `}</style>
      <div className="relative aspect-video w-full">
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`Play video — ${title}`}
            className="group/play absolute inset-0 h-full w-full cursor-pointer"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://i.ytimg.com/vi/${youtubeId}/maxresdefault.jpg`}
              alt=""
              aria-hidden="true"
              fetchPriority="high"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/play:scale-[1.03]"
            />
            <span
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-[#150f09]/75 via-[#150f09]/10 to-[#150f09]/35"
            />

            <span className="absolute inset-0 flex items-center justify-center">
              <span className="relative flex h-20 w-20 shrink-0 items-center justify-center sm:h-24 sm:w-24">
                {/* soft gold glow bleeding out behind the button on hover */}
                <span
                  aria-hidden="true"
                  className="absolute -inset-8 rounded-full bg-[#c6a66a] opacity-0 blur-2xl transition-opacity duration-700 ease-out group-hover/play:opacity-45"
                />
                {/* two staggered sonar rings, hover-only */}
                <span
                  aria-hidden="true"
                  className="le-play-ripple absolute inset-0 rounded-full border border-[#ededd5]/60"
                />
                <span
                  aria-hidden="true"
                  className="le-play-ripple absolute inset-0 rounded-full border border-[#ededd5]/60"
                  style={{ animationDelay: "0.8s" }}
                />
                {/* main circle — springy overshoot instead of a flat ease */}
                <span
                  aria-hidden="true"
                  className="absolute inset-0 scale-100 rounded-full bg-[#c6a66a] shadow-[0_10px_30px_-8px_rgba(21,15,9,0.6)] transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover/play:scale-[1.14]"
                />
                <Play
                  className="relative z-10 h-8 w-8 translate-x-0.5 fill-[#261f15] text-[#261f15] transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover/play:scale-110 sm:h-9 sm:w-9"
                  strokeWidth={0}
                />
              </span>
            </span>

            {runtime && (
              <span className="absolute bottom-4 right-4 rounded-full bg-[#150f09]/70 px-3 py-1.5 font-sans text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#ededd5] backdrop-blur-sm">
                {runtime}
              </span>
            )}

            <span className="absolute bottom-4 left-4 right-24 text-left font-sans text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[#ededd5]/85 sm:text-xs">
              {title}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
