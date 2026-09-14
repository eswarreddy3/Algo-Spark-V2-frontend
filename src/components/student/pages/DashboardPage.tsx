"use client";

import React, { useMemo } from "react";
import {
  ArrowRight, BookOpen, BrainCircuit, CalendarClock, CheckCircle2, ChevronRight, ClipboardCheck, Circle, Clock, Code2, FileText, Flame,
  FlaskConical, Lock, Mail, PenLine, PieChart, Sparkles, Target, Trophy,
} from "lucide-react";
import { C, FB, FD, FM, blueGrad, goldGrad, tint } from "../theme";
import { Card, H2, Kicker, Pill, ProgressBar, Serif } from "../ui";
import { LABS } from "../labs/catalog";
import { useLabsProgress } from "../labs/progress";
import { ALL_COURSES } from "../courses/catalog";
import { useCourseProgress } from "../courses/progress";
import { liveRank } from "../data/leaderboard";
import { EXAM_LISTINGS } from "../data/exam";
import { STUDENT } from "../data/student";
import { usePerformance, type Activity } from "../data/performance";
import { useNav } from "../nav";
import { relativeTime, useNow } from "../useNow";
import { useCoach, useOpenTarget } from "../coach/useCoach";
import { BAND_COLOR, PlanItemRow, ReadinessRing } from "../coach/widgets";

const PRIMARY_LAB = "cs-ds";

const ACTIVITY_ICON: Record<Activity["kind"], { icon: typeof Code2; color: string }> = {
  lab: { icon: FlaskConical, color: C.royal },
  course: { icon: BookOpen, color: C.cyan },
  code: { icon: Code2, color: C.violet },
  exam: { icon: ClipboardCheck, color: C.goldDeep },
  email: { icon: Mail, color: C.cyan },
  reading: { icon: FileText, color: C.goldDeep },
};

export function DashboardPage({ xp }: { xp: number }) {
  const { go, openLabWeek } = useNav();
  const { currentWeek, weekProgress, labStats, isComplete } = useLabsProgress();
  const { courseStats } = useCourseProgress();
  const { activity, exams, streak } = usePerformance();

  const lab = LABS.find((l) => l.id === PRIMARY_LAB) as (typeof LABS)[number];
  const week = currentWeek(lab.id);
  const weekDef = lab.weeks.find((w) => w.n === week);
  const progress = weekProgress(lab.id, week);
  const stats = labStats(lab.id);

  const remaining = [
    !progress.material && "the PPT",
    !progress.mcq?.passed && "MCQs",
    weekDef?.exercise && !progress.code && "the coding task",
  ].filter(Boolean) as string[];

  // Overall completion: every lab week and course topic mapped to the student.
  const completion = useMemo(() => {
    const labTotals = LABS.map((l) => labStats(l.id));
    const courseTotals = ALL_COURSES.map((c) => courseStats(c));
    const done = [...labTotals, ...courseTotals].reduce((n, s) => n + s.completed, 0);
    const total = [...labTotals, ...courseTotals].reduce((n, s) => n + s.total, 0);
    return {
      percent: total ? Math.round((done / total) * 100) : 0,
      labs: labTotals.reduce((n, s) => n + s.completed, 0),
      labsTotal: labTotals.reduce((n, s) => n + s.total, 0),
      topics: courseTotals.reduce((n, s) => n + s.completed, 0),
      topicsTotal: courseTotals.reduce((n, s) => n + s.total, 0),
    };
  }, [labStats, courseStats]);

  const collegeRank = liveRank("College", xp);
  const sectionRank = liveRank("Section", xp);
  const upcoming = EXAM_LISTINGS.filter((e) => !exams.some((r) => r.examId === e.id));

  const tiles = [
    { icon: PieChart, label: "Overall completion", value: `${completion.percent}%`, sub: `${completion.labs}/${completion.labsTotal} lab weeks · ${completion.topics}/${completion.topicsTotal} topics`, color: C.cyan, bg: tint(C.cyan, 12), onClick: () => go("labs") },
    { icon: Trophy, label: "College rank", value: `#${collegeRank}`, sub: `#${sectionRank} in ${STUDENT.section}`, color: C.goldDeep, bg: C.warnBg, onClick: () => go("leaderboard") },
    { icon: Sparkles, label: "Points", value: xp.toLocaleString(), sub: "labs + coding + exams", color: C.royal, bg: tint(C.royal, 12), onClick: () => go("profile") },
    { icon: Flame, label: "Streak", value: `${streak} day${streak === 1 ? "" : "s"}`, sub: "consecutive active days", color: C.red, bg: C.redBg, onClick: () => go("profile") },
  ];

  return (
    <div>
      <Kicker>Welcome back</Kicker>
      <H2 style={{ fontSize: 32 }}>
        Good morning, <Serif>{STUDENT.firstName}.</Serif>
      </H2>
      <p style={{ color: C.inkSoft, marginTop: 8, fontSize: 16 }}>
        {remaining.length
          ? `Week ${week} of ${lab.name.replace(" Lab", "")} needs ${listOf(remaining)}. That unlocks week ${week + 1}.`
          : "Every week with content is done. Nice work — try a practice problem to keep the streak alive."}
      </p>

      <div className="as-grid-4" style={{ marginTop: 22 }}>
        {tiles.map((t) => (
          <Card key={t.label} style={{ padding: 0 }} className="as-card-lift">
            <button onClick={t.onClick} style={{ all: "unset", cursor: "pointer", display: "block", width: "100%", padding: 18, boxSizing: "border-box" }}>
              <div style={{ width: 40, height: 40, borderRadius: 11, background: t.bg, color: t.color, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                <t.icon size={20} />
              </div>
              <div style={{ fontFamily: FD, fontWeight: 700, fontSize: 24 }}>{t.value}</div>
              <div style={{ color: C.inkMute, fontSize: 13.5 }}>{t.label}</div>
              <div style={{ color: t.color, fontSize: 12.5, marginTop: 6, fontFamily: FM }}>{t.sub}</div>
            </button>
          </Card>
        ))}
      </div>

      {/* Columns stretch to equal height and their last card fills the rest, so the bottoms line up. */}
      <div className="as-split-main" style={{ marginTop: 16, alignItems: "stretch" }}>
        <div className="as-fill-last" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ background: "linear-gradient(120deg,#101433,#26327A)", padding: 22, color: "#fff" }}>
              <div style={{ fontFamily: FM, fontSize: 12, color: "#AEB6E0", letterSpacing: ".1em" }}>CURRENT WEEK · CONTINUE WHERE YOU LEFT OFF</div>
              <div style={{ fontFamily: FD, fontWeight: 700, fontSize: 22, marginTop: 8 }}>
                {lab.name.replace(" Lab", "")} · Week {week}
              </div>
              <div style={{ color: "#C4CBF0", fontSize: 14, marginTop: 3 }}>
                {weekDef?.title}
                {remaining.length ? ` — ${listOf(remaining)} left` : " — completed"}
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
                <button
                  onClick={() => openLabWeek(lab.id, week)}
                  style={{ background: goldGrad, color: "#3A2A00", border: "none", borderRadius: 11, padding: "11px 18px", fontFamily: FB, fontWeight: 600, fontSize: 14.5, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}
                >
                  Resume week <ArrowRight size={16} />
                </button>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <StepChip label="PPT" done={progress.material} />
                  <StepChip label="MCQs" done={Boolean(progress.mcq?.passed)} />
                  {weekDef?.exercise && <StepChip label="Code" done={progress.code} />}
                </div>
              </div>
            </div>
            <div style={{ padding: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: C.inkMute, marginBottom: 10 }}>
                <span>{lab.code} progress</span>
                <span style={{ fontFamily: FM }}>{stats.percent}%</span>
              </div>
              <WeekRail labId={lab.id} weeks={lab.weeks.length} current={week} isComplete={isComplete} onPick={(w) => openLabWeek(lab.id, w)} />
            </div>
          </Card>

          <CoachCard />
        </div>

        <div className="as-fill-last" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card style={{ padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: FD, fontWeight: 600, fontSize: 16 }}>
                <CalendarClock size={17} color={C.royal} /> Upcoming exams
              </div>
              <button onClick={() => go("exam")} style={linkButton}>All exams</button>
            </div>
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
              {upcoming.length ? (
                upcoming.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => go("exam")}
                    className="as-row"
                    style={{ textAlign: "left", border: `1px solid ${C.line}`, background: C.white, borderRadius: 12, padding: "11px 13px", cursor: "pointer", display: "flex", gap: 11, alignItems: "center" }}
                  >
                    <span style={{ width: 34, height: 34, flex: "none", borderRadius: 10, background: e.status === "open" ? C.warnBg : C.cream, color: e.status === "open" ? C.goldDeep : C.inkMute, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <ClipboardCheck size={17} />
                    </span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: "block", fontSize: 14, fontWeight: 600, color: C.ink }}>{e.title}</span>
                      <span style={{ display: "block", fontSize: 12.5, color: C.inkMute, marginTop: 2 }}>
                        {e.when} · {e.minutes} min
                      </span>
                    </span>
                    {e.status === "open" && <Pill color={C.goldDeep} bg={C.warnBg}>open</Pill>}
                    <ChevronRight size={16} color={C.inkMute} />
                  </button>
                ))
              ) : (
                <div style={{ fontSize: 13.5, color: C.inkMute }}>No exams scheduled for your cohort right now.</div>
              )}
            </div>
          </Card>

          <RecentActivity activity={activity} onOpenProfile={() => go("profile")} />
        </div>
      </div>

      <div className="as-grid-3" style={{ marginTop: 16 }}>
        {LABS.map((l) => {
          const s = labStats(l.id);
          const w = currentWeek(l.id);
          return (
            <Card key={l.id} style={{ padding: 0 }} className="as-card-lift">
              <button onClick={() => openLabWeek(l.id, w)} style={{ all: "unset", cursor: "pointer", display: "block", width: "100%", padding: 18, boxSizing: "border-box" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 11, background: tint(l.accent, 10), color: l.accent, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                    <FlaskConical size={19} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: FD, fontWeight: 600, fontSize: 15 }}>{l.name.replace(" Lab", "")}</div>
                    <div style={{ color: C.inkMute, fontSize: 12.5, fontFamily: FM }}>{l.code}</div>
                  </div>
                  <Pill color={l.accent} bg={tint(l.accent, 8)}>
                    {s.percent}%
                  </Pill>
                </div>
                <div style={{ marginTop: 12, fontSize: 13, color: C.inkSoft }}>
                  Week {w} · {l.weeks.find((x) => x.n === w)?.title}
                </div>
                <div style={{ marginTop: 10 }}>
                  <ProgressBar value={s.percent} color={l.accent} height={6} />
                </div>
              </button>
            </Card>
          );
        })}
      </div>

      <div className="as-grid-3" style={{ marginTop: 16 }}>
        {[
          { t: "Tech practice", d: "Coding, courses and compilers", icon: Code2, c: C.royal, v: "tech" as const },
          { t: "Non-tech skills", d: "Email, reading and courses", icon: PenLine, c: C.cyan, v: "nontech" as const },
          { t: "Take an exam", d: "Placement-style mock paper", icon: ClipboardCheck, c: C.goldDeep, v: "exam" as const },
        ].map((q) => (
          <Card key={q.t} style={{ padding: 0 }} className="as-card-lift">
            <button
              onClick={() => go(q.v)}
              style={{ all: "unset", cursor: "pointer", display: "flex", alignItems: "center", gap: 14, width: "100%", padding: 18, boxSizing: "border-box" }}
            >
              <span style={{ width: 44, height: 44, flex: "none", borderRadius: 12, background: tint(q.c, 10), color: q.c, display: "flex", alignItems: "center", justifyContent: "center" }}>
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

const linkButton: React.CSSProperties = { border: "none", background: "none", color: C.blue, fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: FB };

/** The AI Prep Coach on the dashboard: readiness, today's focus and this week — not the full plan. */
function CoachCard() {
  const { go } = useNav();
  const openTarget = useOpenTarget();
  const { readiness, weak, plan, goal } = useCoach();
  const color = BAND_COLOR[readiness.band.tone];
  const week = plan?.thisWeek;
  const done = week ? week.items.filter((i) => i.done).length : 0;
  const total = week?.items.length ?? 0;

  return (
    <Card style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "16px 18px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", borderBottom: `1px solid ${C.line}` }}>
        <ReadinessRing score={readiness.score} color={color} size={78} stroke={8} />
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ fontFamily: FM, fontSize: 11.5, color: C.inkMute, letterSpacing: ".1em", display: "flex", alignItems: "center", gap: 6 }}>
            <BrainCircuit size={13} color={C.violet} /> AI PREP COACH
          </div>
          <div style={{ fontFamily: FD, fontWeight: 700, fontSize: 18, marginTop: 3 }}>
            Readiness · <span style={{ color }}>{readiness.band.label}</span>
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 7, flexWrap: "wrap" }}>
            {weak.slice(0, 3).map((a) => (
              <Pill key={a.id} color={a.status === "weak" ? C.red : C.goldDeep} bg={a.status === "weak" ? C.redBg : C.warnBg}>
                {a.label} {a.score ?? ""}
              </Pill>
            ))}
          </div>
        </div>
        <button onClick={() => go("coach")} style={linkButton}>
          Open coach
        </button>
      </div>

      {goal && plan ? (
        <>
          <div style={{ padding: "12px 18px 4px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <span style={{ fontFamily: FD, fontWeight: 600, fontSize: 15 }}>Today&apos;s focus</span>
            <span style={{ marginLeft: "auto", fontSize: 12.5, color: C.inkMute }}>
              This week · {done}/{total} done · plan week {plan.currentWeek} of {plan.totalWeeks}
            </span>
          </div>
          <div style={{ padding: "0 18px 6px" }}>
            <ProgressBar value={total ? (done / total) * 100 : 0} height={5} />
          </div>
          <div style={{ margin: "8px 18px 16px", border: `1px solid ${C.line}`, borderRadius: 12, overflow: "hidden" }}>
            {plan.todaysFocus.length ? (
              plan.todaysFocus.map((item, i) => <PlanItemRow key={item.id} item={item} first={i === 0} onOpen={() => openTarget(item.target)} />)
            ) : (
              <div style={{ padding: 16, fontSize: 13.5, color: C.inkMute }}>
                {total && done === total ? "This week's plan is complete. Nice work." : "Everything left this week is waiting on a locked lab week."}
              </div>
            )}
          </div>
        </>
      ) : (
        // Centred empty state: when the card stretches to match the column beside it, the prompt fills the space.
        <div style={{ flex: 1, padding: "22px 18px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, textAlign: "center" }}>
          <span style={{ width: 46, height: 46, borderRadius: 14, background: tint(C.violet, 10), color: C.violet, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Target size={22} />
          </span>
          <p style={{ maxWidth: 420, margin: 0, fontSize: 14, color: C.inkSoft, lineHeight: 1.55 }}>
            Pick your target companies and a timeline, and the coach turns your gaps into a week-by-week plan with a daily focus.
          </p>
          <button
            onClick={() => go("coach")}
            style={{ background: blueGrad, color: "#fff", border: "none", borderRadius: 11, padding: "10px 16px", fontFamily: FB, fontWeight: 600, fontSize: 14, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 7 }}
          >
            Set my goal <ArrowRight size={15} />
          </button>
        </div>
      )}
    </Card>
  );
}

function RecentActivity({ activity, onOpenProfile }: { activity: Activity[]; onOpenProfile: () => void }) {
  const now = useNow();
  return (
    <Card style={{ padding: 18 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <div style={{ fontFamily: FD, fontWeight: 600, fontSize: 16 }}>Recent activity</div>
        <button onClick={onOpenProfile} style={linkButton}>Profile</button>
      </div>
      {activity.slice(0, 6).map((a, i) => {
        const meta = ACTIVITY_ICON[a.kind];
        const when = a.at !== undefined ? relativeTime(a.at, now) : a.daysAgo === 1 ? "Yesterday" : `${a.daysAgo} days ago`;
        return (
          <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 11, padding: "9px 0", borderTop: i ? `1px solid ${C.line}` : "none" }}>
            <span style={{ width: 30, height: 30, flex: "none", borderRadius: 9, background: tint(meta.color, 10), color: meta.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <meta.icon size={15} />
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: "block", fontSize: 13.5, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.title}</span>
              <span style={{ display: "block", fontSize: 12, color: C.inkMute }}>
                {a.detail}
                {when ? ` · ${when}` : ""}
              </span>
            </span>
            {a.points > 0 && <span style={{ fontFamily: FM, fontSize: 12, color: C.goldDeep }}>+{a.points}</span>}
          </div>
        );
      })}
    </Card>
  );
}

function listOf(items: string[]) {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

function StepChip({ label, done }: { label: string; done: boolean }) {
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 999, padding: "6px 11px",
        background: done ? "rgba(90,214,176,.16)" : "rgba(255,255,255,.08)",
        color: done ? "#5AD6B0" : "#C4CBF0", fontFamily: FM, fontSize: 11.5,
      }}
    >
      {done ? <CheckCircle2 size={12} /> : <Clock size={12} />} {label}
    </span>
  );
}

function WeekRail({
  labId,
  weeks,
  current,
  isComplete,
  onPick,
}: {
  labId: string;
  weeks: number;
  current: number;
  isComplete: (labId: string, week: number) => boolean;
  onPick: (week: number) => void;
}) {
  return (
    // Twelve dots plus connectors do not fit a phone; let the rail scroll.
    <div style={{ display: "flex", alignItems: "center", gap: 4, overflowX: "auto", paddingBottom: 4 }}>
      {Array.from({ length: weeks }).map((_, i) => {
        const w = i + 1;
        const done = isComplete(labId, w);
        const cur = w === current;
        const locked = w > current;
        return (
          <React.Fragment key={w}>
            <button
              onClick={() => !locked && onPick(w)}
              disabled={locked}
              title={`Week ${w}${locked ? " · locked" : done ? " · complete" : " · current"}`}
              aria-label={`Week ${w}`}
              style={{
                width: 26, height: 26, borderRadius: 999, flex: "none", border: "none", padding: 0,
                cursor: locked ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                background: done ? blueGrad : cur ? goldGrad : C.cream,
                color: done ? "#fff" : cur ? "#3A2A00" : C.inkMute,
              }}
            >
              {done ? <CheckCircle2 size={14} /> : cur ? <Circle size={9} fill="#3A2A00" /> : <Lock size={11} />}
            </button>
            {w < weeks && <div style={{ flex: 1, height: 3, borderRadius: 3, background: done ? C.royal : C.line }} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}
