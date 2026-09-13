"use client";

import React from "react";
import {
  ArrowRight, ChevronRight, ClipboardList, FileSpreadsheet, FlaskConical, PenSquare, TrendingUp, TriangleAlert, Users, UserCheck,
} from "lucide-react";
import { C, FB, FD, FM, goldGrad, tint } from "../theme";
import { Card, CardHeader, H2, Kicker, ProgressBar, Serif, StatTile, BarList, ColumnChart, RiskPill, Avatar, Button, num } from "../ui";
import { ACTIVITY, AT_RISK, BRANCH_STATS, COHORT, completionOf } from "../data/cohort";
import { ADMIN_LABS } from "../data/labs";
import { EXAMS } from "../data/exams";
import { useAdminNav } from "../nav";
import { useAdminState } from "../state";

export function OverviewPage() {
  const nav = useAdminNav();
  const { publishedThrough, tickets, nudge, notify } = useAdminState();
  const liveExam = EXAMS.find((e) => e.status === "live");
  const openTickets = tickets.filter((t) => t.status === "open").length;

  const tiles = [
    { icon: Users, label: "Students", value: String(COHORT.students), sub: `${BRANCH_STATS.length} branches`, color: C.royal, bg: tint(C.royal, 14), onClick: () => nav.go("students") },
    { icon: UserCheck, label: "Active today", value: String(COHORT.activeToday), sub: `${Math.round((COHORT.activeToday / COHORT.students) * 100)}% of the batch`, color: C.green, bg: C.greenBg, onClick: () => nav.go("students") },
    { icon: TrendingUp, label: "Avg. lab completion", value: `${COHORT.completion}%`, sub: "+4 pts this month", color: C.cyan, bg: tint(C.cyan, 14), onClick: () => nav.go("labs") },
    { icon: TriangleAlert, label: "Needs attention", value: String(COHORT.atRisk), sub: "stalled or behind", color: C.red, bg: C.redBg, onClick: () => nav.go("students") },
  ];

  return (
    <div>
      <Kicker>{COHORT.college}</Kicker>
      <H2 style={{ fontSize: 32 }}>
        The whole batch, <Serif>in one view.</Serif>
      </H2>
      <p style={{ color: C.inkSoft, marginTop: 8, fontSize: 16, maxWidth: 680 }}>
        {COHORT.batch} · {num(COHORT.submissionsThisWeek)} submissions this week,
        {" "}{openTickets} support {openTickets === 1 ? "ticket" : "tickets"} open.
      </p>

      <div className="ad-grid-4" style={{ marginTop: 22 }}>
        {tiles.map((t) => (
          <StatTile key={t.label} {...t} />
        ))}
      </div>

      {liveExam && (
        <Card style={{ padding: 0, overflow: "hidden", marginTop: 16, border: "none" }}>
          <div style={{ background: "linear-gradient(120deg,#101433,#26327A)", padding: 22, color: "#fff", display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ flex: 1, minWidth: 260 }}>
              <div style={{ fontFamily: FM, fontSize: 12, color: "#AEB6E0", letterSpacing: ".1em", display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{ width: 7, height: 7, borderRadius: 999, background: "#5AD6B0", display: "inline-block" }} />
                EXAM IN PROGRESS
              </div>
              <div style={{ fontFamily: FD, fontWeight: 700, fontSize: 22, marginTop: 8 }}>{liveExam.title}</div>
              <div style={{ color: "#C4CBF0", fontSize: 14, marginTop: 3 }}>
                {liveExam.window} · {liveExam.audience}
              </div>
              <div style={{ marginTop: 14, maxWidth: 420 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#AEB6E0", marginBottom: 7 }}>
                  <span>{liveExam.attempted} of {liveExam.registered} started</span>
                  <span style={{ fontFamily: FM }}>{Math.round((liveExam.attempted / liveExam.registered) * 100)}%</span>
                </div>
                <ProgressBar value={(liveExam.attempted / liveExam.registered) * 100} color="#5AD6B0" track="rgba(255,255,255,.14)" />
              </div>
            </div>
            <button
              onClick={() => nav.openExam(liveExam.id)}
              style={{ background: goldGrad, color: "#3A2A00", border: "none", borderRadius: 11, padding: "11px 18px", fontFamily: FB, fontWeight: 600, fontSize: 14.5, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}
            >
              Watch live results <ArrowRight size={16} />
            </button>
          </div>
        </Card>
      )}

      <div className="ad-split-main" style={{ marginTop: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card style={{ padding: 0 }}>
            <CardHeader
              title="Submissions, last 14 days"
              subtitle="Coding, SQL, MCQ and non-tech submissions across the batch."
              action={<span style={{ fontFamily: FM, fontSize: 12, color: C.inkMute }}>hover a bar</span>}
            />
            <div style={{ padding: 18 }}>
              <ColumnChart
                data={ACTIVITY.map((a) => ({
                  label: a.label,
                  value: a.submissions,
                  caption: `${a.submissions} submissions · ${a.active} students`,
                }))}
                valueLabel={(v) => num(v)}
              />
            </div>
          </Card>

          <Card style={{ padding: 0 }}>
            <CardHeader
              title="Lab progress"
              subtitle="Weeks published to students, and how far the cohort has got."
              action={<Button variant="quiet" size="sm" onClick={() => nav.go("labs")}>Manage</Button>}
            />
            <div>
              {ADMIN_LABS.map((lab, i) => {
                const through = publishedThrough[lab.id] ?? lab.publishedThrough;
                const done = Math.round(
                  lab.weeks.slice(0, through).reduce((sum, w) => sum + w.passRate, 0) / Math.max(1, through),
                );
                return (
                  <button
                    key={lab.id}
                    onClick={() => nav.openLab(lab.id)}
                    className="ad-row"
                    style={{ width: "100%", textAlign: "left", border: "none", borderTop: i ? `1px solid ${C.line}` : "none", background: C.white, cursor: "pointer", padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }}
                  >
                    <span style={{ width: 40, height: 40, flex: "none", borderRadius: 11, background: tint(lab.accent, 12), color: lab.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <FlaskConical size={19} />
                    </span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: "block", fontFamily: FD, fontWeight: 600, fontSize: 15 }}>{lab.name.replace(" Lab", "")}</span>
                      <span style={{ display: "block", color: C.inkMute, fontSize: 12.5, marginTop: 2 }}>
                        {lab.code} · {lab.faculty} · week {through} of {lab.weeks.length} published
                      </span>
                      <span style={{ display: "block", marginTop: 9 }}>
                        <ProgressBar value={(through / lab.weeks.length) * 100} color={lab.accent} height={6} />
                      </span>
                    </span>
                    <span className="ad-hide-sm" style={{ width: 92, textAlign: "right" }}>
                      <span style={{ display: "block", fontFamily: FD, fontWeight: 700, fontSize: 17 }}>{done}%</span>
                      <span style={{ display: "block", fontSize: 11.5, color: C.inkMute }}>avg pass rate</span>
                    </span>
                    <ChevronRight size={17} color={C.inkMute} />
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card style={{ padding: 0 }}>
            <CardHeader title="Completion by branch" subtitle="Average across the three published labs." />
            <div style={{ padding: 18 }}>
              <BarList
                rows={BRANCH_STATS.map((b) => ({
                  label: b.branch,
                  value: b.completion,
                  caption: `${b.students} students`,
                }))}
                onPick={() => nav.go("students")}
              />
            </div>
          </Card>

          <Card style={{ padding: 0 }}>
            <CardHeader
              title="Chase list"
              subtitle="Longest inactive first."
              action={
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    nudge(AT_RISK.slice(0, 6).map((s) => s.id));
                    notify({ title: "Nudge sent to 6 students", sub: "An email and an in-app reminder went out.", tone: "good" });
                  }}
                >
                  Nudge top 6
                </Button>
              }
            />
            <div>
              {AT_RISK.slice(0, 6).map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => nav.openStudent(s.id)}
                  className="ad-row"
                  style={{ width: "100%", textAlign: "left", border: "none", borderTop: i ? `1px solid ${C.line}` : "none", background: C.white, cursor: "pointer", padding: "11px 16px", display: "flex", alignItems: "center", gap: 11 }}
                >
                  <Avatar name={s.name} size={32} />
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: "block", fontSize: 14, fontWeight: 600, color: C.ink }}>{s.name}</span>
                    <span style={{ display: "block", fontSize: 12.5, color: C.inkMute }}>
                      {s.section} · {completionOf(s)}% done · {s.lastActiveDays}d away
                    </span>
                  </span>
                  <RiskPill risk={s.risk} />
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div className="ad-grid-3" style={{ marginTop: 16 }}>
        {[
          { t: "Author a question", d: "Write an exercise with test cases", icon: PenSquare, c: C.violet, open: nav.openAuthoring },
          { t: "Schedule an exam", d: "Placement-style mock papers", icon: ClipboardList, c: C.goldDeep, open: () => nav.go("exams") },
          { t: "Run a report", d: "Filter, preview and download CSV", icon: FileSpreadsheet, c: C.royal, open: () => nav.go("reports") },
        ].map((q) => (
          <Card key={q.t} style={{ padding: 0 }} className="ad-card-lift">
            <button
              onClick={q.open}
              style={{ all: "unset", cursor: "pointer", display: "flex", alignItems: "center", gap: 14, width: "100%", padding: 18, boxSizing: "border-box" }}
            >
              <span style={{ width: 44, height: 44, flex: "none", borderRadius: 12, background: tint(q.c, 12), color: q.c, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <q.icon size={21} />
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontFamily: FD, fontWeight: 600, fontSize: 15.5 }}>{q.t}</span>
                <span style={{ display: "block", color: C.inkMute, fontSize: 13 }}>{q.d}</span>
              </span>
              <ChevronRight size={18} color={C.inkMute} />
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}
