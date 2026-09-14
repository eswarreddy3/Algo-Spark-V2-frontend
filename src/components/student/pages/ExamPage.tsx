"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle, ArrowRight, Award, CalendarClock, Check, ChevronLeft, ClipboardCheck, Clock, Code2, Flag, ListChecks, Lock,
  Mail, FileText, MessageSquareHeart, ShieldCheck, Sparkles, Star,
} from "lucide-react";
import { C, FB, FD, FM, blueGrad, goldGrad, tint } from "../theme";
import { Card, H2, Kicker, Pill, ProgressBar, Serif } from "../ui";
import { CodePanel } from "../labs/CodePanel";
import { EXAM, EXAM_LISTINGS, examCodingExercise, type ExamSection } from "../data/exam";
import { EMAIL_PROMPTS, PASSAGES } from "../data/nontech";
import { analyzeEmail } from "../data/emailFeedback";
import { SUMMARY_WORDS, analyzeReading } from "../data/readingFeedback";
import { usePerformance, type ExamFeedback, type ExamRecord, type ExamSectionResult } from "../data/performance";
import { useNav } from "../nav";

const SECTION_ICON = { mcq: ListChecks, coding: Code2, email: Mail, reading: FileText } as const;
const SECTION_COLOR = { mcq: C.royal, coding: C.violet, email: C.cyan, reading: C.goldDeep } as const;

type Answers = {
  mcq: Record<string, number>;
  flags: string[];
  email: string;
  reading: Record<string, number>;
  summary: string;
  codeSubmitted: boolean;
};

const emptyAnswers: Answers = { mcq: {}, flags: [], email: "", reading: {}, summary: "", codeSubmitted: false };

const wordCount = (text: string) => (text.trim() ? text.trim().split(/\s+/).length : 0);

/** Local screens. Feedback is not one of them: it is forced whenever a submitted paper has none. */
type Screen = { type: "hub" } | { type: "brief" } | { type: "running" } | { type: "result"; examId: string };

export function ExamPage() {
  const { exams, examRecord, recordExam, submitExamFeedback, pendingFeedback: pending } = usePerformance();
  const { go } = useNav();
  const [screen, setScreen] = useState<Screen>({ type: "hub" });
  const [answers, setAnswers] = useState<Answers>(emptyAnswers);
  const [sectionIndex, setSectionIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(EXAM.totalMinutes * 60);
  const [deadline, setDeadline] = useState<number | null>(null);
  const [confirming, setConfirming] = useState(false);

  const submit = useCallback(() => {
    setConfirming(false);
    const usedMinutes = Math.round((EXAM.totalMinutes * 60 - secondsLeft) / 60);
    const sections = gradePaper(answers);
    const percent = Math.round(sections.reduce((n, s) => n + s.score, 0) / sections.length);
    recordExam({
      examId: EXAM.id, title: EXAM.title, percent, points: Math.round((percent / 100) * EXAM.maxPoints), sections, usedMinutes,
    });
    setScreen({ type: "result", examId: EXAM.id });
  }, [answers, secondsLeft, recordExam]);

  // The timer callback always submits the latest answers.
  const submitRef = useRef(submit);
  useEffect(() => {
    submitRef.current = submit;
  }, [submit]);

  // The clock is driven by a wall-clock deadline rather than a decrementing
  // counter, so a throttled background tab cannot gain the student extra time.
  // At zero the paper submits itself with whatever has been answered.
  useEffect(() => {
    if (screen.type !== "running" || deadline === null) return;
    const id = window.setInterval(() => {
      const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining === 0) {
        window.clearInterval(id);
        submitRef.current();
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [screen.type, deadline]);

  function start() {
    setAnswers(emptyAnswers);
    setSectionIndex(0);
    setSecondsLeft(EXAM.totalMinutes * 60);
    setDeadline(Date.now() + EXAM.totalMinutes * 60 * 1000);
    setScreen({ type: "running" });
  }

  // Results stay hidden until the mandatory feedback is in.
  if (screen.type !== "running" && pending) {
    return (
      <FeedbackForm
        exam={pending}
        onSubmit={(fb) => {
          submitExamFeedback(pending.examId, fb);
          setScreen({ type: "result", examId: pending.examId });
          // The student may have clicked elsewhere while the form was forced; results come first.
          go("exam");
        }}
      />
    );
  }

  if (screen.type === "result") {
    const record = examRecord(screen.examId);
    if (record) return <Result record={record} onBack={() => setScreen({ type: "hub" })} />;
  }
  if (screen.type === "brief") return <Brief onStart={start} onBack={() => setScreen({ type: "hub" })} />;
  if (screen.type === "running") {
    return (
      <Running
        answers={answers}
        setAnswers={setAnswers}
        sectionIndex={sectionIndex}
        setSectionIndex={setSectionIndex}
        secondsLeft={secondsLeft}
        confirming={confirming}
        setConfirming={setConfirming}
        onSubmit={submit}
      />
    );
  }
  return <Hub exams={exams} onOpenBrief={() => setScreen({ type: "brief" })} onOpenResult={(examId) => setScreen({ type: "result", examId })} />;
}

/** Grades every section. Email and reading go through the AI grader. */
function gradePaper(answers: Answers): ExamSectionResult[] {
  return EXAM.sections.map((s): ExamSectionResult => {
    if (s.kind === "mcq") {
      const correct = s.questions.filter((q) => answers.mcq[q.id] === q.a).length;
      return { kind: "mcq", label: s.label, score: Math.round((correct / s.questions.length) * 100), detail: `${correct}/${s.questions.length} correct` };
    }
    if (s.kind === "coding") {
      return {
        kind: "coding", label: s.label, score: answers.codeSubmitted ? 100 : 0,
        detail: answers.codeSubmitted ? "Accepted on hidden tests" : "No accepted submission",
      };
    }
    if (s.kind === "email") {
      const prompt = EMAIL_PROMPTS.find((p) => p.id === s.promptId);
      if (!prompt || wordCount(answers.email) < 25) {
        return {
          kind: "email", label: s.label, score: 0, detail: "Not attempted",
          ai: { summary: "Fewer than 25 words were written, so the AI grader had nothing to assess.", suggestions: ["Budget the section's 15 minutes: outline, write, then proofread."] },
        };
      }
      const fb = analyzeEmail(answers.email, prompt);
      return { kind: "email", label: s.label, score: fb.overall, detail: `AI score ${fb.overall}`, ai: { summary: fb.summary, suggestions: fb.suggestions } };
    }
    const passage = PASSAGES.find((p) => p.id === s.passageId);
    if (!passage) return { kind: "reading", label: s.label, score: 0, detail: "Not available" };
    const fb = analyzeReading(passage, answers.reading, answers.summary);
    return { kind: "reading", label: s.label, score: fb.overall, detail: `AI score ${fb.overall} · ${fb.correct}/${passage.questions.length} correct`, ai: { summary: fb.summary, suggestions: fb.suggestions } };
  });
}

/* ---------------- hub ---------------- */

function Hub({
  exams,
  onOpenBrief,
  onOpenResult,
}: {
  exams: ExamRecord[];
  onOpenBrief: () => void;
  onOpenResult: (examId: string) => void;
}) {
  return (
    <div>
      <Kicker>Exams</Kicker>
      <H2>
        Your <Serif>papers.</Serif>
      </H2>
      <p style={{ color: C.inkSoft, marginTop: 8, fontSize: 15.5, maxWidth: 640 }}>
        Exams assigned to your cohort. Every score adds to your college leaderboard points.
      </p>

      <div className="as-split-main" style={{ marginTop: 20 }}>
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.line}`, fontFamily: FD, fontWeight: 600, fontSize: 16 }}>Open & upcoming</div>
          {EXAM_LISTINGS.map((e, i) => {
            const done = exams.find((r) => r.examId === e.id);
            const open = e.status === "open" && !done;
            return (
              <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "15px 18px", borderTop: i ? `1px solid ${C.line}` : "none", flexWrap: "wrap" }}>
                <span style={{ width: 42, height: 42, flex: "none", borderRadius: 12, background: open ? C.warnBg : C.cream, color: open ? C.goldDeep : C.inkMute, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {open ? <ClipboardCheck size={20} /> : done ? <Check size={20} /> : <CalendarClock size={20} />}
                </span>
                <span style={{ flex: 1, minWidth: 200 }}>
                  <span style={{ display: "block", fontFamily: FD, fontWeight: 600, fontSize: 15.5 }}>{e.title}</span>
                  <span style={{ display: "block", fontSize: 13, color: C.inkMute, marginTop: 2 }}>
                    {e.format} · {e.minutes} min · {done ? "Submitted" : e.when}
                  </span>
                </span>
                {done ? (
                  <button onClick={() => onOpenResult(e.id)} style={ghostButton}>
                    View result · {done.percent}%
                  </button>
                ) : open ? (
                  <button onClick={onOpenBrief} style={{ ...primaryButton, padding: "10px 16px" }}>
                    Start <ArrowRight size={15} />
                  </button>
                ) : (
                  <Pill>
                    <Lock size={10} style={{ display: "inline", marginRight: 4, verticalAlign: -1 }} />
                    not open yet
                  </Pill>
                )}
              </div>
            );
          })}
        </Card>

        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.line}`, fontFamily: FD, fontWeight: 600, fontSize: 16 }}>Past results</div>
          {exams.filter((e) => !EXAM_LISTINGS.some((l) => l.id === e.examId)).map((e, i) => (
            <button
              key={e.examId}
              onClick={() => onOpenResult(e.examId)}
              className="as-row"
              style={{ width: "100%", textAlign: "left", border: "none", borderTop: i ? `1px solid ${C.line}` : "none", background: C.white, padding: "13px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, fontFamily: FB, color: C.ink }}
            >
              <Award size={18} color={C.goldDeep} />
              <span style={{ flex: 1 }}>
                <span style={{ display: "block", fontWeight: 600, fontSize: 14.5 }}>{e.title}</span>
                <span style={{ display: "block", fontSize: 12.5, color: C.inkMute }}>{e.daysAgo !== undefined ? `${e.daysAgo} days ago` : "Recently"} · +{e.points} pts</span>
              </span>
              <span style={{ fontFamily: FD, fontWeight: 700, fontSize: 18 }}>{e.percent}%</span>
            </button>
          ))}
        </Card>
      </div>
    </div>
  );
}

const primaryButton: React.CSSProperties = {
  background: blueGrad, color: "#fff", border: "none", borderRadius: 12, padding: "13px 24px", fontFamily: FB, fontWeight: 600,
  fontSize: 15, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8,
};

const ghostButton: React.CSSProperties = {
  border: `1px solid ${C.line}`, background: C.white, borderRadius: 11, padding: "10px 16px", fontFamily: FB, fontWeight: 600,
  fontSize: 14, cursor: "pointer", color: C.ink,
};

/* ---------------- brief ---------------- */

function Brief({ onStart, onBack }: { onStart: () => void; onBack: () => void }) {
  const totalQuestions =
    EXAM.sections.reduce((n, s) => n + (s.kind === "mcq" ? s.questions.length : s.kind === "reading" ? 3 : 1), 0);

  return (
    <div>
      <BackLink label="All exams" onClick={onBack} />
      <Kicker>Exam</Kicker>
      <H2>
        Placement Mock <Serif>#4</Serif>
      </H2>
      <p style={{ color: C.inkSoft, marginTop: 8, fontSize: 15.5, maxWidth: 620 }}>
        A full placement-style paper: aptitude MCQs, one coding problem judged on hidden tests, and two written
        sections graded by AI.
      </p>

      <div className="as-split-main" style={{ marginTop: 20 }}>
        <Card style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 22, flexWrap: "wrap" }}>
            <Stat label="total duration" value={`${EXAM.totalMinutes} min`} />
            <Divider />
            <Stat label="sections" value={String(EXAM.sections.length)} />
            <Divider />
            <Stat label="questions" value={String(totalQuestions)} />
            <Divider />
            <Stat label="window closes" value={EXAM.windowCloses} small />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 22 }}>
            {EXAM.sections.map((s) => {
              const Icon = SECTION_ICON[s.kind];
              return (
                <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", border: `1px solid ${C.line}`, borderRadius: 12 }}>
                  <span style={{ width: 38, height: 38, flex: "none", borderRadius: 10, background: tint(SECTION_COLOR[s.kind], 10), color: SECTION_COLOR[s.kind], display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={19} />
                  </span>
                  <span style={{ flex: 1, fontFamily: FD, fontWeight: 600, fontSize: 15 }}>{s.label}</span>
                  <span style={{ fontFamily: FM, fontSize: 13, color: C.inkSoft }}>
                    {s.kind === "mcq" ? `${s.questions.length} q` : s.kind === "reading" ? "3 q" : "1 task"} · {s.minutes} min
                  </span>
                </div>
              );
            })}
          </div>

          <button
            onClick={onStart}
            style={{ ...primaryButton, marginTop: 22 }}
          >
            Start exam <ClipboardCheck size={17} />
          </button>
        </Card>

        <Card style={{ padding: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: FD, fontWeight: 600, fontSize: 15 }}>
            <ShieldCheck size={17} color={C.royal} /> Before you begin
          </div>
          <ul style={{ margin: "12px 0 0", paddingLeft: 18, color: C.inkSoft, fontSize: 14.5, lineHeight: 1.8 }}>
            {EXAM.instructions.map((line) => (
              <li key={line} style={{ marginBottom: 6 }}>
                {line}
              </li>
            ))}
          </ul>
          <div style={{ marginTop: 16, background: C.warnBg, color: C.warnInk, borderRadius: 12, padding: "12px 14px", fontSize: 13.5, display: "flex", gap: 9, lineHeight: 1.55 }}>
            <AlertTriangle size={16} style={{ flex: "none", marginTop: 1 }} />
            Once you start, the timer keeps running even if you close the tab.
          </div>
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <div>
      <div style={{ fontFamily: FD, fontWeight: 700, fontSize: small ? 17 : 26 }}>{value}</div>
      <div style={{ color: C.inkMute, fontSize: 13 }}>{label}</div>
    </div>
  );
}

function Divider() {
  return <div style={{ width: 1, height: 40, background: C.line }} />;
}

/* ---------------- running ---------------- */

function formatClock(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function Running({
  answers,
  setAnswers,
  sectionIndex,
  setSectionIndex,
  secondsLeft,
  confirming,
  setConfirming,
  onSubmit,
}: {
  answers: Answers;
  setAnswers: React.Dispatch<React.SetStateAction<Answers>>;
  sectionIndex: number;
  setSectionIndex: (i: number) => void;
  secondsLeft: number;
  confirming: boolean;
  setConfirming: (v: boolean) => void;
  onSubmit: () => void;
}) {
  const section = EXAM.sections[sectionIndex];
  const urgent = secondsLeft <= 5 * 60;
  const progress = useMemo(() => sectionProgress(answers), [answers]);
  const attempted = progress.reduce((n, p) => n + p.done, 0);
  const total = progress.reduce((n, p) => n + p.total, 0);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <Kicker>{EXAM.title}</Kicker>
          <div style={{ fontFamily: FD, fontWeight: 700, fontSize: 22, marginTop: 4 }}>{section.label} section</div>
        </div>
        <div
          role="timer"
          aria-live="off"
          style={{
            display: "flex", alignItems: "center", gap: 9, fontFamily: FM, fontWeight: 600, fontSize: 18,
            color: urgent ? C.red : C.ink, background: urgent ? C.redBg : C.cream, padding: "10px 16px", borderRadius: 12,
          }}
        >
          <Clock size={17} /> {formatClock(secondsLeft)}
        </div>
        <button
          onClick={() => setConfirming(true)}
          style={{ background: blueGrad, color: "#fff", border: "none", borderRadius: 12, padding: "12px 20px", fontFamily: FB, fontWeight: 600, fontSize: 14.5, cursor: "pointer" }}
        >
          Submit exam
        </button>
      </div>

      {urgent && (
        <div style={{ marginTop: 12, background: C.redBg, color: C.red, borderRadius: 12, padding: "11px 14px", fontSize: 13.5, display: "flex", gap: 9, alignItems: "center" }}>
          <AlertTriangle size={16} /> Less than five minutes left. The paper submits itself at zero.
        </div>
      )}

      {/* section tabs */}
      <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
        {EXAM.sections.map((s, i) => {
          const Icon = SECTION_ICON[s.kind];
          const p = progress[i];
          const active = i === sectionIndex;
          return (
            <button
              key={s.id}
              onClick={() => setSectionIndex(i)}
              style={{
                flex: "1 1 180px", padding: "11px 13px", borderRadius: 12,
                border: `1.5px solid ${active ? SECTION_COLOR[s.kind] : C.line}`,
                background: active ? tint(SECTION_COLOR[s.kind], 6) : C.white, cursor: "pointer", textAlign: "left",
                display: "flex", alignItems: "center", gap: 9, fontFamily: FB,
              }}
            >
              <Icon size={16} color={active ? SECTION_COLOR[s.kind] : C.inkMute} />
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontSize: 13.5, fontWeight: 600, color: active ? SECTION_COLOR[s.kind] : C.ink }}>{s.label}</span>
                <span style={{ display: "block", fontFamily: FM, fontSize: 11, color: C.inkMute }}>
                  {p.done}/{p.total} done
                </span>
              </span>
              {p.done === p.total && <Check size={15} color={C.green} />}
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 12.5, color: C.inkMute }}>
          {attempted}/{total} answered
        </span>
        <span style={{ flex: 1 }}>
          <ProgressBar value={(attempted / total) * 100} height={6} />
        </span>
      </div>

      <div style={{ marginTop: 18 }}>
        <SectionBody section={section} answers={answers} setAnswers={setAnswers} />
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
        {sectionIndex > 0 && (
          <button
            onClick={() => setSectionIndex(sectionIndex - 1)}
            style={{ border: `1px solid ${C.line}`, background: C.white, borderRadius: 11, padding: "11px 18px", fontFamily: FB, fontWeight: 600, fontSize: 14, cursor: "pointer" }}
          >
            Previous section
          </button>
        )}
        {sectionIndex < EXAM.sections.length - 1 && (
          <button
            onClick={() => setSectionIndex(sectionIndex + 1)}
            style={{ border: "none", background: C.royal, color: "#fff", borderRadius: 11, padding: "11px 18px", fontFamily: FB, fontWeight: 600, fontSize: 14, cursor: "pointer" }}
          >
            Next section
          </button>
        )}
      </div>

      {confirming && (
        <ConfirmSubmit
          progress={progress}
          secondsLeft={secondsLeft}
          onCancel={() => setConfirming(false)}
          onConfirm={onSubmit}
        />
      )}
    </div>
  );
}

function sectionProgress(answers: Answers) {
  const summaryDone = wordCount(answers.summary) >= SUMMARY_WORDS[0] ? 1 : 0;
  return EXAM.sections.map((s) => {
    if (s.kind === "mcq") return { label: s.label, done: Object.keys(answers.mcq).length, total: s.questions.length };
    if (s.kind === "reading") {
      const passage = PASSAGES.find((p) => p.id === s.passageId);
      // The questions plus the summary.
      return { label: s.label, done: Object.keys(answers.reading).length + summaryDone, total: (passage?.questions.length ?? 3) + 1 };
    }
    if (s.kind === "email") return { label: s.label, done: wordCount(answers.email) >= 25 ? 1 : 0, total: 1 };
    return { label: s.label, done: answers.codeSubmitted ? 1 : 0, total: 1 };
  });
}

function SectionBody({
  section,
  answers,
  setAnswers,
}: {
  section: ExamSection;
  answers: Answers;
  setAnswers: React.Dispatch<React.SetStateAction<Answers>>;
}) {
  if (section.kind === "mcq") {
    return (
      <McqSection
        questions={section.questions}
        answers={answers}
        onAnswer={(id, k) => setAnswers((a) => ({ ...a, mcq: { ...a.mcq, [id]: k } }))}
        onFlag={(id) =>
          setAnswers((a) => ({ ...a, flags: a.flags.includes(id) ? a.flags.filter((f) => f !== id) : [...a.flags, id] }))
        }
      />
    );
  }

  if (section.kind === "coding") {
    const exercise = examCodingExercise();
    if (!exercise) return null;
    return (
      <div>
        <div style={{ background: C.cream, borderRadius: 12, padding: "11px 14px", fontSize: 13.5, color: C.inkSoft, marginBottom: 14 }}>
          Run as often as you like. <strong style={{ color: C.ink }}>Submit</strong> records your attempt for this section —
          only the last submission counts.
        </div>
        <CodePanel exercise={exercise} solved={answers.codeSubmitted} onSolved={() => setAnswers((a) => ({ ...a, codeSubmitted: true }))} context="exam" />
      </div>
    );
  }

  if (section.kind === "email") {
    const prompt = EMAIL_PROMPTS.find((p) => p.id === section.promptId);
    const words = answers.email.trim() ? answers.email.trim().split(/\s+/).length : 0;
    return (
      <Card style={{ padding: 20 }}>
        <div style={{ fontFamily: FD, fontWeight: 600, fontSize: 16 }}>{prompt?.title}</div>
        <p style={{ color: C.inkSoft, fontSize: 14.5, marginTop: 8, lineHeight: 1.6 }}>{prompt?.brief}</p>
        <textarea
          value={answers.email}
          onChange={(e) => setAnswers((a) => ({ ...a, email: e.target.value }))}
          placeholder={"Subject: …\n\nDear …,"}
          aria-label="Your email answer"
          style={{ width: "100%", minHeight: 300, marginTop: 14, border: `1px solid ${C.line}`, borderRadius: 12, padding: 14, fontFamily: FB, fontSize: 14.5, lineHeight: 1.7, outline: "none", resize: "vertical", color: C.ink }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 13, color: C.inkMute, flexWrap: "wrap", gap: 8 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Sparkles size={13} color={C.violet} /> Graded by AI when you submit the paper.</span>
          <span style={{ fontFamily: FM }}>
            {words} words {prompt ? `· aim for ${prompt.idealWords[0]}–${prompt.idealWords[1]}` : ""}
          </span>
        </div>
      </Card>
    );
  }

  const passage = PASSAGES.find((p) => p.id === section.passageId);
  if (!passage) return null;
  return (
    <div className="as-split-main">
      <Card style={{ padding: 22 }}>
        <div style={{ fontFamily: FD, fontWeight: 600, fontSize: 16 }}>{passage.title}</div>
        {passage.text.map((para, i) => (
          <p key={i} style={{ color: C.inkSoft, fontSize: 15, lineHeight: 1.75, marginTop: 12 }}>
            {para}
          </p>
        ))}
      </Card>
      <Card style={{ padding: 20 }}>
        <div style={{ fontFamily: FD, fontWeight: 600, fontSize: 15, marginBottom: 12 }}>Questions</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {passage.questions.map((q, qi) => (
            <div key={q.id}>
              <div style={{ fontSize: 14.5, fontWeight: 600, lineHeight: 1.5 }}>
                <span style={{ color: C.inkMute, fontFamily: FM, fontSize: 12.5, marginRight: 7 }}>Q{qi + 1}</span>
                {q.q}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 9 }}>
                {q.opts.map((opt, k) => {
                  const chosen = answers.reading[q.id] === k;
                  return (
                    <button
                      key={opt}
                      onClick={() => setAnswers((a) => ({ ...a, reading: { ...a.reading, [q.id]: k } }))}
                      style={{
                        textAlign: "left", cursor: "pointer", border: `1.5px solid ${chosen ? C.royal : C.line}`,
                        background: chosen ? tint(C.royal, 7) : C.white, borderRadius: 11, padding: "10px 13px",
                        fontFamily: FB, fontSize: 14, color: C.ink,
                      }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 18, paddingTop: 16, borderTop: `1px solid ${C.line}` }}>
          <div style={{ fontSize: 14.5, fontWeight: 600 }}>Summarise the passage in your own words</div>
          <div style={{ fontSize: 13, color: C.inkMute, marginTop: 3 }}>
            {SUMMARY_WORDS[0]}–{SUMMARY_WORDS[1]} words. The AI grader checks whether you caught the main ideas.
          </div>
          <textarea
            value={answers.summary}
            onChange={(e) => setAnswers((a) => ({ ...a, summary: e.target.value }))}
            aria-label="Passage summary"
            style={{ width: "100%", minHeight: 110, marginTop: 10, border: `1px solid ${C.line}`, borderRadius: 12, padding: 12, fontFamily: FB, fontSize: 14, lineHeight: 1.6, outline: "none", resize: "vertical", color: C.ink, background: C.white }}
          />
          <div style={{ fontFamily: FM, fontSize: 12, color: C.inkMute, marginTop: 6 }}>{wordCount(answers.summary)} words</div>
        </div>
      </Card>
    </div>
  );
}

function McqSection({
  questions,
  answers,
  onAnswer,
  onFlag,
}: {
  questions: { id: string; q: string; opts: string[] }[];
  answers: Answers;
  onAnswer: (id: string, option: number) => void;
  onFlag: (id: string) => void;
}) {
  const [index, setIndex] = useState(0);
  const question = questions[index];
  const chosen = answers.mcq[question.id];
  const flagged = answers.flags.includes(question.id);

  return (
    <div className="as-split-main">
      <Card style={{ padding: 22 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontFamily: FM, fontSize: 12, color: C.inkMute, letterSpacing: ".08em" }}>
            QUESTION {index + 1} OF {questions.length}
          </span>
          <button
            onClick={() => onFlag(question.id)}
            aria-pressed={flagged}
            style={{
              marginLeft: "auto", border: `1px solid ${flagged ? C.goldDeep : C.line}`,
              background: flagged ? C.warnBg : C.white, color: flagged ? C.goldDeep : C.inkSoft, borderRadius: 999,
              padding: "6px 12px", cursor: "pointer", fontFamily: FB, fontSize: 13, fontWeight: 600,
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            <Flag size={13} /> {flagged ? "Flagged" : "Flag"}
          </button>
        </div>

        <div style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.5, marginTop: 12 }}>{question.q}</div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
          {question.opts.map((opt, k) => (
            <button
              key={opt}
              onClick={() => onAnswer(question.id, k)}
              style={{
                textAlign: "left", cursor: "pointer", border: `1.5px solid ${chosen === k ? C.royal : C.line}`,
                background: chosen === k ? tint(C.royal, 7) : C.white, borderRadius: 12, padding: "13px 15px",
                fontFamily: FB, fontSize: 15, color: C.ink, display: "flex", alignItems: "center", gap: 11,
              }}
            >
              <span style={{ width: 22, height: 22, flex: "none", borderRadius: 999, border: `1.5px solid ${chosen === k ? C.royal : C.line}`, background: chosen === k ? C.royal : C.white, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FM, fontSize: 11 }}>
                {String.fromCharCode(65 + k)}
              </span>
              {opt}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
          <button
            onClick={() => setIndex(Math.max(0, index - 1))}
            disabled={index === 0}
            style={{ border: `1px solid ${C.line}`, background: C.white, borderRadius: 11, padding: "10px 16px", fontFamily: FB, fontWeight: 600, fontSize: 14, cursor: index === 0 ? "not-allowed" : "pointer", opacity: index === 0 ? 0.5 : 1 }}
          >
            Previous
          </button>
          <button
            onClick={() => setIndex(Math.min(questions.length - 1, index + 1))}
            disabled={index === questions.length - 1}
            style={{ border: "none", background: C.royal, color: "#fff", borderRadius: 11, padding: "10px 16px", fontFamily: FB, fontWeight: 600, fontSize: 14, cursor: index === questions.length - 1 ? "not-allowed" : "pointer", opacity: index === questions.length - 1 ? 0.5 : 1 }}
          >
            Next question
          </button>
        </div>
      </Card>

      <Card style={{ padding: 18, position: "sticky", top: 82 }}>
        <div style={{ fontFamily: FD, fontWeight: 600, fontSize: 15 }}>Question palette</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(42px,1fr))", gap: 8, marginTop: 12 }}>
          {questions.map((q, i) => {
            const answered = answers.mcq[q.id] !== undefined;
            const isFlagged = answers.flags.includes(q.id);
            const active = i === index;
            return (
              <button
                key={q.id}
                onClick={() => setIndex(i)}
                aria-label={`Question ${i + 1}${answered ? ", answered" : ""}${isFlagged ? ", flagged" : ""}`}
                style={{
                  height: 40, borderRadius: 10, cursor: "pointer", fontFamily: FM, fontSize: 13, fontWeight: 600,
                  border: `2px solid ${active ? C.ink : "transparent"}`,
                  // Strong enough to tell apart on a dark surface, not just a light one.
                  background: isFlagged ? tint(C.goldDeep, 26) : answered ? tint(C.green, 26) : C.cream,
                  color: isFlagged ? C.goldDeep : answered ? C.green : C.inkMute,
                }}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 7, fontSize: 12.5, color: C.inkSoft }}>
          <LegendRow color={tint(C.green, 26)} label="Answered" />
          <LegendRow color={tint(C.goldDeep, 26)} label="Flagged for review" />
          <LegendRow color={C.cream} label="Not answered" />
        </div>
      </Card>
    </div>
  );
}

function LegendRow({ color, label }: { color: string; label: string }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 9 }}>
      <span style={{ width: 16, height: 16, borderRadius: 5, background: color, border: `1px solid ${C.line}` }} />
      {label}
    </span>
  );
}

/* ---------------- confirm + result ---------------- */

function ConfirmSubmit({
  progress,
  secondsLeft,
  onCancel,
  onConfirm,
}: {
  progress: { label: string; done: number; total: number }[];
  secondsLeft: number;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const incomplete = progress.filter((p) => p.done < p.total);
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Submit exam"
      style={{ position: "fixed", inset: 0, zIndex: 80, background: C.scrim, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: C.white, borderRadius: 18, padding: 24, maxWidth: 460, width: "100%", boxShadow: `0 30px 70px ${C.shadow}` }}
      >
        <div style={{ fontFamily: FD, fontWeight: 700, fontSize: 20 }}>Submit the paper?</div>
        <p style={{ color: C.inkSoft, fontSize: 14.5, marginTop: 8, lineHeight: 1.6 }}>
          You still have {formatClock(secondsLeft)} left. Once submitted you cannot change your answers.
        </p>

        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
          {progress.map((p) => (
            <div key={p.label} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14 }}>
              {p.done === p.total ? <Check size={16} color={C.green} /> : <AlertTriangle size={16} color={C.goldDeep} />}
              <span style={{ flex: 1 }}>{p.label}</span>
              <span style={{ fontFamily: FM, fontSize: 13, color: p.done === p.total ? C.green : C.goldDeep }}>
                {p.done}/{p.total}
              </span>
            </div>
          ))}
        </div>

        {incomplete.length > 0 && (
          <div style={{ marginTop: 14, background: C.warnBg, color: C.warnInk, borderRadius: 12, padding: "11px 13px", fontSize: 13.5 }}>
            {incomplete.length} section{incomplete.length === 1 ? " is" : "s are"} incomplete. Unanswered questions score zero.
          </div>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
          <button
            onClick={onCancel}
            style={{ border: `1px solid ${C.line}`, background: C.white, borderRadius: 11, padding: "11px 18px", fontFamily: FB, fontWeight: 600, fontSize: 14, cursor: "pointer" }}
          >
            Keep working
          </button>
          <button
            onClick={onConfirm}
            style={{ border: "none", background: blueGrad, color: "#fff", borderRadius: 11, padding: "11px 20px", fontFamily: FB, fontWeight: 600, fontSize: 14, cursor: "pointer" }}
          >
            Submit exam
          </button>
        </div>
      </div>
    </div>
  );
}

function BackLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{ border: "none", background: "none", color: C.inkSoft, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: FB, fontSize: 14, fontWeight: 600, padding: 0, marginBottom: 12 }}
    >
      <ChevronLeft size={17} /> {label}
    </button>
  );
}

/* ---------------- mandatory feedback ---------------- */

const DIFFICULTY_OPTIONS: ExamFeedback["difficulty"][] = ["Too easy", "About right", "Too hard"];

function FeedbackForm({ exam, onSubmit }: { exam: ExamRecord; onSubmit: (fb: Omit<ExamFeedback, "submittedAt">) => void }) {
  const [rating, setRating] = useState(0);
  const [clarity, setClarity] = useState(0);
  const [difficulty, setDifficulty] = useState<ExamFeedback["difficulty"] | null>(null);
  const [comments, setComments] = useState("");
  const [touched, setTouched] = useState(false);
  const complete = rating > 0 && clarity > 0 && difficulty !== null;

  function send() {
    setTouched(true);
    if (!complete || !difficulty) return;
    onSubmit({ rating, clarity, difficulty, comments: comments.trim() });
  }

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", paddingTop: 12 }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 72, height: 72, borderRadius: 999, background: tint(C.royal, 12), color: C.royal, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
          <MessageSquareHeart size={34} />
        </div>
        <H2 style={{ fontSize: 26, marginTop: 16 }}>{exam.title} submitted</H2>
        <p style={{ color: C.inkSoft, marginTop: 8, fontSize: 15, lineHeight: 1.6 }}>
          One required step before your results: tell us how the paper went. It takes under a minute and goes to the AlgoSpark team.
        </p>
      </div>

      <Card style={{ padding: 22, marginTop: 20 }}>
        <RatingRow label="Overall, how was this exam?" value={rating} onChange={setRating} error={touched && !rating} />
        <RatingRow label="Were the questions and instructions clear?" value={clarity} onChange={setClarity} error={touched && !clarity} />

        <div style={{ marginTop: 18 }}>
          <div style={{ fontSize: 14.5, fontWeight: 600, color: touched && !difficulty ? C.red : C.ink }}>How difficult was it?</div>
          <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            {DIFFICULTY_OPTIONS.map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                aria-pressed={difficulty === d}
                style={{
                  border: `1.5px solid ${difficulty === d ? C.royal : C.line}`,
                  background: difficulty === d ? tint(C.royal, 8) : C.white, color: difficulty === d ? C.royal : C.inkSoft,
                  borderRadius: 999, padding: "8px 16px", fontFamily: FB, fontWeight: 600, fontSize: 13.5, cursor: "pointer",
                }}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <div style={{ fontSize: 14.5, fontWeight: 600 }}>
            Anything else? <span style={{ color: C.inkMute, fontWeight: 400 }}>(optional)</span>
          </div>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Timing, a confusing question, a technical problem…"
            aria-label="Feedback comments"
            maxLength={800}
            style={{ width: "100%", minHeight: 100, marginTop: 10, border: `1px solid ${C.line}`, borderRadius: 12, padding: 12, fontFamily: FB, fontSize: 14, lineHeight: 1.6, outline: "none", resize: "vertical", color: C.ink, background: C.white }}
          />
        </div>

        {touched && !complete && (
          <div role="alert" style={{ marginTop: 12, background: C.redBg, color: C.red, borderRadius: 11, padding: "10px 13px", fontSize: 13.5 }}>
            Answer the three rating questions to see your results.
          </div>
        )}

        <button onClick={send} style={{ ...primaryButton, marginTop: 18, width: "100%", justifyContent: "center" }}>
          Submit feedback & see results <ArrowRight size={16} />
        </button>
      </Card>
    </div>
  );
}

function RatingRow({ label, value, onChange, error }: { label: string; value: number; onChange: (v: number) => void; error: boolean }) {
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ fontSize: 14.5, fontWeight: 600, color: error ? C.red : C.ink }}>{label}</div>
      <div style={{ display: "flex", gap: 6, marginTop: 8 }} role="radiogroup" aria-label={label}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} of 5`}
            onClick={() => onChange(n)}
            style={{ border: "none", background: "none", cursor: "pointer", padding: 2, display: "flex" }}
          >
            <Star size={28} fill={n <= value ? C.gold : "none"} strokeWidth={1.6} color={n <= value ? C.goldDeep : C.inkMute} />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------------- result ---------------- */

function Result({ record, onBack }: { record: ExamRecord; onBack: () => void }) {
  return (
    <div style={{ maxWidth: 820, margin: "0 auto", paddingTop: 8 }}>
      <BackLink label="All exams" onClick={onBack} />
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 84, height: 84, borderRadius: 999, background: goldGrad, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
          <Award size={42} color="#3A2A00" />
        </div>
        <H2 style={{ fontSize: 28, marginTop: 18 }}>
          {record.title} · {record.percent}%
        </H2>
        <p style={{ color: C.inkSoft, marginTop: 8, fontSize: 15 }}>
          Finished in {record.usedMinutes} minute{record.usedMinutes === 1 ? "" : "s"} ·{" "}
          <strong style={{ color: C.goldDeep }}>+{record.points} points</strong> added to your college leaderboard total.
        </p>
      </div>

      <div className="as-grid-2" style={{ marginTop: 24 }}>
        {record.sections.map((s) => {
          const tone = s.score >= 60 ? C.green : s.score > 0 ? C.goldDeep : C.red;
          const Icon = SECTION_ICON[s.kind];
          return (
            <Card key={s.kind} style={{ padding: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 34, height: 34, borderRadius: 10, background: tint(SECTION_COLOR[s.kind], 10), color: SECTION_COLOR[s.kind], display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={17} />
                </span>
                <span style={{ flex: 1, color: C.inkSoft, fontSize: 14, fontWeight: 600 }}>{s.label}</span>
                {s.ai && (
                  <Pill color={C.violet} bg={tint(C.violet, 10)}>
                    AI graded
                  </Pill>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 10 }}>
                <span style={{ fontFamily: FD, fontWeight: 700, fontSize: 26 }}>{s.score}</span>
                <span style={{ color: C.inkMute, fontSize: 13 }}>/ 100 · {s.detail}</span>
              </div>
              <div style={{ marginTop: 8 }}>
                <ProgressBar value={s.score} color={tone} height={6} />
              </div>
              {s.ai && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontFamily: FM, fontSize: 11, color: C.inkMute, letterSpacing: ".08em" }}>FEEDBACK</div>
                  <p style={{ fontSize: 13.5, color: C.inkSoft, lineHeight: 1.6, margin: "4px 0 0" }}>{s.ai.summary}</p>
                  <div style={{ fontFamily: FM, fontSize: 11, color: C.inkMute, letterSpacing: ".08em", marginTop: 10 }}>SUGGESTIONS</div>
                  <ul style={{ margin: "4px 0 0", paddingLeft: 18, fontSize: 13, color: C.inkSoft, lineHeight: 1.6 }}>
                    {s.ai.suggestions.slice(0, 3).map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 24 }}>
        <button onClick={onBack} style={ghostButton}>
          Back to exams
        </button>
      </div>
    </div>
  );
}
