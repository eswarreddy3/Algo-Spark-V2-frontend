"use client";

import React from "react";
import {
  BarChart3, ClipboardList, FileSpreadsheet, FlaskConical, LayoutDashboard, LifeBuoy, Trophy, Users, X,
} from "lucide-react";
import { C, FB, FD, FM, blueGrad, tint } from "../theme";
import { COHORT } from "../data/cohort";
import { useAdminNav, type AdminView } from "../nav";

export const NAV_ITEMS: { id: AdminView; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "students", label: "Students", icon: Users },
  { id: "labs", label: "Labs", icon: FlaskConical },
  { id: "exams", label: "Exams", icon: ClipboardList },
  { id: "leaderboard", label: "Leaderboard", icon: Trophy },
  { id: "reports", label: "Reports", icon: FileSpreadsheet },
  { id: "support", label: "Support", icon: LifeBuoy },
];

function Mark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <defs>
        <linearGradient id="admkb" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2430D8" />
          <stop offset="1" stopColor="#4DA3F5" />
        </linearGradient>
        <radialGradient id="admks">
          <stop offset="0" stopColor="#FFF1B0" />
          <stop offset="55%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#FF8A00" />
        </radialGradient>
      </defs>
      <path d="M20 6 L8 35" stroke="url(#admkb)" strokeWidth="6.5" strokeLinecap="round" fill="none" />
      {/* Themed via style: the brand's deep royal disappears on the dark sidebar. */}
      <path d="M20 6 L32 35" strokeWidth="6.5" strokeLinecap="round" fill="none" style={{ stroke: C.royal }} />
      <path d="M20 22 l2.6 4.4 4.4 2.6 -4.4 2.6 -2.6 4.4 -2.6 -4.4 -4.4 -2.6 4.4 -2.6 Z" fill="url(#admks)" />
    </svg>
  );
}

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { view, go } = useAdminNav();

  return (
    <aside
      className="ad-sidebar"
      data-open={open}
      aria-label="Main navigation"
      style={{ background: C.white, borderRight: `1px solid ${C.line}`, display: "flex", flexDirection: "column" }}
    >
      <div style={{ padding: "20px 20px 14px", display: "flex", alignItems: "center", gap: 10 }}>
        <Mark size={30} />
        <span style={{ minWidth: 0 }}>
          <span style={{ display: "block", fontFamily: FD, fontWeight: 700, fontSize: 21, lineHeight: 1.1 }}>
            Algo
            <span style={{ background: blueGrad, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>Spark</span>
          </span>
          <span style={{ display: "block", fontFamily: FM, fontSize: 11, letterSpacing: ".14em", color: C.inkMute, marginTop: 2 }}>
            ADMIN CONSOLE
          </span>
        </span>
        <button
          onClick={onClose}
          aria-label="Close navigation"
          className="ad-menu-button"
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
                width: "100%", display: "flex", alignItems: "center", gap: 13, padding: "12px 14px", marginBottom: 3,
                borderRadius: 11, border: "none", cursor: "pointer", textAlign: "left",
                background: active ? tint(C.royal, 12) : "transparent",
                color: active ? C.royal : C.inkSoft, fontFamily: FB, fontWeight: active ? 600 : 500, fontSize: 16.5,
                position: "relative",
              }}
            >
              {active && <span style={{ position: "absolute", left: 0, top: 9, bottom: 9, width: 3, borderRadius: 3, background: C.royal }} />}
              <Icon size={21} strokeWidth={active ? 2.4 : 2} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <button
        onClick={() => { go("overview"); onClose(); }}
        style={{
          margin: 12, padding: 14, borderRadius: 14, background: "linear-gradient(135deg,#101433,#1E2A6B)",
          color: "#fff", border: "none", cursor: "pointer", textAlign: "left",
        }}
      >
        <div style={{ fontSize: 11.5, color: "#AEB6E0", fontFamily: FM, letterSpacing: ".08em" }}>ACTIVE COHORT</div>
        <div style={{ fontFamily: FD, fontWeight: 700, fontSize: 22, marginTop: 3, display: "flex", alignItems: "center", gap: 7 }}>
          <BarChart3 size={17} color={C.gold} /> {COHORT.students}
        </div>
        <div style={{ fontSize: 12.5, color: "#AEB6E0", marginTop: 4, lineHeight: 1.4 }}>
          {COHORT.batch}
        </div>
      </button>
    </aside>
  );
}
