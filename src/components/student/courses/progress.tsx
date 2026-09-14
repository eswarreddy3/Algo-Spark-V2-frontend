"use client";

/**
 * Course progress per topic: material read, MCQs passed, coding questions
 * solved. Same contract as the labs store — localStorage here, a progress API
 * in the real app — but courses are self-paced, so nothing is locked.
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { courseTopics, type Course, type Topic } from "../data/courses";
import type { AwardEvent } from "../labs/progress";
import type { TopicModule } from "../nav";
import { ALL_COURSES } from "./catalog";

export type TopicProgress = {
  material: boolean;
  mcq: { score: number; total: number; passed: boolean } | null;
  /** Ids of the coding questions solved in this topic. */
  code: string[];
  completedAt: string | null;
};

type State = Record<string, TopicProgress>;

const STORAGE_KEY = "algospark.courses.v2";

const emptyTopic: TopicProgress = { material: false, mcq: null, code: [], completedAt: null };

function seedState(): State {
  const state: State = {};
  for (const course of ALL_COURSES) {
    courseTopics(course)
      .slice(0, course.completedSeed)
      .forEach((topic) => {
        state[topic.id] = {
          material: true,
          mcq: { score: topic.mcqs.length, total: topic.mcqs.length, passed: true },
          code: topic.exercises.map((e) => e.id),
          completedAt: "seeded",
        };
      });
  }
  return state;
}

/** Modules a topic actually has; non-tech topics skip coding. */
export function topicModules(topic: Topic): TopicModule[] {
  return topic.exercises.length ? ["material", "mcq", "code"] : ["material", "mcq"];
}

/** Coding counts as done only once every coding question in the topic is solved. */
export function isModuleDone(topic: Topic, progress: TopicProgress, module: TopicModule) {
  if (module === "material") return progress.material;
  if (module === "mcq") return Boolean(progress.mcq?.passed);
  return topic.exercises.every((e) => progress.code.includes(e.id));
}

type Ctx = {
  topicProgress: (topicId: string) => TopicProgress;
  isTopicComplete: (topicId: string) => boolean;
  courseStats: (course: Course) => { completed: number; total: number; percent: number; points: number };
  /** First topic not yet complete, or the last topic when the course is finished. */
  nextTopic: (course: Course) => Topic;
  markMaterial: (topic: Topic) => void;
  submitMcq: (topic: Topic, score: number, total: number, passed: boolean) => void;
  markCode: (topic: Topic, exerciseId: string) => void;
};

const CourseProgressContext = createContext<Ctx | null>(null);

export function CourseProgressProvider({
  children,
  onAward,
}: {
  children: React.ReactNode;
  onAward?: (event: AwardEvent) => void;
}) {
  const [state, setState] = useState<State>(seedState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrating from an external store
      if (raw) setState(JSON.parse(raw) as State);
    } catch {
      /* storage blocked — the seed is a fine starting point */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* progress simply won't survive a reload */
    }
  }, [state, hydrated]);

  const topicProgress = useCallback((topicId: string) => state[topicId] ?? emptyTopic, [state]);
  const isTopicComplete = useCallback((topicId: string) => Boolean(state[topicId]?.completedAt), [state]);

  const courseStats = useCallback(
    (course: Course) => {
      const topics = courseTopics(course);
      const done = topics.filter((t) => isTopicComplete(t.id));
      return {
        completed: done.length,
        total: topics.length,
        percent: topics.length ? Math.round((done.length / topics.length) * 100) : 0,
        points: done.reduce((sum, t) => sum + t.points, 0),
      };
    },
    [isTopicComplete],
  );

  const nextTopic = useCallback(
    (course: Course) => {
      const topics = courseTopics(course);
      return topics.find((t) => !isTopicComplete(t.id)) ?? topics[topics.length - 1];
    },
    [isTopicComplete],
  );

  /** Applies one module, and completes the topic once every module it has is done. */
  const advance = useCallback(
    (topic: Topic, patch: (before: TopicProgress) => Partial<TopicProgress>) => {
      const before = state[topic.id] ?? emptyTopic;
      const next: TopicProgress = { ...before, ...patch(before) };
      if (!before.completedAt && topicModules(topic).every((m) => isModuleDone(topic, next, m))) {
        next.completedAt = new Date().toISOString();
        onAward?.({ ref: `topic:${topic.id}`, points: topic.points, title: "Topic complete!", sub: `+${topic.points} XP · ${topic.title}` });
      }
      setState((prev) => ({ ...prev, [topic.id]: next }));
    },
    [state, onAward],
  );

  const value = useMemo<Ctx>(
    () => ({
      topicProgress,
      isTopicComplete,
      courseStats,
      nextTopic,
      markMaterial: (topic) => advance(topic, () => ({ material: true })),
      submitMcq: (topic, score, total, passed) => advance(topic, () => ({ mcq: { score, total, passed } })),
      markCode: (topic, exerciseId) =>
        advance(topic, (b) => ({ code: b.code.includes(exerciseId) ? b.code : [...b.code, exerciseId] })),
    }),
    [topicProgress, isTopicComplete, courseStats, nextTopic, advance],
  );

  return <CourseProgressContext.Provider value={value}>{children}</CourseProgressContext.Provider>;
}

export function useCourseProgress() {
  const ctx = useContext(CourseProgressContext);
  if (!ctx) throw new Error("useCourseProgress must be used inside <CourseProgressProvider>");
  return ctx;
}
