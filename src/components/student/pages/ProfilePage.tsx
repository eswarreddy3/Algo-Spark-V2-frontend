"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Award, BookOpen, Building2, CalendarDays, Camera, CheckCircle2, Code2, Database, Flame, FlaskConical, KeyRound, Lock, Mail, Star, Target, Trash2, Trophy, User, Zap,
} from "lucide-react";
import { C, FB, FD, FM, blueGrad, tint } from "../theme";
import { Card, Kicker, Pill, ProgressBar } from "../ui";
import { LABS } from "../labs/catalog";
import { useLabsProgress } from "../labs/progress";
import { ALL_COURSES } from "../courses/catalog";
import { useCourseProgress } from "../courses/progress";
import { PRACTICE_PROBLEMS } from "../data/problems";
import { SQL_PROBLEMS } from "../data/sqlProblems";
import { useSolved } from "../data/solved";
import { usePerformance } from "../data/performance";
import { liveRank } from "../data/leaderboard";
import { STUDENT } from "../data/student";
import { DEMO_ACCOUNTS } from "@/lib/auth";
import { useNav } from "../nav";

const PHOTO_KEY = "algospark.profile.photo";
const MAX_PHOTO_BYTES = 2 * 1024 * 1024;

/** 12 weeks of activity, most recent last. Values are tasks completed that day. */
const ACTIVITY: number[] = [
  0, 1, 2, 0, 3, 1, 0, 2, 4, 1, 0, 0, 2, 3, 1, 5, 2, 0, 1, 3, 4, 2, 0, 1,
  2, 5, 3, 1, 0, 2, 4, 3, 2, 1, 0, 3, 5, 4, 2, 1, 3, 2, 0, 4, 5, 3, 2, 4,
  1, 0, 2, 3, 5, 4, 3, 2, 1, 3, 4, 5, 3, 2, 4, 3, 5, 4, 2, 3, 4, 5, 3, 4,
  2, 3, 5, 4, 3, 2, 4, 5, 3, 4, 2, 5,
];

export function ProfilePage({ xp }: { xp: number }) {
  const { labStats, isComplete } = useLabsProgress();
  const { courseStats } = useCourseProgress();
  const { solved } = useSolved();
  const { exams, streak } = usePerformance();
  const { go } = useNav();
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrating from an external store
      setPhoto(window.localStorage.getItem(PHOTO_KEY));
    } catch {
      /* storage blocked — show initials */
    }
  }, []);

  function onPhoto(file: File | undefined) {
    setPhotoError("");
    if (!file) return;
    if (!file.type.startsWith("image/")) return setPhotoError("Choose an image file.");
    if (file.size > MAX_PHOTO_BYTES) return setPhotoError("Keep the photo under 2 MB.");
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result);
      setPhoto(url);
      try {
        window.localStorage.setItem(PHOTO_KEY, url);
      } catch {
        setPhotoError("Your browser couldn't save the photo, so it will reset on reload.");
      }
    };
    reader.readAsDataURL(file);
  }

  function removePhoto() {
    setPhoto(null);
    try {
      window.localStorage.removeItem(PHOTO_KEY);
    } catch {
      /* nothing stored */
    }
  }

  const labTotals = useMemo(
    () => LABS.map((lab) => ({ lab, stats: labStats(lab.id) })),
    [labStats],
  );
  const weeksDone = labTotals.reduce((n, l) => n + l.stats.completed, 0);
  const labPoints = labTotals.reduce((n, l) => n + l.stats.points, 0);
  const practicePoints = [...PRACTICE_PROBLEMS, ...SQL_PROBLEMS].filter((p) => solved.includes(p.exercise.id)).reduce(
    (n, p) => n + p.exercise.points,
    0,
  );
  const coursePoints = ALL_COURSES.reduce((n, c) => n + courseStats(c).points, 0);
  const examPoints = exams.filter((e) => e.feedback).reduce((n, e) => n + e.points, 0);
  const otherPoints = Math.max(0, xp - labPoints - practicePoints - coursePoints - examPoints);

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
        <div style={{ position: "relative", height: 112, background: blueGrad, overflow: "hidden" }} aria-hidden>
          <span style={{ position: "absolute", width: 260, height: 260, borderRadius: 999, right: -60, top: -120, background: "rgba(255,255,255,.12)" }} />
          <span style={{ position: "absolute", width: 160, height: 160, borderRadius: 999, right: 170, top: 40, background: "rgba(255,255,255,.08)" }} />
        </div>

        {/* Only the avatar overlaps the banner; the name and meta sit fully below it. */}
        <div style={{ padding: "0 24px 20px", display: "flex", alignItems: "flex-start", gap: 18, flexWrap: "wrap" }}>
          <div style={{ position: "relative", width: 96, height: 96, marginTop: -48, borderRadius: 999, background: C.white, padding: 4, flex: "none", boxShadow: `0 10px 26px ${C.shadow}` }}>
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element -- a local data URL, not an optimisable asset
              <img src={photo} alt="Your profile photo" style={{ width: "100%", height: "100%", borderRadius: 999, objectFit: "cover", display: "block" }} />
            ) : (
              <div style={{ width: "100%", height: "100%", borderRadius: 999, background: "linear-gradient(135deg,#101433,#26327A)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FD, fontWeight: 700, fontSize: 32 }}>
                {STUDENT.initials}
              </div>
            )}
            <button
              onClick={() => fileRef.current?.click()}
              aria-label="Change profile photo"
              title="Change photo"
              style={{ position: "absolute", right: 2, bottom: 2, width: 30, height: 30, borderRadius: 999, border: `2px solid ${C.white}`, background: C.royal, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0 }}
            >
              <Camera size={14} />
            </button>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => { onPhoto(e.target.files?.[0]); e.target.value = ""; }} />
          </div>

          <div style={{ flex: 1, minWidth: 240, paddingTop: 14 }}>
            <h1 style={{ fontFamily: FD, fontWeight: 700, fontSize: 26, margin: 0, letterSpacing: "-0.02em" }}>{STUDENT.name}</h1>
            <div style={{ color: C.inkMute, fontSize: 14.5, marginTop: 4 }}>
              {STUDENT.branch} · {STUDENT.section} · {STUDENT.year} · Roll {STUDENT.roll}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap", alignItems: "center" }}>
              <MetaChip icon={Mail}>{STUDENT.email}</MetaChip>
              <MetaChip icon={CalendarDays}>Joined {STUDENT.joined}</MetaChip>
              <MetaChip icon={User}>Mentor · {STUDENT.mentor}</MetaChip>
              {photo && (
                <button onClick={removePhoto} style={{ border: "none", background: "none", color: C.inkMute, fontFamily: FB, fontSize: 12.5, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <Trash2 size={12} /> Remove photo
                </button>
              )}
            </div>
            {photoError && <div role="alert" style={{ marginTop: 8, color: C.red, fontSize: 13 }}>{photoError}</div>}
          </div>
        </div>

        {/* 1px gaps over the line colour draw the dividers, so they stay correct when the strip wraps. */}
        <div className="as-stat-strip" style={{ background: C.line, borderTop: `1px solid ${C.line}` }}>
          <HeadStat icon={Zap} color={C.goldDeep} label="Total points" value={xp.toLocaleString()} />
          <HeadStat icon={Trophy} color={C.royal} label="College rank" value={`#${liveRank("College", xp)}`} />
          <HeadStat icon={FlaskConical} color={C.violet} label="Weeks done" value={String(weeksDone)} />
          <HeadStat icon={Flame} color={C.red} label="Day streak" value={String(streak)} />
        </div>
      </Card>

      <div className="as-split-main as-profile-grid" style={{ marginTop: 16, alignItems: "stretch" }}>
        <div className="as-fill-last" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <InstitutionCard />
          <Card style={{ padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
              <SectionTitle icon={CalendarDays} color={C.cyan} title="Activity" />
              <div style={{ fontSize: 12.5, color: C.inkMute }}>Last 12 weeks</div>
            </div>
            <ActivityHeatmap />
          </Card>

          {/* Settings belong at the end once the columns stack on narrow screens. */}
          <div className="as-profile-settings">
            <PasswordCard />
          </div>
        </div>

        <div className="as-fill-last" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card style={{ padding: 20 }}>
            <SectionTitle icon={Star} color={C.goldDeep} title="Points breakdown" />
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 14 }}>
              <BreakdownRow icon={FlaskConical} label="Labs" value={labPoints} total={xp} color={C.royal} />
              <BreakdownRow icon={Code2} label="Coding" value={practicePoints} total={xp} color={C.violet} />
              <BreakdownRow icon={BookOpen} label="Courses" value={coursePoints} total={xp} color={C.cyan} />
              <BreakdownRow icon={Trophy} label="Exams" value={examPoints} total={xp} color={C.goldDeep} />
              {otherPoints > 0 && <BreakdownRow icon={Star} label="Earlier semesters" value={otherPoints} total={xp} color={C.inkMute} />}
            </div>
          </Card>

          <Card style={{ padding: 20 }}>
            <SectionTitle icon={FlaskConical} color={C.royal} title="Lab progress" />
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 6 }}>
              {labTotals.map(({ lab, stats }) => (
                <button
                  key={lab.id}
                  onClick={() => go("labs")}
                  className="as-row"
                  style={{ all: "unset", cursor: "pointer", display: "block", padding: "10px 12px", margin: "0 -12px", borderRadius: 12 }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, flexWrap: "wrap", fontSize: 14.5, marginBottom: 8 }}>
                    <span style={{ fontWeight: 600 }}>{lab.name}</span>
                    <span style={{ fontFamily: FM, fontSize: 12.5, color: C.inkMute }}>
                      {stats.completed}/{stats.total} weeks · {stats.points} XP
                    </span>
                  </div>
                  <ProgressBar value={stats.percent} color={lab.accent} height={8} />
                </button>
              ))}
            </div>
          </Card>

          <Card style={{ padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <SectionTitle icon={Award} color={C.goldDeep} title="Badges" />
              <span style={{ fontFamily: FM, fontSize: 12, color: C.inkMute }}>
                {badges.filter((b) => b.earned).length}/{badges.length} earned
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(112px,1fr))", gap: 10, marginTop: 16 }}>
              {badges.map((b) => (
                <div
                  key={b.t}
                  title={b.earned ? `Earned ${b.when || "recently"}` : "Not earned yet"}
                  style={{ textAlign: "center", padding: "14px 10px", borderRadius: 14, border: `1px solid ${C.line}`, background: b.earned ? C.white : C.cream }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 13, background: b.earned ? tint(b.c, 10) : C.line, color: b.earned ? b.c : C.inkMute, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 9px" }}>
                    {b.earned ? <b.icon size={22} /> : <Lock size={18} />}
                  </div>
                  <div style={{ fontFamily: FD, fontWeight: 600, fontSize: 13, color: b.earned ? C.ink : C.inkMute }}>{b.t}</div>
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

function SectionTitle({ icon: Icon, color, title }: { icon: typeof Code2; color: string; title: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9, fontFamily: FD, fontWeight: 600, fontSize: 16 }}>
      <span style={{ width: 30, height: 30, borderRadius: 9, background: tint(color, 10), color, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
        <Icon size={16} />
      </span>
      {title}
    </div>
  );
}

function MetaChip({ icon: Icon, children }: { icon: typeof Code2; children: React.ReactNode }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: C.inkSoft, background: C.cream, border: `1px solid ${C.line}`, borderRadius: 999, padding: "5px 11px", maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
      <Icon size={13} color={C.inkMute} style={{ flex: "none" }} />
      {children}
    </span>
  );
}

function HeadStat({ icon: Icon, color, label, value }: { icon: typeof Code2; color: string; label: string; value: string }) {
  return (
    <div style={{ background: C.white, padding: "16px 24px", display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
      <span style={{ width: 40, height: 40, borderRadius: 12, background: tint(color, 10), color, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
        <Icon size={19} />
      </span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: FD, fontWeight: 700, fontSize: 22, lineHeight: 1.1 }}>{value}</div>
        <div style={{ color: C.inkMute, fontSize: 12.5, marginTop: 3 }}>{label}</div>
      </div>
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
  // One hue, empty to full. Built from tokens so the empty step sits just off
  // the surface and the full step stays readable in both themes.
  const levels = [C.cream, tint(C.royal, 28), tint(C.royal, 50), tint(C.royal, 75), C.royal];
  const weeks = Math.ceil(ACTIVITY.length / 7);
  const totalTasks = ACTIVITY.reduce((a, b) => a + b, 0);
  const activeDays = ACTIVITY.filter((v) => v > 0).length;
  let bestRun = 0;
  let run = 0;
  for (const v of ACTIVITY) {
    run = v > 0 ? run + 1 : 0;
    bestRun = Math.max(bestRun, run);
  }
  const weekTotals = Array.from({ length: weeks }, (_, w) => ACTIVITY.slice(w * 7, w * 7 + 7).reduce((a, b) => a + b, 0));
  const summary = [
    { label: "Tasks done", value: totalTasks },
    { label: "Active days", value: `${activeDays}/${ACTIVITY.length}` },
    { label: "Longest run", value: `${bestRun} days` },
    { label: "Best week", value: `${Math.max(...weekTotals)} tasks` },
  ];

  return (
    <div style={{ display: "flex", gap: 20, marginTop: 16, flexWrap: "wrap", alignItems: "stretch" }}>
      <div style={{ flex: "none", maxWidth: "100%" }}>
        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
          <div style={{ display: "grid", gridTemplateRows: "repeat(7, 16px)", gap: 4, fontFamily: FM, fontSize: 10, color: C.inkMute, paddingRight: 2 }}>
            {["M", "", "W", "", "F", "", ""].map((d, i) => (
              <span key={i} style={{ lineHeight: "16px" }}>{d}</span>
            ))}
          </div>
          {Array.from({ length: weeks }).map((_, w) => (
            <div key={w} style={{ display: "grid", gridTemplateRows: "repeat(7, 16px)", gap: 4 }}>
              {Array.from({ length: 7 }).map((_, d) => {
                const value = ACTIVITY[w * 7 + d] ?? 0;
                return (
                  <div
                    key={d}
                    title={`${value} task${value === 1 ? "" : "s"}`}
                    style={{ width: 16, height: 16, borderRadius: 4, background: levels[Math.min(levels.length - 1, value)] }}
                  />
                );
              })}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 5, fontSize: 12, color: C.inkMute, marginTop: 10 }}>
          less
          {levels.map((l) => (
            <span key={l} style={{ width: 12, height: 12, borderRadius: 3, background: l }} />
          ))}
          more
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 190, display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10, alignContent: "start" }}>
        {summary.map((s) => (
          <div key={s.label} style={{ background: C.cream, border: `1px solid ${C.line}`, borderRadius: 12, padding: "12px 14px" }}>
            <div style={{ fontFamily: FD, fontWeight: 700, fontSize: 19, whiteSpace: "nowrap" }}>{s.value}</div>
            <div style={{ fontSize: 12.5, color: C.inkMute, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Set by the Super Admin at onboarding. Students can see these but not change them. */
function InstitutionCard() {
  const fields = [
    { label: "College", value: STUDENT.college },
    { label: "Branch", value: STUDENT.branch },
    { label: "Year", value: STUDENT.year },
    { label: "Section", value: STUDENT.section },
    { label: "Roll number", value: STUDENT.roll },
    { label: "College email", value: STUDENT.email },
  ];
  return (
    <Card style={{ padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <SectionTitle icon={Building2} color={C.violet} title="Institution details" />
        <Pill>
          <Lock size={10} style={{ display: "inline", marginRight: 4, verticalAlign: -1 }} />
          read-only
        </Pill>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 10, marginTop: 16 }}>
        {fields.map((f) => (
          <div key={f.label} style={{ background: C.cream, border: `1px solid ${C.line}`, borderRadius: 12, padding: "10px 14px", minWidth: 0 }}>
            <div style={{ fontFamily: FM, fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", color: C.inkMute }}>{f.label}</div>
            <div style={{ fontSize: 14.5, fontWeight: 600, marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={f.value}>{f.value}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 12.5, color: C.inkMute, marginTop: 14 }}>
        Something wrong here? Raise a support ticket — only the AlgoSpark admin team can change institution details.
      </div>
    </Card>
  );
}

function PasswordCard() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [touched, setTouched] = useState(false);
  const [saved, setSaved] = useState(false);

  const errors = {
    current: current !== DEMO_ACCOUNTS.student.password ? "Current password is incorrect" : "",
    next:
      next.length < 8 ? "Use at least 8 characters" : !/[A-Za-z]/.test(next) || !/\d/.test(next) ? "Mix letters and numbers" : next === current ? "Choose a different password" : "",
    confirm: confirm !== next ? "Passwords don't match" : "",
  };
  const valid = !errors.current && !errors.next && !errors.confirm;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    setSaved(false);
    if (!valid) return;
    setSaved(true);
    setCurrent("");
    setNext("");
    setConfirm("");
    setTouched(false);
  }

  const field = (label: string, value: string, set: (v: string) => void, error: string, autoComplete: string) => (
    <label style={{ display: "block", marginBottom: 12 }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: C.inkSoft }}>{label}</span>
      <input
        type="password"
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => { set(e.target.value); setSaved(false); }}
        style={{ display: "block", width: "100%", marginTop: 6, border: `1px solid ${touched && error ? C.red : C.line}`, borderRadius: 11, padding: "10px 12px", fontFamily: FB, fontSize: 14, outline: "none", color: C.ink, background: C.white, boxSizing: "border-box" }}
      />
      {touched && error && <span style={{ display: "block", fontSize: 12, color: C.red, marginTop: 4 }}>{error}</span>}
    </label>
  );

  return (
    <Card style={{ padding: 20 }}>
      {/* Guidance beside the form, so the card reads well in a wide column and stacks on narrow ones. */}
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 180px", minWidth: 0 }}>
          <SectionTitle icon={KeyRound} color={C.royal} title="Change password" />
          <p style={{ margin: "12px 0 0", fontSize: 13.5, color: C.inkSoft, lineHeight: 1.55 }}>
            Keep your account secure. You&apos;ll stay signed in on this device after changing it.
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: "14px 0 0", display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { ok: next.length >= 8, t: "At least 8 characters" },
              { ok: /[A-Za-z]/.test(next) && /\d/.test(next), t: "Letters and numbers" },
              { ok: Boolean(next) && next !== current, t: "Different from current password" },
            ].map((r) => (
              <li key={r.t} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: r.ok ? C.green : C.inkMute }}>
                <CheckCircle2 size={15} style={{ flex: "none" }} /> {r.t}
              </li>
            ))}
          </ul>
        </div>
        <form onSubmit={submit} style={{ flex: "1.4 1 250px", minWidth: 0 }}>
          {field("Current password", current, setCurrent, errors.current, "current-password")}
          {field("New password", next, setNext, errors.next, "new-password")}
          {field("Confirm new password", confirm, setConfirm, errors.confirm, "new-password")}
          <button type="submit" style={{ marginTop: 4, width: "100%", background: blueGrad, color: "#fff", border: "none", borderRadius: 11, padding: "11px", fontFamily: FB, fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
            Update password
          </button>
        </form>
      </div>
      {saved && (
        <div role="status" style={{ marginTop: 12, background: C.greenBg, color: C.green, borderRadius: 11, padding: "10px 12px", fontSize: 13, display: "flex", gap: 8 }}>
          <CheckCircle2 size={16} style={{ flex: "none", marginTop: 1 }} />
          Password checks passed. In this prototype sign-in still uses the demo password until the auth API is connected.
        </div>
      )}
    </Card>
  );
}
