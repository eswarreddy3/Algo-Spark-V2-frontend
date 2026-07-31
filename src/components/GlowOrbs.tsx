"use client";

import { motion } from "framer-motion";

type Orb = { size: number; color: string; opacity: number; style: React.CSSProperties };

const variants: Record<"light" | "dark", Orb[]> = {
  light: [
    { size: 420, color: "#4DA3F5", opacity: 0.18, style: { top: "-12%", left: "-6%" } },
    { size: 340, color: "#FBBF24", opacity: 0.14, style: { top: "6%", right: "-8%" } },
    { size: 320, color: "#EC4899", opacity: 0.1, style: { bottom: "-14%", left: "32%" } },
  ],
  dark: [
    { size: 460, color: "#2430D8", opacity: 0.5, style: { top: "-14%", left: "2%" } },
    { size: 380, color: "#EC4899", opacity: 0.22, style: { top: "35%", right: "-8%" } },
    { size: 340, color: "#F59E0B", opacity: 0.18, style: { bottom: "-16%", left: "40%" } },
    { size: 300, color: "#1EC8DC", opacity: 0.16, style: { top: "50%", left: "-8%" } },
  ],
};

export function GlowOrbs({ variant = "light" }: { variant?: "light" | "dark" }) {
  const orbs = variants[variant];
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10" aria-hidden="true">
      {orbs.map((o, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: o.size,
            height: o.size,
            background: o.color,
            opacity: o.opacity,
            filter: "blur(90px)",
            ...o.style,
          }}
          animate={{ x: [0, 18, 0], y: [0, -14, 0] }}
          transition={{ duration: 13 + i * 3, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}
