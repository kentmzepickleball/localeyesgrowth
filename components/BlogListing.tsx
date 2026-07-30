"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, useMotionValue, useSpring } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { Noise } from "@/components/effects/Noise";
import type { BlogPostMeta } from "@/lib/blog-posts";

gsap.registerPlugin(ScrollTrigger);

/* ----------------------------------------------------------------------
   /blog — "The Journal" listing page
   Same light "paper rate card" tiles as the homepage teaser (components/
   sections/Blog.tsx), same pointer-tracked tilt, linking to the real
   /blog/[slug] article page. Posts come from lib/blog-posts.ts
   (content/blog/*.md) via a `posts` prop passed down from the Server
   Component page (this component can't read the filesystem itself).
   Paginates at 6 posts per page.
   ---------------------------------------------------------------------- */

const TILT_AMPLITUDE = 8;
const SPRING = { damping: 24, stiffness: 220, mass: 1 };
const POSTS_PER_PAGE = 6;

function JournalCard({ post, reduced }: { post: BlogPostMeta; reduced: boolean }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const rotateX = useSpring(useMotionValue(0), SPRING);
  const rotateY = useSpring(useMotionValue(0), SPRING);
  const lift = useSpring(0, SPRING);

  function handleMouseMove(e: React.MouseEvent<HTMLAnchorElement>) {
    const el = ref.current;
    if (!el || reduced) return;
    const rect = el.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;
    rotateX.set((offsetY / (rect.height / 2)) * -TILT_AMPLITUDE);
    rotateY.set((offsetX / (rect.width / 2)) * TILT_AMPLITUDE);
  }

  function handleMouseEnter() {
    if (reduced) return;
    lift.set(-6);
  }

  function handleMouseLeave() {
    rotateX.set(0);
    rotateY.set(0);
    lift.set(0);
  }

  return (
    <a
      href={`/blog/${post.slug}`}
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="le-journal-card group relative block h-full [perspective:1000px]"
    >
      <motion.div
        style={{ rotateX, rotateY, y: lift }}
        className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#c6a66a]/25 bg-[#f7f5e8] p-7 text-[#261f15] shadow-[0_1px_2px_rgba(0,0,0,0.12),0_28px_56px_-26px_rgba(38,31,21,0.35)] transition-shadow duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:shadow-[0_1px_2px_rgba(0,0,0,0.14),0_44px_84px_-26px_rgba(38,31,21,0.45)] sm:p-9"
      >
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 z-10 h-1 bg-gradient-to-r from-[#c6a66a]/50 via-[#c6a66a] to-[#c6a66a]/50"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-2.5 z-10 rounded-xl border border-[#261f15]/10"
        />

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

          <h2 className="mt-5 line-clamp-2 font-heading font-thin not-italic text-[1.35rem] leading-[1.2] tracking-[-0.01em] text-[#261f15] transition-colors duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:text-[#8a6f3d] sm:text-[1.5rem]">
            {post.title}
          </h2>

          <p className="mt-auto pt-6 font-sans text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#261f15]/45">
            {post.date}
            <span className="mx-2 text-[#8a6f3d]/70">✦</span>
            {post.readTime}
          </p>
        </div>
      </motion.div>
    </a>
  );
}

export default function BlogListing({ posts }: { posts: BlogPostMeta[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(false);
  const [page, setPage] = useState(1);
  const firstRender = useRef(true);

  const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));
  const pagePosts = posts.slice(
    (page - 1) * POSTS_PER_PAGE,
    page * POSTS_PER_PAGE,
  );

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const head = section.querySelector<HTMLElement>(".le-journal-head");
    const cards = section.querySelectorAll<HTMLElement>(".le-journal-card");
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

    tweens.push(
      gsap.fromTo(
        cards,
        { autoAlpha: 0, y: 40 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.95,
          stagger: 0.12,
          delay: 0.2,
          ease: "power3.out",
        },
      ),
    );

    return () => {
      tweens.forEach((tween) => tween.kill());
    };
  }, []);

  /* Quiet crossfade when the page changes — never on first paint,
     never under reduced motion; same easing family as the entrance. */
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const grid = gridRef.current;
    if (!grid) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const tween = gsap.fromTo(
      grid,
      { autoAlpha: 0, y: 16 },
      { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out" },
    );
    return () => {
      tween.kill();
    };
  }, [page]);

  function goToPage(next: number) {
    const clamped = Math.max(1, Math.min(totalPages, next));
    if (clamped === page) return;
    setPage(clamped);
    sectionRef.current
      ?.querySelector(".le-journal-head")
      ?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  }

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden pb-24 pt-40 md:pb-32 md:pt-48"
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

      <div className="relative z-20 mx-auto w-full max-w-[1480px] px-6 md:px-12">
        <div className="le-journal-head text-center">
          <p className="flex items-center justify-center gap-3 font-sans text-[0.62rem] font-semibold uppercase tracking-[0.3em] text-[#8a6f3d] sm:text-xs">
            <span aria-hidden="true" className="text-[0.8em]">
              ✦
            </span>
            The Journal
            <span aria-hidden="true" className="text-[0.8em]">
              ✦
            </span>
          </p>

          <h1 className="mx-auto mt-5 max-w-3xl font-heading font-thin not-italic text-[clamp(2.5rem,5.5vw,4.5rem)] leading-[1.05] tracking-[-0.01em] text-[#261f15]">
            Field notes for growing your{" "}
            <span className="text-[#8a6f3d] not-italic">booking calendar</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl font-sans text-sm leading-relaxed text-[#261f15]/65 sm:text-base">
            Practical local SEO breakdowns for coffee carts, mobile bars, and
            every kind of caterer — no fluff, just what&apos;s moving the
            needle for real operators.
          </p>
        </div>

        <div
          ref={gridRef}
          className="mt-14 grid grid-cols-1 gap-6 md:mt-20 md:grid-cols-3 md:gap-8"
        >
          {pagePosts.map((post) => (
            <JournalCard key={post.slug} post={post} reduced={reduced} />
          ))}
        </div>

        {totalPages > 1 && (
          <nav
            aria-label="Journal pagination"
            className="mt-14 flex items-center justify-center gap-3 md:mt-20"
          >
            <button
              type="button"
              onClick={() => goToPage(page - 1)}
              disabled={page === 1}
              aria-label="Previous page"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#261f15]/20 text-[#261f15] transition-colors duration-300 hover:border-[#8a6f3d] hover:text-[#8a6f3d] disabled:pointer-events-none disabled:opacity-30"
            >
              <ArrowUpRight className="h-4 w-4 -rotate-[135deg]" strokeWidth={1.5} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => goToPage(n)}
                aria-current={n === page ? "page" : undefined}
                className={`flex h-10 w-10 items-center justify-center rounded-full font-sans text-xs font-semibold transition-colors duration-300 ${
                  n === page
                    ? "bg-[#261f15] text-[#ededd5]"
                    : "text-[#261f15]/60 hover:bg-[#261f15]/10"
                }`}
              >
                {n}
              </button>
            ))}

            <button
              type="button"
              onClick={() => goToPage(page + 1)}
              disabled={page === totalPages}
              aria-label="Next page"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#261f15]/20 text-[#261f15] transition-colors duration-300 hover:border-[#8a6f3d] hover:text-[#8a6f3d] disabled:pointer-events-none disabled:opacity-30"
            >
              <ArrowUpRight className="h-4 w-4 rotate-45" strokeWidth={1.5} />
            </button>
          </nav>
        )}
      </div>
    </section>
  );
}
