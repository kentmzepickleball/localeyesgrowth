"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
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
  { label: "Coffee Catering Calculator", href: CALCULATOR_PATH },
  { label: "Valor", href: "/valor" },
];

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
      <div className="relative mx-auto w-full max-w-[1480px] px-6 md:px-12 flex justify-between items-center">
        {/* Wordmark */}
        <a href="/" className="flex items-center text-[#261f15]">
          <span className="font-heading text-2xl md:text-3xl tracking-wide">
            LE
          </span>
        </a>

        {/* CTA + mobile toggle, nav grouped right */}
        <div className="flex items-center justify-end gap-3">
          <nav className="hidden lg:flex items-center gap-8 mr-6">
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
            className="lg:hidden inline-flex cursor-pointer items-center justify-center w-10 h-10 rounded-full border border-[#261f15]/30 text-[#261f15]"
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
          className={`lg:hidden absolute top-full left-4 right-4 mt-2 rounded-2xl bg-[#ededd5]/95 backdrop-blur-md shadow-[0_24px_54px_-24px_rgba(38,31,21,0.5)] overflow-hidden transition-all duration-300 ease-out origin-top ${
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
                className="inline-flex items-center gap-1.5 px-3 py-3.5 font-sans text-xs tracking-[0.08em] uppercase text-[#261f15]/85 border-b border-[#261f15]/10 last:border-b-0 hover:text-[#4a3421] transition-colors"
              >
                <span className="text-[0.6rem] text-[#261f15]/45">
                  [{i + 1}]
                </span>
                {link.label}
              </a>
            ))}
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
