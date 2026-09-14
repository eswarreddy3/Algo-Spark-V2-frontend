"use client";

import React, { useState } from "react";
import {
  ArrowRight, BookOpen, CheckCircle2, ChevronDown, ChevronLeft, Circle, Clock, Layers, ListChecks, Terminal, User2,
} from "lucide-react";
import { C, FB, FD, FM, tint } from "../theme";
import { Card, Kicker, Pill, ProgressBar } from "../ui";
import { FORMAT_LABEL, courseMinutes, courseTopics, type Course, type Topic } from "../data/courses";
import type { TopicModule } from "../nav";
import { formatHours } from "./CourseCatalog";
import { FORMAT_ICON } from "./MaterialViewer";
import { isModuleDone, topicModules, useCourseProgress } from "./progress";

export const MODULE_META: Record<TopicModule, { label: string; icon: typeof BookOpen }> = {
  material: { label: "PPT", icon: BookOpen },
  mcq: { label: "MCQs", icon: ListChecks },
  code: { label: "Coding", icon: Terminal },
};

/** Short count label for a topic's module, e.g. "5 MCQs" or "3 coding". */
export function moduleCount(topic: Topic, module: TopicModule) {
  if (module === "material") return FORMAT_LABEL[topic.material.format];
  if (module === "mcq") return `${topic.mcqs.length} MCQ${topic.mcqs.length === 1 ? "" : "s"}`;
  return `${topic.exercises.length} coding`;
}

/** One course: its sections, each section's topics, and each topic's modules. */
export function CourseDetail({
  course,
  onBack,
  onOpenTopic,
}: {
  course: Course;
  onBack: () => void;
  onOpenTopic: (topicId: string, module: TopicModule) => void;
}) {
  const { courseStats, nextTopic, isTopicComplete } = useCourseProgress();
  const stats = courseStats(course);
  const next = nextTopic(course);
  const finished = stats.completed === stats.total;
  const topics = courseTopics(course);
  const [closed, setClosed] = useState<string[]>([]);

  return (
    <div>
      <button
        onClick={onBack}
        style={{ border: "none", background: "none", color: C.inkSoft, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: FB, fontSize: 14, fontWeight: 600, padding: 0 }}
      >
        <ChevronLeft size={17} /> All courses
      </button>

      <Card style={{ marginTop: 12, padding: 0, overflow: "hidden" }}>
        <div style={{ height: 6, background: course.accent }} />
        <div style={{ padding: 22, display: "flex", gap: 22, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <Kicker>{course.scope === "tech" ? "Tech course" : "Non-tech course"} · {course.level}</Kicker>
            <div style={{ fontFamily: FD, fontWeight: 700, fontSize: 26, letterSpacing: "-.02em", marginTop: 4 }}>{course.title}</div>
            <p style={{ color: C.inkSoft, fontSize: 15, marginTop: 6, lineHeight: 1.6 }}>{course.blurb}</p>
            <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
              <Pill><User2 size={11} style={{ display: "inline", marginRight: 5, verticalAlign: -1 }} />{course.instructor}</Pill>
              <Pill><Layers size={11} style={{ display: "inline", marginRight: 5, verticalAlign: -1 }} />{course.sections.length} modules</Pill>
              <Pill><BookOpen size={11} style={{ display: "inline", marginRight: 5, verticalAlign: -1 }} />{topics.length} topics</Pill>
              <Pill><Clock size={11} style={{ display: "inline", marginRight: 5, verticalAlign: -1 }} />{formatHours(courseMinutes(course))}</Pill>
            </div>
          </div>

          <div style={{ minWidth: 260, flex: "0 1 320px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: C.inkMute, marginBottom: 7 }}>
              <span>{stats.completed} of {stats.total} topics complete</span>
              <span style={{ fontFamily: FM, color: finished ? C.green : course.accent, fontWeight: 600 }}>{stats.percent}%</span>
            </div>
            <ProgressBar value={stats.percent} color={finished ? C.green : course.accent} height={8} />
            <div style={{ fontFamily: FM, fontSize: 12, color: C.inkMute, marginTop: 8 }}>{stats.points} XP earned</div>
            <button
              onClick={() => onOpenTopic(next.id, "material")}
              style={{ width: "100%", marginTop: 14, border: "none", background: course.accent, color: "#fff", borderRadius: 12, padding: "12px 18px", fontFamily: FB, fontWeight: 600, fontSize: 14.5, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {finished ? "Review" : stats.completed ? "Continue" : "Start"}: {next.title}
              </span>
              <ArrowRight size={16} style={{ flex: "none" }} />
            </button>
          </div>
        </div>
      </Card>

      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 16 }}>
        {course.sections.map((section, si) => {
          const done = section.topics.filter((t) => isTopicComplete(t.id)).length;
          const open = !closed.includes(section.id);
          return (
            <Card key={section.id} style={{ padding: 0, overflow: "hidden" }}>
              <button
                onClick={() => setClosed((c) => (open ? [...c, section.id] : c.filter((id) => id !== section.id)))}
                aria-expanded={open}
                style={{ width: "100%", border: "none", background: C.white, cursor: "pointer", textAlign: "left", padding: "16px 18px", display: "flex", alignItems: "center", gap: 14 }}
              >
                <span style={{ width: 38, height: 38, flex: "none", borderRadius: 11, background: tint(course.accent, 9), color: course.accent, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FD, fontWeight: 700 }}>
                  {si + 1}
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", fontFamily: FM, fontSize: 11, letterSpacing: ".1em", color: C.inkMute }}>MODULE {si + 1}</span>
                  <span style={{ display: "block", fontFamily: FD, fontWeight: 600, fontSize: 17 }}>{section.title}</span>
                </span>
                <span style={{ fontFamily: FM, fontSize: 12.5, color: done === section.topics.length ? C.green : C.inkMute }}>
                  {done}/{section.topics.length} topics
                </span>
                <ChevronDown size={18} color={C.inkMute} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .18s" }} />
              </button>

              {open &&
                section.topics.map((topic) => (
                  <TopicRow key={topic.id} topic={topic} index={topics.indexOf(topic) + 1} accent={course.accent} onOpen={onOpenTopic} />
                ))}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function TopicRow({
  topic,
  index,
  accent,
  onOpen,
}: {
  topic: Topic;
  index: number;
  accent: string;
  onOpen: (topicId: string, module: TopicModule) => void;
}) {
  const { topicProgress, isTopicComplete } = useCourseProgress();
  const progress = topicProgress(topic.id);
  const complete = isTopicComplete(topic.id);
  const FormatIcon = FORMAT_ICON[topic.material.format];

  return (
    <div className="as-row" style={{ borderTop: `1px solid ${C.line}`, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
      <button
        onClick={() => onOpen(topic.id, "material")}
        style={{ flex: 1, minWidth: 240, border: "none", background: "none", padding: 0, cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 12 }}
      >
        <span style={{ width: 30, height: 30, flex: "none", borderRadius: 999, background: complete ? C.greenBg : C.cream, color: complete ? C.green : C.inkMute, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FM, fontSize: 12 }}>
          {complete ? <CheckCircle2 size={17} /> : index}
        </span>
        <span style={{ minWidth: 0 }}>
          <span style={{ display: "block", fontFamily: FD, fontWeight: 600, fontSize: 15.5, color: C.ink }}>{topic.title}</span>
          <span style={{ display: "block", color: C.inkMute, fontSize: 13.5, marginTop: 2 }}>
            {topic.summary} · {topic.minutes} min
          </span>
        </span>
      </button>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {topicModules(topic).map((m) => {
          const done = isModuleDone(topic, progress, m);
          const Icon = m === "material" ? FormatIcon : MODULE_META[m].icon;
          const label =
            m === "code" && !done && progress.code.length
              ? `${progress.code.length}/${topic.exercises.length} coding`
              : moduleCount(topic, m);
          return (
            <button
              key={m}
              onClick={() => onOpen(topic.id, m)}
              title={`Open ${MODULE_META[m].label.toLowerCase()}`}
              style={{
                border: `1px solid ${done ? tint(C.green, 35) : C.line}`, background: done ? C.greenBg : C.white,
                color: done ? C.green : C.inkSoft, borderRadius: 999, padding: "6px 12px", cursor: "pointer",
                fontFamily: FB, fontWeight: 600, fontSize: 12.5, display: "flex", alignItems: "center", gap: 6,
              }}
            >
              <Icon size={13} color={done ? C.green : accent} /> {label}
              {done ? <CheckCircle2 size={13} /> : <Circle size={10} color={C.line} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
