/** Domain model for lab courses. The prototype and the real app share this shape. */

export type Language = "python" | "cpp" | "java" | "sql";

export const LANGUAGE_LABEL: Record<Language, string> = {
  python: "Python 3",
  cpp: "C++ 17",
  java: "Java 17",
  sql: "SQLite",
};

export type Difficulty = "Easy" | "Medium" | "Hard";

export type TestCase = {
  id: string;
  name: string;
  /** Shown to the student as the call / stdin for this case. */
  input: string;
  expected: string;
  /** Hidden cases run on submit only. */
  hidden?: boolean;
};

export type SqlColumn = { key: string; label: string };

export type Exercise = {
  id: string;
  title: string;
  difficulty: Difficulty;
  /** Paragraphs of the problem statement. */
  statement: string[];
  constraints: string[];
  examples: { input: string; output: string; note?: string }[];
  languages: Language[];
  starter: Partial<Record<Language, string>>;
  tests: TestCase[];
  points: number;
  targetComplexity?: string;
  /**
   * Lowercase tokens a correct solution is expected to contain. The demo runner
   * uses them to decide a verdict; the real runner ignores them and executes
   * the code against `tests` on the judge service.
   */
  signals: string[];
  /** SQL exercises render their output as a result grid instead of stdout. */
  resultColumns?: SqlColumn[];
  resultRows?: (string | number)[][];
};

export type Mcq = {
  id: string;
  q: string;
  opts: string[];
  /** Index of the correct option. */
  a: number;
  explain: string;
};

export type Slide = {
  title: string;
  bullets: string[];
  code?: { language: Language; source: string };
  note?: string;
};

export type Resource = {
  label: string;
  kind: "pdf" | "video" | "link";
  meta: string;
};

export type Week = {
  n: number;
  title: string;
  summary: string;
  objectives: string[];
  points: number;
  slides: Slide[];
  readingMinutes: number;
  resources: Resource[];
  mcqs: Mcq[];
  /** Pass mark for the MCQ set, as a fraction of the questions. */
  mcqPassRatio: number;
  exercise: Exercise | null;
};

export type Lab = {
  id: string;
  code: string;
  name: string;
  description: string;
  semester: string;
  faculty: string;
  schedule: string;
  room: string;
  accent: string;
  /** Weeks are ordered; `weeks[i].n === i + 1`. */
  weeks: Week[];
};

export const DIFF_COLOR: Record<Difficulty, string> = {
  Easy: "#12B886",
  Medium: "#F59E0B",
  Hard: "#E5484D",
};
