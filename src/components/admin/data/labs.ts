import { LABS } from "../../student/labs/catalog";
import { STUDENTS, hashOf } from "./cohort";

/**
 * Lab administration data. The catalog itself is the one the student app
 * renders — same ids, weeks and faculty — so publishing a week here is
 * publishing the week a student sees. Per-week engagement is derived from a
 * stable hash of the lab and week number.
 */

export type WeekStat = {
  n: number;
  title: string;
  /** Weeks past the published cut-off are still drafts. */
  publishedByDefault: boolean;
  submissions: number;
  avgScore: number;
  passRate: number;
  avgMinutes: number;
  /** Submissions the similarity check flagged for a human to look at. */
  flagged: number;
};

export type AdminLab = {
  id: string;
  code: string;
  name: string;
  faculty: string;
  schedule: string;
  room: string;
  accent: string;
  semester: string;
  enrolled: number;
  weeks: WeekStat[];
  /** Weeks 1..publishedThrough are live for students by default. */
  publishedThrough: number;
};

const PUBLISHED_THROUGH: Record<string, number> = { "cs-ds": 7, "cs-db": 5, "cs-os": 4 };

/** Which branches sit in each lab — the CS labs run for CSE and IT. */
const ENROLLED_BRANCHES = ["CSE", "IT"];

export const ADMIN_LABS: AdminLab[] = LABS.map((lab) => {
  const through = PUBLISHED_THROUGH[lab.id] ?? Math.ceil(lab.weeks.length / 2);
  const enrolled = STUDENTS.filter((s) => ENROLLED_BRANCHES.includes(s.branch)).length;

  return {
    id: lab.id,
    code: lab.code,
    name: lab.name,
    faculty: lab.faculty,
    schedule: lab.schedule,
    room: lab.room,
    accent: lab.accent,
    semester: lab.semester,
    enrolled,
    publishedThrough: through,
    weeks: lab.weeks.map((w) => {
      // hashOf is unsigned; the shifts below must be too, or the modulo turns negative.
      const h = hashOf(`${lab.id}-w${w.n}`);
      const decay = Math.max(0.32, 1 - (w.n - 1) * 0.055);
      const submissions = Math.round(enrolled * decay * (0.72 + ((h >>> 3) % 24) / 100));
      return {
        n: w.n,
        title: w.title,
        publishedByDefault: w.n <= through,
        submissions: w.n <= through ? submissions : 0,
        avgScore: 58 + (h % 32),
        // Pass rate tracks the average score rather than floating free, so a
        // week never shows a low average beside a near-perfect pass rate.
        passRate: Math.min(97, Math.max(31, 58 + (h % 32) - 12 + ((h >>> 5) % 24))),
        avgMinutes: 22 + ((h >>> 9) % 40),
        flagged: w.n <= through ? (h >>> 11) % 4 : 0,
      };
    }),
  };
});

export function getAdminLab(labId: string) {
  return ADMIN_LABS.find((l) => l.id === labId);
}

/** Faculty roster, derived from the labs they own. */
export const FACULTY = ADMIN_LABS.map((lab) => ({
  name: lab.faculty,
  labId: lab.id,
  lab: lab.name,
  pendingReviews: (hashOf(lab.faculty) % 9) + 1,
}));
