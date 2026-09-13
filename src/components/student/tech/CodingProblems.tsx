"use client";

import React, { useMemo, useState } from "react";
import { Building2, CheckCircle2, ChevronLeft, ChevronRight, Circle, Search, Tags, X } from "lucide-react";
import { C, FB, FD, FM, tint } from "../theme";
import { Card, H2, Pill, ProgressBar } from "../ui";
import { CodePanel } from "../labs/CodePanel";
import { DIFF_COLOR, type Difficulty } from "../labs/types";
import { PRACTICE_PROBLEMS, getProblem, type PracticeProblem } from "../data/problems";
import { getProblemGroup, monogram, problemGroups, type GroupBy, type ProblemGroup } from "../data/problemGroups";
import { useSolved } from "../data/solved";
import { useNav } from "../nav";

const BROWSE_TABS = [
  { id: "topics", label: "Topics", icon: Tags },
  { id: "companies", label: "Companies", icon: Building2 },
] as const;

const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];

/**
 * Coding problems, browsed by topic or by company. Both views read the same
 * bank; a problem appears under every topic tag and company it carries.
 */
export function CodingProblems() {
  const { techRoute, setTechRoute } = useNav();
  const problem = techRoute.problemId ? getProblem(techRoute.problemId) : undefined;
  const group = techRoute.group ? getProblemGroup(techRoute.browse, techRoute.group) : undefined;

  if (problem) {
    return (
      <ProblemView
        problem={problem}
        backLabel={group ? group.name : "All problems"}
        onBack={() => setTechRoute({ ...techRoute, problemId: null })}
      />
    );
  }

  if (group) {
    return (
      <GroupDetail
        group={group}
        onBack={() => setTechRoute({ ...techRoute, group: null })}
        onOpen={(id) => setTechRoute({ ...techRoute, problemId: id })}
      />
    );
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 6, borderBottom: `1px solid ${C.line}`, flexWrap: "wrap" }}>
        {BROWSE_TABS.map((t) => {
          const active = techRoute.browse === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTechRoute({ ...techRoute, browse: t.id, group: null })}
              aria-current={active ? "page" : undefined}
              style={{
                border: "none", background: "none", cursor: "pointer", padding: "11px 14px", display: "flex",
                alignItems: "center", gap: 8, fontFamily: FB, fontWeight: 600, fontSize: 14.5,
                color: active ? C.royal : C.inkMute,
                borderBottom: `2.5px solid ${active ? C.royal : "transparent"}`, marginBottom: -1,
              }}
            >
              <t.icon size={17} /> {t.label}
            </button>
          );
        })}
      </div>

      <GroupGrid
        key={techRoute.browse}
        by={techRoute.browse}
        onOpen={(name) => setTechRoute({ ...techRoute, group: name })}
      />
    </div>
  );
}

/* ---------------- topic / company grid ---------------- */

function GroupGrid({ by, onOpen }: { by: GroupBy; onOpen: (name: string) => void }) {
  const { isSolved } = useSolved();
  const [query, setQuery] = useState("");
  const groups = useMemo(() => problemGroups(by), [by]);
  const q = query.trim().toLowerCase();
  const shown = q ? groups.filter((g) => g.name.toLowerCase().includes(q) || g.subtitle.toLowerCase().includes(q)) : groups;
  const noun = by === "topics" ? "topic" : "company";
  const plural = by === "topics" ? "topics" : "companies";

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "16px 0", flexWrap: "wrap" }}>
        <SearchField value={query} onChange={setQuery} placeholder={`Search ${plural}`} />
        <span style={{ fontSize: 13.5, color: C.inkMute }}>
          {shown.length} {shown.length === 1 ? noun : plural} · {PRACTICE_PROBLEMS.length} problems in the bank
        </span>
      </div>

      {shown.length === 0 ? (
        <Card style={{ padding: 40, textAlign: "center" }}>
          <div style={{ fontFamily: FD, fontWeight: 600, fontSize: 17 }}>No {plural} match “{query}”</div>
        </Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 14 }}>
          {shown.map((g) => (
            <GroupCard
              key={g.name}
              group={g}
              solved={g.problems.filter((p) => isSolved(p.exercise.id)).length}
              onOpen={() => onOpen(g.name)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function GroupLogo({ group, size = 46 }: { group: ProblemGroup; size?: number }) {
  if (group.icon) {
    const Icon = group.icon;
    return (
      <span style={{ width: size, height: size, flex: "none", borderRadius: 13, background: tint(group.color, 9), color: group.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={Math.round(size * 0.46)} />
      </span>
    );
  }
  return (
    <span
      aria-hidden
      style={{
        width: size, height: size, flex: "none", borderRadius: 13, background: group.color, color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FD, fontWeight: 700,
        fontSize: Math.round(size * 0.44), boxShadow: `0 6px 16px ${tint(group.color, 20)}`,
      }}
    >
      {monogram(group.name)}
    </span>
  );
}

function GroupCard({ group, solved, onOpen }: { group: ProblemGroup; solved: number; onOpen: () => void }) {
  const total = group.problems.length;
  return (
    <button
      className="as-row"
      onClick={onOpen}
      style={{
        textAlign: "left", cursor: "pointer", background: C.white, border: `1px solid ${C.line}`, borderRadius: 18,
        padding: 18, display: "flex", flexDirection: "column", gap: 14, fontFamily: FB, color: C.ink,
      }}
    >
      <span style={{ display: "flex", alignItems: "center", gap: 12, width: "100%" }}>
        <GroupLogo group={group} />
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", fontFamily: FD, fontWeight: 600, fontSize: 16 }}>{group.name}</span>
          <span style={{ display: "block", color: C.inkMute, fontSize: 13, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {group.subtitle}
          </span>
        </span>
        <ChevronRight size={18} color={C.inkMute} style={{ flex: "none" }} />
      </span>

      <span style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span style={{ fontFamily: FD, fontWeight: 700, fontSize: 26, lineHeight: 1 }}>{total}</span>
        <span style={{ color: C.inkMute, fontSize: 13.5 }}>problem{total === 1 ? "" : "s"}</span>
        <span style={{ marginLeft: "auto", fontFamily: FM, fontSize: 12, color: solved === total ? C.green : C.inkMute }}>
          {solved}/{total} solved
        </span>
      </span>

      <span style={{ width: "100%" }}>
        <DifficultyBar counts={group.byDifficulty} total={total} />
        <span style={{ display: "flex", gap: 12, marginTop: 8, fontFamily: FM, fontSize: 11.5 }}>
          {DIFFICULTIES.map((d) => (
            <span key={d} style={{ color: group.byDifficulty[d] ? DIFF_COLOR[d] : C.inkMute }}>
              {d} {group.byDifficulty[d]}
            </span>
          ))}
        </span>
      </span>
    </button>
  );
}

/** One stacked bar split by difficulty. */
function DifficultyBar({ counts, total }: { counts: Record<Difficulty, number>; total: number }) {
  return (
    <span style={{ display: "flex", height: 6, borderRadius: 6, overflow: "hidden", background: C.cream, gap: 2 }}>
      {DIFFICULTIES.filter((d) => counts[d]).map((d) => (
        <span key={d} style={{ width: `${(counts[d] / total) * 100}%`, background: DIFF_COLOR[d] }} />
      ))}
    </span>
  );
}

/* ---------------- one topic / company ---------------- */

const STATUSES = ["All", "Unsolved", "Solved"] as const;

function GroupDetail({ group, onBack, onOpen }: { group: ProblemGroup; onBack: () => void; onOpen: (id: string) => void }) {
  const { isSolved } = useSolved();
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty | "All">("All");
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("All");

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return group.problems.filter((p) => {
      if (difficulty !== "All" && p.exercise.difficulty !== difficulty) return false;
      if (status === "Solved" && !isSolved(p.exercise.id)) return false;
      if (status === "Unsolved" && isSolved(p.exercise.id)) return false;
      if (!q) return true;
      return (
        p.exercise.title.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        p.companies.some((c) => c.toLowerCase().includes(q))
      );
    });
  }, [group, query, difficulty, status, isSolved]);

  const total = group.problems.length;
  const solvedCount = group.problems.filter((p) => isSolved(p.exercise.id)).length;
  const filtered = query || difficulty !== "All" || status !== "All";

  return (
    <div>
      <BackButton label={group.by === "topics" ? "All topics" : "All companies"} onClick={onBack} />

      <Card style={{ padding: 20, marginTop: 12, display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
        <GroupLogo group={group} size={58} />
        <div style={{ flex: 1, minWidth: 200 }}>
          <H2 style={{ fontSize: 24, margin: 0 }}>{group.name}</H2>
          <div style={{ color: C.inkMute, fontSize: 14, marginTop: 3 }}>{group.subtitle}</div>
        </div>
        <div style={{ display: "flex", gap: 22, flexWrap: "wrap" }}>
          <Stat label="problems" value={total} color={C.ink} />
          {DIFFICULTIES.map((d) => (
            <Stat key={d} label={d.toLowerCase()} value={group.byDifficulty[d]} color={DIFF_COLOR[d]} />
          ))}
        </div>
        <div style={{ flexBasis: "100%", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ flex: 1 }}>
            <ProgressBar value={total ? (solvedCount / total) * 100 : 0} color={C.green} height={6} />
          </span>
          <span style={{ fontFamily: FM, fontSize: 12.5, color: C.inkMute }}>{solvedCount}/{total} solved</span>
        </div>
      </Card>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", margin: "16px 0 12px" }}>
        <SearchField value={query} onChange={setQuery} placeholder={`Search ${group.name} problems`} />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {(["All", ...DIFFICULTIES] as const).map((d) => (
            <FilterChip key={d} active={difficulty === d} onClick={() => setDifficulty(d)} color={d === "All" ? C.royal : DIFF_COLOR[d]}>
              {d}
            </FilterChip>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {STATUSES.map((s) => (
            <FilterChip key={s} active={status === s} onClick={() => setStatus(s)} color={C.royal}>
              {s}
            </FilterChip>
          ))}
        </div>
        {filtered && (
          <button
            onClick={() => { setQuery(""); setDifficulty("All"); setStatus("All"); }}
            style={{ border: "none", background: "none", color: C.blue, fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: FB }}
          >
            Clear filters
          </button>
        )}
      </div>

      {list.length === 0 ? (
        <Card style={{ padding: 40, textAlign: "center" }}>
          <div style={{ fontFamily: FD, fontWeight: 600, fontSize: 17 }}>No problems match those filters</div>
          <p style={{ color: C.inkMute, fontSize: 14.5, marginTop: 6 }}>Clear the filters to see all {total}.</p>
        </Card>
      ) : (
        <Card style={{ padding: 0, overflow: "hidden" }}>
          {list.map((p, i) => (
            <ProblemRow key={p.exercise.id} problem={p} first={i === 0} solved={isSolved(p.exercise.id)} onOpen={() => onOpen(p.exercise.id)} />
          ))}
        </Card>
      )}
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ textAlign: "center", minWidth: 44 }}>
      <div style={{ fontFamily: FD, fontWeight: 700, fontSize: 22, color, lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontFamily: FM, fontSize: 11.5, color: C.inkMute, marginTop: 2 }}>{label}</div>
    </div>
  );
}

export function SearchField({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <label style={{ flex: 1, minWidth: 220, maxWidth: 420, display: "flex", alignItems: "center", gap: 9, background: C.white, border: `1px solid ${C.line}`, borderRadius: 11, padding: "9px 12px" }}>
      <Search size={16} color={C.inkMute} />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        style={{ flex: 1, border: "none", background: "transparent", outline: "none", fontFamily: FB, fontSize: 14.5, color: C.ink, minWidth: 0 }}
      />
      {value && (
        <button onClick={() => onChange("")} aria-label="Clear search" style={{ border: "none", background: "none", cursor: "pointer", color: C.inkMute, display: "flex" }}>
          <X size={15} />
        </button>
      )}
    </label>
  );
}

function BackButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{ border: "none", background: "none", color: C.inkSoft, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: FB, fontSize: 14, fontWeight: 600, padding: 0 }}
    >
      <ChevronLeft size={17} /> {label}
    </button>
  );
}

export function FilterChip({
  active,
  onClick,
  color,
  children,
}: {
  active: boolean;
  onClick: () => void;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      style={{
        border: `1.5px solid ${active ? color : C.line}`, background: active ? tint(color, 7) : C.white,
        color: active ? color : C.inkSoft, borderRadius: 999, padding: "7px 15px", cursor: "pointer",
        fontFamily: FB, fontWeight: 600, fontSize: 13.5,
      }}
    >
      {children}
    </button>
  );
}

export function ProblemRow({
  problem,
  first,
  solved,
  onOpen,
}: {
  problem: PracticeProblem;
  first: boolean;
  solved: boolean;
  onOpen: () => void;
}) {
  const { exercise } = problem;
  return (
    <button
      className="as-row"
      onClick={onOpen}
      style={{
        width: "100%", textAlign: "left", cursor: "pointer", border: "none", background: C.white,
        borderTop: first ? "none" : `1px solid ${C.line}`, padding: "15px 18px", display: "flex",
        alignItems: "center", gap: 14, flexWrap: "wrap",
      }}
    >
      <span style={{ width: 30, height: 30, flex: "none", borderRadius: 999, background: solved ? C.greenBg : C.cream, color: solved ? C.green : C.inkMute, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {solved ? <CheckCircle2 size={17} /> : <Circle size={13} />}
      </span>
      <span style={{ flex: 1, minWidth: 200 }}>
        <span style={{ display: "block", fontFamily: FD, fontWeight: 600, fontSize: 15.5 }}>{exercise.title}</span>
        <span style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
          {problem.tags.map((t) => (
            <Pill key={t}>{t}</Pill>
          ))}
          {problem.companies.map((c) => (
            <Pill key={c} color={C.blue} bg={tint(C.royal, 9)}>
              {c}
            </Pill>
          ))}
        </span>
      </span>
      <span style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <span className="as-hide-sm" style={{ textAlign: "right" }}>
          <span style={{ display: "block", fontFamily: FM, fontSize: 12, color: C.inkMute }}>acceptance</span>
          <span style={{ display: "block", fontFamily: FM, fontSize: 13, color: C.inkSoft }}>{problem.acceptance}%</span>
        </span>
        <span style={{ fontFamily: FM, fontSize: 12.5, fontWeight: 600, color: DIFF_COLOR[exercise.difficulty], width: 58, textAlign: "right" }}>
          {exercise.difficulty}
        </span>
        <ChevronRight size={18} color={C.inkMute} />
      </span>
    </button>
  );
}

/* ---------------- single problem ---------------- */

function ProblemView({ problem, backLabel, onBack }: { problem: PracticeProblem; backLabel: string; onBack: () => void }) {
  const { isSolved, markSolved } = useSolved();
  const solved = isSolved(problem.exercise.id);

  return (
    <div>
      <BackButton label={backLabel} onClick={onBack} />

      <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "12px 0 18px", flexWrap: "wrap" }}>
        <H2 style={{ fontSize: 24, margin: 0 }}>{problem.exercise.title}</H2>
        <Pill color={DIFF_COLOR[problem.exercise.difficulty]} bg={tint(DIFF_COLOR[problem.exercise.difficulty], 10)}>
          {problem.exercise.difficulty}
        </Pill>
        {problem.companies.map((c) => (
          <Pill key={c} color={C.blue} bg={tint(C.royal, 9)}>
            {c}
          </Pill>
        ))}
        <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: solved ? C.green : C.inkMute }}>
          {solved ? <><CheckCircle2 size={16} /> Solved</> : `${problem.acceptance}% acceptance`}
        </span>
      </div>

      <CodePanel exercise={problem.exercise} solved={solved} onSolved={() => markSolved(problem.exercise.id)} />
    </div>
  );
}
