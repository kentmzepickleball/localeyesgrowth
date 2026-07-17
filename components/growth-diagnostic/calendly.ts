import { WEBHOOK_URL, CALENDLY_URL } from "./config";
/* ----------------------------------------------------------------------
   CALENDLY — inline embed on the results screen.
   - Assets (widget.js + widget.css) load LAZILY, only when the results
     screen first renders — the homepage never pays for them.
   - The URL carries the original palette params (paper/ink/ochre),
     prefill (name + business, email) and utm_source/utm_content.
   - mountInlineCalendly retries while the script loads (20 x 500ms,
     like the original), then signals fallback; it returns a cleanup
     function so no timers leak when the modal closes mid-retry.
   ---------------------------------------------------------------------- */

declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (opts: {
        url: string;
        parentElement: HTMLElement;
      }) => void;
      initPopupWidget: (opts: { url: string }) => void;
    };
  }
}

const WIDGET_CSS = "https://assets.calendly.com/assets/external/widget.css";
const WIDGET_JS = "https://assets.calendly.com/assets/external/widget.js";

export function loadCalendlyAssets() {
  if (!document.querySelector(`link[href="${WIDGET_CSS}"]`)) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = WIDGET_CSS;
    document.head.appendChild(link);
  }
  if (!document.querySelector(`script[src="${WIDGET_JS}"]`)) {
    const script = document.createElement("script");
    script.src = WIDGET_JS;
    script.async = true;
    document.head.appendChild(script);
  }
}

export function calendlyUrlWithPrefill(
  overall: number,
  name: string,
  business: string,
  email: string,
): string {
  return (
    CALENDLY_URL +
    "?utm_source=growth_diagnostic&utm_content=score_" +
    overall +
    "&name=" +
    encodeURIComponent(name + (business ? " (" + business + ")" : "")) +
    "&email=" +
    encodeURIComponent(email) +
    /* keep it compact + on-brand: LE paper background, ink text, ochre buttons */
    "&hide_event_type_details=1&hide_gdpr_banner=1" +
    "&background_color=fbf8f2&text_color=20211d&primary_color=c8862a"
  );
}

/* Returns a cleanup function. Calls onFallback() if the script never
   arrives (blocked or offline) so the caller can render a plain button. */
export function mountInlineCalendly(
  el: HTMLElement,
  url: string,
  onFallback: () => void,
): () => void {
  let timer: number | undefined;
  let cancelled = false;

  const attempt = (tries: number) => {
    if (cancelled) return;
    if (
      window.Calendly &&
      typeof window.Calendly.initInlineWidget === "function"
    ) {
      window.Calendly.initInlineWidget({ url, parentElement: el });
    } else if (tries < 20) {
      timer = window.setTimeout(() => attempt(tries + 1), 500);
    } else {
      onFallback();
    }
  };
  attempt(0);

  return () => {
    cancelled = true;
    window.clearTimeout(timer);
  };
}

export function openBookingFallback() {
  window.open(WEBHOOK_URL || CALENDLY_URL, "_blank", "noopener");
}

/* original openCalendly(): popup if the widget script is present,
   otherwise a plain new-tab fallback */
export function openCalendlyPopup(url: string) {
  if (
    window.Calendly &&
    typeof window.Calendly.initPopupWidget === "function"
  ) {
    window.Calendly.initPopupWidget({ url });
  } else {
    openBookingFallback();
  }
}
