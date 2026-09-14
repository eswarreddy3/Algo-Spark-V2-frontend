"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Award, BookOpen, CalendarDays, Camera, CheckCircle2, Code2, Database, Flame, FlaskConical, KeyRound, Lock, Mail, Star, Target, Trash2, Trophy, Zap,
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
  const { exams } = usePerformance();
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
        <div style={{ height: 96, background: blueGrad }} />
        <div style={{ padding: "0 24px 24px", marginTop: -38 }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 18, flexWrap: "wrap" }}>
            <div style={{ position: "relative", width: 88, height: 88, borderRadius: 999, background: C.white, padding: 4, flex: "none" }}>
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element -- a local data URL, not an optimisable asset
                <img src={photo} alt="Your profile photo" style={{ width: "100%", height: "100%", borderRadius: 999, objectFit: "cover", display: "block" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", borderRadius: 999, background: "linear-gradient(135deg,#101433,#26327A)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FD, fontWeight: 700, fontSize: 30 }}>
                  {STUDENT.initials}
                </div>
              )}
              <button
                onClick={() => fileRef.current?.click()}
                aria-label="Change profile photo"
                title="Change photo"
                style={{ position: "absolute", right: 0, bottom: 0, width: 30, height: 30, borderRadius: 999, border: `2px solid ${C.white}`, background: C.royal, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0 }}
              >
                <Camera size={14} />
              </button>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => { onPhoto(e.target.files?.[0]); e.target.value = ""; }} />
            </div>
            <div style={{ flex: 1, minWidth: 220, paddingBottom: 4 }}>
              <div style={{ fontFamily: FD, fontWeight: 700, fontSize: 24 }}>{STUDENT.name}</div>
              <div style={{ color: C.inkMute, fontSize: 14, marginTop: 2 }}>
                {STUDENT.branchShort} · {STUDENT.section} · {STUDENT.year} · Roll {STUDENT.roll}
              </div>
            </div>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap", paddingBottom: 4 }}>
              <HeadStat label="Points" value={xp.toLocaleString()} />
              <HeadStat label="College rank" value={`#${liveRank("College", xp)}`} />
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
            {photo && (
              <button onClick={removePhoto} style={{ border: "none", background: "none", color: C.inkMute, fontFamily: FB, fontSize: 12.5, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 5 }}>
                <Trash2 size={12} /> Remove photo
              </button>
            )}
          </div>
          {photoError && <div role="alert" style={{ marginTop: 8, color: C.red, fontSize: 13 }}>{photoError}</div>}
        </div>
      </Card>

      <div className="as-split-main" style={{ marginTop: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <InstitutionCard />
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
              <BreakdownRow icon={Code2} label="Coding" value={practicePoints} total={xp} color={C.violet} />
              <BreakdownRow icon={BookOpen} label="Courses" value={coursePoints} total={xp} color={C.cyan} />
              <BreakdownRow icon={Trophy} label="Exams" value={examPoints} total={xp} color={C.goldDeep} />
              {otherPoints > 0 && <BreakdownRow icon={Star} label="Earlier semesters" value={otherPoints} total={xp} color={C.inkMute} />}
            </div>
          </Card>

          <PasswordCard />

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
                  <div style={{ width: 44, height: 44, borderRadius: 13, background: tint(b.c, 10), color: b.c, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 9px" }}>
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
  // One hue, empty to full. Built from tokens so the empty step sits just off
  // the surface and the full step stays readable in both themes.
  const levels = [C.cream, tint(C.royal, 28), tint(C.royal, 50), tint(C.royal, 75), C.royal];
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
    <Card style={{ padding: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <div style={{ fontFamily: FD, fontWeight: 600, fontSize: 16 }}>Institution details</div>
        <Pill>
          <Lock size={10} style={{ display: "inline", marginRight: 4, verticalAlign: -1 }} />
          read-only
        </Pill>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginTop: 14 }}>
        {fields.map((f) => (
          <div key={f.label}>
            <div style={{ fontSize: 12, color: C.inkMute }}>{f.label}</div>
            <div style={{ fontSize: 14.5, fontWeight: 500, marginTop: 2 }}>{f.value}</div>
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
    <label style={{ display: "block", marginTop: 12 }}>
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
    <Card style={{ padding: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: FD, fontWeight: 600, fontSize: 16 }}>
        <KeyRound size={17} color={C.royal} /> Change password
      </div>
      <form onSubmit={submit}>
        {field("Current password", current, setCurrent, errors.current, "current-password")}
        {field("New password", next, setNext, errors.next, "new-password")}
        {field("Confirm new password", confirm, setConfirm, errors.confirm, "new-password")}
        <button type="submit" style={{ marginTop: 14, width: "100%", background: blueGrad, color: "#fff", border: "none", borderRadius: 11, padding: "11px", fontFamily: FB, fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
          Update password
        </button>
      </form>
      {saved && (
        <div role="status" style={{ marginTop: 12, background: C.greenBg, color: C.green, borderRadius: 11, padding: "10px 12px", fontSize: 13, display: "flex", gap: 8 }}>
          <CheckCircle2 size={16} style={{ flex: "none", marginTop: 1 }} />
          Password checks passed. In this prototype sign-in still uses the demo password until the auth API is connected.
        </div>
      )}
    </Card>
  );
}
