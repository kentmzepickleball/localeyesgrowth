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

    const canvasSize = 1024;
    canvas.width = canvasSize;
    canvas.height = canvasSize;

    let frame = 0;
    let animationId: number;

    /* Pre-bake a small pool of fully-random frames once (same per-pixel
       Math.random() math as before, so the noise is statistically
       identical) instead of regenerating ~1M random values + a fresh 4MB
       buffer on every refresh — 30x/sec, forever, while mounted. A
       cycling putImageData blit is visually indistinguishable from
       fresh randomness (noise has no memorable pattern to notice
       repeating) but is orders of magnitude cheaper per frame. */
    const POOL_SIZE = 8;
    const pool: ImageData[] = [];
    for (let f = 0; f < POOL_SIZE; f++) {
      const imageData = ctx.createImageData(canvasSize, canvasSize);
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
