"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { Noise } from "@/components/effects/Noise";

gsap.registerPlugin(ScrollTrigger);

const IMG = (path: string) => `${"/"}${path.replace(/^\//, "")}`;

type Logo = {
  src: string;
  /** the business name — used for alt text and the screen-reader list */
  name: string;
  /** intrinsic pixel size of the file */
  width: number;
  height: number;
  /** rendered height classes — sized by optical weight so the set
     feels even (heavy circular marks smaller, airy wordmarks larger) */
  size: string;
};

const LOGOS: Logo[] = [
  {
    src: "/logo-cup.webp",
    name: "The Coffee Cup",
    width: 584,
    height: 584,
    size: "h-9 md:h-11",
  },
  {
    src: "/fez-coffee-roasters.png",
    name: "Fez Coffee Roasters",
    width: 447,
    height: 558,
    size: "h-12 md:h-14",
  },
  {
    src: "/selah-logo.png",
    name: "Selah Coffee Co.",
    width: 300,
    height: 180,
    size: "h-11 md:h-12",
  },
  {
    src: "/ellie&juice-logo.png",
    name: "Ellie & Juice",
    width: 232,
    height: 186,
    size: "h-12 md:h-14",
  },
  {
    src: "/anecho-coffee.png",
    name: "Anecho Coffee",
    width: 100,
    height: 43,
    size: "h-9 md:h-11",
  },
  {
    src: "/valor logo.avif",
    name: "Valor Coffee",
    width: 310,
    height: 155,
    size: "h-11 md:h-13",
  },
  {
    src: "/flatwhite_1.png",
    name: "North Village Coffee",
    width: 800,
    height: 539,
    size: "h-12 md:h-14",
  },
];

/* One marquee half = the logo set three times, so each half stays
   wider than even a very wide viewport (~1870px vs the 1480px
   container cap) and the -50% wrap is never visible. */
const MARQUEE_SET = [...LOGOS, ...LOGOS, ...LOGOS];

export default function TrustedBy() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    /* Pause the drift while the band is off-screen — zero work when
       nobody can see it. (Also applied under reduced motion, where
       the marquee is display:none anyway.) */
    const observer = new IntersectionObserver(
      ([entry]) => {
        section.classList.toggle("lt-offscreen", !entry.isIntersecting);
      },
      { threshold: 0 },
    );
    observer.observe(section);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return () => observer.disconnect();
    }

    /* Gentle scroll-in — heading first, then the band of marks.
       GSAP touches only these two wrappers; every CSS transition
       lives on the imgs, so they never fight. */
    const head = section.querySelector<HTMLElement>(".lt-head");
    const body = section.querySelector<HTMLElement>(".lt-body");
    const tweens: gsap.core.Tween[] = [];

    if (head) {
      tweens.push(
        gsap.fromTo(
          head,
          { autoAlpha: 0, y: 26 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: { trigger: section, start: "top 85%", once: true },
          },
        ),
      );
    }

    if (body) {
      tweens.push(
        gsap.fromTo(
          body,
          { autoAlpha: 0, y: 18 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 1,
            delay: 0.25,
            ease: "power3.out",
            scrollTrigger: { trigger: section, start: "top 85%", once: true },
          },
        ),
      );
    }

    return () => {
      observer.disconnect();
      tweens.forEach((tween) => {
        tween.scrollTrigger?.kill();
        tween.kill();
      });
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="trusted-by"
      className="relative w-full overflow-hidden bg-[#ededd5] text-[#261f15]"
    >
      <style>{`
        @keyframes lt-drift {
          from { transform: translate3d(0, 0, 0); }
          to   { transform: translate3d(-50%, 0, 0); }
        }
        .lt-track {
          animation: lt-drift 96s linear infinite;
          will-change: transform;
        }
        /* ease to a stop on hover (hover-capable devices only, so a
           stray tap on touch screens can't stick the strip paused);
           full stop while the band is off-screen */
        @media (hover: hover) {
          .lt-viewport:hover .lt-track { animation-play-state: paused; }
        }
        .lt-offscreen .lt-track { animation-play-state: paused; }

        /* unify the marks: one warm-ink tone at rest, full presence
           on hover with a subtle lift */
        .lt-logo {
          filter: brightness(0);
          opacity: 0.42;
          transition:
            opacity 0.45s cubic-bezier(0.33, 1, 0.68, 1),
            transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
          will-change: transform;
        }
        .lt-logo:hover {
          opacity: 0.92;
          transform: translateY(-4px);
        }

        /* soft edge fades — logos dissolve at the section edges */
        .lt-viewport {
          -webkit-mask-image: linear-gradient(
            to right, transparent, black 14%, black 86%, transparent);
          mask-image: linear-gradient(
            to right, transparent, black 14%, black 86%, transparent);
        }

        /* reduced motion: no drift — a calm static row instead */
        .lt-static { display: none; }
        @media (prefers-reduced-motion: reduce) {
          .lt-viewport { display: none; }
          .lt-static { display: flex; }
          .lt-logo { transition: none; }
        }
      `}</style>

      {/* Film grain — above the cream ground, below heading and logos */}
      <Noise patternAlpha={10} />

      <div className="relative z-20 mx-auto w-full max-w-[1480px] px-6 py-14 md:px-12 md:py-20">
        {/* ------------------------- heading --------------------------- */}
        <div className="lt-head text-center">
          <h2 className="font-heading font-thin not-italic text-[clamp(1.6rem,3.4vw,2.75rem)] leading-[1.1] tracking-[-0.01em] text-[#261f15]">
            Some Businesses Who <span className="text-[#a3843f]">Trust</span>{" "}
            LocalEyes
          </h2>
        </div>

        {/* screen readers get a clean sentence instead of a moving,
           duplicated strip */}
        <p className="sr-only">
          Trusted by {LOGOS.map((logo) => logo.name).join(", ")}.
        </p>

        <div className="lt-body mt-10 md:mt-12">
          {/* ---------------- the drifting marquee ---------------------
             aria-hidden: duplicated + moving content is noise for
             screen readers; the sr-only sentence above covers it. */}
          <div aria-hidden="true" className="lt-viewport overflow-hidden">
            <div className="lt-track flex w-max items-center">
              {[0, 1].map((half) => (
                <div key={half} className="flex items-center">
                  {MARQUEE_SET.map((logo, i) => (
                    <div
                      key={`${half}-${i}`}
                      className="shrink-0 px-8 md:px-12"
                    >
                      <Image
                        src={IMG(logo.src)}
                        alt={`${logo.name} logo`}
                        width={logo.width}
                        height={logo.height}
                        className={`lt-logo w-auto ${logo.size}`}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* ------------- reduced-motion static fallback --------------
             Same marks, no motion; hidden from screen readers for the
             same reason (the sr-only sentence is the accessible copy). */}
          <div
            aria-hidden="true"
            className="lt-static flex-wrap items-center justify-center gap-x-12 gap-y-8 md:gap-x-16"
          >
            {LOGOS.map((logo) => (
              <Image
                key={logo.name}
                src={IMG(logo.src)}
                alt={`${logo.name} logo`}
                width={logo.width}
                height={logo.height}
                className={`lt-logo w-auto ${logo.size}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
