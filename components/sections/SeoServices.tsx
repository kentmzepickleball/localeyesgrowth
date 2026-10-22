"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Noise } from "@/components/effects/Noise";
import { MARKS, type MarkKey } from "./SeoOrbitMarks";

gsap.registerPlugin(ScrollTrigger);

/* ----------------------------------------------------------------------
   SeoServices — "the orrery"
   The LE monogram sits at the centre of a small solar system; the places
   people search fly around it in their own colours, one orbit per
   discipline:
     01 inner  — Google, Bing, DuckDuckGo            (search results)
     02 middle — ChatGPT, Gemini, Perplexity, Claude (AI answers)
     03 outer  — Google Maps, reviews, Yelp, Apple Maps (the map pack)
   Read without any copy: each orbit is named just outside the point
   where it crosses the axis (wide screens), the lit orbit glows and its
   platforms are wired to the monogram by flowing gold lines, and the
   strip under the stage shows what a client actually sees there — their
   search, then "Your Business" at #1, recommended by the AI, top of the
   map.
   - True perspective, not flat ellipses: every point is projected from a
     tilted plane through a camera, so orbits swell toward the viewer
     (their near halves drawn stronger than the far ones), the glazed
     porcelain tokens grow as they come forward and, as they recede, keep
     their solid disc while a cream veil softens the mark — then pass
     BEHIND the monogram (z-sorted against it every frame).
   - Entrance: the camera starts edge-on — every orbit a single hairline —
     and tilts up until the system opens like an eye (LocalEyes). Once.
     After that it keeps breathing a couple of degrees (BREATHE_S), and
     now and then a band of light crosses the monogram's lacquer.
   - The disciplines drive the orbits: one is lit at a time, advancing
     every CYCLE_MS while in view; hovering a discipline takes over.
   - One rAF loop writes transforms/opacity straight to the DOM (no React
     renders per frame) and only runs while the stage is on screen.
     Reduced motion: a single still frame, no loop, no auto-advance.
   Tune: orbit radius/period/phase in DISCIPLINES, camera in TILT and
   PERSPECTIVE, the searches in QUERIES and their answers in Answer.
   ---------------------------------------------------------------------- */

const TAU = Math.PI * 2;
/** how long each discipline stays lit before the next one takes over */
const CYCLE_MS = 6500;
/** camera distance, in outer-orbit radii — lower = stronger perspective */
const PERSPECTIVE = 4.2;
/** sin of the camera's final elevation above the orbit plane, per width */
const TILT = { phone: 0.7, tablet: 0.52, desktop: 0.4 };
/** the entrance — camera tilts up from edge-on over this long */
const INTRO_MS = 2600;
/** one slow breath of the camera (a couple of degrees up and back), s */
const BREATHE_S = 18;

type Platform = { mark: MarkKey; name: string };

type Discipline = {
  number: string;
  kicker: string;
  /** the orbit's name on the stage */
  orbit: string;
  title: string;
  description: string;
  platforms: Platform[];
  /** orbit radius as a share of the outer orbit */
  radius: number;
  /** seconds per revolution — inner rings run faster, like a real orrery */
  period: number;
  /** starting angle (radians) so the rings never line up */
  phase: number;
};

const DISCIPLINES: Discipline[] = [
  {
    number: "01",
    kicker: "Rankings",
    orbit: "Search",
    title: "Site Search Results",
    description:
      "Strategic, precise SEO built to hit your ranking goals — and turn Google searches into real, qualified leads.",
    platforms: [
      { mark: "google", name: "Google" },
      { mark: "bing", name: "Bing" },
      { mark: "duckduckgo", name: "DuckDuckGo" },
    ],
    radius: 0.42,
    period: 34,
    phase: 0.5,
  },
  {
    number: "02",
    kicker: "AI Search",
    orbit: "AI Answers",
    title: "AI Features & Snippets",
    description:
      "Writing engineered to be cited — placing you at the very top of results, whatever your clients are searching for.",
    platforms: [
      { mark: "chatgpt", name: "ChatGPT" },
      { mark: "gemini", name: "Gemini" },
      { mark: "perplexity", name: "Perplexity" },
      { mark: "claude", name: "Claude" },
    ],
    radius: 0.69,
    period: 50,
    phase: 2.1,
  },
  {
    number: "03",
    kicker: "Google Maps",
    orbit: "Maps",
    title: "Local Map Pack Results",
    description:
      "Google Business Profile optimization tailored to lift you into the local map pack — where nearby clients decide.",
    platforms: [
      { mark: "googlemaps", name: "Google Maps" },
      { mark: "reviews", name: "Reviews" },
      { mark: "yelp", name: "Yelp" },
      { mark: "apple", name: "Apple Maps" },
    ],
    radius: 1,
    period: 70,
    phase: 1.2,
  },
];

/* Every platform as one planet, flattened for the frame loop */
const PLANETS = DISCIPLINES.flatMap((discipline, ring) =>
  discipline.platforms.map((platform, i) => ({
    ...platform,
    ring,
    angle: discipline.phase + (i / discipline.platforms.length) * TAU,
  })),
);

/* Small brand stars scattered on the stage — [left %, top %, size px, delay s] */
const STARS: [number, number, number, number][] = [
  [9, 14, 11, 0],
  [91, 12, 9, 1.8],
  [96, 70, 8, 3.1],
  [77, 92, 12, 0.9],
  [30, 6, 7, 2.4],
  [58, 97, 8, 4.2],
];

const SEAL_TEXT = "LOCALEYES ✦ SEO GROWTH SYSTEMS ✦ FOUND FIRST ✦ ";

/* ------------------------------------------------------------------ */
/* geometry                                                            */
/* ------------------------------------------------------------------ */

type View = {
  /** stage centre, px */
  cx: number;
  cy: number;
  /** outer orbit radius on the plane, px at the stage's depth */
  R: number;
  /** final camera elevation, radians */
  elev: number;
  /** planet diameter and monogram radius, px */
  planet: number;
  medal: number;
  /** phone layout — higher camera, no seal */
  compact: boolean;
};

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);
const smoothstep = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

/* Fit the largest system that clears the stage on every side — the
   orbit's widest point, its front (planets grow there) plus a name
   label, and the taller of the far orbit or the monogram's seal — then
   cap it so the orbit names have room between the rings. On phones the
   camera sits higher, the monogram drops its seal (see the CSS) and the
   outer orbit may reach into the page gutter, so the inner rings stay
   clear of the monogram. Perspective scales are ratios of the camera
   distance, so with D tied to R they are constants. */
function fitView(w: number, h: number): View {
  const phone = w < 640;
  const sinE = phone ? TILT.phone : w < 1024 ? TILT.tablet : TILT.desktop;
  const elev = Math.asin(sinE);
  const cosE = Math.cos(elev);
  const planet = phone ? 34 : clamp(w * 0.042, 38, 60);
  const medal = phone ? 30 : clamp(w * 0.05, 40, 70);
  const front = PERSPECTIVE / (PERSPECTIVE - cosE);
  const back = PERSPECTIVE / (PERSPECTIVE + cosE);
  const label = 24;
  const padX = phone ? -18 : 8;
  const padY = 12;
  const seal = medal + (phone ? 10 : 30);

  /* widest point of a perspective circle sits ~13° toward the camera,
     at ~1.03R */
  const byWidth = (w / 2 - padX - planet * (phone ? 0.5 : 0.62)) / 1.03;
  const byFarSide =
    (h - 2 * padY - label - (planet / 2) * (front + back)) /
    (sinE * (front + back));
  const bySeal =
    (h - 2 * padY - seal - label - (planet / 2) * front) / (sinE * front);
  const byLayout = w * (phone ? 0.5 : w < 1024 ? 0.42 : 0.43);
  const R = Math.max(40, Math.min(byWidth, byFarSide, bySeal, byLayout));

  const top = Math.max(R * sinE * back + (planet / 2) * back, seal);
  const bottom = R * sinE * front + (planet / 2) * front + label;
  const cy = (h - top - bottom) / 2 + top;
  return { cx: w / 2, cy, R, elev, planet, medal, compact: phone };
}

/* Project a point on the orbit plane (radius r, angle th) through the
   camera. depth > 0 is toward the viewer; s is the perspective scale. */
function project(R: number, sinE: number, cosE: number, r: number, th: number) {
  const X = r * Math.cos(th);
  const Z = r * Math.sin(th);
  const depth = Z * cosE;
  const s = (PERSPECTIVE * R) / (PERSPECTIVE * R - depth);
  return { x: X * s, y: Z * sinE * s, depth, s };
}

/* An orbit (or part of one) as an SVG path, sampled through the camera */
function arcPath(
  v: View,
  sinE: number,
  cosE: number,
  r: number,
  th0 = 0,
  th1 = TAU,
  steps = 120,
) {
  let d = "";
  for (let i = 0; i <= steps; i++) {
    const p = project(v.R, sinE, cosE, r, lerp(th0, th1, i / steps));
    d += `${i ? "L" : "M"}${(v.cx + p.x).toFixed(1)} ${(v.cy + p.y).toFixed(1)}`;
  }
  return d;
}

/* A graduated bezel just outside the outer orbit — a minor tick every
   3°, a long one every 30° — drawn on the plane, so it foreshortens
   with everything else */
function bezelPath(v: View, sinE: number, cosE: number, r: number) {
  let d = "";
  for (let i = 0; i < 120; i++) {
    const th = (i / 120) * TAU;
    const a = project(v.R, sinE, cosE, r, th);
    const b = project(v.R, sinE, cosE, r + (i % 10 === 0 ? 14 : 6), th);
    d += `M${(v.cx + a.x).toFixed(1)} ${(v.cy + a.y).toFixed(1)}L${(v.cx + b.x).toFixed(1)} ${(v.cy + b.y).toFixed(1)}`;
  }
  return d;
}

/* ------------------------------------------------------------------ */
/* marks                                                               */
/* ------------------------------------------------------------------ */

/* A platform mark — in its brand colours, or as a one-colour glyph
   (fill: currentColor) for the quieter discipline list. Gradient ids
   are fixed, so colour is only ever rendered once per page: on the
   planets. */
function Mark({
  mark,
  color = false,
  className,
}: {
  mark: MarkKey;
  color?: boolean;
  className?: string;
}) {
  const { paths, evenodd, gradients } = MARKS[mark];
  const rule = evenodd ? "evenodd" : undefined;
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      fill="currentColor"
      className={className}
    >
      {color && gradients && (
        <defs>
          {gradients.map((g) => (
            <linearGradient
              key={g.id}
              id={g.id}
              x1={g.x1}
              y1={g.y1}
              x2={g.x2}
              y2={g.y2}
              gradientUnits={g.user ? "userSpaceOnUse" : undefined}
            >
              {g.stops.map(([offset, stopColor, opacity]) => (
                <stop
                  key={offset}
                  offset={offset}
                  stopColor={stopColor}
                  stopOpacity={opacity}
                />
              ))}
            </linearGradient>
          ))}
        </defs>
      )}
      {paths.map((p, i) => (
        <path
          key={i}
          d={p.d}
          fill={color ? p.fill : undefined}
          fillRule={rule}
          clipRule={rule}
        />
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* "what your clients see" — one strip per orbit                       */
/* ------------------------------------------------------------------ */

function Stars() {
  return (
    <span aria-hidden="true" className="tracking-[0.12em] text-[#e0a526]">
      ★★★★★
    </span>
  );
}

/* What a client types, and where — then, after the arrow, what they
   find: "Your Business" at the top. One strip per orbit. */
const QUERIES: { mark: MarkKey; text: string }[] = [
  { mark: "google", text: "coffee cart catering near me" },
  { mark: "chatgpt", text: "Best coffee cart for a wedding?" },
  { mark: "googlemaps", text: "coffee cart near me" },
];

function Answer({ ring }: { ring: number }) {
  const badge =
    "grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#261f15] font-heading text-[0.95rem] leading-none text-[#c6a66a]";
  const name =
    "font-heading text-[1.3rem] leading-[1.05] text-[#261f15] sm:text-[1.4rem]";
  const meta = "mt-1 truncate font-sans text-[0.66rem] text-[#261f15]/50";
  const flag =
    "ml-auto hidden shrink-0 self-center font-sans text-[0.52rem] font-semibold uppercase tracking-[0.22em] text-[#a67c3d] sm:block";

  if (ring === 1)
    return (
      <div className="flex min-w-0 flex-1 items-center gap-3.5">
        <span className={badge}>✦</span>
        <p className="min-w-0 font-sans text-[0.8rem] leading-snug text-[#261f15]/65">
          &ldquo;Book{" "}
          <span className="font-heading text-[1.15rem] text-[#261f15]">
            Your Business
          </span>{" "}
          — top-rated near you.&rdquo;
        </p>
        <span className={flag}>Recommended by AI</span>
      </div>
    );
  return (
    <div className="flex min-w-0 flex-1 items-center gap-3.5">
      {ring === 0 ? (
        <span className={badge}>#1</span>
      ) : (
        <Mark mark="googlemaps" color className="h-9 w-9 shrink-0" />
      )}
      <div className="min-w-0">
        <p className={name}>Your Business</p>
        <p className={meta}>
          {ring === 0 ? "yourbusiness.com · " : "4.9 "}
          <Stars />
          {ring === 2 && " · Open now"}
        </p>
      </div>
      <span className={flag}>{ring === 0 ? "Top of Google" : "Top 3 on Maps"}</span>
    </div>
  );
}

function ResultStrip({ ring }: { ring: number }) {
  const { mark, text } = QUERIES[ring];
  return (
    <>
      {/* the search */}
      <div className="flex min-w-0 items-center gap-2.5 rounded-full border border-[#261f15]/10 bg-[#ededd5]/80 py-2.5 pl-3 pr-5 lg:w-[19rem] lg:shrink-0">
        <Mark mark={mark} color className="h-4 w-4 shrink-0" />
        <span className="truncate font-sans text-[0.74rem] text-[#261f15]/70">
          {text}
        </span>
      </div>
      {/* leads to */}
      <span
        aria-hidden="true"
        className="hidden shrink-0 items-center text-[#a67c3d] lg:flex"
      >
        <span className="h-px w-8 bg-[#a67c3d]/60" />
        <svg viewBox="0 0 8 10" className="-ml-px h-2.5 w-2" fill="currentColor">
          <path d="M0 0l8 5-8 5z" />
        </svg>
      </span>
      {/* what they find */}
      <Answer ring={ring} />
    </>
  );
}

/* ------------------------------------------------------------------ */

export default function SeoServices() {
  const headRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const floorRef = useRef<HTMLDivElement>(null);
  const auraRef = useRef<HTMLDivElement>(null);
  const medalRef = useRef<HTMLDivElement>(null);
  const planesRef = useRef<SVGGElement>(null);
  const orbitRefs = useRef<(SVGPathElement | null)[]>([]);
  const glowRefs = useRef<(SVGPathElement | null)[]>([]);
  const leadRefs = useRef<(SVGLineElement | null)[]>([]);
  const notchRefs = useRef<(SVGCircleElement | null)[]>([]);
  const veilRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const bezelRef = useRef<SVGPathElement>(null);
  const cometRefs = useRef<(SVGPathElement | null)[]>([]);
  const cometGradRefs = useRef<(SVGLinearGradientElement | null)[]>([]);
  const sparkRefs = useRef<(SVGCircleElement | null)[]>([]);
  const spokeRefs = useRef<(SVGLineElement | null)[]>([]);
  const tagRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const planetRefs = useRef<(HTMLDivElement | null)[]>([]);
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const barRefs = useRef<(HTMLSpanElement | null)[]>([]);
  /* repaints the still frame under reduced motion */
  const paintRef = useRef<(() => void) | null>(null);

  /* The lit discipline. React owns it for classes; the frame loop reads
     the ref so a hover lands on the very next frame. */
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const hoverRef = useRef(false);
  const cycleRef = useRef(0);

  const [reduced, setReduced] = useState(false);
  /* flips once the stage has been seen — brings in the monogram and the
     result strip */
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(motion.matches);
    update();
    motion.addEventListener("change", update);
    return () => motion.removeEventListener("change", update);
  }, []);

  const pick = useCallback((index: number) => {
    if (activeRef.current !== index) {
      const bar = barRefs.current[activeRef.current];
      if (bar) bar.style.transform = "scaleX(0)";
    }
    activeRef.current = index;
    setActive(index);
  }, []);

  /* ------------------------------ the orrery ------------------------ */
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    let view = fitView(stage.clientWidth, stage.clientHeight);
    let raf: number | null = null;
    let last = 0;
    /* orbit clock (s) — only advances while visible, so the system never
       jumps after being scrolled away */
    let clock = 0;
    let introStart: number | null = reduced ? -Infinity : null;
    let geometryDirty = true;
    const act: number[] = DISCIPLINES.map((_, i) =>
      i === activeRef.current ? 1 : 0,
    );
    /* where each orbit name sits, and half its size (0 while hidden) */
    const tagX = DISCIPLINES.map(() => 0);
    const tagHalf = DISCIPLINES.map(() => ({ w: 0, h: 0 }));
    /* each planet's screen position and radius this frame */
    const seen = PLANETS.map(() => ({ x: 0, y: 0, r: 0 }));

    /* sizes the CSS reads (planet diameter, monogram radius) and the
       pieces pinned to the centre */
    const applyView = () => {
      stage.style.setProperty("--p", `${view.planet}px`);
      stage.style.setProperty("--m", `${view.medal}px`);
      stage.dataset.compact = String(view.compact);
      for (const el of [medalRef.current, auraRef.current, floorRef.current]) {
        if (!el) continue;
        el.style.left = `${view.cx}px`;
        el.style.top = `${view.cy}px`;
      }
      const floor = floorRef.current;
      if (floor) {
        floor.style.width = `${view.R * 2.5}px`;
        floor.style.height = `${view.R * 2.5 * Math.sin(view.elev)}px`;
      }
      tagRefs.current.forEach((tag, i) => {
        tagHalf[i] = tag
          ? { w: tag.offsetWidth / 2, h: tag.offsetHeight / 2 }
          : { w: 0, h: 0 };
      });
      geometryDirty = true;
    };
    applyView();

    const render = (now: number) => {
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      if (!reduced) clock += dt;

      /* entrance progress: 0 edge-on → 1 settled */
      const p =
        introStart === null
          ? 0
          : introStart === -Infinity
            ? 1
            : clamp((now - introStart) / INTRO_MS, 0, 1);
      const e = easeOutQuart(p);
      /* once settled, the camera keeps breathing — a slow rise and fall
         of a couple of degrees, so the system always reads as 3D */
      const breathe = reduced
        ? 0
        : Math.sin((clock * TAU) / BREATHE_S) * 0.028 * smoothstep(0.8, 1, p);
      const elev = lerp(0.015, view.elev, e) + breathe;
      const sinE = Math.sin(elev);
      const cosE = Math.cos(elev);
      const spread = lerp(0.88, 1, e);

      /* auto-advance — paused on hover, never under reduced motion */
      if (!reduced && p >= 1 && !hoverRef.current) {
        cycleRef.current += dt * 1000;
        if (cycleRef.current >= CYCLE_MS) {
          cycleRef.current = 0;
          pick((activeRef.current + 1) % DISCIPLINES.length);
        }
      }
      const bar = barRefs.current[activeRef.current];
      if (bar) {
        const fill =
          reduced || hoverRef.current ? 1 : cycleRef.current / CYCLE_MS;
        bar.style.transform = `scaleX(${fill.toFixed(4)})`;
      }

      /* each ring eases toward lit / unlit */
      const k = reduced ? 1 : 1 - Math.exp(-dt * 5);
      act.forEach((value, i) => {
        act[i] = value + ((i === activeRef.current ? 1 : 0) - value) * k;
      });

      /* orbits, glows, tags, bezel and floor — they follow the camera,
         so they're redrawn while it moves (only resizes under reduced
         motion) */
      if (geometryDirty || p < 1 || breathe !== 0) {
        DISCIPLINES.forEach((d, i) => {
          const r = d.radius * view.R * spread;
          /* far half (behind the monogram) and near half, drawn apart so
             the near one can read stronger */
          const far = arcPath(view, sinE, cosE, r, Math.PI, TAU, 60);
          const near = arcPath(view, sinE, cosE, r, 0, Math.PI, 60);
          orbitRefs.current[i * 2]?.setAttribute("d", far);
          orbitRefs.current[i * 2 + 1]?.setAttribute("d", near);
          glowRefs.current[i * 2]?.setAttribute("d", near);
          glowRefs.current[i * 2 + 1]?.setAttribute("d", near);
          /* each orbit is named just outside the point where it crosses
             the axis (depth 0, so the camera tilt never moves it) — in
             the clear band between this orbit's tokens and the next
             one's, tied back to the orbit by a short gold lead */
          const cross = view.cx + r;
          const left = cross + view.planet * 0.5 + 6;
          tagX[i] = left + tagHalf[i].w;
          const tag = tagRefs.current[i];
          if (tag)
            tag.style.transform = `translate3d(${tagX[i].toFixed(1)}px, ${view.cy.toFixed(1)}px, 0) translate(-50%, -50%)`;
          const lead = leadRefs.current[i];
          if (lead) {
            lead.setAttribute("x1", cross.toFixed(1));
            lead.setAttribute("x2", (left - 3).toFixed(1));
            lead.setAttribute("y1", view.cy.toFixed(1));
            lead.setAttribute("y2", view.cy.toFixed(1));
          }
          const notch = notchRefs.current[i];
          if (notch) {
            notch.setAttribute("cx", cross.toFixed(1));
            notch.setAttribute("cy", view.cy.toFixed(1));
          }
        });
        bezelRef.current?.setAttribute(
          "d",
          bezelPath(view, sinE, cosE, view.R * spread * 1.075),
        );
        if (planesRef.current)
          planesRef.current.style.opacity = `${smoothstep(0, 0.35, p)}`;
        if (floorRef.current)
          floorRef.current.style.transform = `translate(-50%, -50%) scaleY(${(sinE / Math.sin(view.elev)).toFixed(4)})`;
        geometryDirty = false;
      }

      /* the planets, and the gold lines wiring the lit ones to the
         monogram — dashes flow outward, from LocalEyes to the platform */
      const depthSpan = view.R * cosE || 1;
      const flow = reduced ? 0 : -((clock * 26) % 9);
      PLANETS.forEach((planet, i) => {
        const el = planetRefs.current[i];
        if (!el) return;
        const d = DISCIPLINES[planet.ring];
        const th = planet.angle - (TAU / d.period) * clock;
        const pt = project(view.R, sinE, cosE, d.radius * view.R * spread, th);
        const near = 0.5 + 0.5 * (pt.depth / depthSpan);
        const arrive = smoothstep(0.18 + i * 0.035, 0.62 + i * 0.035, p);
        const bob = reduced ? 0 : Math.sin(clock * 0.9 + i * 1.7) * 3;
        const scale = (pt.s / 1.08) * lerp(0.5, 1, arrive);
        const x = view.cx + pt.x;
        const y = view.cy + pt.y + bob;

        el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
        el.style.opacity = `${arrive.toFixed(3)}`;
        /* depth: the disc stays solid (no orbit showing through it); a
           cream veil softens the mark the further back it goes */
        const veil = veilRefs.current[i];
        if (veil)
          veil.style.opacity = `${(Math.pow(1 - near, 1.3) * 0.7).toFixed(3)}`;
        seen[i].x = x;
        seen[i].y = y;
        seen[i].r = (view.planet / 2) * scale * arrive;
        /* behind the monogram (200) while on the far side */
        el.style.zIndex = `${Math.round((pt.depth < 0 ? 150 : 250) + (pt.depth / view.R) * 100)}`;

        const label = labelRefs.current[i];
        if (label)
          label.style.opacity = `${(act[planet.ring] * smoothstep(0.62, 0.9, near) * arrive).toFixed(3)}`;

        const spoke = spokeRefs.current[i];
        if (spoke) {
          const lit = act[planet.ring] * arrive * (0.35 + 0.65 * near);
          spoke.style.opacity = `${(lit * 0.85).toFixed(3)}`;
          if (lit > 0.01) {
            spoke.setAttribute("x1", view.cx.toFixed(1));
            spoke.setAttribute("y1", view.cy.toFixed(1));
            spoke.setAttribute("x2", x.toFixed(1));
            spoke.setAttribute("y2", y.toFixed(1));
            spoke.style.strokeDashoffset = `${flow.toFixed(2)}`;
          }
        }
      });

      /* the orbit names sit clear of every token at full desktop width;
         on narrower screens one can still be grazed, so a name steps
         aside while a token flies through it — a mark is never hidden */
      tagRefs.current.forEach((tag, i) => {
        if (!tag || !tagHalf[i].w) return;
        let clear = 1;
        for (const s of seen) {
          const nx = (s.x - tagX[i]) / (tagHalf[i].w + s.r);
          const ny = (s.y - view.cy) / (tagHalf[i].h + s.r);
          clear = Math.min(clear, smoothstep(0.86, 1.12, Math.hypot(nx, ny)));
        }
        const shown = `${(smoothstep(0.72, 1, p) * clear).toFixed(3)}`;
        tag.style.opacity = shown;
        const lead = leadRefs.current[i];
        const notch = notchRefs.current[i];
        if (lead) lead.style.opacity = shown;
        if (notch) notch.style.opacity = `${smoothstep(0.72, 1, p).toFixed(3)}`;
      });

      /* a light runs along the lit ring, a little ahead of its planets */
      DISCIPLINES.forEach((d, i) => {
        const comet = cometRefs.current[i];
        const grad = cometGradRefs.current[i];
        const spark = sparkRefs.current[i];
        if (!comet || !grad || !spark) return;
        const alpha = reduced ? 0 : act[i] * smoothstep(0.6, 1, p);
        comet.style.opacity = spark.style.opacity = `${alpha.toFixed(3)}`;
        if (alpha < 0.01) return;
        const r = d.radius * view.R * spread;
        const head = d.phase + 0.9 - (TAU / d.period) * 2.4 * clock;
        const tail = head + 1.25;
        comet.setAttribute("d", arcPath(view, sinE, cosE, r, tail, head, 28));
        const a = project(view.R, sinE, cosE, r, tail);
        const b = project(view.R, sinE, cosE, r, head);
        grad.setAttribute("x1", `${view.cx + a.x}`);
        grad.setAttribute("y1", `${view.cy + a.y}`);
        grad.setAttribute("x2", `${view.cx + b.x}`);
        grad.setAttribute("y2", `${view.cy + b.y}`);
        spark.setAttribute("cx", `${view.cx + b.x}`);
        spark.setAttribute("cy", `${view.cy + b.y}`);
      });
    };

    const loop = (now: number) => {
      render(now);
      raf = window.requestAnimationFrame(loop);
    };
    const start = () => {
      if (raf !== null || reduced) return;
      last = 0;
      raf = window.requestAnimationFrame(loop);
    };
    const stop = () => {
      if (raf !== null) window.cancelAnimationFrame(raf);
      raf = null;
    };

    /* run only while the stage is on screen; the entrance fires the
       first time a good part of it is visible */
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (introStart === null && entry.intersectionRatio >= 0.3) {
            introStart = performance.now();
            setOpened(true);
          }
          start();
        } else {
          stop();
        }
      },
      { threshold: [0, 0.3] },
    );
    observer.observe(stage);

    const resize = new ResizeObserver(() => {
      view = fitView(stage.clientWidth, stage.clientHeight);
      applyView();
      if (reduced) render(performance.now());
    });
    resize.observe(stage);
    /* the tag numerals are in the display face — re-measure once it lands */
    let alive = true;
    document.fonts?.ready.then(() => {
      if (!alive) return;
      applyView();
      if (reduced) render(performance.now());
    });

    /* reduced motion: one settled, still frame — repainted when the lit
       discipline changes (the stage counts as open from the start, see
       isOpen below) */
    if (reduced) {
      paintRef.current = () => render(performance.now());
      render(performance.now());
    }

    return () => {
      alive = false;
      stop();
      observer.disconnect();
      resize.disconnect();
      paintRef.current = null;
    };
  }, [reduced, pick]);

  useEffect(() => {
    paintRef.current?.();
  }, [active]);

  /* under reduced motion there is no entrance to wait for */
  const isOpen = opened || reduced;

  /* Entrance for the copy — header first, then the disciplines; once */
  useEffect(() => {
    const head = headRef.current;
    const list = listRef.current;
    if (!head || !list) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    /* mobile: skip entrance animation setup entirely — faster paint, less JS work on the slowest devices */
    if (window.matchMedia("(max-width: 767px)").matches) return;

    const tweens = [head, list].map((el) =>
      gsap.fromTo(
        el,
        { autoAlpha: 0, y: 28 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
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
      id="seo"
      className="relative w-full overflow-hidden bg-[#ededd5] text-[#261f15]"
    >
      <style>{`
        .le-orrery .le-orbit {
          fill: none;
          stroke: rgba(38, 31, 21, 0.18);
          stroke-width: 1;
          transition: stroke 0.9s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .le-orrery .le-orbit[data-active="true"] {
          stroke: rgba(166, 124, 61, 0.85);
          stroke-width: 1.25;
        }
        .le-orrery .le-orbit[data-half="far"] {
          opacity: 0.5;
        }
        /* a soft gold light along the near half of the lit orbit — two
           wide, faint strokes under the line read as a glow without a
           blur filter (it's redrawn every frame) */
        .le-orrery .le-glow {
          fill: none;
          stroke: #c6a66a;
          stroke-linecap: round;
          opacity: 0;
          transition: opacity 1.1s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .le-orrery .le-glow[data-active="true"] {
          opacity: 1;
        }
        /* a dot where an orbit crosses the axis, and the short lead out
           to its name */
        .le-lead line {
          stroke: rgba(38, 31, 21, 0.3);
          stroke-width: 1;
          transition: stroke 0.9s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .le-lead circle {
          fill: rgba(38, 31, 21, 0.38);
          transition: fill 0.9s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .le-lead[data-active="true"] line {
          stroke: #a67c3d;
        }
        .le-lead[data-active="true"] circle {
          fill: #a67c3d;
        }

        /* planets — glazed porcelain discs holding a platform's own mark:
           a soft dome of light at the top left, a little weight along the
           lower edge */
        .le-planet {
          position: absolute;
          left: 0;
          top: 0;
          width: var(--p);
          height: var(--p);
          margin: calc(var(--p) / -2) 0 0 calc(var(--p) / -2);
          opacity: 0;
          will-change: transform, opacity;
        }
        .le-pearl {
          position: relative;
          display: grid;
          place-items: center;
          width: 100%;
          height: 100%;
          border-radius: 9999px;
          background:
            radial-gradient(42% 30% at 34% 22%, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0) 70%),
            radial-gradient(120% 120% at 30% 22%, #fdfcf6 0%, #f6f3e6 55%, #e9e4cd 100%);
          box-shadow:
            0 0 0 1px rgba(38, 31, 21, 0.08),
            inset 0 1.5px 0 rgba(255, 255, 255, 0.95),
            inset 0 -3px 6px rgba(120, 96, 52, 0.09),
            0 16px 28px -18px rgba(38, 31, 21, 0.55);
          transition: box-shadow 0.9s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .le-planet[data-active="true"] .le-pearl {
          box-shadow:
            0 0 0 1.5px rgba(166, 124, 61, 0.75),
            0 0 0 6px rgba(198, 166, 106, 0.16),
            inset 0 1.5px 0 rgba(255, 255, 255, 0.95),
            inset 0 -3px 6px rgba(120, 96, 52, 0.09),
            0 18px 30px -16px rgba(166, 124, 61, 0.5);
        }
        .le-pearl svg {
          position: relative;
          width: 46%;
          height: 46%;
        }
        /* cream veil over the mark — the frame loop thickens it with depth */
        .le-veil {
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          background: #f1eedf;
          opacity: 0;
          pointer-events: none;
        }
        .le-planet-name {
          position: absolute;
          left: 50%;
          top: calc(100% + 10px);
          transform: translateX(-50%);
          white-space: nowrap;
          font-size: 0.56rem;
          font-weight: 600;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: rgba(38, 31, 21, 0.7);
          opacity: 0;
        }

        /* orbit names — just outside each orbit's crossing of the axis
           (display comes from the lg: utilities on the element) */
        .le-tag {
          position: absolute;
          left: 0;
          top: 0;
          z-index: 420;
          align-items: center;
          gap: 0.35rem;
          white-space: nowrap;
          border-radius: 9999px;
          border: 1px solid rgba(38, 31, 21, 0.12);
          background: #f6f3e4;
          padding: 0.36rem 0.55rem 0.36rem 0.5rem;
          font-size: 0.52rem;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(38, 31, 21, 0.55);
          /* opacity is the frame loop's (entrance + stepping aside) */
          opacity: 0;
          will-change: opacity;
          transition:
            color 0.9s cubic-bezier(0.22, 1, 0.36, 1),
            border-color 0.9s cubic-bezier(0.22, 1, 0.36, 1),
            box-shadow 0.9s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .le-tag[data-active="true"] {
          color: #261f15;
          border-color: rgba(166, 124, 61, 0.7);
          box-shadow: 0 10px 22px -14px rgba(166, 124, 61, 0.8);
        }
        .le-tag-num {
          font-family: var(--font-heading);
          font-size: 0.82rem;
          font-weight: 100;
          letter-spacing: 0;
          color: rgba(38, 31, 21, 0.4);
          transition: color 0.9s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .le-tag[data-active="true"] .le-tag-num {
          color: #a67c3d;
        }

        /* the monogram — fades and settles in when the stage opens */
        .le-medal {
          position: absolute;
          z-index: 200;
          width: calc(var(--m) * 2);
          height: calc(var(--m) * 2);
          transform: translate(-50%, -50%) scale(0.82);
          opacity: 0;
          transition:
            opacity 1.4s cubic-bezier(0.22, 1, 0.36, 1) 0.15s,
            transform 1.8s cubic-bezier(0.22, 1, 0.36, 1) 0.15s;
        }
        .le-orrery[data-open="true"] .le-medal {
          transform: translate(-50%, -50%) scale(1);
          opacity: 1;
        }
        .le-seal {
          position: absolute;
          inset: -30px;
          animation: le-spin-slow 70s linear infinite;
        }
        /* too small to read on a phone — the monogram stands alone
           (data-compact is set from the same width fitView measures) */
        .le-orrery[data-compact="true"] .le-seal {
          display: none;
        }
        /* now and then a band of light crosses the lacquer — under the
           letters, which stay flat gold */
        @keyframes le-sheen {
          0%, 62% { transform: translateX(-130%) rotate(18deg); }
          92%, 100% { transform: translateX(130%) rotate(18deg); }
        }
        .le-sheen {
          position: absolute;
          inset: -30% 10%;
          background: linear-gradient(
            90deg,
            rgba(255, 246, 225, 0) 0%,
            rgba(255, 246, 225, 0.13) 45%,
            rgba(255, 246, 225, 0.2) 50%,
            rgba(255, 246, 225, 0.13) 55%,
            rgba(255, 246, 225, 0) 100%
          );
          animation: le-sheen 8s cubic-bezier(0.45, 0, 0.2, 1) 3s infinite;
          transform: translateX(-130%) rotate(18deg);
          pointer-events: none;
        }

        /* the gold fill on a discipline's hairline — scaled by the frame
           loop through transform (a Tailwind scale-x utility would set the
           separate scale property and multiply it back to zero) */
        .le-bar {
          transform: scaleX(0);
          transform-origin: left center;
        }

        /* the result strips — one per orbit, cross-fading in place */
        .le-result {
          grid-area: 1 / 1;
          opacity: 0;
          transform: translateY(10px);
          transition:
            opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1),
            transform 0.9s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .le-result[data-active="true"] {
          opacity: 1;
          transform: none;
          transition-delay: 0.12s;
        }
        .le-results {
          opacity: 0;
          transition: opacity 1.2s cubic-bezier(0.22, 1, 0.36, 1) 1.9s;
        }
        .le-figure[data-open="true"] .le-results {
          opacity: 1;
        }

        @keyframes le-twinkle {
          0%, 100% { opacity: 0.18; transform: scale(0.7) rotate(0deg); }
          50% { opacity: 0.85; transform: scale(1) rotate(45deg); }
        }
        .le-twinkle {
          animation: le-twinkle 5.5s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .le-seal, .le-twinkle, .le-sheen { animation: none; }
          .le-medal, .le-tag, .le-result, .le-results { transition: none; }
        }
      `}</style>

      {/* Film grain — above the cream, below every piece of content */}
      <Noise
        patternAlpha={10}
        patternRefreshInterval={reduced ? 1_000_000_000 : 2}
      />

      <div className="relative z-20 mx-auto w-full max-w-[1480px] px-6 py-20 md:px-12 md:py-28">
        {/* ------------------------- header --------------------------- */}
        <div ref={headRef}>
          <p className="flex items-center gap-4 font-sans text-[0.62rem] font-semibold uppercase tracking-[0.3em] text-[#a67c3d] sm:text-xs">
            <span aria-hidden="true" className="text-[0.8em]">
              ✦
            </span>
            What We Do
            <span aria-hidden="true" className="h-px flex-1 bg-[#261f15]/10" />
          </p>

          <div className="mt-6 flex flex-col gap-6 md:mt-8 md:flex-row md:items-end md:justify-between md:gap-12">
            <h2 className="font-heading font-thin not-italic text-[clamp(5.5rem,12vw,10rem)] leading-[0.85] tracking-[-0.03em] text-[#261f15]">
              SEO
            </h2>
            <p className="max-w-sm font-sans text-sm leading-relaxed text-[#261f15]/70 sm:text-[0.95rem] md:pb-3">
              Only the newest practices that actually move rankings — applied as
              fast as Google allows. Never the outdated, box&#8209;ticking work
              that looks like effort and delivers little.
            </p>
          </div>
        </div>

        {/* ------------------------- the orrery ----------------------- */}
        <div data-open={isOpen} className="le-figure relative mt-6 md:mt-4">
          <div
            ref={stageRef}
            aria-hidden="true"
            data-open={isOpen}
            className="le-orrery relative aspect-[1/0.95] w-full select-none sm:aspect-[16/10] lg:aspect-[2.2/1] 2xl:aspect-[2.3/1]"
          >
            {/* the plane itself — a faint warm floor under the system */}
            <div
              ref={floorRef}
              className="pointer-events-none absolute rounded-[50%] bg-[radial-gradient(closest-side,rgba(166,124,61,0.11),rgba(166,124,61,0.04)_62%,transparent)]"
            />
            {/* gold aura behind the monogram — a glow, never a spotlight */}
            <div
              ref={auraRef}
              className="pointer-events-none absolute h-[calc(var(--m)*5.4)] w-[calc(var(--m)*5.4)] -translate-x-1/2 -translate-y-1/2"
            >
              <div className="h-full w-full rounded-full bg-[radial-gradient(closest-side,rgba(198,166,106,0.42),rgba(198,166,106,0.12)_45%,transparent)] animate-le-breathe" />
            </div>

            <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
              <defs>
                {DISCIPLINES.map((d, i) => (
                  <linearGradient
                    key={d.number}
                    id={`le-comet-${i}`}
                    ref={(el) => {
                      cometGradRefs.current[i] = el;
                    }}
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0" stopColor="#c6a66a" stopOpacity="0" />
                    <stop offset="0.7" stopColor="#c6a66a" stopOpacity="0.55" />
                    <stop offset="1" stopColor="#a67c3d" stopOpacity="1" />
                  </linearGradient>
                ))}
              </defs>
              <g ref={planesRef} style={{ opacity: 0 }}>
                <path
                  ref={bezelRef}
                  fill="none"
                  stroke="rgba(38,31,21,0.18)"
                  strokeWidth="1"
                />
                {DISCIPLINES.map((d, i) => (
                  <g key={d.number} data-active={active === i} className="le-glow">
                    {[
                      [9, 0.07],
                      [3.5, 0.16],
                    ].map(([width, alpha], w) => (
                      <path
                        key={width}
                        ref={(el) => {
                          glowRefs.current[i * 2 + w] = el;
                        }}
                        strokeWidth={width}
                        strokeOpacity={alpha}
                      />
                    ))}
                  </g>
                ))}
                {DISCIPLINES.map((d, i) =>
                  (["far", "near"] as const).map((half, h) => (
                    <path
                      key={`${d.number}-${half}`}
                      ref={(el) => {
                        orbitRefs.current[i * 2 + h] = el;
                      }}
                      data-active={active === i}
                      data-half={half}
                      className="le-orbit"
                    />
                  )),
                )}
                {/* the leads from each orbit to its name (desktop) */}
                {DISCIPLINES.map((d, i) => (
                  <g key={d.number} data-active={active === i} className="le-lead">
                    <line
                      ref={(el) => {
                        leadRefs.current[i] = el;
                      }}
                      style={{ opacity: 0 }}
                    />
                    <circle
                      ref={(el) => {
                        notchRefs.current[i] = el;
                      }}
                      r="2.4"
                      style={{ opacity: 0 }}
                    />
                  </g>
                ))}
                {PLANETS.map((planet, i) => (
                  <line
                    key={planet.name}
                    ref={(el) => {
                      spokeRefs.current[i] = el;
                    }}
                    stroke="#a67c3d"
                    strokeWidth="1"
                    strokeDasharray="2 7"
                    strokeLinecap="round"
                    style={{ opacity: 0 }}
                  />
                ))}
                {DISCIPLINES.map((d, i) => (
                  <g key={d.number}>
                    <path
                      ref={(el) => {
                        cometRefs.current[i] = el;
                      }}
                      fill="none"
                      stroke={`url(#le-comet-${i})`}
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      style={{ opacity: 0 }}
                    />
                    <circle
                      ref={(el) => {
                        sparkRefs.current[i] = el;
                      }}
                      r="2.6"
                      fill="#a67c3d"
                      style={{ opacity: 0 }}
                    />
                  </g>
                ))}
              </g>
            </svg>

            {STARS.map(([left, top, size, delay]) => (
              <span
                key={`${left}-${top}`}
                className="le-twinkle pointer-events-none absolute font-heading leading-none text-[#a67c3d]"
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                  fontSize: size,
                  animationDelay: `${delay}s`,
                }}
              >
                ✦
              </span>
            ))}

            {/* The monogram — LE in the display face, gold on ink, inside a
               slowly turning seal (same voice as the hero badge) */}
            <div ref={medalRef} className="le-medal">
              <svg viewBox="0 0 200 200" className="le-seal" fill="none">
                <defs>
                  <path
                    id="le-orrery-seal"
                    d="M 100,100 m -84,0 a 84,84 0 1,1 168,0 a 84,84 0 1,1 -168,0"
                  />
                </defs>
                <text
                  className="font-sans"
                  fill="#261f15"
                  fillOpacity="0.55"
                  fontSize="9.2"
                  fontWeight="600"
                >
                  <textPath
                    href="#le-orrery-seal"
                    startOffset="0"
                    textLength={522}
                    lengthAdjust="spacing"
                  >
                    {SEAL_TEXT}
                  </textPath>
                </text>
              </svg>
              <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-[#261f15] shadow-[0_0_0_1px_rgba(38,31,21,0.12),0_0_0_7px_rgba(237,237,213,0.55),0_0_0_8px_rgba(166,124,61,0.35),0_30px_60px_-24px_rgba(38,31,21,0.7)]">
                <span aria-hidden="true" className="le-sheen" />
                <span
                  aria-hidden="true"
                  className="absolute inset-[6px] rounded-full border border-[#c6a66a]/35"
                />
                <span className="relative font-heading text-[calc(var(--m)*0.86)] leading-none tracking-[-0.02em] text-[#c6a66a]">
                  LE
                </span>
              </div>
            </div>

            {PLANETS.map((planet, i) => (
              <div
                key={planet.name}
                ref={(el) => {
                  planetRefs.current[i] = el;
                }}
                data-active={active === planet.ring}
                className="le-planet"
              >
                <div className="le-pearl">
                  <Mark mark={planet.mark} color />
                  <span
                    ref={(el) => {
                      veilRefs.current[i] = el;
                    }}
                    className="le-veil"
                  />
                </div>
                <span
                  ref={(el) => {
                    labelRefs.current[i] = el;
                  }}
                  className="le-planet-name font-sans"
                >
                  {planet.name}
                </span>
              </div>
            ))}

            {/* orbit names — wide screens only (from xl the bands between
               the orbits are wide enough to hold them clear of every
               token); narrower screens get the name on the result strip
               instead. Pointing at one lights its orbit, like the
               disciplines below. */}
            {DISCIPLINES.map((d, i) => (
              <span
                key={d.number}
                ref={(el) => {
                  tagRefs.current[i] = el;
                }}
                data-active={active === i}
                onMouseEnter={() => {
                  hoverRef.current = true;
                  pick(i);
                }}
                onMouseLeave={() => {
                  hoverRef.current = false;
                  cycleRef.current = 0;
                }}
                className="le-tag hidden font-sans xl:inline-flex"
              >
                <span className="le-tag-num">{d.number}</span>
                {d.orbit}
              </span>
            ))}
          </div>

          {/* The figure's caption: what a client sees on the lit orbit —
             their search, then "Your Business" at the top. Illustration
             only, so hidden from screen readers. */}
          <div
            aria-hidden="true"
            className="le-results relative mx-auto mt-4 w-full max-w-[24rem] lg:mt-0 lg:max-w-[54rem]"
          >
            <p className="flex items-center justify-center gap-4 font-sans text-[0.58rem] font-semibold uppercase tracking-[0.3em] text-[#a67c3d]">
              <span className="h-px w-10 bg-[#a67c3d]/40" />
              What your clients see
              <span className="h-px w-10 bg-[#a67c3d]/40" />
            </p>
            <div className="mt-4 grid">
              {DISCIPLINES.map((d, i) => (
                <div
                  key={d.number}
                  data-active={active === i}
                  className="le-result flex flex-col gap-4 rounded-[1.5rem] border border-[#261f15]/10 bg-[#f7f5e8] p-3 pb-4 shadow-[0_1px_2px_rgba(38,31,21,0.05),0_28px_56px_-30px_rgba(38,31,21,0.45)] lg:flex-row lg:items-center lg:gap-4 lg:rounded-full lg:p-2 lg:pr-7"
                >
                  {/* the orbit's name — the stage only labels its rings on
                     wide screens */}
                  <p className="-mb-1 flex shrink-0 items-center gap-2 px-1.5 font-sans text-[0.52rem] font-semibold uppercase tracking-[0.26em] text-[#261f15]/50 lg:mb-0 lg:pl-3 xl:hidden">
                    <span className="font-heading text-[0.85rem] font-thin tracking-normal text-[#a67c3d]">
                      {d.number}
                    </span>
                    {d.orbit}
                  </p>
                  <ResultStrip ring={i} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ---------------------- the three disciplines --------------- */}
        <p className="mt-14 flex items-center gap-3 font-sans text-[0.58rem] font-semibold uppercase tracking-[0.3em] text-[#261f15]/55 lg:mt-16">
          <span aria-hidden="true" className="text-[#a67c3d]">
            ✦
          </span>
          Three disciplines. Found first.
        </p>

        <ol
          ref={listRef}
          onMouseLeave={() => {
            hoverRef.current = false;
            cycleRef.current = 0;
          }}
          className="mt-6 grid grid-cols-1 border-t border-[#261f15]/10 md:grid-cols-3"
        >
          {DISCIPLINES.map((d, i) => {
            const on = active === i;
            return (
              <li
                key={d.number}
                onMouseEnter={() => {
                  hoverRef.current = true;
                  pick(i);
                }}
                className="relative border-b border-[#261f15]/10 py-8 md:border-b-0 md:border-l md:px-8 md:py-9 md:first:border-l-0 md:first:pl-0 md:last:pr-0 lg:px-10"
              >
                <div className="flex items-baseline gap-5">
                  <span
                    className={`font-heading font-thin not-italic text-5xl leading-none transition-colors duration-700 ${
                      on ? "text-[#a67c3d]" : "text-[#261f15]/25"
                    }`}
                  >
                    {d.number}
                  </span>
                  {/* hairline that fills gold while this one is lit */}
                  <span
                    aria-hidden="true"
                    className="relative h-px flex-1 self-center overflow-hidden bg-[#261f15]/10"
                  >
                    <span
                      ref={(el) => {
                        barRefs.current[i] = el;
                      }}
                      className="le-bar absolute inset-0 bg-[#a67c3d]"
                    />
                  </span>
                  <span className="font-sans text-[0.58rem] font-semibold uppercase tracking-[0.3em] text-[#261f15]/55">
                    {d.kicker}
                  </span>
                </div>

                <h3 className="mt-6 font-heading font-thin not-italic text-[1.7rem] leading-[1.1] text-[#261f15] sm:text-[1.85rem]">
                  {d.title}
                </h3>
                <p className="mt-3.5 max-w-[46ch] font-sans text-sm leading-relaxed text-[#261f15]/65 sm:text-[0.95rem]">
                  {d.description}
                </p>

                <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2.5">
                  {d.platforms.map((platform) => (
                    <li
                      key={platform.name}
                      className={`flex items-center gap-2 font-sans text-[0.58rem] font-semibold uppercase tracking-[0.2em] transition-colors duration-700 ${
                        on ? "text-[#261f15]/75" : "text-[#261f15]/45"
                      }`}
                    >
                      <Mark mark={platform.mark} className="h-3.5 w-3.5" />
                      {platform.name}
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
