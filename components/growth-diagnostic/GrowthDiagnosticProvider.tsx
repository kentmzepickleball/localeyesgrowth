"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";

/* ----------------------------------------------------------------------
   Growth Diagnostic — global provider
   The quiz is triggered from several places (Hero, ClosingCta, blog
   article CTAs, ...). It used to be duplicated per-trigger: each spot
   kept its own quizOpen state, lazy-loaded its own copy of the modal
   chunk, and mounted its own <QuizModal>. That meant two things could
   never both be true at once: a single shareable "the quiz is open"
   URL state, and no risk of two triggers on the same page opening two
   separate modal instances.
   This provider (wrap the app once, see app/layout.tsx) is the single
   source of truth instead — same shape as CalendlyModal's
   CalendlyProvider/useCalendly pattern:
     const { open } = useGrowthDiagnostic();
     <button onClick={open}>Free Growth Score</button>
   Opening writes #growth-score onto the URL (pushState — a real
   history entry, not just local state) so the quiz has a real,
   shareable, bookmarkable address: paste the link, land straight on
   the quiz already open. Closing strips the hash back off. Same
   mechanism as the image lightbox on individual blog articles.
   The modal chunk itself still only loads on first open (or on load,
   if the page was reached with #growth-score already in the URL).
   ---------------------------------------------------------------------- */

type QuizModalComponent = ComponentType<{ open: boolean; onClose: () => void }>;

const HASH = "growth-score";

const GrowthDiagnosticContext = createContext<{ open: () => void }>({
  open: () => {},
});

export function useGrowthDiagnostic() {
  return useContext(GrowthDiagnosticContext);
}

export function GrowthDiagnosticProvider({ children }: { children: ReactNode }) {
  const [quizOpen, setQuizOpen] = useState(false);
  const [QuizModal, setQuizModal] = useState<QuizModalComponent | null>(null);
  const loadingRef = useRef(false);

  const loadModal = useCallback(() => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    import("./GrowthDiagnosticModal")
      .then((m) => setQuizModal(() => m.default))
      .catch(() => {
        loadingRef.current = false;
      });
  }, []);

  const open = useCallback(() => {
    setQuizOpen(true);
    loadModal();
    const url = new URL(window.location.href);
    if (url.hash !== `#${HASH}`) {
      url.hash = HASH;
      window.history.pushState(null, "", url);
    }
  }, [loadModal]);

  const close = useCallback(() => {
    setQuizOpen(false);
    if (window.location.hash === `#${HASH}`) {
      const url = new URL(window.location.href);
      url.hash = "";
      window.history.pushState(null, "", url);
    }
  }, []);

  /* Deep-link support — land on any page with #growth-score already in
     the URL (shared link, bookmark, back/forward) and the quiz opens
     itself to match. */
  useEffect(() => {
    const applyFromHash = () => {
      if (window.location.hash === `#${HASH}`) {
        setQuizOpen(true);
        loadModal();
      } else {
        setQuizOpen(false);
      }
    };
    applyFromHash();
    window.addEventListener("hashchange", applyFromHash);
    window.addEventListener("popstate", applyFromHash);
    return () => {
      window.removeEventListener("hashchange", applyFromHash);
      window.removeEventListener("popstate", applyFromHash);
    };
  }, [loadModal]);

  return (
    <GrowthDiagnosticContext.Provider value={{ open }}>
      {children}
      {QuizModal && <QuizModal open={quizOpen} onClose={close} />}
    </GrowthDiagnosticContext.Provider>
  );
}
