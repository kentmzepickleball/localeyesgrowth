"use client";

import { useEffect, useState, useSyncExternalStore, type ReactNode, type RefObject } from "react";

/* Bits every section of the websites page shares. */

/* the page's five hairlines, behind a section */
export function Hairlines({ dark = false }: { dark?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 mx-auto flex w-full max-w-[1480px] justify-between px-6 md:px-12"
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} className={`h-full w-px ${dark ? "bg-[#ededd5]/[0.06]" : "bg-[#261f15]/[0.07]"}`} />
      ))}
    </div>
  );
}

/* ✦ LABEL ──────── */
export function Eyebrow({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return (
    <p
      className={`flex items-center gap-4 font-sans text-[0.62rem] font-semibold uppercase tracking-[0.3em] sm:text-xs ${
        dark ? "text-[#c6a66a]" : "text-[#8a6f3d]"
      }`}
    >
      <span aria-hidden="true" className="text-[0.8em]">
        ✦
      </span>
      {children}
      <span aria-hidden="true" className={`h-px flex-1 ${dark ? "bg-[#ededd5]/[0.12]" : "bg-[#261f15]/[0.12]"}`} />
    </p>
  );
}

/* true once the element has come on screen */
export function useSeen(ref: RefObject<Element | null>, margin = "0px 0px -15% 0px") {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setSeen(true);
        io.disconnect();
      },
      { rootMargin: margin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, margin]);
  return seen;
}

/* true while the element is on screen */
export function useOnScreen(ref: RefObject<Element | null>) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setOn(entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
  return on;
}

/* the visitor's reduced motion setting, kept up to date */
const MOTION = "(prefers-reduced-motion: reduce)";
const subscribeMotion = (cb: () => void) => {
  const query = window.matchMedia(MOTION);
  query.addEventListener("change", cb);
  return () => query.removeEventListener("change", cb);
};
export const useReducedMotion = () =>
  useSyncExternalStore(
    subscribeMotion,
    () => window.matchMedia(MOTION).matches,
    () => false,
  );
