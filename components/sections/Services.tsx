"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Noise } from "@/components/effects/Noise";

gsap.registerPlugin(ScrollTrigger);

/* ----------------------------------------------------------------------
   Our Services — the column + the proof
   Six oversized words stacked as a clean left column (flex-direction:
   column), each carrying a drawn gold arrow raised to the upper right
   and a whisper-quiet index numeral. Beside the column, the PROOF: a
   real screenshot or photo, always present — Rankings' proof by
   default — crossfading simply whenever a different word is hovered,
   focused or tapped.
   - Hover (desktop) / focus (keyboard) / tap (touch) a word: it lifts
     and turns gold, its arrow travels up-and-right, sibling words
     quietly recede, and its proof takes the frame.
   - Handlers are capability-gated: hover/focus only where
     (hover: hover); the tap toggle only where (hover: none) — touch
     browsers synthesize mouseenter/focus before click, so ungated
     handlers would make the first tap open-then-close.
   - Scroll-in: words surface top-down, arrows flick up a beat later
     with a spring, the proof frame rises in alongside.
   - GSAP targets (li.le-svc-item / .le-svc-arrowbox / .le-svc-proofwrap)
     stay disjoint from the CSS-transition targets (.le-svc-btn /
     .le-svc-word / svg.le-svc-arrow / img.le-svc-proof) so inline
     tween styles never fight state-driven transitions.
   - On large screens the proof floats in the right rail (absolute,
     zero layout shift); below lg it sits in flow under the column.
     All six images stack in one fixed 8:5 frame at identical size.
   - NO italics. prefers-reduced-motion: fully static and legible.
   Edit or reorder the six items (words AND proof images) via SERVICES.
   ---------------------------------------------------------------------- */

/* Images live in /public — reference them root-relative below. */
const IMG = (path: string) => `${"/"}${path.replace(/^\//, "")}`;

type Service = {
  word: string;
  /** the proof — shown while this word is active */
  img: string;
  alt: string;
  /** "contain" for white-background data screenshots (nothing gets
     cropped — the white frame blends in); omit for photos, which
     fill the frame edge-to-edge */
  fit?: "contain";
};

const SERVICES: Service[] = [
  {
    word: "Rankings",
    img: "/services-01-ranking.png",
    alt: "Top keyword rankings on Google — every keyword trending up",
    fit: "contain",
  },
  {
    word: "Traffic",
    img: "/Ads-01.jpg",
    alt: "Traffic sources dashboard on a tablet beside a cup of coffee",
  },
  {
    word: "Leads",
    img: "/services-03.png",
    alt: "Monthly leads chart climbing from 3 to 152 leads per month",
    fit: "contain",
  },
  {
    word: "Bookings",
    img: "/services-04.jpg",
    alt: "A booked coffee cart pouring drinks for guests at a brand event",
  },
  {
    word: "Revenues",
    img: "/seo-01 image.webp",
    alt: "Quarterly revenue chart up 75% over the previous quarter",
    fit: "contain",
  },
  {
    word: "Headaches",
    img: "/services-01-ranking.png",
    alt: "A kitten sleeping without a care in the world",
  },
];

export default function Services() {
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState<number | null>(null);

  /* the proof on display — the active word's image, Rankings' when
     nothing is active (the frame is never empty) */
  const shown = active ?? 0;

  /* Scroll-in reveal — words surface top-down, arrows flick up a beat
     later; plays once, skipped under reduced motion */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const eyebrow = section.querySelector<HTMLElement>(".le-svc-eyebrow");
    const items = section.querySelectorAll<HTMLElement>(".le-svc-item");
    const arrows = section.querySelectorAll<HTMLElement>(".le-svc-arrowbox");
    const proof = section.querySelector<HTMLElement>(".le-svc-proofwrap");
    const caption = section.querySelector<HTMLElement>(".le-svc-caption");
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
        items,
        { autoAlpha: 0, y: 48 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.09,
          ease: "power3.out",
          scrollTrigger: { trigger: section, start: "top 74%", once: true },
        },
      ),
    );

    /* the upward flick — arrows arrive from down-left with a spring */
    tweens.push(
      gsap.fromTo(
        arrows,
        { x: -14, y: 14, autoAlpha: 0 },
        {
          x: 0,
          y: 0,
          autoAlpha: 1,
          duration: 0.7,
          delay: 0.35,
          stagger: 0.09,
          ease: "back.out(2.2)",
          scrollTrigger: { trigger: section, start: "top 74%", once: true },
        },
      ),
    );

    /* the proof frame rises in alongside the column */
    if (proof) {
      tweens.push(
        gsap.fromTo(
          proof,
          { autoAlpha: 0, y: 36 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 1,
            delay: 0.45,
            ease: "power3.out",
            scrollTrigger: { trigger: section, start: "top 74%", once: true },
          },
        ),
      );
    }

    if (caption) {
      tweens.push(
        gsap.fromTo(
          caption,
          { autoAlpha: 0, y: 16 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            delay: 0.85,
            ease: "power3.out",
            scrollTrigger: { trigger: section, start: "top 74%", once: true },
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

  /* Capability-gated handlers — hover/focus own hover-capable devices,
     the tap toggle owns touch; they never fight (touch browsers fire
     synthetic mouseenter/focus before click). */
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
      id="services"
      className="relative w-full overflow-hidden bg-[#ededd5] text-[#261f15]"
    >
      {/* Scoped styles — all motion is transform/opacity/filter, GPU
         friendly and CSS-transition-driven, so mid-motion reversals
         resolve smoothly. Appearance is state-driven (is-active), so
         desktop hover, keyboard focus and touch tap all share it. */}
      <style>{`
        .le-svc-btn {
          transition: opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .le-svc-list.has-active .le-svc-btn:not(.is-active) { opacity: 0.28; }
        .le-svc-word {
          transition:
            transform 0.6s cubic-bezier(0.22, 1, 0.36, 1),
            color 0.45s cubic-bezier(0.22, 1, 0.36, 1);
          will-change: transform;
        }
        .le-svc-btn.is-active .le-svc-word {
          color: #a3843f;
          transform: translateY(-0.05em);
        }
        .le-svc-arrow {
          transition: transform 0.6s cubic-bezier(0.3, 1.4, 0.4, 1);
          will-change: transform;
        }
        .le-svc-btn.is-active .le-svc-arrow {
          transform: translate(0.16em, -0.16em) scale(1.06);
        }

        /* the proof — a simple crossfade, nothing else: the incoming
           image fades in on top of the outgoing one, which fades away
           beneath it, so the frame is never empty */
        .le-svc-proof {
          opacity: 0;
          z-index: 1;
          transition: opacity 0.5s ease;
          will-change: opacity;
        }
        .le-svc-proof.is-shown {
          opacity: 1;
          z-index: 2;
        }

        @media (prefers-reduced-motion: reduce) {
          .le-svc-btn, .le-svc-word, .le-svc-arrow,
          .le-svc-proof { transition: none; }
        }
      `}</style>

      {/* Film grain — above the cream ground, below every word and
         arrow; tuned down for the light tone (soft paper, not dirt) */}
      <Noise patternAlpha={9} />

      <div className="relative z-20 mx-auto w-full max-w-[1480px] px-6 py-16 md:px-12 md:py-24">
        {/* ------------------------- heading --------------------------- */}
        <div className="le-svc-eyebrow flex items-center gap-6">
          <h2 className="font-sans text-[0.62rem] font-semibold uppercase tracking-[0.3em] text-[#8a6f3d] sm:text-xs">
            <span aria-hidden="true" className="mr-4 text-[0.8em]">
              ✦
            </span>
            Our Services
          </h2>
          <span aria-hidden="true" className="h-px flex-1 bg-[#261f15]/10" />
        </div>

        {/* ---------------- the column + the proof --------------------
           A real list, stacked as a clean left column. The right rail
           is reserved on large screens for the proof imagery. */}
        <ul
          className={`le-svc-list mt-12 flex flex-col items-start gap-1 md:mt-16 md:gap-2 lg:pr-[clamp(360px,33vw,620px)]${
            hasActive ? " has-active" : ""
          }`}
        >
          {SERVICES.map((service, i) => (
            <li key={service.word} className="le-svc-item">
              <button
                type="button"
                onMouseEnter={() => handleHover(i)}
                onMouseLeave={() => handleHover(null)}
                onFocus={() => handleHover(i)}
                onBlur={() => handleHover(null)}
                onClick={() => handleTap(i)}
                className={`le-svc-btn flex cursor-pointer items-baseline gap-4 whitespace-nowrap border-0 bg-transparent p-0 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-[#a3843f] md:gap-6${
                  active === i ? " is-active" : ""
                }`}
              >
                {/* index numeral — quiet, editorial */}
                <span
                  aria-hidden="true"
                  className="w-6 shrink-0 font-sans text-[0.62rem] font-semibold tracking-[0.24em] text-[#a3843f]/60 sm:text-xs"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* the word — oversized thin display type */}
                <span className="le-svc-word inline-block font-heading font-thin not-italic text-[clamp(2.6rem,7.5vw,6rem)] leading-[1.02] tracking-[-0.02em] text-[#261f15]">
                  {service.word}
                </span>

                {/* the arrow — a drawn element, raised to the upper
                   right, decorative so screen readers just hear the
                   word */}
                <span
                  aria-hidden="true"
                  className="le-svc-arrowbox inline-block self-start"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="le-svc-arrow mt-[0.3em] h-[0.42em] w-[0.42em] text-[clamp(2.6rem,7.5vw,6rem)] text-[#a3843f]"
                  >
                    <path
                      d="M5.5 18.5 L18.5 5.5 M8.5 5.5 H18.5 V15.5"
                      stroke="currentColor"
                      strokeWidth="2.1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </button>
            </li>
          ))}
        </ul>

        {/* ------------------ the proof, always on ----------------------
           One fixed 8:5 frame; every image renders at exactly the same
           size. Photos fill it edge-to-edge (object-cover); white-
           background data screenshots scale to fit (object-contain)
           over the white frame so no data is cropped. Rankings' proof
           holds the frame whenever nothing is hovered. On lg+ it
           floats in the right rail with zero layout shift; below lg it
           sits under the column. Decorative — the word is the
           accessible label — so the panel is aria-hidden. */}
        <div
          aria-hidden="true"
          className="pointer-events-none mx-auto mt-12 w-[min(88vw,460px)] lg:absolute lg:right-12 lg:top-[52%] lg:mx-0 lg:mt-0 lg:w-[clamp(360px,31vw,600px)] lg:-translate-y-1/2"
        >
          {/* inner wrapper is the GSAP target — the outer div keeps its
             static translate centering, so the tween never fights it */}
          <div className="le-svc-proofwrap relative aspect-[8/5] w-full overflow-hidden rounded-2xl bg-white">
            {SERVICES.map((service, i) => (
              <img
                key={service.word}
                src={IMG(service.img)}
                alt=""
                decoding="async"
                className={`le-svc-proof absolute inset-0 h-full w-full ${
                  service.fit === "contain" ? "object-contain" : "object-cover"
                }${shown === i ? " is-shown" : ""}`}
              />
            ))}
          </div>
        </div>

        {/* quiet sign-off — no rules, just type */}
        <p className="le-svc-caption mt-10 text-right font-sans text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-[#261f15]/45 md:mt-12">
          Everything, up and to the right
          <span aria-hidden="true" className="ml-2 text-[#a3843f]">
            ✦
          </span>
        </p>
      </div>
    </section>
  );
}
