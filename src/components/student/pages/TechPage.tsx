"use client";

import React, { useState } from "react";
import { Play, Terminal } from "lucide-react";
import { C, EDITOR, FB, FM, goldGrad } from "../theme";
import { Card } from "../ui";
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
    <div>
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
