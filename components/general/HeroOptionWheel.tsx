"use client";

import { useEffect, useRef } from "react";

/* React Bits "OptionWheel" engine (drag / wheel / arrow keys, exponential
   smoothing, snap, loop) — oriented along the bottom edge, curve flipped
   180deg (bowl). Auto-advances every 4s; any user interaction takes over
   and restarts the clock. */

const ITEMS = [
  "Coffee Carts",
  "Beverage Carts",
  "Mobile Bars",
  "Catering Co's",
  "Food Trucks",
  "Event Staffing",
];

const TILT_DEG = 14;
const CURVE = 1.6;
const FADE = 0.35;
const MIN_OPACITY = 0.08;
const BLUR = 2;
const SMOOTHING = 200; // ms — same feel as the stock component
const AUTO_ADVANCE_MS = 4000; // spins to the next item every 4s

export function HeroOptionWheel() {
  const rootRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const n = ITEMS.length;
    const tiltRad = (TILT_DEG * Math.PI) / 180;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const posRef = { current: 0 };
    const targetRef = { current: 0 };
    let raf: number | null = null;
    let last = 0;
    let rowW = 300;
    let drag: { x: number; startTarget: number } | null = null;
    let moved = false;
    let wheelTimer: number | undefined;

    const measure = () => {
      rowW = Math.min(340, Math.max(200, root.clientWidth / 3.6));
    };
    measure();
    window.addEventListener("resize", measure);

    const layout = (pos: number) => {
      const R = rowW / tiltRad;
      for (let i = 0; i < n; i++) {
        const el = itemRefs.current[i];
        if (!el) continue;
        let d = i - pos;
        d = ((d % n) + n) % n;
        if (d > n / 2) d -= n;
        const dist = Math.abs(d);
        const ang = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, d * tiltRad));
        const x = R * Math.sin(ang);
        // curve flipped 180deg: off-center items rise UP out of the band
        const y = -R * (1 - Math.cos(ang)) * CURVE;
        const rot = (-ang * 180) / Math.PI;
        el.style.transform = `translate(calc(${x.toFixed(2)}px - 50%), ${y.toFixed(2)}px) rotate(${rot.toFixed(3)}deg)`;
        el.style.opacity = String(Math.max(MIN_OPACITY, 1 - dist * FADE));
        el.style.filter =
          BLUR > 0 && !reduced ? `blur(${(dist * BLUR).toFixed(2)}px)` : "none";
        el.style.setProperty(
          "--ow-p",
          Math.max(0, 1 - Math.min(dist, 1)).toFixed(4),
        );
      }
    };

    const runFrame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const tau = Math.max(reduced ? 1 : SMOOTHING, 1) / 1000;
      const k = 1 - Math.exp(-dt / tau);
      let next = posRef.current + (targetRef.current - posRef.current) * k;
      const settled = Math.abs(targetRef.current - next) < 0.001;
      if (settled) next = targetRef.current;
      posRef.current = next;
      layout(next);
      raf = settled ? null : requestAnimationFrame(runFrame);
    };

    const startLoop = () => {
      if (raf != null) return;
      last = performance.now();
      raf = requestAnimationFrame(runFrame);
    };

    const setTarget = (v: number, snap: boolean) => {
      targetRef.current = snap ? Math.round(v) : v;
      startLoop();
    };

    // ---- auto-advance every 4s; any user interaction restarts the timer ----
    // Paused entirely while the wheel is scrolled out of view, so it isn't
    // burning a rAF + setInterval loop indefinitely on the rest of the page.
    let autoTimer: number | undefined;
    let visible = true;
    const startAuto = () => {
      if (reduced || !visible) return;
      window.clearInterval(autoTimer);
      autoTimer = window.setInterval(() => {
        if (drag) return; // never fight an active drag
        setTarget(Math.round(targetRef.current) + 1, true);
      }, AUTO_ADVANCE_MS);
    };
    const stopAuto = () => {
      window.clearInterval(autoTimer);
      autoTimer = undefined;
    };

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) startAuto();
        else stopAuto();
      },
      { threshold: 0 },
    );
    visibilityObserver.observe(root);

    const onPointerDown = (e: PointerEvent) => {
      startAuto(); // reset the 4s clock on interaction
      drag = { x: e.clientX, startTarget: posRef.current };
      moved = false;
      targetRef.current = posRef.current;
      root.setPointerCapture(e.pointerId);
      root.style.cursor = "grabbing";
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      if (Math.abs(dx) > 3) moved = true;
      // dragging right rolls the drum right (position decreases)
      setTarget(drag.startTarget - dx / rowW, false);
    };
    const endDrag = (e: PointerEvent) => {
      if (!drag) return;
      drag = null;
      root.style.cursor = "grab";
      // tap (no drag) on an item spins to it
      if (!moved) {
        const idxAttr = (e.target as HTMLElement).getAttribute?.("data-ow-idx");
        if (idxAttr != null) {
          const idx = Number(idxAttr);
          let d = idx - posRef.current;
          d = ((d % n) + n) % n;
          if (d > n / 2) d -= n;
          setTarget(Math.round(posRef.current + d), true);
          return;
        }
      }
      setTarget(targetRef.current, true);
    };
    const onWheel = (e: WheelEvent) => {
      // only hijack horizontal trackpad swipes; vertical page scroll passes through
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      startAuto();
      setTarget(targetRef.current + e.deltaX / 120, false);
      window.clearTimeout(wheelTimer);
      wheelTimer = window.setTimeout(
        () => setTarget(targetRef.current, true),
        140,
      );
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        startAuto();
        setTarget(Math.round(targetRef.current) + 1, true);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        startAuto();
        setTarget(Math.round(targetRef.current) - 1, true);
      }
    };

    root.addEventListener("pointerdown", onPointerDown);
    root.addEventListener("pointermove", onPointerMove);
    root.addEventListener("pointerup", endDrag);
    root.addEventListener("pointercancel", endDrag);
    root.addEventListener("wheel", onWheel, { passive: false });
    root.addEventListener("keydown", onKey);

    layout(0);
    // startAuto() is kicked off by the IntersectionObserver's initial
    // callback once actual visibility is known — not unconditionally here.

    return () => {
      if (raf != null) cancelAnimationFrame(raf);
      window.clearTimeout(wheelTimer);
      window.clearInterval(autoTimer);
      visibilityObserver.disconnect();
      window.removeEventListener("resize", measure);
      root.removeEventListener("pointerdown", onPointerDown);
      root.removeEventListener("pointermove", onPointerMove);
      root.removeEventListener("pointerup", endDrag);
      root.removeEventListener("pointercancel", endDrag);
      root.removeEventListener("wheel", onWheel);
      root.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      tabIndex={0}
      aria-label="Event business types — drag or use arrow keys to spin"
      className="relative h-32 w-full cursor-grab select-none overflow-hidden outline-none sm:h-36"
      style={{ touchAction: "pan-y" }}
    >
      {ITEMS.map((item, i) => (
        <span
          key={item}
          ref={(el) => {
            itemRefs.current[i] = el;
          }}
          data-ow-idx={i}
          className="absolute bottom-4 left-1/2 inline-flex flex-col items-center gap-2 whitespace-nowrap font-heading text-[2rem] not-italic leading-none sm:bottom-5"
          style={{
            transformOrigin: "center bottom",
            willChange: "transform, opacity, filter",
            color:
              "color-mix(in srgb, #4a3421 calc(var(--ow-p, 0) * 100%), rgba(38,31,21,0.32))",
          }}
        >
          {item}
          {/* soft gold glow-dot beneath the centered item */}
          <span
            aria-hidden="true"
            className="h-2 w-2 rounded-full bg-[#a67c3d] blur-[2.5px]"
            style={{
              opacity: "var(--ow-p, 0)",
              transform: "scale(calc(0.4 + var(--ow-p, 0) * 0.6))",
            }}
          />
        </span>
      ))}
    </div>
  );
}
