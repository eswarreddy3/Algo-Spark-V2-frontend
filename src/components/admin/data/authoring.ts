import type { Difficulty, Exercise, Language, TestCase } from "../../student/labs/types";
import { hashOf } from "./cohort";
import { C } from "../theme";

/**
 * The question bank and the authoring draft.
 *
 * A draft is deliberately the same shape the student runner consumes, so
 * "Publish" here produces an `Exercise` the lab workspace can render as-is.
 */

export type BankStatus = "published" | "review" | "draft";

export type BankItem = {
  id: string;
  title: string;
  difficulty: Difficulty;
  languages: Language[];
  tags: string[];
  author: string;
  status: BankStatus;
  tests: number;
  /** Where the question is attached, or "Unassigned" for bank-only questions. */
  usedIn: string;
  attempts: number;
  solveRate: number;
  updated: string;
};

export const BANK_STATUS_META: Record<BankStatus, { label: string; fg: string; bg: string }> = {
  published: { label: "Published", fg: C.green, bg: C.greenBg },
  review: { label: "In review", fg: C.warn, bg: C.warnBg },
  draft: { label: "Draft", fg: C.inkMute, bg: C.cream },
};

export const QUESTION_BANK: BankItem[] = [
  { id: "q-two-sum", title: "Two Sum", difficulty: "Easy", languages: ["python", "cpp", "java"], tags: ["Arrays", "Hashing"], author: "Dr. Meera Raghavan", status: "published", tests: 8, usedIn: "Data Structures · Week 2", attempts: 412, solveRate: 78, updated: "3 days ago" },
  { id: "q-balanced", title: "Balanced Parentheses", difficulty: "Easy", languages: ["python", "java"], tags: ["Stacks"], author: "Dr. Meera Raghavan", status: "published", tests: 10, usedIn: "Data Structures · Week 4", attempts: 388, solveRate: 71, updated: "1 week ago" },
  { id: "q-lru", title: "LRU Cache", difficulty: "Hard", languages: ["python", "cpp"], tags: ["Design", "Hashing", "Linked list"], author: "Prof. Anand Krishnan", status: "review", tests: 14, usedIn: "Unassigned", attempts: 0, solveRate: 0, updated: "Yesterday" },
  { id: "q-topk", title: "Top K Frequent Elements", difficulty: "Medium", languages: ["python", "java"], tags: ["Heaps", "Hashing"], author: "Dr. Suchitra Menon", status: "published", tests: 9, usedIn: "Data Structures · Week 9", attempts: 244, solveRate: 54, updated: "5 days ago" },
  { id: "q-dept-salary", title: "Second Highest Salary per Department", difficulty: "Medium", languages: ["sql"], tags: ["SQL", "Window functions"], author: "Prof. Anand Krishnan", status: "published", tests: 6, usedIn: "Database Systems · Week 6", attempts: 201, solveRate: 46, updated: "2 days ago" },
  { id: "q-deadlock", title: "Detect a Deadlock Cycle", difficulty: "Hard", languages: ["python", "cpp"], tags: ["OS", "Graphs"], author: "Dr. Suchitra Menon", status: "draft", tests: 4, usedIn: "Unassigned", attempts: 0, solveRate: 0, updated: "Today" },
  { id: "q-rr-sched", title: "Round Robin Scheduling", difficulty: "Medium", languages: ["python", "java"], tags: ["OS", "Simulation"], author: "Dr. Suchitra Menon", status: "published", tests: 11, usedIn: "Operating Systems · Week 3", attempts: 176, solveRate: 63, updated: "1 week ago" },
  { id: "q-merge-intervals", title: "Merge Intervals", difficulty: "Medium", languages: ["python", "cpp", "java"], tags: ["Sorting", "Intervals"], author: "Dr. Meera Raghavan", status: "review", tests: 7, usedIn: "Unassigned", attempts: 0, solveRate: 0, updated: "4 days ago" },
];

export const STARTER_TEMPLATES: Record<Language, string> = {
  python: "def solve(nums, target):\n    # your code here\n    return []\n",
  cpp: "#include <vector>\nusing namespace std;\n\nvector<int> solve(vector<int>& nums, int target) {\n    // your code here\n    return {};\n}\n",
  java: "class Solution {\n    int[] solve(int[] nums, int target) {\n        // your code here\n        return new int[]{};\n    }\n}\n",
  sql: "-- write your query\nSELECT *\nFROM employees;\n",
};

export type DraftTest = TestCase;

export type QuestionDraft = {
  title: string;
  difficulty: Difficulty;
  points: number;
  tags: string;
  languages: Language[];
  statement: string;
  constraints: string;
  targetComplexity: string;
  starter: string;
  primaryLanguage: Language;
  tests: DraftTest[];
  attachTo: string;
};

export const EMPTY_DRAFT: QuestionDraft = {
  title: "",
  difficulty: "Medium",
  points: 30,
  tags: "",
  languages: ["python"],
  statement: "",
  constraints: "",
  targetComplexity: "",
  starter: STARTER_TEMPLATES.python,
  primaryLanguage: "python",
  tests: [
    { id: "t1", name: "Sample", input: "", expected: "" },
    { id: "t2", name: "Hidden 1", input: "", expected: "", hidden: true },
  ],
  attachTo: "unassigned",
};

/** A worked example the demo loads with one click, so the form is never empty. */
export const SAMPLE_DRAFT: QuestionDraft = {
  title: "Rotate an Array by K",
  difficulty: "Medium",
  points: 30,
  tags: "Arrays, Two pointers",
  languages: ["python", "cpp"],
  statement:
    "Given an integer array nums and an integer k, rotate the array to the right by k steps.\n\nThe rotation must happen in place: the function returns nothing and the caller reads nums afterwards. k can be larger than the length of the array.",
  constraints: "1 <= nums.length <= 10^5\n-10^9 <= nums[i] <= 10^9\n0 <= k <= 10^9",
  targetComplexity: "O(n) time, O(1) extra space",
  starter: "def rotate(nums, k):\n    # rotate nums in place\n    pass\n",
  primaryLanguage: "python",
  tests: [
    { id: "t1", name: "Sample", input: "rotate([1,2,3,4,5,6,7], 3)", expected: "[5,6,7,1,2,3,4]" },
    { id: "t2", name: "k larger than n", input: "rotate([1,2], 5)", expected: "[2,1]" },
    { id: "t3", name: "Single element", input: "rotate([9], 4)", expected: "[9]", hidden: true },
    { id: "t4", name: "No rotation", input: "rotate([1,2,3], 0)", expected: "[1,2,3]", hidden: true },
  ],
  attachTo: "cs-ds:8",
};

/** Blocking problems with a draft, in the order the author should fix them. */
export function validateDraft(draft: QuestionDraft): string[] {
  const issues: string[] = [];
  if (draft.title.trim().length < 6) issues.push("Give the question a title of at least 6 characters.");
  if (draft.statement.trim().length < 40) issues.push("The statement is too short for a student to act on.");
  if (!draft.languages.length) issues.push("Allow at least one language.");
  if (!draft.languages.includes(draft.primaryLanguage)) issues.push("The starter code language is not in the allowed list.");
  const filled = draft.tests.filter((t) => t.input.trim() && t.expected.trim());
  if (filled.length < 2) issues.push("Add at least two complete test cases.");
  if (!draft.tests.some((t) => t.hidden)) issues.push("Add at least one hidden test case so the answer cannot be memorised.");
  if (draft.points < 5 || draft.points > 200) issues.push("Points should sit between 5 and 200.");
  return issues;
}

/** Convert the form into the exercise object the student runner consumes. */
export function draftToExercise(draft: QuestionDraft): Exercise {
  const id = `q-${draft.title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || hashOf(draft.title)}`;
  return {
    id,
    title: draft.title.trim(),
    difficulty: draft.difficulty,
    statement: draft.statement.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean),
    constraints: draft.constraints.split("\n").map((c) => c.trim()).filter(Boolean),
    examples: draft.tests
      .filter((t) => !t.hidden && t.input.trim())
      .slice(0, 2)
      .map((t) => ({ input: t.input, output: t.expected })),
    languages: draft.languages,
    starter: { [draft.primaryLanguage]: draft.starter } as Exercise["starter"],
    tests: draft.tests.filter((t) => t.input.trim() && t.expected.trim()),
    points: draft.points,
    targetComplexity: draft.targetComplexity.trim() || undefined,
    signals: draft.tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean),
  };
}
