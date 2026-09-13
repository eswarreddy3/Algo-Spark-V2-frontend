"use client";

import React, { useEffect, useMemo, useRef } from "react";
import {
  BookOpen, CalendarClock, CheckCircle2, ChevronLeft, Circle, Clock, ListChecks,
  Lock, MapPin, Play, Terminal, User2,
} from "lucide-react";
import "./labs.css";
import { C, FB, FD, FM, tint } from "../theme";
import { Card, Kicker, Pill, ProgressBar } from "../ui";
import { CodePanel } from "./CodePanel";
import { MaterialPanel } from "./MaterialPanel";
import { McqPanel } from "./McqPanel";
import { useLabsProgress } from "./progress";
import type { Lab, Week } from "./types";

export type WeekTab = "material" | "quiz" | "code";

const TABS: { id: WeekTab; label: string; icon: typeof BookOpen }[] = [
  { id: "material", label: "Material", icon: BookOpen },
  { id: "quiz", label: "MCQs", icon: ListChecks },
  { id: "code", label: "Coding exercise", icon: Terminal },
];

export function LabWorkspace({
  lab,
  week,
  tab,
  onSelectWeek,
  onSelectTab,
  onBack,
}: {
  lab: Lab;
  week: number;
  tab: WeekTab;
  onSelectWeek: (week: number) => void;
  onSelectTab: (tab: WeekTab) => void;
  onBack: () => void;
}) {
  const { weekProgress, currentWeek, isUnlocked, isComplete, labStats, markMaterial, submitMcq, markCode } = useLabsProgress();

  const stats = labStats(lab.id);
  const active = useMemo(() => lab.weeks.find((w) => w.n === week) ?? lab.weeks[0], [lab.weeks, week]);
  const progress = weekProgress(lab.id, active.n);
  const unlocked = isUnlocked(lab.id, active.n);
  const completed = isComplete(lab.id, active.n);

  return (
    <div>
      <button
        onClick={onBack}
        style={{ border: "none", background: "none", color: C.inkSoft, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: FB, fontSize: 14, fontWeight: 600, padding: 0 }}
      >
        <ChevronLeft size={17} /> All labs
      </button>

      <Card style={{ padding: 20, marginTop: 12, display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 260 }}>
          <Kicker>{lab.code} · {lab.semester}</Kicker>
          <div style={{ fontFamily: FD, fontWeight: 700, fontSize: 24, marginTop: 4 }}>{lab.name}</div>
          <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            <Pill><User2 size={11} style={{ display: "inline", marginRight: 5, verticalAlign: -1 }} />{lab.faculty}</Pill>
            <Pill><CalendarClock size={11} style={{ display: "inline", marginRight: 5, verticalAlign: -1 }} />{lab.schedule}</Pill>
            <Pill><MapPin size={11} style={{ display: "inline", marginRight: 5, verticalAlign: -1 }} />{lab.room}</Pill>
          </div>
        </div>
        <div style={{ minWidth: 230 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: C.inkMute, marginBottom: 7 }}>
            <span>{stats.completed} of {stats.total} weeks complete</span>
            <span style={{ fontFamily: FM, color: lab.accent, fontWeight: 600 }}>{stats.percent}%</span>
          </div>
          <ProgressBar value={stats.percent} color={lab.accent} height={8} />
          <div style={{ fontFamily: FM, fontSize: 12, color: C.inkMute, marginTop: 8 }}>{stats.points} XP earned in this lab</div>
        </div>
      </Card>

      <div className="as-workspace" style={{ marginTop: 16 }}>
        {/* week rail */}
        <Card style={{ padding: 10, position: "sticky", top: 82 }} className="as-week-rail">
          <div style={{ fontFamily: FM, fontSize: 11, letterSpacing: ".12em", color: C.inkMute, padding: "8px 10px 10px" }}>
            WEEKS · MODULES
          </div>
          <div className="as-week-list" style={{ display: "flex", flexDirection: "column", gap: 2, maxHeight: "calc(100vh - 260px)", overflowY: "auto" }}>
            {lab.weeks.map((w) => (
              <WeekRailItem
                key={w.n}
                week={w}
                accent={lab.accent}
                active={w.n === active.n}
                unlocked={isUnlocked(lab.id, w.n)}
                completed={isComplete(lab.id, w.n)}
                current={currentWeek(lab.id) === w.n}
                onSelect={() => onSelectWeek(w.n)}
              />
            ))}
          </div>
        </Card>

        {/* week content */}
        <div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 260 }}>
              <Kicker>Week {active.n}</Kicker>
              <div style={{ fontFamily: FD, fontWeight: 700, fontSize: 26, letterSpacing: "-.02em", marginTop: 4 }}>{active.title}</div>
              <p style={{ color: C.inkSoft, fontSize: 15, marginTop: 6, maxWidth: 640 }}>{active.summary}</p>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", paddingTop: 22 }}>
              {completed ? (
                <Pill color={C.green} bg={C.greenBg}>
                  <CheckCircle2 size={11} style={{ display: "inline", marginRight: 5, verticalAlign: -1 }} />completed
                </Pill>
              ) : (
                <Pill color={C.goldDeep} bg={C.warnBg}>{active.points} XP on completion</Pill>
              )}
            </div>
          </div>

          {!unlocked ? (
            <LockedNotice week={active} />
          ) : !active.published ? (
            <UnpublishedNotice week={active} />
          ) : (
            <>
              <div style={{ display: "flex", gap: 6, marginTop: 20, borderBottom: `1px solid ${C.line}`, flexWrap: "wrap" }}>
                {TABS.map((t) => {
                  const isDone =
                    t.id === "material" ? progress.material : t.id === "quiz" ? Boolean(progress.mcq?.passed) : progress.code;
                  const disabled = t.id === "code" && !active.exercise;
                  return (
                    <button
                      key={t.id}
                      onClick={() => !disabled && onSelectTab(t.id)}
                      disabled={disabled}
                      style={{
                        border: "none",
                        background: "none",
                        cursor: disabled ? "not-allowed" : "pointer",
                        padding: "12px 14px",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontFamily: FB,
                        fontWeight: 600,
                        fontSize: 14.5,
                        opacity: disabled ? 0.45 : 1,
                        color: tab === t.id ? C.royal : C.inkMute,
                        borderBottom: `2.5px solid ${tab === t.id ? C.royal : "transparent"}`,
                        marginBottom: -1,
                      }}
                    >
                      <t.icon size={17} /> {t.label}
                      {isDone && <CheckCircle2 size={15} color={C.green} />}
                    </button>
                  );
                })}
              </div>

              <div style={{ marginTop: 20 }}>
                {tab === "material" && (
                  <MaterialPanel
                    key={`${lab.id}-${active.n}-material`}
                    week={active}
                    done={progress.material}
                    onComplete={() => markMaterial(lab.id, active.n)}
                  />
                )}
                {tab === "quiz" && (
                  <McqPanel
                    key={`${lab.id}-${active.n}-quiz`}
                    mcqs={active.mcqs}
                    passRatio={active.mcqPassRatio}
                    previous={progress.mcq}
                    onSubmit={(score, total, passed) => submitMcq(lab.id, active.n, score, total, passed)}
                  />
                )}
                {tab === "code" && active.exercise && (
                  <CodePanel
                    key={active.exercise.id}
                    exercise={active.exercise}
                    solved={progress.code}
                    onSolved={() => markCode(lab.id, active.n)}
                  />
                )}
              </div>

              <ChecklistFooter
                material={progress.material}
                quiz={Boolean(progress.mcq?.passed)}
                code={progress.code}
                needsCode={Boolean(active.exercise)}
                completed={completed}
                weekNumber={active.n}
                onJump={onSelectTab}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function WeekRailItem({
  week,
  accent,
  active,
  unlocked,
  completed,
  current,
  onSelect,
}: {
  week: Week;
  accent: string;
  active: boolean;
  unlocked: boolean;
  completed: boolean;
  current: boolean;
  onSelect: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);

  // Keep the open week visible when the rail scrolls (and when it is a
  // horizontal strip on narrow screens).
  useEffect(() => {
    if (active) ref.current?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [active]);

  const locked = !unlocked;
  const icon = completed ? (
    <CheckCircle2 size={15} color={C.green} />
  ) : locked ? (
    <Lock size={13} color={C.inkMute} />
  ) : current ? (
    <Play size={12} color="#3A2A00" />
  ) : (
    <Circle size={11} color={C.inkMute} />
  );

  return (
    <button
      ref={ref}
      onClick={onSelect}
      disabled={locked}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 11,
        width: "100%",
        textAlign: "left",
        border: "none",
        borderRadius: 11,
        padding: "10px 11px",
        cursor: locked ? "not-allowed" : "pointer",
        background: active ? tint(accent, 7) : "transparent",
        opacity: locked ? 0.55 : 1,
      }}
    >
      <span
        style={{
          width: 28,
          height: 28,
          flex: "none",
          borderRadius: 999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: completed ? C.greenBg : current && !completed ? "linear-gradient(120deg,#F59E0B,#FBBF24)" : C.cream,
        }}
      >
        {icon}
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontFamily: FM, fontSize: 10.5, color: C.inkMute, letterSpacing: ".08em" }}>
          WEEK {week.n}
        </span>
        <span
          style={{
            display: "block",
            fontSize: 13.5,
            fontWeight: active ? 600 : 500,
            color: active ? accent : C.ink,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {week.title}
        </span>
      </span>
      {!week.published && !locked && <Clock size={13} color={C.inkMute} />}
    </button>
  );
}

function LockedNotice({ week }: { week: Week }) {
  return (
    <Card style={{ padding: 28, marginTop: 20, textAlign: "center" }}>
      <div style={{ width: 54, height: 54, borderRadius: 999, background: C.cream, color: C.inkMute, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
        <Lock size={24} />
      </div>
      <div style={{ fontFamily: FD, fontWeight: 700, fontSize: 19 }}>Week {week.n} is locked</div>
      <p style={{ color: C.inkSoft, fontSize: 14.5, marginTop: 8, maxWidth: 460, marginInline: "auto", lineHeight: 1.6 }}>
        Finish week {week.n - 1} — material, MCQs and the coding exercise — and this week opens automatically.
      </p>
      <div style={{ marginTop: 18, textAlign: "left", maxWidth: 460, marginInline: "auto" }}>
        <div style={{ fontFamily: FM, fontSize: 11.5, letterSpacing: ".1em", color: C.inkMute }}>WHAT IS INSIDE</div>
        <ul style={{ margin: "8px 0 0", paddingLeft: 18, color: C.inkSoft, fontSize: 14, lineHeight: 1.7 }}>
          {week.objectives.map((o) => (
            <li key={o}>{o}</li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

function UnpublishedNotice({ week }: { week: Week }) {
  return (
    <Card style={{ padding: 28, marginTop: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 46, height: 46, borderRadius: 12, background: C.warnBg, color: C.goldDeep, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
          <CalendarClock size={22} />
        </div>
        <div>
          <div style={{ fontFamily: FD, fontWeight: 700, fontSize: 19 }}>Publishes on {week.releasesOn}</div>
          <p style={{ color: C.inkSoft, fontSize: 14.5, marginTop: 4 }}>
            Your faculty releases each week’s material before the lab session. Here is what it will cover.
          </p>
        </div>
      </div>
      <ul style={{ margin: "16px 0 0", paddingLeft: 18, color: C.inkSoft, fontSize: 14.5, lineHeight: 1.75 }}>
        {week.objectives.map((o) => (
          <li key={o}>{o}</li>
        ))}
      </ul>
    </Card>
  );
}

function ChecklistFooter({
  material,
  quiz,
  code,
  needsCode,
  completed,
  weekNumber,
  onJump,
}: {
  material: boolean;
  quiz: boolean;
  code: boolean;
  needsCode: boolean;
  completed: boolean;
  weekNumber: number;
  onJump: (tab: WeekTab) => void;
}) {
  const items: { tab: WeekTab; label: string; done: boolean }[] = [
    { tab: "material", label: "Read the material", done: material },
    { tab: "quiz", label: "Clear the MCQs", done: quiz },
    ...(needsCode ? [{ tab: "code" as WeekTab, label: "Submit the coding exercise", done: code }] : []),
  ];
  const remaining = items.filter((i) => !i.done).length;

  return (
    <Card
      style={{
        padding: 18,
        marginTop: 20,
        background: completed ? C.greenBg : C.white,
        borderColor: completed ? tint(C.green, 30) : C.line,
        display: "flex",
        alignItems: "center",
        gap: 16,
        flexWrap: "wrap",
      }}
    >
      <div style={{ flex: 1, minWidth: 220 }}>
        <div style={{ fontFamily: FD, fontWeight: 600, fontSize: 15.5, color: completed ? C.green : C.ink }}>
          {completed ? `Week ${weekNumber} complete` : `${remaining} step${remaining === 1 ? "" : "s"} left to finish week ${weekNumber}`}
        </div>
        <div style={{ display: "flex", gap: 14, marginTop: 10, flexWrap: "wrap" }}>
          {items.map((item) => (
            <button
              key={item.tab}
              onClick={() => onJump(item.tab)}
              style={{ border: "none", background: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "center", gap: 7, fontFamily: FB, fontSize: 13.5, color: item.done ? C.green : C.inkSoft }}
            >
              {item.done ? <CheckCircle2 size={16} /> : <Circle size={14} />} {item.label}
            </button>
          ))}
        </div>
      </div>
      {!completed && (
        <div style={{ fontFamily: FM, fontSize: 12, color: C.inkMute, maxWidth: 260 }}>
          Finishing every step unlocks week {weekNumber + 1} and awards the week’s XP.
        </div>
      )}
      {completed && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: FB, fontWeight: 600, fontSize: 14, color: C.green, background: C.white, borderRadius: 999, padding: "9px 15px" }}>
          <CheckCircle2 size={16} /> XP awarded
        </div>
      )}
    </Card>
  );
}
