"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Zap } from "lucide-react";
import "../theme/palette.css";
import "./student.css";
import { C, FB, FD, goldGrad, tint } from "./theme";
import { useTheme } from "@/lib/theme";
import { Sidebar } from "./shell/Sidebar";
import { Topbar } from "./shell/Topbar";
import {
  NavProvider, initialCourseRoute, initialLabsRoute, initialNonTechRoute, initialSqlRoute, initialTechRoute,
  type LabsRoute, type Nav, type NonTechRoute, type NonTechTab, type ProblemSegregation, type TechRoute, type TechTab, type View,
} from "./nav";
import { LabsProgressProvider, type AwardEvent } from "./labs/progress";
import { SolvedProvider } from "./data/solved";
import { CourseProgressProvider } from "./courses/progress";
import { PerformanceProvider, usePerformance } from "./data/performance";
import { PRACTICE_PROBLEMS } from "./data/problems";
import { SQL_PROBLEMS } from "./data/sqlProblems";
import { moduleOfProblem } from "./data/problemModules";
import { LabsSection } from "./labs/LabsSection";
import { DashboardPage } from "./pages/DashboardPage";
import { CoachPage } from "./coach/CoachPage";
import { TechPage } from "./pages/TechPage";
import { NonTechPage } from "./pages/NonTechPage";
import { ExamPage } from "./pages/ExamPage";
import { LeaderboardPage } from "./pages/LeaderboardPage";
import { ProfilePage } from "./pages/ProfilePage";
import { SupportPage } from "./pages/SupportPage";
import type { WeekTab } from "./labs/LabWorkspace";

type Toast = { title: string; sub: string };

const ALL_PROBLEMS = [...PRACTICE_PROBLEMS, ...SQL_PROBLEMS];

export default function StudentApp() {
  return (
    <PerformanceProvider>
      <ScoringProviders />
    </PerformanceProvider>
  );
}

/** Every scoring event is recorded once, here, so points, activity and the coach stay in step. */
function ScoringProviders() {
  const { record } = usePerformance();
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3600);
    return () => window.clearTimeout(t);
  }, [toast]);

  const onLabAward = useCallback(
    (event: AwardEvent) => {
      record({ kind: "lab", title: event.title, detail: event.sub, points: event.points, ref: event.ref });
      setToast({ title: event.title, sub: event.sub });
    },
    [record],
  );
  const onCourseAward = useCallback(
    (event: AwardEvent) => {
      record({ kind: "course", title: event.title, detail: event.sub, points: event.points, ref: event.ref });
      setToast({ title: event.title, sub: event.sub });
    },
    [record],
  );
  const onProblemSolved = useCallback(
    (problemId: string, points: number) => {
      const problem = ALL_PROBLEMS.find((p) => p.exercise.id === problemId);
      record({
        kind: "code", title: `Solved ${problem?.exercise.title ?? problemId}`,
        detail: problem ? `${problem.exercise.difficulty} · ${problem.tags.join(", ")}` : "", points, ref: `problem:${problemId}`,
      });
      setToast({ title: "Problem solved!", sub: `+${points} XP added to your total` });
    },
    [record],
  );

  return (
    <LabsProgressProvider onAward={onLabAward}>
      <SolvedProvider onSolved={onProblemSolved}>
        <CourseProgressProvider onAward={onCourseAward}>
          <Shell toast={toast} />
        </CourseProgressProvider>
      </SolvedProvider>
    </LabsProgressProvider>
  );
}

function Shell({ toast }: { toast: Toast | null }) {
  const { points, pendingFeedback } = usePerformance();
  const [view, setView] = useState<View>("dashboard");
  const [labsRoute, setLabsRoute] = useState<LabsRoute>(initialLabsRoute);
  const [techRoute, setTechRoute] = useState<TechRoute>(initialTechRoute);
  const [nonTechRoute, setNonTechRoute] = useState<NonTechRoute>(initialNonTechRoute);
  const [menuOpen, setMenuOpen] = useState(false);
  const { choice: themeChoice } = useTheme();

  // Every navigation returns to the top of the page, as a router would.
  const go = useCallback((next: View) => {
    setView(next);
    if (next !== "labs") setLabsRoute(initialLabsRoute);
    if (next !== "tech") setTechRoute(initialTechRoute);
    if (next !== "nontech") setNonTechRoute(initialNonTechRoute);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const nav = useMemo<Nav>(() => {
    const openTech = (route: TechRoute) => {
      setTechRoute(route);
      setView("tech");
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    return {
      view,
      labsRoute,
      techRoute,
      nonTechRoute,
      go,
      setLabsRoute,
      setTechRoute,
      setNonTechRoute,
      openTechTab: (tab: TechTab) => openTech({ ...initialTechRoute, tab }),
      openNonTechTab: (tab: NonTechTab) => {
        setNonTechRoute({ ...initialNonTechRoute, tab });
        setView("nontech");
        window.scrollTo({ top: 0, behavior: "smooth" });
      },
      openCourse: (scope: "tech" | "nontech", courseId: string) => {
        const course = { ...initialCourseRoute, courseId };
        if (scope === "tech") {
          openTech({ ...initialTechRoute, course });
        } else {
          setNonTechRoute({ ...initialNonTechRoute, tab: "courses", course });
          setView("nontech");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      },
      openLabWeek: (labId: string, week: number, tab: WeekTab = "material") => {
        setLabsRoute({ labId, week, tab });
        setView("labs");
        window.scrollTo({ top: 0, behavior: "smooth" });
      },
      // A problem opens inside its module, so Back returns to the module.
      openProblem: (problemId: string) =>
        openTech({ ...initialTechRoute, tab: "problems", moduleId: moduleOfProblem(problemId)?.id ?? null, problemId }),
      openSqlProblem: (problemId: string) =>
        openTech({ ...initialTechRoute, tab: "sql", sql: { ...initialSqlRoute, problemId } }),
      openProblemModule: (moduleId: string, browse: ProblemSegregation) =>
        openTech({ ...initialTechRoute, tab: "problems", moduleId, browse }),
    };
  }, [view, labsRoute, techRoute, nonTechRoute, go]);

  // Post-exam feedback is mandatory: until it is sent, every view shows the feedback form.
  const shown: View = pendingFeedback ? "exam" : view;

  return (
    <NavProvider value={nav}>
      {/* Only an explicit choice is stamped; without one, palette.css follows the
          operating system so a dark-mode viewer never sees a light first paint. */}
      <div className="as-app as-shell" data-theme={themeChoice ?? undefined} style={{ fontFamily: FB, background: C.paper, color: C.ink }}>
        {menuOpen && <div className="as-scrim" onClick={() => setMenuOpen(false)} aria-hidden />}
        <Sidebar xp={points} open={menuOpen} onClose={() => setMenuOpen(false)} />

        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          <Topbar onOpenMenu={() => setMenuOpen(true)} />

          <main style={{ padding: "26px 26px 60px", width: "100%", boxSizing: "border-box" }}>
            {shown === "dashboard" && <DashboardPage xp={points} />}
            {shown === "coach" && <CoachPage />}
            {shown === "labs" && <LabsSection route={labsRoute} setRoute={setLabsRoute} />}
            {shown === "tech" && <TechPage />}
            {shown === "nontech" && <NonTechPage />}
            {shown === "exam" && <ExamPage />}
            {shown === "leaderboard" && <LeaderboardPage />}
            {shown === "profile" && <ProfilePage xp={points} />}
            {shown === "support" && <SupportPage />}
          </main>
        </div>

        {toast && (
          <div
            className="as-toast"
            role="status"
            aria-live="polite"
            style={{
              // Inverse of the page, so the toast reads in either theme.
              position: "fixed", right: 24, bottom: 24, zIndex: 70, background: C.ink, color: C.white,
              borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12,
              boxShadow: `0 20px 50px ${C.shadow}`, maxWidth: "calc(100vw - 48px)",
            }}
          >
            <div style={{ width: 34, height: 34, flex: "none", borderRadius: 10, background: goldGrad, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Zap size={18} color="#3A2A00" />
            </div>
            <div>
              <div style={{ fontFamily: FD, fontWeight: 600, fontSize: 15 }}>{toast.title}</div>
              <div style={{ fontSize: 13, color: tint(C.white, 72) }}>{toast.sub}</div>
            </div>
          </div>
        )}
      </div>
    </NavProvider>
  );
}
