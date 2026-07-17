"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function BackToTop({ threshold = 480 }: { threshold?: number }) {
  const [visible, setVisible] = useState(false);
  const ticking = useRef(false);

  useEffect(() => {
    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        setVisible(window.scrollY > threshold);
        ticking.current = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  const scrollToTop = () => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    /* release focus so it never sits inside the soon-hidden button */
    (document.activeElement as HTMLElement | null)?.blur();
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      tabIndex={visible ? 0 : -1}
      aria-hidden={visible ? undefined : true}
      className={`group fixed bottom-6 right-6 z-40 flex h-[5.25rem] w-[5.25rem] cursor-pointer items-center justify-center rounded-full border border-[#261f15]/15 bg-[#ededd5]/90 shadow-[0_18px_45px_-18px_rgba(38,31,21,0.45)] backdrop-blur-sm transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-[#261f15]/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a3843f] md:bottom-10 md:right-10 md:h-[5.75rem] md:w-[5.75rem] ${
        visible
          ? "translate-y-0 scale-100 opacity-100"
          : "pointer-events-none translate-y-4 scale-90 opacity-0"
      }`}
    >
      {/* the ring inscription — static, pure ornament, hidden from readers */}
      <svg
        aria-hidden="true"
        viewBox="0 0 100 100"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <path
            id="le-btt-circle"
            d="M 50,50 m -36.5,0 a 36.5,36.5 0 1,1 73,0 a 36.5,36.5 0 1,1 -73,0"
          />
        </defs>
        <text
          className="fill-[#4a3421]/70 font-sans text-[8px] font-semibold uppercase transition-colors duration-500 group-hover:fill-[#261f15]"
          style={{ letterSpacing: "0.32em" }}
        >
          <textPath
            href="#le-btt-circle"
            textLength="229"
            lengthAdjust="spacingAndGlyphs"
          >
            Back to top ✦ Back to top ✦{" "}
          </textPath>
        </text>
      </svg>

      {/* the chip — warm brown at rest, blooms gold on hover */}
      <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-[#4a3421] transition-colors duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:bg-[#a3843f] md:h-10 md:w-10">
        <ArrowUp className="h-4 w-4 text-[#ededd5] transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-0.5 group-hover:text-[#261f15]" />
      </span>
    </button>
  );
}
