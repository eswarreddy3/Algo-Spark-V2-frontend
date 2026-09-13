"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2, ChevronDown, ChevronLeft, Clipboard, Database, Eye, EyeOff, Lightbulb, Loader2, Play, RotateCcw, Send,
  Table2, XCircle,
} from "lucide-react";
import { C, EDITOR, FB, FD, FM, blueGrad, goldGrad, tint } from "../../theme";
import { Card, Pill } from "../../ui";
import { CodeEditor } from "../../labs/CodeEditor";
import { runCode, type RunResult } from "../../labs/runner";
import { DIFF_COLOR, type SqlColumn } from "../../labs/types";
import { PRACTICE_SCHEMA } from "../../data/sqlSchema";
import type { SqlProblem } from "../../data/sqlProblems";
import { useSolved } from "../../data/solved";
import { ColumnRow, SchemaDock, tablesIn } from "./schemaParts";

const draftKey = (id: string) => `algospark.draft.${id}.sql`;

/** One SQL problem: the question and expected output, the editor and your output, and the schema docked on the right. */
export function SqlSolve({ problem, onBack }: { problem: SqlProblem; onBack: () => void }) {
  const { isSolved, markSolved } = useSolved();
  const { exercise } = problem;
  const solved = isSolved(exercise.id);
  const starter = exercise.starter.sql ?? "";
  const tables = tablesIn(starter);

  const [source, setSourceState] = useState(starter);
  const [busy, setBusy] = useState<"run" | "submit" | null>(null);
  const [result, setResult] = useState<{ mode: "run" | "submit"; res: RunResult } | null>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(draftKey(exercise.id));
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrating from an external store
      if (saved) setSourceState(saved);
    } catch {
      /* starter is fine */
    }
  }, [exercise.id]);

  const setSource = useCallback(
    (next: string) => {
      setSourceState(next);
      try {
        window.localStorage.setItem(draftKey(exercise.id), next);
      } catch {
        /* draft won't survive a reload */
      }
    },
    [exercise.id],
  );

  const execute = useCallback(
    async (mode: "run" | "submit") => {
      if (busy) return;
      setBusy(mode);
      setResult(null);
      try {
        const res = await runCode({ exercise, language: "sql", source, mode });
        setResult({ mode, res });
        if (mode === "submit" && res.verdict === "accepted") markSolved(exercise.id);
      } catch {
        setResult({ mode, res: { verdict: "runtime-error", message: "Could not reach the query service. Try again.", stdout: "", results: [], passed: 0, total: 0, totalMs: 0 } });
      } finally {
        setBusy(null);
      }
    },
    [busy, exercise, source, markSolved],
  );

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
        <button onClick={onBack} style={{ border: "none", background: "none", color: C.inkSoft, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: FB, fontSize: 14, fontWeight: 600, padding: 0 }}>
          <ChevronLeft size={17} /> All SQL problems
        </button>
        <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, fontSize: 13.5, color: solved ? C.green : C.inkMute }}>
          {solved ? <><CheckCircle2 size={16} /> Solved</> : `${problem.acceptance}% acceptance`}
        </span>
      </div>

      <SchemaDock highlight={tables}>
        <div className="as-sql-solve">
          <QuestionPanel problem={problem} tables={tables} onUseSolution={() => setSource(problem.solution)} />

          <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
            <Card style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ background: EDITOR.chrome, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                <Database size={14} color={C.sky} />
                <span style={{ fontFamily: FM, fontSize: 12.5, color: EDITOR.dim }}>query.sql</span>
                <button
                  onClick={() => setSource(starter)}
                  title="Reset to starter query"
                  style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, background: "transparent", border: "1px solid rgba(255,255,255,.12)", color: EDITOR.dim, borderRadius: 8, padding: "5px 10px", fontFamily: FB, fontSize: 12.5, cursor: "pointer" }}
                >
                  <RotateCcw size={13} /> Reset
                </button>
              </div>
              <CodeEditor value={source} onChange={setSource} language="sql" minHeight={260} onRun={() => execute("run")} />
              <div style={{ background: EDITOR.bar, padding: 12, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <button onClick={() => execute("run")} disabled={busy !== null} style={{ ...runButton, background: goldGrad, color: "#3A2A00", opacity: busy === "submit" ? 0.6 : 1 }}>
                  {busy === "run" ? <Loader2 size={15} className="as-spin" /> : <Play size={15} />} {busy === "run" ? "Running…" : "Run"}
                </button>
                <button onClick={() => execute("submit")} disabled={busy !== null} style={{ ...runButton, background: blueGrad, color: "#fff", opacity: busy === "run" ? 0.6 : 1 }}>
                  {busy === "submit" ? <Loader2 size={15} className="as-spin" /> : <Send size={14} />} {busy === "submit" ? "Checking…" : "Submit"}
                </button>
                <span style={{ marginLeft: "auto", fontFamily: FM, fontSize: 11.5, color: EDITOR.dim }}>⌘/Ctrl + ↵ to run</span>
              </div>
            </Card>

            <OutputCard busy={busy} result={result} columns={exercise.resultColumns ?? []} />
          </div>
        </div>
      </SchemaDock>
    </div>
  );
}

const runButton: React.CSSProperties = {
  border: "none", borderRadius: 9, padding: "9px 16px", fontFamily: FB, fontWeight: 600, fontSize: 14, cursor: "pointer",
  display: "flex", alignItems: "center", gap: 7,
};

/* ---------------- question ---------------- */

function QuestionPanel({ problem, tables, onUseSolution }: { problem: SqlProblem; tables: string[]; onUseSolution: () => void }) {
  const { exercise, hints } = problem;
  const [shown, setShown] = useState(0);
  const [solution, setSolution] = useState(false);
  const [openTable, setOpenTable] = useState<string | null>(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
      <Card style={{ padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <Pill color={DIFF_COLOR[exercise.difficulty]} bg={tint(DIFF_COLOR[exercise.difficulty], 12)}>{exercise.difficulty}</Pill>
          <Pill color={C.goldDeep} bg={C.warnBg}>{exercise.points} pts</Pill>
          {problem.tags.map((t) => (
            <Pill key={t}>{t}</Pill>
          ))}
        </div>
        <div style={{ fontFamily: FD, fontWeight: 700, fontSize: 18, marginTop: 10 }}>{exercise.title}</div>
        <div style={{ marginTop: 10, background: C.cream, border: `1px solid ${C.line}`, borderRadius: 10, padding: "12px 14px" }}>
          {exercise.statement.map((para, i) => (
            <p key={i} style={{ margin: i ? "10px 0 0" : 0, color: C.inkSoft, fontSize: 14.5, lineHeight: 1.65 }}>
              <Prose text={para} />
            </p>
          ))}
        </div>
        {exercise.constraints.length > 0 && (
          <ul style={{ margin: "10px 0 0", paddingLeft: 18, color: C.inkMute, fontSize: 13, lineHeight: 1.65 }}>
            {exercise.constraints.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        )}
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <button
          onClick={() => setShown((n) => Math.min(hints.length, n + 1))}
          disabled={shown >= hints.length}
          style={{ ...panelButton, cursor: shown >= hints.length ? "not-allowed" : "pointer", opacity: shown >= hints.length ? 0.6 : 1 }}
        >
          <Lightbulb size={15} color={C.goldDeep} /> {shown >= hints.length ? "No more hints" : `Get Hint${hints.length ? ` · ${shown}/${hints.length} shown` : ""}`}
        </button>
        <button onClick={() => setSolution((v) => !v)} style={{ ...panelButton, cursor: "pointer" }}>
          {solution ? <EyeOff size={15} /> : <Eye size={15} />} {solution ? "Hide Solution" : "View Solution"}
        </button>
      </div>

      {solution && (
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderBottom: `1px solid ${C.line}` }}>
            <span style={{ fontFamily: FD, fontWeight: 600, fontSize: 14 }}>Reference solution</span>
            <button onClick={onUseSolution} style={{ marginLeft: "auto", border: `1px solid ${C.line}`, background: C.white, color: C.inkSoft, borderRadius: 8, padding: "5px 10px", fontFamily: FB, fontWeight: 600, fontSize: 12.5, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              <Clipboard size={13} /> Copy to editor
            </button>
          </div>
          <pre style={{ margin: 0, background: EDITOR.surface, color: EDITOR.text, fontFamily: FM, fontSize: 12.5, lineHeight: 1.7, padding: 14, overflowX: "auto" }}>{problem.solution}</pre>
          <div style={{ padding: "8px 14px", fontSize: 12.5, color: C.inkMute }}>Try it yourself first — solutions you copy still need to be run and submitted.</div>
        </Card>
      )}

      <Card style={{ padding: 0, overflow: "hidden" }}>
        <SectionTitle>Table Info</SectionTitle>
        {(tables.length ? tables : PRACTICE_SCHEMA.map((t) => t.name)).map((name) => {
          const table = PRACTICE_SCHEMA.find((t) => t.name === name);
          if (!table) return null;
          const open = openTable === name;
          return (
            <div key={name} style={{ borderTop: `1px solid ${C.line}` }}>
              <button
                onClick={() => setOpenTable(open ? null : name)}
                aria-expanded={open}
                style={{ width: "100%", border: "none", background: open ? C.hover : C.white, cursor: "pointer", padding: "10px 14px", display: "flex", alignItems: "center", gap: 8, textAlign: "left" }}
              >
                <Table2 size={14} color={C.royal} />
                <span style={{ fontFamily: FM, fontWeight: 600, fontSize: 13, color: C.ink }}>{name}</span>
                <span style={{ marginLeft: "auto", fontFamily: FM, fontSize: 11, color: C.inkMute }}>{table.columns.length} columns</span>
                <ChevronDown size={14} color={C.inkMute} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .15s" }} />
              </button>
              {open && (
                <div style={{ padding: "2px 8px 8px 16px" }}>
                  {table.columns.map((c) => (
                    <ColumnRow key={c.name} column={c} compact />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </Card>

      <Card style={{ padding: 0, overflow: "hidden" }}>
        <SectionTitle>Hints</SectionTitle>
        {shown > 0 && (
          <ol style={{ margin: 0, padding: "10px 14px 10px 32px", borderTop: `1px solid ${C.line}`, color: C.inkSoft, fontSize: 13.5, lineHeight: 1.6 }}>
            {hints.slice(0, shown).map((h) => (
              <li key={h} style={{ marginBottom: 4 }}><Prose text={h} /></li>
            ))}
          </ol>
        )}
        <div style={{ borderTop: `1px solid ${C.line}`, padding: "9px 14px", textAlign: "center", fontFamily: FD, fontWeight: 600, fontSize: 14, color: C.inkSoft, background: C.cream }}>
          Expected Output
        </div>
        <DataTable columns={exercise.resultColumns ?? []} rows={exercise.resultRows ?? []} pageSize={10} />
      </Card>
    </div>
  );
}

const panelButton: React.CSSProperties = {
  border: `1px solid ${C.line}`, background: C.white, color: C.inkSoft, borderRadius: 10, padding: "11px 12px",
  fontFamily: FB, fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div style={{ padding: "10px 14px", textAlign: "center", fontFamily: FD, fontWeight: 500, fontSize: 19, color: C.inkSoft }}>{children}</div>;
}

/* ---------------- output ---------------- */

function OutputCard({ busy, result, columns }: { busy: "run" | "submit" | null; result: { mode: "run" | "submit"; res: RunResult } | null; columns: SqlColumn[] }) {
  const res = result?.res;
  const accepted = res?.verdict === "accepted";
  const failed = res && !accepted;

  return (
    <Card style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 16px", borderBottom: `1px solid ${C.line}` }}>
        <span style={{ fontFamily: FD, fontWeight: 600, fontSize: 15 }}>Your output</span>
        {res && res.totalMs > 0 && <span style={{ fontFamily: FM, fontSize: 12, color: C.inkMute }}>{res.totalMs} ms</span>}
        {res && res.total > 0 && (
          <span style={{ marginLeft: "auto", fontFamily: FM, fontSize: 12, fontWeight: 600, color: accepted ? C.green : C.red }}>
            {res.passed}/{res.total} checks passed
          </span>
        )}
      </div>

      {busy && (
        <div style={{ padding: 20, display: "flex", alignItems: "center", gap: 10, color: C.inkMute, fontSize: 14 }}>
          <Loader2 size={16} className="as-spin" /> {busy === "submit" ? "Checking against every test…" : "Running your query…"}
        </div>
      )}

      {!busy && !res && (
        <div style={{ padding: 20, color: C.inkMute, fontSize: 14 }}>
          Run your query to see its output here and compare it with the expected output. Submit checks the hidden cases too.
        </div>
      )}

      {!busy && res && (res.verdict === "compile-error" || res.verdict === "runtime-error") && (
        <pre style={{ margin: 0, background: EDITOR.console, color: EDITOR.bad, fontFamily: FM, fontSize: 12.5, lineHeight: 1.7, padding: 16, whiteSpace: "pre-wrap" }}>
          {res.message}
        </pre>
      )}

      {!busy && res && accepted && (
        <>
          <div style={{ background: C.greenBg, color: C.green, padding: "11px 16px", display: "flex", alignItems: "center", gap: 9, fontWeight: 600, fontSize: 14 }}>
            <CheckCircle2 size={17} /> {result?.mode === "submit" ? "Correct — solution recorded." : "Your output matches the expected output. Submit to record it."}
          </div>
          {res.table && <DataTable columns={res.table.columns.length ? res.table.columns : columns} rows={res.table.rows} pageSize={10} />}
        </>
      )}

      {!busy && failed && res.verdict === "wrong-answer" && (
        <>
          <div style={{ background: C.redBg, color: C.red, padding: "11px 16px", display: "flex", alignItems: "center", gap: 9, fontWeight: 600, fontSize: 14 }}>
            <XCircle size={17} /> Output does not match the expected output yet.
          </div>
          {res.results.map((t) => (
            <div key={t.id} style={{ borderTop: `1px solid ${C.line}`, padding: "10px 16px", display: "grid", gridTemplateColumns: "20px 1fr", gap: 10, fontSize: 13.5 }}>
              {t.status === "passed" ? <CheckCircle2 size={16} color={C.green} /> : <XCircle size={16} color={C.red} />}
              <div>
                <div style={{ fontWeight: 600, color: C.ink }}>{t.name}{t.hidden ? " · hidden" : ""}</div>
                {t.status !== "passed" && (
                  <div style={{ fontFamily: FM, fontSize: 12, color: C.inkMute, marginTop: 3 }}>
                    expected {t.expected} · got {t.received || "no rows"}
                  </div>
                )}
              </div>
            </div>
          ))}
        </>
      )}
    </Card>
  );
}

/* ---------------- paged result grid ---------------- */

export function DataTable({ columns, rows, pageSize = 10 }: { columns: SqlColumn[]; rows: (string | number | null)[][]; pageSize?: number }) {
  const [page, setPage] = useState(1);
  const pages = Math.max(1, Math.ceil(rows.length / pageSize));
  const current = Math.min(page, pages);
  const start = (current - 1) * pageSize;
  const slice = rows.slice(start, start + pageSize);

  if (!rows.length) return <div style={{ padding: 16, color: C.inkMute, fontSize: 13.5, textAlign: "center" }}>No rows.</div>;

  return (
    <div>
      <div style={{ overflow: "auto", maxHeight: 360 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
          <thead style={{ position: "sticky", top: 0 }}>
            <tr style={{ background: C.cream }}>
              {columns.map((col) => (
                <th key={col.key} style={{ textAlign: "left", padding: "8px 12px", fontFamily: FM, fontSize: 12, color: C.inkSoft, fontWeight: 600, borderBottom: `1px solid ${C.line}`, whiteSpace: "nowrap" }}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slice.map((row, r) => (
              <tr key={start + r} style={{ borderTop: r ? `1px solid ${C.line}` : "none" }}>
                {row.map((cell, k) => (
                  <td key={k} style={{ padding: "8px 12px", fontFamily: typeof cell === "number" ? FM : FB, color: cell === null ? C.inkMute : C.ink, whiteSpace: "nowrap" }}>
                    {cell === null ? "NULL" : cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ borderTop: `1px solid ${C.line}`, padding: "10px 12px", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
        <span style={{ fontSize: 13.5, color: C.inkSoft }}>
          Showing <strong>{start + 1}</strong> to <strong>{Math.min(start + pageSize, rows.length)}</strong> of <strong>{rows.length}</strong> results
        </span>
        {pages > 1 && (
          <span style={{ display: "flex", border: `1px solid ${C.line}`, borderRadius: 8, overflow: "hidden" }}>
            <PageButton first disabled={current === 1} onClick={() => setPage(current - 1)}>Previous</PageButton>
            {pageList(current, pages).map((n, i) =>
              n === "…" ? (
                <span key={`gap-${i}`} style={{ padding: "5px 10px", fontSize: 13, color: C.inkMute, borderLeft: `1px solid ${C.line}` }}>…</span>
              ) : (
                <PageButton key={n} active={n === current} onClick={() => setPage(n)}>{n}</PageButton>
              ),
            )}
            <PageButton disabled={current === pages} onClick={() => setPage(current + 1)}>Next</PageButton>
          </span>
        )}
      </div>
    </div>
  );
}

/** 1 2 3 … 25 style page list around the current page. */
function pageList(current: number, pages: number): (number | "…")[] {
  if (pages <= 5) return Array.from({ length: pages }, (_, i) => i + 1);
  const set = new Set([1, pages, current - 1, current, current + 1].filter((n) => n >= 1 && n <= pages));
  const sorted = [...set].sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  sorted.forEach((n, i) => {
    if (i && n - sorted[i - 1] > 1) out.push("…");
    out.push(n);
  });
  return out;
}

function PageButton({ children, onClick, disabled, active, first }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; active?: boolean; first?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-current={active ? "page" : undefined}
      style={{
        border: "none", borderLeft: first ? "none" : `1px solid ${C.line}`, padding: "5px 11px", fontFamily: FB, fontSize: 13, fontWeight: active ? 700 : 500,
        background: active ? C.cream : C.white, color: disabled ? C.inkMute : C.ink, cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {children}
    </button>
  );
}

/** Renders `identifiers` as inline code. */
function Prose({ text }: { text: string }) {
  const parts = text.split(/`([^`]+)`/g);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <code key={i} style={{ fontFamily: FM, fontSize: 12.5, background: C.white, border: `1px solid ${C.line}`, padding: "0 5px", borderRadius: 5, color: C.ink }}>{part}</code>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        ),
      )}
    </>
  );
}
