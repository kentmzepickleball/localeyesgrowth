"use client";

import { useEffect, useRef } from "react";

/* Elegant custom cursor — a small espresso dot that tracks the pointer
   precisely, with a soft ring trailing behind it. The ring turns gold and
   blooms over interactive elements, tightens on press. Fine pointers only;
   touch devices keep native behavior. */

const INTERACTIVE =
  'a, button, [role="button"], input, select, textarea, label, [data-cursor="hover"]';

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    document.body.classList.add("le-cursor-active");

    let mx = -100,
      my = -100;
    let dx = -100,
      dy = -100;
    let rx = -100,
      ry = -100;
    let ringScale = 1;
    let targetScale = 1;
    let hover = false;
    let down = false;
    let visible = false;
    let raf: number | null = null;
    let last = 0;

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const kDot = reduced ? 1 : 1 - Math.exp(-dt / 0.028);
      const kRing = reduced ? 1 : 1 - Math.exp(-dt / 0.11);
      dx += (mx - dx) * kDot;
      dy += (my - dy) * kDot;
      rx += (mx - rx) * kRing;
      ry += (my - ry) * kRing;
      targetScale = down ? 0.75 : hover ? 1.7 : 1;
      ringScale += (targetScale - ringScale) * kRing;

      dot.style.transform = `translate3d(${dx.toFixed(2)}px, ${dy.toFixed(2)}px, 0) translate(-50%, -50%) scale(${hover ? 0.5 : 1})`;
      ring.style.transform = `translate3d(${rx.toFixed(2)}px, ${ry.toFixed(2)}px, 0) translate(-50%, -50%) scale(${ringScale.toFixed(3)})`;

      const settled =
        Math.abs(mx - dx) < 0.1 &&
        Math.abs(my - dy) < 0.1 &&
        Math.abs(mx - rx) < 0.1 &&
        Math.abs(my - ry) < 0.1 &&
        Math.abs(targetScale - ringScale) < 0.002;
      raf = settled ? null : requestAnimationFrame(frame);
    };

    const startLoop = () => {
      if (raf != null) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };

    const show = () => {
      if (visible) return;
      visible = true;
      dot.style.opacity = "1";
      ring.style.opacity = "1";
    };
    const hide = () => {
      visible = false;
      dot.style.opacity = "0";
      ring.style.opacity = "0";
    };

    const onMove = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (!visible) {
        dx = rx = mx;
        dy = ry = my;
        show();
      }
      startLoop();
    };
    const onOver = (e: PointerEvent) => {
      hover = !!(e.target as Element | null)?.closest?.(INTERACTIVE);
      ring.dataset.hover = hover ? "true" : "false";
      startLoop();
    };
    const onDown = () => {
      down = true;
      startLoop();
    };
    const onUp = () => {
      down = false;
      startLoop();
    };
    const onLeaveDoc = (e: MouseEvent) => {
      if (!e.relatedTarget) hide();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    document.addEventListener("mouseout", onLeaveDoc);

    return () => {
      document.body.classList.remove("le-cursor-active");
      if (raf != null) cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("mouseout", onLeaveDoc);
    };
  }, []);

  return (
    <>
      <div ref={ringRef} aria-hidden="true" className="le-cursor-ring" />
      <div ref={dotRef} aria-hidden="true" className="le-cursor-dot" />
    </>
  );
}
