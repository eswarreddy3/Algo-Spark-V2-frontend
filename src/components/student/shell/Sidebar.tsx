"use client";

import React from "react";
import {
  ClipboardCheck, Code2, FlaskConical, LayoutDashboard, LifeBuoy, PenLine, Sparkles, Trophy, User, X,
} from "lucide-react";
import { C, FB, FD, FM, blueGrad } from "../theme";
import { useNav, type View } from "../nav";

export const NAV_ITEMS: { id: View; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "labs", label: "Labs", icon: FlaskConical },
  { id: "tech", label: "Tech", icon: Code2 },
  { id: "nontech", label: "Non-Tech", icon: PenLine },
  { id: "exam", label: "Exam", icon: ClipboardCheck },
  { id: "leaderboard", label: "Leaderboard", icon: Trophy },
  { id: "profile", label: "Profile", icon: User },
  { id: "support", label: "Support", icon: LifeBuoy },
];

function Mark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <defs>
        <linearGradient id="mkb" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2430D8" />
          <stop offset="1" stopColor="#4DA3F5" />
        </linearGradient>
        <radialGradient id="mks">
          <stop offset="0" stopColor="#FFF1B0" />
          <stop offset="55%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#FF8A00" />
        </radialGradient>
      </defs>
      <path d="M20 6 L8 35" stroke="url(#mkb)" strokeWidth="6.5" strokeLinecap="round" fill="none" />
      <path d="M20 6 L32 35" stroke="#2430D8" strokeWidth="6.5" strokeLinecap="round" fill="none" />
      <path d="M20 22 l2.6 4.4 4.4 2.6 -4.4 2.6 -2.6 4.4 -2.6 -4.4 -4.4 -2.6 4.4 -2.6 Z" fill="url(#mks)" />
    </svg>
  );
}

export function Sidebar({
  xp,
  open,
  onClose,
}: {
  xp: number;
  open: boolean;
  onClose: () => void;
}) {
  const { view, go } = useNav();

  return (
    <aside
      className="as-sidebar"
      data-open={open}
      aria-label="Main navigation"
      style={{ background: C.white, borderRight: `1px solid ${C.line}`, display: "flex", flexDirection: "column" }}
    >
      <div style={{ padding: "20px 20px 14px", display: "flex", alignItems: "center", gap: 10 }}>
        <Mark size={30} />
        <span style={{ fontFamily: FD, fontWeight: 700, fontSize: 20 }}>
          Algo
          <span style={{ background: blueGrad, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>Spark</span>
        </span>
        <button
          onClick={onClose}
          aria-label="Close navigation"
          className="as-menu-button"
          style={{ marginLeft: "auto", border: "none", background: "none", cursor: "pointer", color: C.inkMute, padding: 4 }}
        >
          <X size={19} />
        </button>
      </div>

      <nav style={{ padding: "6px 12px", flex: 1, overflowY: "auto" }}>
        {NAV_ITEMS.map((item) => {
          const active = view === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => { go(item.id); onClose(); }}
              aria-current={active ? "page" : undefined}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "11px 13px", marginBottom: 3,
                borderRadius: 11, border: "none", cursor: "pointer", textAlign: "left",
                background: active ? "rgba(47,91,240,.08)" : "transparent",
                color: active ? C.royal : C.inkSoft, fontFamily: FB, fontWeight: active ? 600 : 500, fontSize: 15,
                position: "relative",
              }}
            >
              {active && (
                <span style={{ position: "absolute", left: 0, top: 9, bottom: 9, width: 3, borderRadius: 3, background: C.royal }} />
              )}
              <Icon size={19} strokeWidth={active ? 2.4 : 2} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <button
        onClick={() => { go("profile"); onClose(); }}
        style={{
          margin: 12, padding: 14, borderRadius: 14, background: "linear-gradient(135deg,#101433,#1E2A6B)",
          color: "#fff", border: "none", cursor: "pointer", textAlign: "left",
        }}
      >
        <div style={{ fontSize: 12, color: "#AEB6E0", fontFamily: FM }}>TOTAL POINTS</div>
        <div style={{ fontFamily: FD, fontWeight: 700, fontSize: 26, marginTop: 2, display: "flex", alignItems: "center", gap: 7 }}>
          <Sparkles size={18} color={C.gold} /> {xp.toLocaleString()}
        </div>
        <div style={{ fontSize: 12.5, color: "#AEB6E0", marginTop: 4 }}>Rank #9 · CSE-A</div>
      </button>
    </aside>
  );
}
