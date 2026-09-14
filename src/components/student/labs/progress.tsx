"use client";

/**
 * Lab progress: what the student has finished, what that unlocks and what it
 * is worth. The prototype persists to localStorage; the real app swaps the
 * load/save pair for the progress API and keeps the same hook surface.
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { LABS } from "./catalog";

export type WeekProgress = {
  material: boolean;
  mcq: { score: number; total: number; passed: boolean } | null;
  code: boolean;
  completedAt: string | null;
};

export type LabsState = Record<string, Record<number, WeekProgress>>;

export type AwardEvent = { points: number; title: string; sub: string; ref: string };

const STORAGE_KEY = "algospark.labs.v1";

export const emptyWeek: WeekProgress = { material: false, mcq: null, code: false, completedAt: null };

/** Where the demo starts: a student mid-way through the semester. */
function seedState(): LabsState {
  const done = (score: number, total: number): WeekProgress => ({
    material: true,
    mcq: { score, total, passed: true },
    code: true,
    completedAt: "seeded",
  });
  return {
    "cs-ds": {
      1: done(4, 4), 2: done(3, 4), 3: done(4, 4), 4: done(3, 4), 5: done(4, 4),
      6: { material: false, mcq: null, code: false, completedAt: null },
    },
    "cs-db": { 1: done(4, 4), 2: done(3, 4) },
    "cs-os": {},
  };
}

type Ctx = {
  state: LabsState;
  hydrated: boolean;
  weekProgress: (labId: string, week: number) => WeekProgress;
  /** 1-based number of the furthest week the student may open. */
  currentWeek: (labId: string) => number;
  isUnlocked: (labId: string, week: number) => boolean;
  isComplete: (labId: string, week: number) => boolean;
  labStats: (labId: string) => { completed: number; total: number; percent: number; points: number };
  markMaterial: (labId: string, week: number) => void;
  submitMcq: (labId: string, week: number, score: number, total: number, passed: boolean) => void;
  markCode: (labId: string, week: number) => void;
  resetProgress: () => void;
};

const LabsProgressContext = createContext<Ctx | null>(null);

export function LabsProgressProvider({
  children,
  onAward,
}: {
  children: React.ReactNode;
  onAward?: (event: AwardEvent) => void;
}) {
  const [state, setState] = useState<LabsState>(seedState);
  const [hydrated, setHydrated] = useState(false);

  // Read after mount: the server render must not depend on browser storage, so
  // stored progress is loaded once here rather than during render.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrating from an external store
      if (raw) setState(JSON.parse(raw) as LabsState);
    } catch {
      /* private mode or blocked storage — the seed is a fine starting point */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* nothing to do — progress simply won't survive a reload */
    }
  }, [state, hydrated]);

  const weekProgress = useCallback(
    (labId: string, week: number) => state[labId]?.[week] ?? emptyWeek,
    [state],
  );

  const isComplete = useCallback(
    (labId: string, week: number) => Boolean(weekProgress(labId, week).completedAt),
    [weekProgress],
  );

  const currentWeek = useCallback(
    (labId: string) => {
      const lab = LABS.find((l) => l.id === labId);
      if (!lab) return 1;
      const firstOpen = lab.weeks.find((w) => !isComplete(labId, w.n));
      return firstOpen ? firstOpen.n : lab.weeks.length;
    },
    [isComplete],
  );

  const isUnlocked = useCallback(
    (labId: string, week: number) => week <= currentWeek(labId),
    [currentWeek],
  );

  const labStats = useCallback(
    (labId: string) => {
      const lab = LABS.find((l) => l.id === labId);
      const total = lab?.weeks.length ?? 0;
      const completedWeeks = lab?.weeks.filter((w) => isComplete(labId, w.n)) ?? [];
      const points = completedWeeks.reduce((sum, w) => sum + w.points, 0);
      return {
        completed: completedWeeks.length,
        total,
        percent: total ? Math.round((completedWeeks.length / total) * 100) : 0,
        points,
      };
    },
    [isComplete],
  );

  /**
   * Applies one part of a week, then completes the week — and unlocks the next
   * one — as soon as material, MCQs and the coding task are all done.
   */
  /**
   * Applies one part of a week, then completes the week — and unlocks the next
   * one — as soon as material, MCQs and the coding task are all done.
   */
  const advance = useCallback(
    (labId: string, week: number, patch: Partial<WeekProgress>) => {
      const lab = LABS.find((l) => l.id === labId);
      const before = state[labId]?.[week] ?? emptyWeek;
      const next: WeekProgress = { ...before, ...patch };

      if (!before.completedAt) {
        const weekDef = lab?.weeks.find((w) => w.n === week);
        const needsCode = Boolean(weekDef?.exercise);
        if (next.material && Boolean(next.mcq?.passed) && (!needsCode || next.code)) {
          next.completedAt = new Date().toISOString();
          const nextWeek = lab?.weeks.find((w) => w.n === week + 1);
          const points = weekDef?.points ?? 0;
          onAward?.({
            ref: `lab:${labId}:${week}`,
            points,
            title: `Week ${week} complete!`,
            sub: nextWeek ? `+${points} XP · Week ${week + 1} unlocked` : `+${points} XP · lab finished`,
          });
        }
      }

      setState((prev) => ({ ...prev, [labId]: { ...prev[labId], [week]: next } }));
    },
    [state, onAward],
  );

  const value = useMemo<Ctx>(
    () => ({
      state,
      hydrated,
      weekProgress,
      currentWeek,
      isUnlocked,
      isComplete,
      labStats,
      markMaterial: (labId, week) => advance(labId, week, { material: true }),
      submitMcq: (labId, week, score, total, passed) => advance(labId, week, { mcq: { score, total, passed } }),
      markCode: (labId, week) => advance(labId, week, { code: true }),
      resetProgress: () => setState(seedState()),
    }),
    [state, hydrated, weekProgress, currentWeek, isUnlocked, isComplete, labStats, advance],
  );

  return <LabsProgressContext.Provider value={value}>{children}</LabsProgressContext.Provider>;
}

export function useLabsProgress() {
  const ctx = useContext(LabsProgressContext);
  if (!ctx) throw new Error("useLabsProgress must be used inside <LabsProgressProvider>");
  return ctx;
}
