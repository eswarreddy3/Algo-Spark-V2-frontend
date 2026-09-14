import type { Week } from "../types";

/**
 * A week whose outline exists but whose PPT, MCQs and code the Super Admin has
 * not authored yet. It unlocks through completion like any other week; until
 * content is added the workspace shows the outline.
 */
export function outline(n: number, title: string, summary: string, objectives: string[]): Week {
  return {
    n,
    title,
    summary,
    objectives,
    points: 150,
    slides: [],
    readingMinutes: 0,
    resources: [],
    mcqs: [],
    mcqPassRatio: 0.6,
    exercise: null,
  };
}

/** Whether a week has any authored content to work through. */
export function hasContent(week: Week) {
  return week.slides.length > 0 || week.mcqs.length > 0 || week.exercise !== null;
}
