import { Brackets, Layers, Network, type LucideIcon } from "lucide-react";
import type { Difficulty } from "../labs/types";
import { C } from "../../theme/tokens";
import { PRACTICE_PROBLEMS, type PracticeProblem } from "./problems";

/**
 * The module-wise coding page. Problems are grouped module by module first;
 * inside a module they are segregated by company, topic and difficulty. The
 * set is separate from lab exercises and practice-only — nothing here gates
 * weekly progression.
 */
export type ProblemModule = {
  id: string;
  title: string;
  blurb: string;
  icon: LucideIcon;
  color: string;
  problemIds: string[];
};

export const PROBLEM_MODULES: ProblemModule[] = [
  {
    id: "arrays-hashing",
    title: "Arrays & Hashing",
    blurb: "Single passes, lookups, grouping and interval sweeps",
    icon: Brackets,
    color: C.royal,
    problemIds: ["two-sum", "group-anagrams", "merge-intervals"],
  },
  {
    id: "stacks-lists-design",
    title: "Stacks, Lists & Design",
    blurb: "LIFO patterns, pointer structures and API design",
    icon: Layers,
    color: C.goldDeep,
    problemIds: ["valid-parentheses", "lru-cache"],
  },
  {
    id: "search-heaps-graphs",
    title: "Searching, Heaps & Graphs",
    blurb: "Binary search, priority queues and shortest paths",
    icon: Network,
    color: C.violet,
    problemIds: ["kth-largest", "median-two-arrays", "word-ladder"],
  },
];

export type ModuleWithProblems = ProblemModule & {
  problems: PracticeProblem[];
  byDifficulty: Record<Difficulty, number>;
};

function withProblems(module: ProblemModule, problems: PracticeProblem[]): ModuleWithProblems {
  const byDifficulty: Record<Difficulty, number> = { Easy: 0, Medium: 0, Hard: 0 };
  problems.forEach((p) => { byDifficulty[p.exercise.difficulty] += 1; });
  return { ...module, problems, byDifficulty };
}

/** Every module with its problems. Anything not assigned lands in "More practice". */
export function problemModules(): ModuleWithProblems[] {
  const assigned = new Set(PROBLEM_MODULES.flatMap((m) => m.problemIds));
  const modules = PROBLEM_MODULES.map((m) =>
    withProblems(m, m.problemIds.map((id) => PRACTICE_PROBLEMS.find((p) => p.exercise.id === id)).filter((p): p is PracticeProblem => Boolean(p))),
  );
  const rest = PRACTICE_PROBLEMS.filter((p) => !assigned.has(p.exercise.id));
  if (rest.length) {
    modules.push(withProblems({ id: "more", title: "More practice", blurb: "Mixed problems", icon: Layers, color: C.cyan, problemIds: rest.map((p) => p.exercise.id) }, rest));
  }
  return modules;
}

export function getProblemModule(id: string) {
  return problemModules().find((m) => m.id === id);
}

export function moduleOfProblem(problemId: string) {
  return problemModules().find((m) => m.problems.some((p) => p.exercise.id === problemId));
}
