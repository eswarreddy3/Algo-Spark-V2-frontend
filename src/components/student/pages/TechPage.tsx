"use client";

import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, Loader2, Play, Terminal } from "lucide-react";
import { C, EDITOR, FB, FM, goldGrad } from "../theme";
import { Card } from "../ui";
import type { Language } from "../labs/types";
import { CodeEditor } from "../labs/CodeEditor";
import { CoursesSection } from "../courses/CoursesSection";
import { CodingProblems } from "../tech/CodingProblems";
import { SqlSection } from "../tech/SqlSection";
import { useNav } from "../nav";

export function TechPage() {
  const { techRoute, setTechRoute } = useNav();

  return (
    <div>
      {techRoute.tab === "problems" && <CodingProblems />}
      {techRoute.tab === "courses" && (
        <CoursesSection scope="tech" route={techRoute.course} setRoute={(course) => setTechRoute({ ...techRoute, course })} />
      )}
      {techRoute.tab === "sql" && <SqlSection />}
      {techRoute.tab === "playground" && <Playground />}
    </div>
  );
}

/* ---------------- free compile ---------------- */

type PlaygroundLanguage = "python" | "javascript" | "cpp" | "java" | "c";

const PLAYGROUND: Record<PlaygroundLanguage, { label: string; file: string; highlight: Language; sample: string }> = {
  python: {
    label: "Python 3", file: "main.py", highlight: "python",
    sample: `name = input()\nprint("Hello,", name)\nfor i in range(3):\n    print("spark", i)`,
  },
  javascript: {
    label: "JavaScript", file: "main.js", highlight: "cpp",
    sample: `const name = input();\nconsole.log("Hello,", name);\nfor (let i = 0; i < 3; i++) {\n  console.log("spark", i);\n}`,
  },
  cpp: {
    label: "C++ 17", file: "main.cpp", highlight: "cpp",
    sample: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    cout << "Hello from AlgoSpark!" << endl;\n    return 0;\n}`,
  },
  java: {
    label: "Java 17", file: "Main.java", highlight: "java",
    sample: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from AlgoSpark!");\n    }\n}`,
  },
  c: {
    label: "C (GCC)", file: "main.c", highlight: "cpp",
    sample: `#include <stdio.h>\n\nint main(void) {\n    printf("Hello from AlgoSpark!\\n");\n    return 0;\n}`,
  },
};

const JUDGE_URL = process.env.NEXT_PUBLIC_JUDGE_URL;
const TIME_LIMIT_MS = 3000;

type RunOutput = { stdout: string; error?: string; ms: number; mode: "judge" | "browser" | "preview" };

/**
 * Runs JavaScript for real inside a throwaway Web Worker, so an infinite loop
 * is killed at the time limit instead of freezing the page.
 */
function runJavaScript(source: string, stdin: string): Promise<RunOutput> {
  const workerSource = `
    const lines = [];
    const fmt = (v) => typeof v === "string" ? v : (() => { try { return JSON.stringify(v); } catch { return String(v); } })();
    const log = (...args) => lines.push(args.map(fmt).join(" "));
    self.console = { log, info: log, warn: log, error: log };
    self.onmessage = (e) => {
      const input_lines = e.data.stdin.split("\\n");
      let cursor = 0;
      const input = () => (cursor < input_lines.length ? input_lines[cursor++] : "");
      try {
        new Function("input", "console", e.data.source)(input, self.console);
        self.postMessage({ stdout: lines.join("\\n") });
      } catch (err) {
        self.postMessage({ stdout: lines.join("\\n"), error: String(err && err.stack ? err.stack.split("\\n")[0] : err) });
      }
    };
  `;
  return new Promise((resolve) => {
    const url = URL.createObjectURL(new Blob([workerSource], { type: "text/javascript" }));
    const worker = new Worker(url);
    const started = performance.now();
    const finish = (out: Omit<RunOutput, "ms" | "mode">) => {
      window.clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve({ ...out, ms: Math.round(performance.now() - started), mode: "browser" });
    };
    const timer = window.setTimeout(() => finish({ stdout: "", error: `Time limit exceeded (${TIME_LIMIT_MS / 1000}s)` }), TIME_LIMIT_MS);
    worker.onmessage = (e) => finish(e.data as { stdout: string; error?: string });
    worker.onerror = (e) => finish({ stdout: "", error: e.message });
    worker.postMessage({ source, stdin });
  });
}

/** Without a judge, compiled languages get a preview that prints their string literals. */
function previewOutput(language: PlaygroundLanguage, source: string): RunOutput {
  const patterns: Record<Exclude<PlaygroundLanguage, "javascript">, RegExp> = {
    python: /print\((.*)\)\s*$/gm,
    cpp: /cout\s*<<\s*(.+?);/g,
    java: /System\.out\.print(?:ln)?\((.*)\)\s*;/g,
    c: /printf\((.*)\)\s*;/g,
  };
  const re = patterns[language as Exclude<PlaygroundLanguage, "javascript">];
  const lines = [...source.matchAll(re)].map((m) =>
    [...m[1].matchAll(/"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'/g)]
      .map((q) => (q[1] ?? q[2]).replace(/\\n/g, ""))
      .join(" ")
      .trim(),
  );
  return { stdout: lines.filter(Boolean).join("\n") || "(no output)", ms: 0, mode: "preview" };
}

async function execute(language: PlaygroundLanguage, source: string, stdin: string): Promise<RunOutput> {
  if (JUDGE_URL) {
    const started = performance.now();
    const res = await fetch(`${JUDGE_URL}/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language, source, stdin }),
    });
    if (!res.ok) throw new Error(`Judge responded ${res.status}`);
    const body = (await res.json()) as { stdout: string; error?: string };
    return { ...body, ms: Math.round(performance.now() - started), mode: "judge" };
  }
  if (language === "javascript") return runJavaScript(source, stdin);
  await new Promise((r) => setTimeout(r, 400));
  return previewOutput(language, source);
}

function Playground() {
  const [language, setLanguage] = useState<PlaygroundLanguage>("python");
  const [sources, setSources] = useState<Record<PlaygroundLanguage, string>>(() =>
    Object.fromEntries(Object.entries(PLAYGROUND).map(([k, v]) => [k, v.sample])) as Record<PlaygroundLanguage, string>,
  );
  const [stdin, setStdin] = useState("Aditya");
  const [out, setOut] = useState<RunOutput | null>(null);
  const [running, setRunning] = useState(false);
  const live = useRef(true);
  useEffect(() => () => { live.current = false; }, []);

  const meta = PLAYGROUND[language];
  const code = sources[language];

  async function run() {
    if (running) return;
    setRunning(true);
    try {
      const result = await execute(language, code, stdin);
      if (live.current) setOut(result);
    } catch {
      if (live.current) setOut({ stdout: "", error: "Could not reach the execution service. Try again.", ms: 0, mode: "judge" });
    } finally {
      if (live.current) setRunning(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ background: EDITOR.chrome, padding: "9px 15px", fontFamily: FM, fontSize: 12.5, color: EDITOR.dim, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <Terminal size={14} color={C.sky} /> {meta.file} — free compile, no problem attached, nothing is graded
          <div style={{ marginLeft: "auto", position: "relative", display: "flex", alignItems: "center" }}>
            <select
              value={language}
              onChange={(e) => { setLanguage(e.target.value as PlaygroundLanguage); setOut(null); }}
              aria-label="Language"
              style={{ appearance: "none", background: "rgba(77,163,245,.16)", color: C.skyLt, border: "none", borderRadius: 8, padding: "6px 26px 6px 10px", fontFamily: FM, fontSize: 11.5, cursor: "pointer" }}
            >
              {(Object.keys(PLAYGROUND) as PlaygroundLanguage[]).map((l) => (
                <option key={l} value={l} style={{ color: C.ink }}>
                  {PLAYGROUND[l].label}
                </option>
              ))}
            </select>
            <ChevronDown size={13} color={C.skyLt} style={{ position: "absolute", right: 8, pointerEvents: "none" }} />
          </div>
        </div>
        <CodeEditor
          key={language}
          value={code}
          onChange={(next) => setSources((prev) => ({ ...prev, [language]: next }))}
          language={meta.highlight}
          minHeight={240}
          onRun={run}
        />
        <div style={{ background: EDITOR.bar, padding: 12, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <button
            onClick={run}
            disabled={running}
            style={{ background: goldGrad, color: "#3A2A00", border: "none", borderRadius: 9, padding: "9px 16px", fontFamily: FB, fontWeight: 600, fontSize: 14, cursor: running ? "wait" : "pointer", display: "flex", alignItems: "center", gap: 7 }}
          >
            {running ? <Loader2 size={15} style={{ animation: "algospark-spin 1s linear infinite" }} /> : <Play size={15} />} {running ? "Running…" : "Run"}
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
        <style>{"@keyframes algospark-spin{to{transform:rotate(360deg)}}"}</style>
      </Card>

      <div className="as-grid-2">
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "10px 14px", fontFamily: FM, fontSize: 11.5, color: C.inkMute, borderBottom: `1px solid ${C.line}` }}>STDIN</div>
          <textarea
            value={stdin}
            onChange={(e) => setStdin(e.target.value)}
            aria-label="Standard input"
            spellCheck={false}
            style={{ width: "100%", minHeight: 120, border: "none", padding: 14, fontFamily: FM, fontSize: 13, outline: "none", resize: "vertical", color: C.ink, background: C.white, boxSizing: "border-box" }}
          />
        </Card>
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "10px 14px", fontFamily: FM, fontSize: 11.5, color: C.inkMute, borderBottom: `1px solid ${C.line}`, display: "flex", gap: 10 }}>
            OUTPUT
            {out && <span style={{ marginLeft: "auto" }}>{out.mode === "browser" ? `ran in your browser · ${out.ms} ms` : out.mode === "judge" ? `judge · ${out.ms} ms` : "preview"}</span>}
          </div>
          <pre style={{ margin: 0, minHeight: 120, background: EDITOR.console, color: out?.error ? EDITOR.bad : EDITOR.ok, fontFamily: FM, fontSize: 13, padding: 14, whiteSpace: "pre-wrap" }}>
            {out ? [out.stdout, out.error].filter(Boolean).join("\n") : "Run your code to see its output."}
          </pre>
          {out?.mode === "preview" && (
            <div style={{ padding: "9px 14px", fontSize: 12.5, color: C.inkMute, borderTop: `1px solid ${C.line}` }}>
              Preview only: {meta.label} runs on the execution service once it is connected; until then only printed text is shown. JavaScript runs for real.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
