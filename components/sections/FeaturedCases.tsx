"use client";

import {
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";
import Image, { type StaticImageData } from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Lock,
  RotateCw,
} from "lucide-react";
import { Noise } from "@/components/effects/Noise";

import calaIcon from "@/public/cases/pages/cala-icon.png";
import calaHome from "@/public/cases/pages/cala-home.webp";
import calaHomeM from "@/public/cases/pages/cala-home-m.webp";
import calaHuntsville from "@/public/cases/pages/cala-huntsville.webp";
import calaHuntsvilleM from "@/public/cases/pages/cala-huntsville-m.webp";
import calaTuscaloosa from "@/public/cases/pages/cala-tuscaloosa.webp";
import calaTuscaloosaM from "@/public/cases/pages/cala-tuscaloosa-m.webp";
import calaMontgomery from "@/public/cases/pages/cala-montgomery.webp";
import calaMontgomeryM from "@/public/cases/pages/cala-montgomery-m.webp";
import calaMobile from "@/public/cases/pages/cala-mobile.webp";
import calaMobileM from "@/public/cases/pages/cala-mobile-m.webp";
import calaWedding from "@/public/cases/pages/cala-wedding.webp";
import calaWeddingM from "@/public/cases/pages/cala-wedding-m.webp";
import sbsIcon from "@/public/cases/pages/sbs-icon.png";
import sbsHome from "@/public/cases/pages/sbs-home.webp";
import sbsHomeM from "@/public/cases/pages/sbs-home-m.webp";
import sbsBoston from "@/public/cases/pages/sbs-boston.webp";
import sbsBostonM from "@/public/cases/pages/sbs-boston-m.webp";
import sbsSeaport from "@/public/cases/pages/sbs-seaport.webp";
import sbsSeaportM from "@/public/cases/pages/sbs-seaport-m.webp";
import sbsCambridge from "@/public/cases/pages/sbs-cambridge.webp";
import sbsCambridgeM from "@/public/cases/pages/sbs-cambridge-m.webp";
import sbsPortsmouth from "@/public/cases/pages/sbs-portsmouth.webp";
import sbsPortsmouthM from "@/public/cases/pages/sbs-portsmouth-m.webp";
import sbsWedding from "@/public/cases/pages/sbs-wedding.webp";
import sbsWeddingM from "@/public/cases/pages/sbs-wedding-m.webp";

/* ----------------------------------------------------------------------
   FeaturedCases: "Every city, its own page"
   Two case studies (website + SEO by LocalEyes), each shown as its live
   website in a browser that browses itself: the homepage, then a tab
   for each city and event page we built. The address bar types the
   real URL, the page loads and scrolls, a phone in front shows the same
   page on mobile. Full-page captures of the real pages.
   - The browser sits on a wash of the client's own colour and breaks
     out of it on the left; browser and phone lean a little toward the
     pointer. Changing clients plays a title card in their colour.
   - Hover the window and the page follows the pointer (top to bottom);
     click opens the live page. Tabs switch pages; the list on the left
     switches clients.
   - After a full round the next client takes over (a gold line under
     its name counts down) until someone picks one, and never while
     the pointer is on the story.
   - One loop, only while the browser is on screen; it writes straight
     to the DOM. Reduced motion: no autoplay, lean, entrance or title
     card; pages sit at the top; everything still switches by hand.
   - Facts are real: page counts from the clients' live sitemaps (Oct
     2026), captures of their live pages, their own words. Results
     (rankings, inquiries) go in `results` once confirmed. They lead
     the numbers row.
   ---------------------------------------------------------------------- */

type CasePage = {
  /** the tab's title */
  label: string;
  href: string;
  desktop: StaticImageData;
  phone: StaticImageData;
};

type Stat = { value: string; label: string };

type Client = {
  number: string;
  client: string;
  region: string;
  short: string;
  story: string;
  numbers: Stat[];
  /** confirmed results, shown ahead of `numbers` */
  results?: Stat[];
  url: string;
  domain: string;
  icon: StaticImageData;
  /** their colour: the title card between clients */
  brand: string;
  /** a light wash of it: the panel behind the browser */
  wash: string;
  /** city and event pages beyond the tabs */
  more: number;
  /** the homepage first */
  pages: CasePage[];
};

const CLIENTS: Client[] = [
  {
    number: "01",
    client: "Cala Coffee",
    region: "Birmingham, Alabama",
    short: "Birmingham, AL",
    story:
      "A roaster with three Birmingham cafés and a mobile coffee bar. We built one website for all of it: beans, cafés and catering. Then we gave the catering a page of its own in every city it serves.",
    numbers: [
      { value: "21", label: "City pages" },
      { value: "10", label: "Catering pages" },
      { value: "3", label: "Cafés, one site" },
    ],
    url: "https://calacoffeeco.com/",
    domain: "calacoffeeco.com",
    icon: calaIcon,
    brand: "#47773b",
    wash: "radial-gradient(130% 120% at 0% 0%, #e7ead5 0%, #d5ddc2 46%, #c4cfad 100%)",
    more: 26, // 21 city + 10 catering pages, 5 of them in the tabs
    pages: [
      { label: "Cala Coffee", href: "https://calacoffeeco.com/", desktop: calaHome, phone: calaHomeM },
      { label: "Huntsville, AL", href: "https://calacoffeeco.com/pages/location/huntsville-al", desktop: calaHuntsville, phone: calaHuntsvilleM },
      { label: "Tuscaloosa, AL", href: "https://calacoffeeco.com/pages/location/tuscaloosa-al", desktop: calaTuscaloosa, phone: calaTuscaloosaM },
      { label: "Montgomery, AL", href: "https://calacoffeeco.com/pages/location/montgomery-al", desktop: calaMontgomery, phone: calaMontgomeryM },
      { label: "Mobile, AL", href: "https://calacoffeeco.com/pages/location/coffee-catering-mobile-al", desktop: calaMobile, phone: calaMobileM },
      { label: "Weddings", href: "https://calacoffeeco.com/pages/wedding-coffee-bar-catering", desktop: calaWedding, phone: calaWeddingM },
    ],
  },
  {
    number: "02",
    client: "Side by Side Coffee",
    region: "Portland, Maine",
    short: "Portland, ME",
    story:
      "A mobile espresso bar from Portland. We built the site from scratch and mapped it to every place the cart goes, from Cape Elizabeth to the Seaport in Boston, across three states.",
    numbers: [
      { value: "24", label: "Local pages" },
      { value: "13", label: "Places" },
      { value: "3", label: "States" },
    ],
    url: "https://sidebysidecoffee.com/",
    domain: "sidebysidecoffee.com",
    icon: sbsIcon,
    brand: "#1d2c4b",
    wash: "radial-gradient(130% 120% at 0% 0%, #e8e9e3 0%, #d4dadd 46%, #c0cad3 100%)",
    more: 19, // 24 local pages, 5 of them in the tabs
    pages: [
      { label: "Side by Side Coffee", href: "https://sidebysidecoffee.com/", desktop: sbsHome, phone: sbsHomeM },
      { label: "Boston, MA", href: "https://sidebysidecoffee.com/mobile-coffee-cart-in-boston-ma", desktop: sbsBoston, phone: sbsBostonM },
      { label: "Seaport, Boston", href: "https://sidebysidecoffee.com/coffee-catering-seaport-boston", desktop: sbsSeaport, phone: sbsSeaportM },
      { label: "Cambridge, MA", href: "https://sidebysidecoffee.com/coffee-catering-in-cambridge", desktop: sbsCambridge, phone: sbsCambridgeM },
      { label: "Portsmouth, NH", href: "https://sidebysidecoffee.com/coffee-catering-in-portsmouth", desktop: sbsPortsmouth, phone: sbsPortsmouthM },
      { label: "Weddings", href: "https://sidebysidecoffee.com/wedding-coffee-bar-portland", desktop: sbsWedding, phone: sbsWeddingM },
    ],
  },
];

/* timing, in ms */
const HOME_MS = 7600; // the homepage's turn
const PAGE_MS = 4200; // every other page's turn
const LOAD_MS = 700; // the load: gold bar, spinner, fade
const REST_MS = 700; // still at the end of a turn
const HOLD_MS = 9000; // after a tab is picked by hand
const TYPE_MS = 24; // per character in the address bar
const SWAP_MS = 560; // into the title card, when the client changes underneath
/* how far down the page a turn scrolls, of all there is */
const HOME_REACH = 0.78;
const PAGE_REACH = 0.6;
/* screen shapes, height ÷ width */
const VIEW_RATIO = 10 / 16;
const PHONE_RATIO = 19.5 / 9;

const dwellOf = (i: number) => (i === 0 ? HOME_MS : PAGE_MS);
const reachOf = (i: number) => (i === 0 ? HOME_REACH : PAGE_REACH);
const roundOf = (c: number) =>
  CLIENTS[c].pages.reduce((sum, _, i) => sum + dwellOf(i), 0);
/* share of a capture's height it can travel before its foot shows */
const rangeOf = (img: StaticImageData, ratio: number) =>
  Math.max(0, 1 - (ratio * img.width) / img.height);

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const easeInOutInverse = (p: number) =>
  p < 0.5 ? Math.cbrt(p / 4) : 1 - Math.cbrt(2 * (1 - p)) / 2;
const pathOf = (href: string) => href.replace(/^https?:\/\/[^/]+/, "").replace(/\/$/, "");

const VIEW_SIZES = "(min-width: 1480px) 820px, (min-width: 1024px) 57vw, 94vw";
const PHONE_SIZES = "(min-width: 1024px) 150px, 20vw";

const MOTION = "(prefers-reduced-motion: reduce)";
const subscribeMotion = (cb: () => void) => {
  const query = window.matchMedia(MOTION);
  query.addEventListener("change", cb);
  return () => query.removeEventListener("change", cb);
};
const useReducedMotion = () =>
  useSyncExternalStore(
    subscribeMotion,
    () => window.matchMedia(MOTION).matches,
    () => false,
  );

export default function FeaturedCases() {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(0); // the client on screen
  const [picked, setPicked] = useState(0); // the client asked for, ahead of `shown` through the title card
  const [page, setPage] = useState(0); // the tab
  /* pages that have had a turn stay mounted, so going back is instant */
  const [seen, setSeen] = useState<boolean[][]>(() =>
    CLIENTS.map((c) => c.pages.map((_, i) => i === 0)),
  );
  const [card, setCard] = useState<{ n: number; to: number } | null>(null);

  const stageRef = useRef<HTMLDivElement>(null);
  const leanRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<HTMLAnchorElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const loadRef = useRef<HTMLSpanElement>(null);
  const bubbleRef = useRef<HTMLSpanElement>(null);
  const domainRef = useRef<HTMLSpanElement>(null);
  const pathRef = useRef<HTMLSpanElement>(null);
  const roundRef = useRef<HTMLSpanElement>(null);

  const shownRef = useRef(0);
  const pageRef = useRef(0);
  const pendingRef = useRef<number | null>(null); // the client behind the title card
  const swapAtRef = useRef(0); // -1: the loop stamps it on its next frame
  const elapsedRef = useRef(0); // the turn so far, paused while held
  const sinceRef = useRef(0); // since the page opened, never paused
  const scrollRef = useRef(0); // 0 to 1 of the page's travel
  const typedFromRef = useRef(0); // characters already in the address bar
  const scrubRef = useRef<number | null>(null); // pointer over the window
  /* x, y: over the stage, from -1 to 1. tx, ty: over the window, in px. bx, by: the bubble */
  const pointerRef = useRef({ x: 0, y: 0, tx: 0, ty: 0, bx: 0, by: 0 });
  const holdUntilRef = useRef(0); // -1: the loop stamps it on its next frame
  const autoRef = useRef(true); // clients trade on their own until one is picked
  const readingRef = useRef(false); // pointer on the story

  const client = CLIENTS[shown];
  const current = client.pages[page];
  const stats = [...(client.results ?? []), ...client.numbers].slice(0, 3);
  const nextClient = CLIENTS[(shown + 1) % CLIENTS.length];
  const cardClient = card ? CLIENTS[card.to] : null;

  const markSeen = (c: number, i: number) =>
    setSeen((prev) =>
      prev[c][i] ? prev : prev.map((row, ci) => (ci === c ? row.map((v, pi) => v || pi === i) : row)),
    );

  const openPage = (i: number) => {
    pageRef.current = i;
    elapsedRef.current = 0;
    sinceRef.current = 0;
    scrollRef.current = 0;
    typedFromRef.current = CLIENTS[shownRef.current].domain.length;
    setPage(i);
    markSeen(shownRef.current, i);
  };

  const openClient = (c: number) => {
    shownRef.current = c;
    pageRef.current = 0;
    pendingRef.current = null;
    swapAtRef.current = 0;
    elapsedRef.current = 0;
    sinceRef.current = 0;
    scrollRef.current = 0;
    typedFromRef.current = 0;
    setShown(c);
    setPicked(c);
    setPage(0);
  };

  /* the title card wipes in, the client changes beneath it, it wipes off */
  const switchTo = (c: number) => {
    if (c === (pendingRef.current ?? shownRef.current)) return;
    setPicked(c);
    if (reduced) {
      openClient(c);
      return;
    }
    pendingRef.current = c;
    swapAtRef.current = -1;
    setCard((prev) => ({ n: (prev?.n ?? 0) + 1, to: c }));
  };

  const pickClient = (c: number) => {
    autoRef.current = false;
    switchTo(c);
  };

  const pickPage = (i: number) => {
    autoRef.current = false;
    holdUntilRef.current = -1;
    if (i !== pageRef.current) openPage(i);
  };

  /* a turn is over: the next tab, or the next client after the last */
  const advance = useEffectEvent(() => {
    const c = shownRef.current;
    const next = pageRef.current + 1;
    if (next < CLIENTS[c].pages.length) openPage(next);
    else if (autoRef.current && !readingRef.current) switchTo((c + 1) % CLIENTS.length);
    else openPage(0);
  });

  const swap = useEffectEvent(() => {
    if (pendingRef.current !== null) openClient(pendingRef.current);
  });

  /* the loop */
  useEffect(() => {
    const stage = stageRef.current;
    const view = viewRef.current;
    if (!stage || !view) return;
    let raf = 0;
    let last = 0;
    let running = false;
    let typed = -1;
    let typedKey = "";
    let px = 0;
    let py = 0;
    let rx = 0;
    let ry = 0;

    const frame = (now: number) => {
      const dt = last ? Math.min(64, now - last) : 16;
      last = now;
      const ease = (ms: number) => 1 - Math.exp(-dt / ms);

      if (swapAtRef.current === -1) swapAtRef.current = now + SWAP_MS;
      if (holdUntilRef.current === -1) holdUntilRef.current = now + HOLD_MS;
      if (swapAtRef.current > 0 && now >= swapAtRef.current) swap();
      const switching = pendingRef.current !== null;

      const c = shownRef.current;
      const i = pageRef.current;
      const pg = CLIENTS[c].pages[i];
      const dwell = dwellOf(i);
      const scrub = scrubRef.current;
      const held = scrub !== null || switching || now < holdUntilRef.current;

      sinceRef.current += dt;
      if (!held && !reduced) elapsedRef.current += dt;

      /* the page scrolls through its turn, or follows the pointer */
      const span = dwell - LOAD_MS - REST_MS;
      const t = clamp01((elapsedRef.current - LOAD_MS) / span);
      const goal = scrub ?? (reduced ? 0 : easeInOut(t) * reachOf(i));
      scrollRef.current += (goal - scrollRef.current) * (reduced ? 1 : ease(scrub !== null ? 120 : 70));
      const s = scrollRef.current;
      const sheet = view.querySelector<HTMLElement>(`[data-page="${i}"] [data-scroll]`);
      if (sheet) sheet.style.transform = `translate3d(0, ${(-s * rangeOf(pg.desktop, VIEW_RATIO) * 100).toFixed(3)}%, 0)`;
      const pocket = screenRef.current?.querySelector<HTMLElement>(`[data-page="${i}"] [data-scroll]`);
      if (pocket) pocket.style.transform = `translate3d(0, ${(-s * rangeOf(pg.phone, PHONE_RATIO) * 100).toFixed(3)}%, 0)`;

      /* the load: gold bar across the top, spinner in the tab */
      const since = sinceRef.current;
      const load = loadRef.current;
      if (load) {
        const k = clamp01(since / LOAD_MS);
        load.style.transform = `scaleX(${(1 - Math.pow(1 - k, 3)).toFixed(4)})`;
        load.style.opacity = !reduced && since < LOAD_MS + 220 ? "1" : "0";
      }
      const tab = stage.querySelector<HTMLElement>('[data-tab][data-active="true"]');
      if (tab) tab.dataset.loading = !reduced && since < LOAD_MS ? "true" : "false";

      /* the address, typed out */
      const domain = CLIENTS[c].domain;
      const path = pathOf(pg.href);
      const key = `${c}-${i}`;
      const full = domain.length + path.length;
      const n = reduced
        ? full
        : Math.min(full, typedFromRef.current + Math.max(0, Math.floor((since - 90) / TYPE_MS)));
      if (n !== typed || key !== typedKey) {
        typed = n;
        typedKey = key;
        const text = domain + path;
        if (domainRef.current) domainRef.current.textContent = text.slice(0, Math.min(n, domain.length));
        if (pathRef.current) {
          pathRef.current.textContent = text.slice(domain.length, Math.max(domain.length, n));
          pathRef.current.dataset.typing = n < full ? "true" : "false";
        }
      }

      /* the countdown under the client's name */
      const round = roundRef.current;
      if (round) {
        let before = 0;
        for (let p = 0; p < i; p++) before += dwellOf(p);
        round.style.opacity = autoRef.current && !reduced && !switching ? "1" : "0";
        round.style.transform = `scaleX(${
          switching ? 0 : clamp01((before + Math.min(elapsedRef.current, dwell)) / roundOf(c)).toFixed(4)
        })`;
      }

      /* browser and phone lean toward the pointer, the phone drifts a
         little further, the bubble trails the pointer */
      const ptr = pointerRef.current;
      if (!reduced) {
        rx += (-ptr.y * 2.2 - rx) * ease(420);
        ry += (ptr.x * 3 - ry) * ease(420);
        if (leanRef.current) {
          leanRef.current.style.transform = `perspective(2400px) rotateX(${rx.toFixed(3)}deg) rotateY(${ry.toFixed(3)}deg)`;
        }
        px += (ptr.x * 10 - px) * ease(260);
        py += (ptr.y * 8 - py) * ease(260);
        if (phoneRef.current) phoneRef.current.style.transform = `translate3d(${px.toFixed(2)}px, ${py.toFixed(2)}px, 0)`;
      }
      const bubble = bubbleRef.current;
      if (bubble && scrub !== null) {
        ptr.bx += (ptr.tx - ptr.bx) * ease(70);
        ptr.by += (ptr.ty - ptr.by) * ease(70);
        bubble.style.transform = `translate3d(${ptr.bx.toFixed(1)}px, ${ptr.by.toFixed(1)}px, 0)`;
      }

      if (!held && !reduced && elapsedRef.current >= dwell) advance();
      raf = requestAnimationFrame(frame);
    };

    /* the entrance, once, and the loop only while on screen */
    const armed = !reduced && stage.getBoundingClientRect().top > window.innerHeight;
    if (armed) stage.dataset.armed = "true";
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (entry.intersectionRatio > 0.2) stage.dataset.in = "true";
          if (!running) {
            running = true;
            last = 0;
            raf = requestAnimationFrame(frame);
          }
        } else if (running) {
          running = false;
          cancelAnimationFrame(raf);
        }
      },
      { threshold: [0, 0.2, 0.4] },
    );
    io.observe(stage);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  /* where the bubble heads. On entering it starts at the pointer */
  const aimBubble = (x: number, y: number, jump: boolean) => {
    const ptr = pointerRef.current;
    ptr.tx = x;
    ptr.ty = y;
    if (!jump) return;
    ptr.bx = x;
    ptr.by = y;
    if (bubbleRef.current) {
      bubbleRef.current.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    }
  };

  const tabStyle = (i: number) => ({ "--i": i }) as CSSProperties;

  return (
    <section
      id="featured-cases"
      className="relative w-full overflow-hidden bg-[#ededd5] text-[#261f15]"
    >
      <style>{`
        .le-fc-stage[data-armed="true"] .le-fc-in-wash {
          opacity: 0;
          transform: scale(0.94);
        }
        .le-fc-stage[data-armed="true"] .le-fc-in-browser {
          opacity: 0;
          transform: translateY(64px) scale(0.97);
        }
        .le-fc-stage[data-armed="true"] .le-fc-in-phone {
          opacity: 0;
          transform: translateY(110px) rotate(4deg);
        }
        .le-fc-stage[data-in="true"] .le-fc-in-wash,
        .le-fc-stage[data-in="true"] .le-fc-in-browser,
        .le-fc-stage[data-in="true"] .le-fc-in-phone {
          opacity: 1;
          transform: none;
          transition: opacity 1s cubic-bezier(0.22, 1, 0.36, 1),
            transform 1.5s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .le-fc-stage[data-in="true"] .le-fc-in-browser { transition-delay: 0.12s; }
        .le-fc-stage[data-in="true"] .le-fc-in-phone { transition-delay: 0.4s; }
        .le-fc-in-wash { transform-origin: 100% 50%; }

        .le-fc-tab {
          color: rgba(38, 31, 21, 0.5);
          transition: background-color 0.3s, color 0.3s;
          animation: le-fc-tab-in 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
          animation-delay: calc(var(--i) * 55ms);
        }
        .le-fc-tab:hover { background: rgba(253, 251, 245, 0.55); color: rgba(38, 31, 21, 0.85); }
        .le-fc-tab[data-active="true"] { background: #fdfbf5; color: #261f15; }
        .le-fc-tab[data-active="true"]::before,
        .le-fc-tab[data-active="true"]::after {
          content: "";
          position: absolute;
          bottom: 0;
          width: 10px;
          height: 10px;
          pointer-events: none;
        }
        .le-fc-tab[data-active="true"]::before {
          left: -10px;
          background: radial-gradient(circle at 0 0, transparent 9.5px, #fdfbf5 10px);
        }
        .le-fc-tab[data-active="true"]::after {
          right: -10px;
          background: radial-gradient(circle at 100% 0, transparent 9.5px, #fdfbf5 10px);
        }
        .le-fc-sep {
          position: absolute;
          left: 0;
          top: 32%;
          bottom: 32%;
          width: 1px;
          background: rgba(38, 31, 21, 0.13);
        }
        .le-fc-tab:first-child .le-fc-sep,
        .le-fc-tab[data-active="true"] .le-fc-sep,
        .le-fc-tab[data-active="true"] + .le-fc-tab .le-fc-sep { display: none; }
        .le-fc-fav img { transition: opacity 0.2s; }
        .le-fc-spin {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 1.5px solid rgba(166, 124, 61, 0.25);
          border-top-color: #a67c3d;
          opacity: 0;
        }
        .le-fc-tab[data-loading="true"] .le-fc-fav img { opacity: 0; }
        .le-fc-tab[data-loading="true"] .le-fc-spin {
          opacity: 1;
          animation: le-fc-spin 0.7s linear infinite;
        }
        @keyframes le-fc-spin { to { transform: rotate(360deg); } }
        @keyframes le-fc-tab-in {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: none; }
        }
        @media (max-width: 639px) {
          .le-fc-tab[data-active="false"] { flex: 0 0 2.25rem; justify-content: center; }
          .le-fc-tab[data-active="false"] .le-fc-label { display: none; }
        }

        [data-typing="true"]::after {
          content: "";
          display: inline-block;
          width: 1px;
          height: 0.95em;
          margin-left: 1px;
          vertical-align: -0.12em;
          background: #261f15;
        }

        .le-fc-pg {
          opacity: 0;
          transition: opacity 0.55s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .le-fc-pg[data-on="true"] { opacity: 1; z-index: 1; }
        .le-fc-load {
          position: absolute;
          inset: 0 0 auto 0;
          z-index: 3;
          height: 2px;
          background: linear-gradient(90deg, #c6a66a, #a67c3d);
          transform-origin: left;
          transform: scaleX(0);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .le-fc-bubble {
          position: absolute;
          left: 0;
          top: 0;
          z-index: 6;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.25s;
        }
        .le-fc-view[data-hover="true"] .le-fc-bubble { opacity: 1; }

        .le-fc-card {
          position: absolute;
          inset: 0;
          z-index: 5;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          pointer-events: none;
          clip-path: inset(0 100% 0 0);
          animation: le-fc-card 1.3s cubic-bezier(0.76, 0, 0.24, 1) both;
        }
        @keyframes le-fc-card {
          0% { clip-path: inset(0 100% 0 0); }
          40%, 64% { clip-path: inset(0 0 0 0); }
          100% { clip-path: inset(0 0 0 100%); }
        }
        .le-fc-card-title { animation: le-fc-card-title 1.3s cubic-bezier(0.22, 1, 0.36, 1) both; }
        @keyframes le-fc-card-title {
          0%, 26% { opacity: 0; transform: translateY(14px); }
          42%, 58% { opacity: 1; transform: none; }
          74%, 100% { opacity: 0; transform: translateY(-8px); }
        }

        .le-fc-copy > * { animation: le-fc-in 0.8s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .le-fc-copy > *:nth-child(2) { animation-delay: 0.07s; }
        .le-fc-copy > *:nth-child(3) { animation-delay: 0.14s; }
        @keyframes le-fc-in {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: none; }
        }

        @media (prefers-reduced-motion: reduce) {
          .le-fc-tab, .le-fc-copy > *, .le-fc-card, .le-fc-card-title { animation: none; }
          .le-fc-card { display: none; }
          .le-fc-pg, .le-fc-tab { transition: none; }
        }
      `}</style>

      {/* the site's hairline grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 mx-auto flex w-full max-w-[1480px] justify-between px-6 md:px-12"
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className="h-full w-px bg-[#261f15]/[0.07]" />
        ))}
      </div>

      <Noise
        patternAlpha={10}
        patternRefreshInterval={reduced ? 1_000_000_000 : 2}
      />

      <div className="relative z-10 mx-auto grid w-full max-w-[1480px] grid-cols-1 px-6 py-20 md:px-12 md:py-24 lg:grid-cols-[minmax(0,0.66fr)_minmax(0,1.34fr)] lg:grid-rows-[1fr_auto_auto_1fr] lg:gap-x-14 xl:gap-x-20">
        {/* the heading and the clients */}
        <div className="lg:col-start-1 lg:row-start-2">
          <p className="flex items-center gap-4 font-sans text-[0.62rem] font-semibold uppercase tracking-[0.3em] text-[#a67c3d] sm:text-xs">
            <span aria-hidden="true" className="text-[0.8em]">
              ✦
            </span>
            Featured work
          </p>
          <h2 className="mt-5 font-heading font-thin not-italic text-[clamp(2.7rem,4.6vw,4.3rem)] leading-[1] tracking-[-0.02em] text-[#261f15]">
            Every city,
            <br />
            <span className="text-[#a67c3d]">its own page</span>
          </h2>

          <div
            role="group"
            aria-label="Case studies"
            className="mt-10 border-t border-[#261f15]/12"
          >
            {CLIENTS.map((c, i) => (
              <button
                key={c.number}
                type="button"
                aria-pressed={picked === i}
                onClick={() => pickClient(i)}
                className="group relative flex w-full cursor-pointer items-baseline gap-4 border-b border-[#261f15]/12 py-4 text-left sm:gap-5"
              >
                <span
                  className={`font-heading font-thin not-italic text-[1.75rem] leading-[1.05] tracking-[-0.01em] transition-colors duration-500 sm:text-[2rem] ${
                    picked === i
                      ? "text-[#261f15]"
                      : "text-[#261f15]/35 group-hover:text-[#261f15]/70"
                  }`}
                >
                  {c.client}
                </span>
                <span
                  className={`ml-auto hidden shrink-0 font-sans text-[0.6rem] font-semibold uppercase tracking-[0.2em] transition-colors duration-500 sm:block ${
                    picked === i ? "text-[#261f15]/55" : "text-[#261f15]/30"
                  }`}
                >
                  {c.short}
                </span>
                {picked === i && (
                  <span
                    ref={roundRef}
                    aria-hidden="true"
                    className="absolute -bottom-px left-0 h-px w-full origin-left bg-[#a67c3d]"
                    style={{ transform: "scaleX(0)", opacity: 0 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* the browser and the phone, on the client's colour */}
        <div
          ref={stageRef}
          onPointerMove={(e) => {
            if (e.pointerType !== "mouse") return;
            const r = e.currentTarget.getBoundingClientRect();
            pointerRef.current.x = ((e.clientX - r.left) / r.width) * 2 - 1;
            pointerRef.current.y = ((e.clientY - r.top) / r.height) * 2 - 1;
          }}
          onPointerLeave={() => {
            pointerRef.current.x = 0;
            pointerRef.current.y = 0;
          }}
          className="le-fc-stage relative mt-12 lg:col-start-2 lg:row-span-4 lg:row-start-1 lg:mt-0 lg:self-center"
        >
          {/* the wash, which the browser breaks out of on the left */}
          <div
            aria-hidden="true"
            className="le-fc-in-wash pointer-events-none absolute inset-y-0 left-[5%] right-0 overflow-hidden rounded-[22px] sm:left-[8%] sm:rounded-[30px]"
          >
            {CLIENTS.map((c, i) => (
              <div
                key={c.number}
                className="absolute inset-0 transition-opacity duration-[1200ms] ease-out"
                style={{ background: c.wash, opacity: i === shown ? 1 : 0 }}
              />
            ))}
            <div className="absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.5),inset_0_-60px_90px_-60px_rgba(38,31,21,0.16)]" />
          </div>

          <div ref={leanRef} className="relative py-[6%] pr-[4%] sm:py-[5.5%] sm:pr-[5%]">
            <div className="le-fc-in-browser relative isolate">
              <div className="overflow-hidden rounded-[16px] bg-[#fdfbf5] shadow-[0_0_0_1px_rgba(38,31,21,0.08),0_44px_80px_-38px_rgba(38,31,21,0.55),0_14px_30px_-20px_rgba(38,31,21,0.3)]">
                {/* tabs */}
                <div className="flex h-10 items-end bg-[#eee8d6] pl-3.5 pr-2">
                  <div aria-hidden="true" className="mr-3 flex shrink-0 items-center gap-[7px] self-center sm:mr-4">
                    <span className="h-[10px] w-[10px] rounded-full bg-[#e27d70]" />
                    <span className="h-[10px] w-[10px] rounded-full bg-[#e9c264]" />
                    <span className="h-[10px] w-[10px] rounded-full bg-[#86c27a]" />
                  </div>
                  <div
                    key={client.number}
                    role="group"
                    aria-label={`Pages on ${client.domain}`}
                    className="flex min-w-0 flex-1 items-end"
                  >
                    {client.pages.map((p, i) => (
                      <button
                        key={p.href}
                        type="button"
                        data-tab
                        data-active={page === i}
                        aria-pressed={page === i}
                        aria-label={`Show the ${i === 0 ? "homepage" : `${p.label} page`}`}
                        onClick={() => pickPage(i)}
                        style={tabStyle(i)}
                        className="le-fc-tab relative flex h-8 min-w-0 max-w-[11.5rem] flex-1 basis-0 cursor-pointer items-center gap-2 rounded-t-[10px] px-3 text-left"
                      >
                        <span className="le-fc-sep" aria-hidden="true" />
                        <span className="le-fc-fav relative h-3.5 w-3.5 shrink-0" aria-hidden="true">
                          <Image src={client.icon} alt="" width={14} height={14} className="h-3.5 w-3.5" />
                          <span className="le-fc-spin" />
                        </span>
                        <span className="le-fc-label truncate font-sans text-[0.7rem] font-medium">
                          {p.label}
                        </span>
                      </button>
                    ))}
                  </div>
                  <span className="mb-[7px] ml-2 hidden shrink-0 items-center rounded-full border border-[#261f15]/12 bg-[#fdfbf5]/50 px-2.5 py-[3px] font-sans text-[0.6rem] font-semibold tracking-[0.04em] text-[#261f15]/55 xl:inline-flex">
                    +{client.more} more
                    <span className="sr-only"> city and event pages on {client.domain}</span>
                  </span>
                </div>

                {/* toolbar */}
                <div className="flex h-10 items-center gap-3 border-b border-[#261f15]/[0.07] px-3 sm:gap-4 sm:px-4">
                  <div aria-hidden="true" className="hidden items-center gap-3 text-[#261f15]/30 sm:flex">
                    <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
                    <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
                    <RotateCw className="h-3.5 w-3.5" strokeWidth={2} />
                  </div>
                  <div
                    aria-hidden="true"
                    className="flex h-[1.65rem] min-w-0 flex-1 items-center gap-2 rounded-full bg-[#eee8d6]/80 px-3 font-sans text-[0.7rem] sm:text-[0.74rem]"
                  >
                    <Lock className="h-3 w-3 shrink-0 text-[#261f15]/40" strokeWidth={2.2} />
                    {/* typed by the loop, React leaves these empty */}
                    <span className="min-w-0 truncate">
                      <span ref={domainRef} className="text-[#261f15]/50" />
                      <span ref={pathRef} className="text-[#261f15]" />
                    </span>
                  </div>
                  <a
                    href={current.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-hidden="true"
                    tabIndex={-1}
                    className="hidden shrink-0 items-center gap-1.5 rounded-full border border-[#261f15]/15 px-3 py-[5px] font-sans text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-[#261f15]/70 transition-colors duration-300 hover:border-[#261f15] hover:bg-[#261f15] hover:text-[#f6f1df] sm:inline-flex"
                  >
                    Open
                    <ArrowUpRight className="h-3 w-3" strokeWidth={2.2} />
                  </a>
                </div>

                {/* the page */}
                <a
                  ref={viewRef}
                  href={current.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Open the live ${page === 0 ? "homepage" : `${current.label} page`} on ${client.domain} (new tab)`}
                  onPointerEnter={(e) => {
                    if (e.pointerType !== "mouse") return;
                    const r = e.currentTarget.getBoundingClientRect();
                    e.currentTarget.dataset.hover = "true";
                    aimBubble(e.clientX - r.left, e.clientY - r.top, true);
                  }}
                  onPointerMove={(e) => {
                    if (e.pointerType !== "mouse") return;
                    const r = e.currentTarget.getBoundingClientRect();
                    scrubRef.current = clamp01((e.clientY - r.top - r.height * 0.1) / (r.height * 0.8));
                    aimBubble(e.clientX - r.left, e.clientY - r.top, false);
                  }}
                  onPointerLeave={(e) => {
                    e.currentTarget.dataset.hover = "false";
                    if (scrubRef.current === null) return;
                    /* pick the turn up from wherever the pointer left it */
                    const reach = reachOf(pageRef.current);
                    const p = clamp01(scrollRef.current / reach);
                    const span = dwellOf(pageRef.current) - LOAD_MS - REST_MS;
                    elapsedRef.current = LOAD_MS + easeInOutInverse(p) * span;
                    holdUntilRef.current = performance.now() + 1200;
                    scrubRef.current = null;
                  }}
                  className="le-fc-view relative block aspect-[16/10] overflow-hidden bg-white outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#a67c3d]"
                >
                  {client.pages.map((p, i) =>
                    seen[shown][i] || i === page || i === page + 1 ? (
                      <div
                        key={p.href}
                        data-page={i}
                        data-on={i === page}
                        className="le-fc-pg absolute inset-x-0 top-0"
                      >
                        <div data-scroll className="will-change-transform">
                          <Image
                            src={p.desktop}
                            alt=""
                            sizes={VIEW_SIZES}
                            placeholder="blur"
                            className="block h-auto w-full"
                          />
                        </div>
                      </div>
                    ) : null,
                  )}
                  <span ref={loadRef} className="le-fc-load" aria-hidden="true" />
                  {cardClient && card && (
                    <span
                      key={card.n}
                      aria-hidden="true"
                      className="le-fc-card"
                      style={{ background: cardClient.brand }}
                    >
                      <span className="le-fc-card-title px-6">
                        <span className="block font-heading font-thin not-italic text-[clamp(1.9rem,3.4vw,3.1rem)] leading-none tracking-[-0.015em] text-[#f6f1df]">
                          {cardClient.client}
                        </span>
                        <span className="mt-4 block font-sans text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-[#f6f1df]/70">
                          {cardClient.region}
                        </span>
                      </span>
                    </span>
                  )}
                  <span ref={bubbleRef} className="le-fc-bubble" aria-hidden="true">
                    <span className="ml-4 mt-4 inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-[#261f15] px-3.5 py-2 font-sans text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-[#f6f1df] shadow-[0_10px_24px_-10px_rgba(38,31,21,0.6)]">
                      Open live page
                      <ArrowUpRight className="h-3 w-3" strokeWidth={2.2} />
                    </span>
                  </span>
                </a>
              </div>
            </div>

            {/* the phone, in front */}
            <div
              aria-hidden="true"
              className="le-fc-in-phone pointer-events-none absolute bottom-[3%] right-[2.5%] z-10 hidden w-[16.5%] min-w-[7rem] sm:block"
            >
              <div ref={phoneRef}>
                <div className="rounded-[1.85rem] bg-[linear-gradient(145deg,#f8f5ec_0%,#d8d1bd_52%,#ece7d8_100%)] p-[3px] shadow-[0_36px_60px_-26px_rgba(38,31,21,0.62),0_10px_22px_-14px_rgba(38,31,21,0.35)]">
                  <div className="rounded-[1.7rem] bg-[#16130e] p-[4px]">
                    <div
                      ref={screenRef}
                      className="relative aspect-[9/19.5] overflow-hidden rounded-[1.42rem] bg-white"
                    >
                      {client.pages.map((p, i) =>
                        seen[shown][i] || i === page || i === page + 1 ? (
                          <div
                            key={p.href}
                            data-page={i}
                            data-on={i === page}
                            className="le-fc-pg absolute inset-x-0 top-0"
                          >
                            <div data-scroll className="will-change-transform">
                              <Image
                                src={p.phone}
                                alt=""
                                sizes={PHONE_SIZES}
                                placeholder="blur"
                                className="block h-auto w-full"
                              />
                            </div>
                          </div>
                        ) : null,
                      )}
                      {cardClient && card && (
                        <span
                          key={card.n}
                          className="le-fc-card"
                          style={{ background: cardClient.brand }}
                        />
                      )}
                      <span className="absolute left-1/2 top-[6px] z-10 h-[13px] w-[34%] -translate-x-1/2 rounded-full bg-[#16130e]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* the next client's homepage, fetched ahead of its turn */}
          {!reduced && page >= client.pages.length - 2 && (
            <div aria-hidden="true" className="pointer-events-none absolute h-px w-px overflow-hidden opacity-0">
              <Image src={nextClient.pages[0].desktop} alt="" loading="eager" sizes={VIEW_SIZES} />
              <Image src={nextClient.pages[0].phone} alt="" loading="eager" sizes={PHONE_SIZES} />
            </div>
          )}
        </div>

        {/* the case */}
        <div
          key={client.number}
          onPointerEnter={(e) => {
            if (e.pointerType === "mouse") readingRef.current = true;
          }}
          onPointerLeave={() => {
            readingRef.current = false;
          }}
          className="le-fc-copy mt-10 lg:col-start-1 lg:row-start-3 lg:mt-8"
        >
          <p className="max-w-[31rem] font-sans text-[0.98rem] leading-relaxed text-[#261f15]/75">
            {client.story}
          </p>
          <dl className="mt-7 grid max-w-[31rem] grid-cols-3 border-t border-[#261f15]/12 pt-5">
            {stats.map((n, i) => (
              <div
                key={n.label}
                className={i > 0 ? "border-l border-[#261f15]/10 pl-5" : "pr-5"}
              >
                <dt className="sr-only">{n.label}</dt>
                <dd>
                  <span className="block font-heading font-thin not-italic text-[2.6rem] leading-none text-[#a67c3d]">
                    {n.value}
                  </span>
                  <span
                    aria-hidden="true"
                    className="mt-2.5 block font-sans text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-[#261f15]/55"
                  >
                    {n.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
          <a
            href={client.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group/visit mt-7 inline-flex items-center gap-2 border-b border-[#261f15]/25 pb-1 font-sans text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#261f15] transition-colors duration-300 hover:border-[#a67c3d] hover:text-[#a67c3d]"
          >
            Visit {client.domain}
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-500 ease-[cubic-bezier(0.34,1.2,0.4,1)] group-hover/visit:-translate-y-0.5 group-hover/visit:translate-x-0.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
