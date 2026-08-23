"use client";

import React, { useMemo, useState } from "react";
import { CheckCircle2, Info, RotateCcw, XCircle } from "lucide-react";
import { C, FB, FD, FM, blueGrad } from "../theme";
import { Card, Pill, ProgressBar } from "../ui";
import type { Mcq } from "./types";

export function McqPanel({
  mcqs,
  passRatio,
  previous,
  onSubmit,
}: {
  mcqs: Mcq[];
  passRatio: number;
  previous: { score: number; total: number; passed: boolean } | null;
  onSubmit: (score: number, total: number, passed: boolean) => void;
}) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(Boolean(previous));

  const needed = Math.ceil(mcqs.length * passRatio);
  const answeredCount = Object.keys(answers).length;
  const score = useMemo(
    () => mcqs.reduce((sum, q) => sum + (answers[q.id] === q.a ? 1 : 0), 0),
    [answers, mcqs],
  );

  // A previously passed attempt is shown as-is until the student retries.
  const showingPrevious = submitted && answeredCount === 0 && previous !== null;
  const shownScore = showingPrevious ? previous.score : score;
  const shownTotal = showingPrevious ? previous.total : mcqs.length;
  const passed = shownScore >= Math.ceil(shownTotal * passRatio);

  if (!mcqs.length) {
    return <Card style={{ padding: 24, color: C.inkMute, fontSize: 14.5 }}>No quiz has been published for this week yet.</Card>;
  }

  function submit() {
    setSubmitted(true);
    onSubmit(score, mcqs.length, score >= needed);
  }

  function retry() {
    setAnswers({});
    setSubmitted(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Card style={{ padding: 18, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontFamily: FD, fontWeight: 600, fontSize: 16 }}>
            {submitted ? (passed ? "Quiz passed" : "Quiz not cleared yet") : "Week quiz"}
          </div>
          <div style={{ color: C.inkMute, fontSize: 13.5, marginTop: 3 }}>
            {submitted
              ? `You scored ${shownScore} of ${shownTotal}. Pass mark is ${needed}.`
              : `${mcqs.length} questions · answer at least ${needed} correctly to clear this week.`}
          </div>
          <div style={{ marginTop: 12 }}>
            <ProgressBar
              value={submitted ? (shownScore / shownTotal) * 100 : (answeredCount / mcqs.length) * 100}
              color={submitted ? (passed ? C.green : C.red) : C.royal}
            />
          </div>
        </div>
        {submitted ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: FD, fontWeight: 700, fontSize: 30, color: passed ? C.green : C.red }}>
                {shownScore}/{shownTotal}
              </div>
              <div style={{ color: C.inkMute, fontSize: 12.5 }}>your score</div>
            </div>
            <button
              onClick={retry}
              style={{ border: `1px solid ${C.line}`, background: "#fff", borderRadius: 11, padding: "10px 16px", fontFamily: FB, fontWeight: 600, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 7 }}
            >
              <RotateCcw size={15} /> Retry
            </button>
          </div>
        ) : (
          <Pill color={C.royal} bg="rgba(47,91,240,.08)">
            {answeredCount}/{mcqs.length} answered
          </Pill>
        )}
      </Card>

      {mcqs.map((q, qi) => {
        const chosen = answers[q.id];
        const locked = submitted && !showingPrevious;
        return (
          <Card key={q.id} style={{ padding: 18 }}>
            <div style={{ fontWeight: 600, fontSize: 15.5, lineHeight: 1.5, marginBottom: 12 }}>
              <span style={{ color: C.inkMute, fontFamily: FM, fontSize: 13, marginRight: 8 }}>Q{qi + 1}</span>
              {q.q}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 10 }}>
              {q.opts.map((opt, k) => {
                const isChosen = chosen === k;
                const right = locked && k === q.a;
                const wrong = locked && isChosen && k !== q.a;
                return (
                  <button
                    key={opt}
                    disabled={submitted}
                    onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: k }))}
                    style={{
                      textAlign: "left",
                      cursor: submitted ? "default" : "pointer",
                      border: `1.5px solid ${right ? C.green : wrong ? C.red : isChosen ? C.royal : C.line}`,
                      background: right ? C.greenBg : wrong ? C.redBg : isChosen ? "rgba(47,91,240,.05)" : "#fff",
                      borderRadius: 11,
                      padding: "11px 14px",
                      fontFamily: FB,
                      fontSize: 14.5,
                      color: C.ink,
                      display: "flex",
                      alignItems: "center",
                      gap: 9,
                    }}
                  >
                    <span style={{ width: 20, flex: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {right ? <CheckCircle2 size={16} color={C.green} /> : wrong ? <XCircle size={16} color={C.red} /> : (
                        <span style={{ width: 15, height: 15, borderRadius: 999, border: `1.5px solid ${isChosen ? C.royal : C.line}`, background: isChosen ? C.royal : "transparent" }} />
                      )}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>
            {locked && (
              <div style={{ marginTop: 12, display: "flex", gap: 9, background: C.cream, borderRadius: 11, padding: "11px 13px", color: C.inkSoft, fontSize: 13.5, lineHeight: 1.55 }}>
                <Info size={16} color={C.blue} style={{ flex: "none", marginTop: 1 }} />
                {q.explain}
              </div>
            )}
          </Card>
        );
      })}

      {!submitted && (
        <button
          onClick={submit}
          disabled={answeredCount < mcqs.length}
          style={{
            alignSelf: "flex-start",
            border: "none",
            background: answeredCount < mcqs.length ? C.line : blueGrad,
            color: answeredCount < mcqs.length ? C.inkMute : "#fff",
            borderRadius: 12,
            padding: "13px 22px",
            fontFamily: FB,
            fontWeight: 600,
            fontSize: 15,
            cursor: answeredCount < mcqs.length ? "not-allowed" : "pointer",
          }}
        >
          {answeredCount < mcqs.length ? `Answer all ${mcqs.length} questions` : "Submit answers"}
        </button>
      )}
    </div>
  );
}
