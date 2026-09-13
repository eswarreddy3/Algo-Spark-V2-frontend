import { TECH_COURSES, type Course, type CourseScope } from "../data/courses";
import { COURSES as NONTECH_COURSES } from "../data/nontech";

export const ALL_COURSES: Course[] = [...TECH_COURSES, ...NONTECH_COURSES];

export function coursesFor(scope: CourseScope) {
  return scope === "tech" ? TECH_COURSES : NONTECH_COURSES;
}

export function getCourse(courseId: string) {
  return ALL_COURSES.find((c) => c.id === courseId);
}
