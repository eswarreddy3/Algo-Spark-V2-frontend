"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Bell, Check, ChevronDown, Flame, LogOut, Menu, Moon, Search, Settings, Sun, User, X } from "lucide-react";
import { C, FB, FD, FM, blueGrad, tint } from "../theme";
import { NOTIFICATIONS, searchAll, type SearchResult } from "../data/search";
import { useNav } from "../nav";
import { useTheme } from "@/lib/theme";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "@/lib/auth";

const KIND_COLOR: Record<SearchResult["kind"], string> = {
  "Lab week": C.royal,
  Problem: C.violet,
  Course: C.cyan,
  Page: C.inkMute,
};

export function Topbar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const nav = useNav();
  const { resolved, setTheme } = useTheme();
  const router = useRouter();
  const session = useSession();
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [panel, setPanel] = useState<"none" | "bell" | "account">("none");
  const [read, setRead] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => searchAll(query), [query]);
  const unread = NOTIFICATIONS.filter((n) => n.unread && !read.includes(n.id)).length;

  const openTarget = useCallback(
    (target: SearchResult["target"]) => {
      if (target.type === "lab") nav.openLabWeek(target.labId, target.week);
      else if (target.type === "problem") nav.openProblem(target.problemId);
      else if (target.type === "tech") nav.openTechTab(target.tab);
      else if (target.type === "nontech") nav.openNonTechTab(target.tab);
      else if (target.type === "course") nav.openCourse(target.scope, target.courseId);
      else nav.go(target.view);
      setQuery("");
      setSearchOpen(false);
      setPanel("none");
    },
    [nav],
  );

  // Close popovers on outside click and on Escape; ⌘K / Ctrl-K focuses search.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (searchRef.current && !searchRef.current.contains(t)) setSearchOpen(false);
      if (panelRef.current && !panelRef.current.contains(t)) setPanel("none");
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setSearchOpen(true);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setPanel("none");
      }
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  function onSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!results.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => (h + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => (h - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      openTarget(results[Math.min(highlight, results.length - 1)].target);
    }
  }

  return (
    <div
      style={{
        height: 66, background: C.glass, backdropFilter: "blur(10px)",
        borderBottom: `1px solid ${C.line}`, display: "flex", alignItems: "center", gap: 12,
        padding: "0 20px", position: "sticky", top: 0, zIndex: 40,
      }}
    >
      <button
        className="as-menu-button"
        onClick={onOpenMenu}
        aria-label="Open navigation"
        style={{ border: `1px solid ${C.line}`, background: C.white, borderRadius: 10, width: 40, height: 40, alignItems: "center", justifyContent: "center", cursor: "pointer", color: C.ink }}
      >
        <Menu size={19} />
      </button>

      {/* search */}
      <div ref={searchRef} className="as-search" style={{ position: "relative", flex: 1, minWidth: 0, maxWidth: 420 }}>
        <label
          style={{
            display: "flex", alignItems: "center", gap: 10, minWidth: 0, background: C.white,
            border: `1px solid ${searchOpen ? C.royal : C.line}`, borderRadius: 11, padding: "9px 13px", color: C.inkMute,
          }}
        >
          <Search size={17} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSearchOpen(true); setHighlight(0); }}
            onFocus={() => setSearchOpen(true)}
            onKeyDown={onSearchKeyDown}
            placeholder="Search problems, labs, courses…"
            aria-label="Search AlgoSpark"
            size={1}
            style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: FB, fontSize: 14, color: C.ink, minWidth: 0, width: "100%" }}
          />
          {query ? (
            <button onClick={() => setQuery("")} aria-label="Clear search" style={{ border: "none", background: "none", cursor: "pointer", color: C.inkMute, display: "flex" }}>
              <X size={15} />
            </button>
          ) : (
            <span className="as-hide-sm" style={{ fontFamily: FM, fontSize: 11, color: C.inkMute, border: `1px solid ${C.line}`, borderRadius: 6, padding: "2px 6px" }}>⌘K</span>
          )}
        </label>

        {searchOpen && query.trim().length >= 2 && (
          <div
            className="as-pop as-search-pop"
            style={{
              position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0, background: C.white,
              border: `1px solid ${C.line}`, borderRadius: 14, boxShadow: `0 18px 44px ${C.shadow}`,
              overflow: "hidden", zIndex: 50,
            }}
          >
            {results.length === 0 ? (
              <div style={{ padding: 16, color: C.inkMute, fontSize: 14 }}>No matches for “{query}”.</div>
            ) : (
              results.map((r, i) => (
                <button
                  key={`${r.kind}-${r.id}`}
                  onClick={() => openTarget(r.target)}
                  onMouseEnter={() => setHighlight(i)}
                  style={{
                    width: "100%", textAlign: "left", border: "none", cursor: "pointer", padding: "11px 14px",
                    background: i === highlight ? C.hover : C.white, display: "flex", alignItems: "center", gap: 12,
                    borderTop: i ? `1px solid ${C.line}` : "none",
                  }}
                >
                  <span style={{ fontFamily: FM, fontSize: 10, color: KIND_COLOR[r.kind], background: tint(KIND_COLOR[r.kind], 8), borderRadius: 6, padding: "3px 7px", flex: "none", width: 74, textAlign: "center" }}>
                    {r.kind}
                  </span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: "block", fontSize: 14, fontWeight: 600, color: C.ink }}>{r.title}</span>
                    <span style={{ display: "block", fontSize: 12.5, color: C.inkMute, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {r.subtitle}
                    </span>
                  </span>
                </button>
              ))
            )}
            <div style={{ padding: "8px 14px", borderTop: `1px solid ${C.line}`, fontFamily: FM, fontSize: 11, color: C.inkMute, background: C.cream }}>
              ↑ ↓ to move · ↵ to open · esc to close
            </div>
          </div>
        )}
      </div>

      <div className="as-topbar-spacer" style={{ flex: 1 }} />

      <button
        onClick={() => setTheme(resolved === "dark" ? "light" : "dark")}
        aria-label={resolved === "dark" ? "Switch to light theme" : "Switch to dark theme"}
        title={resolved === "dark" ? "Light theme" : "Dark theme"}
        style={{ border: `1px solid ${C.line}`, background: C.white, borderRadius: 10, width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: C.inkSoft, flex: "none" }}
      >
        {resolved === "dark" ? <Sun size={17} /> : <Moon size={17} />}
      </button>

      <div className="as-streak-chip" style={{ display: "flex", alignItems: "center", gap: 7, background: C.warnBg, color: C.goldDeep, padding: "7px 12px", borderRadius: 999, fontWeight: 600, fontSize: 14 }}>
        <Flame size={16} /> 12 day streak
      </div>

      <div ref={panelRef} style={{ position: "relative", display: "flex", alignItems: "center", gap: 10 }}>
        <button
          onClick={() => setPanel(panel === "bell" ? "none" : "bell")}
          aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
          aria-expanded={panel === "bell"}
          style={{ position: "relative", border: "none", background: "none", cursor: "pointer", color: C.inkSoft, display: "flex", padding: 6 }}
        >
          <Bell size={20} />
          {unread > 0 && (
            <span style={{ position: "absolute", top: 3, right: 3, minWidth: 16, height: 16, borderRadius: 999, background: C.red, color: "#fff", fontFamily: FM, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>
              {unread}
            </span>
          )}
        </button>

        <button
          onClick={() => setPanel(panel === "account" ? "none" : "account")}
          aria-label="Account menu"
          aria-expanded={panel === "account"}
          style={{ border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, padding: 0 }}
        >
          <span style={{ width: 38, height: 38, borderRadius: 999, background: blueGrad, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FD, fontWeight: 600 }}>
            AK
          </span>
          <ChevronDown size={15} color={C.inkMute} />
        </button>

        {panel === "bell" && (
          <div
            className="as-pop"
            style={{ position: "absolute", top: "calc(100% + 10px)", right: 0, width: 340, maxWidth: "calc(100vw - 24px)", background: C.white, border: `1px solid ${C.line}`, borderRadius: 14, boxShadow: `0 18px 44px ${C.shadow}`, overflow: "hidden", zIndex: 50 }}
          >
            <div style={{ display: "flex", alignItems: "center", padding: "12px 14px", borderBottom: `1px solid ${C.line}` }}>
              <span style={{ fontFamily: FD, fontWeight: 600, fontSize: 15 }}>Notifications</span>
              <button
                onClick={() => setRead(NOTIFICATIONS.map((n) => n.id))}
                style={{ marginLeft: "auto", border: "none", background: "none", color: C.blue, fontWeight: 600, fontSize: 12.5, cursor: "pointer", fontFamily: FB, display: "flex", alignItems: "center", gap: 5 }}
              >
                <Check size={13} /> Mark all read
              </button>
            </div>
            <div style={{ maxHeight: 340, overflowY: "auto" }}>
              {NOTIFICATIONS.map((n, i) => {
                const isUnread = n.unread && !read.includes(n.id);
                return (
                  <button
                    key={n.id}
                    onClick={() => { setRead((r) => [...r, n.id]); openTarget(n.target); }}
                    className="as-row"
                    style={{ width: "100%", textAlign: "left", border: "none", background: isUnread ? tint(C.blue, 6) : C.white, cursor: "pointer", padding: "12px 14px", borderTop: i ? `1px solid ${C.line}` : "none", display: "flex", gap: 10 }}
                  >
                    <span style={{ width: 8, height: 8, borderRadius: 999, background: isUnread ? C.blue : "transparent", marginTop: 6, flex: "none" }} />
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: "block", fontSize: 14, fontWeight: 600, color: C.ink }}>{n.title}</span>
                      <span style={{ display: "block", fontSize: 13, color: C.inkSoft, marginTop: 2, lineHeight: 1.45 }}>{n.body}</span>
                      <span style={{ display: "block", fontFamily: FM, fontSize: 11, color: C.inkMute, marginTop: 5 }}>{n.when}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {panel === "account" && (
          <div
            className="as-pop"
            style={{ position: "absolute", top: "calc(100% + 10px)", right: 0, width: 230, background: C.white, border: `1px solid ${C.line}`, borderRadius: 14, boxShadow: `0 18px 44px ${C.shadow}`, overflow: "hidden", zIndex: 50 }}
          >
            <div style={{ padding: "13px 14px", borderBottom: `1px solid ${C.line}` }}>
              <div style={{ fontFamily: FD, fontWeight: 600, fontSize: 14.5 }}>{session?.name ?? "Aditya Kumar"}</div>
              <div style={{ color: C.inkMute, fontSize: 12.5, marginTop: 2 }}>CSE-A · Roll 21CS042</div>
            </div>
            {[
              { label: "View profile", icon: User, action: () => nav.go("profile") },
              { label: "Support", icon: Settings, action: () => nav.go("support") },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => { item.action(); setPanel("none"); }}
                className="as-row"
                style={{ width: "100%", textAlign: "left", border: "none", background: C.white, cursor: "pointer", padding: "11px 14px", display: "flex", alignItems: "center", gap: 10, fontFamily: FB, fontSize: 14, color: C.ink }}
              >
                <item.icon size={16} color={C.inkMute} /> {item.label}
              </button>
            ))}
            <button
              onClick={() => { setPanel("none"); signOut(); router.replace("/login?role=student"); }}
              className="as-row"
              style={{ width: "100%", textAlign: "left", border: "none", borderTop: `1px solid ${C.line}`, background: C.white, cursor: "pointer", padding: "11px 14px", display: "flex", alignItems: "center", gap: 10, fontFamily: FB, fontSize: 14, color: C.red }}
            >
              <LogOut size={16} /> Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
