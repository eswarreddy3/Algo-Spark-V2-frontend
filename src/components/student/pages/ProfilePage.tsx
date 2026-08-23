"use client";

import React, { useMemo } from "react";
import {
  Award, BookOpen, CalendarDays, Code2, Database, Flame, FlaskConical, Mail, Star, Target, Trophy, Zap,
} from "lucide-react";
import { C, FD, FM, blueGrad } from "../theme";
import { Card, Kicker, Pill, ProgressBar } from "../ui";
import { LABS } from "../labs/catalog";
import { useLabsProgress } from "../labs/progress";
import { PRACTICE_PROBLEMS } from "../data/problems";
import { useSolved } from "../data/solved";
import { useNav } from "../nav";

const STUDENT = {
  name: "Aditya Kumar",
  roll: "21CS042",
  section: "CSE-A",
  year: "3rd year",
  email: "21cs042@college.edu",
  joined: "Aug 2023",
  mentor: "Dr. Meera Raghavan",
};

/** 12 weeks of activity, most recent last. Values are tasks completed that day. */
const ACTIVITY: number[] = [
  0, 1, 2, 0, 3, 1, 0, 2, 4, 1, 0, 0, 2, 3, 1, 5, 2, 0, 1, 3, 4, 2, 0, 1,
  2, 5, 3, 1, 0, 2, 4, 3, 2, 1, 0, 3, 5, 4, 2, 1, 3, 2, 0, 4, 5, 3, 2, 4,
  1, 0, 2, 3, 5, 4, 3, 2, 1, 3, 4, 5, 3, 2, 4, 3, 5, 4, 2, 3, 4, 5, 3, 4,
  2, 3, 5, 4, 3, 2, 4, 5, 3, 4, 2, 5,
];

export function ProfilePage({ xp }: { xp: number }) {
  const { labStats, isComplete } = useLabsProgress();
  const { solved } = useSolved();
  const { go } = useNav();

  const labTotals = useMemo(
    () => LABS.map((lab) => ({ lab, stats: labStats(lab.id) })),
    [labStats],
  );
  const weeksDone = labTotals.reduce((n, l) => n + l.stats.completed, 0);
  const labPoints = labTotals.reduce((n, l) => n + l.stats.points, 0);
  const practicePoints = PRACTICE_PROBLEMS.filter((p) => solved.includes(p.exercise.id)).reduce(
    (n, p) => n + p.exercise.points,
    0,
  );

  const badges = [
    { t: "7-day streak", icon: Flame, c: C.red, earned: true, when: "2 Aug 2026" },
    { t: "First 50 solved", icon: Star, c: C.gold, earned: true, when: "18 Jul 2026" },
    { t: "SQL practitioner", icon: Database, c: C.cyan, earned: isComplete("cs-db", 2), when: "9 Aug 2026" },
    { t: "Lab finisher", icon: FlaskConical, c: C.violet, earned: weeksDone >= 8, when: weeksDone >= 8 ? "Today" : "" },
    { t: "Hard problem", icon: Code2, c: C.royal, earned: solved.some((id) => ["word-ladder", "median-two-arrays"].includes(id)), when: "" },
    { t: "Perfect quiz", icon: Target, c: C.green, earned: true, when: "14 Aug 2026" },
  ];

  return (
    <div>
      <Kicker>Profile</Kicker>

      <Card style={{ padding: 0, overflow: "hidden", marginTop: 12 }}>
        <div style={{ height: 96, background: blueGrad }} />
        <div style={{ padding: "0 24px 24px", marginTop: -38 }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 18, flexWrap: "wrap" }}>
            <div style={{ width: 88, height: 88, borderRadius: 999, background: "#fff", padding: 4, flex: "none" }}>
              <div style={{ width: "100%", height: "100%", borderRadius: 999, background: "linear-gradient(135deg,#101433,#26327A)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FD, fontWeight: 700, fontSize: 30 }}>
                AK
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 220, paddingBottom: 4 }}>
              <div style={{ fontFamily: FD, fontWeight: 700, fontSize: 24 }}>{STUDENT.name}</div>
              <div style={{ color: C.inkMute, fontSize: 14, marginTop: 2 }}>
                {STUDENT.section} · {STUDENT.year} · Roll {STUDENT.roll}
              </div>
            </div>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap", paddingBottom: 4 }}>
              <HeadStat label="Points" value={xp.toLocaleString()} />
              <HeadStat label="Rank" value="#9" />
              <HeadStat label="Weeks done" value={String(weeksDone)} />
              <HeadStat label="Streak" value="12d" />
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
            <Pill>
              <Mail size={11} style={{ display: "inline", marginRight: 5, verticalAlign: -1 }} />
              {STUDENT.email}
            </Pill>
            <Pill>
              <CalendarDays size={11} style={{ display: "inline", marginRight: 5, verticalAlign: -1 }} />
              Joined {STUDENT.joined}
            </Pill>
            <Pill>Mentor · {STUDENT.mentor}</Pill>
          </div>
        </div>
      </Card>

      <div className="as-split-main" style={{ marginTop: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card style={{ padding: 18 }}>
            <div style={{ fontFamily: FD, fontWeight: 600, fontSize: 16 }}>Lab progress</div>
            <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 14 }}>
              {labTotals.map(({ lab, stats }) => (
                <button
                  key={lab.id}
                  onClick={() => go("labs")}
                  style={{ all: "unset", cursor: "pointer", display: "block" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 6 }}>
                    <span style={{ fontWeight: 500 }}>{lab.name}</span>
                    <span style={{ fontFamily: FM, fontSize: 12.5, color: C.inkMute }}>
                      {stats.completed}/{stats.total} weeks · {stats.points} XP
                    </span>
                  </div>
                  <ProgressBar value={stats.percent} color={lab.accent} height={7} />
                </button>
              ))}
            </div>
          </Card>

          <Card style={{ padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
              <div style={{ fontFamily: FD, fontWeight: 600, fontSize: 16 }}>Activity</div>
              <div style={{ fontSize: 12.5, color: C.inkMute }}>Last 12 weeks</div>
            </div>
            <ActivityHeatmap />
          </Card>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card style={{ padding: 18 }}>
            <div style={{ fontFamily: FD, fontWeight: 600, fontSize: 16 }}>Points breakdown</div>
            <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 12 }}>
              <BreakdownRow icon={FlaskConical} label="Labs" value={labPoints} total={xp} color={C.royal} />
              <BreakdownRow icon={Code2} label="Practice" value={practicePoints} total={xp} color={C.violet} />
              <BreakdownRow icon={BookOpen} label="Non-tech" value={420} total={xp} color={C.cyan} />
              <BreakdownRow icon={Trophy} label="Exams" value={Math.max(0, xp - labPoints - practicePoints - 420)} total={xp} color={C.goldDeep} />
            </div>
          </Card>

          <Card style={{ padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: FD, fontWeight: 600, fontSize: 16 }}>
              <Award size={17} color={C.goldDeep} /> Badges
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(120px,1fr))", gap: 12, marginTop: 14 }}>
              {badges.map((b) => (
                <div
                  key={b.t}
                  title={b.earned ? `Earned ${b.when || "recently"}` : "Not earned yet"}
                  style={{ textAlign: "center", padding: 14, borderRadius: 14, border: `1px solid ${C.line}`, opacity: b.earned ? 1 : 0.45 }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 13, background: `${b.c}18`, color: b.c, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 9px" }}>
                    <b.icon size={22} />
                  </div>
                  <div style={{ fontFamily: FD, fontWeight: 600, fontSize: 13 }}>{b.t}</div>
                  <div style={{ fontFamily: FM, fontSize: 10.5, color: C.inkMute, marginTop: 3 }}>
                    {b.earned ? b.when || "earned" : "locked"}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function HeadStat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontFamily: FD, fontWeight: 700, fontSize: 20 }}>{value}</div>
      <div style={{ color: C.inkMute, fontSize: 12.5 }}>{label}</div>
    </div>
  );
}

function BreakdownRow({
  icon: Icon,
  label,
  value,
  total,
  color,
}: {
  icon: typeof Code2;
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const percent = total ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 14, marginBottom: 6 }}>
        <Icon size={15} color={color} />
        <span style={{ flex: 1 }}>{label}</span>
        <span style={{ fontFamily: FM, fontSize: 12.5, color: C.inkMute }}>
          {value.toLocaleString()} XP · {percent}%
        </span>
      </div>
      <ProgressBar value={percent} color={color} height={6} />
    </div>
  );
}

function ActivityHeatmap() {
  const levels = ["#EEF1FA", "#C9D6FB", "#8FB0F6", "#4F7FEE", "#2430D8"];
  const weeks = Math.ceil(ACTIVITY.length / 7);
  const totalTasks = ACTIVITY.reduce((a, b) => a + b, 0);
  const activeDays = ACTIVITY.filter((v) => v > 0).length;

  return (
    <div>
      <div style={{ display: "flex", gap: 4, marginTop: 14, overflowX: "auto", paddingBottom: 4 }}>
        {Array.from({ length: weeks }).map((_, w) => (
          <div key={w} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {Array.from({ length: 7 }).map((_, d) => {
              const value = ACTIVITY[w * 7 + d] ?? 0;
              return (
                <div
                  key={d}
                  title={`${value} task${value === 1 ? "" : "s"}`}
                  style={{ width: 14, height: 14, borderRadius: 4, background: levels[Math.min(levels.length - 1, value)] }}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
        <span style={{ fontSize: 13, color: C.inkSoft }}>
          <Zap size={13} style={{ display: "inline", marginRight: 5, verticalAlign: -2, color: C.goldDeep }} />
          {totalTasks} tasks across {activeDays} active days
        </span>
        <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: C.inkMute }}>
          less
          {levels.map((l) => (
            <span key={l} style={{ width: 12, height: 12, borderRadius: 3, background: l }} />
          ))}
          more
        </span>
      </div>
    </div>
  );
}
