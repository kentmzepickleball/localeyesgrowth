"use client";

import { forwardRef } from "react";
import type { DomainResult } from "./scoring";

/* ----------------------------------------------------------------------
   RADAR CHART — geometry ported 1:1 from the original embed's
   drawRadar(): same cx/cy/R, same rings at 25/50/75/100%, same spokes,
   labels at R+26, same score polygon math. Only the drawing style is
   the brand reskin: cream field, fine ink grid, gold shape with a soft
   ochre fill — drafted, not charted.
   Forwarded ref so the scorecard can grab the SVG's outerHTML.
   ---------------------------------------------------------------------- */

const CX = 220;
const CY = 205;
const R = 140;

const INK_GRID = "rgba(38, 31, 21, 0.14)";
const LABEL = "#7a715c";
const GOLD_FILL = "rgba(198, 166, 106, 0.28)";
const GOLD_STROKE = "#a3843f";

const Radar = forwardRef<SVGSVGElement, { domains: DomainResult[] }>(
  function Radar({ domains }, ref) {
    const n = domains.length;
    const pt = (i: number, r: number): [number, number] => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
      return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
    };
    const ringPath = (f: number) => {
      let d = "";
      for (let i = 0; i < n; i++) {
        const p = pt(i, R * f);
        d += (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1) + " ";
      }
      return d + "Z";
    };
    let poly = "";
    for (let j = 0; j < n; j++) {
      const p = pt(j, (R * domains[j]!.score) / 100);
      poly += (j ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1) + " ";
    }
    poly += "Z";

    return (
      <svg
        id="gdRadar"
        ref={ref}
        width="420"
        height="400"
        viewBox="0 0 440 420"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Radar chart of your 11 domain scores"
      >
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <path key={f} d={ringPath(f)} fill="none" stroke={INK_GRID} />
        ))}
        {domains.map((d, i) => {
          const p = pt(i, R);
          const lp = pt(i, R + 26);
          return (
            <g key={d.id}>
              <line x1={CX} y1={CY} x2={p[0]} y2={p[1]} stroke={INK_GRID} />
              <text
                x={lp[0]}
                y={lp[1]}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="10.5"
                fill={LABEL}
                fontFamily="Manrope, Arial, sans-serif"
              >
                {d.label}
              </text>
            </g>
          );
        })}
        <path
          d={poly}
          fill={GOLD_FILL}
          stroke={GOLD_STROKE}
          strokeWidth="1.5"
        />
        {domains.map((d, k) => {
          const p3 = pt(k, (R * d.score) / 100);
          return (
            <circle key={d.id} cx={p3[0]} cy={p3[1]} r="3" fill={GOLD_STROKE} />
          );
        })}
      </svg>
    );
  },
);

export default Radar;
