"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight, Lock, Monitor, Smartphone, X } from "lucide-react";
import MagicBento from "@/components/MagicBento";
import { Noise } from "@/components/effects/Noise";

gsap.registerPlugin(ScrollTrigger);

/* ----------------------------------------------------------------------
   WebsitePreviews — homepage showcase of real client sites
   A hairline-ruled index, same visual language as CaseStudies' awards
   list (dark ink, thin-serif numerals, gold sweep-in on hover) — no
   screenshots, so there's nothing here to download or decode. Click a
   row and it opens a full-screen preview with the REAL site live in an
   iframe (device-toggleable) plus a short write-up beside it.
   Every entry needs a real, confirmed liveUrl — this component doesn't
   support a photo/no-link fallback state, so don't add a project here
   without one.
   ---------------------------------------------------------------------- */

type WebsiteProject = {
  name: string;
  category: string;
  location: string;
  blurb: string;
  liveUrl: string;
  /* Real screenshot — the grid tiles are photo-forward now, this is
     what actually shows on the card. Also used as the preview-modal
     fallback for sites that refuse to be framed (see `embeddable`). */
  image: string;
  /* Each card's soft-focus glow bobble — same technique as the plan
     glows on the Pricing rate card, reusing colors already established
     there instead of introducing new ones. Only used as a fallback if
     a project ever ships without an image. */
  bobbleColor: string;
  /* Set to false only when the live site itself sends an X-Frame-Options
     or CSP frame-ancestors header that blocks embedding (confirmed via
     `curl -I` on the real URL — there's no reliable way to detect this
     from the browser at runtime, since a blocked frame throws the same
     cross-origin SecurityError as one that loaded fine). Onward's
     onward-coffee.webflow.io staging domain sends
     `frame-ancestors 'self' *.webflow.com *.webflow.io webflow.com`,
     which excludes our own origin. When false, the preview modal shows
     the real screenshot instead of a blank "refused to connect" iframe.
     Omit (defaults to true) for anything that embeds fine. */
  embeddable?: boolean;
};

const WEBSITE_PROJECTS: WebsiteProject[] = [
  {
    name: "Arbour Coffee Co.",
    category: "Premium Coffee Catering",
    location: "Raleigh, NC",
    blurb:
      "Handcrafted espresso from a traveling cart, styled for weddings and corporate gatherings across Raleigh and the Carolinas.",
    liveUrl: "https://www.arbourcoffeeco.com/",
    image: "/arbour-coffee-co-website-homepage.webp",
    bobbleColor: "#a8703a",
  },
  {
    name: "Onward Coffee",
    category: "Specialty Coffee Catering",
    location: "Huntsville, AL",
    blurb:
      "A mobile coffee cart bringing barista-crafted specialty drinks to weddings, corporate events, and private celebrations across North Alabama.",
    liveUrl: "https://onward-coffee.webflow.io/",
    image: "/onward-coffee-website-homepage.webp",
    bobbleColor: "#4a6b8a",
    embeddable: false,
  },
  {
    name: "Social Graze",
    category: "Charcuterie & Grazing Tables",
    location: "Sacramento, CA",
    blurb:
      "Grazing tables and charcuterie boards for weddings, corporate events, and milestone celebrations around Sacramento.",
    liveUrl: "https://socialgrazecart.com/",
    image: "/website-project-02.webp",
    bobbleColor: "#b2883c",
  },
  {
    name: "Stiir",
    category: "Mobile Cocktail Bar",
    location: "New Jersey & NYC",
    blurb:
      "A luxury mobile cocktail bar and professional bartending service for weddings, corporate events, and private parties across New Jersey and NYC.",
    liveUrl: "https://stiirbar.com/",
    image: "/stiir-website-homepage.webp",
    bobbleColor: "#75804a",
  },
  {
    name: "Serve Coffee",
    category: "Specialty Coffee Catering",
    location: "New York, NY",
    blurb:
      "A mobile espresso bar bringing personalized hospitality to weddings, corporate events, and film sets across Manhattan, Brooklyn, and Queens.",
    liveUrl: "https://www.servecoffee.nyc/",
    image: "/serve-coffee-website-homepage.webp",
    bobbleColor: "#c6a66a",
  },
  {
    name: "Re:defined",
    category: "Coffee Cart Catering",
    location: "Dallas–Fort Worth, TX",
    blurb:
      "A mobile espresso bar and coffee cart catering for weddings, corporate events, and brand activations across Dallas–Fort Worth.",
    liveUrl: "https://www.redefinedcoffeehouse.com/",
    image: "/redefined-coffeehouse-website-homepage.webp",
    bobbleColor: "#8a6f3d",
  },
];

function hostnameOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default function WebsitePreviews() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastActiveRef = useRef<HTMLElement | null>(null);
  const closeTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(motion.matches);
    const update = () => setReduced(motion.matches);
    motion.addEventListener("change", update);
    return () => motion.removeEventListener("change", update);
  }, []);

  const open = useCallback((index: number) => {
    /* The preview modal's desktop/mobile device toggle only makes sense
       for a desktop visitor previewing how a site looks elsewhere — on
       an actual phone there's no room for that layout and nothing to
       toggle to, so just send them straight to the real site instead. */
    if (window.matchMedia("(max-width: 767px)").matches) {
      window.open(
        WEBSITE_PROJECTS[index].liveUrl,
        "_blank",
        "noopener,noreferrer",
      );
      return;
    }

    window.clearTimeout(closeTimer.current);
    setOpenIndex(index);
    setDevice("desktop");
    lastActiveRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    setMounted(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });
  }, []);

  const close = useCallback(() => {
    setVisible(false);
    closeTimer.current = window.setTimeout(
      () => {
        setMounted(false);
        setOpenIndex(null);
        lastActiveRef.current?.focus();
        lastActiveRef.current = null;
      },
      reduced ? 0 : 500,
    );
  }, [reduced]);

  useEffect(() => {
    if (!mounted) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        return;
      }
      if (e.key === "Tab") {
        const dialog = dialogRef.current;
        if (!dialog) return;
        const focusables = Array.from(
          dialog.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          ),
        );
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (!first || !last) return;
        const active = document.activeElement;
        if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        } else if (!dialog.contains(active)) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    closeBtnRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [mounted, close]);

  /* Staggered entrance — same rhythm as CaseStudies: header first, then
     rows roll in. Plays once; skipped under reduced motion or on mobile
     (faster paint, less JS work on the slowest devices). */
  useEffect(() => {
    const header = headerRef.current;
    const list = listRef.current;
    if (!header || !list) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(max-width: 767px)").matches) return;

    const rows = list.querySelectorAll<HTMLElement>(".magic-bento-card");
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

  const project = openIndex !== null ? WEBSITE_PROJECTS[openIndex] : null;
  const iframeBlocked = project?.embeddable === false;

  return (
    <section
      ref={sectionRef}
      id="websites"
      className="relative w-full overflow-hidden bg-[#ededd5] text-[#261f15]"
    >
      {/* Vertical hairlines — same quiet editorial grid as the Hero */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 mx-auto flex w-full max-w-[1480px] justify-between px-6 md:px-12"
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className="h-full w-px bg-[#261f15]/[0.07]" />
        ))}
      </div>

      {/* Same film grain strength as the Hero — subtle, not heavy */}
      <Noise
        patternAlpha={10}
        patternRefreshInterval={reduced ? 1_000_000_000 : 2}
      />

      <div className="relative z-20 mx-auto w-full max-w-[1480px] px-6 py-20 md:px-12 md:py-28">
        <div
          ref={headerRef}
          className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between md:gap-10"
        >
          <div>
            <p className="flex items-center gap-4 font-sans text-[0.62rem] font-semibold uppercase tracking-[0.3em] text-[#a67c3d] sm:text-xs">
              <span aria-hidden="true" className="text-[0.8em]">
                ✦
              </span>
              Our Work
            </p>
            <h2 className="mt-6 max-w-2xl font-heading font-thin not-italic text-[clamp(2.4rem,5.5vw,4.5rem)] leading-[1.05] tracking-[-0.01em] text-[#261f15]">
              Websites built to <span className="text-[#a67c3d]">rank</span>, not
              just look good
            </h2>
          </div>
          <a
            href="/websites"
            className="group/link inline-flex shrink-0 items-center gap-2 font-sans text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#261f15]/60 transition-colors duration-300 hover:text-[#261f15]"
          >
            See how we build them
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-500 ease-[cubic-bezier(0.34,1.2,0.4,1)] group-hover/link:translate-x-1 group-hover/link:-translate-y-1" />
          </a>
        </div>

        {/* A grid of dark, glowing bento cards on the light section —
           structurally nothing like CaseStudies' hairline list: cards
           instead of rows, a cursor-tracked gold glow/spotlight and
           subtle tilt instead of an underline sweep, dark tiles set
           against the light page instead of a dark section. Adapted
           from React Bits' MagicBento (see components/MagicBento.jsx) —
           event-driven hover effects only, no canvas, auto-disabled on
           mobile. */}
        <div ref={listRef} className="mt-12 md:mt-16">
          <MagicBento
            items={WEBSITE_PROJECTS.map((p, i) => ({
              number: String(i + 1).padStart(2, "0"),
              meta: p.location,
              title: p.name,
              description: p.category,
              image: p.image,
              bobbleColor: p.bobbleColor,
            }))}
            onCardClick={open}
          />
        </div>
      </div>

      {mounted && project && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={`${project.name} preview`}
          className={`fixed inset-0 z-[200] flex flex-col overflow-hidden bg-[#ededd5] text-[#261f15] transition-[opacity,transform] duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
            reduced ? "!duration-0" : ""
          } ${
            visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          {/* project details + controls on the left, live preview on the
             right — the preview gets the full height of the modal */}
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto md:flex-row md:overflow-hidden">
            <div className="flex shrink-0 flex-col gap-6 px-5 py-8 sm:px-8 sm:py-10 md:w-[26%] md:justify-center md:overflow-y-auto">
              <div className="flex items-center justify-between gap-3">
                <div
                  role="group"
                  aria-label="Preview device"
                  className="inline-flex items-center gap-1 rounded-full border border-[#261f15]/15 bg-[#f7f5e8] p-1"
                >
                  <button
                    type="button"
                    onClick={() => setDevice("desktop")}
                    aria-pressed={device === "desktop"}
                    aria-label="Preview as desktop"
                    className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-colors duration-300 ${
                      device === "desktop"
                        ? "bg-[#261f15] text-[#ededd5]"
                        : "text-[#261f15]/45 hover:text-[#261f15]"
                    }`}
                  >
                    <Monitor className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDevice("mobile")}
                    disabled={iframeBlocked}
                    aria-pressed={device === "mobile"}
                    aria-label="Preview as mobile"
                    className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-40 ${
                      device === "mobile"
                        ? "bg-[#261f15] text-[#ededd5]"
                        : "text-[#261f15]/45 hover:text-[#261f15]"
                    }`}
                  >
                    <Smartphone className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </div>

                <button
                  ref={closeBtnRef}
                  type="button"
                  onClick={close}
                  aria-label="Close preview"
                  className="group/x flex shrink-0 cursor-pointer items-center gap-2 rounded-full border border-[#261f15]/20 bg-[#f7f5e8] py-2 pl-4 pr-2 font-sans text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[#261f15]/70 transition-colors duration-300 hover:border-[#261f15]/25 hover:text-[#261f15] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a67c3d]"
                >
                  Close
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#261f15]/8">
                    <X
                      strokeWidth={1.5}
                      className="h-3.5 w-3.5 transition-transform duration-500 ease-[cubic-bezier(0.34,1.2,0.4,1)] group-hover/x:rotate-90"
                    />
                  </span>
                </button>
              </div>

              <div className="flex flex-col gap-4">
                <p className="font-sans text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-[#a67c3d]">
                  {project.category} · {project.location}
                </p>
                <h3 className="font-heading font-thin not-italic text-[clamp(2rem,3.6vw,2.8rem)] leading-[1.1] tracking-[-0.01em] text-[#261f15]">
                  {project.name}
                </h3>
                <p className="font-sans text-sm leading-relaxed text-[#261f15]/65 sm:text-[0.95rem]">
                  {project.blurb}
                </p>
              </div>

              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group/visit inline-flex w-fit cursor-pointer items-center gap-3 overflow-hidden rounded-full bg-[#c6a66a] py-2.5 pl-6 pr-2 font-sans text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[#261f15] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c6a66a]"
              >
                <span className="relative z-10 transition-colors duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/visit:text-[#ededd5]">
                  Visit live site
                </span>
                <span className="relative flex h-8 w-8 shrink-0 items-center justify-center">
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 scale-100 rounded-full bg-[#3a3020] transition-transform duration-500 ease-[cubic-bezier(0.33,1,0.68,1)] group-hover/visit:scale-[16] group-hover/visit:duration-1100"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 rounded-full bg-[#3a3020] transition-colors duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/visit:bg-[#ededd5]"
                  />
                  <span className="relative z-10 flex rotate-0 transition-transform duration-700 ease-[cubic-bezier(0.34,1.2,0.4,1)] group-hover/visit:rotate-45">
                    <ArrowUpRight className="h-3.5 w-3.5 text-[#ededd5] transition-colors duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/visit:text-[#3a3020]" />
                  </span>
                </span>
              </a>
            </div>

            {/* browser-chrome preview — the real site, live, interactive.
               Rounded window corners (unlike the square grid) because
               this is standing in for an actual browser/OS window. */}
            <div className="relative flex min-h-[420px] flex-1 flex-col bg-[#e6e3cf] p-2 sm:p-3 md:h-full">
              <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[#261f15]/12 bg-[#f7f5e8] shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_1px_2px_rgba(38,31,21,0.05),0_28px_56px_-28px_rgba(38,31,21,0.4)]">
                <div className="flex shrink-0 items-center gap-3 border-b border-[#261f15]/12 bg-[#ededd5] px-5 py-3.5">
                  <span className="flex gap-1.5" aria-hidden="true">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#e0645c]/70" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#e6b450]/70" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#6bb865]/70" />
                  </span>
                  <span className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#261f15]/5 px-3 py-1.5 font-sans text-[0.65rem] tracking-[0.02em] text-[#261f15]/50 shadow-[inset_0_1px_2px_rgba(38,31,21,0.06)]">
                    <Lock className="h-2.5 w-2.5 shrink-0" strokeWidth={2} />
                    <span className="truncate">{hostnameOf(project.liveUrl)}</span>
                  </span>
                  {iframeBlocked && (
                    <span className="shrink-0 font-sans text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-[#a67c3d]">
                      Homepage preview
                    </span>
                  )}
                </div>
                <div className="relative flex min-h-0 flex-1 justify-center overflow-auto bg-[#e6e3cf]">
                  <div
                    className={`relative h-full shrink-0 bg-white shadow-[0_0_40px_-8px_rgba(38,31,21,0.2)] transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      device === "mobile" ? "w-[390px]" : "w-full"
                    }`}
                  >
                    {iframeBlocked ? (
                      <div className="absolute inset-0 overflow-y-auto bg-white">
                        <div className="relative aspect-1280/800 w-full">
                          <Image
                            src={project.image}
                            alt={`${project.name} homepage`}
                            fill
                            sizes="(min-width: 768px) 74vw, 100vw"
                            className="object-cover object-top"
                          />
                        </div>
                      </div>
                    ) : (
                      <iframe
                        src={project.liveUrl}
                        title={`${project.name} — live, interactive preview`}
                        className="h-full w-full border-0"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
