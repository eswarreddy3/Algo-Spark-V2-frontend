"use client";

import React, { useMemo, useState } from "react";
import { Database, Eye, EyeOff, ListChecks, Network, Play, Table2, Terminal } from "lucide-react";
import { C, EDITOR, FB, FD, FM, goldGrad, tint } from "../theme";
import { Card, H2, ProgressBar } from "../ui";
import { CodeEditor } from "../labs/CodeEditor";
import { DIFF_COLOR, type Difficulty } from "../labs/types";
import { PRACTICE_SCHEMA, type SqlTable } from "../data/sqlSchema";
import { SQL_PROBLEMS, getSqlProblem } from "../data/sqlProblems";
import { useSolved } from "../data/solved";
import { useNav, type SqlRoute } from "../nav";
import { FilterChip, ProblemRow, SearchField } from "./CodingProblems";
import { ErDiagram } from "./sql/ErDiagram";
import { ColumnRow, SampleTable, SchemaDock } from "./sql/schemaParts";
import { SqlSolve } from "./sql/SqlSolve";

const SQL_TABS = [
  { id: "problems", label: "Problems", icon: ListChecks },
  { id: "schema", label: "Schema", icon: Network },
  { id: "playground", label: "Playground", icon: Terminal },
] as const;

/** SQL compiler: Problems, Schema (ER diagram + tables) and a free-query Playground, as tabs. */
export function SqlSection() {
  const { techRoute, setTechRoute } = useNav();
  const route = techRoute.sql;
  const setRoute = (sql: SqlRoute) => {
    setTechRoute({ ...techRoute, sql });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const problem = route.problemId ? getSqlProblem(route.problemId) : undefined;

  if (problem) return <SqlSolve problem={problem} onBack={() => setRoute({ view: "problems", problemId: null })} />;

  return (
    <div>
      <div style={{ display: "flex", gap: 6, borderBottom: `1px solid ${C.line}`, flexWrap: "wrap", marginBottom: 18 }}>
        {SQL_TABS.map((t) => {
          const active = route.view === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setRoute({ view: t.id, problemId: null })}
              aria-current={active ? "page" : undefined}
              style={{
                border: "none", background: "none", cursor: "pointer", padding: "11px 14px", display: "flex", alignItems: "center", gap: 8,
                fontFamily: FB, fontWeight: 600, fontSize: 14.5, color: active ? C.royal : C.inkMute,
                borderBottom: `2.5px solid ${active ? C.royal : "transparent"}`, marginBottom: -1,
              }}
            >
              <t.icon size={17} /> {t.label}
            </button>
          );
        })}
      </div>

      {route.view === "problems" && <SqlProblemList onOpen={(id) => setRoute({ view: "problems", problemId: id })} />}
      {route.view === "schema" && <SchemaExplorer />}
      {route.view === "playground" && <SqlPlayground />}
    </div>
  );
}

/* ---------------- schema (full page) ---------------- */

const totalRows = PRACTICE_SCHEMA.reduce((n, t) => n + t.rowCount, 0);

function SchemaExplorer() {
  return (
    <section>
      <Card style={{ padding: 18, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <span style={{ width: 44, height: 44, flex: "none", borderRadius: 12, background: tint(C.cyan, 14), color: C.cyan, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Database size={22} />
        </span>
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ fontFamily: FD, fontWeight: 600, fontSize: 17 }}>Practice database</div>
          <div style={{ color: C.inkMute, fontSize: 13.5, marginTop: 2 }}>
            SQLite · read-only · {PRACTICE_SCHEMA.length} tables · {totalRows.toLocaleString()} rows. Every SQL problem and the playground run against this schema.
          </div>
        </div>
      </Card>

      <div style={{ marginTop: 14 }}>
        <ErDiagram />
      </div>

      <H2 style={{ fontSize: 19, margin: "22px 0 0" }}>Tables</H2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 14, marginTop: 12 }}>
        {PRACTICE_SCHEMA.map((t) => (
          <TableCard key={t.name} table={t} />
        ))}
      </div>
    </section>
  );
}

function TableCard({ table }: { table: SqlTable }) {
  const [preview, setPreview] = useState(false);
  return (
    <Card style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "13px 16px", borderBottom: `1px solid ${C.line}`, display: "flex", alignItems: "center", gap: 9, background: C.cream }}>
        <Table2 size={16} color={C.royal} />
        <span style={{ fontFamily: FM, fontWeight: 600, fontSize: 14 }}>{table.name}</span>
        <span style={{ marginLeft: "auto", fontFamily: FM, fontSize: 11.5, color: C.inkMute }}>{table.rowCount.toLocaleString()} rows</span>
      </div>
      <div style={{ padding: "8px 16px 4px", color: C.inkMute, fontSize: 12.5 }}>{table.description}</div>
      <div style={{ padding: "4px 8px 8px", flex: 1 }}>
        {table.columns.map((col) => (
          <ColumnRow key={col.name} column={col} />
        ))}
      </div>
      <button
        onClick={() => setPreview((v) => !v)}
        style={{ border: "none", borderTop: `1px solid ${C.line}`, background: C.white, padding: "10px 16px", cursor: "pointer", fontFamily: FB, fontWeight: 600, fontSize: 13, color: C.blue, display: "flex", alignItems: "center", gap: 7 }}
      >
        {preview ? <EyeOff size={14} /> : <Eye size={14} />} {preview ? "Hide sample rows" : "Preview rows"}
      </button>
      {preview && <SampleTable table={table} />}
    </Card>
  );
}

/* ---------------- problem list ---------------- */

const STATUSES = ["All", "Unsolved", "Solved"] as const;
const DIFFICULTIES: (Difficulty | "All")[] = ["All", "Easy", "Medium", "Hard"];

function SqlProblemList({ onOpen }: { onOpen: (id: string) => void }) {
  const { isSolved } = useSolved();
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty | "All">("All");
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("All");
  const [topic, setTopic] = useState<string | null>(null);

  const topics = useMemo(() => [...new Set(SQL_PROBLEMS.flatMap((p) => p.tags))].sort(), []);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SQL_PROBLEMS.filter((p) => {
      if (difficulty !== "All" && p.exercise.difficulty !== difficulty) return false;
      if (status === "Solved" && !isSolved(p.exercise.id)) return false;
      if (status === "Unsolved" && isSolved(p.exercise.id)) return false;
      if (topic && !p.tags.includes(topic)) return false;
      return !q || p.exercise.title.toLowerCase().includes(q) || p.tags.some((t) => t.toLowerCase().includes(q)) || p.companies.some((c) => c.toLowerCase().includes(q));
    });
  }, [query, difficulty, status, topic, isSolved]);

  const solvedCount = SQL_PROBLEMS.filter((p) => isSolved(p.exercise.id)).length;
  const filtered = query || difficulty !== "All" || status !== "All" || topic;

  return (
    <section>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
        <H2 style={{ fontSize: 21, margin: 0 }}>SQL problems</H2>
        <span style={{ fontFamily: FM, fontSize: 12.5, color: C.inkMute }}>{solvedCount}/{SQL_PROBLEMS.length} solved</span>
        <span style={{ width: 160 }}><ProgressBar value={(solvedCount / SQL_PROBLEMS.length) * 100} color={C.green} height={6} /></span>
      </div>

      <Card style={{ padding: 16, marginTop: 12 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <SearchField value={query} onChange={setQuery} placeholder="Search by title, concept or company" />
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {DIFFICULTIES.map((d) => (
              <FilterChip key={d} active={difficulty === d} onClick={() => setDifficulty(d)} color={d === "All" ? C.royal : DIFF_COLOR[d]}>{d}</FilterChip>
            ))}
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {STATUSES.map((s) => (
              <FilterChip key={s} active={status === s} onClick={() => setStatus(s)} color={C.royal}>{s}</FilterChip>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontFamily: FM, fontSize: 11.5, color: C.inkMute, marginRight: 4 }}>CONCEPT</span>
          {topics.map((t) => (
            <button
              key={t}
              onClick={() => setTopic(topic === t ? null : t)}
              aria-pressed={topic === t}
              style={{ border: `1px solid ${topic === t ? C.royal : C.line}`, background: topic === t ? tint(C.royal, 9) : C.white, color: topic === t ? C.royal : C.inkSoft, borderRadius: 999, padding: "4px 11px", cursor: "pointer", fontFamily: FM, fontSize: 11.5 }}
            >
              {t}
            </button>
          ))}
          {filtered && (
            <button
              onClick={() => { setQuery(""); setDifficulty("All"); setStatus("All"); setTopic(null); }}
              style={{ marginLeft: "auto", border: "none", background: "none", color: C.blue, fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: FB }}
            >
              Clear filters
            </button>
          )}
        </div>
      </Card>

      <div style={{ margin: "12px 2px 10px", fontSize: 13.5, color: C.inkMute }}>
        {list.length} problem{list.length === 1 ? "" : "s"}{filtered ? " match your filters" : ""}
      </div>

      {list.length === 0 ? (
        <Card style={{ padding: 40, textAlign: "center" }}>
          <div style={{ fontFamily: FD, fontWeight: 600, fontSize: 17 }}>No problems match those filters</div>
        </Card>
      ) : (
        <Card style={{ padding: 0, overflow: "hidden" }}>
          {list.map((p, i) => (
            <ProblemRow key={p.exercise.id} problem={p} first={i === 0} solved={isSolved(p.exercise.id)} onOpen={() => onOpen(p.exercise.id)} />
          ))}
        </Card>
      )}
    </section>
  );
}

/* ---------------- playground ---------------- */

const SQL_SAMPLE = `SELECT d.code, COUNT(*) AS students, ROUND(AVG(s.score), 1) AS avg_score
FROM students s
JOIN departments d ON d.id = s.dept_id
WHERE s.active = 1
GROUP BY d.code
ORDER BY avg_score DESC;`;

const SQL_ROWS: (string | number)[][] = [
  ["CSE", 124, 812.4],
  ["IT", 98, 786.1],
  ["ECE", 86, 741.9],
  ["EEE", 72, 705.3],
];

function SqlPlayground() {
  const [sql, setSql] = useState(SQL_SAMPLE);
  const [state, setState] = useState<"idle" | "running" | "done">("idle");

  function run() {
    setState("running");
    window.setTimeout(() => setState("done"), 500);
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, margin: "0 0 16px", flexWrap: "wrap" }}>
        <H2 style={{ fontSize: 22, margin: 0 }}>SQL playground</H2>
        <span style={{ color: C.inkMute, fontSize: 14 }}>Free queries against the practice database — nothing is graded.</span>
      </div>

      <SchemaDock highlight={[]}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Card style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ background: EDITOR.chrome, padding: "11px 15px", fontFamily: FM, fontSize: 12.5, color: EDITOR.dim, display: "flex", alignItems: "center", gap: 8 }}>
              <Database size={14} color={C.sky} /> query.sql
            </div>
            <CodeEditor value={sql} onChange={setSql} language="sql" minHeight={220} onRun={run} />
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

          <Card style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "10px 16px", fontFamily: FM, fontSize: 12, color: C.inkMute, borderBottom: `1px solid ${C.line}` }}>
              {state === "done" ? `${SQL_ROWS.length} rows · 11 ms` : state === "running" ? "Running…" : "Run a query to see results here"}
            </div>
            {state === "done" && (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                  <thead>
                    <tr style={{ background: C.cream }}>
                      {["code", "students", "avg_score"].map((h) => (
                        <th key={h} style={{ textAlign: "left", padding: "10px 16px", fontFamily: FM, fontSize: 12, color: C.inkSoft, fontWeight: 500 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {SQL_ROWS.map((row, i) => (
                      <tr key={i} style={{ borderTop: `1px solid ${C.line}` }}>
                        {row.map((cell, k) => (
                          <td key={k} style={{ padding: "10px 16px", fontFamily: typeof cell === "number" ? FM : FB }}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </SchemaDock>
    </div>
  );
}
