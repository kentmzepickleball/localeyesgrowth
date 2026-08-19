"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "lucide-react";
import { Noise } from "@/components/effects/Noise";
import type { BlogPostMeta } from "@/lib/blog-posts";

gsap.registerPlugin(ScrollTrigger);

/* ----------------------------------------------------------------------
   Blog — "The Journal"
   A cream editorial header (same vocabulary as Pricing/Capabilities)
   over three light "paper rate card" tiles — same gilded-top-edge +
   inset letterpress frame as the Pricing section's card, so the premium
   card language stays consistent across the site.
   The distinctive touch: each card tracks the cursor with a subtle 3D
   tilt on mousemove, built with GSAP (not the `motion` package — this
   section already loads GSAP for the entrance animation below, so the
   tilt reuses it instead of pulling in a second animation library for
   one effect).
   - Scroll-triggered entrance (header, then cards staggered); plays
     once; fully static under prefers-reduced-motion (tilt physics are
     skipped entirely, not just the entrance).
   - Cards link to their real /blog/[slug] article page.
   - NO italics anywhere; ✦ is the only ornament.
   Posts come from lib/blog-posts.ts (content/blog/*.md) via a `posts`
   prop — this is a client component and can't read the filesystem
   itself, so the Server Component page passes the data down.
   ---------------------------------------------------------------------- */

const TILT_AMPLITUDE = 8;

function BlogCard({
  post,
  reduced,
}: {
  post: BlogPostMeta;
  reduced: boolean;
}) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  function handleMouseMove(e: MouseEvent<HTMLAnchorElement>) {
    const link = linkRef.current;
    const card = cardRef.current;
    if (!link || !card || reduced) return;
    const rect = link.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;
    gsap.to(card, {
      rotateX: (offsetY / (rect.height / 2)) * -TILT_AMPLITUDE,
      rotateY: (offsetX / (rect.width / 2)) * TILT_AMPLITUDE,
      duration: 0.4,
      ease: "power2.out",
      transformPerspective: 1000,
    });
  }

  function handleMouseEnter() {
    if (reduced || !cardRef.current) return;
    gsap.to(cardRef.current, { y: -6, duration: 0.4, ease: "power2.out" });
  }

  function handleMouseLeave() {
    if (!cardRef.current) return;
    gsap.to(cardRef.current, {
      rotateX: 0,
      rotateY: 0,
      y: 0,
      duration: 0.5,
      ease: "power2.out",
    });
  }

  return (
    <a
      href={`/blog/${post.slug}`}
      ref={linkRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="le-blog-card group relative block h-full [perspective:1000px]"
    >
      <div
        ref={cardRef}
        className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#c6a66a]/25 bg-[#f7f5e8] p-7 text-[#261f15] shadow-[0_1px_2px_rgba(0,0,0,0.12),0_28px_56px_-26px_rgba(38,31,21,0.35)] transition-shadow duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:shadow-[0_1px_2px_rgba(0,0,0,0.14),0_44px_84px_-26px_rgba(38,31,21,0.45)] sm:p-8"
      >
        {/* gilded top edge — brighter than a hairline, the card's one
           accent stroke */}
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 z-10 h-1 bg-gradient-to-r from-[#c6a66a]/50 via-[#c6a66a] to-[#c6a66a]/50"
        />
        {/* inset letterpress frame — a hairline plate border floating just inside the sheet */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-2.5 z-10 rounded-xl border border-[#261f15]/10"
        />

        {/* soft gold bloom — deepens on hover */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -left-16 -top-20 h-56 w-56 rounded-full bg-[#c6a66a]/15 blur-3xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-125"
        />

        <div className="relative z-10 flex h-full flex-col">
          <div className="flex items-center justify-between gap-3">
            <span className="font-sans text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-[#8a6f3d]">
              {post.category}
            </span>
            {post.author && (
              <span className="font-sans text-[0.56rem] font-semibold uppercase tracking-[0.16em] text-[#261f15]/35">
                {post.author}
              </span>
            )}
          </div>

          {/* the pull-stat — a data callout instead of the usual
             icon-then-excerpt template, since these posts are built
             around one striking number each */}
          {post.statValue ? (
            <div className="mt-6 flex items-baseline gap-3">
              <p className="font-heading font-thin not-italic text-[3.1rem] leading-none tracking-[-0.02em] text-[#8a6f3d] sm:text-[3.5rem]">
                {post.statValue}
              </p>
              <p className="max-w-[9.5rem] font-sans text-[0.72rem] font-semibold leading-snug text-[#261f15]/60">
                {post.statLabel}
              </p>
            </div>
          ) : (
            <p className="mt-6 line-clamp-3 font-sans text-sm leading-relaxed text-[#261f15]/65">
              {post.excerpt}
            </p>
          )}

          <span aria-hidden="true" className="mt-6 h-px w-full bg-[#261f15]/10" />

          <h3 className="mt-5 line-clamp-2 font-heading font-thin not-italic text-[1.35rem] leading-[1.2] tracking-[-0.01em] text-[#261f15] transition-colors duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:text-[#8a6f3d] sm:text-[1.5rem]">
            {post.title}
          </h3>

          <div className="mt-auto flex items-center justify-between gap-4 pt-6">
            <p className="font-sans text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#261f15]/45">
              {post.date}
              <span className="mx-2 text-[#8a6f3d]/70">✦</span>
              {post.readTime}
            </p>
            <span className="relative flex h-8 w-8 shrink-0 items-center justify-center">
              <span
                aria-hidden="true"
                className="absolute inset-0 rounded-full bg-[#4a3421] scale-0 transition-transform duration-500 ease-[cubic-bezier(0.33,1,0.68,1)] group-hover:scale-100"
              />
              <ArrowUpRight
                className="relative z-10 h-4 w-4 text-[#261f15] transition-transform duration-500 ease-[cubic-bezier(0.34,1.2,0.4,1)] group-hover:rotate-45 group-hover:text-[#ededd5]"
                strokeWidth={1.5}
              />
            </span>
          </div>
        </div>
      </div>
    </a>
  );
}

export default function Blog({ posts }: { posts: BlogPostMeta[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    /* mobile: skip entrance animation setup entirely — faster paint, less JS work on the slowest devices */
    if (window.matchMedia("(max-width: 767px)").matches) return;

    const head = section.querySelector<HTMLElement>(".le-blog-head");
    const cards = section.querySelectorAll<HTMLElement>(".le-blog-card");
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
            scrollTrigger: { trigger: head, start: "top 84%", once: true },
          },
        ),
      );
    }

    tweens.push(
      gsap.fromTo(
        cards,
        { autoAlpha: 0, y: 40 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.95,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: { trigger: section, start: "top 72%", once: true },
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
      id="blog"
      className="relative w-full overflow-hidden bg-[#ededd5] text-[#261f15]"
    >
      <Noise patternAlpha={9} />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 mx-auto flex w-full max-w-[1480px] justify-between px-6 md:px-12"
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className="h-full w-px bg-[#261f15]/[0.07]" />
        ))}
      </div>

      <div className="relative z-20 mx-auto w-full max-w-[1480px] px-6 py-20 md:px-12 md:py-28">
        <div className="le-blog-head">
          <p className="flex items-center gap-4 font-sans text-[0.62rem] font-semibold uppercase tracking-[0.3em] text-[#8a6f3d] sm:text-xs">
            <span aria-hidden="true" className="text-[0.8em]">
              ✦
            </span>
            The Journal
            <span aria-hidden="true" className="h-px flex-1 bg-[#261f15]/10" />
          </p>

          <div className="mt-8 flex flex-col gap-6 md:mt-10 md:flex-row md:items-end md:justify-between md:gap-12">
            <h2 className="max-w-3xl font-heading font-thin not-italic text-4xl leading-[1.08] tracking-[-0.01em] sm:text-5xl md:text-6xl">
              Field notes for growing your{" "}
              <span className="text-[#8a6f3d] not-italic">booking calendar</span>
            </h2>
            <p className="max-w-sm shrink-0 font-sans text-sm leading-relaxed text-[#261f15]/60 md:pb-2 md:text-[0.95rem]">
              Practical local SEO breakdowns for coffee carts, mobile bars,
              and every kind of caterer — no fluff, just what&apos;s moving
              the needle for real operators.
            </p>
          </div>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 md:mt-16 md:gap-8 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogCard key={post.slug} post={post} reduced={reduced} />
          ))}
        </div>

        <div className="mt-12 flex justify-center md:mt-16">
          <a
            href="/blog"
            className="group/btn relative inline-flex cursor-pointer items-center justify-center gap-3 overflow-hidden rounded-full border border-[#261f15]/25 py-1 pl-6 pr-1 font-sans text-[0.7rem] uppercase tracking-[0.12em] text-[#261f15] transition-colors duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:gap-4 sm:py-1.5 sm:pl-8 sm:pr-1.5 sm:text-xs"
          >
            <span className="relative z-10 py-1 transition-colors duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/btn:text-white">
              View All Articles
            </span>
            <span className="relative flex h-10 w-10 shrink-0 items-center justify-center sm:h-11 sm:w-11">
              {/* bloom — grows to flood the pill, stays brown */}
              <span
                aria-hidden="true"
                className="absolute inset-0 scale-100 rounded-full bg-[#4a3421] transition-transform duration-500 ease-[cubic-bezier(0.33,1,0.68,1)] group-hover/btn:scale-[25] group-hover/btn:duration-[1100ms]"
              />
              {/* icon-chip background — inverts to white so the icon never
                 disappears once the bloom above has flooded the pill */}
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
    </section>
  );
}
