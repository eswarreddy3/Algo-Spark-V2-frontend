"use client";

import React, { useMemo, useState } from "react";
import {
  ChevronLeft, ChevronRight, Circle, CheckCircle2, Code2, Database, Play, Search, SlidersHorizontal, Terminal, X,
} from "lucide-react";
import { C, EDITOR, FB, FD, FM, goldGrad } from "../theme";
import { Card, H2, Kicker, Pill, ProgressBar, Serif } from "../ui";
import { CodeEditor } from "../labs/CodeEditor";
import { CodePanel } from "../labs/CodePanel";
import { DIFF_COLOR, type Difficulty } from "../labs/types";
import { PRACTICE_PROBLEMS, getProblem, type PracticeProblem } from "../data/problems";
import { useSolved } from "../data/solved";
import { useNav } from "../nav";

const TABS = [
  { id: "problems", label: "Coding problems", icon: Code2 },
  { id: "sql", label: "SQL compiler", icon: Database },
  { id: "playground", label: "Free compile", icon: Terminal },
] as const;

export function TechPage() {
  const { techRoute, setTechRoute } = useNav();
  const problem = techRoute.problemId ? getProblem(techRoute.problemId) : undefined;

  if (problem) {
    return <ProblemView problem={problem} onBack={() => setTechRoute({ ...techRoute, problemId: null })} />;
  }

  return (
    <div>
      <Kicker>Tech</Kicker>
      <H2>
        Practice like it’s an <Serif>interview.</Serif>
      </H2>
      <p style={{ color: C.inkSoft, marginTop: 8, fontSize: 15.5, maxWidth: 660 }}>
        The same editor and judge you get in labs, on a bank of company-tagged problems — plus a SQL console and a
        scratch playground where nothing is graded.
      </p>

      <div style={{ display: "flex", gap: 6, marginTop: 18, borderBottom: `1px solid ${C.line}`, flexWrap: "wrap" }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTechRoute({ tab: t.id, problemId: null })}
            style={{
              border: "none", background: "none", cursor: "pointer", padding: "11px 14px", display: "flex",
              alignItems: "center", gap: 8, fontFamily: FB, fontWeight: 600, fontSize: 14.5,
              color: techRoute.tab === t.id ? C.royal : C.inkMute,
              borderBottom: `2.5px solid ${techRoute.tab === t.id ? C.royal : "transparent"}`, marginBottom: -1,
            }}
          >
            <t.icon size={17} /> {t.label}
          </button>
        ))}
      </div>

      {techRoute.tab === "problems" && <ProblemList onOpen={(id) => setTechRoute({ ...techRoute, problemId: id })} />}
      {techRoute.tab === "sql" && <SqlConsole />}
      {techRoute.tab === "playground" && <Playground />}
    </div>
  );
}

/* ---------------- problem list ---------------- */

const DIFFICULTIES: (Difficulty | "All")[] = ["All", "Easy", "Medium", "Hard"];
const STATUSES = ["All", "Unsolved", "Solved"] as const;

function ProblemList({ onOpen }: { onOpen: (id: string) => void }) {
  const { isSolved } = useSolved();
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty | "All">("All");
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("All");
  const [tag, setTag] = useState<string | null>(null);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    PRACTICE_PROBLEMS.forEach((p) => p.tags.forEach((t) => set.add(t)));
    return [...set].sort();
  }, []);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PRACTICE_PROBLEMS.filter((p) => {
      if (difficulty !== "All" && p.exercise.difficulty !== difficulty) return false;
      if (status === "Solved" && !isSolved(p.exercise.id)) return false;
      if (status === "Unsolved" && isSolved(p.exercise.id)) return false;
      if (tag && !p.tags.includes(tag)) return false;
      if (!q) return true;
      return (
        p.exercise.title.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        p.companies.some((c) => c.toLowerCase().includes(q))
      );
    });
  }, [query, difficulty, status, tag, isSolved]);

  const solvedCount = PRACTICE_PROBLEMS.filter((p) => isSolved(p.exercise.id)).length;
  const filtered = query || difficulty !== "All" || status !== "All" || tag;

  return (
    <div>
      <Card style={{ padding: 16, marginTop: 18 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <label style={{ flex: 1, minWidth: 230, display: "flex", alignItems: "center", gap: 9, background: C.cream, border: `1px solid ${C.line}`, borderRadius: 11, padding: "9px 12px" }}>
            <Search size={16} color={C.inkMute} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, topic or company"
              aria-label="Search problems"
              style={{ flex: 1, border: "none", background: "transparent", outline: "none", fontFamily: FB, fontSize: 14.5, color: C.ink, minWidth: 0 }}
            />
            {query && (
              <button onClick={() => setQuery("")} aria-label="Clear search" style={{ border: "none", background: "none", cursor: "pointer", color: C.inkMute, display: "flex" }}>
                <X size={15} />
              </button>
            )}
          </label>

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {DIFFICULTIES.map((d) => (
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
        </div>

        <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap", alignItems: "center" }}>
          <SlidersHorizontal size={14} color={C.inkMute} />
          {allTags.map((t) => (
            <button
              key={t}
              onClick={() => setTag(tag === t ? null : t)}
              style={{
                border: `1px solid ${tag === t ? C.royal : C.line}`, background: tag === t ? "rgba(47,91,240,.07)" : "#fff",
                color: tag === t ? C.royal : C.inkSoft, borderRadius: 999, padding: "4px 11px", cursor: "pointer",
                fontFamily: FM, fontSize: 11.5,
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </Card>

      <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "16px 2px 10px", flexWrap: "wrap" }}>
        <span style={{ fontSize: 13.5, color: C.inkMute }}>
          {list.length} problem{list.length === 1 ? "" : "s"}
          {filtered ? " match your filters" : " in the bank"}
        </span>
        <span style={{ flex: 1, minWidth: 120, maxWidth: 220 }}>
          <ProgressBar value={(solvedCount / PRACTICE_PROBLEMS.length) * 100} color={C.green} height={6} />
        </span>
        <span style={{ fontFamily: FM, fontSize: 12.5, color: C.inkMute }}>
          {solvedCount}/{PRACTICE_PROBLEMS.length} solved
        </span>
        {filtered && (
          <button
            onClick={() => { setQuery(""); setDifficulty("All"); setStatus("All"); setTag(null); }}
            style={{ border: "none", background: "none", color: C.blue, fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: FB }}
          >
            Clear filters
          </button>
        )}
      </div>

      {list.length === 0 ? (
        <Card style={{ padding: 40, textAlign: "center" }}>
          <div style={{ fontFamily: FD, fontWeight: 600, fontSize: 17 }}>No problems match those filters</div>
          <p style={{ color: C.inkMute, fontSize: 14.5, marginTop: 6 }}>Try a different topic, or clear the filters to see all {PRACTICE_PROBLEMS.length}.</p>
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

function FilterChip({
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
        border: `1.5px solid ${active ? color : C.line}`, background: active ? `${color}12` : "#fff",
        color: active ? color : C.inkSoft, borderRadius: 999, padding: "7px 15px", cursor: "pointer",
        fontFamily: FB, fontWeight: 600, fontSize: 13.5,
      }}
    >
      {children}
    </button>
  );
}

function ProblemRow({
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
        width: "100%", textAlign: "left", cursor: "pointer", border: "none", background: "#fff",
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
            <Pill key={c} color={C.blue} bg="rgba(47,91,240,.07)">
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

function ProblemView({ problem, onBack }: { problem: PracticeProblem; onBack: () => void }) {
  const { isSolved, markSolved } = useSolved();
  const solved = isSolved(problem.exercise.id);

  return (
    <div>
      <button
        onClick={onBack}
        style={{ border: "none", background: "none", color: C.inkSoft, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: FB, fontSize: 14, fontWeight: 600, padding: 0 }}
      >
        <ChevronLeft size={17} /> All problems
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "12px 0 18px", flexWrap: "wrap" }}>
        <H2 style={{ fontSize: 24, margin: 0 }}>{problem.exercise.title}</H2>
        <Pill color={DIFF_COLOR[problem.exercise.difficulty]} bg={`${DIFF_COLOR[problem.exercise.difficulty]}18`}>
          {problem.exercise.difficulty}
        </Pill>
        {problem.companies.map((c) => (
          <Pill key={c} color={C.blue} bg="rgba(47,91,240,.07)">
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

/* ---------------- SQL console ---------------- */

const SQL_SAMPLE = `SELECT branch, COUNT(*) AS students, ROUND(AVG(score), 1) AS avg_score
FROM students
WHERE active = 1
GROUP BY branch
ORDER BY avg_score DESC;`;

const SQL_ROWS: (string | number)[][] = [
  ["CSE", 124, 812.4],
  ["IT", 98, 786.1],
  ["ECE", 86, 741.9],
  ["EEE", 72, 705.3],
];

function SqlConsole() {
  const [sql, setSql] = useState(SQL_SAMPLE);
  const [state, setState] = useState<"idle" | "running" | "done">("idle");

  function run() {
    setState("running");
    window.setTimeout(() => setState("done"), 500);
  }

  return (
    <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 14 }}>
      <Card style={{ padding: 14, display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ fontFamily: FD, fontWeight: 600, fontSize: 15 }}>Practice database</div>
          <div style={{ color: C.inkMute, fontSize: 13.5, marginTop: 3 }}>
            Read-only copy of the college dataset. Nothing you run here affects real records.
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Pill color={C.royal} bg="rgba(47,91,240,.08)">students (380 rows)</Pill>
          <Pill color={C.royal} bg="rgba(47,91,240,.08)">courses (24 rows)</Pill>
          <Pill color={C.royal} bg="rgba(47,91,240,.08)">enrolment (1 204 rows)</Pill>
        </div>
      </Card>

      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ background: EDITOR.chrome, padding: "11px 15px", fontFamily: FM, fontSize: 12.5, color: EDITOR.dim, display: "flex", alignItems: "center", gap: 8 }}>
          <Database size={14} color={C.sky} /> query.sql
        </div>
        <CodeEditor value={sql} onChange={setSql} language="sql" minHeight={170} onRun={run} />
        <div style={{ background: EDITOR.bar, padding: 12, display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={run}
            disabled={state === "running"}
            style={{ background: goldGrad, color: "#3A2A00", border: "none", borderRadius: 9, padding: "9px 16px", fontFamily: FB, fontWeight: 600, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 7 }}
          >
            <Play size={15} /> {state === "running" ? "Running…" : "Run query"}
          </button>
          <span style={{ marginLeft: "auto", fontFamily: FM, fontSize: 11.5, color: EDITOR.dim }}>⌘/Ctrl + ↵ to run</span>
        </div>
      </Card>

      {state === "done" && (
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "10px 16px", fontFamily: FM, fontSize: 12, color: C.inkMute, borderBottom: `1px solid ${C.line}` }}>
            {SQL_ROWS.length} rows · 11 ms
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ background: C.cream }}>
                  {["branch", "students", "avg_score"].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "10px 16px", fontFamily: FM, fontSize: 12, color: C.inkSoft, fontWeight: 500 }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SQL_ROWS.map((row, i) => (
                  <tr key={i} style={{ borderTop: `1px solid ${C.line}` }}>
                    {row.map((cell, k) => (
                      <td key={k} style={{ padding: "10px 16px", fontFamily: typeof cell === "number" ? FM : FB }}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

/* ---------------- playground ---------------- */

const PLAYGROUND_SAMPLE = `print("Hello from AlgoSpark!")
for i in range(3):
    print("spark", i)`;

function Playground() {
  const [code, setCode] = useState(PLAYGROUND_SAMPLE);
  const [out, setOut] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  function run() {
    setRunning(true);
    window.setTimeout(() => {
      setRunning(false);
      // The demo interpreter echoes print() lines; the real playground streams
      // stdout from the same judge the graded exercises use.
      const printed = code
        .split("\n")
        .map((line) => line.match(/print\((.*)\)\s*$/))
        .filter(Boolean)
        .map((m) => (m as RegExpMatchArray)[1].replace(/["']/g, "").replace(/,\s*/g, " "))
        .join("\n");
      setOut(printed || "(no output)");
    }, 450);
  }

  return (
    <div style={{ marginTop: 18 }}>
      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ background: EDITOR.chrome, padding: "11px 15px", fontFamily: FM, fontSize: 12.5, color: EDITOR.dim, display: "flex", alignItems: "center", gap: 8 }}>
          <Terminal size={14} color={C.sky} /> playground.py — experiment freely, nothing is graded
        </div>
        <CodeEditor value={code} onChange={setCode} language="python" minHeight={200} onRun={run} />
        <div style={{ background: EDITOR.bar, padding: 12, display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={run}
            style={{ background: goldGrad, color: "#3A2A00", border: "none", borderRadius: 9, padding: "9px 16px", fontFamily: FB, fontWeight: 600, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 7 }}
          >
            <Play size={15} /> {running ? "Running…" : "Run"}
          </button>
          {out !== null && (
            <button
              onClick={() => setOut(null)}
              style={{ background: "transparent", border: "1px solid rgba(255,255,255,.14)", color: EDITOR.dim, borderRadius: 9, padding: "8px 13px", fontFamily: FB, fontSize: 13, cursor: "pointer" }}
            >
              Clear output
            </button>
          )}
          <span style={{ marginLeft: "auto", fontFamily: FM, fontSize: 11.5, color: EDITOR.dim }}>⌘/Ctrl + ↵ to run</span>
        </div>
        {out !== null && (
          <pre style={{ margin: 0, background: EDITOR.console, color: EDITOR.ok, fontFamily: FM, fontSize: 13, padding: 16, whiteSpace: "pre-wrap" }}>{out}</pre>
        )}
      </Card>
    </div>
  );
}
