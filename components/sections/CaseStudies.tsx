"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image, { type StaticImageData } from "next/image";

/* Your image imports — keep your actual paths */
import imgNyc from "@/public/nyc-01.webp";
import imgChicago from "@/public/chicago-01.webp";
import imgLa from "@/public/LA-01.webp";
import imgOrlando from "@/public/orlando-01.webp";
import imgDenver from "@/public/denver.webp";
import imgDallasRedefined from "@/public/redefined-dallas-01.webp";
import imgDallasEllie from "@/public/dallas-01.webp";

gsap.registerPlugin(ScrollTrigger);

/* ----------------------------------------------------------------------
   CaseStudies — "Real results we've achieved" awards index
   A dark editorial honors-list: each ranking is one entry in a
   hairline-ruled index, like an awards program.
   - Hovering an entry shows a cursor-following proof card (the Google
     screenshot). The card is hidden by mouseleave AND four safety nets:
     scroll (eased fade), section offscreen via IntersectionObserver,
     window blur / document mouseleave / pointercancel (hard reset) —
     so it can never get stuck on screen.
   - Desktop fine-pointer only; touch and reduced motion never enable it.
   - prefers-reduced-motion: everything renders static and legible.
   Add/remove case studies in the CASES array below.
   ---------------------------------------------------------------------- */

type CaseStudy = {
  keyword: string;
  city: string;
  client: string;
  image: StaticImageData;
};

const CASES: CaseStudy[] = [
  { keyword: "Coffee Catering", city: "NYC", client: "Anecho", image: imgNyc },
  {
    keyword: "Coffee Cart Catering",
    city: "Chicago",
    client: "North Village",
    image: imgChicago,
  },
  {
    keyword: "Coffee Catering",
    city: "LA",
    client: "Always Kind",
    image: imgLa,
  },
  {
    keyword: "Coffee Catering",
    city: "Orlando",
    client: "Take a Shot",
    image: imgOrlando,
  },
  {
    keyword: "Coffee Catering",
    city: "Denver",
    client: "Selah",
    image: imgDenver,
  },
  {
    keyword: "Coffee Catering",
    city: "Dallas",
    client: "Re:defined",
    image: imgDallasRedefined,
  },
  {
    keyword: "Mocktail Cart Catering",
    city: "Dallas",
    client: "Ellie & Juice",
    image: imgDallasEllie,
  },
];

export default function CaseStudies() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLOListElement>(null);

  /* Cursor-following proof card — the Google screenshot for the hovered
     entry. Same-size matted frame for every image; crossfades between
     entries; desktop pointer devices only, skipped for reduced motion. */
  const previewRef = useRef<HTMLDivElement>(null);
  const quickMove = useRef<{
    x: (value: number, start?: number) => void;
    y: (value: number, start?: number) => void;
  } | null>(null);
  const previewEnabled = useRef(false);
  const [active, setActive] = useState<number | null>(null);
  /* Real state (not just the ref) so the preview markup — and its 7
     images — never mounts at all on touch/reduced-motion devices, where
     this hover feature can't fire anyway. Avoids fetching every case-study
     image on mobile for a feature that's desktop-only. */
  const [previewSupported, setPreviewSupported] = useState(false);

  useEffect(() => {
    const finePointer = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    ).matches;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (!finePointer || reduced) return;
    previewEnabled.current = true;
    setPreviewSupported(true);
    return () => {
      previewEnabled.current = false;
    };
  }, []);

  /* Preview element only exists once previewSupported is true, so this
     only ever runs after that div (and gsap.set below) are in the DOM. */
  useEffect(() => {
    const preview = previewRef.current;
    if (!previewSupported || !preview) return;
    gsap.set(preview, { autoAlpha: 0, scale: 0.94, yPercent: -50 });
    quickMove.current = {
      x: gsap.quickTo(preview, "x", { duration: 0.55, ease: "power3.out" }),
      y: gsap.quickTo(preview, "y", { duration: 0.55, ease: "power3.out" }),
    };
    return () => {
      quickMove.current = null;
    };
  }, [previewSupported]);

  /* Keep the card beside the cursor: flip to the left near the right
     viewport edge, clamp vertically so it never clips top or bottom */
  const previewX = (clientX: number) => {
    const preview = previewRef.current;
    if (!preview) return clientX;
    const offset = 36;
    return clientX + offset + preview.offsetWidth > window.innerWidth - 24
      ? clientX - offset - preview.offsetWidth
      : clientX + offset;
  };

  const previewY = (clientY: number) => {
    const preview = previewRef.current;
    if (!preview) return clientY;
    const half = preview.offsetHeight / 2 + 16;
    return Math.min(Math.max(clientY, half), window.innerHeight - half);
  };

  const jumpPreview = (e: ReactMouseEvent<HTMLOListElement>) => {
    if (!previewEnabled.current || !quickMove.current) return;
    /* Passing the start value too makes quickTo jump instantly (a tween
       from x to x) without killing its internal tween — killTweensOf
       here would break subsequent quickTo resets */
    const x = previewX(e.clientX);
    const y = previewY(e.clientY);
    quickMove.current.x(x, x);
    quickMove.current.y(y, y);
  };

  const movePreview = (e: ReactMouseEvent<HTMLOListElement>) => {
    if (!previewEnabled.current || !quickMove.current) return;
    quickMove.current.x(previewX(e.clientX));
    quickMove.current.y(previewY(e.clientY));
  };

  const showPreview = (index: number) => {
    if (!previewEnabled.current || !previewRef.current) return;
    setActive(index);
    gsap.to(previewRef.current, {
      autoAlpha: 1,
      scale: 1,
      duration: 0.5,
      ease: "power3.out",
      overwrite: "auto",
    });
  };

  /* Silky fade-out. autoAlpha lands on opacity 0 + visibility hidden, and
     onComplete clears the active entry so the card is fully reset — the
     next hover starts from a clean, fresh state (no stale image). If a
     new hover starts mid-fade, overwrite:"auto" kills this tween (and its
     onComplete) so the crossfade wins. */
  const hidePreview = useCallback(() => {
    if (!previewEnabled.current || !previewRef.current) return;
    gsap.to(previewRef.current, {
      autoAlpha: 0,
      scale: 0.94,
      duration: 0.45,
      ease: "power3.out",
      overwrite: "auto",
      onComplete: () => setActive(null),
    });
  }, []);

  /* Hard reset — no animation. For cases where the card is (or should
     be) out of sight anyway: section scrolled offscreen, window blur,
     pointer cancelled, cursor left the document. overwrite:"auto" kills
     only tweens on these props (opacity/visibility/scale) — a blanket
     killTweensOf would also kill the quickTo x/y cursor-followers and
     permanently freeze the card's tracking. */
  const resetPreview = useCallback(() => {
    setActive(null);
    const preview = previewRef.current;
    if (!previewEnabled.current || !preview) return;
    gsap.set(preview, { autoAlpha: 0, scale: 0.94, overwrite: "auto" });
  }, []);

  /* Safety nets for every way the pointer can "escape" without firing
     mouseleave on the list — the cause of the stuck-preview bug:
     - any scroll (the card is position:fixed, so it would trail along)
     - the cursor exiting through the window edge / switching windows
     - pointercancel (touch/hybrid devices)
     - the section leaving the viewport entirely */
  useEffect(() => {
    if (!previewEnabled.current) return;

    const onScroll = () => hidePreview();
    window.addEventListener("scroll", onScroll, {
      passive: true,
      capture: true,
    });
    window.addEventListener("blur", resetPreview);
    window.addEventListener("pointercancel", resetPreview);
    document.documentElement.addEventListener("mouseleave", resetPreview);

    const section = sectionRef.current;
    let observer: IntersectionObserver | null = null;
    if (section) {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => !entry.isIntersecting)) resetPreview();
        },
        { threshold: 0 },
      );
      observer.observe(section);
    }

    return () => {
      window.removeEventListener("scroll", onScroll, { capture: true });
      window.removeEventListener("blur", resetPreview);
      window.removeEventListener("pointercancel", resetPreview);
      document.documentElement.removeEventListener("mouseleave", resetPreview);
      observer?.disconnect();
    };
  }, [hidePreview, resetPreview]);

  /* Staggered entrance — header first, then the entries roll in like
     film credits. Plays once; skipped entirely under reduced motion. */
  useEffect(() => {
    const header = headerRef.current;
    const list = listRef.current;
    if (!header || !list) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rows = list.querySelectorAll<HTMLElement>(".le-case");
    const tweens: gsap.core.Tween[] = [];

    tweens.push(
      gsap.fromTo(
        header,
        { autoAlpha: 0, y: 26 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: { trigger: header, start: "top 84%", once: true },
        },
      ),
    );

    tweens.push(
      gsap.fromTo(
        rows,
        { autoAlpha: 0, y: 28 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.09,
          ease: "power3.out",
          scrollTrigger: { trigger: list, start: "top 82%", once: true },
        },
      ),
    );

    return () => {
      tweens.forEach((tween) => {
        tween.scrollTrigger?.kill();
        tween.kill();
      });
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="case-studies"
      className="relative w-full overflow-hidden bg-[#261f15] text-[#ededd5]"
    >
      {/* Soft vignette — corners recede for quiet, expensive depth */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(120%_140%_at_50%_50%,transparent_55%,rgba(0,0,0,0.35)_100%)]"
      />

      {/* Faint gold aura behind the list — barely there */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(80%_60%_at_72%_38%,rgba(166,124,61,0.08),transparent_65%)]"
      />

      <div className="relative z-10 mx-auto w-full max-w-[1480px] px-6 py-24 md:px-12 md:py-32">
        {/* Section header */}
        <div ref={headerRef}>
          <p className="flex items-center gap-4 font-sans text-[0.62rem] font-semibold uppercase tracking-[0.3em] text-[#a67c3d] sm:text-xs">
            <span aria-hidden="true" className="text-[0.8em]">
              ✦
            </span>
            Case Studies
            <span aria-hidden="true" className="h-px flex-1 bg-[#ededd5]/10" />
          </p>

          <div className="mt-8 flex flex-col gap-5 md:mt-10 md:flex-row md:items-end md:justify-between md:gap-10">
            <h2 className="font-heading font-thin not-italic text-4xl leading-[1.08] tracking-[-0.01em] sm:text-5xl md:text-6xl">
              Real <span className="italic text-[#a67c3d]">results</span>{" "}
              we&rsquo;ve achieved
            </h2>
            <p className="shrink-0 font-sans text-[0.55rem] font-semibold uppercase tracking-[0.22em] text-[#ededd5]/50 sm:text-[0.6rem] md:pb-2">
              Noticeable from everywhere in the country
            </p>
          </div>
        </div>

        {/* The index — one hairline-ruled entry per ranking */}
        <ol
          ref={listRef}
          onMouseEnter={jumpPreview}
          onMouseMove={movePreview}
          onMouseLeave={hidePreview}
          className="le-cases mt-12 list-none border-t border-[#ededd5]/10 p-0 md:mt-16"
        >
          {CASES.map((entry, index) => (
            <li
              key={`${entry.city}-${entry.client}`}
              onMouseEnter={() => showPreview(index)}
              className="le-case group relative"
            >
              {/* Inner wrapper carries the hover-dim (see .le-case-inner in
                  globals.css) so it never fights the GSAP entrance on the li */}
              <div className="le-case-inner relative">
                <div className="grid grid-cols-[auto_1fr] items-baseline gap-x-5 py-6 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-2 sm:grid-cols-[4.5rem_1fr_auto] sm:gap-x-8 md:grid-cols-[6rem_1fr_auto] md:py-7">
                  {/* The rank — the proof, set large and thin in gold */}
                  <span className="font-heading font-thin not-italic text-3xl leading-none text-[#a67c3d] sm:text-4xl md:text-5xl">
                    #1
                  </span>

                  {/* Keyword + city — the city carries the display weight */}
                  <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="font-heading font-thin not-italic text-2xl leading-[1.1] tracking-[-0.01em] text-[#ededd5] transition-colors duration-500 sm:text-3xl md:text-[2.6rem]">
                      {entry.keyword}
                    </span>
                    <span className="font-heading font-thin italic text-2xl leading-[1.1] text-[#a67c3d] sm:text-3xl md:text-[2.6rem]">
                      {entry.city}
                    </span>
                  </span>

                  {/* Client — quiet secondary detail, wakes up on hover */}
                  <span className="col-start-2 font-sans text-[0.55rem] font-semibold uppercase tracking-[0.22em] text-[#ededd5]/55 transition-colors duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:text-[#a67c3d] sm:col-start-3 sm:justify-self-end sm:text-[0.6rem]">
                    <span aria-hidden="true" className="mr-2 text-[#a67c3d]/60">
                      ✦
                    </span>
                    {entry.client}
                  </span>
                </div>

                {/* Resting hairline + gold sweep that draws across on hover */}
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-px bg-[#ededd5]/10"
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-[#a67c3d]/70 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100"
                />
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* The proof card itself — a matted, gold-hairlined frame that
          drifts alongside the cursor; every screenshot sits in the same
          fixed-size frame, letterboxed on a matching paper mat.
          Only mounted at all once previewSupported is true (desktop, fine
          pointer, motion allowed) — on touch/reduced-motion devices this
          whole block, and its images, never enter the DOM. */}
      {previewSupported && (
        <div
          ref={previewRef}
          aria-hidden="true"
          style={{ visibility: "hidden" }}
          className="pointer-events-none fixed left-0 top-0 z-30 hidden w-[27rem] rounded-lg border border-[#a67c3d]/35 bg-[#f4f3f0] p-2.5 shadow-[0_32px_64px_-20px_rgba(0,0,0,0.55)] lg:block"
        >
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[0.3rem]">
            {CASES.map((entry, index) => (
              <Image
                key={`${entry.city}-${entry.client}`}
                src={entry.image}
                alt=""
                fill
                sizes="336px"
                quality={75}
                className={`object-contain transition-opacity duration-500 ease-out ${
                  active === index ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
          </div>
          <div className="flex items-center justify-between px-1 pb-0.5 pt-2">
            <span className="font-sans text-[0.5rem] font-semibold uppercase tracking-[0.22em] text-[#261f15]/60">
              Google — Live Proof
            </span>
            <span className="font-sans text-[0.5rem] font-semibold uppercase tracking-[0.22em] text-[#a67c3d]">
              ✦ #1
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
