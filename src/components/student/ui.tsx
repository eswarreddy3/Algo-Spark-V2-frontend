import React from "react";
import { C, FD, FM, FS } from "./theme";

export function Card({
  children,
  style,
  className,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <div className={className} style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: 18, ...style }}>
      {children}
    </div>
  );
}

export function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: FM, fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", color: C.blue, fontWeight: 500 }}>
      {children}
    </div>
  );
}

export function H2({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <h2 style={{ fontFamily: FD, fontWeight: 700, fontSize: 28, letterSpacing: "-.02em", margin: "6px 0 0", ...style }}>
      {children}
    </h2>
  );
}

export function Serif({ children }: { children: React.ReactNode }) {
  return <em style={{ fontFamily: FS, fontStyle: "italic", color: C.goldDeep }}>{children}</em>;
}

/** Small monospace chip used for tags, languages, difficulty and statuses. */
export function Pill({
  children,
  color = C.inkSoft,
  bg = C.cream,
  style,
}: {
  children: React.ReactNode;
  color?: string;
  bg?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span style={{ fontFamily: FM, fontSize: 11, padding: "4px 9px", borderRadius: 999, background: bg, color, fontWeight: 500, whiteSpace: "nowrap", ...style }}>
      {children}
    </span>
  );
}

export function ProgressBar({
  value,
  color = C.royal,
  height = 7,
  track = C.cream,
}: {
  value: number;
  color?: string;
  height?: number;
  track?: string;
}) {
  return (
    <div style={{ height, borderRadius: height, background: track, overflow: "hidden" }}>
      <div style={{ height, borderRadius: height, width: `${Math.max(0, Math.min(100, value))}%`, background: color, transition: "width .35s ease" }} />
    </div>
  );
}
