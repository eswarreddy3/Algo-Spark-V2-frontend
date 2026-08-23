"use client";

import React, { useMemo } from "react";
import {
  ArrowRight, CalendarClock, CheckCircle2, ChevronRight, ClipboardCheck, Circle, Clock, Code2, Flame,
  FlaskConical, Lock, PenLine, Sparkles, Target, Trophy,
} from "lucide-react";
import { C, FB, FD, FM, blueGrad, goldGrad } from "../theme";
import { Card, H2, Kicker, Pill, ProgressBar, Serif } from "../ui";
import { LABS } from "../labs/catalog";
import { useLabsProgress } from "../labs/progress";
import { PRACTICE_PROBLEMS } from "../data/problems";
import { useSolved } from "../data/solved";
import { LEADERBOARDS } from "../data/leaderboard";
import { DIFF_COLOR } from "../labs/types";
import { useNav } from "../nav";

const PRIMARY_LAB = "cs-ds";

const SCHEDULE = [
  { when: "Today · 2:00 PM", what: "Data Structures Lab", where: "Lab 204", kind: "lab" as const },
  { when: "Today · 6:00 PM", what: "Placement Mock #4 closes", where: "90 min · 4 sections", kind: "exam" as const },
  { when: "Tomorrow · 10:00 AM", what: "Database Systems Lab", where: "Lab 108", kind: "lab" as const },
];

export function DashboardPage({ xp }: { xp: number }) {
  const { go, openLabWeek, openProblem } = useNav();
  const { currentWeek, weekProgress, labStats, isComplete } = useLabsProgress();
  const { isSolved } = useSolved();

  const lab = LABS.find((l) => l.id === PRIMARY_LAB) as (typeof LABS)[number];
  const week = currentWeek(lab.id);
  const weekDef = lab.weeks.find((w) => w.n === week);
  const progress = weekProgress(lab.id, week);
  const stats = labStats(lab.id);

  const remaining = [
    !progress.material && "material",
    !progress.mcq?.passed && "MCQs",
    weekDef?.exercise && !progress.code && "the coding task",
  ].filter(Boolean) as string[];

  const solvedCount = PRACTICE_PROBLEMS.filter((p) => isSolved(p.exercise.id)).length;
  const nextProblem = useMemo(
    () => PRACTICE_PROBLEMS.find((p) => !isSolved(p.exercise.id)),
    [isSolved],
  );

  const board = LEADERBOARDS.Section;
  const you = board.find((r) => r.you);

  const tiles = [
    { icon: Sparkles, label: "Points", value: xp.toLocaleString(), sub: "+150 this week", color: C.royal, bg: "rgba(47,91,240,.1)", onClick: () => go("profile") },
    { icon: Trophy, label: "Section rank", value: `#${you?.rank ?? 9}`, sub: you && you.delta > 0 ? `up ${you.delta} places` : "holding steady", color: C.goldDeep, bg: "#FFF4E0", onClick: () => go("leaderboard") },
    { icon: Flame, label: "Streak", value: "12 days", sub: "keep it alive today", color: C.red, bg: C.redBg, onClick: () => go("profile") },
    { icon: CheckCircle2, label: "Problems solved", value: `${solvedCount}/${PRACTICE_PROBLEMS.length}`, sub: "practice bank", color: C.green, bg: C.greenBg, onClick: () => go("tech") },
  ];

  return (
    <div>
      <Kicker>Welcome back</Kicker>
      <H2 style={{ fontSize: 32 }}>
        Good morning, <Serif>Aditya.</Serif>
      </H2>
      <p style={{ color: C.inkSoft, marginTop: 8, fontSize: 16 }}>
        {remaining.length
          ? `Week ${week} of ${lab.name.replace(" Lab", "")} needs ${listOf(remaining)}. That unlocks week ${week + 1}.`
          : "Every published week is done. Nice work — try a practice problem to keep the streak alive."}
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

      <div className="as-split-main" style={{ marginTop: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ background: "linear-gradient(120deg,#101433,#26327A)", padding: 22, color: "#fff" }}>
            <div style={{ fontFamily: FM, fontSize: 12, color: "#AEB6E0", letterSpacing: ".1em" }}>CONTINUE WHERE YOU LEFT OFF</div>
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
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <StepChip label="Material" done={progress.material} />
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
        {nextProblem ? (
          <Card style={{ padding: 18, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ width: 46, height: 46, borderRadius: 13, background: "rgba(139,124,232,.14)", color: C.violet, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
              <Target size={22} />
            </div>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ fontFamily: FM, fontSize: 11.5, color: C.inkMute, letterSpacing: ".1em" }}>RECOMMENDED PRACTICE</div>
              <div style={{ fontFamily: FD, fontWeight: 600, fontSize: 17, marginTop: 4 }}>{nextProblem.exercise.title}</div>
              <div style={{ display: "flex", gap: 7, marginTop: 8, flexWrap: "wrap" }}>
                <Pill color={DIFF_COLOR[nextProblem.exercise.difficulty]} bg={`${DIFF_COLOR[nextProblem.exercise.difficulty]}18`}>
                  {nextProblem.exercise.difficulty}
                </Pill>
                {nextProblem.tags.map((t) => (
                  <Pill key={t}>{t}</Pill>
                ))}
                <Pill color={C.blue} bg="rgba(47,91,240,.07)">
                  asked at {nextProblem.companies[0]}
                </Pill>
              </div>
            </div>
            <button
              onClick={() => openProblem(nextProblem.exercise.id)}
              style={{ border: "none", background: blueGrad, color: "#fff", borderRadius: 12, padding: "12px 20px", fontFamily: FB, fontWeight: 600, fontSize: 14.5, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
            >
              Solve it <ArrowRight size={16} />
            </button>
          </Card>
        ) : (
          <Card style={{ padding: 18 }}>
            <div style={{ fontFamily: FD, fontWeight: 600, fontSize: 16 }}>Practice bank cleared</div>
            <p style={{ color: C.inkMute, fontSize: 14, marginTop: 6 }}>Every problem is solved. New sets are added each fortnight.</p>
          </Card>
        )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card style={{ padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: FD, fontWeight: 600, fontSize: 16 }}>
              <CalendarClock size={17} color={C.royal} /> Up next
            </div>
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
              {SCHEDULE.map((s) => (
                <button
                  key={s.what}
                  onClick={() => go(s.kind === "exam" ? "exam" : "labs")}
                  className="as-row"
                  style={{ textAlign: "left", border: `1px solid ${C.line}`, background: "#fff", borderRadius: 12, padding: "11px 13px", cursor: "pointer", display: "flex", gap: 11, alignItems: "center" }}
                >
                  <span style={{ width: 34, height: 34, flex: "none", borderRadius: 10, background: s.kind === "exam" ? "#FFF4E0" : "rgba(47,91,240,.08)", color: s.kind === "exam" ? C.goldDeep : C.royal, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {s.kind === "exam" ? <ClipboardCheck size={17} /> : <FlaskConical size={17} />}
                  </span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: "block", fontSize: 14, fontWeight: 600 }}>{s.what}</span>
                    <span style={{ display: "block", fontSize: 12.5, color: C.inkMute, marginTop: 2 }}>
                      {s.when} · {s.where}
                    </span>
                  </span>
                  <ChevronRight size={16} color={C.inkMute} />
                </button>
              ))}
            </div>
          </Card>

          <Card style={{ padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ fontFamily: FD, fontWeight: 600, fontSize: 16 }}>Section leaderboard</div>
              <button onClick={() => go("leaderboard")} style={{ border: "none", background: "none", color: C.blue, fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: FB }}>
                View all
              </button>
            </div>
            {board.slice(0, 5).map((r, i) => (
              <div key={r.name} style={{ display: "flex", alignItems: "center", gap: 11, padding: "8px 0", borderTop: i ? `1px solid ${C.line}` : "none" }}>
                <div style={{ width: 22, fontFamily: FD, fontWeight: 700, color: r.rank <= 3 ? C.goldDeep : C.inkMute, fontSize: 14 }}>{r.rank}</div>
                <div style={{ width: 30, height: 30, borderRadius: 999, background: r.you ? blueGrad : C.cream, color: r.you ? "#fff" : C.inkSoft, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600 }}>
                  {r.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                </div>
                <div style={{ flex: 1, fontSize: 14, fontWeight: r.you ? 600 : 500, color: r.you ? C.royal : C.ink }}>{r.name}</div>
                <div style={{ fontFamily: FM, fontSize: 13, color: C.inkSoft }}>{r.points.toLocaleString()}</div>
              </div>
            ))}
          </Card>
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
                  <div style={{ width: 40, height: 40, borderRadius: 11, background: `${l.accent}18`, color: l.accent, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                    <FlaskConical size={19} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: FD, fontWeight: 600, fontSize: 15 }}>{l.name.replace(" Lab", "")}</div>
                    <div style={{ color: C.inkMute, fontSize: 12.5, fontFamily: FM }}>{l.code}</div>
                  </div>
                  <Pill color={l.accent} bg={`${l.accent}14`}>
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
          { t: "Tech practice", d: "Coding, SQL and playground", icon: Code2, c: C.royal, v: "tech" as const },
          { t: "Non-tech skills", d: "Email, reading and aptitude", icon: PenLine, c: C.cyan, v: "nontech" as const },
          { t: "Take an exam", d: "Placement-style mock paper", icon: ClipboardCheck, c: C.goldDeep, v: "exam" as const },
        ].map((q) => (
          <Card key={q.t} style={{ padding: 0 }} className="as-card-lift">
            <button
              onClick={() => go(q.v)}
              style={{ all: "unset", cursor: "pointer", display: "flex", alignItems: "center", gap: 14, width: "100%", padding: 18, boxSizing: "border-box" }}
            >
              <span style={{ width: 44, height: 44, flex: "none", borderRadius: 12, background: `${q.c}18`, color: q.c, display: "flex", alignItems: "center", justifyContent: "center" }}>
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
