"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Star } from "lucide-react";
import Image from "next/image";
import { Noise } from "@/components/effects/Noise";

gsap.registerPlugin(ScrollTrigger);

const IMG = (path: string) => `/${path.replace(/^\//, "")}`;

export default function ValorTestimonial() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const parts = [
      section.querySelector<HTMLElement>(".le-valor-t-head"),
      section.querySelector<HTMLElement>(".le-valor-t-card"),
    ].filter((part): part is HTMLElement => part !== null);

    const tweens = parts.map((part, i) =>
      gsap.fromTo(
        part,
        { autoAlpha: 0, y: 40 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1.2,
          delay: i * 0.18,
          ease: "power3.out",
          scrollTrigger: { trigger: section, start: "top 78%", once: true },
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
      className="relative z-0 w-full overflow-hidden bg-[#ededd5] py-24 text-[#261f15] md:py-36"
    >
      <Noise patternAlpha={10} />

      {/* Vertical hairlines — continuing the hero's quiet column grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 mx-auto flex w-full max-w-[1480px] justify-between px-6 md:px-12"
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="h-full w-px bg-gradient-to-b from-transparent via-[#261f15]/15 to-transparent"
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1480px] px-6 md:px-12">
        <div className="le-valor-t-head">
          <p className="font-sans text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-[#c6a66a] sm:text-xs">
            <span aria-hidden="true" className="mr-3 text-[0.8em]">
              ✦
            </span>
            Proven Results
          </p>
          <div className="mt-5 flex items-end gap-8 lg:gap-12">
            <h2 className="max-w-3xl font-heading font-thin not-italic text-[clamp(1.9rem,3.4vw,3.1rem)] leading-[1.12] tracking-[-0.01em] text-[#261f15]">
              Finally Crush Google &amp; Rank At The Top For{" "}
              <span className="text-[#8a6f3d] not-italic">
                Coffee Cart Catering
              </span>{" "}
              &ldquo;Near&nbsp;Me&rdquo;
            </h2>
            <div
              aria-hidden="true"
              className="mb-4 hidden flex-1 items-center gap-4 md:flex"
            >
              <span className="h-px flex-1 bg-gradient-to-r from-[#c9932b]/50 via-[#261f15]/15 to-transparent" />
              <span className="text-[0.6rem] text-[#c9932b]/70">✦</span>
            </div>
          </div>
        </div>

        <div className="le-valor-t-card relative mx-auto mt-14 w-full max-w-3xl md:mt-20">
          <figure className="relative rounded-[4px] border border-[#261f15]/10 bg-[#f6f2e3] px-7 py-14 shadow-[0_40px_80px_-36px_rgba(38,31,21,0.45)] sm:px-14 sm:py-16">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-3 rounded-[2px] border border-[#c9932b]/45 sm:inset-4"
            />
            <span
              aria-hidden="true"
              className="absolute left-1/2 top-3 -translate-x-1/2 -translate-y-1/2 bg-[#f6f2e3] px-3 text-base leading-none text-[#c9932b] sm:top-4"
            >
              ✦
            </span>

            <div className="relative flex flex-col items-center text-center">
              {/* stars — one accessible image, five filled gold stars */}
              <div
                role="img"
                aria-label="5 out of 5 stars"
                className="flex items-center gap-1.5"
              >
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star
                    key={i}
                    aria-hidden="true"
                    className="h-4 w-4 text-[#c9932b]"
                    fill="currentColor"
                    strokeWidth={0}
                  />
                ))}
              </div>

              {/* the quote — a true IvyPresto pull-quote */}
              <blockquote className="mt-8 max-w-2xl font-heading font-thin not-italic text-[clamp(1.3rem,2.4vw,1.75rem)] leading-[1.5] text-[#261f15]/90">
                &ldquo;Two weeks ago we released our new catering page guided by
                LocalEyes and we were receiving 1-2 catering inquiries per day,
                and now we&rsquo;re receiving anywhere in the range of{" "}
                <span className="text-[#8a6f3d]">
                  5-7 catering inquiries per day
                </span>{" "}
                just from SEO&rdquo;
              </blockquote>

              {/* short gold hairline — letterpress divider */}
              <span
                aria-hidden="true"
                className="mt-9 h-px w-12 bg-[#c9932b]/60"
              />
            </div>

            {/* attribution — centered, like a letterpress signature;
               a DIRECT child of <figure>, as the HTML spec requires */}
            <figcaption className="relative mt-8 flex flex-col items-center text-center">
              <Image
                src={IMG("/co-founder.webp")}
                alt="Riley W., Co-Founder of Valor Coffee"
                width={128}
                height={141}
                className="h-14 w-14 rounded-full border border-[#261f15]/10 object-cover object-top ring-2 ring-[#c9932b]/35"
              />
              <p className="mt-4 font-sans text-sm font-semibold text-[#261f15]">
                Riley W.
              </p>
              <p className="mt-1 font-sans text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-[#8a6f3d]">
                Co-Founder, Valor Coffee
              </p>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
