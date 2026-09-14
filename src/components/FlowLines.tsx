"use client";

import { motion, useReducedMotion } from "framer-motion";

type Line = { d: string; stroke: string; strokeWidth: number; opacity: number; delay?: number };

export function FlowLines({
  viewBox,
  lines,
  className = "",
  loop = false,
}: {
  viewBox: string;
  lines: Line[];
  className?: string;
  /** Draw each line in, then retract it off-screen, repeating — instead of drawing once and staying. */
  loop?: boolean;
}) {
  const reduce = useReducedMotion();
  const animateLoop = loop && !reduce;

  return (
    <svg
      className={`absolute inset-0 w-full h-full pointer-events-none overflow-visible ${className}`}
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {lines.map((line, i) => (
        <motion.path
          key={i}
          d={line.d}
          stroke={line.stroke}
          strokeWidth={line.strokeWidth}
          fill="none"
          strokeLinecap="round"
          {...(animateLoop
            ? {
                initial: { pathLength: 0, pathOffset: 0, opacity: 0 },
                animate: {
                  pathLength: [0, 1, 1],
                  pathOffset: [0, 0, 1],
                  opacity: [0, line.opacity, line.opacity, 0],
                },
                transition: {
                  duration: 5.2,
                  times: [0, 0.5, 1],
                  ease: "easeInOut",
                  delay: line.delay ?? 0,
                  repeat: Infinity,
                  repeatDelay: 1.2,
                  opacity: { duration: 5.2, times: [0, 0.08, 0.92, 1], delay: line.delay ?? 0, repeat: Infinity, repeatDelay: 1.2 },
                },
              }
            : {
                opacity: line.opacity,
                initial: { pathLength: 0 },
                whileInView: { pathLength: 1 },
                viewport: { once: true, margin: "-10%" },
                transition: { duration: 2.6, ease: "easeInOut", delay: line.delay ?? 0 },
              })}
        />
      ))}
    </svg>
  );
}
