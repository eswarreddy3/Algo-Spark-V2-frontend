"use client";

import { motion } from "framer-motion";

type Line = { d: string; stroke: string; strokeWidth: number; opacity: number; delay?: number };

export function FlowLines({
  viewBox,
  lines,
  className = "",
}: {
  viewBox: string;
  lines: Line[];
  className?: string;
}) {
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
          opacity={line.opacity}
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 2.6, ease: "easeInOut", delay: line.delay ?? 0 }}
        />
      ))}
    </svg>
  );
}
