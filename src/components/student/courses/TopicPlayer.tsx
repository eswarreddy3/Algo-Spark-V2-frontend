"use client";

import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronLeft, Circle } from "lucide-react";
import "../labs/labs.css";
import { C, FB, FD, FM, tint } from "../theme";
import { Card, Kicker, Pill } from "../ui";
import { CodePanel } from "../labs/CodePanel";
import { McqPanel } from "../labs/McqPanel";
import { courseTopics, type Course, type Topic } from "../data/courses";
import type { TopicModule } from "../nav";
import { MODULE_META, moduleCount } from "./CourseDetail";
import { FORMAT_ICON, MaterialViewer } from "./MaterialViewer";
import { isModuleDone, topicModules, useCourseProgress, type TopicProgress } from "./progress";

/** A topic's modules, with the course outline alongside for moving between topics. */
export function TopicPlayer({
  course,
  topicId,
  module,
  onOpen,
  onBack,
}: {
  course: Course;
  topicId: string;
  module: TopicModule;
  onOpen: (topicId: string, module: TopicModule) => void;
  onBack: () => void;
}) {
  const { topicProgress, isTopicComplete, markMaterial, submitMcq, markCode } = useCourseProgress();
  const topics = courseTopics(course);
  const index = Math.max(0, topics.findIndex((t) => t.id === topicId));
  const topic = topics[index];
  const section = course.sections.find((s) => s.topics.includes(topic));
  const modules = topicModules(topic);
  const active = modules.includes(module) ? module : "material";
  const progress = topicProgress(topic.id);
  const complete = isTopicComplete(topic.id);
  const prev = topics[index - 1];
  const next = topics[index + 1];
  const left = modules.filter((m) => !isModuleDone(topic, progress, m)).length;

  return (
    <div>
      <button
        onClick={onBack}
        style={{ border: "none", background: "none", color: C.inkSoft, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: FB, fontSize: 14, fontWeight: 600, padding: 0 }}
      >
        <ChevronLeft size={17} /> {course.title}
      </button>

      <div className="as-workspace" style={{ marginTop: 14 }}>
        <Card style={{ padding: 10, position: "sticky", top: 82 }} className="as-week-rail">
          <div className="as-week-list" style={{ display: "flex", flexDirection: "column", gap: 2, maxHeight: "calc(100vh - 140px)", overflowY: "auto" }}>
            {course.sections.map((s, si) => (
              <React.Fragment key={s.id}>
                <div className="as-hide-rail-sm" style={{ fontFamily: FM, fontSize: 10.5, letterSpacing: ".1em", color: C.inkMute, padding: si === 0 ? "6px 10px 6px" : "14px 10px 6px" }}>
                  SECTION {si + 1} · {s.title.toUpperCase()}
                </div>
                {s.topics.map((t) => (
                  <RailItem
                    key={t.id}
                    topic={t}
                    number={topics.indexOf(t) + 1}
                    accent={course.accent}
                    active={t.id === topic.id}
                    complete={isTopicComplete(t.id)}
                    onSelect={() => onOpen(t.id, "material")}
                  />
                ))}
              </React.Fragment>
            ))}
          </div>
        </Card>

        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 260 }}>
              <Kicker>
                {section ? `${section.title} · ` : ""}Topic {index + 1} of {topics.length}
              </Kicker>
              <div style={{ fontFamily: FD, fontWeight: 700, fontSize: 26, letterSpacing: "-.02em", marginTop: 4 }}>{topic.title}</div>
              <p style={{ color: C.inkSoft, fontSize: 15, marginTop: 6 }}>{topic.summary}</p>
            </div>
            <div style={{ paddingTop: 22 }}>
              {complete ? (
                <Pill color={C.green} bg={C.greenBg}>
                  <CheckCircle2 size={11} style={{ display: "inline", marginRight: 5, verticalAlign: -1 }} />completed
                </Pill>
              ) : (
                <Pill color={C.goldDeep} bg={C.warnBg}>{topic.points} XP on completion</Pill>
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: 6, marginTop: 18, borderBottom: `1px solid ${C.line}`, flexWrap: "wrap" }}>
            {modules.map((m, k) => {
              const Icon = m === "material" ? FORMAT_ICON[topic.material.format] : MODULE_META[m].icon;
              const on = active === m;
              return (
                <button
                  key={m}
                  onClick={() => onOpen(topic.id, m)}
                  aria-current={on ? "page" : undefined}
                  style={{
                    border: "none", background: "none", cursor: "pointer", padding: "12px 14px", display: "flex", alignItems: "center", gap: 8,
                    fontFamily: FB, fontWeight: 600, fontSize: 14.5, color: on ? C.royal : C.inkMute,
                    borderBottom: `2.5px solid ${on ? C.royal : "transparent"}`, marginBottom: -1,
                  }}
                >
                  <span style={{ fontFamily: FM, fontSize: 11, color: C.inkMute }}>{k + 1}</span>
                  <Icon size={17} /> {MODULE_META[m].label}
                  <Pill style={{ fontSize: 10 }}>{m === "material" ? moduleCount(topic, m) : m === "mcq" ? topic.mcqs.length : topic.exercises.length}</Pill>
                  {isModuleDone(topic, progress, m) && <CheckCircle2 size={15} color={C.green} />}
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: 18 }}>
            {active === "material" && (
              <MaterialViewer key={`${topic.id}-material`} topic={topic} done={progress.material} onComplete={() => markMaterial(topic)} />
            )}
            {active === "mcq" && (
              <McqPanel
                key={`${topic.id}-mcq`}
                mcqs={topic.mcqs}
                passRatio={topic.mcqPassRatio}
                previous={progress.mcq}
                onSubmit={(score, total, passed) => submitMcq(topic, score, total, passed)}
              />
            )}
            {active === "code" && topic.exercises.length > 0 && (
              <CodingQuestions key={`${topic.id}-code`} topic={topic} progress={progress} onSolved={(id) => markCode(topic, id)} />
            )}
          </div>

          <Card style={{ marginTop: 18, padding: 16, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", background: complete ? C.greenBg : C.white, borderColor: complete ? tint(C.green, 30) : C.line }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ fontFamily: FD, fontWeight: 600, fontSize: 15, color: complete ? C.green : C.ink }}>
                {complete ? "Topic complete" : `${left} part${left === 1 ? "" : "s"} left in this topic`}
              </div>
              <div style={{ display: "flex", gap: 14, marginTop: 8, flexWrap: "wrap" }}>
                {modules.map((m) => {
                  const done = isModuleDone(topic, progress, m);
                  return (
                    <button
                      key={m}
                      onClick={() => onOpen(topic.id, m)}
                      style={{ border: "none", background: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: FB, fontSize: 13.5, color: done ? C.green : C.inkSoft }}
                    >
                      {done ? <CheckCircle2 size={15} /> : <Circle size={13} />} {MODULE_META[m].label}
                      {m === "code" && ` (${progress.code.filter((id) => topic.exercises.some((e) => e.id === id)).length}/${topic.exercises.length})`}
                    </button>
                  );
                })}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => prev && onOpen(prev.id, "material")}
                disabled={!prev}
                style={{ border: `1px solid ${C.line}`, background: C.white, borderRadius: 10, padding: "9px 13px", cursor: prev ? "pointer" : "not-allowed", opacity: prev ? 1 : 0.5, fontFamily: FB, fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}
              >
                <ArrowLeft size={15} /> Previous
              </button>
              <button
                onClick={() => (next ? onOpen(next.id, "material") : onBack())}
                style={{ border: "none", background: course.accent, color: "#fff", borderRadius: 10, padding: "9px 16px", cursor: "pointer", fontFamily: FB, fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}
              >
                {next ? "Next topic" : "Back to course"} <ArrowRight size={15} />
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/** Picker across a topic's coding questions, with the editor for the selected one. */
function CodingQuestions({
  topic,
  progress,
  onSolved,
}: {
  topic: Topic;
  progress: TopicProgress;
  onSolved: (exerciseId: string) => void;
}) {
  // Start on the first unsolved question.
  const [selected, setSelected] = useState(() =>
    Math.max(0, topic.exercises.findIndex((e) => !progress.code.includes(e.id))),
  );
  const exercise = topic.exercises[selected];

  return (
    <div>
      {topic.exercises.length > 1 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }} role="tablist" aria-label="Coding questions">
          {topic.exercises.map((e, i) => {
            const on = i === selected;
            const solved = progress.code.includes(e.id);
            return (
              <button
                key={e.id}
                role="tab"
                aria-selected={on}
                onClick={() => setSelected(i)}
                style={{
                  border: `1px solid ${on ? C.royal : solved ? tint(C.green, 35) : C.line}`,
                  background: on ? tint(C.royal, 7) : solved ? C.greenBg : C.white,
                  color: on ? C.royal : solved ? C.green : C.inkSoft,
                  borderRadius: 10, padding: "8px 12px", cursor: "pointer", fontFamily: FB, fontWeight: 600, fontSize: 13.5,
                  display: "flex", alignItems: "center", gap: 8,
                }}
              >
                <span style={{ fontFamily: FM, fontSize: 11, color: C.inkMute }}>Q{i + 1}</span>
                {e.title}
                <span style={{ fontFamily: FM, fontSize: 10.5, color: C.inkMute }}>{e.difficulty}</span>
                {solved && <CheckCircle2 size={14} color={C.green} />}
              </button>
            );
          })}
        </div>
      )}
      <CodePanel key={exercise.id} exercise={exercise} solved={progress.code.includes(exercise.id)} onSolved={() => onSolved(exercise.id)} context="course" />
    </div>
  );
}

function RailItem({
  topic,
  number,
  accent,
  active,
  complete,
  onSelect,
}: {
  topic: Topic;
  number: number;
  accent: string;
  active: boolean;
  complete: boolean;
  onSelect: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (active) ref.current?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [active]);

  return (
    <button
      ref={ref}
      onClick={onSelect}
      aria-current={active ? "page" : undefined}
      style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left", border: "none", borderRadius: 10, padding: "9px 10px", cursor: "pointer", background: active ? tint(accent, 7) : "transparent" }}
    >
      <span style={{ width: 26, height: 26, flex: "none", borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", background: complete ? C.greenBg : C.cream, color: complete ? C.green : C.inkMute, fontFamily: FM, fontSize: 11 }}>
        {complete ? <CheckCircle2 size={15} /> : number}
      </span>
      <span style={{ flex: 1, minWidth: 0, fontSize: 13.5, fontWeight: active ? 600 : 500, color: active ? accent : C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {topic.title}
      </span>
    </button>
  );
}
