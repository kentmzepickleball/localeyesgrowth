"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import GrowthDiagnostic, { RESULTS_STEP } from "./GrowthDiagnostic";
import "./growth-diagnostic.css";

/* ----------------------------------------------------------------------
   GROWTH DIAGNOSTIC MODAL — the site-side shell around the quiz.
   Mirrors the CalendlyModal a11y contract: role="dialog", aria-modal,
   Esc + scrim click close, focus moves in on open, Tab is trapped,
   focus returns to the triggering CTA on close, body scroll locks
   (with scrollbar-width compensation so the page never shifts).
   Quiz-specific robustness:
   - closing MID-QUIZ asks for confirmation first (progress is kept in
     sessionStorage either way, so reopening resumes where they left off)
   - on phones the panel is a full-screen takeover
   - default export so the Hero can lazy-load this whole chunk on click
   ---------------------------------------------------------------------- */

export default function GrowthDiagnosticModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [reduced, setReduced] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const keepGoingRef = useRef<HTMLButtonElement>(null);
  const lastActiveRef = useRef<HTMLElement | null>(null);
  const closeTimer = useRef<number | undefined>(undefined);
  const prevOpen = useRef(false);
  const quizStepRef = useRef(-1);
  const confirmingRef = useRef(false);
  confirmingRef.current = confirming;

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(motion.matches);
    const update = () => setReduced(motion.matches);
    motion.addEventListener("change", update);
    return () => motion.removeEventListener("change", update);
  }, []);

  /* enter / exit orchestration driven by the `open` prop */
  useEffect(() => {
    if (open && !prevOpen.current) {
      window.clearTimeout(closeTimer.current);
      lastActiveRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      setMounted(true);
      setConfirming(false);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
    } else if (!open && prevOpen.current) {
      setVisible(false);
      setConfirming(false);
      closeTimer.current = window.setTimeout(
        () => {
          setMounted(false);
          /* hand focus back to the CTA that opened the dialog */
          lastActiveRef.current?.focus();
          lastActiveRef.current = null;
        },
        reduced ? 0 : 500,
      );
    }
    prevOpen.current = open;
  }, [open, reduced]);

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  /* mid-quiz -> confirm first; intro or results -> close straight away */
  const requestClose = useCallback(() => {
    if (quizStepRef.current >= 0 && quizStepRef.current < RESULTS_STEP) {
      setConfirming(true);
    } else {
      onClose();
    }
  }, [onClose]);

  /* body scroll lock + scrollbar-width compensation while open */
  useEffect(() => {
    if (!mounted) return;
    const prevOverflow = document.body.style.overflow;
    const prevPad = document.body.style.paddingRight;
    const gap = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (gap > 0) document.body.style.paddingRight = gap + "px";
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPad;
    };
  }, [mounted]);

  /* Escape + Tab trap (the trap tightens to the confirm card while
     the confirmation is showing) */
  useEffect(() => {
    if (!mounted) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (confirmingRef.current) setConfirming(false);
        else requestClose();
        return;
      }
      if (e.key === "Tab") {
        const root = confirmingRef.current
          ? confirmRef.current
          : dialogRef.current;
        if (!root) return;
        const focusables = Array.from(
          root.querySelectorAll<HTMLElement>(
            'button, [href], iframe, input, select, textarea, [tabindex]:not([tabindex="-1"])',
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
        } else if (!root.contains(active)) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mounted, requestClose]);

  /* focus management: close button on open, "Keep going" while confirming */
  useEffect(() => {
    if (!mounted) return;
    if (confirming) keepGoingRef.current?.focus();
    else closeBtnRef.current?.focus();
  }, [mounted, confirming]);

  if (!mounted) return null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Mobile Catering Growth Score quiz"
      className="fixed inset-0 z-[200] flex items-center justify-center sm:p-6"
    >
      {/* backdrop — deep ink with a soft blur */}
      <div
        aria-hidden="true"
        onClick={requestClose}
        className={`absolute inset-0 bg-[#261f15]/70 backdrop-blur-md transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          reduced ? "!duration-0" : ""
        } ${visible ? "opacity-100" : "opacity-0"}`}
      />

      {/* panel — full-screen takeover on phones, framed card upward */}
      <div
        className={`le-gd-panel relative flex h-[100dvh] w-full flex-col overflow-hidden bg-[#f6f1e3] shadow-[0_60px_140px_-30px_rgba(20,15,8,0.65)] transition-[opacity,transform] duration-[550ms] ease-[cubic-bezier(0.22,1,0.36,1)] sm:h-auto sm:max-h-[92dvh] sm:w-[min(94vw,43rem)] sm:rounded-lg sm:border sm:border-[#c6a66a]/35 ${
          reduced ? "!duration-0" : ""
        } ${
          visible
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-10 scale-[0.97] opacity-0"
        }`}
      >
        {/* close — ink chip so it reads clearly on the paper */}
        <button
          ref={closeBtnRef}
          type="button"
          onClick={requestClose}
          aria-label="Close the quiz"
          className="group/x absolute right-3 top-3 z-20 flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#261f15] text-[#f6f1e3]/90 ring-1 ring-[#f6f1e3]/25 transition-colors duration-300 hover:bg-[#43361f] hover:text-[#f6f1e3] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a3843f]"
        >
          <X
            strokeWidth={1.5}
            className="h-4 w-4 transition-transform duration-500 ease-[cubic-bezier(0.34,1.2,0.4,1)] group-hover/x:rotate-90"
          />
        </button>

        {/* the quiz itself, in its own scroll container */}
        <div
          ref={scrollRef}
          className="le-gd-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain"
        >
          <GrowthDiagnostic
            scrollContainerRef={scrollRef}
            onStepChange={(s) => {
              quizStepRef.current = s;
            }}
          />
        </div>

        {/* mid-quiz close confirmation — progress is saved either way */}
        {confirming && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#261f15]/45 p-6">
            <div
              ref={confirmRef}
              role="alertdialog"
              aria-modal="true"
              aria-label="Close the quiz?"
              className="w-full max-w-sm border border-[#261f15]/20 bg-[#f6f1e3] p-6 text-center shadow-2xl"
            >
              <p className="le-gd-confirm-title text-xl not-italic text-[#261f15]">
                Close the quiz?
              </p>
              <p className="le-gd-ui mt-2 text-[13px] leading-relaxed text-[#261f15]/80">
                Your progress is saved. You can pick up right where you left
                off.
              </p>
              <div className="mt-5 flex items-center justify-center gap-4">
                <button
                  ref={keepGoingRef}
                  type="button"
                  onClick={() => setConfirming(false)}
                  className="le-gd-ui cursor-pointer bg-[#c6a66a] px-6 py-2.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#261f15] transition-colors duration-200 hover:bg-[#b8934e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#261f15]"
                >
                  Keep going
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="le-gd-ui cursor-pointer text-[12.5px] text-[#7a715c] underline underline-offset-2 transition-colors duration-200 hover:text-[#261f15] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a3843f]"
                >
                  Close for now
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
