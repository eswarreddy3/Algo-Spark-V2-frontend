/**
 * Rule-based writing feedback for the email task.
 *
 * Every score traces back to something the student can see and fix, so the
 * feedback is defensible in a viva. The real app sends the same payload to the
 * LLM grader; this local pass is what the prototype (and offline mode) uses.
 */

export type EmailPrompt = {
  id: string;
  title: string;
  brief: string;
  /** Words or phrases a strong answer is expected to address. */
  mustMention: string[];
  idealWords: [number, number];
  model: string;
};

export type Score = { label: string; value: number; hint: string };
export type Check = { label: string; ok: boolean; detail: string };

export type EmailFeedback = {
  overall: number;
  scores: Score[];
  checks: Check[];
  suggestions: string[];
  stats: { words: number; sentences: number; avgSentence: number; paragraphs: number };
};

const INFORMAL = ["hey", "asap", "plz", "pls", "gonna", "wanna", "kinda", "btw", "u r", " u ", "thx"];
const POLITE = ["please", "thank", "appreciate", "kindly", "grateful"];
const HEDGES = ["just", "maybe", "sort of", "i think", "a bit"];

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

export function analyzeEmail(text: string, prompt: EmailPrompt): EmailFeedback {
  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();
  const words = trimmed.split(/\s+/).filter(Boolean);
  const sentences = trimmed.split(/[.!?]+\s|[.!?]+$/).map((s) => s.trim()).filter(Boolean);
  const paragraphs = trimmed.split(/\n\s*\n/).filter((p) => p.trim().length).length;
  const avgSentence = sentences.length ? Math.round(words.length / sentences.length) : words.length;

  const hasSubject = /^subject\s*:/im.test(trimmed);
  // The greeting is the first real line after any subject line, not necessarily
  // the first character of the draft.
  const firstBodyLine =
    trimmed
      .split("\n")
      .map((l) => l.trim())
      .find((l) => l && !/^subject\s*:/i.test(l)) ?? "";
  const hasGreeting = /^(dear|hi|hello|respected|good (morning|afternoon|evening))/i.test(firstBodyLine);
  const hasSignOff = /(regards|sincerely|thank you|thanks|yours (faithfully|truly))/i.test(
    trimmed.split("\n").slice(-4).join(" "),
  );
  const politeHits = POLITE.filter((w) => lower.includes(w)).length;
  const informalHits = INFORMAL.filter((w) => lower.includes(w));
  const hedgeHits = HEDGES.filter((w) => lower.includes(w));
  const exclamations = (trimmed.match(/!/g) ?? []).length;
  const shouting = (trimmed.match(/\b[A-Z]{4,}\b/g) ?? []).length;
  const lowercaseI = / i /.test(` ${trimmed} `);
  // Blank lines between paragraphs are not double spaces — check within lines.
  const doubleSpace = trimmed.split("\n").some((line) => /\S {2,}\S/.test(line));
  const covered = prompt.mustMention.filter((m) => lower.includes(m.toLowerCase()));
  const [minWords, maxWords] = prompt.idealWords;

  // Structure — does it read like an email at all?
  let structure = 40;
  if (hasGreeting) structure += 18;
  if (hasSignOff) structure += 18;
  if (hasSubject) structure += 12;
  if (paragraphs >= 2) structure += 12;

  // Clarity — length discipline and sentence economy.
  let clarity = 100;
  if (words.length < minWords) clarity -= Math.min(45, (minWords - words.length) * 1.6);
  if (words.length > maxWords) clarity -= Math.min(30, (words.length - maxWords) * 0.8);
  if (avgSentence > 24) clarity -= (avgSentence - 24) * 2.5;
  if (avgSentence < 8 && words.length > 40) clarity -= 8;
  clarity -= hedgeHits.length * 4;

  // Tone — professional, courteous, not shouty.
  let tone = 68;
  tone += Math.min(18, politeHits * 7);
  tone -= informalHits.length * 12;
  tone -= Math.max(0, exclamations - 1) * 8;
  tone -= shouting * 6;

  // Mechanics — the things a grammar checker would flag.
  let mechanics = 92;
  if (lowercaseI) mechanics -= 12;
  if (doubleSpace) mechanics -= 5;
  // A signature block is the normal way to end an email, so only the prose is
  // checked for terminal punctuation.
  const prose = trimmed
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !/^(best regards|regards|sincerely|thanks|thank you|yours)/i.test(l));
  const lastProse = prose[prose.length - 1] ?? "";
  if (lastProse.split(/\s+/).length > 4 && !/[.!?]$/.test(lastProse)) mechanics -= 6;
  if (sentences.some((s) => s.length > 220)) mechanics -= 8;

  // Coverage — did it answer what the prompt actually asked?
  const coverage = prompt.mustMention.length
    ? (covered.length / prompt.mustMention.length) * 100
    : 100;

  const scores: Score[] = [
    { label: "Structure", value: clamp(structure), hint: "Greeting, body, sign-off" },
    { label: "Clarity", value: clamp(clarity), hint: `${avgSentence} words per sentence` },
    { label: "Tone", value: clamp(tone), hint: "Professional and courteous" },
    { label: "Mechanics", value: clamp(mechanics), hint: "Punctuation and capitalisation" },
    { label: "Coverage", value: clamp(coverage), hint: `${covered.length}/${prompt.mustMention.length} points addressed` },
  ];

  const checks: Check[] = [
    { label: "Subject line", ok: hasSubject, detail: hasSubject ? "Present" : "Start with `Subject: …` so the reader knows the topic" },
    { label: "Greeting", ok: hasGreeting, detail: hasGreeting ? "Opens with a salutation" : "Open with Dear / Hello and the recipient" },
    { label: "Sign-off", ok: hasSignOff, detail: hasSignOff ? "Closes professionally" : "Close with Best regards and your name" },
    { label: "Length", ok: words.length >= minWords && words.length <= maxWords, detail: `${words.length} words · aim for ${minWords}–${maxWords}` },
    { label: "Professional tone", ok: informalHits.length === 0 && exclamations <= 1, detail: informalHits.length ? `Informal: ${informalHits.join(", ").trim()}` : "No informal phrasing found" },
  ];

  const suggestions: string[] = [];
  if (!hasSubject) suggestions.push("Add a one-line subject that states your ask — recruiters triage on it.");
  if (!hasGreeting) suggestions.push("Address the reader by name or role instead of starting mid-thought.");
  if (!hasSignOff) suggestions.push("End with a sign-off and your name, roll number and branch.");
  if (words.length < minWords) suggestions.push(`Add ${minWords - words.length} more words of specifics — dates, role, reference numbers.`);
  if (words.length > maxWords) suggestions.push(`Trim about ${words.length - maxWords} words; recruiters skim the first four lines.`);
  if (avgSentence > 24) suggestions.push(`Sentences average ${avgSentence} words. Split the longest one in two.`);
  informalHits.forEach((w) => suggestions.push(`Replace “${w.trim()}” with a neutral alternative.`));
  hedgeHits.forEach((w) => suggestions.push(`“${w}” weakens the ask — state it directly.`));
  prompt.mustMention
    .filter((m) => !covered.includes(m))
    .forEach((m) => suggestions.push(`The prompt expects you to mention ${m}.`));
  if (exclamations > 1) suggestions.push("Keep exclamation marks out of professional email.");
  if (!suggestions.length) suggestions.push("Strong draft — tighten the closing line and it is ready to send.");

  const overall = Math.round(
    scores.reduce((sum, s, i) => sum + s.value * [0.2, 0.25, 0.2, 0.15, 0.2][i], 0),
  );

  return {
    overall,
    scores,
    checks,
    suggestions: suggestions.slice(0, 6),
    stats: { words: words.length, sentences: sentences.length, avgSentence, paragraphs },
  };
}
