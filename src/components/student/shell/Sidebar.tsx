"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  ChevronDown, ClipboardCheck, Code2, FlaskConical, LayoutDashboard, LifeBuoy, PenLine, Sparkles, Trophy, User, X,
} from "lucide-react";
import { C, FB, FD, FM } from "../theme";
import { NONTECH_TABS, TECH_TABS, useNav, type NonTechTab, type TechTab, type View } from "../nav";

type Icon = typeof LayoutDashboard;
type NavItem = { id: View; label: string; icon: Icon };
type NavGroup = { heading: string | null; items: NavItem[] };

export const NAV_GROUPS: NavGroup[] = [
  { heading: null, items: [{ id: "dashboard", label: "Dashboard", icon: LayoutDashboard }] },
  {
    heading: "Learn",
    items: [
      { id: "tech", label: "Tech", icon: Code2 },
      { id: "nontech", label: "Non-Tech", icon: PenLine },
      { id: "labs", label: "Labs", icon: FlaskConical },
      { id: "exam", label: "Exams", icon: ClipboardCheck },
    ],
  },
  {
    heading: "Account",
    items: [
      { id: "leaderboard", label: "Leaderboard", icon: Trophy },
      { id: "profile", label: "Profile", icon: User },
      { id: "support", label: "Support", icon: LifeBuoy },
    ],
  },
];

/** Dark sidebar palette. */
const SB = {
  bg: "linear-gradient(180deg,#0B0F2B 0%,#111641 100%)",
  border: "rgba(255,255,255,.06)",
  text: "#A3ABD6",
  heading: "#646C9E",
  active: "#FFFFFF",
  activeBg: "rgba(77,163,245,.14)",
  accent: "#4DA3F5",
  rule: "rgba(255,255,255,.1)",
} as const;

export function Sidebar({
  xp,
  open,
  onClose,
}: {
  xp: number;
  open: boolean;
  onClose: () => void;
}) {
  const { view, go, techRoute, nonTechRoute, openTechTab, openNonTechTab } = useNav();
  // Unset means "follow the route": a group is open while you are inside it,
  // until the student collapses or expands it by hand.
  const [expanded, setExpanded] = useState<Partial<Record<"tech" | "nontech", boolean>>>({});

  function toggle(id: "tech" | "nontech") {
    setExpanded((prev) => ({ ...prev, [id]: !(prev[id] ?? view === id) }));
  }

  return (
    <aside
      className="as-sidebar"
      data-open={open}
      aria-label="Main navigation"
      style={{ background: SB.bg, borderRight: `1px solid ${SB.border}`, display: "flex", flexDirection: "column", colorScheme: "dark" }}
    >
      <div style={{ padding: "22px 20px 18px", display: "flex", alignItems: "center", gap: 10 }}>
        <Image src="/algospark_wordmark.png" alt="AlgoSpark" width={720} height={106} priority style={{ width: 184, height: "auto" }} />
        <button
          onClick={onClose}
          aria-label="Close navigation"
          className="as-menu-button"
          style={{ marginLeft: "auto", border: "none", background: "none", cursor: "pointer", color: SB.text, padding: 4 }}
        >
          <X size={19} />
        </button>
      </div>

      <nav style={{ padding: "6px 12px", flex: 1, overflowY: "auto" }}>
        {NAV_GROUPS.map((group, gi) => (
          <div key={group.heading ?? gi} style={{ marginTop: gi === 0 ? 0 : 14 }}>
            {group.heading && (
              <div style={{ padding: "0 14px 7px", fontFamily: FM, fontSize: 12, letterSpacing: ".08em", textTransform: "uppercase", color: SB.heading }}>
                {group.heading}
              </div>
            )}
            {group.items.map((item) => {
              if (item.id === "tech") {
                return (
                  <CollapsibleItem
                    key={item.id}
                    item={item}
                    tabs={TECH_TABS}
                    activeTab={view === "tech" ? techRoute.tab : null}
                    expanded={expanded.tech ?? view === "tech"}
                    onToggle={() => toggle("tech")}
                    onSelect={(tab) => { openTechTab(tab as TechTab); onClose(); }}
                  />
                );
              }
              if (item.id === "nontech") {
                return (
                  <CollapsibleItem
                    key={item.id}
                    item={item}
                    tabs={NONTECH_TABS}
                    activeTab={view === "nontech" ? nonTechRoute.tab : null}
                    expanded={expanded.nontech ?? view === "nontech"}
                    onToggle={() => toggle("nontech")}
                    onSelect={(tab) => { openNonTechTab(tab as NonTechTab); onClose(); }}
                  />
                );
              }
              return (
                <NavButton
                  key={item.id}
                  icon={item.icon}
                  label={item.label}
                  active={view === item.id}
                  onClick={() => { go(item.id); onClose(); }}
                />
              );
            })}
          </div>
        ))}
      </nav>

      <button
        onClick={() => { go("profile"); onClose(); }}
        style={{
          margin: 12, padding: 14, borderRadius: 14, background: "linear-gradient(135deg,rgba(36,48,216,.35),rgba(77,163,245,.12))",
          color: "#fff", border: `1px solid ${SB.rule}`, cursor: "pointer", textAlign: "left",
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

function NavButton({
  icon: Icon,
  label,
  active,
  onClick,
  trailing,
  expanded,
}: {
  icon: Icon;
  label: string;
  active: boolean;
  onClick: () => void;
  trailing?: React.ReactNode;
  expanded?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-current={active && expanded === undefined ? "page" : undefined}
      aria-expanded={expanded}
      className="as-side-link"
      data-active={active}
      style={{
        width: "100%", display: "flex", alignItems: "center", gap: 13, padding: "12px 14px", marginBottom: 3,
        borderRadius: 11, border: "none", cursor: "pointer", textAlign: "left",
        color: active ? SB.active : SB.text, fontFamily: FB, fontWeight: active ? 600 : 500, fontSize: 16.5,
        position: "relative",
      }}
    >
      {active && (
        <span style={{ position: "absolute", left: 0, top: 9, bottom: 9, width: 3, borderRadius: 3, background: SB.accent }} />
      )}
      <Icon size={21} strokeWidth={active ? 2.4 : 2} color={active ? SB.accent : "currentColor"} />
      {label}
      {trailing}
    </button>
  );
}

function CollapsibleItem({
  item,
  tabs,
  activeTab,
  expanded,
  onToggle,
  onSelect,
}: {
  item: NavItem;
  tabs: readonly { id: string; label: string; icon: Icon }[];
  /** The selected sub-section, or null when this module is not the current view. */
  activeTab: string | null;
  expanded: boolean;
  onToggle: () => void;
  onSelect: (tab: string) => void;
}) {
  const inside = activeTab !== null;

  return (
    <div>
      <NavButton
        icon={item.icon}
        label={item.label}
        // A collapsed group still shows that you are somewhere inside it.
        active={inside && !expanded}
        expanded={expanded}
        onClick={onToggle}
        trailing={
          <ChevronDown
            size={17}
            style={{ marginLeft: "auto", color: inside ? SB.accent : SB.heading, transform: expanded ? "rotate(180deg)" : "none", transition: "transform .18s" }}
          />
        }
      />
      {expanded && (
        <div style={{ margin: "0 0 6px 22px", paddingLeft: 10, borderLeft: `1px solid ${SB.rule}` }}>
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onSelect(tab.id)}
                aria-current={active ? "page" : undefined}
                className="as-side-link"
                data-active={active}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 11, padding: "9px 12px", marginBottom: 2,
                  borderRadius: 9, border: "none", cursor: "pointer", textAlign: "left",
                  color: active ? SB.active : SB.text, fontFamily: FB, fontWeight: active ? 600 : 500, fontSize: 15.5,
                }}
              >
                <TabIcon size={18} strokeWidth={active ? 2.4 : 2} color={active ? SB.accent : "currentColor"} />
                {tab.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
