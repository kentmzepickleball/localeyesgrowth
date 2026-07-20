"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Noise } from "@/components/effects/Noise";

gsap.registerPlugin(ScrollTrigger);

/* ----------------------------------------------------------------------
   Capabilities — one editorial statement, photo-row reveals
   A bright cream interlude. The section is one huge sentence in thin
   display type; three gold words — Websites, SEO, Ads — are live.
   Hovering (desktop), focusing (keyboard) or tapping (touch) a word
   floats its trio of photos over the section as a clean, perfectly
   straight, evenly-aligned row — fully opaque, no borders, no frames,
   no rotation. The row spans ~90% of the section width.
   The entrance: each photo rises 40-56px with a soft-spring scale
   settle while clearing from a gentle blur, staggered 0/90/180ms left
   to right so the trio arrives as a choreographed sequence. Leaving
   retracts them in reverse stagger; everything is CSS-transition-
   driven, so reversing mid-motion resolves smoothly from wherever it
   is — never snaps.
   The row is absolutely positioned, so the layout NEVER jumps.
   - NO rotation, NO borders/frames, NO divider lines, NO italics.
   - prefers-reduced-motion: reveals become instant static states.
   Swap photos / edit the sentence via TRIOS and TOKENS below.
   ---------------------------------------------------------------------- */

/* Photos live in /public — reference them root-relative below.
   (If you use next/image, swap the <img> tags and keep the classes.) */
const IMG = (path: string) => `${"/"}${path.replace(/^\//, "")}`;

/* the straight row: three equal slots, same top line, ~90% total span */
const ROW = [
  { left: "5%", top: "30%", width: "28%", dy: "44px" },
  { left: "36%", top: "30%", width: "28%", dy: "56px" },
  { left: "67%", top: "30%", width: "28%", dy: "40px" },
] as const;

type Photo = {
  src: string;
  alt: string;
  /** which part of the image to favor when cropping */
  pos: "object-top" | "object-center";
  /** "contain" for white-background data screenshots (nothing gets
     cropped); omit for photos, which fill the frame edge-to-edge */
  fit?: "contain";
};

type Trio = { key: string; word: string; photos: Photo[] };

const TRIOS: Trio[] = [
  {
    key: "websites",
    word: "Websites",
    /* REAL project screenshots — /public/website-project-0*.webp */
    photos: [
      {
        src: "/website-project-01.webp",
        alt: "Coffee cart catering website for a New England mobile espresso bar",
        pos: "object-top",
      },
      {
        src: "/website-project-02.webp",
        alt: "Grazing table catering website with warm editorial styling",
        pos: "object-top",
      },
      {
        src: "/website-project-03.webp",
        alt: "Craft coffee cart catering website for Los Angeles film sets",
        pos: "object-top",
      },
    ],
  },
  {
    key: "seo",
    word: "SEO",
    /* REAL result — the same local rank-map screenshot in all three
       slots, by design: /public/seo-project-01.webp */
    photos: [
      {
        src: "/seo-01 image.webp",
        alt: "Local rank-tracking map showing #1 Google positions across the region",
        pos: "object-center",
      },
      {
        src: "/seo-01 image.webp",
        alt: "Local rank-tracking map showing #1 Google positions across the region",
        pos: "object-center",
      },
      {
        src: "/seo-01 image.webp",
        alt: "Local rank-tracking map showing #1 Google positions across the region",
        pos: "object-center",
      },
    ],
  },
  {
    key: "ads",
    word: "Ads",
    /* REAL project screenshots — /public/ads-project-0*.jpg */
    photos: [
      {
        src: "/Ads-01.jpg",
        alt: "Google Ads performance dashboard — conversions up 233%, cost per conversion down 71%",
        pos: "object-center",
        fit: "contain",
      },
      {
        src: "/Ads-02.jpeg",
        alt: "Active users trending up over the past month",
        pos: "object-center",
        fit: "contain",
      },
      {
        src: "/Ads-03.jpeg",
        alt: "Top keyword rankings on Google, all trending up",
        pos: "object-center",
        fit: "contain",
      },
    ],
  },
];

/* The statement, word by word. `hot` indexes into TRIOS; `suffix` glues
   punctuation to a hotspot word so it never wraps apart. */
type Token = { text?: string; hot?: number; suffix?: string };

const TOKENS: Token[] = [
  { text: "LE" },
  { text: "designs" },
  { hot: 0 },
  { text: "that" },
  { text: "convert," },
  { text: "integrates" },
  { text: "tasteful" },
  { text: "and" },
  { text: "effective" },
  { hot: 1, suffix: "," },
  { text: "and" },
  { text: "offers" },
  { text: "heightened" },
  { text: "visibility" },
  { text: "through" },
  { text: "Google" },
  { hot: 2, suffix: "." },
];

export default function Capabilities() {
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState<number | null>(null);

  /* Entrance — eyebrow, then the statement builds word by word; plays
     once, skipped entirely under reduced motion */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const eyebrow = section.querySelector<HTMLElement>(".le-cap-eyebrow");
    const words = section.querySelectorAll<HTMLElement>(".le-cap-w");
    const hint = section.querySelector<HTMLElement>(".le-cap-hint");
    const tweens: gsap.core.Tween[] = [];

    if (eyebrow) {
      tweens.push(
        gsap.fromTo(
          eyebrow,
          { autoAlpha: 0, y: 22 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: { trigger: section, start: "top 82%", once: true },
          },
        ),
      );
    }

    tweens.push(
      gsap.fromTo(
        words,
        { autoAlpha: 0, y: 30 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.85,
          stagger: 0.045,
          ease: "power3.out",
          scrollTrigger: { trigger: section, start: "top 78%", once: true },
        },
      ),
    );

    if (hint) {
      tweens.push(
        gsap.fromTo(
          hint,
          { autoAlpha: 0, y: 16 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            delay: 0.55,
            ease: "power3.out",
            scrollTrigger: { trigger: section, start: "top 78%", once: true },
          },
        ),
      );
    }

    return () => {
      tweens.forEach((tween) => {
        tween.scrollTrigger?.kill();
        tween.kill();
      });
    };
  }, []);

  const hasActive = active !== null;

  /* Touch: tap a word to open its trio, tap again to close.
     Desktop keeps pure hover / keyboard focus. Each side is gated on
     hover capability — touch browsers synthesize mouseenter/focus
     before click on tap, so ungated hover handlers would make the
     first tap open-then-instantly-close. Gating means the tap toggle
     owns touch and the hover/focus pair owns desktop; they never fight. */
  const handleHover = (index: number | null) => {
    if (window.matchMedia("(hover: hover)").matches) {
      setActive(index);
    }
  };

  const handleTap = (index: number) => {
    if (window.matchMedia("(hover: none)").matches) {
      setActive((current) => (current === index ? null : index));
    }
  };

  return (
    <section
      ref={sectionRef}
      id="capabilities"
      className="relative w-full overflow-hidden bg-[#ededd5] text-[#261f15]"
    >
      {/* Scoped styles. All motion is transform/opacity/filter — GPU
         friendly — and CSS-transition-driven, so mid-motion reversals
         resolve smoothly from the current state. */}
      <style>{`
        .le-cap-photo {
          left: var(--l);
          top: var(--t);
          width: var(--w);
          opacity: 0;
          transform: translate3d(0, var(--dy), 0) scale(0.955);
          filter: blur(9px);
          transition:
            transform 0.85s cubic-bezier(0.3, 1.33, 0.42, 1),
            opacity 0.55s cubic-bezier(0.33, 1, 0.68, 1),
            filter 0.7s cubic-bezier(0.33, 1, 0.68, 1);
          will-change: transform, opacity, filter;
        }
        .le-cap-trio.is-active .le-cap-photo {
          opacity: 1;
          transform: translate3d(0, 0, 0) scale(1);
          filter: blur(0);
        }
        /* choreographed sequence: 0 / 90 / 180ms in, reversed out */
        .le-cap-trio.is-active .le-cap-photo:nth-of-type(1) { transition-delay: 0s; }
        .le-cap-trio.is-active .le-cap-photo:nth-of-type(2) { transition-delay: 0.09s; }
        .le-cap-trio.is-active .le-cap-photo:nth-of-type(3) { transition-delay: 0.18s; }
        .le-cap-trio:not(.is-active) .le-cap-photo:nth-of-type(1) { transition-delay: 0.12s; }
        .le-cap-trio:not(.is-active) .le-cap-photo:nth-of-type(2) { transition-delay: 0.06s; }
        .le-cap-trio:not(.is-active) .le-cap-photo:nth-of-type(3) { transition-delay: 0s; }

        .le-cap-hot {
          transition: color 0.45s cubic-bezier(0.22, 1, 0.36, 1),
            opacity 0.45s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .le-cap-hot.is-hot-active { color: #8a6f3d; }
        .le-cap-plain, .le-cap-suffix {
          transition: opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .le-cap-statement.has-active .le-cap-plain,
        .le-cap-statement.has-active .le-cap-suffix { opacity: 0.55; }
        .le-cap-statement.has-active .le-cap-hot:not(.is-hot-active) { opacity: 0.45; }

        .le-cap-hint-hover { display: none; }
        .le-cap-hint-tap { display: inline; }
        @media (hover: hover) {
          .le-cap-hint-hover { display: inline; }
          .le-cap-hint-tap { display: none; }
        }

        @media (prefers-reduced-motion: reduce) {
          .le-cap-photo, .le-cap-hot,
          .le-cap-plain, .le-cap-suffix { transition: none; }
        }
      `}</style>

      {/* Film grain — above the cream ground, below text and photos */}
      <Noise patternAlpha={10} />

      <div className="relative z-20 mx-auto w-full max-w-[1480px] px-6 py-16 md:px-12 md:py-24 lg:py-28">
        {/* ------------------------- eyebrow --------------------------- */}
        <p className="le-cap-eyebrow font-sans text-[0.62rem] font-semibold uppercase tracking-[0.3em] text-[#8a6f3d] sm:text-xs">
          <span aria-hidden="true" className="mr-4 text-[0.8em] text-[#a67c3d]">
            ✦
          </span>
          What we do
        </p>

        {/* ----------------------- the statement ----------------------- */}
        <h2
          className={`le-cap-statement mt-10 max-w-5xl font-heading font-thin not-italic text-[2rem] leading-[1.18] tracking-[-0.01em] sm:text-5xl sm:leading-[1.16] md:mt-14 md:text-[3.6rem] lg:text-[4.1rem]${
            hasActive ? " has-active" : ""
          }`}
        >
          {TOKENS.map((token, i) => (
            <span key={i}>
              <span className="le-cap-w inline-block whitespace-nowrap align-baseline">
                {token.hot !== undefined ? (
                  <>
                    <button
                      type="button"
                      aria-expanded={active === token.hot}
                      onMouseEnter={() => handleHover(token.hot!)}
                      onMouseLeave={() => handleHover(null)}
                      onFocus={() => handleHover(token.hot!)}
                      onBlur={() => handleHover(null)}
                      onClick={() => handleTap(token.hot!)}
                      className={`le-cap-hot relative cursor-pointer border-0 bg-transparent p-0 font-heading font-normal not-italic text-[#a3843f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8a6f3d]${
                        active === token.hot ? " is-hot-active" : ""
                      }`}
                    >
                      {TRIOS[token.hot].word}
                    </button>
                    {token.suffix && (
                      <span className="le-cap-suffix">{token.suffix}</span>
                    )}
                  </>
                ) : (
                  <span className="le-cap-plain">{token.text}</span>
                )}
              </span>{" "}
            </span>
          ))}
        </h2>

        {/* quiet affordance — no rules, just type */}
        <p className="le-cap-hint mt-12 text-right font-sans text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-[#261f15]/40 md:mt-16">
          <span className="le-cap-hint-hover">Hover the gold words</span>
          <span className="le-cap-hint-tap">Tap the gold words</span>
          <span aria-hidden="true" className="ml-2 text-[#a67c3d]">
            ✦
          </span>
        </p>

        {/* ---- the reveal: a straight, opaque row of three photos ----
           Absolutely positioned + pointer-events: none — zero layout
           shift, hover never blocked. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          {TRIOS.map((trio, index) => (
            <div
              key={trio.key}
              className={`le-cap-trio absolute inset-0${
                active === index ? " is-active" : ""
              }`}
            >
              {trio.photos.map((photo, photoIndex) => (
                <img
                  key={`${trio.key}-${photoIndex}`}
                  src={IMG(photo.src)}
                  alt=""
                  loading="eager"
                  decoding="async"
                  className={`le-cap-photo absolute aspect-[16/10] ${
                    photo.fit === "contain"
                      ? "bg-white object-contain"
                      : "object-cover"
                  } ${photo.pos}`}
                  style={
                    {
                      "--l": ROW[photoIndex].left,
                      "--t": ROW[photoIndex].top,
                      "--w": ROW[photoIndex].width,
                      "--dy": ROW[photoIndex].dy,
                    } as CSSProperties
                  }
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
