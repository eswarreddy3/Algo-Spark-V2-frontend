"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, ChevronDown, Circle, Clock, Loader2, Play, RotateCcw, Send, XCircle } from "lucide-react";
import { C, EDITOR, FB, FD, FM, blueGrad, goldGrad, tint } from "../theme";
import { Card, Pill } from "../ui";
import { CodeEditor } from "./CodeEditor";
import { runCode, type RunResult, type TestResult } from "./runner";
import { DIFF_COLOR, LANGUAGE_LABEL, type Exercise, type Language } from "./types";

const FILE_NAME: Record<Language, string> = {
  python: "solution.py",
  cpp: "solution.cpp",
  java: "Solution.java",
  sql: "query.sql",
};

const draftKey = (exerciseId: string, language: Language) => `algospark.draft.${exerciseId}.${language}`;

export function CodePanel({
  exercise,
  solved,
  onSolved,
}: {
  exercise: Exercise;
  solved: boolean;
  onSolved: () => void;
}) {
  const [language, setLanguage] = useState<Language>(exercise.languages[0]);
  const [sources, setSources] = useState<Partial<Record<Language, string>>>(() => ({ ...exercise.starter }));
  const [busy, setBusy] = useState<"run" | "submit" | null>(null);
  const [result, setResult] = useState<RunResult | null>(null);
  const [mode, setMode] = useState<"run" | "submit">("run");
  const [tab, setTab] = useState<"tests" | "console">("tests");
  const [openTest, setOpenTest] = useState<string | null>(null);

  // Restore any draft the student left behind for this exercise + language.
  // Reading browser storage has to happen after mount, or the server and client
  // renders disagree.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(draftKey(exercise.id, language));
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrating from an external store
      if (saved) setSources((prev) => ({ ...prev, [language]: saved }));
    } catch {
      /* storage unavailable — the starter code is a fine fallback */
    }
  }, [exercise.id, language]);

  const source = sources[language] ?? exercise.starter[language] ?? "";

  const setSource = useCallback(
    (next: string) => {
      setSources((prev) => ({ ...prev, [language]: next }));
      try {
        window.localStorage.setItem(draftKey(exercise.id, language), next);
      } catch {
        /* drafts simply won't survive a reload */
      }
    },
    [exercise.id, language],
  );

  const reset = useCallback(() => {
    const starter = exercise.starter[language] ?? "";
    setSources((prev) => ({ ...prev, [language]: starter }));
    try {
      window.localStorage.removeItem(draftKey(exercise.id, language));
    } catch {
      /* nothing to clean up */
    }
  }, [exercise.id, exercise.starter, language]);

  const execute = useCallback(
    async (which: "run" | "submit") => {
      if (busy) return;
      setBusy(which);
      setMode(which);
      setResult(null);
      setOpenTest(null);
      try {
        const res = await runCode({ exercise, language, source, mode: which });
        setResult(res);
        setTab(res.verdict === "compile-error" ? "console" : "tests");
        if (which === "submit" && res.verdict === "accepted") onSolved();
      } catch {
        setResult({
          verdict: "runtime-error",
          message: "Could not reach the execution service. Check your connection and try again.",
          stdout: "",
          results: [],
          passed: 0,
          total: 0,
          totalMs: 0,
        });
        setTab("console");
      } finally {
        setBusy(null);
      }
    },
    [busy, exercise, language, source, onSolved],
  );

  const sampleCount = useMemo(() => exercise.tests.filter((t) => !t.hidden).length, [exercise.tests]);
  const hiddenCount = exercise.tests.length - sampleCount;
  const accepted = result?.verdict === "accepted";

  return (
    <div className="as-code-split">
      {/* problem */}
      <Card style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div style={{ fontFamily: FD, fontWeight: 700, fontSize: 20 }}>{exercise.title}</div>
          <Pill color={DIFF_COLOR[exercise.difficulty]} bg={tint(DIFF_COLOR[exercise.difficulty], 10)}>
            {exercise.difficulty}
          </Pill>
          <Pill color={C.goldDeep} bg={C.warnBg}>{exercise.points} pts</Pill>
          {exercise.targetComplexity && <Pill>{exercise.targetComplexity}</Pill>}
        </div>

        {exercise.statement.map((para, i) => (
          <p key={i} style={{ color: C.inkSoft, fontSize: 14.5, lineHeight: 1.65, marginTop: 12 }}>
            <Prose text={para} />
          </p>
        ))}

        {exercise.examples.map((ex, i) => (
          <div key={i} style={{ background: C.cream, borderRadius: 12, padding: 14, marginTop: 14, fontFamily: FM, fontSize: 12.5, lineHeight: 1.7 }}>
            <div style={{ color: C.inkMute, letterSpacing: ".08em" }}>EXAMPLE {i + 1}</div>
            <div style={{ marginTop: 6 }}>Input: {ex.input}</div>
            <div>Output: {ex.output}</div>
            {ex.note && <div style={{ color: C.inkMute, marginTop: 6, fontFamily: FB, fontSize: 13 }}>{ex.note}</div>}
          </div>
        ))}

        <div style={{ marginTop: 16 }}>
          <div style={{ fontFamily: FM, fontSize: 11.5, letterSpacing: ".1em", color: C.inkMute }}>CONSTRAINTS</div>
          <ul style={{ margin: "8px 0 0", paddingLeft: 18, color: C.inkSoft, fontSize: 14, lineHeight: 1.7 }}>
            {exercise.constraints.map((con) => (
              <li key={con}>
                <Prose text={con} />
              </li>
            ))}
          </ul>
        </div>

        <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${C.line}`, display: "flex", gap: 18, fontSize: 13, color: C.inkMute }}>
          <span>{sampleCount} sample case{sampleCount === 1 ? "" : "s"}</span>
          {hiddenCount > 0 && <span>{hiddenCount} hidden on submit</span>}
        </div>
      </Card>

      {/* editor */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ background: EDITOR.chrome, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid rgba(255,255,255,.06)" }}>
            <span style={{ width: 11, height: 11, borderRadius: 999, background: "#FF5F57" }} />
            <span style={{ width: 11, height: 11, borderRadius: 999, background: "#FEBC2E" }} />
            <span style={{ width: 11, height: 11, borderRadius: 999, background: "#28C840" }} />
            <span style={{ fontFamily: FM, fontSize: 12.5, color: EDITOR.dim, marginLeft: 6 }}>{FILE_NAME[language]}</span>

            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
              <button
                onClick={reset}
                title="Reset to starter code"
                style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: "1px solid rgba(255,255,255,.12)", color: EDITOR.dim, borderRadius: 8, padding: "5px 10px", fontFamily: FB, fontSize: 12.5, cursor: "pointer" }}
              >
                <RotateCcw size={13} /> Reset
              </button>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  aria-label="Language"
                  style={{ appearance: "none", background: "rgba(77,163,245,.16)", color: C.skyLt, border: "none", borderRadius: 8, padding: "6px 26px 6px 10px", fontFamily: FM, fontSize: 11.5, cursor: "pointer" }}
                >
                  {exercise.languages.map((l) => (
                    <option key={l} value={l} style={{ color: C.ink }}>
                      {LANGUAGE_LABEL[l]}
                    </option>
                  ))}
                </select>
                <ChevronDown size={13} color={C.skyLt} style={{ position: "absolute", right: 8, pointerEvents: "none" }} />
              </div>
            </div>
          </div>

          <CodeEditor value={source} onChange={setSource} language={language} onRun={() => execute("run")} minHeight={330} />

          <div style={{ background: EDITOR.bar, padding: 12, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <button
              onClick={() => execute("run")}
              disabled={busy !== null}
              style={{ background: goldGrad, color: "#3A2A00", border: "none", borderRadius: 9, padding: "9px 16px", fontFamily: FB, fontWeight: 600, fontSize: 14, cursor: busy ? "wait" : "pointer", display: "flex", alignItems: "center", gap: 7, opacity: busy === "submit" ? 0.6 : 1 }}
            >
              {busy === "run" ? <Spinner /> : <Play size={15} />}
              {busy === "run" ? "Running…" : "Run"}
            </button>
            <button
              onClick={() => execute("submit")}
              disabled={busy !== null}
              style={{ background: blueGrad, color: "#fff", border: "none", borderRadius: 9, padding: "9px 16px", fontFamily: FB, fontWeight: 600, fontSize: 14, cursor: busy ? "wait" : "pointer", display: "flex", alignItems: "center", gap: 7, opacity: busy === "run" ? 0.6 : 1 }}
            >
              {busy === "submit" ? <Spinner /> : <Send size={14} />}
              {busy === "submit" ? "Judging…" : "Submit"}
            </button>

            {solved && (
              <span style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: FM, fontSize: 12.5, color: EDITOR.ok }}>
                <CheckCircle2 size={14} /> submitted
              </span>
            )}
            <span style={{ marginLeft: "auto", fontFamily: FM, fontSize: 11.5, color: EDITOR.dim }}>⌘/Ctrl + ↵ to run</span>
          </div>
        </Card>

        <ResultsPanel
          result={result}
          busy={busy !== null}
          mode={mode}
          tab={tab}
          setTab={setTab}
          openTest={openTest}
          setOpenTest={setOpenTest}
          accepted={accepted}
        />
      </div>
    </div>
  );
}

/** Renders `identifiers` in the problem text as inline code. */
function Prose({ text }: { text: string }) {
  const parts = text.split(/`([^`]+)`/g);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <code key={i} style={{ fontFamily: FM, fontSize: 12.5, background: C.cream, padding: "1px 6px", borderRadius: 5, color: C.ink }}>
            {part}
          </code>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        ),
      )}
    </>
  );
}

function Spinner() {
  return (
    <>
      <Loader2 size={15} style={{ animation: "algospark-spin 1s linear infinite" }} />
      <style>{"@keyframes algospark-spin{to{transform:rotate(360deg)}}"}</style>
    </>
  );
}

function ResultsPanel({
  result,
  busy,
  mode,
  tab,
  setTab,
  openTest,
  setOpenTest,
  accepted,
}: {
  result: RunResult | null;
  busy: boolean;
  mode: "run" | "submit";
  tab: "tests" | "console";
  setTab: (t: "tests" | "console") => void;
  openTest: string | null;
  setOpenTest: (id: string | null) => void;
  accepted: boolean;
}) {
  return (
    <Card style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 4, borderBottom: `1px solid ${C.line}`, padding: "0 8px" }}>
        {(["tests", "console"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{ border: "none", background: "none", cursor: "pointer", padding: "12px 12px", fontFamily: FB, fontWeight: 600, fontSize: 13.5, color: tab === t ? C.royal : C.inkMute, borderBottom: `2.5px solid ${tab === t ? C.royal : "transparent"}`, marginBottom: -1 }}
          >
            {t === "tests" ? "Test cases" : "Console"}
          </button>
        ))}
        {result && (
          <span style={{ marginLeft: "auto", marginRight: 8, display: "flex", alignItems: "center", gap: 10, fontFamily: FM, fontSize: 12 }}>
            <span style={{ color: accepted ? C.green : C.red, fontWeight: 600 }}>
              {result.verdict === "compile-error"
                ? "Compile error"
                : result.verdict === "runtime-error"
                  ? "Runtime error"
                  : `${result.passed}/${result.total} passed`}
            </span>
            {result.totalMs > 0 && <span style={{ color: C.inkMute }}>{result.totalMs} ms</span>}
          </span>
        )}
      </div>

      {busy && (
        <div style={{ padding: 20, display: "flex", alignItems: "center", gap: 10, color: C.inkMute, fontSize: 14 }}>
          <Clock size={16} /> {mode === "submit" ? "Judging against all test cases…" : "Running sample cases…"}
        </div>
      )}

      {!busy && !result && (
        <div style={{ padding: 20, color: C.inkMute, fontSize: 14 }}>
          Run your code to see the sample cases here. Submit also runs the hidden cases and records your attempt.
        </div>
      )}

      {!busy && result && tab === "tests" && (
        <div>
          {accepted && (
            <div style={{ background: C.greenBg, color: C.green, padding: "12px 16px", display: "flex", alignItems: "center", gap: 9, fontWeight: 600, fontSize: 14 }}>
              <CheckCircle2 size={17} />
              {mode === "submit" ? "Accepted — solution recorded." : "All sample cases passed. Submit to run the hidden cases."}
            </div>
          )}
          {result.results.length === 0 && (
            <div style={{ padding: 20, color: C.inkMute, fontSize: 14 }}>No cases ran. See the console for details.</div>
          )}
          {result.results.map((t, i) => (
            <TestRow key={t.id} test={t} first={i === 0} open={openTest === t.id} onToggle={() => setOpenTest(openTest === t.id ? null : t.id)} />
          ))}
          {result.table && (
            <div style={{ borderTop: `1px solid ${C.line}` }}>
              <div style={{ padding: "10px 16px", fontFamily: FM, fontSize: 11.5, color: C.inkMute }}>
                RESULT · {result.table.rows.length} rows
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
                  <thead>
                    <tr style={{ background: C.cream }}>
                      {result.table.columns.map((col) => (
                        <th key={col.key} style={{ textAlign: "left", padding: "9px 16px", fontFamily: FM, fontSize: 11.5, color: C.inkSoft, fontWeight: 500 }}>
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.table.rows.map((row, r) => (
                      <tr key={r} style={{ borderTop: `1px solid ${C.line}` }}>
                        {row.map((cell, c) => (
                          <td key={c} style={{ padding: "9px 16px", fontFamily: typeof cell === "number" ? FM : FB }}>
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {!busy && result && tab === "console" && (
        <pre style={{ margin: 0, background: EDITOR.console, color: result.message ? EDITOR.bad : EDITOR.ok, fontFamily: FM, fontSize: 12.5, lineHeight: 1.7, padding: 16, whiteSpace: "pre-wrap", minHeight: 120 }}>
          {result.message ?? result.stdout ?? ""}
        </pre>
      )}
    </Card>
  );
}

function TestRow({ test, first, open, onToggle }: { test: TestResult; first: boolean; open: boolean; onToggle: () => void }) {
  const color = test.status === "passed" ? C.green : test.status === "failed" ? C.red : C.inkMute;
  return (
    <div style={{ borderTop: first ? "none" : `1px solid ${C.line}` }}>
      <button
        onClick={onToggle}
        style={{ width: "100%", textAlign: "left", border: "none", background: C.white, padding: "12px 16px", display: "flex", alignItems: "center", gap: 11, cursor: "pointer" }}
      >
        {test.status === "passed" ? <CheckCircle2 size={17} color={color} /> : test.status === "failed" ? <XCircle size={17} color={color} /> : <Circle size={15} color={color} />}
        <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{test.name}</span>
        {test.hidden && <Pill>hidden</Pill>}
        <span style={{ fontFamily: FM, fontSize: 12, color: C.inkMute }}>{test.runtimeMs ? `${test.runtimeMs} ms` : "—"}</span>
        <ChevronDown size={16} color={C.inkMute} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .18s" }} />
      </button>
      {open && (
        <div style={{ padding: "0 16px 14px 44px", display: "grid", gap: 8, fontFamily: FM, fontSize: 12.5 }}>
          <Field label="Input" value={test.input} />
          <Field label="Expected" value={test.expected} />
          <Field label="Received" value={test.received || "(no output)"} color={test.status === "failed" ? C.red : undefined} />
        </div>
      )}
    </div>
  );
}

function Field({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "78px 1fr", gap: 10, alignItems: "start" }}>
      <span style={{ color: C.inkMute }}>{label}</span>
      <span style={{ color: color ?? C.ink, wordBreak: "break-word" }}>{value}</span>
    </div>
  );
}
