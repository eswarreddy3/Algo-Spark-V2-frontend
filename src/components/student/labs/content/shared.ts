import type { Week } from "../types";

/**
 * A week the faculty has not released yet. It still appears in the rail with
 * its outline so students can see what is coming.
 */
export function upcoming(
  n: number,
  title: string,
  summary: string,
  releasesOn: string,
  objectives: string[],
): Week {
  return {
    n,
    title,
    summary,
    objectives,
    points: 150,
    published: false,
    releasesOn,
    slides: [],
    readingMinutes: 0,
    resources: [],
    mcqs: [],
    mcqPassRatio: 0.6,
    exercise: null,
  };
}
