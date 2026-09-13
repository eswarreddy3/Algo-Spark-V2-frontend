"use client";

import React from "react";
import type { CourseScope } from "../data/courses";
import { initialCourseRoute, type CourseRoute } from "../nav";
import { coursesFor, getCourse } from "./catalog";
import { CourseCatalog } from "./CourseCatalog";
import { CourseDetail } from "./CourseDetail";
import { TopicPlayer } from "./TopicPlayer";

/** Courses for Tech or Non-Tech: card catalog → course overview → topic player. */
export function CoursesSection({
  scope,
  route,
  setRoute,
}: {
  scope: CourseScope;
  route: CourseRoute;
  setRoute: (route: CourseRoute) => void;
}) {
  const course = route.courseId ? getCourse(route.courseId) : undefined;
  const top = () => window.scrollTo({ top: 0, behavior: "smooth" });

  if (!course) {
    return <CourseCatalog courses={coursesFor(scope)} onOpen={(courseId) => { setRoute({ ...initialCourseRoute, courseId }); top(); }} />;
  }

  const openTopic = (topicId: string, module: CourseRoute["module"]) => {
    if (topicId !== route.topicId) top();
    setRoute({ courseId: course.id, topicId, module });
  };

  if (!route.topicId) {
    return <CourseDetail course={course} onBack={() => setRoute(initialCourseRoute)} onOpenTopic={openTopic} />;
  }

  return (
    <TopicPlayer
      course={course}
      topicId={route.topicId}
      module={route.module}
      onOpen={openTopic}
      onBack={() => { setRoute({ ...initialCourseRoute, courseId: course.id }); top(); }}
    />
  );
}
