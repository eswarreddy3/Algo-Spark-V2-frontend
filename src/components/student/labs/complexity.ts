/**
 * Estimates the time complexity of a student's own solution from its shape:
 * loop nesting, halving loops, sorts, heaps and recursion. It is shown as
 * information next to the verdict and never affects the score or progression.
 *
 * A static estimate is honest about what it is — the basis line says what the
 * guess was built from. The real judge can return a measured growth rate in
 * the same shape.
 */
import { scrub } from "./runner";
import type { Language } from "./types";

export type ComplexityEstimate = { time: string; basis: string };

const RANK = ["O(1)", "O(log n)", "O(n)", "O(n log n)", "O(n²)", "O(n² log n)", "O(n³)", "O(2ⁿ)"] as const;
type Cls = (typeof RANK)[number];

const max = (a: Cls, b: Cls): Cls => (RANK.indexOf(a) >= RANK.indexOf(b) ? a : b);

/** Loop depth → class, where `halving` loops cost log n instead of n. */
function fromLoops(linear: number, halving: number): Cls {
  if (linear >= 3) return "O(n³)";
  if (linear === 2) return halving ? "O(n² log n)" : "O(n²)";
  if (linear === 1) return halving ? "O(n log n)" : "O(n)";
  return halving ? "O(log n)" : "O(1)";
}

type Loop = { halving: boolean };

/** Deepest stack of nested loops, as [linear, halving] counts. */
function deepestNesting(code: string, language: Language): { linear: number; halving: number } {
  let best = { linear: 0, halving: 0 };
  const consider = (stack: Loop[]) => {
    const halving = stack.filter((l) => l.halving).length;
    const linear = stack.length - halving;
    if (linear > best.linear || (linear === best.linear && halving > best.halving)) best = { linear, halving };
  };
  const isHalving = (text: string) => /\bmid\b|\/\/\s*2|>>\s*1|\/\s*2\b/.test(text);

  if (language === "python") {
    const lines = code.split("\n");
    const stack: { indent: number; loop: Loop }[] = [];
    lines.forEach((line, i) => {
      if (!line.trim()) return;
      const indent = line.length - line.trimStart().length;
      while (stack.length && indent <= stack[stack.length - 1].indent) stack.pop();
      if (/^\s*(for|while)\b/.test(line)) {
        // A while loop whose body moves a midpoint is a binary search.
        const body = lines.slice(i + 1, i + 8).join("\n");
        stack.push({ indent, loop: { halving: /^\s*while\b/.test(line) && isHalving(body) } });
        consider(stack.map((s) => s.loop));
      }
    });
    return best;
  }

  // C-like: loops open a brace scope; everything else is an ordinary block.
  const stack: (Loop | null)[] = [];
  let pending: Loop | null = null;
  const re = /\b(for|while)\b|[{}]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(code))) {
    if (m[1]) {
      const body = code.slice(m.index, m.index + 240);
      pending = { halving: m[1] === "while" && isHalving(body) };
    } else if (m[0] === "{") {
      stack.push(pending);
      pending = null;
      consider(stack.filter((s): s is Loop => s !== null));
    } else {
      stack.pop();
    }
  }
  return best;
}

function recursion(code: string, language: Language): "none" | "linear" | "branching" {
  const names =
    language === "python"
      ? [...code.matchAll(/^\s*def\s+(\w+)/gm)].map((m) => m[1])
      : [...code.matchAll(/\b[\w<>\[\]]+\s+(\w+)\s*\([^;{)]*\)\s*\{/g)].map((m) => m[1]).filter((n) => !["if", "for", "while", "switch", "catch"].includes(n));
  let result: "none" | "linear" | "branching" = "none";
  for (const name of names) {
    const calls = (code.match(new RegExp(`\\b${name}\\s*\\(`, "g")) ?? []).length - 1; // minus the definition
    if (calls >= 2 && !/memo|cache|dp\b|lru_cache/i.test(code)) return "branching";
    if (calls >= 1) result = "linear";
  }
  return result;
}

export function estimateComplexity(source: string, language: Language): ComplexityEstimate | null {
  if (language === "sql") return null;
  const code = scrub(source, language);
  if (code.replace(/\s+/g, "").length < 20) return null;

  const basis: string[] = [];
  const { linear, halving } = deepestNesting(code, language);
  let cls = fromLoops(linear, halving);
  if (linear) basis.push(linear === 1 ? "a single pass over the input" : `${linear} nested loops`);
  if (halving) basis.push("a halving (binary-search) loop");

  if (/\bsorted\s*\(|\.sort\s*\(|\bsort\s*\(|Arrays\.sort|Collections\.sort/.test(code)) {
    cls = max(cls, "O(n log n)");
    basis.push("a sort");
  }
  if (/heapq|priority_queue|PriorityQueue/.test(code)) {
    cls = max(cls, linear ? "O(n log n)" : "O(log n)");
    basis.push("heap operations");
  }
  const rec = recursion(code, language);
  if (rec === "branching") {
    cls = max(cls, "O(2ⁿ)");
    basis.push("recursion that branches without memoisation");
  } else if (rec === "linear") {
    cls = max(cls, "O(n)");
    basis.push("recursion");
  }

  return { time: cls, basis: basis.length ? `Estimated from ${basis.join(", ")}.` : "No loops or recursion found." };
}
