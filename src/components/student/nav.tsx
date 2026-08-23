"use client";

/**
 * Navigation state for the student app. Pages call `useNav()` instead of
 * receiving callbacks through props, so deep components (search results,
 * notifications, dashboard tiles) can link anywhere.
 */
import React, { createContext, useContext } from "react";
import type { WeekTab } from "./labs/LabWorkspace";

export type View =
  | "dashboard"
  | "labs"
  | "tech"
  | "nontech"
  | "exam"
  | "leaderboard"
  | "profile"
  | "support";

export type LabsRoute = { labId: string | null; week: number; tab: WeekTab };
export type TechRoute = { tab: "problems" | "sql" | "playground"; problemId: string | null };

export const initialLabsRoute: LabsRoute = { labId: null, week: 1, tab: "material" };
export const initialTechRoute: TechRoute = { tab: "problems", problemId: null };

export type Nav = {
  view: View;
  labsRoute: LabsRoute;
  techRoute: TechRoute;
  go: (view: View) => void;
  setLabsRoute: (route: LabsRoute) => void;
  setTechRoute: (route: TechRoute) => void;
  openLabWeek: (labId: string, week: number, tab?: WeekTab) => void;
  openProblem: (problemId: string) => void;
};

const NavContext = createContext<Nav | null>(null);

export function NavProvider({ value, children }: { value: Nav; children: React.ReactNode }) {
  return <NavContext.Provider value={value}>{children}</NavContext.Provider>;
}

export function useNav() {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error("useNav must be used inside <NavProvider>");
  return ctx;
}
