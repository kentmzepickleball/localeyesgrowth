"use client";

import { useEffect, useRef } from "react";

interface NoiseProps {
  patternAlpha?: number;
  patternRefreshInterval?: number;
  className?: string;
}

/**
 * React Bits "Noise" component (Animations/Noise, TS+Tailwind variant),
 * adapted to size to its positioned parent instead of the viewport so it
 * can be scoped to a single section (e.g. a hero) rather than the whole page.
 * Source: https://reactbits.dev/animations/noise
 */
const CANVAS_SIZE = 1024;
const POOL_SIZE = 8;

/* Shared across every mounted <Noise> — a page can have a dozen of these
   (Hero, Pricing, Capabilities, Footer, ...); ImageData isn't tied to any
   one canvas, so the same pooled frames can be blitted onto all of them.
   Keyed by patternAlpha since that's baked into the pixel data — each
   distinct alpha still renders pixel-for-pixel identical to before, this
   just stops every instance from independently generating its own ~8M
   random values at mount. */
const sharedPools = new Map<number, ImageData[]>();

function getPool(ctx: CanvasRenderingContext2D, patternAlpha: number) {
  const cached = sharedPools.get(patternAlpha);
  if (cached) return cached;

  const pool: ImageData[] = [];
  for (let f = 0; f < POOL_SIZE; f++) {
    const imageData = ctx.createImageData(CANVAS_SIZE, CANVAS_SIZE);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const value = Math.random() * 255;
      data[i] = value;
      data[i + 1] = value;
      data[i + 2] = value;
      data[i + 3] = patternAlpha;
    }
    pool.push(imageData);
  }
  sharedPools.set(patternAlpha, pool);
  return pool;
}

export function Noise({
  patternAlpha = 15,
  patternRefreshInterval = 2,
  className = "",
}: NoiseProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;

    let frame = 0;
    let animationId: number;

    const pool = getPool(ctx, patternAlpha);
    let poolIndex = 0;
    const drawGrain = () => {
      ctx.putImageData(pool[poolIndex], 0, 0);
      poolIndex = (poolIndex + 1) % POOL_SIZE;
    };

    const loop = () => {
      if (frame % patternRefreshInterval === 0) {
        drawGrain();
      }
      frame++;
      animationId = window.requestAnimationFrame(loop);
    };

    loop();

    return () => window.cancelAnimationFrame(animationId);
  }, [patternAlpha, patternRefreshInterval]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 z-10 h-full w-full ${className}`}
      style={{ imageRendering: "pixelated" }}
    />
  );
}
