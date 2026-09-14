import type { Mcq } from "../labs/types";
import { EMAIL_PROMPTS } from "./nontech";
import { PASSAGES } from "./nontech";
import { getProblem } from "./problems";

export type ExamSection =
  | { id: "mcq"; label: string; minutes: number; kind: "mcq"; questions: Mcq[] }
  | { id: "coding"; label: string; minutes: number; kind: "coding"; problemId: string }
  | { id: "email"; label: string; minutes: number; kind: "email"; promptId: string }
  | { id: "reading"; label: string; minutes: number; kind: "reading"; passageId: string };

export const EXAM_MCQS: Mcq[] = [
  {
    id: "e1",
    q: "Which traversal of a binary search tree returns keys in ascending order?",
    opts: ["Pre-order", "In-order", "Post-order", "Level-order"],
    a: 1,
    explain: "Left subtree < node < right subtree, applied recursively.",
  },
  {
    id: "e2",
    q: "The average lookup time of a hash map is:",
    opts: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    a: 0,
    explain: "Constant on average; collisions make the worst case linear.",
  },
  {
    id: "e3",
    q: "Which sorting algorithm is stable and guarantees O(n log n) in the worst case?",
    opts: ["Quicksort", "Merge sort", "Heap sort", "Selection sort"],
    a: 1,
    explain: "Merge sort is stable and always O(n log n); quicksort degrades to O(n²).",
  },
  {
    id: "e4",
    q: "A queue implemented with two stacks gives what amortised dequeue cost?",
    opts: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
    a: 0,
    explain: "Each element moves between the stacks at most once.",
  },
  {
    id: "e5",
    q: "In SQL, which clause filters rows after GROUP BY?",
    opts: ["WHERE", "HAVING", "ON", "ORDER BY"],
    a: 1,
    explain: "WHERE runs before grouping; HAVING filters the groups.",
  },
  {
    id: "e6",
    q: "Which of these is NOT a Coffman condition for deadlock?",
    opts: ["Mutual exclusion", "Hold and wait", "Preemption", "Circular wait"],
    a: 2,
    explain: "The condition is *no* preemption; allowing preemption breaks deadlock.",
  },
  {
    id: "e7",
    q: "Depth-first search on a graph is naturally implemented with:",
    opts: ["A queue", "A stack or recursion", "A heap", "A hash map"],
    a: 1,
    explain: "DFS follows one branch to its end, which is LIFO behaviour.",
  },
  {
    id: "e8",
    q: "What is the space complexity of merge sort on an array of n elements?",
    opts: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    a: 2,
    explain: "The merge step needs an auxiliary array of the same size.",
  },
  {
    id: "e9",
    q: "A process waiting for disk I/O is in which state?",
    opts: ["Ready", "Running", "Waiting", "Terminated"],
    a: 2,
    explain: "It cannot use the CPU until the I/O completes.",
  },
  {
    id: "e10",
    q: "Binary search requires the input to be:",
    opts: ["Sorted", "Distinct", "Positive", "A power of two in length"],
    a: 0,
    explain: "Halving only works when order tells you which side to discard.",
  },
];

export const EXAM = {
  id: "mock-4",
  title: "Placement Mock #4",
  totalMinutes: 90,
  /** Leaderboard points for a perfect paper; the score scales them. */
  maxPoints: 300,
  windowCloses: "Today · 6:00 PM",
  instructions: [
    "The timer runs for the whole paper — you may move between sections freely.",
    "MCQs are auto-graded and coding is judged on hidden tests. Email writing and paragraph reading are graded by AI — you get a score, written feedback and suggestions.",
    "Flag a question to come back to it; flagged questions show in the palette.",
    "The paper submits automatically when the timer reaches zero.",
    "After you submit, a short feedback form is mandatory — your results appear once it is sent.",
  ],
  sections: [
    { id: "mcq", label: "MCQ", minutes: 25, kind: "mcq", questions: EXAM_MCQS },
    { id: "coding", label: "Coding", minutes: 40, kind: "coding", problemId: "merge-intervals" },
    { id: "email", label: "Email writing", minutes: 15, kind: "email", promptId: EMAIL_PROMPTS[1].id },
    { id: "reading", label: "Paragraph reading", minutes: 10, kind: "reading", passageId: PASSAGES[1].id },
  ] as ExamSection[],
};

export function examCodingExercise() {
  return getProblem("merge-intervals")?.exercise;
}

export type ExamListing = {
  id: string;
  title: string;
  /** Sections, in words. */
  format: string;
  minutes: number;
  status: "open" | "upcoming";
  /** Display label for when it opens or closes. */
  when: string;
  /** Days until it opens (0 = open now). The AI coach plans around this. */
  daysFromNow: number;
};

/** Exams assigned to the student's cohort by the Super Admin. */
export const EXAM_LISTINGS: ExamListing[] = [
  { id: EXAM.id, title: EXAM.title, format: "MCQ · Coding · Email · Reading", minutes: EXAM.totalMinutes, status: "open", when: "Open now · closes today 6:00 PM", daysFromNow: 0 },
  { id: "aptitude-sprint-2", title: "Aptitude Sprint #2", format: "MCQ · Paragraph reading", minutes: 45, status: "upcoming", when: "Opens Friday · 10:00 AM", daysFromNow: 4 },
  { id: "mock-5", title: "Placement Mock #5", format: "MCQ · Coding · Email · Reading", minutes: 90, status: "upcoming", when: "Opens in 11 days", daysFromNow: 11 },
];
