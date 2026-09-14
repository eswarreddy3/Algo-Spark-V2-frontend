"use client";

import React, { useState } from "react";
import { BookOpen, CheckCircle2, ChevronRight, ClipboardCheck, Code2, FileText, FlaskConical, Lock, Mail } from "lucide-react";
import { C, FB, FD, FM, blueGrad, tint } from "../theme";
import { Pill } from "../ui";
import type { GapArea, PlanItem, Readiness } from "./engine";
import { TARGET_COMPANIES, TIMELINES } from "./useCoach";

export const BAND_COLOR: Record<Readiness["band"]["tone"], string> = { red: C.red, gold: C.goldDeep, blue: C.royal, green: C.green };

export const STATUS_META: Record<GapArea["status"], { label: string; color: string; bg: string }> = {
  strong: { label: "Strength", color: C.green, bg: C.greenBg },
  ok: { label: "Improving", color: C.goldDeep, bg: C.warnBg },
  weak: { label: "Weak area", color: C.red, bg: C.redBg },
  "no-data": { label: "No data", color: C.inkMute, bg: C.cream },
};

const KIND_META: Record<PlanItem["kind"], { icon: typeof Code2; color: string; label: string }> = {
  lab: { icon: FlaskConical, color: C.royal, label: "Lab" },
  course: { icon: BookOpen, color: C.cyan, label: "Course" },
  drill: { icon: Code2, color: C.violet, label: "Drill" },
  email: { icon: Mail, color: C.cyan, label: "Email" },
  reading: { icon: FileText, color: C.goldDeep, label: "Reading" },
  exam: { icon: ClipboardCheck, color: C.goldDeep, label: "Exam" },
};

/** Circular score gauge. */
export function ReadinessRing({ score, color, size = 120, stroke = 11 }: { score: number; color: string; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: size, height: size, flex: "none" }} role="img" aria-label={`Readiness ${score} out of 100`}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.cream} strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)} style={{ transition: "stroke-dashoffset .6s ease" }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: FD, fontWeight: 700, fontSize: size * 0.3, lineHeight: 1 }}>{score}</span>
        <span style={{ fontFamily: FM, fontSize: Math.max(10, size * 0.09), color: C.inkMute }}>/ 100</span>
      </div>
    </div>
  );
}

export function PlanItemRow({ item, onOpen, first }: { item: PlanItem; onOpen: () => void; first?: boolean }) {
  const meta = KIND_META[item.kind];
  const disabled = item.locked;
  return (
    <button
      onClick={onOpen}
      disabled={disabled}
      className={disabled ? undefined : "as-row"}
      title={disabled ? item.lockReason : undefined}
      style={{
        width: "100%", textAlign: "left", border: "none", borderTop: first ? "none" : `1px solid ${C.line}`, background: C.white,
        padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: FB, color: C.ink, opacity: disabled ? 0.62 : 1,
      }}
    >
      <span
        style={{
          width: 34, height: 34, flex: "none", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
          background: item.done ? C.greenBg : tint(meta.color, 10), color: item.done ? C.green : meta.color,
        }}
      >
        {item.done ? <CheckCircle2 size={17} /> : item.locked ? <Lock size={15} /> : <meta.icon size={17} />}
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
          <span style={{ fontWeight: 600, fontSize: 14.5, textDecoration: item.done ? "line-through" : "none", color: item.done ? C.inkMute : C.ink }}>{item.title}</span>
          <Pill>{meta.label}</Pill>
        </span>
        <span style={{ display: "block", fontSize: 12.5, color: C.inkMute, marginTop: 2 }}>{item.detail}</span>
        <span style={{ display: "block", fontSize: 12.5, color: item.locked ? C.inkMute : C.inkSoft, marginTop: 2 }}>
          {item.locked ? `Locked · ${item.lockReason}` : item.reason}
        </span>
      </span>
      <span className="as-hide-sm" style={{ fontFamily: FM, fontSize: 12, color: C.inkMute, flex: "none" }}>~{item.minutes}m</span>
      {!disabled && <ChevronRight size={16} color={C.inkMute} style={{ flex: "none" }} />}
    </button>
  );
}

export function GoalSetup({
  initialCompanies = [],
  initialWeeks = 8,
  onSave,
  onCancel,
}: {
  initialCompanies?: string[];
  initialWeeks?: number;
  onSave: (companies: string[], weeks: number) => void;
  onCancel?: () => void;
}) {
  const [companies, setCompanies] = useState<string[]>(initialCompanies);
  const [weeks, setWeeks] = useState(initialWeeks);
  const toggle = (c: string) => setCompanies((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : prev.length >= 4 ? prev : [...prev, c]));

  return (
    <div>
      <div style={{ fontSize: 14.5, fontWeight: 600 }}>Target companies <span style={{ color: C.inkMute, fontWeight: 400 }}>· pick up to 4</span></div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
        {TARGET_COMPANIES.map((c) => {
          const on = companies.includes(c);
          return (
            <button
              key={c}
              onClick={() => toggle(c)}
              aria-pressed={on}
              style={{
                border: `1.5px solid ${on ? C.royal : C.line}`, background: on ? tint(C.royal, 8) : C.white, color: on ? C.royal : C.inkSoft,
                borderRadius: 999, padding: "7px 14px", fontFamily: FB, fontWeight: 600, fontSize: 13.5, cursor: "pointer",
              }}
            >
              {c}
            </button>
          );
        })}
      </div>

      <div style={{ fontSize: 14.5, fontWeight: 600, marginTop: 18 }}>Timeline</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
        {TIMELINES.map((w) => (
          <button
            key={w}
            onClick={() => setWeeks(w)}
            aria-pressed={weeks === w}
            style={{
              border: `1.5px solid ${weeks === w ? C.royal : C.line}`, background: weeks === w ? tint(C.royal, 8) : C.white, color: weeks === w ? C.royal : C.inkSoft,
              borderRadius: 12, padding: "9px 16px", fontFamily: FB, fontWeight: 600, fontSize: 14, cursor: "pointer",
            }}
          >
            {w} weeks
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap", alignItems: "center" }}>
        <button
          onClick={() => onSave(companies, weeks)}
          disabled={!companies.length}
          style={{
            background: companies.length ? blueGrad : C.line, color: companies.length ? "#fff" : C.inkMute, border: "none", borderRadius: 12,
            padding: "12px 20px", fontFamily: FB, fontWeight: 600, fontSize: 14.5, cursor: companies.length ? "pointer" : "not-allowed",
          }}
        >
          {onCancel ? "Update my plan" : "Build my plan"}
        </button>
        {onCancel && (
          <button onClick={onCancel} style={{ border: `1px solid ${C.line}`, background: C.white, borderRadius: 12, padding: "11px 16px", fontFamily: FB, fontWeight: 600, fontSize: 14, cursor: "pointer", color: C.ink }}>
            Cancel
          </button>
        )}
        {!companies.length && <span style={{ fontSize: 13, color: C.inkMute }}>Choose at least one company.</span>}
      </div>
    </div>
  );
}
