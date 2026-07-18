"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* ----------------------------------------------------------------------
   React Bits "ScrollReveal" (JS-CSS variant), ported to TypeScript and
   extended:
   - highlightWords / highlightClassName — accent specific words (matched
     case-insensitively, trailing punctuation ignored)
   - baseY — words also rise up from this yPercent offset as they reveal
     (0 = stock behavior)
   - prefers-reduced-motion — skips all animation; copy renders static
     and fully legible
   - cleanup only kills the triggers this instance created (the stock
     version kills every ScrollTrigger on the page)
   The scroll-scrubbed animation itself is stock: the block un-rotates
   from `baseRotation`, and each word fades from `baseOpacity` to 1 and
   un-blurs from `blurStrength`px as it scrolls into view.
   ---------------------------------------------------------------------- */

type ScrollRevealProps = {
  children: string;
  scrollContainerRef?: RefObject<HTMLElement>;
  enableBlur?: boolean;
  baseOpacity?: number;
  baseRotation?: number;
  blurStrength?: number;
  containerClassName?: string;
  textClassName?: string;
  rotationEnd?: string;
  wordAnimationEnd?: string;
  highlightWords?: string[];
  highlightClassName?: string;
  /* Words that get an extra weight bump on top of highlightClassName —
     e.g. making just "#1" a little heavier than the rest of an accented
     phrase, without affecting the other highlighted words. */
  boldWords?: string[];
  boldClassName?: string;
  baseY?: number;
};

export default function ScrollReveal({
  children,
  scrollContainerRef,
  enableBlur = true,
  baseOpacity = 0.1,
  baseRotation = 3,
  blurStrength = 4,
  containerClassName = "",
  textClassName = "",
  rotationEnd = "bottom bottom",
  wordAnimationEnd = "bottom bottom",
  highlightWords = [],
  highlightClassName = "",
  boldWords = [],
  boldClassName = "le-word-bold",
  baseY = 0,
}: ScrollRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const splitText = useMemo(() => {
    const accents = new Set(highlightWords.map((w) => w.toLowerCase()));
    const bolds = new Set(boldWords.map((w) => w.toLowerCase()));
    /* A word "matches" if it matches with trailing punctuation stripped,
       so "source." still matches "source". */
    const matches = (word: string, set: Set<string>) =>
      set.has(word.toLowerCase()) ||
      set.has(word.toLowerCase().replace(/[.,!?;:—–-]+$/, ""));

    return children.split(/(\s+)/).map((word, index) => {
      if (word.match(/^\s+$/)) return word;
      const classes = ["word"];
      if (matches(word, accents)) classes.push(highlightClassName);
      if (matches(word, bolds)) classes.push(boldClassName);
      return (
        <span className={classes.join(" ")} key={index}>
          {word}
        </span>
      );
    });
  }, [children, highlightWords, highlightClassName, boldWords, boldClassName]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    /* Reduced motion: no rotation, no fade, no blur — text stays static */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const scroller =
      scrollContainerRef && scrollContainerRef.current
        ? scrollContainerRef.current
        : window;

    const tweens: gsap.core.Tween[] = [];

    tweens.push(
      gsap.fromTo(
        el,
        { transformOrigin: "0% 50%", rotate: baseRotation },
        {
          ease: "none",
          rotate: 0,
          scrollTrigger: {
            trigger: el,
            scroller,
            start: "top bottom",
            end: rotationEnd,
            scrub: true,
          },
        },
      ),
    );

    const wordElements = el.querySelectorAll<HTMLElement>(".word");

    /* Opacity/position and blur used to be two separate tweens with
       identical scrollTrigger config (same trigger/scroller/start/end) —
       merged into one so GSAP only tracks a single ScrollTrigger instead
       of two redundant ones for the word reveal. Same values, same
       timing, half the scroll-tracking overhead. */
    tweens.push(
      gsap.fromTo(
        wordElements,
        {
          opacity: baseOpacity,
          yPercent: baseY,
          ...(enableBlur ? { filter: `blur(${blurStrength}px)` } : null),
          willChange: enableBlur ? "opacity, transform, filter" : "opacity, transform",
        },
        {
          ease: "none",
          opacity: 1,
          yPercent: 0,
          ...(enableBlur ? { filter: "blur(0px)" } : null),
          stagger: 0.05,
          scrollTrigger: {
            trigger: el,
            scroller,
            start: "top bottom-=20%",
            end: wordAnimationEnd,
            scrub: true,
          },
        },
      ),
    );

    return () => {
      tweens.forEach((tween) => {
        tween.scrollTrigger?.kill();
        tween.kill();
      });
    };
  }, [
    scrollContainerRef,
    enableBlur,
    baseRotation,
    baseOpacity,
    rotationEnd,
    wordAnimationEnd,
    blurStrength,
    baseY,
  ]);

  return (
    <div ref={containerRef} className={`scroll-reveal ${containerClassName}`}>
      <p className={`scroll-reveal-text ${textClassName}`}>{splitText}</p>
    </div>
  );
}
