"use client";

/**
 * Which practice problems the student has cleared. Mirrors the labs progress
 * store: localStorage here, a submissions API in the real app.
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { PRACTICE_PROBLEMS } from "./problems";
import { SQL_PROBLEMS } from "./sqlProblems";

/** Coding and SQL problems share one solved list. */
const ALL_PROBLEMS = [...PRACTICE_PROBLEMS, ...SQL_PROBLEMS];

const STORAGE_KEY = "algospark.solved.v1";

type Ctx = {
  solved: string[];
  isSolved: (id: string) => boolean;
  markSolved: (id: string) => void;
  reset: () => void;
};

const SolvedContext = createContext<Ctx | null>(null);

const seed = () => ALL_PROBLEMS.filter((p) => p.solvedSeed).map((p) => p.exercise.id);

export function SolvedProvider({
  children,
  onSolved,
}: {
  children: React.ReactNode;
  onSolved?: (problemId: string, points: number) => void;
}) {
  const [solved, setSolved] = useState<string[]>(seed);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrating from an external store
      if (raw) setSolved(JSON.parse(raw) as string[]);
    } catch {
      /* storage blocked — the seed list is a fine starting point */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(solved));
    } catch {
      /* progress simply won't survive a reload */
    }
  }, [solved, hydrated]);

  const markSolved = useCallback(
    (id: string) => {
      if (solved.includes(id)) return;
      const problem = ALL_PROBLEMS.find((p) => p.exercise.id === id);
      setSolved((prev) => [...prev, id]);
      onSolved?.(id, problem?.exercise.points ?? 0);
    },
    [solved, onSolved],
  );

  const value = useMemo<Ctx>(
    () => ({
      solved,
      isSolved: (id) => solved.includes(id),
      markSolved,
      reset: () => setSolved(seed()),
    }),
    [solved, markSolved],
  );

  return <SolvedContext.Provider value={value}>{children}</SolvedContext.Provider>;
}

export function useSolved() {
  const ctx = useContext(SolvedContext);
  if (!ctx) throw new Error("useSolved must be used inside <SolvedProvider>");
  return ctx;
}
