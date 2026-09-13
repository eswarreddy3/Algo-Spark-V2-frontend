import { BRANCHES, STUDENTS, hashOf, type Branch, type Student } from "./cohort";
import type { StatusKey } from "../theme";

/**
 * Placement-style mock exams the cell schedules for the batch. Score
 * distributions are derived from the roster so the histogram on the exam page
 * agrees with the roster's exam averages.
 */

export type ExamSection = { name: string; questions: number; minutes: number; avgPercent: number };

export type Exam = {
  id: string;
  title: string;
  window: string;
  duration: string;
  status: StatusKey;
  audience: string;
  registered: number;
  attempted: number;
  avgScore: number;
  topScore: number;
  cutoff: number;
  sections: ExamSection[];
};

const audienceCount = (branches: Branch[]) => STUDENTS.filter((s) => branches.includes(s.branch)).length;

const SECTION_SETS: ExamSection[][] = [
  [
    { name: "Aptitude", questions: 20, minutes: 20, avgPercent: 68 },
    { name: "Verbal", questions: 15, minutes: 15, avgPercent: 74 },
    { name: "Coding", questions: 2, minutes: 40, avgPercent: 51 },
    { name: "SQL", questions: 5, minutes: 15, avgPercent: 62 },
  ],
  [
    { name: "Aptitude", questions: 25, minutes: 25, avgPercent: 64 },
    { name: "Technical MCQ", questions: 20, minutes: 20, avgPercent: 59 },
    { name: "Coding", questions: 3, minutes: 45, avgPercent: 47 },
  ],
  [
    { name: "Verbal", questions: 20, minutes: 20, avgPercent: 71 },
    { name: "Email writing", questions: 1, minutes: 20, avgPercent: 66 },
    { name: "Reading", questions: 10, minutes: 20, avgPercent: 69 },
  ],
];

export const EXAMS: Exam[] = [
  {
    id: "ex-mock4",
    title: "Placement Mock #4",
    window: "Today · 10:00 AM – 6:00 PM",
    duration: "90 min",
    status: "live",
    audience: "CSE, IT · Year 3",
    registered: audienceCount(["CSE", "IT"]),
    attempted: Math.round(audienceCount(["CSE", "IT"]) * 0.64),
    avgScore: 58,
    topScore: 94,
    cutoff: 60,
    sections: SECTION_SETS[0],
  },
  {
    id: "ex-tcs",
    title: "TCS NQT Pattern Test",
    window: "Fri, 12 Sep · 9:00 AM – 1:00 PM",
    duration: "110 min",
    status: "scheduled",
    audience: "All branches · Year 3 & 4",
    registered: STUDENTS.filter((s) => s.year >= 3).length,
    attempted: 0,
    avgScore: 0,
    topScore: 0,
    cutoff: 55,
    sections: SECTION_SETS[1],
  },
  {
    id: "ex-comm",
    title: "Communication Round Practice",
    window: "Draft · not scheduled",
    duration: "60 min",
    status: "draft",
    audience: "MECH, CIVIL, EEE",
    registered: 0,
    attempted: 0,
    avgScore: 0,
    topScore: 0,
    cutoff: 50,
    sections: SECTION_SETS[2],
  },
  {
    id: "ex-mock3",
    title: "Placement Mock #3",
    window: "Closed · 22 Aug",
    duration: "90 min",
    status: "closed",
    audience: "CSE, IT · Year 3",
    registered: audienceCount(["CSE", "IT"]),
    attempted: Math.round(audienceCount(["CSE", "IT"]) * 0.91),
    avgScore: 54,
    topScore: 91,
    cutoff: 60,
    sections: SECTION_SETS[0],
  },
  {
    id: "ex-mock2",
    title: "Placement Mock #2",
    window: "Closed · 4 Aug",
    duration: "90 min",
    status: "closed",
    audience: "CSE, IT · Year 3",
    registered: audienceCount(["CSE", "IT"]),
    attempted: Math.round(audienceCount(["CSE", "IT"]) * 0.88),
    avgScore: 49,
    topScore: 88,
    cutoff: 60,
    sections: SECTION_SETS[0],
  },
];

export function getExam(id: string) {
  return EXAMS.find((e) => e.id === id);
}

export type Attempt = { student: Student; score: number };

/** The branches a paper is written for. */
function audienceBranches(exam: Exam): Branch[] {
  if (exam.audience.startsWith("All")) return BRANCHES;
  return BRANCHES.filter((b) => exam.audience.includes(b));
}

/**
 * Who actually sat the paper, and what they scored.
 *
 * Every read of an exam's results — the histogram, the branch table, the top
 * performers, the CSV — goes through this one sample, so the numbers on the
 * page can never disagree with each other. The subset is chosen by a stable
 * hash rather than by rank, so the sample spans the whole ability range the way
 * a real sitting does.
 */
export function attemptsFor(exam: Exam): Attempt[] {
  if (exam.attempted === 0) return [];
  const population = STUDENTS.filter((s) => audienceBranches(exam).includes(s.branch));
  const shift = exam.avgScore - 60;

  return population
    .slice()
    .sort((a, b) => hashOf(`${exam.id}-${a.id}`) - hashOf(`${exam.id}-${b.id}`))
    .slice(0, exam.attempted)
    .map((student) => ({
      student,
      score: Math.max(4, Math.min(99, student.examAvg + shift + ((hashOf(`${exam.id}-score-${student.id}`) % 15) - 7))),
    }))
    .sort((a, b) => b.score - a.score);
}

/** Ten-point score buckets for an exam, 0-9 … 90-99. */
export function distributionFor(attempts: Attempt[]): { bucket: string; count: number }[] {
  const buckets = Array.from({ length: 10 }, (_, i) => ({ bucket: `${i * 10}`, count: 0 }));
  for (const a of attempts) buckets[Math.floor(a.score / 10)].count++;
  return buckets;
}

/** Branch-wise average and pass rate against the paper's cutoff. */
export function branchResultsFor(exam: Exam, attempts: Attempt[]) {
  return audienceBranches(exam)
    .map((branch) => {
      const rows = attempts.filter((a) => a.student.branch === branch);
      if (!rows.length) return { branch, attempted: 0, avg: 0, passRate: 0 };
      return {
        branch,
        attempted: rows.length,
        avg: Math.round(rows.reduce((sum, a) => sum + a.score, 0) / rows.length),
        passRate: Math.round((rows.filter((a) => a.score >= exam.cutoff).length / rows.length) * 100),
      };
    })
    .filter((r) => r.attempted > 0);
}
