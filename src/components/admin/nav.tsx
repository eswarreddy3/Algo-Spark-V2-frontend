"use client";

/**
 * Navigation state for the admin console. Pages call `useAdminNav()` instead of
 * receiving callbacks through props, so deep components — a chart tooltip, a
 * search result, an at-risk row — can link anywhere in the console.
 */
import React, { createContext, useContext } from "react";

export type AdminView =
  | "overview"
  | "students"
  | "labs"
  | "exams"
  | "leaderboard"
  | "reports"
  | "support";

export type AdminNav = {
  view: AdminView;
  /** Student opened in the roster drill-down drawer, if any. */
  studentId: string | null;
  /** Lab expanded on the Labs page. */
  labId: string | null;
  /** Exam expanded on the Exams page. */
  examId: string | null;
  /** Ticket opened in the support thread drawer. */
  ticketId: string | null;
  /** Whether the question authoring section on the Labs page is expanded. */
  authoringOpen: boolean;
  go: (view: AdminView) => void;
  openStudent: (studentId: string) => void;
  closeStudent: () => void;
  openLab: (labId: string | null) => void;
  openExam: (examId: string | null) => void;
  openTicket: (ticketId: string | null) => void;
  setAuthoringOpen: (open: boolean) => void;
  /** Jump to the Labs page with question authoring expanded. */
  openAuthoring: () => void;
};

const NavContext = createContext<AdminNav | null>(null);

export function AdminNavProvider({ value, children }: { value: AdminNav; children: React.ReactNode }) {
  return <NavContext.Provider value={value}>{children}</NavContext.Provider>;
}

export function useAdminNav() {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error("useAdminNav must be used inside <AdminNavProvider>");
  return ctx;
}
