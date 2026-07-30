"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, ArrowUpRight, Check, Copy, Minus, Plus, X } from "lucide-react";
import type { BlogPostMeta } from "@/lib/blog-posts";
import { useGrowthDiagnostic } from "@/components/growth-diagnostic/GrowthDiagnosticProvider";

const FONT_SCALE_MIN = 0.85;
const FONT_SCALE_MAX = 1.3;
const FONT_SCALE_STEP = 0.1;

gsap.registerPlugin(ScrollTrigger);

/* ----------------------------------------------------------------------
   /blog/[slug] — the article itself
   A cream editorial page: category pill + big serif H1 + date/read-time,
   then the markdown body styled to the same brand vocabulary as every
   other section (gold links, Pricing-style ledger tables, gold-marker
   lists). No Noise here — long-form reading wants a calm, quiet ground,
   not grain, and the column is a touch wider than the default page copy
   width for a more comfortable line length.
   Interactive wrinkles:
   - Every article's closing CTA links to "/growth-diagnostic", which
     isn't a real route — it's the Growth Diagnostic quiz modal, opened
     globally via GrowthDiagnosticProvider/useGrowthDiagnostic (same
     provider the Hero and ClosingCta CTAs use). Intercepted here to
     open that modal instead of 404ing.
   - A thin gold reading-progress bar tracks scroll position, fixed to
     the top of the viewport — direct DOM writes on scroll, no React
     state, so it doesn't re-render the article on every pixel.
   - Images get a click-to-expand lightbox that writes itself into the
     URL as a hash (#image=<encoded src>) the moment it opens, and reads
     that hash back on load — so the popup has a real, shareable,
     bookmarkable address instead of being pure client-side state that
     vanishes on refresh. The footer button copies that address; posts
     don't reference any images yet, but this is what fires the moment
     one does.
   The leading "# Title" line in the markdown source is stripped —
   the frontmatter title renders once, in the header block below.
   ---------------------------------------------------------------------- */

function stripLeadingH1(content: string): string {
  return content.replace(/^\s*#\s+.+\n+/, "");
}

export default function BlogArticle({
  meta,
  content,
}: {
  meta: BlogPostMeta;
  content: string;
}) {
  const articleRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const { open: openQuiz } = useGrowthDiagnostic();
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [fontScale, setFontScale] = useState(1);

  const bumpFontScale = (direction: 1 | -1) => {
    setFontScale((s) =>
      Math.round(
        Math.min(FONT_SCALE_MAX, Math.max(FONT_SCALE_MIN, s + direction * FONT_SCALE_STEP)) * 100,
      ) / 100,
    );
  };

  /* Opening the lightbox writes #image=<encoded src> onto the current
     URL (pushState — a real history entry, not just a scroll anchor)
     so the popup itself is a real, shareable, bookmarkable address:
     paste the link, land straight on that image already open. Closing
     strips the hash back off. */
  const openLightbox = (src: string) => {
    setLightboxSrc(src);
    const url = new URL(window.location.href);
    url.hash = `image=${encodeURIComponent(src)}`;
    window.history.pushState(null, "", url);
  };

  const closeLightbox = () => {
    setLightboxSrc(null);
    const url = new URL(window.location.href);
    url.hash = "";
    window.history.pushState(null, "", url);
  };

  const copyViewUrl = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  };

  /* Deep-link support — land on the article with #image=... already
     in the URL (shared link, bookmark, back/forward) and the lightbox
     opens itself to match. */
  useEffect(() => {
    const applyFromHash = () => {
      const match = window.location.hash.match(/^#image=(.+)$/);
      setLightboxSrc(match ? decodeURIComponent(match[1]) : null);
    };
    applyFromHash();
    window.addEventListener("hashchange", applyFromHash);
    window.addEventListener("popstate", applyFromHash);
    return () => {
      window.removeEventListener("hashchange", applyFromHash);
      window.removeEventListener("popstate", applyFromHash);
    };
  }, []);

  useEffect(() => {
    const article = articleRef.current;
    if (!article) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const head = article.querySelector<HTMLElement>(".le-article-head");
    const body = article.querySelector<HTMLElement>(".le-article-body");
    const tweens: gsap.core.Tween[] = [];

    if (head) {
      tweens.push(
        gsap.fromTo(
          head,
          { autoAlpha: 0, y: 26 },
          { autoAlpha: 1, y: 0, duration: 1, ease: "power3.out" },
        ),
      );
    }
    if (body) {
      tweens.push(
        gsap.fromTo(
          body,
          { autoAlpha: 0, y: 22 },
          { autoAlpha: 1, y: 0, duration: 1, delay: 0.15, ease: "power3.out" },
        ),
      );
    }

    return () => {
      tweens.forEach((tween) => tween.kill());
    };
  }, []);

  /* Reading progress — direct style writes, no state, so scrolling a
     long article never triggers a React re-render. */
  useEffect(() => {
    const bar = progressRef.current;
    if (!bar) return;

    const update = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(1, Math.max(0, scrollTop / docHeight)) : 0;
      bar.style.transform = `scaleX(${progress})`;
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  useEffect(() => {
    if (!lightboxSrc) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxSrc]);

  const markdownComponents: Components = {
    h2: ({ children }) => (
      <h2 className="mt-14 font-heading font-thin not-italic text-[1.9em] leading-[1.15] tracking-[-0.01em] text-[#261f15] sm:text-[2.2em]">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-10 font-heading font-thin not-italic text-[1.35em] leading-[1.25] tracking-[-0.005em] text-[#261f15]">
        {children}
      </h3>
    ),
    p: ({ children }) => (
      <p className="mt-5 font-sans text-[1.05em] leading-[1.75] text-[#261f15]/80">
        {children}
      </p>
    ),
    a: ({ href, children }) => {
      if (href === "/growth-diagnostic") {
        return (
          <a
            href={href}
            onClick={(e) => {
              e.preventDefault();
              openQuiz();
            }}
            className="cursor-pointer text-[#8a6f3d] underline decoration-[#8a6f3d]/30 underline-offset-4 transition-colors duration-300 hover:text-[#6b552f] hover:decoration-[#6b552f]"
          >
            {children}
          </a>
        );
      }
      return (
        <a
          href={href}
          className="text-[#8a6f3d] underline decoration-[#8a6f3d]/30 underline-offset-4 transition-colors duration-300 hover:text-[#6b552f] hover:decoration-[#6b552f]"
        >
          {children}
        </a>
      );
    },
    strong: ({ children }) => (
      <strong className="font-semibold text-[#261f15]">{children}</strong>
    ),
    ul: ({ children }) => (
      <ul className="mt-5 flex list-disc flex-col gap-2 pl-5 marker:text-[#c6a66a]">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="mt-5 flex list-decimal flex-col gap-2 pl-5 marker:font-semibold marker:text-[#8a6f3d]">
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="pl-1 font-sans text-[1.05em] leading-[1.7] text-[#261f15]/80">
        {children}
      </li>
    ),
    table: ({ children }) => (
      <div className="le-article-table-scroll mt-8 overflow-x-auto rounded-2xl border border-[#c6a66a]/25">
        <table className="w-full min-w-[560px] border-collapse text-left">{children}</table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="bg-[#261f15] text-[#ededd5]">{children}</thead>
    ),
    th: ({ children }) => (
      <th className="whitespace-nowrap px-3 py-2.5 font-sans text-[0.62em] font-semibold uppercase tracking-[0.16em] sm:px-5 sm:py-3">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="border-t border-[#261f15]/8 px-3 py-3 font-sans text-[0.875em] leading-relaxed text-[#261f15]/80 sm:px-5 sm:py-4">
        {children}
      </td>
    ),
    tr: ({ children }) => <tr className="odd:bg-[#f7f5e8]">{children}</tr>,
    blockquote: ({ children }) => (
      <blockquote className="mt-6 border-l-2 border-[#c6a66a]/50 pl-5 font-sans text-[1.05em] not-italic text-[#261f15]/70">
        {children}
      </blockquote>
    ),
    img: ({ src, alt }) => {
      if (typeof src !== "string") return null;
      return (
        <button
          type="button"
          onClick={() => openLightbox(src)}
          className="group/img mt-8 block w-full cursor-zoom-in overflow-hidden rounded-2xl border border-[#c6a66a]/25"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt ?? ""}
            className="w-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/img:scale-[1.03]"
          />
        </button>
      );
    },
  };

  return (
    <section
      ref={articleRef}
      className="relative w-full overflow-hidden bg-[#ededd5] pb-24 pt-40 text-[#261f15] md:pb-32 md:pt-48"
    >
      {/* Wide tables (common in these posts) get a real horizontal
         scrollbar on mobile instead of the page bleeding sideways —
         styled gold/thin so scrolling reads as designed, not as
         overflow spilling out. */}
      <style>{`
        .le-article-table-scroll {
          scrollbar-width: thin;
          scrollbar-color: #c6a66a transparent;
        }
        .le-article-table-scroll::-webkit-scrollbar {
          height: 6px;
        }
        .le-article-table-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .le-article-table-scroll::-webkit-scrollbar-thumb {
          background-color: #c6a66a;
          border-radius: 999px;
        }
      `}</style>

      {/* reading progress — thin gold line, fixed to the viewport top */}
      <div
        aria-hidden="true"
        className="fixed left-0 top-0 z-50 h-[3px] w-full bg-[#261f15]/[0.06]"
      >
        <div
          ref={progressRef}
          className="h-full w-full origin-left bg-[#c6a66a]"
          style={{ transform: "scaleX(0)" }}
        />
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 mx-auto flex w-full max-w-[1480px] justify-between px-6 md:px-12"
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className="h-full w-px bg-[#261f15]/[0.07]" />
        ))}
      </div>

      <div className="relative z-20 mx-auto w-full max-w-[960px] px-6 md:px-12">
        <a
          href="/blog"
          className="group inline-flex items-center gap-2 font-sans text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[#261f15]/50 transition-colors duration-300 hover:text-[#8a6f3d]"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-1" />
          The Journal
        </a>

        <div className="le-article-head mt-8">
          <span className="inline-flex w-fit rounded-full bg-[#c6a66a]/15 px-3 py-1 font-sans text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-[#8a6f3d]">
            {meta.category}
          </span>

          <h1 className="mt-5 font-heading font-thin not-italic text-[clamp(2.2rem,4.8vw,3.4rem)] leading-[1.08] tracking-[-0.01em] text-[#261f15]">
            {meta.title}
          </h1>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
            <p className="font-sans text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#261f15]/45">
              {meta.author && (
                <>
                  By {meta.author}
                  <span className="mx-2 text-[#8a6f3d]/70">✦</span>
                </>
              )}
              {meta.date}
              <span className="mx-2 text-[#8a6f3d]/70">✦</span>
              {meta.readTime}
            </p>

            {/* text-size controls — nobody should have to strain to
               read a 3,000-word guide on a phone in bright sun */}
            <div className="flex items-center gap-1.5">
              <span className="mr-1 font-sans text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-[#261f15]/40">
                Text
              </span>
              <button
                type="button"
                onClick={() => bumpFontScale(-1)}
                disabled={fontScale <= FONT_SCALE_MIN}
                aria-label="Decrease text size"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#261f15]/20 text-[#261f15]/70 transition-colors duration-300 hover:border-[#8a6f3d] hover:text-[#8a6f3d] disabled:pointer-events-none disabled:opacity-30"
              >
                <Minus className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
              <button
                type="button"
                onClick={() => bumpFontScale(1)}
                disabled={fontScale >= FONT_SCALE_MAX}
                aria-label="Increase text size"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#261f15]/20 text-[#261f15]/70 transition-colors duration-300 hover:border-[#8a6f3d] hover:text-[#8a6f3d] disabled:pointer-events-none disabled:opacity-30"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>

        <article
          className="le-article-body mt-12"
          style={{ fontSize: `${fontScale}rem` }}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {stripLeadingH1(content)}
          </ReactMarkdown>
        </article>

        <div className="mt-16 border-t border-[#261f15]/10 pt-10">
          <a
            href="/blog"
            className="group/btn relative inline-flex cursor-pointer items-center justify-center gap-3 overflow-hidden rounded-full border border-[#261f15]/25 py-1 pl-6 pr-1 font-sans text-[0.7rem] uppercase tracking-[0.12em] text-[#261f15] transition-colors duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:gap-4 sm:py-1.5 sm:pl-8 sm:pr-1.5 sm:text-xs"
          >
            <span className="relative z-10 py-1 transition-colors duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/btn:text-white">
              More From The Journal
            </span>
            <span className="relative flex h-10 w-10 shrink-0 items-center justify-center sm:h-11 sm:w-11">
              <span
                aria-hidden="true"
                className="absolute inset-0 scale-100 rounded-full bg-[#4a3421] transition-transform duration-500 ease-[cubic-bezier(0.33,1,0.68,1)] group-hover/btn:scale-[25] group-hover/btn:duration-[1100ms]"
              />
              <span
                aria-hidden="true"
                className="absolute inset-0 rounded-full bg-[#4a3421] transition-colors duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/btn:bg-white"
              />
              <span className="relative z-10 flex rotate-0 will-change-transform transition-transform duration-700 ease-[cubic-bezier(0.34,1.2,0.4,1)] group-hover/btn:rotate-45">
                <ArrowUpRight className="h-[1.15rem] w-[1.15rem] text-[#ededd5] transition-colors duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/btn:text-[#4a3421]" />
              </span>
            </span>
          </a>
        </div>
      </div>

      {lightboxSrc && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-[#261f15]/90 p-6 backdrop-blur-sm"
          onClick={closeLightbox}
        >
          <button
            type="button"
            aria-label="Close"
            onClick={closeLightbox}
            className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full border border-[#ededd5]/25 text-[#ededd5] transition-colors duration-300 hover:border-[#c6a66a] hover:text-[#c6a66a]"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxSrc}
            alt=""
            className="max-h-[80vh] max-w-full rounded-lg object-contain shadow-[0_60px_120px_-30px_rgba(0,0,0,0.6)]"
            onClick={(e) => e.stopPropagation()}
          />

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              copyViewUrl();
            }}
            className="absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-[#ededd5]/25 bg-[#261f15] px-5 py-2.5 font-sans text-xs font-semibold uppercase tracking-[0.14em] text-[#ededd5] transition-colors duration-300 hover:border-[#c6a66a] hover:text-[#c6a66a]"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" strokeWidth={2} />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" strokeWidth={1.5} />
                Copy Link to This View
              </>
            )}
          </button>
        </div>
      )}
    </section>
  );
}
