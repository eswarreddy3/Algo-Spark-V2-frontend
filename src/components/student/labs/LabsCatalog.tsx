"use client";

import React from "react";
import { ArrowRight, CalendarClock, CheckCircle2, FlaskConical, MapPin, RotateCcw, Sparkles, User2 } from "lucide-react";
import { C, FB, FD, FM, tint } from "../theme";
import { Card, H2, Kicker, Pill, ProgressBar, Serif } from "../ui";
import { LABS } from "./catalog";
import { useLabsProgress } from "./progress";
import type { Lab } from "./types";

export function LabsCatalog({ onOpen }: { onOpen: (labId: string, week: number) => void }) {
  const { labStats, resetProgress } = useLabsProgress();

  const totals = LABS.reduce(
    (acc, lab) => {
      const s = labStats(lab.id);
      return { completed: acc.completed + s.completed, total: acc.total + s.total, points: acc.points + s.points };
    },
    { completed: 0, total: 0, points: 0 },
  );

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 280 }}>
          <Kicker>Labs</Kicker>
          <H2>
            Your labs this <Serif>semester.</Serif>
          </H2>
          <p style={{ color: C.inkSoft, marginTop: 8, fontSize: 15.5, maxWidth: 620 }}>
            Every lab runs week by week. Open a lab to see its weeks — each one bundles a PPT, MCQs and a coding
            exercise, and finishing all three unlocks the next week.
          </p>
        </div>
        <button
          onClick={resetProgress}
          title="Restore the demo to its starting state"
          style={{ border: `1px solid ${C.line}`, background: C.white, color: C.inkMute, borderRadius: 11, padding: "9px 14px", fontFamily: FB, fontSize: 13.5, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 7 }}
        >
          <RotateCcw size={14} /> Reset demo progress
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14, marginTop: 22 }}>
        <SummaryTile icon={FlaskConical} label="Labs enrolled" value={String(LABS.length)} color={C.royal} bg={tint(C.royal, 12)} />
        <SummaryTile icon={CheckCircle2} label="Weeks completed" value={`${totals.completed}/${totals.total}`} color={C.green} bg={C.greenBg} />
        <SummaryTile icon={Sparkles} label="Lab XP earned" value={totals.points.toLocaleString()} color={C.goldDeep} bg={C.warnBg} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 16 }}>
        {LABS.map((lab) => (
          <LabCard key={lab.id} lab={lab} onOpen={onOpen} />
        ))}
      </div>
    </div>
  );
}

function SummaryTile({
  icon: Icon,
  label,
  value,
  color,
  bg,
}: {
  icon: typeof FlaskConical;
  label: string;
  value: string;
  color: string;
  bg: string;
}) {
  return (
    <Card style={{ padding: 18, display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ width: 42, height: 42, borderRadius: 12, background: bg, color, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
        <Icon size={20} />
      </div>
      <div>
        <div style={{ fontFamily: FD, fontWeight: 700, fontSize: 22 }}>{value}</div>
        <div style={{ color: C.inkMute, fontSize: 13 }}>{label}</div>
      </div>
    </Card>
  );
}

function LabCard({ lab, onOpen }: { lab: Lab; onOpen: (labId: string, week: number) => void }) {
  const { labStats, currentWeek, isComplete } = useLabsProgress();
  const stats = labStats(lab.id);
  const current = currentWeek(lab.id);
  const currentDef = lab.weeks.find((w) => w.n === current);
  const finished = stats.completed === stats.total;
  const notStarted = stats.completed === 0;

  return (
    <Card style={{ padding: 0, overflow: "hidden", display: "flex" }}>
      <div style={{ width: 6, flex: "none", background: lab.accent }} />
      <div className="as-lab-card-body" style={{ flex: 1, minWidth: 0, padding: 20, display: "grid", gridTemplateColumns: "minmax(0,1.6fr) minmax(0,1fr)", gap: 20, alignItems: "center" }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontFamily: FM, fontSize: 11.5, color: lab.accent, letterSpacing: ".1em" }}>{lab.code}</span>
            <Pill>{lab.semester}</Pill>
            {finished && <Pill color={C.green} bg={C.greenBg}>completed</Pill>}
            {notStarted && <Pill color={C.goldDeep} bg={C.warnBg}>not started</Pill>}
          </div>
          <div style={{ fontFamily: FD, fontWeight: 700, fontSize: 20, marginTop: 7 }}>{lab.name}</div>
          <p style={{ color: C.inkSoft, fontSize: 14.5, marginTop: 6, lineHeight: 1.6 }}>{lab.description}</p>
          <div style={{ display: "flex", gap: 16, marginTop: 12, flexWrap: "wrap", color: C.inkMute, fontSize: 13 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <User2 size={13} /> {lab.faculty}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <CalendarClock size={13} /> {lab.schedule}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <MapPin size={13} /> {lab.room}
            </span>
          </div>
        </div>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: C.inkMute, marginBottom: 7 }}>
            <span>
              {stats.completed}/{stats.total} weeks
            </span>
            <span style={{ fontFamily: FM, fontWeight: 600, color: lab.accent }}>{stats.percent}%</span>
          </div>
          <ProgressBar value={stats.percent} color={lab.accent} height={8} />

          <div style={{ marginTop: 14, background: C.cream, borderRadius: 12, padding: "11px 13px" }}>
            <div style={{ fontFamily: FM, fontSize: 11, letterSpacing: ".1em", color: C.inkMute }}>
              {finished ? "LAST MODULE" : "UP NEXT"}
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, marginTop: 3 }}>
              Week {current} · {currentDef?.title}
            </div>
          </div>

          <button
            onClick={() => onOpen(lab.id, current)}
            style={{ width: "100%", marginTop: 12, border: "none", background: lab.accent, color: "#fff", borderRadius: 12, padding: "12px 18px", fontFamily: FB, fontWeight: 600, fontSize: 14.5, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          >
            {finished ? "Review lab" : isComplete(lab.id, 1) ? `Resume week ${current}` : "Start week 1"}
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </Card>
  );
}
