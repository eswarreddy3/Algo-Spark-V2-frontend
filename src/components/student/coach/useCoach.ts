"use client";

import { useCallback, useMemo } from "react";
import { LABS } from "../labs/catalog";
import { useLabsProgress } from "../labs/progress";
import { ALL_COURSES } from "../courses/catalog";
import { useCourseProgress } from "../courses/progress";
import { PRACTICE_PROBLEMS } from "../data/problems";
import { SQL_PROBLEMS } from "../data/sqlProblems";
import { useSolved } from "../data/solved";
import { usePerformance } from "../data/performance";
import { EXAM_LISTINGS } from "../data/exam";
import { useNow } from "../useNow";
import { buildPlan, diagnose, gapMap, strongest, targetedDrills, weakest, type CoachInputs, type CoachTarget } from "./engine";
import { useNav } from "../nav";

const BANK = [
  ...PRACTICE_PROBLEMS.map((problem) => ({ problem, kind: "coding" as const })),
  ...SQL_PROBLEMS.map((problem) => ({ problem, kind: "sql" as const })),
];

/** Companies a student can target: every company in the problem bank. */
export const TARGET_COMPANIES = [...new Set(BANK.flatMap((p) => p.problem.companies))].sort();

export const TIMELINES = [4, 6, 8, 12] as const;

/**
 * Reads every performance signal the student already has and runs the coach
 * over it. Because the inputs are live, the diagnostic and the plan recompute
 * the moment a lab week, a problem, an exam or an AI-graded task is recorded.
 */
export function useCoach() {
  const labs = useLabsProgress();
  const courses = useCourseProgress();
  const { solved } = useSolved();
  const perf = usePerformance();
  const now = useNow();

  const inputs = useMemo<CoachInputs>(
    () => ({
      labs: LABS.map((lab) => {
        const attempted = lab.weeks.map((w) => labs.weekProgress(lab.id, w.n).mcq).filter((m): m is NonNullable<typeof m> => Boolean(m));
        return {
          lab,
          currentWeek: labs.currentWeek(lab.id),
          isComplete: (n: number) => labs.isComplete(lab.id, n),
          isUnlocked: (n: number) => labs.isUnlocked(lab.id, n),
          mcqAverage: attempted.length ? (attempted.reduce((s, m) => s + m.score / Math.max(1, m.total), 0) / attempted.length) * 100 : null,
        };
      }),
      courses: ALL_COURSES.map((course) => ({ course, isTopicComplete: courses.isTopicComplete })),
      problems: BANK,
      solved,
      exams: perf.exams.filter((e) => e.feedback),
      emailScore: perf.recentScore("email"),
      readingScore: perf.recentScore("reading"),
      listings: EXAM_LISTINGS,
      activity: perf.activity,
      goal: perf.goal,
      now,
    }),
    [labs, courses, solved, perf, now],
  );

  return useMemo(() => {
    const readiness = diagnose(inputs);
    const areas = gapMap(inputs);
    const drills = targetedDrills(inputs, areas);
    const plan = buildPlan(inputs, areas, drills);
    return {
      readiness, areas, drills, plan,
      weak: weakest(areas), strong: strongest(areas),
      goal: perf.goal, hydrated: perf.hydrated,
    };
  }, [inputs, perf.goal, perf.hydrated]);
}

/** Sets or replaces the goal, snapshotting each lab's week so the plan can tell on-track from behind. */
export function useSetGoal() {
  const { setGoal } = usePerformance();
  const { currentWeek } = useLabsProgress();
  return useCallback(
    (companies: string[], weeks: number) =>
      setGoal({ companies, weeks, setAt: Date.now(), baseline: Object.fromEntries(LABS.map((l) => [l.id, currentWeek(l.id)])) }),
    [setGoal, currentWeek],
  );
}

/** Opens the screen a plan item or drill points at. */
export function useOpenTarget() {
  const nav = useNav();
  return useCallback(
    (target: CoachTarget) => {
      if (target.type === "lab") nav.openLabWeek(target.labId, target.week);
      else if (target.type === "problem") nav.openProblem(target.problemId);
      else if (target.type === "sql") nav.openSqlProblem(target.problemId);
      else if (target.type === "course") nav.openCourse(target.scope, target.courseId);
      else if (target.type === "nontech") nav.openNonTechTab(target.tab);
      else nav.go("exam");
    },
    [nav],
  );
}
