"use client";

import React, { useMemo, useState } from "react";
import { ArrowRight, BookOpen, Clock, GraduationCap, Layers, Search, User2, X } from "lucide-react";
import { C, FB, FD, FM, tint } from "../theme";
import { Card, Pill, ProgressBar } from "../ui";
import { courseMinutes, courseTopics, type Course } from "../data/courses";
import { useCourseProgress } from "./progress";

const STATUS = ["All", "In progress", "Not started", "Completed"] as const;
type Status = (typeof STATUS)[number];

export function formatHours(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h ? `${h}h ${m ? `${m}m` : ""}`.trim() : `${m}m`;
}

/** Course cards; opening one shows its sections and topics. */
export function CourseCatalog({ courses, onOpen }: { courses: Course[]; onOpen: (courseId: string) => void }) {
  const { courseStats } = useCourseProgress();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<Status>("All");

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return courses.filter((course) => {
      const s = courseStats(course);
      if (status === "Completed" && s.completed !== s.total) return false;
      if (status === "Not started" && s.completed !== 0) return false;
      if (status === "In progress" && (s.completed === 0 || s.completed === s.total)) return false;
      return !q || course.title.toLowerCase().includes(q) || course.blurb.toLowerCase().includes(q);
    });
  }, [courses, courseStats, query, status]);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
        <label style={{ flex: 1, minWidth: 220, maxWidth: 420, display: "flex", alignItems: "center", gap: 9, background: C.white, border: `1px solid ${C.line}`, borderRadius: 11, padding: "9px 12px" }}>
          <Search size={16} color={C.inkMute} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses"
            aria-label="Search courses"
            style={{ flex: 1, border: "none", background: "transparent", outline: "none", fontFamily: FB, fontSize: 14.5, color: C.ink, minWidth: 0 }}
          />
          {query && (
            <button onClick={() => setQuery("")} aria-label="Clear search" style={{ border: "none", background: "none", cursor: "pointer", color: C.inkMute, display: "flex" }}>
              <X size={15} />
            </button>
          )}
        </label>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {STATUS.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              aria-pressed={status === s}
              style={{
                border: `1.5px solid ${status === s ? C.royal : C.line}`, background: status === s ? tint(C.royal, 9) : C.white,
                color: status === s ? C.royal : C.inkSoft, borderRadius: 999, padding: "7px 15px", cursor: "pointer",
                fontFamily: FB, fontWeight: 600, fontSize: 13.5,
              }}
            >
              {s}
            </button>
          ))}
        </div>
        <span style={{ marginLeft: "auto", fontSize: 13.5, color: C.inkMute }}>
          {shown.length} course{shown.length === 1 ? "" : "s"}
        </span>
      </div>

      {shown.length === 0 ? (
        <Card style={{ padding: 40, textAlign: "center" }}>
          <div style={{ fontFamily: FD, fontWeight: 600, fontSize: 17 }}>No courses match</div>
          <p style={{ color: C.inkMute, fontSize: 14.5, marginTop: 6 }}>Try another search or status.</p>
        </Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 16 }}>
          {shown.map((course) => (
            <CourseCard key={course.id} course={course} onOpen={() => onOpen(course.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function CourseCard({ course, onOpen }: { course: Course; onOpen: () => void }) {
  const { courseStats } = useCourseProgress();
  const stats = courseStats(course);
  const topics = courseTopics(course).length;
  const finished = stats.completed === stats.total;
  const cta = finished ? "Review course" : stats.completed ? "Continue" : "Start course";

  return (
    <Card style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <button
        onClick={onOpen}
        aria-label={`Open ${course.title}`}
        style={{
          border: "none", cursor: "pointer", textAlign: "left", padding: "20px 20px 18px", position: "relative", overflow: "hidden",
          background: `linear-gradient(135deg, ${course.accent}, ${tint(course.accent, 70)})`, color: "#fff",
        }}
      >
        <span aria-hidden style={{ position: "absolute", right: -26, top: -26, width: 120, height: 120, borderRadius: 999, background: "rgba(255,255,255,.12)" }} />
        <span aria-hidden style={{ position: "absolute", right: 30, bottom: -40, width: 80, height: 80, borderRadius: 999, background: "rgba(255,255,255,.08)" }} />
        <span style={{ display: "flex", alignItems: "center", gap: 10, position: "relative" }}>
          <span style={{ width: 40, height: 40, borderRadius: 11, background: "rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <GraduationCap size={21} />
          </span>
          <span style={{ marginLeft: "auto", fontFamily: FM, fontSize: 11, background: "rgba(255,255,255,.2)", padding: "4px 9px", borderRadius: 999 }}>
            {course.level}
          </span>
        </span>
        <span style={{ display: "block", fontFamily: FD, fontWeight: 700, fontSize: 19, marginTop: 16, position: "relative" }}>{course.title}</span>
      </button>

      <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
        <p style={{ color: C.inkSoft, fontSize: 14, lineHeight: 1.55, margin: 0 }}>{course.blurb}</p>

        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", color: C.inkMute, fontSize: 13 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Layers size={13} /> {course.sections.length} sections</span>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}><BookOpen size={13} /> {topics} topics</span>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Clock size={13} /> {formatHours(courseMinutes(course))}</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, color: C.inkMute, fontSize: 13 }}>
          <User2 size={13} /> {course.instructor}
          {course.scope === "tech" ? <Pill style={{ marginLeft: "auto" }}>material · MCQ · coding</Pill> : <Pill style={{ marginLeft: "auto" }}>material · MCQ</Pill>}
        </div>

        <div style={{ marginTop: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: C.inkMute, marginBottom: 6 }}>
            <span>{stats.completed}/{stats.total} topics</span>
            <span style={{ fontFamily: FM, fontWeight: 600, color: finished ? C.green : course.accent }}>{stats.percent}%</span>
          </div>
          <ProgressBar value={stats.percent} color={finished ? C.green : course.accent} height={6} />
          <button
            onClick={onOpen}
            style={{
              width: "100%", marginTop: 14, border: finished ? `1px solid ${C.line}` : "none", background: finished ? C.white : course.accent,
              color: finished ? C.ink : "#fff", borderRadius: 11, padding: "11px 16px", fontFamily: FB, fontWeight: 600, fontSize: 14,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            {cta} <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </Card>
  );
}
