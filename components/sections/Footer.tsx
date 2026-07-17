"use client";

import { ArrowUpRight } from "lucide-react";
import { Noise } from "@/components/effects/Noise";
import {
  useCalendly,
  CALENDLY_BOOKING_URL,
} from "../../components/sections/CalendlyModal";

/* ----------------------------------------------------------------------
   Footer — the last word, on light
   A cream closing band in three movements:
   1. The working row — the LE mark with its "Local SEO Experts" line
      and contact email on the left; on the right, one last nudge and
      a gold "Book a Call" pill in the site's button language.
   2. The brand statement — "LOCALEYES" set ENORMOUS, edge to edge,
      dissolving toward its bottom via a mask-image gradient (a true
      transparency fade, so it works over any background). The mark is
      decorative brand repetition (aria-hidden) — the real brand name
      lives in the legal line below. Tweak the fade via the gradient
      stops in .le-foot-mark below; the bottom of the glyphs is
      slightly cropped (negative margin inside overflow-hidden) so the
      mark reads as sinking into the page.
   3. The legal line — copyright plus the three policy links.
   - Links carry the site's underline language: a gold hairline that
     draws in from the left on hover (transform-only, GPU-friendly).
   - The wordmark is fully STATIC — no scroll animation, always
     visible — so it can never be left hidden by a missed scroll
     trigger, whatever scroll setup the host site uses.
   - The hero's vertical hairline grid runs behind everything, so the
     first and last sections of the page bookend with the same quiet
     editorial structure.
   - Grain sits ABOVE the cream ground, BELOW every word and link.
   - NO italics, no divider lines. Accessible: semantic <footer>, real
     links, visible gold focus rings, generous hit areas.
   Wire the placeholder hrefs below to the real pages.
   ---------------------------------------------------------------------- */

/* TODO: point these at the real destinations */
const CONTACT_EMAIL = "hello@localeyesgrowth.com";
const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "#privacy-policy" },
  { label: "Terms of Service", href: "#terms-of-service" },
  { label: "Cookies Settings", href: "#cookies-settings" },
];

export default function Footer() {
  const { open: openCalendly } = useCalendly();

  return (
    <footer className="relative w-full overflow-hidden bg-[#ededd5] text-[#261f15]">
      {/* Vertical hairlines — the hero's quiet editorial grid, behind
         everything */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 mx-auto flex w-full max-w-[1480px] justify-between px-6 md:px-12"
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className="h-full w-px bg-[#261f15]/[0.05]" />
        ))}
      </div>

      <style>{`
        /* the site's underline language — a gold hairline drawing in
           from the left; rest state is quiet, hover is full ink */
        .le-foot-link {
          position: relative;
          transition: color 0.45s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .le-foot-link::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          bottom: -3px;
          height: 1px;
          background: #a3843f;
          transform: scaleX(0);
          transform-origin: left center;
          transition: transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .le-foot-link:hover { color: #261f15; }
        .le-foot-link:hover::after { transform: scaleX(1); }

        /* THE FADE — tune the mark's dissolve here. Solid through the
           top stops, easing away through the lower ones; the last stop
           is where it reaches full transparency. */
        .le-foot-mark {
          -webkit-mask-image: linear-gradient(
            to bottom,
            black 0%,
            black 36%,
            rgba(0, 0, 0, 0.4) 68%,
            transparent 94%
          );
          mask-image: linear-gradient(
            to bottom,
            black 0%,
            black 36%,
            rgba(0, 0, 0, 0.4) 68%,
            transparent 94%
          );
        }

        @media (prefers-reduced-motion: reduce) {
          .le-foot-link, .le-foot-link::after { transition: none; }
          .le-foot-link:hover::after { transform: scaleX(0); }
        }
      `}</style>

      {/* Film grain — above the cream ground, below every word */}
      <Noise patternAlpha={9} />

      <div className="relative z-20 mx-auto w-full max-w-[1480px] px-6 pb-8 pt-16 md:px-12 md:pb-10 md:pt-24">
        {/* --------------------- the working row ----------------------- */}
        <div className="flex flex-col gap-12 md:flex-row md:items-start md:justify-between md:gap-16">
          {/* mark + signature + contact */}
          <div>
            <p className="font-heading text-3xl tracking-wide md:text-4xl">
              LE
            </p>
            <p className="mt-3 font-sans text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#261f15]/50 sm:text-xs">
              Local SEO Experts
            </p>
            <p className="mt-8 font-sans text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-[#261f15]/40">
              Contact
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="le-foot-link mt-1.5 inline-block py-1 font-sans text-sm text-[#261f15]/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a3843f]"
            >
              {CONTACT_EMAIL}
            </a>
          </div>

          {/* one last nudge + the pill — kept narrow on purpose so the
             line wraps into a 3–4 line editorial block */}
          <div className="md:max-w-[23rem] md:text-right">
            <p className="font-heading font-thin not-italic text-[clamp(1.5rem,2.6vw,2.1rem)] leading-[1.25] tracking-[-0.01em]">
              Made it this far? Do yourself a favor and click the button below
              to transform your monthly leads
            </p>
            {/* the header's button language: on hover the ink circle
               floods the pill, the icon chip inverts to gold, the
               arrow turns — same animation, footer colors */}
            <a
              href={CALENDLY_BOOKING_URL}
              onClick={(e) => {
                e.preventDefault();
                openCalendly();
              }}
              className="group/btn relative mt-7 inline-flex cursor-pointer items-center gap-3 overflow-hidden rounded-full bg-[#c6a66a] py-2 pl-7 pr-2 font-sans text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#261f15] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a3843f] sm:text-xs"
            >
              <span className="relative z-10 py-2 transition-colors duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/btn:text-[#ededd5]">
                Book a Call
              </span>
              <span className="relative flex h-10 w-10 shrink-0 items-center justify-center">
                {/* ink wash — slow flood in, quicker retreat out */}
                <span
                  aria-hidden="true"
                  className="absolute inset-0 scale-100 rounded-full bg-[#261f15] transition-transform duration-500 ease-[cubic-bezier(0.33,1,0.68,1)] group-hover/btn:scale-[12] group-hover/btn:duration-[1100ms]"
                />
                {/* icon chip — ink at rest, inverts to gold on hover */}
                <span
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full bg-[#261f15] transition-colors duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/btn:bg-[#c6a66a]"
                />
                <span className="relative z-10 flex rotate-0 will-change-transform transition-transform duration-700 ease-[cubic-bezier(0.34,1.2,0.4,1)] group-hover/btn:rotate-45">
                  <ArrowUpRight className="h-4 w-4 text-[#ededd5] transition-colors duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/btn:text-[#261f15]" />
                </span>
              </span>
            </a>
          </div>
        </div>

        {/* -------------------- the brand statement --------------------
           Decorative repetition — aria-hidden; the accessible brand
           name is in the legal line below. The wrapper crops the
           bottom of the glyphs (negative margin) so the faded mark
           sinks into the page. */}
        <div aria-hidden="true" className="mt-16 overflow-hidden md:mt-24">
          <p className="le-foot-mark -mb-[0.14em] whitespace-nowrap text-center font-heading font-thin not-italic uppercase leading-none tracking-[-0.03em] text-[clamp(2.9rem,13.4vw,13.2rem)] text-[#c6a66a]">
            LocalEyes
          </p>
        </div>

        {/* ------------------------ legal line ------------------------- */}
        <div className="mt-8 flex flex-col gap-3 font-sans text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-[#261f15]/40 sm:flex-row sm:items-center sm:justify-between md:mt-10">
          <p>
            &copy; {new Date().getFullYear()} LocalEyes Growth. All rights
            reserved.
          </p>
          <ul className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-8">
            {LEGAL_LINKS.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="le-foot-link inline-block py-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a3843f]"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
