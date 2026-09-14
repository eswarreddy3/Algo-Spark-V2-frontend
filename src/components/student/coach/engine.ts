/**
 * AI Prep Coach engine.
 *
 * Diagnoses the student from signals they already produce (lab completion,
 * coding activity by topic and difficulty, exam scores, AI email and reading
 * scores), then sequences existing admin-authored content toward their goal.
 * It never creates content and never unlocks a gated lab week: every plan item
 * is an id from the catalog, and a locked week stays locked in the plan.
 *
 * Everything here is a pure function of its inputs, so the diagnostic and the
 * plan recompute whenever a new score arrives — that is the automatic re-plan.
 * The real app can hand the same inputs and candidate ids to an LLM to write the
 * reasons and pick the order; the output shape stays the same and the
 * candidates stay restricted to this catalog.
 */
import type { Lab } from "../labs/types";
import type { Course, Topic } from "../data/courses";
import { courseTopics } from "../data/courses";
import type { PracticeProblem } from "../data/problems";
import type { Activity, CoachGoal, ExamRecord } from "../data/performance";
import type { ExamListing } from "../data/exam";
import { EMAIL_PROMPTS, PASSAGES } from "../data/nontech";
import { hasContent } from "../labs/content/shared";

const DAY = 86_400_000;
const WEEK = 7 * DAY;
const DIFF_WEIGHT = { Easy: 1, Medium: 2, Hard: 3 } as const;

/* ------------------------------------------------------------------ *
 * Inputs
 * ------------------------------------------------------------------ */

export type LabSignal = {
  lab: Lab;
  /** First incomplete week — the furthest week the student may open. */
  currentWeek: number;
  isComplete: (week: number) => boolean;
  isUnlocked: (week: number) => boolean;
  /** Mean MCQ score (0–100) across attempted weeks, or null. */
  mcqAverage: number | null;
};

export type CourseSignal = { course: Course; isTopicComplete: (topicId: string) => boolean };

export type CoachInputs = {
  labs: LabSignal[];
  courses: CourseSignal[];
  /** Coding and SQL practice bank. */
  problems: { problem: PracticeProblem; kind: "coding" | "sql" }[];
  solved: string[];
  /** Released exam results (feedback submitted). */
  exams: ExamRecord[];
  emailScore: number | null;
  readingScore: number | null;
  listings: ExamListing[];
  activity: Activity[];
  goal: CoachGoal | null;
  now: number;
};

/* ------------------------------------------------------------------ *
 * Readiness diagnostic
 * ------------------------------------------------------------------ */

export type ReadinessComponent = {
  id: "labs" | "coding" | "exams" | "communication";
  label: string;
  weight: number;
  score: number | null;
  evidence: string;
};

export type Readiness = {
  score: number;
  band: { label: string; tone: "red" | "gold" | "blue" | "green" };
  components: ReadinessComponent[];
};

const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
const round = (n: number) => Math.round(n);

/** Weeks with authored content — the ones a student can actually complete. */
function publishedWeeks(lab: Lab) {
  return lab.weeks.filter(hasContent);
}

function labScore(signal: LabSignal) {
  const published = publishedWeeks(signal.lab);
  if (!published.length) return null;
  const done = published.filter((w) => signal.isComplete(w.n)).length;
  const completion = (done / published.length) * 100;
  return round(completion * 0.7 + (signal.mcqAverage ?? completion) * 0.3);
}

function weightedCoverage(items: { problem: PracticeProblem }[], solved: string[]) {
  let total = 0;
  let got = 0;
  for (const { problem } of items) {
    const w = DIFF_WEIGHT[problem.exercise.difficulty];
    total += w;
    if (solved.includes(problem.exercise.id)) got += w;
  }
  return total ? (got / total) * 100 : null;
}

export function diagnose(inputs: CoachInputs): Readiness {
  const labScores = inputs.labs.map(labScore).filter((n): n is number => n !== null);
  const labsDone = inputs.labs.reduce((n, l) => n + publishedWeeks(l.lab).filter((w) => l.isComplete(w.n)).length, 0);
  const labsTotal = inputs.labs.reduce((n, l) => n + publishedWeeks(l.lab).length, 0);

  const overallCoverage = weightedCoverage(inputs.problems, inputs.solved);
  const targets = inputs.goal?.companies ?? [];
  const targetBank = inputs.problems.filter((p) => p.problem.companies.some((c) => targets.includes(c)));
  const targetCoverage = targetBank.length ? weightedCoverage(targetBank, inputs.solved) : null;
  const coding = overallCoverage === null ? null : targetCoverage === null ? overallCoverage : overallCoverage * 0.4 + targetCoverage * 0.6;
  const solvedCount = inputs.problems.filter((p) => inputs.solved.includes(p.problem.exercise.id)).length;

  const recentExams = inputs.exams.slice(0, 3);
  const exams = mean(recentExams.map((e) => e.percent));

  const comms = mean([inputs.emailScore, inputs.readingScore].filter((n): n is number => n !== null));

  const raw: ReadinessComponent[] = [
    { id: "labs", label: "Lab completion", weight: 0.3, score: mean(labScores), evidence: `${labsDone}/${labsTotal} weeks done, MCQ accuracy included` },
    {
      id: "coding", label: "Coding practice", weight: 0.3, score: coding,
      evidence: `${solvedCount}/${inputs.problems.length} problems solved, weighted by difficulty${targetBank.length ? ` · ${round(targetCoverage ?? 0)}% of target-company problems` : ""}`,
    },
    { id: "exams", label: "Exam scores", weight: 0.25, score: exams, evidence: recentExams.length ? `Average of your last ${recentExams.length} exam${recentExams.length === 1 ? "" : "s"}` : "No exam results yet" },
    {
      id: "communication", label: "Email & reading (AI)", weight: 0.15, score: comms,
      evidence: [inputs.emailScore !== null ? `email ${inputs.emailScore}` : null, inputs.readingScore !== null ? `reading ${inputs.readingScore}` : null].filter(Boolean).join(" · ") || "No AI-graded attempts yet",
    },
  ];
  const components = raw.map((c) => ({ ...c, score: c.score === null ? null : round(c.score) }));

  // Components with no data yet are left out and the remaining weights rescale.
  const scored = components.filter((c) => c.score !== null);
  const weight = scored.reduce((n, c) => n + c.weight, 0);
  const score = weight ? round(scored.reduce((n, c) => n + (c.score as number) * c.weight, 0) / weight) : 0;

  const band =
    score >= 85 ? { label: "Placement-ready", tone: "green" as const }
      : score >= 70 ? { label: "Nearly ready", tone: "blue" as const }
        : score >= 50 ? { label: "Getting there", tone: "gold" as const }
          : { label: "Needs work", tone: "red" as const };

  return { score, band, components };
}

/* ------------------------------------------------------------------ *
 * Gap map
 * ------------------------------------------------------------------ */

export type GapArea = {
  id: string;
  label: string;
  group: "Coding topics" | "Labs" | "Exams & communication";
  score: number | null;
  status: "strong" | "ok" | "weak" | "no-data";
  evidence: string;
  /** How many target-company problems depend on this area. */
  targetWeight: number;
  /** Course that teaches this area, if any. */
  courseId?: string;
};

const LAB_COURSE: Record<string, string> = { "cs-ds": "t-dsa", "cs-db": "t-dbms", "cs-os": "t-os" };

const status = (score: number | null): GapArea["status"] =>
  score === null ? "no-data" : score >= 75 ? "strong" : score >= 50 ? "ok" : "weak";

export function gapMap(inputs: CoachInputs): GapArea[] {
  const targets = inputs.goal?.companies ?? [];
  const areas: GapArea[] = [];

  const coding = inputs.problems.filter((p) => p.kind === "coding");
  const tags = [...new Set(coding.flatMap((p) => p.problem.tags))];
  for (const tag of tags) {
    const bank = coding.filter((p) => p.problem.tags.includes(tag));
    const score = weightedCoverage(bank, inputs.solved);
    const solved = bank.filter((p) => inputs.solved.includes(p.problem.exercise.id)).length;
    areas.push({
      id: `tag:${tag}`, label: tag, group: "Coding topics", score: score === null ? null : round(score), status: status(score),
      evidence: `${solved}/${bank.length} solved`,
      targetWeight: bank.filter((p) => p.problem.companies.some((c) => targets.includes(c))).length,
      courseId: "t-dsa",
    });
  }

  const sql = inputs.problems.filter((p) => p.kind === "sql");
  if (sql.length) {
    const score = weightedCoverage(sql, inputs.solved);
    areas.push({
      id: "sql", label: "SQL", group: "Coding topics", score: score === null ? null : round(score), status: status(score),
      evidence: `${sql.filter((p) => inputs.solved.includes(p.problem.exercise.id)).length}/${sql.length} solved`,
      targetWeight: sql.filter((p) => p.problem.companies.some((c) => targets.includes(c))).length, courseId: "t-dbms",
    });
  }

  for (const signal of inputs.labs) {
    const score = labScore(signal);
    const published = publishedWeeks(signal.lab);
    areas.push({
      id: `lab:${signal.lab.id}`, label: signal.lab.name.replace(" Lab", ""), group: "Labs", score, status: status(score),
      evidence: `${published.filter((w) => signal.isComplete(w.n)).length}/${published.length} weeks`, targetWeight: 0,
      courseId: LAB_COURSE[signal.lab.id],
    });
  }

  const sectionMean = (kind: "mcq" | "coding") => mean(inputs.exams.slice(0, 3).flatMap((e) => e.sections.filter((s) => s.kind === kind).map((s) => s.score)));
  const mcq = sectionMean("mcq");
  const timed = sectionMean("coding");
  areas.push({ id: "exam:mcq", label: "Aptitude & CS MCQs", group: "Exams & communication", score: mcq === null ? null : round(mcq), status: status(mcq), evidence: "Exam MCQ sections", targetWeight: targets.length ? 1 : 0, courseId: "aptitude" });
  areas.push({ id: "exam:coding", label: "Coding under time", group: "Exams & communication", score: timed === null ? null : round(timed), status: status(timed), evidence: "Exam coding sections", targetWeight: targets.length ? 1 : 0 });
  areas.push({ id: "email", label: "Email writing", group: "Exams & communication", score: inputs.emailScore, status: status(inputs.emailScore), evidence: "Latest AI scores", targetWeight: 0, courseId: "interview" });
  areas.push({ id: "reading", label: "Reading comprehension", group: "Exams & communication", score: inputs.readingScore, status: status(inputs.readingScore), evidence: "Latest AI scores", targetWeight: 0, courseId: "verbal" });

  return areas;
}

/** Weak areas first, the ones target companies lean on most at the top. */
export function weakest(areas: GapArea[], limit = 3) {
  return areas
    .filter((a) => a.status === "weak" || a.status === "ok")
    .sort((a, b) => Number(b.status === "weak") - Number(a.status === "weak") || b.targetWeight - a.targetWeight || (a.score ?? 0) - (b.score ?? 0))
    .slice(0, limit);
}

export function strongest(areas: GapArea[], limit = 3) {
  return areas.filter((a) => a.status === "strong").sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).slice(0, limit);
}

/* ------------------------------------------------------------------ *
 * Targeted drills
 * ------------------------------------------------------------------ */

export type Drill = { problem: PracticeProblem; kind: "coding" | "sql"; reason: string; score: number };

export function targetedDrills(inputs: CoachInputs, areas: GapArea[]): Drill[] {
  const targets = inputs.goal?.companies ?? [];
  const areaScore = (id: string) => areas.find((a) => a.id === id)?.score ?? 50;
  const diffIndex = { Easy: 0, Medium: 1, Hard: 2 } as const;

  return inputs.problems
    .filter((p) => !inputs.solved.includes(p.problem.exercise.id))
    .map(({ problem, kind }) => {
      const tagAreas = kind === "sql" ? [{ label: "SQL", score: areaScore("sql") }] : problem.tags.map((t) => ({ label: t, score: areaScore(`tag:${t}`) }));
      const weakestTag = tagAreas.slice().sort((a, b) => a.score - b.score)[0];
      const companies = problem.companies.filter((c) => targets.includes(c));
      const score = (companies.length ? 3 : 0) + ((100 - weakestTag.score) / 100) * 2 - diffIndex[problem.exercise.difficulty] * 0.35;
      const reason = [
        weakestTag.score < 75 ? `${weakestTag.label} is ${weakestTag.score < 50 ? "a weak area" : "not solid yet"} (${weakestTag.score}%)` : null,
        companies.length ? `asked at ${companies.join(", ")}` : null,
      ].filter(Boolean).join(" · ") || `Broadens your ${weakestTag.label} practice`;
      return { problem, kind, reason, score };
    })
    .sort((a, b) => b.score - a.score);
}

/* ------------------------------------------------------------------ *
 * Week-by-week plan
 * ------------------------------------------------------------------ */

export type CoachTarget =
  | { type: "lab"; labId: string; week: number }
  | { type: "problem"; problemId: string }
  | { type: "sql"; problemId: string }
  | { type: "course"; scope: "tech" | "nontech"; courseId: string }
  | { type: "nontech"; tab: "email" | "reading" }
  | { type: "exam" };

export type PlanItem = {
  id: string;
  kind: "lab" | "course" | "drill" | "email" | "reading" | "exam";
  title: string;
  detail: string;
  reason: string;
  minutes: number;
  done: boolean;
  locked: boolean;
  lockReason?: string;
  target: CoachTarget;
};

export type PlanWeek = { n: number; start: number; items: PlanItem[]; current: boolean };

export type Plan = {
  weeks: PlanWeek[];
  /** 1-based plan week the student is in now. */
  currentWeek: number;
  totalWeeks: number;
  status: "on-track" | "behind" | "ahead";
  notes: string[];
  thisWeek: PlanWeek | null;
  todaysFocus: PlanItem[];
};

const PRIORITY: Record<PlanItem["kind"], number> = { lab: 0, drill: 1, exam: 2, course: 3, email: 4, reading: 5 };

export function buildPlan(inputs: CoachInputs, areas: GapArea[], drills: Drill[]): Plan | null {
  const goal = inputs.goal;
  if (!goal || !inputs.now) return null;

  const currentWeek = Math.min(goal.weeks, Math.max(1, Math.floor((inputs.now - goal.setAt) / WEEK) + 1));
  const weekStart = (n: number) => goal.setAt + (n - 1) * WEEK;
  const thisStart = weekStart(currentWeek);
  // What the student finished inside the current plan week, by ref.
  const doneThisWeek = new Set(inputs.activity.filter((a) => a.ref && (a.at ?? 0) >= thisStart).map((a) => a.ref as string));

  const slots: PlanWeek[] = [];
  for (let n = currentWeek; n <= goal.weeks; n++) slots.push({ n, start: weekStart(n), items: [], current: n === currentWeek });
  const notes: string[] = [];
  let behindAny = false;
  let aheadAny = false;

  /* Labs — within the week gate. */
  for (const signal of inputs.labs) {
    const { lab } = signal;
    const base = goal.baseline[lab.id] ?? signal.currentWeek;
    const expected = Math.min(lab.weeks.length, base + currentWeek - 1);
    const behind = expected - signal.currentWeek;
    const finished = lab.weeks.every((w) => signal.isComplete(w.n));
    if (!finished && behind > 0) {
      behindAny = true;
      notes.push(`${lab.name.replace(" Lab", "")}: ${behind} week${behind === 1 ? "" : "s"} behind — this week includes catch-up.`);
    } else if (!finished && behind < 0) {
      aheadAny = true;
    }

    const labItem = (n: number, reason: string): PlanItem => {
      const week = lab.weeks.find((w) => w.n === n);
      const ready = Boolean(week && hasContent(week));
      const unlocked = signal.isUnlocked(n) && ready;
      return {
        id: `lab:${lab.id}:${n}`, kind: "lab", title: `${lab.name.replace(" Lab", "")} · Week ${n}`,
        detail: `${week?.title ?? ""} — PPT, MCQs${week?.exercise ? " and coding task" : ""}`, reason,
        minutes: (week?.readingMinutes ?? 20) + 45, done: signal.isComplete(n), locked: !unlocked && !signal.isComplete(n),
        lockReason: !signal.isUnlocked(n) ? `Unlocks when Week ${n - 1} is complete` : "Content not added yet",
        target: { type: "lab", labId: lab.id, week: n },
      };
    };

    // Week already done this plan week stays visible as done.
    const doneNow = lab.weeks.filter((w) => doneThisWeek.has(`lab:${lab.id}:${w.n}`)).map((w) => w.n);
    let next = signal.currentWeek;
    slots.forEach((slot, i) => {
      if (slot.current) doneNow.forEach((n) => slot.items.push(labItem(n, "Completed this week")));
      const quota = slot.current ? Math.max(0, 1 + Math.max(0, behind) - doneNow.length) : 1;
      for (let q = 0; q < quota && next <= lab.weeks.length && !signal.isComplete(next); q++) {
        slot.items.push(labItem(next, i === 0 && q > 0 ? "Catch-up to get back on schedule" : "Keeps your lab on its weekly schedule"));
        next += 1;
      }
    });
  }

  /* Courses — the weakest areas that a course teaches, one topic a week. */
  const courseAreas = weakest(areas.filter((a) => a.courseId), 6);
  const courseIds = [...new Set(courseAreas.map((a) => a.courseId as string))].slice(0, 2);
  for (const courseId of courseIds) {
    const signal = inputs.courses.find((c) => c.course.id === courseId);
    if (!signal) continue;
    const area = courseAreas.find((a) => a.courseId === courseId);
    const topics = courseTopics(signal.course);
    const item = (t: Topic): PlanItem => ({
      id: `topic:${t.id}`, kind: "course", title: t.title, detail: `${signal.course.title} · ${t.minutes} min`,
      reason: area ? `Builds ${area.label} (${area.score ?? "no data"}${area.score !== null ? "%" : ""})` : "Recommended course",
      minutes: t.minutes, done: signal.isTopicComplete(t.id), locked: false,
      target: { type: "course", scope: signal.course.scope, courseId },
    });
    const doneNow = topics.filter((t) => doneThisWeek.has(`topic:${t.id}`));
    const queue = topics.filter((t) => !signal.isTopicComplete(t.id));
    slots.forEach((slot) => {
      if (slot.current) doneNow.forEach((t) => slot.items.push(item(t)));
      const quota = slot.current ? Math.max(0, 1 - doneNow.length) : 1;
      for (let q = 0; q < quota && queue.length; q++) slot.items.push(item(queue.shift() as Topic));
    });
  }

  /* Drills — weak topics × target companies, curated from the bank. */
  const perWeek = goal.weeks <= 4 ? 3 : 2;
  const drillItem = (d: Drill, done: boolean): PlanItem => ({
    id: `problem:${d.problem.exercise.id}`, kind: "drill", title: d.problem.exercise.title,
    detail: `${d.problem.exercise.difficulty} · ${d.kind === "sql" ? "SQL" : d.problem.tags.join(", ")}`, reason: d.reason,
    minutes: { Easy: 20, Medium: 35, Hard: 50 }[d.problem.exercise.difficulty], done, locked: false,
    target: d.kind === "sql" ? { type: "sql", problemId: d.problem.exercise.id } : { type: "problem", problemId: d.problem.exercise.id },
  });
  const solvedNow = inputs.problems.filter((p) => doneThisWeek.has(`problem:${p.problem.exercise.id}`));
  const queue = drills.slice();
  slots.forEach((slot) => {
    if (slot.current) solvedNow.forEach((p) => slot.items.push(drillItem({ problem: p.problem, kind: p.kind, reason: "Solved this week", score: 0 }, true)));
    const quota = slot.current ? Math.max(0, perWeek - solvedNow.length) : perWeek;
    for (let q = 0; q < quota && queue.length; q++) slot.items.push(drillItem(queue.shift() as Drill, false));
  });

  /* Communication — one AI-graded task a week while email or reading is below 75, weaker one first. */
  const needs = (score: number | null) => score === null || score < 75;
  const commKinds = (["email", "reading"] as const)
    .filter((k) => needs(k === "email" ? inputs.emailScore : inputs.readingScore))
    .sort((a, b) => ((a === "email" ? inputs.emailScore : inputs.readingScore) ?? 0) - ((b === "email" ? inputs.emailScore : inputs.readingScore) ?? 0));
  if (commKinds.length) {
    slots.forEach((slot, i) => {
      const kind = commKinds[i % commKinds.length];
      const ref = kind === "email" ? EMAIL_PROMPTS[(slot.n - 1) % EMAIL_PROMPTS.length] : PASSAGES[(slot.n - 1) % PASSAGES.length];
      const score = kind === "email" ? inputs.emailScore : inputs.readingScore;
      slot.items.push({
        id: `${kind}:${ref.id}:${slot.n}`, kind, title: kind === "email" ? `Email: ${ref.title}` : `Reading: ${ref.title}`,
        detail: "AI graded · score, feedback and suggestions", reason: score === null ? `No ${kind === "email" ? "email" : "reading"} score yet — get a baseline` : `${kind === "email" ? "Email writing" : "Reading"} is at ${score} — target 75+`,
        minutes: 15, done: slot.current && doneThisWeek.has(`${kind}:${ref.id}`), locked: false,
        target: { type: "nontech", tab: kind },
      });
    });
  }

  /* Exams opening inside a plan week. */
  for (const listing of inputs.listings) {
    const opens = inputs.now + listing.daysFromNow * DAY;
    const slot = slots.find((s) => opens >= s.start && opens < s.start + WEEK) ?? (listing.daysFromNow === 0 ? slots[0] : undefined);
    if (!slot) continue;
    const taken = inputs.exams.some((e) => e.examId === listing.id);
    slot.items.push({
      id: `exam:${listing.id}`, kind: "exam", title: listing.title, detail: `${listing.format} · ${listing.minutes} min`,
      reason: listing.status === "open" ? "Open now — counts toward your leaderboard points" : `${listing.when} — the drills above prepare you for it`,
      minutes: listing.minutes, done: taken, locked: listing.status !== "open" && !taken, lockReason: listing.when,
      target: { type: "exam" },
    });
  }

  slots.forEach((s) => s.items.sort((a, b) => Number(a.done) - Number(b.done) || Number(a.locked) - Number(b.locked) || PRIORITY[a.kind] - PRIORITY[b.kind]));

  const thisWeek = slots[0] ?? null;
  // Today's focus mixes kinds — one per kind in priority order, then fills — so it isn't three lab weeks in a row.
  const open = thisWeek ? thisWeek.items.filter((i) => !i.done && !i.locked) : [];
  const firstOfKind = open.filter((i, idx) => open.findIndex((j) => j.kind === i.kind) === idx);
  const todaysFocus = [...firstOfKind, ...open.filter((i) => !firstOfKind.includes(i))].slice(0, 3);
  if (!notes.length) notes.push(aheadAny ? "You're ahead of schedule in at least one lab — the plan adds practice instead of new weeks." : "On track. The plan updates itself as you complete work.");

  return {
    weeks: slots, currentWeek, totalWeeks: goal.weeks, status: behindAny ? "behind" : aheadAny ? "ahead" : "on-track",
    notes, thisWeek, todaysFocus,
  };
}
