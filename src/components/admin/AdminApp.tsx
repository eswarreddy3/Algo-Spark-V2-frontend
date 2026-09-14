"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import "../theme/palette.css";
import "./admin.css";
import { C, FB, FD, tint } from "./theme";
import { Sidebar } from "./shell/Sidebar";
import { Topbar } from "./shell/Topbar";
import { AdminNavProvider, type AdminNav, type AdminView } from "./nav";
import { AdminStateProvider, type Toast } from "./state";
import { useTheme } from "@/lib/theme";
import { OverviewPage } from "./pages/OverviewPage";
import { StudentsPage } from "./pages/StudentsPage";
import { LabsPage } from "./pages/LabsPage";
import { ExamsPage } from "./pages/ExamsPage";
import { LeaderboardPage } from "./pages/LeaderboardPage";
import { ReportsPage } from "./pages/ReportsPage";
import { SupportPage } from "./pages/SupportPage";

const TOAST_ICON = { info: Info, good: CheckCircle2, warn: AlertTriangle };
const TOAST_TINT = { info: C.sky, good: C.green, warn: C.gold };

export default function AdminApp() {
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3800);
    return () => window.clearTimeout(t);
  }, [toast]);

  return (
    <AdminStateProvider onToast={setToast}>
      <Shell toast={toast} />
    </AdminStateProvider>
  );
}

function Shell({ toast }: { toast: Toast | null }) {
  const [view, setView] = useState<AdminView>("overview");
  const [studentId, setStudentId] = useState<string | null>(null);
  const [labId, setLabId] = useState<string | null>(null);
  const [examId, setExamId] = useState<string | null>(null);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [authoringOpen, setAuthoringOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { choice } = useTheme();

  // Every navigation closes whatever was open on top and returns to the top of
  // the page, as a router would.
  const go = useCallback((next: AdminView) => {
    setView(next);
    setStudentId(null);
    setTicketId(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const nav = useMemo<AdminNav>(
    () => ({
      view, studentId, labId, examId, ticketId, authoringOpen,
      go,
      // The drill-down lives on the roster page, so opening a student from
      // anywhere lands there with the panel already open.
      openStudent: (id: string) => {
        setStudentId(id);
        setTicketId(null);
        setView("students");
        window.scrollTo({ top: 0, behavior: "smooth" });
      },
      closeStudent: () => setStudentId(null),
      openLab: (id: string | null) => {
        setLabId(id);
        setView("labs");
        window.scrollTo({ top: 0, behavior: "smooth" });
      },
      openExam: (id: string | null) => {
        setExamId(id);
        setView("exams");
        window.scrollTo({ top: 0, behavior: "smooth" });
      },
      openTicket: (id: string | null) => {
        setTicketId(id);
        if (id) setView("support");
      },
      setAuthoringOpen,
      openAuthoring: () => {
        setAuthoringOpen(true);
        setStudentId(null);
        setTicketId(null);
        setView("labs");
        // Wait for the Labs page to mount and the section to expand, then
        // bring it into view rather than leaving the admin at the page top.
        window.setTimeout(() => {
          document.getElementById("lab-authoring")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 60);
      },
    }),
    [view, studentId, labId, examId, ticketId, authoringOpen, go],
  );

  return (
    <AdminNavProvider value={nav}>
      {/* Only an explicit choice is stamped; without one, admin.css follows the
          operating system so a dark-mode viewer never sees a light first paint. */}
      <div className="ad-app ad-shell" data-theme={choice ?? undefined} style={{ fontFamily: FB, background: C.paper, color: C.ink }}>
        {menuOpen && <div className="ad-scrim" onClick={() => setMenuOpen(false)} aria-hidden />}
        <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          <Topbar onOpenMenu={() => setMenuOpen(true)} />

          <main className="ad-main" style={{ width: "100%", boxSizing: "border-box" }}>
            {view === "overview" && <OverviewPage />}
            {view === "students" && <StudentsPage />}
            {view === "labs" && <LabsPage />}
            {view === "exams" && <ExamsPage />}
            {view === "leaderboard" && <LeaderboardPage />}
            {view === "reports" && <ReportsPage />}
            {view === "support" && <SupportPage />}
          </main>
        </div>

        {toast && <ToastCard toast={toast} />}
      </div>
    </AdminNavProvider>
  );
}

function ToastCard({ toast }: { toast: Toast }) {
  const Icon = TOAST_ICON[toast.tone];
  const accent = TOAST_TINT[toast.tone];
  return (
    <div
      className="ad-toast"
      role="status"
      aria-live="polite"
      style={{
        // Inverse of the page, so the toast reads in either theme.
        position: "fixed", bottom: 24, zIndex: 70, background: C.ink, color: C.white,
        borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12,
        boxShadow: `0 20px 50px ${C.shadow}`, maxWidth: "calc(100vw - 48px)",
      }}
    >
      <div style={{ width: 34, height: 34, flex: "none", borderRadius: 10, background: tint(accent, 22), color: accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={18} />
      </div>
      <div>
        <div style={{ fontFamily: FD, fontWeight: 600, fontSize: 15 }}>{toast.title}</div>
        <div style={{ fontSize: 13, color: tint(C.white, 72) }}>{toast.sub}</div>
      </div>
    </div>
  );
}
