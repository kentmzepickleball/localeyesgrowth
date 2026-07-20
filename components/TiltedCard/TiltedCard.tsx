"use client";

import { useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { motion, useMotionValue, useSpring, type SpringOptions } from "motion/react";

/* React Bits "TiltedCard" — pointer-tracked 3D tilt + a floating caption
   tooltip that follows the cursor. Adapted for LocalEyes: the stock
   component's dev-facing "not optimized for mobile" banner and the
   caption tooltip are opt-in here (default off) since neither belongs
   in front of real visitors unless a page explicitly asks for them. */

interface TiltedCardProps {
  imageSrc: string;
  altText?: string;
  captionText?: string;
  containerHeight?: CSSProperties["height"];
  containerWidth?: CSSProperties["width"];
  imageHeight?: CSSProperties["height"];
  imageWidth?: CSSProperties["width"];
  scaleOnHover?: number;
  rotateAmplitude?: number;
  translateAmplitude?: number;
  showMobileWarning?: boolean;
  showTooltip?: boolean;
  imageClassName?: string;
}

const SPRING: SpringOptions = { damping: 30, stiffness: 100, mass: 2 };

export default function TiltedCard({
  imageSrc,
  altText = "Tilted card image",
  captionText = "",
  containerHeight = "300px",
  containerWidth = "300px",
  imageHeight = "300px",
  imageWidth = "300px",
  scaleOnHover = 1.1,
  rotateAmplitude = 14,
  translateAmplitude = 0,
  showMobileWarning = false,
  showTooltip = false,
  imageClassName = "",
}: TiltedCardProps) {
  const ref = useRef<HTMLElement>(null);
  const [lastY, setLastY] = useState(0);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useMotionValue(0), SPRING);
  const rotateY = useSpring(useMotionValue(0), SPRING);
  const scale = useSpring(1, SPRING);
  const opacity = useSpring(0);
  const rotateFigcaption = useSpring(0, { stiffness: 350, damping: 30, mass: 1 });

  function handleMouseMove(e: MouseEvent<HTMLElement>) {
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;

    rotateX.set((offsetY / (rect.height / 2)) * -rotateAmplitude);
    rotateY.set((offsetX / (rect.width / 2)) * rotateAmplitude);

    x.set(e.clientX - rect.left);
    y.set(e.clientY - rect.top);

    const velocityY = offsetY - lastY;
    rotateFigcaption.set(-velocityY * 0.6);
    setLastY(offsetY);

    if (translateAmplitude) {
      // subtle parallax drift, scaled down from the rotation offsets
      x.set((offsetX / (rect.width / 2)) * translateAmplitude);
      y.set((offsetY / (rect.height / 2)) * translateAmplitude);
    }
  }

  function handleMouseEnter() {
    scale.set(scaleOnHover);
    opacity.set(1);
  }

  function handleMouseLeave() {
    opacity.set(0);
    scale.set(1);
    rotateX.set(0);
    rotateY.set(0);
    rotateFigcaption.set(0);
  }

  return (
    <figure
      ref={ref}
      className="relative flex h-full w-full flex-col items-center justify-center [perspective:800px]"
      style={{ height: containerHeight, width: containerWidth }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {showMobileWarning && (
        <div className="absolute top-4 block text-center text-sm sm:hidden">
          This effect is not optimized for mobile. Check on desktop.
        </div>
      )}

      <motion.div
        className="relative [transform-style:preserve-3d]"
        style={{ width: imageWidth, height: imageHeight, rotateX, rotateY, scale }}
      >
        <motion.img
          src={imageSrc}
          alt={altText}
          className={`absolute left-0 top-0 h-full w-full [transform:translateZ(0)] will-change-transform ${imageClassName}`}
          style={{ width: imageWidth, height: imageHeight }}
        />
      </motion.div>

      {showTooltip && (
        <motion.figcaption
          className="pointer-events-none absolute left-0 top-0 z-[3] hidden rounded bg-white px-2.5 py-1 text-[10px] text-[#2d2d2d] sm:block"
          style={{ x, y, opacity, rotate: rotateFigcaption }}
        >
          {captionText}
        </motion.figcaption>
      )}
    </figure>
  );
}
