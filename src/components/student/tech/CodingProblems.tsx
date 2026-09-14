"use client";

import React, { useMemo, useState } from "react";
import { Building2, CheckCircle2, ChevronLeft, ChevronRight, Circle, Gauge, Search, Tags, X } from "lucide-react";
import { C, FB, FD, FM, tint } from "../theme";
import { Card, H2, Pill, ProgressBar } from "../ui";
import { CodePanel } from "../labs/CodePanel";
import { DIFF_COLOR, type Difficulty } from "../labs/types";
import { getProblem, type PracticeProblem } from "../data/problems";
import { monogram, problemGroups, type ProblemGroup } from "../data/problemGroups";
import { getProblemModule, moduleOfProblem, problemModules, type ModuleWithProblems } from "../data/problemModules";
import { useSolved } from "../data/solved";
import { useNav, type ProblemSegregation } from "../nav";

const SEGREGATIONS: { id: ProblemSegregation; label: string; icon: typeof Tags }[] = [
  { id: "companies", label: "By company", icon: Building2 },
  { id: "topics", label: "By topic", icon: Tags },
  { id: "difficulty", label: "By difficulty", icon: Gauge },
];

const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];

/**
 * Module-wise coding problems. The page opens on the modules; inside a module
 * the problems are segregated by company, topic or difficulty, and can be
 * filtered by all three at once.
 */
export function CodingProblems() {
  const { techRoute, setTechRoute } = useNav();
  const problem = techRoute.problemId ? getProblem(techRoute.problemId) : undefined;
  const mod = techRoute.moduleId ? getProblemModule(techRoute.moduleId) : undefined;

  if (problem) {
    const home = mod ?? moduleOfProblem(problem.exercise.id);
    return (
      <ProblemView
        problem={problem}
        backLabel={home ? home.title : "All modules"}
        onBack={() => setTechRoute({ ...techRoute, problemId: null, moduleId: home?.id ?? null })}
      />
    );
  }

  if (mod) {
    return (
      <ModuleDetail
        mod={mod}
        by={techRoute.browse}
        onSegregate={(browse) => setTechRoute({ ...techRoute, browse })}
        onBack={() => setTechRoute({ ...techRoute, moduleId: null })}
        onOpen={(id) => setTechRoute({ ...techRoute, problemId: id })}
      />
    );
  }

  return <ModuleGrid onOpen={(id) => setTechRoute({ ...techRoute, moduleId: id })} />;
}

/* ---------------- modules ---------------- */

function ModuleGrid({ onOpen }: { onOpen: (id: string) => void }) {
  const { isSolved } = useSolved();
  const modules = useMemo(() => problemModules(), []);
  const total = modules.reduce((n, m) => n + m.problems.length, 0);

  return (
    <div>
      <H2 style={{ fontSize: 24 }}>Coding problems</H2>
      <p style={{ color: C.inkSoft, fontSize: 14.5, marginTop: 6 }}>
        {modules.length} modules · {total} problems. Open a module to drill by company, topic or difficulty. Practice here
        never locks or unlocks lab weeks.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 14, marginTop: 16 }}>
        {modules.map((m) => {
          const solved = m.problems.filter((p) => isSolved(p.exercise.id)).length;
          const companies = [...new Set(m.problems.flatMap((p) => p.companies))];
          const topics = [...new Set(m.problems.flatMap((p) => p.tags))];
          return (
            <button
              key={m.id}
              className="as-row"
              onClick={() => onOpen(m.id)}
              style={{ textAlign: "left", cursor: "pointer", background: C.white, border: `1px solid ${C.line}`, borderRadius: 18, padding: 18, display: "flex", flexDirection: "column", gap: 14, fontFamily: FB, color: C.ink }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 12, width: "100%" }}>
                <span style={{ width: 46, height: 46, flex: "none", borderRadius: 13, background: tint(m.color, 10), color: m.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <m.icon size={21} />
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", fontFamily: FD, fontWeight: 600, fontSize: 16 }}>{m.title}</span>
                  <span style={{ display: "block", color: C.inkMute, fontSize: 13, marginTop: 2 }}>{m.blurb}</span>
                </span>
                <ChevronRight size={18} color={C.inkMute} style={{ flex: "none" }} />
              </span>
              <span style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span style={{ fontFamily: FD, fontWeight: 700, fontSize: 26, lineHeight: 1 }}>{m.problems.length}</span>
                <span style={{ color: C.inkMute, fontSize: 13.5 }}>problems</span>
                <span style={{ marginLeft: "auto", fontFamily: FM, fontSize: 12, color: solved === m.problems.length ? C.green : C.inkMute }}>
                  {solved}/{m.problems.length} solved
                </span>
              </span>
              <span style={{ width: "100%" }}>
                <DifficultyBar counts={m.byDifficulty} total={m.problems.length} />
                <span style={{ display: "flex", gap: 12, marginTop: 8, fontFamily: FM, fontSize: 11.5 }}>
                  {DIFFICULTIES.map((d) => (
                    <span key={d} style={{ color: m.byDifficulty[d] ? DIFF_COLOR[d] : C.inkMute }}>
                      {d} {m.byDifficulty[d]}
                    </span>
                  ))}
                </span>
              </span>
              <span style={{ fontSize: 12.5, color: C.inkMute, lineHeight: 1.5 }}>
                {companies.length} companies · {topics.length} topics
              </span>
            </button>
          );
        })}
      </div>
    </div>
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

/* ---------------- one module ---------------- */

const STATUSES = ["All", "Unsolved", "Solved"] as const;

type Section = { key: string; title: string; subtitle: string; color: string; group: ProblemGroup | null; problems: PracticeProblem[] };

function ModuleDetail({
  mod,
  by,
  onSegregate,
  onBack,
  onOpen,
}: {
  mod: ModuleWithProblems;
  by: ProblemSegregation;
  onSegregate: (by: ProblemSegregation) => void;
  onBack: () => void;
  onOpen: (id: string) => void;
}) {
  const { isSolved } = useSolved();
  const [query, setQuery] = useState("");
  const [company, setCompany] = useState("All");
  const [topic, setTopic] = useState("All");
  const [difficulty, setDifficulty] = useState<Difficulty | "All">("All");
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("All");

  const companies = useMemo(() => [...new Set(mod.problems.flatMap((p) => p.companies))].sort(), [mod]);
  const topics = useMemo(() => [...new Set(mod.problems.flatMap((p) => p.tags))].sort(), [mod]);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return mod.problems.filter((p) => {
      if (company !== "All" && !p.companies.includes(company)) return false;
      if (topic !== "All" && !p.tags.includes(topic)) return false;
      if (difficulty !== "All" && p.exercise.difficulty !== difficulty) return false;
      if (status === "Solved" && !isSolved(p.exercise.id)) return false;
      if (status === "Unsolved" && isSolved(p.exercise.id)) return false;
      if (!q) return true;
      return p.exercise.title.toLowerCase().includes(q) || p.tags.some((t) => t.toLowerCase().includes(q)) || p.companies.some((c) => c.toLowerCase().includes(q));
    });
  }, [mod, query, company, topic, difficulty, status, isSolved]);

  // A problem appears under every company or topic it carries.
  const sections = useMemo<Section[]>(() => {
    if (by === "difficulty") {
      return DIFFICULTIES.map((d) => ({
        key: d, title: d, subtitle: "", color: DIFF_COLOR[d], group: null,
        problems: list.filter((p) => p.exercise.difficulty === d),
      })).filter((s) => s.problems.length);
    }
    return problemGroups(by, list).map((g) => ({ key: g.name, title: g.name, subtitle: g.subtitle, color: g.color, group: g, problems: g.problems }));
  }, [by, list]);

  const total = mod.problems.length;
  const solvedCount = mod.problems.filter((p) => isSolved(p.exercise.id)).length;
  const filtered = query || company !== "All" || topic !== "All" || difficulty !== "All" || status !== "All";

  return (
    <div>
      <BackButton label="All modules" onClick={onBack} />

      <Card style={{ padding: 20, marginTop: 12, display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
        <span style={{ width: 58, height: 58, flex: "none", borderRadius: 15, background: tint(mod.color, 10), color: mod.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <mod.icon size={26} />
        </span>
        <div style={{ flex: 1, minWidth: 200 }}>
          <H2 style={{ fontSize: 24, margin: 0 }}>{mod.title}</H2>
          <div style={{ color: C.inkMute, fontSize: 14, marginTop: 3 }}>{mod.blurb}</div>
        </div>
        <div style={{ display: "flex", gap: 22, flexWrap: "wrap" }}>
          <Stat label="problems" value={total} color={C.ink} />
          {DIFFICULTIES.map((d) => (
            <Stat key={d} label={d.toLowerCase()} value={mod.byDifficulty[d]} color={DIFF_COLOR[d]} />
          ))}
        </div>
        <div style={{ flexBasis: "100%", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ flex: 1 }}>
            <ProgressBar value={total ? (solvedCount / total) * 100 : 0} color={C.green} height={6} />
          </span>
          <span style={{ fontFamily: FM, fontSize: 12.5, color: C.inkMute }}>{solvedCount}/{total} solved</span>
        </div>
      </Card>

      <div style={{ display: "flex", gap: 6, borderBottom: `1px solid ${C.line}`, flexWrap: "wrap", marginTop: 14 }}>
        {SEGREGATIONS.map((t) => {
          const active = by === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onSegregate(t.id)}
              aria-pressed={active}
              style={{
                border: "none", background: "none", cursor: "pointer", padding: "11px 14px", display: "flex",
                alignItems: "center", gap: 8, fontFamily: FB, fontWeight: 600, fontSize: 14.5,
                color: active ? C.royal : C.inkMute, borderBottom: `2.5px solid ${active ? C.royal : "transparent"}`, marginBottom: -1,
              }}
            >
              <t.icon size={17} /> {t.label}
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", margin: "14px 0 12px" }}>
        <SearchField value={query} onChange={setQuery} placeholder={`Search ${mod.title}`} />
        <SelectChip label="Company" value={company} options={companies} onChange={setCompany} />
        <SelectChip label="Topic" value={topic} options={topics} onChange={setTopic} />
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
            onClick={() => { setQuery(""); setCompany("All"); setTopic("All"); setDifficulty("All"); setStatus("All"); }}
            style={{ border: "none", background: "none", color: C.blue, fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: FB }}
          >
            Clear filters
          </button>
        )}
      </div>

      {sections.length === 0 ? (
        <Card style={{ padding: 40, textAlign: "center" }}>
          <div style={{ fontFamily: FD, fontWeight: 600, fontSize: 17 }}>No problems match those filters</div>
          <p style={{ color: C.inkMute, fontSize: 14.5, marginTop: 6 }}>Clear the filters to see all {total}.</p>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {sections.map((sec) => (
            <Card key={sec.key} style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "12px 18px", borderBottom: `1px solid ${C.line}`, background: C.cream }}>
                {sec.group ? <GroupLogo group={sec.group} size={30} /> : <span style={{ width: 10, height: 10, borderRadius: 999, background: sec.color }} />}
                <span style={{ fontFamily: FD, fontWeight: 600, fontSize: 15 }}>{sec.title}</span>
                {sec.subtitle && <span className="as-hide-sm" style={{ color: C.inkMute, fontSize: 12.5 }}>{sec.subtitle}</span>}
                <span style={{ marginLeft: "auto", fontFamily: FM, fontSize: 12, color: C.inkMute }}>
                  {sec.problems.length} problem{sec.problems.length === 1 ? "" : "s"}
                </span>
              </div>
              {sec.problems.map((p, i) => (
                <ProblemRow key={p.exercise.id} problem={p} first={i === 0} solved={isSolved(p.exercise.id)} onOpen={() => onOpen(p.exercise.id)} />
              ))}
            </Card>
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
      <span style={{ width: size, height: size, flex: "none", borderRadius: Math.round(size * 0.28), background: tint(group.color, 9), color: group.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={Math.round(size * 0.5)} />
      </span>
    );
  }
  return (
    <span
      aria-hidden
      style={{
        width: size, height: size, flex: "none", borderRadius: Math.round(size * 0.28), background: group.color, color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FD, fontWeight: 700, fontSize: Math.round(size * 0.44),
      }}
    >
      {monogram(group.name)}
    </span>
  );
}

function SelectChip({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  const active = value !== "All";
  return (
    <label
      style={{
        display: "flex", alignItems: "center", gap: 6, border: `1.5px solid ${active ? C.royal : C.line}`, background: active ? tint(C.royal, 7) : C.white,
        borderRadius: 999, padding: "5px 12px", fontFamily: FB, fontSize: 13.5, fontWeight: 600, color: active ? C.royal : C.inkSoft,
      }}
    >
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={`Filter by ${label.toLowerCase()}`}
        style={{ border: "none", background: "transparent", fontFamily: FB, fontSize: 13.5, fontWeight: 600, color: "inherit", cursor: "pointer", outline: "none" }}
      >
        <option value="All">All</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
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

      <CodePanel exercise={problem.exercise} solved={solved} onSolved={() => markSolved(problem.exercise.id)} context="practice" />
    </div>
  );
}
