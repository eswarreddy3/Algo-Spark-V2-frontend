"use client";

import React, { useState } from "react";
import {
  CheckCircle2, Clock, Eye, EyeOff, Info, ListChecks, PenLine, RotateCcw, Sparkles, XCircle,
} from "lucide-react";
import { C, FB, FD, FM, blueGrad, goldGrad, tint } from "../theme";
import { Card, Pill, ProgressBar } from "../ui";
import { analyzeEmail, type EmailFeedback, type EmailPrompt } from "../data/emailFeedback";
import { EMAIL_PROMPTS, PASSAGES, type Passage } from "../data/nontech";
import { CoursesSection } from "../courses/CoursesSection";
import { useNav } from "../nav";

export function NonTechPage() {
  const { nonTechRoute, setNonTechRoute } = useNav();
  const tab = nonTechRoute.tab;

  return (
    <div>
      {tab === "email" && <EmailWriting />}
      {tab === "reading" && <Reading />}
      {tab === "courses" && (
        <CoursesSection scope="nontech" route={nonTechRoute.course} setRoute={(course) => setNonTechRoute({ ...nonTechRoute, course })} />
      )}
    </div>
  );
}

/* ---------------- email ---------------- */

function EmailWriting() {
  const [promptId, setPromptId] = useState(EMAIL_PROMPTS[0].id);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<EmailFeedback | null>(null);
  const [showModel, setShowModel] = useState(false);

  const prompt = EMAIL_PROMPTS.find((p) => p.id === promptId) as EmailPrompt;
  const text = drafts[promptId] ?? "";
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const tooShort = words < 25;

  function selectPrompt(id: string) {
    setPromptId(id);
    setFeedback(null);
    setShowModel(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {EMAIL_PROMPTS.map((p) => (
          <button
            key={p.id}
            onClick={() => selectPrompt(p.id)}
            aria-pressed={p.id === promptId}
            style={{
              border: `1.5px solid ${p.id === promptId ? C.royal : C.line}`,
              background: p.id === promptId ? tint(C.royal, 8) : C.white,
              color: p.id === promptId ? C.royal : C.inkSoft, borderRadius: 12, padding: "10px 16px",
              cursor: "pointer", fontFamily: FB, fontWeight: 600, fontSize: 14,
            }}
          >
            {p.title}
          </button>
        ))}
      </div>

      <div className="as-split-main">
        <Card style={{ padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: FD, fontWeight: 600, fontSize: 15 }}>
            <PenLine size={16} color={C.royal} /> Prompt
          </div>
          <p style={{ color: C.inkSoft, fontSize: 14.5, marginTop: 8, lineHeight: 1.6 }}>{prompt.brief}</p>
          <div style={{ display: "flex", gap: 7, marginTop: 12, flexWrap: "wrap" }}>
            <Pill color={C.goldDeep} bg={C.warnBg}>
              {prompt.idealWords[0]}–{prompt.idealWords[1]} words
            </Pill>
            {prompt.mustMention.map((m) => (
              <Pill key={m}>must mention: {m}</Pill>
            ))}
          </div>

          <textarea
            value={text}
            onChange={(e) => setDrafts((d) => ({ ...d, [promptId]: e.target.value }))}
            placeholder={"Subject: …\n\nDear …,"}
            aria-label="Your email"
            style={{
              width: "100%", minHeight: 260, marginTop: 14, border: `1px solid ${C.line}`, borderRadius: 12,
              padding: 14, fontFamily: FB, fontSize: 14.5, lineHeight: 1.7, outline: "none", resize: "vertical",
              color: C.ink,
            }}
          />

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
            <button
              onClick={() => setFeedback(analyzeEmail(text, prompt))}
              disabled={tooShort}
              style={{
                background: tooShort ? C.line : blueGrad, color: tooShort ? C.inkMute : "#fff", border: "none",
                borderRadius: 12, padding: "12px 20px", fontFamily: FB, fontWeight: 600, fontSize: 14.5,
                cursor: tooShort ? "not-allowed" : "pointer", display: "inline-flex", alignItems: "center", gap: 8,
              }}
            >
              <Sparkles size={16} /> Get AI feedback
            </button>
            {text && (
              <button
                onClick={() => { setDrafts((d) => ({ ...d, [promptId]: "" })); setFeedback(null); }}
                style={{ border: `1px solid ${C.line}`, background: C.white, borderRadius: 11, padding: "10px 14px", fontFamily: FB, fontWeight: 600, fontSize: 13.5, cursor: "pointer", display: "flex", alignItems: "center", gap: 7 }}
              >
                <RotateCcw size={14} /> Clear
              </button>
            )}
            <span style={{ marginLeft: "auto", fontFamily: FM, fontSize: 12.5, color: tooShort ? C.inkMute : C.inkSoft }}>
              {words} words{tooShort ? " · write at least 25 to grade" : ""}
            </span>
          </div>
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Card style={{ padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: FD, fontWeight: 600, fontSize: 15 }}>
              <Sparkles size={16} color={C.violet} /> AI feedback
            </div>

            {!feedback ? (
              <p style={{ color: C.inkMute, fontSize: 14, marginTop: 14, lineHeight: 1.6 }}>
                Write your reply and ask for feedback. You will get a score for structure, clarity, tone, mechanics and
                whether you covered what the prompt asked — each with the reason behind it.
              </p>
            ) : (
              <div style={{ marginTop: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div>
                    <div style={{ fontFamily: FD, fontWeight: 700, fontSize: 40, background: goldGrad, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", lineHeight: 1.1 }}>
                      {feedback.overall}
                    </div>
                    <div style={{ color: C.inkMute, fontSize: 12.5 }}>overall score</div>
                  </div>
                  <div style={{ flex: 1, fontFamily: FM, fontSize: 12, color: C.inkMute, lineHeight: 1.7 }}>
                    {feedback.stats.words} words · {feedback.stats.sentences} sentences
                    <br />
                    {feedback.stats.avgSentence} words per sentence · {feedback.stats.paragraphs} paragraphs
                  </div>
                </div>

                <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 11 }}>
                  {feedback.scores.map((s) => (
                    <div key={s.label}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, marginBottom: 5 }}>
                        <span>
                          {s.label} <span style={{ color: C.inkMute, fontSize: 12.5 }}>· {s.hint}</span>
                        </span>
                        <span style={{ fontFamily: FM, color: C.inkSoft }}>{s.value}</span>
                      </div>
                      <ProgressBar value={s.value} color={s.value >= 75 ? C.green : s.value >= 50 ? C.goldDeep : C.red} height={7} />
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 7 }}>
                  {feedback.checks.map((c) => (
                    <div key={c.label} style={{ display: "flex", gap: 9, alignItems: "flex-start", fontSize: 13.5 }}>
                      {c.ok ? <CheckCircle2 size={16} color={C.green} style={{ flex: "none", marginTop: 1 }} /> : <XCircle size={16} color={C.red} style={{ flex: "none", marginTop: 1 }} />}
                      <span style={{ color: C.inkSoft }}>
                        <strong style={{ color: C.ink, fontWeight: 600 }}>{c.label}:</strong> {c.detail}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {feedback && (
            <Card style={{ padding: 18 }}>
              <div style={{ fontFamily: FD, fontWeight: 600, fontSize: 15, display: "flex", alignItems: "center", gap: 8 }}>
                <Info size={16} color={C.blue} /> What to fix next
              </div>
              <ol style={{ margin: "10px 0 0", paddingLeft: 20, color: C.inkSoft, fontSize: 14, lineHeight: 1.75 }}>
                {feedback.suggestions.map((s) => (
                  <li key={s} style={{ marginBottom: 4 }}>
                    {s}
                  </li>
                ))}
              </ol>
              <button
                onClick={() => setShowModel((v) => !v)}
                style={{ marginTop: 14, border: `1px solid ${C.line}`, background: C.white, borderRadius: 11, padding: "9px 14px", fontFamily: FB, fontWeight: 600, fontSize: 13.5, cursor: "pointer", display: "flex", alignItems: "center", gap: 7 }}
              >
                {showModel ? <EyeOff size={15} /> : <Eye size={15} />} {showModel ? "Hide" : "Show"} a model answer
              </button>
              {showModel && (
                <pre style={{ margin: "12px 0 0", background: C.cream, borderRadius: 12, padding: 14, fontFamily: FB, fontSize: 13.5, lineHeight: 1.65, whiteSpace: "pre-wrap", color: C.inkSoft }}>
                  {prompt.model}
                </pre>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- reading ---------------- */

function Reading() {
  const [passageId, setPassageId] = useState(PASSAGES[0].id);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const passage = PASSAGES.find((p) => p.id === passageId) as Passage;
  const answered = passage.questions.filter((q) => answers[q.id] !== undefined).length;
  const score = passage.questions.reduce((s, q) => s + (answers[q.id] === q.a ? 1 : 0), 0);

  function selectPassage(id: string) {
    setPassageId(id);
    setAnswers({});
    setSubmitted(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {PASSAGES.map((p) => (
          <button
            key={p.id}
            onClick={() => selectPassage(p.id)}
            aria-pressed={p.id === passageId}
            style={{
              border: `1.5px solid ${p.id === passageId ? C.royal : C.line}`,
              background: p.id === passageId ? tint(C.royal, 8) : C.white,
              color: p.id === passageId ? C.royal : C.inkSoft, borderRadius: 12, padding: "10px 16px",
              cursor: "pointer", fontFamily: FB, fontWeight: 600, fontSize: 14,
            }}
          >
            {p.title}
          </button>
        ))}
      </div>

      <div className="as-split-main">
        <Card style={{ padding: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <div style={{ fontFamily: FD, fontWeight: 600, fontSize: 16 }}>{passage.title}</div>
            <Pill>
              <Clock size={11} style={{ display: "inline", marginRight: 4, verticalAlign: -1 }} />
              {passage.minutes} min
            </Pill>
            <Pill>{passage.words} words</Pill>
          </div>
          {passage.text.map((para, i) => (
            <p key={i} style={{ color: C.inkSoft, fontSize: 15.5, lineHeight: 1.75, marginTop: 14 }}>
              {para}
            </p>
          ))}
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Card style={{ padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "space-between", flexWrap: "wrap" }}>
              <div style={{ fontFamily: FD, fontWeight: 600, fontSize: 15, display: "flex", alignItems: "center", gap: 8 }}>
                <ListChecks size={16} color={C.royal} /> Comprehension
              </div>
              {submitted ? (
                <Pill color={score === passage.questions.length ? C.green : C.goldDeep} bg={score === passage.questions.length ? C.greenBg : C.warnBg}>
                  {score}/{passage.questions.length} correct
                </Pill>
              ) : (
                <Pill>
                  {answered}/{passage.questions.length} answered
                </Pill>
              )}
            </div>

            <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 16 }}>
              {passage.questions.map((q, qi) => (
                <div key={q.id}>
                  <div style={{ fontSize: 14.5, fontWeight: 600, lineHeight: 1.5 }}>
                    <span style={{ color: C.inkMute, fontFamily: FM, fontSize: 12.5, marginRight: 7 }}>Q{qi + 1}</span>
                    {q.q}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 9 }}>
                    {q.opts.map((opt, k) => {
                      const chosen = answers[q.id] === k;
                      const right = submitted && k === q.a;
                      const wrong = submitted && chosen && k !== q.a;
                      return (
                        <button
                          key={opt}
                          disabled={submitted}
                          onClick={() => setAnswers((a) => ({ ...a, [q.id]: k }))}
                          style={{
                            textAlign: "left", cursor: submitted ? "default" : "pointer",
                            border: `1.5px solid ${right ? C.green : wrong ? C.red : chosen ? C.royal : C.line}`,
                            background: right ? C.greenBg : wrong ? C.redBg : C.white,
                            borderRadius: 11, padding: "10px 13px", fontFamily: FB, fontSize: 14, color: C.ink,
                            display: "flex", alignItems: "center", gap: 9,
                          }}
                        >
                          <span style={{ width: 18, flex: "none", display: "flex" }}>
                            {right ? <CheckCircle2 size={15} color={C.green} /> : wrong ? <XCircle size={15} color={C.red} /> : (
                              <span style={{ width: 14, height: 14, borderRadius: 999, border: `1.5px solid ${chosen ? C.royal : C.line}`, background: chosen ? C.royal : "transparent" }} />
                            )}
                          </span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  {submitted && (
                    <div style={{ marginTop: 8, fontSize: 13.5, color: C.inkSoft, background: C.cream, borderRadius: 10, padding: "9px 12px", display: "flex", gap: 8 }}>
                      <Info size={15} color={C.blue} style={{ flex: "none", marginTop: 1 }} />
                      {q.explain}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ marginTop: 16 }}>
              {submitted ? (
                <button
                  onClick={() => { setAnswers({}); setSubmitted(false); }}
                  style={{ border: `1px solid ${C.line}`, background: C.white, borderRadius: 11, padding: "10px 16px", fontFamily: FB, fontWeight: 600, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 7 }}
                >
                  <RotateCcw size={15} /> Try again
                </button>
              ) : (
                <button
                  onClick={() => setSubmitted(true)}
                  disabled={answered < passage.questions.length}
                  style={{
                    border: "none",
                    background: answered < passage.questions.length ? C.line : blueGrad,
                    color: answered < passage.questions.length ? C.inkMute : "#fff",
                    borderRadius: 12, padding: "12px 20px", fontFamily: FB, fontWeight: 600, fontSize: 14.5,
                    cursor: answered < passage.questions.length ? "not-allowed" : "pointer",
                  }}
                >
                  {answered < passage.questions.length ? `Answer all ${passage.questions.length} questions` : "Check answers"}
                </button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
