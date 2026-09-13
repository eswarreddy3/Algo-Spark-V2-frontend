import { LEADERBOARDS } from "../../student/data/leaderboard";
import type { RiskKey } from "../theme";

/**
 * The cohort the admin console reports on.
 *
 * In the real product this is the roster endpoint. Here the batch is generated
 * from a fixed seed so every number — a branch average, a chart bar, a rank —
 * is identical on the server and in the browser, and stable between renders.
 * The students who appear on the student app's leaderboard are seeded in by
 * name, so both demos describe the same college.
 */

export type Branch = "CSE" | "IT" | "ECE" | "EEE" | "MECH" | "CIVIL";

export type Student = {
  id: string;
  roll: string;
  name: string;
  branch: Branch;
  section: string;
  year: 2 | 3 | 4;
  email: string;
  points: number;
  solved: number;
  streak: number;
  /** Percent complete per lab id, mirroring the student app's lab catalog. */
  labs: Record<string, number>;
  examAvg: number;
  attendance: number;
  /** 0 means active today. */
  lastActiveDays: number;
  risk: RiskKey;
  placementReady: boolean;
};

export const LAB_IDS = ["cs-ds", "cs-db", "cs-os"] as const;

export const BRANCHES: Branch[] = ["CSE", "IT", "ECE", "EEE", "MECH", "CIVIL"];

/** Sections per branch. CSE runs three, the smaller branches one. */
const SECTIONS: Record<Branch, string[]> = {
  CSE: ["A", "B", "C"],
  IT: ["A", "B"],
  ECE: ["A", "B"],
  EEE: ["A"],
  MECH: ["A", "B"],
  CIVIL: ["A"],
};

const BRANCH_CODE: Record<Branch, string> = {
  CSE: "CS", IT: "IT", ECE: "EC", EEE: "EE", MECH: "ME", CIVIL: "CE",
};

/** How many students each branch contributes to the generated batch. */
const BRANCH_SIZE: Record<Branch, number> = {
  CSE: 186, IT: 124, ECE: 118, EEE: 62, MECH: 96, CIVIL: 58,
};

/**
 * Branch-level bias on completion. The CS branches have run the platform for a
 * year longer, so a flat random batch would misrepresent the spread the
 * placement cell actually sees.
 */
const BRANCH_BIAS: Record<Branch, number> = {
  CSE: 12, IT: 7, ECE: -1, EEE: -6, MECH: -9, CIVIL: -14,
};

const FIRST = [
  "Aarav", "Ananya", "Rohan", "Meera", "Kavya", "Sahil", "Neha", "Imran", "Divya", "Tanmay",
  "Priya", "Karthik", "Vikram", "Sanjana", "Harsh", "Sneha", "Farhan", "Ritika", "Joel", "Nikhil",
  "Ishita", "Pranav", "Anjali", "Rahul", "Sneha", "Varun", "Lakshmi", "Arjun", "Pooja", "Siddharth",
  "Aisha", "Manav", "Trisha", "Yash", "Bhavya", "Rishi", "Nandini", "Akhil", "Swathi", "Dev",
];

const LAST = [
  "Sharma", "Nair", "Das", "Joshi", "Menon", "Bhat", "Pillai", "Qureshi", "Suresh", "Gupta",
  "Reddy", "Iyer", "Rao", "Vardhan", "Ali", "Shah", "Mathew", "Kulkarni", "Banerjee", "Chauhan",
  "Verma", "Naidu", "Kapoor", "Sinha",
];

/** Deterministic 32-bit PRNG — same sequence on server and client. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Stable hash so a lab, week or exam always derives the same numbers. */
export function hashOf(key: string) {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const rand = mulberry32(20260909);
const pick = <T,>(arr: readonly T[]) => arr[Math.floor(rand() * arr.length)];
const between = (lo: number, hi: number) => lo + Math.floor(rand() * (hi - lo + 1));

function riskOf(lastActiveDays: number, completion: number, examAvg: number): RiskKey {
  if (lastActiveDays >= 14 || completion < 25) return "critical";
  if (lastActiveDays >= 7 || completion < 45 || examAvg < 40) return "atRisk";
  if (lastActiveDays >= 3 || completion < 65) return "watch";
  return "healthy";
}

function makeStudent(name: string, branch: Branch, section: string, index: number, strong: boolean): Student {
  const year = (pick([3, 3, 3, 4, 2]) as 2 | 3 | 4);
  const base = (strong ? between(62, 96) : between(18, 84)) + BRANCH_BIAS[branch];
  const labs: Record<string, number> = {};
  for (const labId of LAB_IDS) {
    labs[labId] = Math.max(0, Math.min(100, base + between(-16, 14)));
  }
  const completion = Math.round(LAB_IDS.reduce((sum, id) => sum + labs[id], 0) / LAB_IDS.length);
  // Most of the batch is here this week; the tail spreads out to a month away.
  const lastActiveDays = strong ? between(0, 2) : rand() < 0.58 ? between(0, 1) : between(2, 29);
  const examAvg = Math.max(12, Math.min(98, Math.round(completion * 0.75 + between(-12, 22))));
  const solved = Math.round((completion / 100) * between(60, 140));
  const roll = `2${year === 4 ? 0 : year === 3 ? 1 : 2}${BRANCH_CODE[branch]}${String(index).padStart(3, "0")}`;

  return {
    id: `st-${roll.toLowerCase()}`,
    roll,
    name,
    branch,
    section: `${branch}-${section}`,
    year,
    email: `${roll.toLowerCase()}@svit.edu.in`,
    // Scaled to stay below the seeded toppers, so the college leaderboard the
    // student app shows still has the same names at the top.
    points: Math.round(completion * between(24, 38) + solved * 6),
    solved,
    streak: lastActiveDays === 0 ? between(1, 28) : 0,
    labs,
    examAvg,
    attendance: Math.max(48, Math.min(100, Math.round(completion * 0.4 + between(52, 62)))),
    lastActiveDays,
    risk: riskOf(lastActiveDays, completion, examAvg),
    placementReady: completion >= 70 && examAvg >= 62,
  };
}

/** Roll numbers the student app already shows, so both demos name one person. */
const FIXED_ROLLS: Record<string, string> = { "Aditya Kumar": "21CS042" };

function buildRoster(): Student[] {
  const out: Student[] = [];
  const used = new Set<string>();
  let counter = 1;

  // The leaderboard names the student app shows are real people in this batch.
  for (const row of LEADERBOARDS.College) {
    const branch = (row.group.split("-")[0] as Branch) ?? "CSE";
    const section = row.group.split("-")[1] ?? "A";
    const s = makeStudent(row.name, branch, section, counter++, true);
    const roll = FIXED_ROLLS[row.name] ?? `21${BRANCH_CODE[branch]}${String(counter).padStart(3, "0")}`;
    used.add(row.name);
    out.push({
      ...s,
      // The student app places this cohort in semester 3, so every seeded
      // student is a third-year rather than whatever the generator rolled.
      year: 3,
      roll,
      id: `st-${roll.toLowerCase()}`,
      email: `${roll.toLowerCase()}@svit.edu.in`,
      points: row.points,
      solved: row.solved,
      streak: row.streak,
      lastActiveDays: 0,
      risk: "healthy",
    });
  }

  for (const branch of BRANCHES) {
    const seeded = out.filter((s) => s.branch === branch).length;
    for (let i = seeded; i < BRANCH_SIZE[branch]; i++) {
      let name = `${pick(FIRST)} ${pick(LAST)}`;
      let guard = 0;
      while (used.has(name) && guard++ < 12) name = `${pick(FIRST)} ${pick(LAST)}`;
      used.add(name);
      out.push(makeStudent(name, branch, pick(SECTIONS[branch]), counter++, rand() > 0.62));
    }
  }

  return out.sort((a, b) => b.points - a.points);
}

export const STUDENTS: Student[] = buildRoster();

export const SECTION_LIST: string[] = Array.from(new Set(STUDENTS.map((s) => s.section))).sort();

export function getStudent(id: string) {
  return STUDENTS.find((s) => s.id === id);
}

export function completionOf(student: Student) {
  return Math.round(LAB_IDS.reduce((sum, id) => sum + student.labs[id], 0) / LAB_IDS.length);
}

const avg = (nums: number[]) => (nums.length ? Math.round(nums.reduce((a, b) => a + b, 0) / nums.length) : 0);

export type BranchStat = {
  branch: Branch;
  students: number;
  completion: number;
  examAvg: number;
  attendance: number;
  atRisk: number;
  placementReady: number;
};

export const BRANCH_STATS: BranchStat[] = BRANCHES.map((branch) => {
  const rows = STUDENTS.filter((s) => s.branch === branch);
  return {
    branch,
    students: rows.length,
    completion: avg(rows.map(completionOf)),
    examAvg: avg(rows.map((s) => s.examAvg)),
    attendance: avg(rows.map((s) => s.attendance)),
    atRisk: rows.filter((s) => s.risk === "atRisk" || s.risk === "critical").length,
    placementReady: rows.filter((s) => s.placementReady).length,
  };
}).sort((a, b) => b.completion - a.completion);

export const COHORT = {
  college: "Sri Vasavi Institute of Technology",
  batch: "Batch of 2027 · Semester 3",
  students: STUDENTS.length,
  activeToday: STUDENTS.filter((s) => s.lastActiveDays === 0).length,
  completion: avg(STUDENTS.map(completionOf)),
  examAvg: avg(STUDENTS.map((s) => s.examAvg)),
  atRisk: STUDENTS.filter((s) => s.risk === "atRisk" || s.risk === "critical").length,
  placementReady: STUDENTS.filter((s) => s.placementReady).length,
  submissionsThisWeek: STUDENTS.reduce((sum, s) => sum + Math.round(s.solved / 9), 0),
};

/** Submissions per weekday for the last fortnight, oldest first. */
export const ACTIVITY: { label: string; submissions: number; active: number }[] = (() => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return Array.from({ length: 14 }, (_, i) => {
    const r = mulberry32(hashOf(`activity-${i}`));
    const weekday = days[i % 7];
    const weekend = weekday === "Sat" || weekday === "Sun";
    const scale = weekend ? 0.45 : 1;
    return {
      label: weekday,
      submissions: Math.round((240 + r() * 220) * scale) + i * 4,
      active: Math.round((70 + r() * 60) * scale),
    };
  });
})();

/** The students the placement cell should chase first. */
export const AT_RISK = STUDENTS.filter((s) => s.risk === "critical" || s.risk === "atRisk")
  .sort((a, b) => b.lastActiveDays - a.lastActiveDays || completionOf(a) - completionOf(b))
  .slice(0, 24);
