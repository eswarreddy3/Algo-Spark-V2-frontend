"use client";

import React, { useMemo, useState } from "react";
import { Flame, Minus, Search, TrendingDown, TrendingUp, Trophy } from "lucide-react";
import { C, FB, FD, FM, blueGrad, tint } from "../theme";
import { Card, H2, Kicker, Pill, Serif } from "../ui";
import { SCOPE_META, liveBoard, type LeaderRow, type Scope } from "../data/leaderboard";
import { usePerformance } from "../data/performance";
import { STUDENT } from "../data/student";

// Ranking is per college; section and branch narrow the same college board.
const SCOPES: Scope[] = ["College", "Branch", "Section"];

const initials = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");

export function LeaderboardPage() {
  const { points, streak } = usePerformance();
  const [scope, setScope] = useState<Scope>("College");
  const [query, setQuery] = useState("");

  const rows = useMemo(() => liveBoard(scope, points, streak), [scope, points, streak]);
  const you = rows.find((r) => r.you);
  const podium = rows.slice(0, 3);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => r.name.toLowerCase().includes(q) || r.group.toLowerCase().includes(q));
  }, [rows, query]);

  const percentile = you ? Math.round((1 - you.rank / SCOPE_META[scope].population) * 100) : 0;

  return (
    <div>
      <Kicker>Leaderboard</Kicker>
      <H2>
        Where you <Serif>stand.</Serif>
      </H2>
      <p style={{ color: C.inkSoft, marginTop: 8, fontSize: 15.5, maxWidth: 620 }}>
        {STUDENT.college} only. Points = lab completion + coding + exam scores, and your position updates the moment one is recorded.
      </p>

      <div style={{ display: "flex", gap: 12, marginTop: 18, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 8 }}>
          {SCOPES.map((s) => (
            <button
              key={s}
              onClick={() => setScope(s)}
              aria-pressed={scope === s}
              style={{
                border: `1.5px solid ${scope === s ? C.royal : C.line}`, background: scope === s ? tint(C.royal, 8) : C.white,
                color: scope === s ? C.royal : C.inkSoft, borderRadius: 999, padding: "8px 18px", cursor: "pointer",
                fontFamily: FB, fontWeight: 600, fontSize: 13.5,
              }}
            >
              {s}
            </button>
          ))}
        </div>
        <Pill>{SCOPE_META[scope].label}</Pill>
        <label style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 9, background: C.white, border: `1px solid ${C.line}`, borderRadius: 11, padding: "9px 12px", minWidth: 220 }}>
          <Search size={16} color={C.inkMute} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find a classmate"
            aria-label="Search the leaderboard"
            style={{ flex: 1, border: "none", outline: "none", fontFamily: FB, fontSize: 14, color: C.ink, minWidth: 0 }}
          />
        </label>
      </div>

      {you && (
        <Card style={{ padding: 18, marginTop: 16, display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap", background: "linear-gradient(120deg,#101433,#26327A)", border: "none", color: "#fff" }}>
          <div style={{ width: 52, height: 52, borderRadius: 999, background: "rgba(255,255,255,.14)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FD, fontWeight: 700, fontSize: 18 }}>
            {initials(you.name)}
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontFamily: FM, fontSize: 11.5, color: "#AEB6E0", letterSpacing: ".1em" }}>YOUR POSITION</div>
            <div style={{ fontFamily: FD, fontWeight: 700, fontSize: 22, marginTop: 3 }}>
              #{you.rank} in {scope.toLowerCase()} · top {100 - percentile === 0 ? 1 : 100 - percentile}%
            </div>
          </div>
          <div style={{ display: "flex", gap: 26, flexWrap: "wrap" }}>
            <MiniStat label="points" value={you.points.toLocaleString()} />
            <MiniStat label="solved" value={String(you.solved)} />
            <MiniStat label="streak" value={`${you.streak}d`} />
            <MiniStat label="this week" value={you.delta > 0 ? `+${you.delta}` : String(you.delta)} tint={you.delta > 0 ? "#5AD6B0" : you.delta < 0 ? "#FF8A8A" : "#AEB6E0"} />
          </div>
        </Card>
      )}

      {!query && (
        <div style={{ display: "flex", gap: 14, marginTop: 20, alignItems: "flex-end", justifyContent: "center", flexWrap: "wrap" }}>
          {[podium[1], podium[0], podium[2]].filter(Boolean).map((r, i) => {
            const height = i === 1 ? 132 : 100;
            const medal = i === 1 ? C.gold : i === 0 ? "#C0C7D8" : "#E1A06B";
            return (
              <div key={r.name} style={{ textAlign: "center", width: 140 }}>
                <div style={{ width: 54, height: 54, borderRadius: 999, background: blueGrad, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px", fontFamily: FD, fontWeight: 700 }}>
                  {initials(r.name)}
                </div>
                <div style={{ fontFamily: FD, fontWeight: 600, fontSize: 14 }}>{r.name.split(" ")[0]}</div>
                <div style={{ fontFamily: FM, fontSize: 12, color: C.inkMute }}>{r.points.toLocaleString()}</div>
                <div style={{ height, borderRadius: "12px 12px 0 0", background: `linear-gradient(180deg,${medal},${tint(medal, 53)})`, marginTop: 8, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 10, fontFamily: FD, fontWeight: 700, color: "#fff", fontSize: 22 }}>
                  {r.rank}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Card style={{ padding: 0, overflow: "hidden", marginTop: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "11px 18px", borderBottom: `1px solid ${C.line}`, fontFamily: FM, fontSize: 11, letterSpacing: ".08em", color: C.inkMute }}>
          <span style={{ width: 30 }}>#</span>
          <span style={{ flex: 1 }}>STUDENT</span>
          <span className="as-hide-sm" style={{ width: 70, textAlign: "right" }}>SOLVED</span>
          <span className="as-hide-sm" style={{ width: 70, textAlign: "right" }}>STREAK</span>
          <span className="as-hide-sm" style={{ width: 70, textAlign: "right" }}>WEEK</span>
          <span style={{ width: 80, textAlign: "right" }}>POINTS</span>
        </div>
        {filtered.length === 0 ? (
          <div style={{ padding: 30, textAlign: "center", color: C.inkMute, fontSize: 14.5 }}>
            No one here matches “{query}”.
          </div>
        ) : (
          filtered.map((r) => <Row key={r.name} row={r} />)
        )}
      </Card>
    </div>
  );
}

function MiniStat({ label, value, tint = "#fff" }: { label: string; value: string; tint?: string }) {
  return (
    <div>
      <div style={{ fontFamily: FD, fontWeight: 700, fontSize: 20, color: tint }}>{value}</div>
      <div style={{ color: "#AEB6E0", fontSize: 12 }}>{label}</div>
    </div>
  );
}

function Row({ row }: { row: LeaderRow }) {
  const Delta = row.delta > 0 ? TrendingUp : row.delta < 0 ? TrendingDown : Minus;
  const deltaColor = row.delta > 0 ? C.green : row.delta < 0 ? C.red : C.inkMute;

  return (
    <div
      className="as-row"
      style={{
        display: "flex", alignItems: "center", gap: 14, padding: "12px 18px", borderTop: `1px solid ${C.line}`,
        background: row.you ? tint(C.royal, 7) : C.white,
      }}
    >
      <span style={{ width: 30, fontFamily: FD, fontWeight: 700, color: row.rank <= 3 ? C.goldDeep : C.inkMute, display: "flex", alignItems: "center", gap: 4 }}>
        {row.rank <= 3 && <Trophy size={13} />}
        {row.rank}
      </span>
      <span style={{ width: 36, height: 36, flex: "none", borderRadius: 999, background: row.you ? blueGrad : C.cream, color: row.you ? "#fff" : C.inkSoft, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600 }}>
        {initials(row.name)}
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontWeight: row.you ? 700 : 600, fontSize: 15, color: row.you ? C.royal : C.ink }}>{row.name}</span>
          {row.you && <Pill color={C.royal} bg={tint(C.royal, 12)}>YOU</Pill>}
        </span>
        <span style={{ display: "block", fontSize: 12.5, color: C.inkMute }}>{row.group}</span>
      </span>
      <span className="as-hide-sm" style={{ width: 70, textAlign: "right", fontFamily: FM, fontSize: 13, color: C.inkSoft }}>{row.solved}</span>
      <span className="as-hide-sm" style={{ width: 70, textAlign: "right", fontFamily: FM, fontSize: 13, color: C.inkSoft, display: "inline-flex", alignItems: "center", justifyContent: "flex-end", gap: 4 }}>
        <Flame size={12} color={row.streak >= 10 ? C.goldDeep : C.inkMute} />
        {row.streak}
      </span>
      <span className="as-hide-sm" style={{ width: 70, textAlign: "right", fontFamily: FM, fontSize: 13, color: deltaColor, display: "inline-flex", alignItems: "center", justifyContent: "flex-end", gap: 4 }}>
        <Delta size={13} />
        {row.delta === 0 ? "—" : Math.abs(row.delta)}
      </span>
      <span style={{ width: 80, textAlign: "right", fontFamily: FD, fontWeight: 700, fontSize: 16 }}>{row.points.toLocaleString()}</span>
    </div>
  );
}
