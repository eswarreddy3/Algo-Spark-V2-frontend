import { STUDENTS } from "./cohort";
import { ADMIN_LABS } from "./labs";
import { EXAMS } from "./exams";
import { TICKETS } from "./tickets";
import { QUESTION_BANK } from "./authoring";
import type { AdminView } from "../nav";

export type AdminTarget =
  | { type: "student"; studentId: string }
  | { type: "lab"; labId: string }
  | { type: "exam"; examId: string }
  | { type: "ticket"; ticketId: string }
  | { type: "authoring" }
  | { type: "view"; view: AdminView };

export type AdminSearchResult = {
  id: string;
  kind: "Student" | "Lab" | "Exam" | "Ticket" | "Question" | "Page";
  title: string;
  subtitle: string;
  /** Lower sorts first: 0 title prefix, 1 title match, 2 body match only. */
  rank?: number;
  target: AdminTarget;
};

const PAGES: { view: AdminView; title: string; subtitle: string }[] = [
  { view: "overview", title: "Cohort overview", subtitle: "Live stats across the batch" },
  { view: "students", title: "Students", subtitle: "Roster, drill-down and outreach" },
  { view: "labs", title: "Labs", subtitle: "Publish weeks, author questions, track completion" },
  { view: "exams", title: "Exams", subtitle: "Schedule papers and read results" },
  { view: "leaderboard", title: "Leaderboard", subtitle: "Rank by section, branch or college" },
  { view: "reports", title: "Reports", subtitle: "Build and download cohort reports" },
  { view: "support", title: "Support", subtitle: "Student tickets and replies" },
];

/** null when nothing matched; otherwise the sort rank for this hit. */
function rankOf(title: string, body: string, q: string): number | null {
  const t = title.toLowerCase();
  const words = t.split(/\W+/);
  if (t.startsWith(q) || words.some((w) => w.startsWith(q))) return 0;
  if (t.includes(q)) return 1;
  if (body.toLowerCase().includes(q)) return 2;
  return null;
}

/** Ranked, capped search across everything the admin can open. */
export function searchAdmin(query: string, limit = 8): AdminSearchResult[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const out: AdminSearchResult[] = [];

  for (const s of STUDENTS) {
    if (out.length >= 60) break;
    const rank = rankOf(s.name, `${s.roll} ${s.section} ${s.email}`, q);
    if (rank !== null) {
      out.push({
        id: s.id, kind: "Student", rank,
        title: s.name, subtitle: `${s.roll} · ${s.section}`,
        target: { type: "student", studentId: s.id },
      });
    }
  }

  for (const lab of ADMIN_LABS) {
    const rank = rankOf(lab.name, `${lab.code} ${lab.faculty} ${lab.weeks.map((w) => w.title).join(" ")}`, q);
    if (rank !== null) {
      out.push({
        id: lab.id, kind: "Lab", rank,
        title: lab.name, subtitle: `${lab.code} · ${lab.faculty}`,
        target: { type: "lab", labId: lab.id },
      });
    }
  }

  for (const exam of EXAMS) {
    const rank = rankOf(exam.title, `${exam.audience} ${exam.window}`, q);
    if (rank !== null) {
      out.push({
        id: exam.id, kind: "Exam", rank,
        title: exam.title, subtitle: `${exam.window} · ${exam.duration}`,
        target: { type: "exam", examId: exam.id },
      });
    }
  }

  for (const t of TICKETS) {
    const rank = rankOf(t.subject, `${t.id} ${t.studentName} ${t.category}`, q);
    if (rank !== null) {
      out.push({
        id: t.id, kind: "Ticket", rank,
        title: t.subject, subtitle: `${t.id} · ${t.studentName}`,
        target: { type: "ticket", ticketId: t.id },
      });
    }
  }

  for (const item of QUESTION_BANK) {
    const rank = rankOf(item.title, `${item.tags.join(" ")} ${item.author}`, q);
    if (rank !== null) {
      out.push({
        id: item.id, kind: "Question", rank,
        title: item.title, subtitle: `${item.difficulty} · ${item.usedIn}`,
        target: { type: "authoring" },
      });
    }
  }

  for (const page of PAGES) {
    const rank = rankOf(page.title, page.subtitle, q);
    if (rank !== null) {
      out.push({
        id: page.view, kind: "Page", rank,
        title: page.title, subtitle: page.subtitle,
        target: { type: "view", view: page.view },
      });
    }
  }

  const authoringRank = rankOf("Question authoring", "write exercises test cases labs", q);
  if (authoringRank !== null) {
    out.push({
      id: "authoring", kind: "Page", rank: authoringRank,
      title: "Question authoring", subtitle: "In Labs · write exercises and test cases",
      target: { type: "authoring" },
    });
  }

  // Title matches beat body matches, and a title that starts with the query
  // beats one that merely contains it.
  out.sort((a, b) => (a.rank ?? 2) - (b.rank ?? 2));
  return out.slice(0, limit);
}

export type Alert = {
  id: string;
  title: string;
  body: string;
  when: string;
  unread: boolean;
  tone: "info" | "warn" | "good";
  target: AdminTarget;
};

export const ALERTS: Alert[] = [
  {
    id: "a1",
    title: "Mock #4 is live",
    body: `${EXAMS[0].attempted} of ${EXAMS[0].registered} registered students have started. The window closes at 6:00 PM.`,
    when: "12 min ago",
    unread: true,
    tone: "info",
    target: { type: "exam", examId: "ex-mock4" },
  },
  {
    id: "a2",
    title: "18 students inactive for a week",
    body: "Mostly MECH and CIVIL year 3. The at-risk register has the list.",
    when: "1 hour ago",
    unread: true,
    tone: "warn",
    target: { type: "view", view: "students" },
  },
  {
    id: "a3",
    title: "Two questions waiting on review",
    body: "LRU Cache and Merge Intervals need sign-off before they can be attached to a week.",
    when: "3 hours ago",
    unread: true,
    tone: "info",
    target: { type: "authoring" },
  },
  {
    id: "a4",
    title: "Similarity check flagged 3 submissions",
    body: "Week 6 of the Data Structures lab. Review before points are finalised.",
    when: "Yesterday",
    unread: false,
    tone: "warn",
    target: { type: "lab", labId: "cs-ds" },
  },
  {
    id: "a5",
    title: "Placement readiness crossed 60%",
    body: "152 students now clear both the completion and exam bars, up from 138 last month.",
    when: "2 days ago",
    unread: false,
    tone: "good",
    target: { type: "view", view: "reports" },
  },
];
