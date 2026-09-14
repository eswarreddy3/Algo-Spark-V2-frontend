"use client";

/**
 * Navigation state for the student app. Pages call `useNav()` instead of
 * receiving callbacks through props, so deep components (search results,
 * notifications, dashboard tiles) can link anywhere.
 */
import React, { createContext, useContext } from "react";
import { BookOpen, Code2, Database, FileText, Mail, Terminal } from "lucide-react";
import type { WeekTab } from "./labs/LabWorkspace";

export type View =
  | "dashboard"
  | "coach"
  | "labs"
  | "tech"
  | "nontech"
  | "exam"
  | "leaderboard"
  | "profile"
  | "support";

/** Sub-sections of Tech and Non-Tech. The sidebar and the in-page tabs both render from these lists. */
export const TECH_TABS = [
  { id: "courses", label: "Courses", icon: BookOpen },
  { id: "problems", label: "Coding problems", icon: Code2 },
  { id: "sql", label: "SQL compiler", icon: Database },
  { id: "playground", label: "Code compiler", icon: Terminal },
] as const;

export const NONTECH_TABS = [
  { id: "email", label: "Email writing", icon: Mail },
  { id: "reading", label: "Paragraph reading", icon: FileText },
  { id: "courses", label: "Courses", icon: BookOpen },
] as const;

export type TechTab = (typeof TECH_TABS)[number]["id"];
export type NonTechTab = (typeof NONTECH_TABS)[number]["id"];

export type LabsRoute = { labId: string | null; week: number; tab: WeekTab };
export type TopicModule = "material" | "mcq" | "code";
/** Catalog when `courseId` is null, course overview when `topicId` is null, otherwise the topic player. */
export type CourseRoute = { courseId: string | null; topicId: string | null; module: TopicModule };
/** SQL compiler tabs; `problemId` opens one problem from the Problems tab. */
export type SqlRoute = { view: "problems" | "schema" | "playground"; problemId: string | null };

export type TechRoute = {
  tab: TechTab;
  /** Coding problems are browsed by topic or by company; `group` is the open topic/company, if any. */
  problemId: string | null;
  browse: "topics" | "companies";
  group: string | null;
  course: CourseRoute;
  sql: SqlRoute;
};
export type NonTechRoute = { tab: NonTechTab; course: CourseRoute };

export const initialLabsRoute: LabsRoute = { labId: null, week: 1, tab: "material" };
export const initialCourseRoute: CourseRoute = { courseId: null, topicId: null, module: "material" };
export const initialSqlRoute: SqlRoute = { view: "problems", problemId: null };
export const initialTechRoute: TechRoute = {
  tab: "courses", problemId: null, browse: "topics", group: null, course: initialCourseRoute, sql: initialSqlRoute,
};
export const initialNonTechRoute: NonTechRoute = { tab: "email", course: initialCourseRoute };

export type Nav = {
  view: View;
  labsRoute: LabsRoute;
  techRoute: TechRoute;
  nonTechRoute: NonTechRoute;
  go: (view: View) => void;
  setLabsRoute: (route: LabsRoute) => void;
  setTechRoute: (route: TechRoute) => void;
  setNonTechRoute: (route: NonTechRoute) => void;
  openLabWeek: (labId: string, week: number, tab?: WeekTab) => void;
  openProblem: (problemId: string) => void;
  openSqlProblem: (problemId: string) => void;
  /** Opens the coding problems list for one topic or company. */
  openProblemGroup: (browse: "topics" | "companies", group: string) => void;
  openTechTab: (tab: TechTab) => void;
  openNonTechTab: (tab: NonTechTab) => void;
  openCourse: (scope: "tech" | "nontech", courseId: string) => void;
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
