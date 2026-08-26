"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, ChevronDown, Menu, X } from "lucide-react";
import {
  useCalendly,
  CALENDLY_BOOKING_URL,
} from "../../components/sections/CalendlyModal";

/* absolute hrefs so the nav works from ANY page, not just the homepage.
     VERIFY the calculator route matches where you mounted the page —
     e.g. app/coffee-cart-pricing-calculator/page.tsx */
const CALCULATOR_PATH = "/coffee-cart-pricing-calculator"; /* VERIFY */

const NAV_LINKS = [
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
  /* Points straight at episode 1 — there's no /podcast index yet.
     Repoint at /podcast once a real index page exists (episode 2+). */
  { label: "Podcast", href: "/podcast/episode-1-catering-seo-lessons" },
  { label: "About", href: "/about" },
  { label: "Coffee Catering Calculator", href: CALCULATOR_PATH },
];

const INDUSTRY_LINKS = [
  { label: "Coffee Carts", href: "/coffee-cart-seo" },
  { label: "Mobile Bars", href: "/mobile-bar-seo" },
  { label: "Charcuterie Catering", href: "/charcuterie-catering-seo" },
];

/* VERIFY: these pages don't exist yet — placeholder routes so the nav
   structure is in place ahead of the pages themselves (explicit call,
   not an oversight). Wire each href to the real page once it's built. */
const SERVICE_LINKS = [
  { label: "SEO", href: "/seo" },
  { label: "Websites", href: "/websites" },
  { label: "Ads", href: "/ads" },
];

type DropdownLink = { label: string; href: string };

/* Shared open/close state for a click-triggered dropdown: outside-click
   and Escape both close it. Used by both the Industries and Services
   dropdowns so that logic only lives in one place. */
function useDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setIsOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen]);

  return { isOpen, setIsOpen, ref };
}

/* Desktop dropdown — same visual language as the other top-level nav
   links (numbered, uppercase, tracked), opens a small panel below with
   a gold-hairline hover per item (see .le-dropdown-link in the <style>
   block below). */
function NavDropdown({
  label,
  number,
  links,
}: {
  label: string;
  number: number;
  links: DropdownLink[];
}) {
  const { isOpen, setIsOpen, ref } = useDropdown();

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="group inline-flex cursor-pointer items-center gap-1.5 font-sans text-xs tracking-[0.08em] uppercase text-[#261f15]/70 transition-colors duration-500 hover:text-[#261f15]"
      >
        <span className="text-[0.6rem] text-[#261f15]/45 transition-colors duration-500 group-hover:text-[#261f15]">
          [{number}]
        </span>
        {label}
        <ChevronDown
          className={`h-3 w-3 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <div
        className={`absolute left-1/2 top-full mt-3 w-56 -translate-x-1/2 rounded-none border border-[#261f15]/10 bg-[#ededd5] p-2 shadow-[0_24px_54px_-24px_rgba(38,31,21,0.5)] transition-all duration-300 ease-out origin-top ${
          isOpen ? "visible scale-100 opacity-100" : "invisible scale-95 opacity-0"
        }`}
      >
        {links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            onClick={() => setIsOpen(false)}
            className="le-dropdown-link relative flex items-center gap-2 px-3 py-2.5 font-sans text-xs tracking-[0.08em] uppercase text-[#261f15]/70 transition-colors duration-500 hover:text-[#261f15]"
          >
            <span aria-hidden="true" className="text-[0.75em] text-[#a3843f]">
              ✦
            </span>
            {link.label}
          </a>
        ))}
      </div>
    </div>
  );
}

/* Mobile equivalent — expands in place (an accordion) rather than a
   nested drawer, since a flyout dropdown is awkward at this width. */
function MobileNavAccordion({
  label,
  number,
  links,
  onNavigate,
}: {
  label: string;
  number: number;
  links: DropdownLink[];
  onNavigate: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        className="flex items-center justify-between gap-1.5 border-b border-[#261f15]/10 px-3 py-3.5 font-sans text-xs uppercase tracking-[0.08em] text-[#261f15]/85 transition-colors hover:text-[#4a3421]"
      >
        <span className="flex items-center gap-1.5">
          <span className="text-[0.6rem] text-[#261f15]/45">[{number}]</span>
          {label}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden border-b border-[#261f15]/10">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => {
                setIsOpen(false);
                onNavigate();
              }}
              className="flex items-center gap-2 py-3 pl-11 pr-3 font-sans text-xs uppercase tracking-[0.08em] text-[#261f15]/70 transition-colors hover:text-[#4a3421]"
            >
              <span aria-hidden="true" className="text-[0.75em] text-[#a3843f]">
                ✦
              </span>
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </>
  );
}

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { open: openCalendly } = useCalendly();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 py-4 md:py-5 border-b transition-[background-color,border-color] duration-500 ease-out ${
        isScrolled
          ? "bg-[#ededd5]/10 backdrop-blur-md border-[#261f15]/10"
          : "bg-transparent border-transparent"
      }`}
    >
      <style>{`
        /* dropdown items — a gold hairline draws in from the left on
           hover (same underline language as the footer's .le-foot-link) */
        .le-dropdown-link::after {
          content: "";
          position: absolute;
          left: 12px;
          right: 12px;
          bottom: 4px;
          height: 1px;
          background: #a3843f;
          transform: scaleX(0);
          transform-origin: left center;
          transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .le-dropdown-link:hover::after {
          transform: scaleX(1);
        }
        @media (prefers-reduced-motion: reduce) {
          .le-dropdown-link::after {
            transition: none;
          }
        }
      `}</style>
      <div className="relative mx-auto w-full max-w-[1480px] px-6 md:px-12 flex justify-between items-center">
        {/* Wordmark */}
        <a href="/" className="flex items-center text-[#261f15]">
          <span className="font-heading text-2xl md:text-3xl tracking-wide">
            LE
          </span>
        </a>

        {/* CTA + mobile toggle, nav grouped right */}
        <div className="flex items-center justify-end gap-3">
          <nav className="hidden xl:flex items-center gap-8 mr-6">
            {NAV_LINKS.map((link, i) => (
              <a
                key={link.label}
                href={link.href}
                className="group inline-flex items-center gap-1.5 font-sans text-xs tracking-[0.08em] uppercase text-[#261f15]/70 hover:text-[#261f15] transition-colors duration-500"
              >
                <span className="text-[0.6rem] text-[#261f15]/45 group-hover:text-[#261f15] transition-colors duration-500">
                  [{i + 1}]
                </span>
                <span className="relative block overflow-hidden">
                  <span className="block transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:-translate-y-full">
                    {link.label}
                  </span>
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-full block transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:-translate-y-full"
                  >
                    {link.label}
                  </span>
                </span>
              </a>
            ))}

            <NavDropdown label="Industries" number={NAV_LINKS.length + 1} links={INDUSTRY_LINKS} />
            <NavDropdown label="Services" number={NAV_LINKS.length + 2} links={SERVICE_LINKS} />
          </nav>

          {/* Luxury CTA — solid gold floods the pill on hover, icon chip inverts to white */}
          <a
            href={CALENDLY_BOOKING_URL}
            onClick={(e) => {
              e.preventDefault();
              openCalendly();
            }}
            className="group/btn relative hidden sm:inline-flex cursor-pointer items-center gap-3 overflow-hidden rounded-full border border-[#261f15]/25 pl-5 pr-1 py-1 font-sans text-xs tracking-[0.12em] uppercase text-[#261f15] transition-colors duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          >
            <span className="relative z-10 py-0.5 transition-colors duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/btn:text-white">
              Book a Call
            </span>
            <span className="relative flex items-center justify-center w-8 h-8 shrink-0">
              {/* solid gold wash — slow bloom in, quicker retreat out */}
              <span
                aria-hidden="true"
                className="absolute inset-0 rounded-full bg-[#4a3421] scale-100 transition-transform duration-500 ease-[cubic-bezier(0.33,1,0.68,1)] group-hover/btn:scale-[12] group-hover/btn:duration-[1100ms]"
              />
              {/* icon chip — gold at rest, inverts to white on hover */}
              <span
                aria-hidden="true"
                className="absolute inset-0 rounded-full bg-[#4a3421] transition-colors duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/btn:bg-white"
              />
              <span className="relative z-10 flex rotate-0 transition-transform duration-700 ease-[cubic-bezier(0.34,1.2,0.4,1)] group-hover/btn:rotate-45 will-change-transform">
                <ArrowUpRight className="w-3.5 h-3.5 text-[#ededd5] transition-colors duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/btn:text-[#4a3421]" />
              </span>
            </span>
          </a>

          <button
            className="xl:hidden inline-flex cursor-pointer items-center justify-center w-10 h-10 rounded-full border border-[#261f15]/30 text-[#261f15]"
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((v) => !v)}
          >
            {isMenuOpen ? (
              <X className="w-4 h-4" />
            ) : (
              <Menu className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        <div
          className={`xl:hidden absolute top-full left-4 right-4 mt-2 rounded-2xl bg-[#ededd5]/95 backdrop-blur-md shadow-[0_24px_54px_-24px_rgba(38,31,21,0.5)] overflow-hidden transition-all duration-300 ease-out origin-top ${
            isMenuOpen
              ? "opacity-100 scale-100 visible"
              : "opacity-0 scale-95 invisible"
          }`}
        >
          <nav className="flex flex-col p-4">
            {NAV_LINKS.map((link, i) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="inline-flex items-center gap-1.5 px-3 py-3.5 font-sans text-xs tracking-[0.08em] uppercase text-[#261f15]/85 border-b border-[#261f15]/10 hover:text-[#4a3421] transition-colors"
              >
                <span className="text-[0.6rem] text-[#261f15]/45">
                  [{i + 1}]
                </span>
                {link.label}
              </a>
            ))}

            <MobileNavAccordion
              label="Industries"
              number={NAV_LINKS.length + 1}
              links={INDUSTRY_LINKS}
              onNavigate={() => setIsMenuOpen(false)}
            />
            <MobileNavAccordion
              label="Services"
              number={NAV_LINKS.length + 2}
              links={SERVICE_LINKS}
              onNavigate={() => setIsMenuOpen(false)}
            />

            <a
              href={CALENDLY_BOOKING_URL}
              onClick={(e) => {
                e.preventDefault();
                setIsMenuOpen(false);
                openCalendly();
              }}
              className="mt-4 inline-flex cursor-pointer items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#4a3421] text-white font-sans text-xs tracking-[0.2em] uppercase"
            >
              Book a Call
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
