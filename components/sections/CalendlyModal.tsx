"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { X } from "lucide-react";

/* ----------------------------------------------------------------------
   Calendly booking — brand-styled popup
   - Every "Book a Call" CTA keeps a REAL href to the Calendly page
     (middle-click / no-JS still works), but a normal click opens this
     branded modal instead: cream panel, gold hairlines, the site's
     editorial type — with the Calendly embed tinted to the palette via
     URL params (background_color / text_color / primary_color).
   - Entrance is smooth and premium: backdrop blurs in, the panel
     rises + settles with the site's signature cubic-bezier. A quiet
     spinner holds the space until Calendly's iframe finishes loading.
   - Accessible: role="dialog", Escape closes, backdrop click closes,
     focus moves to the close button, Tab is trapped inside the dialog,
     focus returns to the triggering CTA on close, body scroll locks
     while open.
   - prefers-reduced-motion: all transitions collapse to instant.
   Usage: wrap the app once in <CalendlyProvider>, then in any CTA:
     const { open } = useCalendly();
     <a href={CALENDLY_BOOKING_URL} onClick={(e) => { e.preventDefault(); open(); }}>
   ---------------------------------------------------------------------- */

export const CALENDLY_BOOKING_URL =
  "https://calendly.com/hello-localeyesgrowth/localeyes-meeting-clone-2";

/* the embed, tinted to the brand: cream ground, ink text, gold accents */
const CALENDLY_EMBED_URL =
  CALENDLY_BOOKING_URL +
  "?hide_event_type_details=1&hide_gdpr_banner=1" +
  "&background_color=ededd5&text_color=261f15&primary_color=8a6f3d";

const CalendlyContext = createContext<{ open: () => void }>({
  open: () => {},
});

export function useCalendly() {
  return useContext(CalendlyContext);
}

export function CalendlyProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false); // modal is in the DOM
  const [visible, setVisible] = useState(false); // entrance/exit state
  const [loaded, setLoaded] = useState(false); // Calendly iframe ready
  const [reduced, setReduced] = useState(false);
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

  const open = useCallback(() => {
    window.clearTimeout(closeTimer.current);
    /* remember the CTA that opened us so focus can return to it */
    lastActiveRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    setMounted(true);
    /* double rAF so the closed state paints first — the transition
       always plays, even on the very first open */
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });
  }, []);

  const close = useCallback(() => {
    setVisible(false);
    closeTimer.current = window.setTimeout(
      () => {
        setMounted(false);
        setLoaded(false);
        /* hand focus back to the CTA that opened the dialog */
        lastActiveRef.current?.focus();
        lastActiveRef.current = null;
      },
      reduced ? 0 : 550,
    );
  }, [reduced]);

  /* body scroll lock + Escape-to-close while open */
  useEffect(() => {
    if (!mounted) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        return;
      }
      /* keep Tab cycling inside the dialog while it is open */
      if (e.key === "Tab") {
        const dialog = dialogRef.current;
        if (!dialog) return;
        const focusables = Array.from(
          dialog.querySelectorAll<HTMLElement>(
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

  return (
    <CalendlyContext.Provider value={{ open }}>
      {children}

      {mounted && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label="Book a call with LocalEyes"
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
        >
          {/* backdrop — deep ink with a soft blur */}
          <div
            aria-hidden="true"
            onClick={close}
            className={`absolute inset-0 bg-[#261f15]/70 backdrop-blur-md transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              reduced ? "!duration-0" : ""
            } ${visible ? "opacity-100" : "opacity-0"}`}
          />

          {/* panel — rises and settles with the site's easing */}
          <div
            className={`relative flex w-[min(94vw,30rem)] flex-col overflow-hidden rounded-[1.75rem] border border-[#c6a66a]/35 bg-[#ededd5] shadow-[0_60px_140px_-30px_rgba(20,15,8,0.65)] transition-[opacity,transform] duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
              reduced ? "!duration-0" : ""
            } ${
              visible
                ? "translate-y-0 scale-100 opacity-100"
                : "translate-y-12 scale-[0.96] opacity-0"
            }`}
          >
            {/* panel header — eyebrow + close */}
            <div className="flex items-center justify-between gap-4 border-b border-[#261f15]/10 py-4 pl-6 pr-4">
              <p className="font-sans text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-[#8a6f3d]">
                <span aria-hidden="true" className="mr-2.5 text-[0.8em]">
                  ✦
                </span>
                Book a Call
                <span aria-hidden="true" className="ml-2.5 text-[0.8em]">
                  ✦
                </span>
              </p>
              <button
                ref={closeBtnRef}
                type="button"
                onClick={close}
                aria-label="Close booking dialog"
                className="group/x flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#261f15]/15 text-[#261f15]/60 transition-colors duration-300 hover:border-[#261f15]/60 hover:text-[#261f15] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a3843f]"
              >
                <X
                  strokeWidth={1.5}
                  className="h-4 w-4 transition-transform duration-500 ease-[cubic-bezier(0.34,1.2,0.4,1)] group-hover/x:rotate-90"
                />
              </button>
            </div>

            {/* Calendly embed — spinner holds the space until it loads */}
            <div className="relative h-[min(74vh,40rem)] w-full">
              {!loaded && (
                <div
                  aria-hidden="true"
                  className="absolute inset-0 flex flex-col items-center justify-center gap-4"
                >
                  <span
                    className={`h-8 w-8 rounded-full border border-[#261f15]/15 border-t-[#8a6f3d] ${
                      reduced ? "" : "animate-spin"
                    }`}
                  />
                  <span className="font-sans text-[0.6rem] font-semibold uppercase tracking-[0.25em] text-[#261f15]/45">
                    Loading calendar
                  </span>
                </div>
              )}
              <iframe
                src={`${CALENDLY_EMBED_URL}&embed_type=Inline&embed_domain=${window.location.hostname}`}
                title="Schedule a call with LocalEyes"
                onLoad={() => setLoaded(true)}
                className={`h-full w-full transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  loaded ? "opacity-100" : "opacity-0"
                }`}
              />
            </div>
          </div>
        </div>
      )}
    </CalendlyContext.Provider>
  );
}
