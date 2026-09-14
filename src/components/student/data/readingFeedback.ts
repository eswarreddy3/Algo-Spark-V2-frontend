/**
 * AI grading for paragraph reading: comprehension answers plus a short summary
 * in the student's own words. Returns the same three things every AI-graded
 * task returns — a score, written feedback and improvement suggestions.
 *
 * Like `analyzeEmail`, this local pass is what the prototype (and offline mode)
 * uses; the real app sends the same payload to the LLM grader configured by the
 * Super Admin.
 */
import type { Passage } from "./nontech";

export type ReadingFeedback = {
  overall: number;
  scores: { label: string; value: number; hint: string }[];
  /** Written feedback, in prose. */
  summary: string;
  suggestions: string[];
  correct: number;
  covered: string[];
  missed: string[];
};

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

export const SUMMARY_WORDS: [number, number] = [30, 80];

export function analyzeReading(passage: Passage, answers: Record<string, number>, summaryText: string): ReadingFeedback {
  const correct = passage.questions.filter((q) => answers[q.id] === q.a).length;
  const comprehension = (correct / Math.max(1, passage.questions.length)) * 100;

  const text = summaryText.trim();
  const lower = text.toLowerCase();
  const words = text ? text.split(/\s+/).length : 0;
  const covered = passage.keyIdeas.filter((k) => k.signals.some((s) => lower.includes(s))).map((k) => k.idea);
  const missed = passage.keyIdeas.map((k) => k.idea).filter((idea) => !covered.includes(idea));
  const coverage = (covered.length / Math.max(1, passage.keyIdeas.length)) * 100;

  // Copying sentences out of the passage is not summarising.
  const sentences = passage.text.flatMap((p) => p.split(/(?<=[.!?])\s+/)).map((s) => s.toLowerCase().trim());
  const copied = sentences.filter((s) => s.length > 40 && lower.includes(s.slice(0, 40))).length;

  const [minWords, maxWords] = SUMMARY_WORDS;
  let concision = 100;
  if (words < minWords) concision -= (minWords - words) * 2.5;
  if (words > maxWords) concision -= (words - maxWords) * 1.2;
  concision -= copied * 20;

  const scores = [
    { label: "Comprehension", value: clamp(comprehension), hint: `${correct}/${passage.questions.length} answers correct` },
    { label: "Main ideas", value: clamp(text ? coverage : 0), hint: `${covered.length}/${passage.keyIdeas.length} key ideas in your summary` },
    { label: "Concision", value: clamp(text ? concision : 0), hint: `${words} words · aim for ${minWords}–${maxWords}` },
  ];
  const overall = clamp(scores[0].value * 0.5 + scores[1].value * 0.35 + scores[2].value * 0.15);

  const wrong = passage.questions.filter((q) => answers[q.id] !== q.a);
  const parts: string[] = [];
  if (comprehension === 100) parts.push("You answered every comprehension question correctly.");
  else if (comprehension >= 60) parts.push(`You got most of the detail right, but ${wrong.length === 1 ? "one question" : `${wrong.length} questions`} tripped you up.`);
  else parts.push("Several answers suggest the passage was skimmed rather than read closely.");
  if (!text) parts.push("You didn't write a summary, so we couldn't check whether you caught the main ideas.");
  else if (coverage >= 75) parts.push("Your summary captures the passage's argument, not just its facts.");
  else if (coverage >= 50) parts.push("Your summary has the core point but leaves out part of the argument.");
  else parts.push("Your summary retells details but misses most of what the author is arguing.");
  if (copied) parts.push("Parts of it are lifted straight from the passage — paraphrase instead.");

  const suggestions: string[] = [];
  wrong.forEach((q) => suggestions.push(`Re-read for: “${q.q}” — ${q.explain}`));
  missed.forEach((idea) => suggestions.push(`Your summary should mention: ${idea.toLowerCase()}.`));
  if (text && words < minWords) suggestions.push(`Add ${minWords - words} more words — one sentence per paragraph is a good rule.`);
  if (words > maxWords) suggestions.push(`Trim about ${words - maxWords} words; keep the argument, drop the examples.`);
  if (copied) suggestions.push("Rewrite copied sentences in your own words.");
  if (!text) suggestions.push(`Write a ${minWords}–${maxWords} word summary to get feedback on main ideas.`);
  if (!suggestions.length) suggestions.push("Strong work — try summarising in two sentences for an extra challenge.");

  return { overall, scores, summary: parts.join(" "), suggestions: suggestions.slice(0, 6), correct, covered, missed };
}
