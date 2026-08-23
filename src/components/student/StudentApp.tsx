"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Zap } from "lucide-react";
import "./student.css";
import { C, FB, FD, goldGrad } from "./theme";
import { Sidebar } from "./shell/Sidebar";
import { Topbar } from "./shell/Topbar";
import { NavProvider, initialLabsRoute, initialTechRoute, type LabsRoute, type Nav, type TechRoute, type View } from "./nav";
import { LabsProgressProvider, type AwardEvent } from "./labs/progress";
import { SolvedProvider } from "./data/solved";
import { LabsSection } from "./labs/LabsSection";
import { DashboardPage } from "./pages/DashboardPage";
import { TechPage } from "./pages/TechPage";
import { NonTechPage } from "./pages/NonTechPage";
import { ExamPage } from "./pages/ExamPage";
import { LeaderboardPage } from "./pages/LeaderboardPage";
import { ProfilePage } from "./pages/ProfilePage";
import { SupportPage } from "./pages/SupportPage";
import type { WeekTab } from "./labs/LabWorkspace";

type Toast = { title: string; sub: string };

export default function StudentApp() {
  const [xp, setXp] = useState(3410);
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3600);
    return () => window.clearTimeout(t);
  }, [toast]);

  const award = useCallback((points: number, title: string, sub: string) => {
    setXp((x) => x + points);
    setToast({ title, sub });
  }, []);

  const onLabAward = useCallback((event: AwardEvent) => award(event.points, event.title, event.sub), [award]);
  const onProblemSolved = useCallback(
    (_problemId: string, points: number) => award(points, "Problem solved!", `+${points} XP added to your total`),
    [award],
  );

  return (
    <LabsProgressProvider onAward={onLabAward}>
      <SolvedProvider onSolved={onProblemSolved}>
        <Shell xp={xp} toast={toast} />
      </SolvedProvider>
    </LabsProgressProvider>
  );
}

function Shell({ xp, toast }: { xp: number; toast: Toast | null }) {
  const [view, setView] = useState<View>("dashboard");
  const [labsRoute, setLabsRoute] = useState<LabsRoute>(initialLabsRoute);
  const [techRoute, setTechRoute] = useState<TechRoute>(initialTechRoute);
  const [menuOpen, setMenuOpen] = useState(false);

  // Every navigation returns to the top of the page, as a router would.
  const go = useCallback((next: View) => {
    setView(next);
    if (next !== "labs") setLabsRoute(initialLabsRoute);
    if (next !== "tech") setTechRoute(initialTechRoute);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const nav = useMemo<Nav>(
    () => ({
      view,
      labsRoute,
      techRoute,
      go,
      setLabsRoute,
      setTechRoute,
      openLabWeek: (labId: string, week: number, tab: WeekTab = "material") => {
        setLabsRoute({ labId, week, tab });
        setView("labs");
        window.scrollTo({ top: 0, behavior: "smooth" });
      },
      openProblem: (problemId: string) => {
        setTechRoute({ tab: "problems", problemId });
        setView("tech");
        window.scrollTo({ top: 0, behavior: "smooth" });
      },
    }),
    [view, labsRoute, techRoute, go],
  );

  return (
    <NavProvider value={nav}>
      <div className="as-app as-shell" style={{ fontFamily: FB, background: C.paper, color: C.ink }}>
        {menuOpen && <div className="as-scrim" onClick={() => setMenuOpen(false)} aria-hidden />}
        <Sidebar xp={xp} open={menuOpen} onClose={() => setMenuOpen(false)} />

        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          <Topbar onOpenMenu={() => setMenuOpen(true)} />

          <main style={{ padding: "26px 26px 60px", maxWidth: 1440, width: "100%", margin: "0 auto", boxSizing: "border-box" }}>
            {view === "dashboard" && <DashboardPage xp={xp} />}
            {view === "labs" && <LabsSection route={labsRoute} setRoute={setLabsRoute} />}
            {view === "tech" && <TechPage />}
            {view === "nontech" && <NonTechPage />}
            {view === "exam" && <ExamPage />}
            {view === "leaderboard" && <LeaderboardPage />}
            {view === "profile" && <ProfilePage xp={xp} />}
            {view === "support" && <SupportPage />}
          </main>
        </div>

        {toast && (
          <div
            className="as-toast"
            role="status"
            aria-live="polite"
            style={{
              position: "fixed", right: 24, bottom: 24, zIndex: 70, background: C.ink, color: "#fff",
              borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12,
              boxShadow: "0 20px 50px rgba(16,20,51,.3)", maxWidth: "calc(100vw - 48px)",
            }}
          >
            <div style={{ width: 34, height: 34, flex: "none", borderRadius: 10, background: goldGrad, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Zap size={18} color="#3A2A00" />
            </div>
            <div>
              <div style={{ fontFamily: FD, fontWeight: 600, fontSize: 15 }}>{toast.title}</div>
              <div style={{ fontSize: 13, color: "#AEB6E0" }}>{toast.sub}</div>
            </div>
          </div>
        )}
      </div>
    </NavProvider>
  );
}
