import {
  ArrowUpDown, Binary, Boxes, Brackets, Hash, LayoutGrid, Layers, Link2, Network, Triangle, Type, Workflow,
} from "lucide-react";
import type { Difficulty } from "../labs/types";
import { C } from "../../theme/tokens";
import { PRACTICE_PROBLEMS, type PracticeProblem } from "./problems";

/**
 * Topic and company pages are derived from the problem bank: every problem's
 * `tags`, `companies` and difficulty decide where it shows up, so a new
 * question appears under the right cards without touching this file. The
 * metadata below only adds presentation (icon, colour, one-line profile) and
 * has a fallback for anything not listed. Topic colours are theme tokens;
 * company colours are the brands' own and stay fixed.
 */

export type GroupBy = "topics" | "companies";

type TopicMeta = { icon: typeof Hash; color: string; blurb: string };
type CompanyMeta = { color: string; profile: string };

const TOPIC_META: Record<string, TopicMeta> = {
  Arrays: { icon: Brackets, color: C.royal, blurb: "Indexing, prefix sums and two pointers" },
  "Hash Map": { icon: Hash, color: C.violet, blurb: "Constant-time lookups and counting" },
  Strings: { icon: Type, color: C.cyan, blurb: "Parsing, anagrams and sliding windows" },
  Stack: { icon: Layers, color: C.goldDeep, blurb: "LIFO patterns and bracket matching" },
  Sorting: { icon: ArrowUpDown, color: C.green, blurb: "Ordering, intervals and comparators" },
  Heap: { icon: Triangle, color: C.red, blurb: "Priority queues and top-k problems" },
  Graph: { icon: Network, color: C.blue, blurb: "Nodes, edges and shortest paths" },
  BFS: { icon: Workflow, color: C.sky, blurb: "Level-order search on graphs and grids" },
  "Binary Search": { icon: Binary, color: "#7B61FF", blurb: "Halving the search space" },
  "Linked List": { icon: Link2, color: "#0EA5A4", blurb: "Pointers, reversal and cycles" },
  Design: { icon: LayoutGrid, color: "#D9480F", blurb: "Data structures with an API to build" },
};

const COMPANY_META: Record<string, CompanyMeta> = {
  Amazon: { color: "#FF9900", profile: "E-commerce & cloud · SDE-1" },
  Google: { color: "#4285F4", profile: "Search & cloud · Software Engineer" },
  Microsoft: { color: "#00A4EF", profile: "Software & cloud · SDE" },
  Meta: { color: "#0866FF", profile: "Social platforms · Software Engineer" },
  Apple: { color: "#1D1D1F", profile: "Consumer hardware · Software Engineer" },
  Adobe: { color: "#FA0F00", profile: "Creative software · Member of Technical Staff" },
  Uber: { color: "#000000", profile: "Mobility & delivery · Software Engineer" },
  Flipkart: { color: "#2874F0", profile: "E-commerce · SDE-1" },
  Zoho: { color: "#E42527", profile: "SaaS products · Member Technical Staff" },
};

const FALLBACK_COLORS = [C.royal, C.violet, C.cyan, C.goldDeep, C.green, C.red];

function fallbackColor(name: string) {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return FALLBACK_COLORS[h % FALLBACK_COLORS.length];
}

export type ProblemGroup = {
  name: string;
  by: GroupBy;
  color: string;
  /** Topic blurb or company hiring profile. */
  subtitle: string;
  /** Topics get an icon; companies render a lettermark logo instead. */
  icon: typeof Hash | null;
  problems: PracticeProblem[];
  byDifficulty: Record<Difficulty, number>;
};

function build(by: GroupBy, name: string, problems: PracticeProblem[]): ProblemGroup {
  const byDifficulty: Record<Difficulty, number> = { Easy: 0, Medium: 0, Hard: 0 };
  problems.forEach((p) => { byDifficulty[p.exercise.difficulty] += 1; });

  if (by === "topics") {
    const meta = TOPIC_META[name];
    return {
      name, by, problems, byDifficulty,
      color: meta?.color ?? fallbackColor(name),
      subtitle: meta?.blurb ?? "Practice problems",
      icon: meta?.icon ?? Boxes,
    };
  }
  const meta = COMPANY_META[name];
  return {
    name, by, problems, byDifficulty,
    color: meta?.color ?? fallbackColor(name),
    subtitle: meta?.profile ?? "Hiring for engineering roles",
    icon: null,
  };
}

/** Every topic or company in the bank, largest first. */
export function problemGroups(by: GroupBy, bank: PracticeProblem[] = PRACTICE_PROBLEMS): ProblemGroup[] {
  const map = new Map<string, PracticeProblem[]>();
  for (const problem of bank) {
    for (const name of by === "topics" ? problem.tags : problem.companies) {
      const list = map.get(name) ?? [];
      list.push(problem);
      map.set(name, list);
    }
  }
  return [...map.entries()]
    .map(([name, problems]) => build(by, name, problems))
    .sort((a, b) => b.problems.length - a.problems.length || a.name.localeCompare(b.name));
}

export function getProblemGroup(by: GroupBy, name: string): ProblemGroup | undefined {
  return problemGroups(by).find((g) => g.name === name);
}

/** Lettermark for a company logo tile. */
export function monogram(name: string) {
  return name.trim().charAt(0).toUpperCase();
}
