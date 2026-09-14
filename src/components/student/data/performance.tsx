"use client";

/**
 * The student's scoring history: every points event (lab, coding, course,
 * exam), every AI-graded email and reading attempt, exam results with their
 * mandatory feedback, the code attempt log and the AI coach goal.
 *
 * Points on the leaderboard, recent activity on the dashboard and the coach's
 * readiness diagnostic all read from here, so one recorded event updates all
 * three. Same contract as the other stores — localStorage in the prototype, a
 * performance API in the real app.
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DAY, useNow } from "../useNow";

export type ActivityKind = "lab" | "course" | "code" | "exam" | "email" | "reading";

export type Activity = {
  id: string;
  kind: ActivityKind;
  title: string;
  detail: string;
  /** Leaderboard points this event added. */
  points: number;
  /** AI or exam score out of 100, when the event was graded. */
  score?: number;
  /** Epoch ms for recorded events; seeded history uses `daysAgo` instead. */
  at?: number;
  daysAgo?: number;
  /** Seeded events are already included in the starting points total. */
  seed?: boolean;
  /** What the event completed, e.g. `lab:cs-ds:6`, `problem:two-sum`, `topic:t-dsa-1`. The coach plan ticks items off by it. */
  ref?: string;
};

export type ExamFeedback = {
  /** 1–5 overall experience. */
  rating: number;
  difficulty: "Too easy" | "About right" | "Too hard";
  /** 1–5: were the questions and instructions clear? */
  clarity: number;
  comments: string;
  submittedAt: number;
};

export type ExamSectionResult = {
  kind: "mcq" | "coding" | "email" | "reading";
  label: string;
  /** Section score out of 100. */
  score: number;
  detail: string;
  ai?: { summary: string; suggestions: string[] };
};

export type ExamRecord = {
  examId: string;
  title: string;
  /** Overall score out of 100. */
  percent: number;
  points: number;
  sections: ExamSectionResult[];
  usedMinutes: number;
  submittedAt?: number;
  daysAgo?: number;
  feedback: ExamFeedback | null;
};

export type CodeAttempt = {
  id: string;
  exerciseId: string;
  context: "lab" | "practice" | "exam" | "course";
  mode: "run" | "submit";
  at: number;
  /** Seconds between first opening the exercise and this attempt. */
  elapsedSec: number;
  execMs: number;
  verdict: string;
  passed: number;
  total: number;
  /** Estimated time complexity — informational only. */
  complexity?: string;
  /** Submitted after the allowed attempt window closed. */
  late: boolean;
  windowClosesAt?: number;
};

export type CoachGoal = {
  companies: string[];
  weeks: number;
  setAt: number;
  /** Each lab's current week when the goal was set, to tell on-track from behind. */
  baseline: Record<string, number>;
};

type State = {
  activity: Activity[];
  exams: ExamRecord[];
  attempts: CodeAttempt[];
  firstOpened: Record<string, number>;
  goal: CoachGoal | null;
};

const STORAGE_KEY = "algospark.performance.v1";

/** Points already earned before the demo starts (includes the seeded history). */
export const BASE_POINTS = 3410;

function seedState(): State {
  return {
    activity: [
      { id: "s1", kind: "lab", title: "Data Structures Lab · Week 5 complete", detail: "PPT, MCQs and code", points: 80, daysAgo: 1, seed: true },
      { id: "s2", kind: "code", title: "Solved Two Sum", detail: "Easy · Arrays, Hash Map", points: 40, daysAgo: 2, seed: true },
      { id: "s3", kind: "email", title: "Email writing · Follow up on an interview", detail: "AI score 68", points: 0, score: 68, daysAgo: 3, seed: true },
      { id: "s4", kind: "reading", title: "Paragraph reading · How spaced repetition works", detail: "AI score 74", points: 0, score: 74, daysAgo: 4, seed: true },
      { id: "s8", kind: "course", title: "Aptitude Foundations · Percentages", detail: "PPT viewed", points: 0, daysAgo: 5, seed: true },
      { id: "s5", kind: "exam", title: "Placement Mock #3", detail: "Scored 64%", points: 192, score: 64, daysAgo: 6, seed: true },
      { id: "s9", kind: "lab", title: "Data Structures Lab · Week 5 MCQs", detail: "Passed 4/4", points: 0, daysAgo: 7, seed: true },
      { id: "s6", kind: "lab", title: "Database Systems Lab · Week 2 complete", detail: "PPT, MCQs and code", points: 80, daysAgo: 8, seed: true },
      { id: "s10", kind: "code", title: "Practised Valid Parentheses", detail: "Run · 2/3 tests passed", points: 0, daysAgo: 9, seed: true },
      { id: "s11", kind: "course", title: "DSA for Placements · Linked Lists", detail: "PPT viewed", points: 0, daysAgo: 10, seed: true },
      { id: "s12", kind: "lab", title: "Data Structures Lab · Week 5 PPT", detail: "PPT viewed", points: 0, daysAgo: 11, seed: true },
      { id: "s13", kind: "email", title: "Email writing · Ask for a deadline extension", detail: "AI score 61", points: 0, score: 61, daysAgo: 12, seed: true },
      { id: "s7", kind: "exam", title: "Placement Mock #2", detail: "Scored 58%", points: 174, score: 58, daysAgo: 20, seed: true },
    ],
    exams: [
      {
        examId: "mock-3", title: "Placement Mock #3", percent: 64, points: 192, usedMinutes: 84, daysAgo: 6,
        sections: [
          { kind: "mcq", label: "MCQ", score: 70, detail: "7/10 correct" },
          { kind: "coding", label: "Coding", score: 50, detail: "3 of 6 tests passed" },
          { kind: "email", label: "Email writing", score: 62, detail: "AI score 62" },
          { kind: "reading", label: "Paragraph reading", score: 74, detail: "AI score 74" },
        ],
        feedback: { rating: 4, difficulty: "About right", clarity: 4, comments: "Coding section felt short on time.", submittedAt: 0 },
      },
      {
        examId: "mock-2", title: "Placement Mock #2", percent: 58, points: 174, usedMinutes: 88, daysAgo: 20,
        sections: [
          { kind: "mcq", label: "MCQ", score: 60, detail: "6/10 correct" },
          { kind: "coding", label: "Coding", score: 50, detail: "2 of 4 tests passed" },
          { kind: "email", label: "Email writing", score: 58, detail: "AI score 58" },
          { kind: "reading", label: "Paragraph reading", score: 64, detail: "AI score 64" },
        ],
        feedback: { rating: 3, difficulty: "Too hard", clarity: 4, comments: "More aptitude practice before the mock would help.", submittedAt: 0 },
      },
    ],
    attempts: [],
    firstOpened: {},
    goal: null,
  };
}

type NewActivity = Omit<Activity, "id" | "at" | "seed" | "daysAgo">;

type Ctx = {
  hydrated: boolean;
  points: number;
  /** Consecutive days with at least one activity, ending today (or yesterday, if nothing yet today). */
  streak: number;
  activity: Activity[];
  exams: ExamRecord[];
  attempts: CodeAttempt[];
  goal: CoachGoal | null;
  /** A submitted exam still waiting for its mandatory feedback, if any. */
  pendingFeedback: ExamRecord | undefined;
  record: (event: NewActivity) => void;
  /** Stores a submitted exam. Its result stays locked until feedback is sent. */
  recordExam: (exam: Omit<ExamRecord, "feedback" | "submittedAt">) => void;
  submitExamFeedback: (examId: string, feedback: Omit<ExamFeedback, "submittedAt">) => void;
  examRecord: (examId: string) => ExamRecord | undefined;
  logAttempt: (attempt: Omit<CodeAttempt, "id" | "elapsedSec">, openedAt: number) => void;
  attemptsFor: (exerciseId: string) => CodeAttempt[];
  setGoal: (goal: CoachGoal | null) => void;
  /** Mean of the latest three AI scores for a kind, or null when never attempted. */
  recentScore: (kind: "email" | "reading") => number | null;
};

const PerformanceContext = createContext<Ctx | null>(null);

let counter = 0;
const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${(counter++).toString(36)}`;

/** Whole days between an event and today, local time. */
function daysAgoOf(a: Activity, today: number) {
  if (a.daysAgo !== undefined) return a.daysAgo;
  if (a.at === undefined || !today) return null;
  const d = new Date(a.at);
  d.setHours(0, 0, 0, 0);
  return Math.round((today - d.getTime()) / DAY);
}

function computeStreak(activity: Activity[], now: number) {
  const today = now ? new Date(now).setHours(0, 0, 0, 0) : 0;
  const days = new Set(activity.map((a) => daysAgoOf(a, today)).filter((d): d is number => d !== null && d >= 0));
  // A streak isn't broken until a whole day passes with nothing, so it may start from yesterday.
  let day = days.has(0) ? 0 : 1;
  let streak = 0;
  while (days.has(day)) {
    streak += 1;
    day += 1;
  }
  return streak;
}

export function PerformanceProvider({ children }: { children: React.ReactNode }) {
  const now = useNow();
  const [state, setState] = useState<State>(seedState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrating from an external store
      if (raw) setState({ ...seedState(), ...(JSON.parse(raw) as Partial<State>) });
    } catch {
      /* storage blocked — the seed is a fine starting point */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* history simply won't survive a reload */
    }
  }, [state, hydrated]);

  const record = useCallback((event: NewActivity) => {
    const entry: Activity = { ...event, id: newId("a"), at: Date.now() };
    setState((prev) => ({ ...prev, activity: [entry, ...prev.activity].slice(0, 200) }));
  }, []);

  const recordExam = useCallback((exam: Omit<ExamRecord, "feedback" | "submittedAt">) => {
    setState((prev) => ({
      ...prev,
      exams: [{ ...exam, submittedAt: Date.now(), feedback: null }, ...prev.exams.filter((e) => e.examId !== exam.examId)],
    }));
  }, []);

  /** Feedback is mandatory: the score is released, and its points credited, only once it arrives. */
  const submitExamFeedback = useCallback((examId: string, feedback: Omit<ExamFeedback, "submittedAt">) => {
    setState((prev) => {
      const exam = prev.exams.find((e) => e.examId === examId);
      if (!exam || exam.feedback) return prev;
      const at = Date.now();
      return {
        ...prev,
        exams: prev.exams.map((e) => (e.examId === examId ? { ...e, feedback: { ...feedback, submittedAt: at } } : e)),
        activity: [
          { id: newId("a"), kind: "exam" as const, title: exam.title, detail: `Scored ${exam.percent}%`, points: exam.points, score: exam.percent, at, ref: `exam:${examId}` },
          ...prev.activity,
        ].slice(0, 200),
      };
    });
  }, []);

  const logAttempt = useCallback((attempt: Omit<CodeAttempt, "id" | "elapsedSec">, openedAt: number) => {
    setState((prev) => {
      const first = prev.firstOpened[attempt.exerciseId] ?? openedAt;
      const entry: CodeAttempt = { ...attempt, id: newId("c"), elapsedSec: Math.max(0, Math.round((attempt.at - first) / 1000)) };
      return {
        ...prev,
        firstOpened: prev.firstOpened[attempt.exerciseId] ? prev.firstOpened : { ...prev.firstOpened, [attempt.exerciseId]: first },
        attempts: [entry, ...prev.attempts].slice(0, 500),
      };
    });
  }, []);

  const value = useMemo<Ctx>(() => {
    const earned = state.activity.filter((a) => !a.seed).reduce((sum, a) => sum + a.points, 0);
    return {
      hydrated,
      points: BASE_POINTS + earned,
      streak: computeStreak(state.activity, now),
      activity: state.activity,
      exams: state.exams,
      attempts: state.attempts,
      goal: state.goal,
      pendingFeedback: state.exams.find((e) => !e.feedback),
      record,
      recordExam,
      submitExamFeedback,
      examRecord: (examId) => state.exams.find((e) => e.examId === examId),
      logAttempt,
      attemptsFor: (exerciseId) => state.attempts.filter((a) => a.exerciseId === exerciseId),
      setGoal: (goal) => setState((prev) => ({ ...prev, goal })),
      recentScore: (kind) => {
        // Activity is newest first, so the first three graded entries are the latest.
        const scores = state.activity.filter((a) => a.kind === kind && typeof a.score === "number").slice(0, 3).map((a) => a.score as number);
        return scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
      },
    };
  }, [state, hydrated, now, record, recordExam, submitExamFeedback, logAttempt]);

  return <PerformanceContext.Provider value={value}>{children}</PerformanceContext.Provider>;
}

export function usePerformance() {
  const ctx = useContext(PerformanceContext);
  if (!ctx) throw new Error("usePerformance must be used inside <PerformanceProvider>");
  return ctx;
}
