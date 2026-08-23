/**
 * Code execution contract.
 *
 * `runCode` is the single seam between the UI and whatever actually executes
 * student code. In this prototype it resolves to a local simulator so the demo
 * works with no backend; point `NEXT_PUBLIC_JUDGE_URL` at the real judge
 * service and the same call goes over the wire with no UI changes.
 */
import type { Exercise, Language, TestCase } from "./types";

export type TestStatus = "passed" | "failed" | "skipped";

export type TestResult = {
  id: string;
  name: string;
  hidden: boolean;
  status: TestStatus;
  input: string;
  expected: string;
  received: string;
  runtimeMs: number;
};

export type Verdict = "accepted" | "wrong-answer" | "compile-error" | "runtime-error";

export type RunResult = {
  verdict: Verdict;
  /** Compiler / interpreter message when the submission never ran. */
  message?: string;
  stdout: string;
  results: TestResult[];
  passed: number;
  total: number;
  totalMs: number;
  /** Populated for SQL exercises on an accepted run. */
  table?: { columns: { key: string; label: string }[]; rows: (string | number)[][] };
};

export type RunRequest = {
  exercise: Exercise;
  language: Language;
  source: string;
  /** `run` executes the sample cases only; `submit` includes hidden cases. */
  mode: "run" | "submit";
};

const JUDGE_URL = process.env.NEXT_PUBLIC_JUDGE_URL;

export async function runCode(req: RunRequest): Promise<RunResult> {
  if (JUDGE_URL) return runOnJudge(req);
  return simulate(req);
}

/** Real execution path — enabled as soon as a judge endpoint is configured. */
async function runOnJudge(req: RunRequest): Promise<RunResult> {
  const res = await fetch(`${JUDGE_URL}/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      exerciseId: req.exercise.id,
      language: req.language,
      source: req.source,
      mode: req.mode,
    }),
  });
  if (!res.ok) throw new Error(`Judge responded ${res.status}`);
  return (await res.json()) as RunResult;
}

/* ------------------------------------------------------------------ *
 * Demo simulator
 * ------------------------------------------------------------------ */

/**
 * Blanks out comments and string literals, keeping line breaks, so the checks
 * below only ever look at code. Without this, a bracket inside a string —
 * pairs = {')': '('} — would look like a syntax error.
 */
function scrub(source: string, language: Language) {
  const lineComment = language === "python" ? "#" : language === "sql" ? "--" : "//";
  const blockComments = language === "cpp" || language === "java";
  const tripleQuotes = language === "python";
  const blank = (text: string) => text.replace(/[^\n]/g, " ");
  let out = "";
  let i = 0;

  while (i < source.length) {
    const rest = source.slice(i);

    if (rest.startsWith(lineComment)) {
      const end = source.indexOf("\n", i);
      const stop = end === -1 ? source.length : end;
      out += blank(source.slice(i, stop));
      i = stop;
      continue;
    }
    if (blockComments && rest.startsWith("/*")) {
      const end = source.indexOf("*/", i + 2);
      const stop = end === -1 ? source.length : end + 2;
      out += blank(source.slice(i, stop));
      i = stop;
      continue;
    }
    if (tripleQuotes && (rest.startsWith('"""') || rest.startsWith("'''"))) {
      const quote = rest.slice(0, 3);
      const end = source.indexOf(quote, i + 3);
      const stop = end === -1 ? source.length : end + 3;
      out += blank(source.slice(i, stop));
      i = stop;
      continue;
    }

    const ch = source[i];
    if (ch === '"' || ch === "'" || ch === "`") {
      let j = i + 1;
      while (j < source.length && source[j] !== ch && source[j] !== "\n") {
        j += source[j] === "\\" ? 2 : 1;
      }
      const stop = Math.min(j + 1, source.length);
      out += blank(source.slice(i, stop));
      i = stop;
      continue;
    }

    out += ch;
    i += 1;
  }
  return out;
}

/** Cheap balance check so obviously broken code returns a compile error. */
function findUnbalanced(source: string): { line: number; symbol: string } | null {
  const pairs: Record<string, string> = { ")": "(", "]": "[", "}": "{" };
  const stack: { ch: string; line: number }[] = [];
  let line = 1;
  for (const ch of source) {
    if (ch === "\n") line += 1;
    else if (ch === "(" || ch === "[" || ch === "{") stack.push({ ch, line });
    else if (ch in pairs) {
      const top = stack.pop();
      if (!top || top.ch !== pairs[ch]) return { line, symbol: ch };
    }
  }
  const left = stack.pop();
  return left ? { line: left.line, symbol: left.ch } : null;
}

function isUntouched(source: string, exercise: Exercise, language: Language) {
  const starter = exercise.starter[language] ?? "";
  const norm = (s: string) => scrub(s, language).replace(/\s+/g, " ").trim();
  return norm(source) === norm(starter) || norm(source).length < 12;
}

function matchedSignals(source: string, exercise: Exercise) {
  const body = source.toLowerCase();
  return exercise.signals.filter((s) => body.includes(s.toLowerCase()));
}

function jitter(base: number) {
  return Math.round(base + Math.random() * base * 0.6);
}

function wrongOutput(test: TestCase) {
  if (/^\[.*\]$/.test(test.expected)) return "[]";
  if (/^(true|false)$/i.test(test.expected)) return test.expected.toLowerCase() === "true" ? "False" : "True";
  if (/^-?\d+$/.test(test.expected)) return "0";
  return "None";
}

const COMPILE_MESSAGE: Record<Language, (line: number, symbol: string) => string> = {
  python: (line, symbol) => `File "solution.py", line ${line}\n    SyntaxError: unmatched '${symbol}'`,
  cpp: (line, symbol) => `solution.cpp:${line}:1: error: expected matching token for '${symbol}'\ncompilation terminated.`,
  java: (line, symbol) => `Solution.java:${line}: error: illegal start of expression near '${symbol}'\n1 error`,
  sql: (line, symbol) => `near line ${line}: syntax error at '${symbol}'`,
};

async function simulate(req: RunRequest): Promise<RunResult> {
  const { exercise, language, source, mode } = req;
  const cases = exercise.tests.filter((t) => (mode === "submit" ? true : !t.hidden));

  // Compile / run latency, so the console behaves like a real judge.
  await delay(language === "python" || language === "sql" ? 550 : 900);

  const broken = findUnbalanced(scrub(source, language));
  if (broken) {
    return {
      verdict: "compile-error",
      message: COMPILE_MESSAGE[language](broken.line, broken.symbol),
      stdout: "",
      results: cases.map((t) => skipped(t)),
      passed: 0,
      total: cases.length,
      totalMs: 0,
    };
  }

  const untouched = isUntouched(source, exercise, language);
  const hits = matchedSignals(source, exercise);
  const solved = !untouched && hits.length === exercise.signals.length;
  const partial = !untouched && !solved && hits.length > 0;

  let passed = 0;
  let totalMs = 0;
  const results: TestResult[] = cases.map((t, i) => {
    // Partial solutions clear the visible samples but miss an edge case.
    const ok = solved || (partial && !t.hidden && i === 0);
    const runtimeMs = jitter(language === "cpp" ? 4 : language === "java" ? 12 : 8);
    totalMs += runtimeMs;
    if (ok) passed += 1;
    return {
      id: t.id,
      name: t.name,
      hidden: Boolean(t.hidden),
      status: ok ? "passed" : "failed",
      input: t.input,
      expected: t.expected,
      received: ok ? t.expected : untouched ? "" : wrongOutput(t),
      runtimeMs,
    };
  });

  const verdict: Verdict = passed === cases.length ? "accepted" : "wrong-answer";
  const stdout = buildStdout({ verdict, untouched, partial, passed, total: cases.length, exercise });

  return {
    verdict,
    stdout,
    results,
    passed,
    total: cases.length,
    totalMs,
    table:
      verdict === "accepted" && exercise.resultColumns && exercise.resultRows
        ? { columns: exercise.resultColumns, rows: exercise.resultRows }
        : undefined,
  };
}

function buildStdout({
  verdict,
  untouched,
  partial,
  passed,
  total,
  exercise,
}: {
  verdict: Verdict;
  untouched: boolean;
  partial: boolean;
  passed: number;
  total: number;
  exercise: Exercise;
}) {
  const lines = [`Running ${total} test case${total === 1 ? "" : "s"}…`];
  if (verdict === "accepted") {
    lines.push(`All ${total} passed.`);
    if (exercise.targetComplexity) lines.push(`Measured complexity matches target ${exercise.targetComplexity}.`);
  } else if (untouched) {
    lines.push("Your function returned nothing — the starter body is still a stub.");
  } else if (partial) {
    lines.push(`${passed}/${total} passed. Check the failing case: it covers an edge input.`);
  } else {
    lines.push(`${passed}/${total} passed. Compare your output with the expected column.`);
  }
  return lines.join("\n");
}

function skipped(t: TestCase): TestResult {
  return {
    id: t.id,
    name: t.name,
    hidden: Boolean(t.hidden),
    status: "skipped",
    input: t.input,
    expected: t.expected,
    received: "",
    runtimeMs: 0,
  };
}

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}
