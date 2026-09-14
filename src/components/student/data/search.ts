import { LABS } from "../labs/catalog";
import { PRACTICE_PROBLEMS } from "./problems";
import { ALL_COURSES } from "../courses/catalog";
import { courseTopics } from "./courses";
import type { NonTechTab, TechTab, View } from "../nav";

export type SearchResult = {
  id: string;
  kind: "Lab week" | "Problem" | "Course" | "Page";
  title: string;
  subtitle: string;
  /** Lower sorts first: 0 title prefix, 1 title match, 2 body match only. */
  rank?: number;
  /** Where selecting the result should take the student. */
  target:
    | { type: "lab"; labId: string; week: number }
    | { type: "problem"; problemId: string }
    | { type: "view"; view: View }
    | { type: "tech"; tab: TechTab }
    | { type: "nontech"; tab: NonTechTab }
    | { type: "course"; scope: "tech" | "nontech"; courseId: string };
};

const PAGES: { view: View; title: string; subtitle: string }[] = [
  { view: "dashboard", title: "Dashboard", subtitle: "Your progress at a glance" },
  { view: "coach", title: "AI Prep Coach", subtitle: "Readiness score, gap map, prep plan and targeted drills" },
  { view: "labs", title: "Labs", subtitle: "Weekly lab courses" },
  { view: "tech", title: "Tech practice", subtitle: "Coding problems, courses, SQL and code compilers" },
  { view: "nontech", title: "Non-tech", subtitle: "Email writing, paragraph reading and courses" },
  { view: "exam", title: "Exam", subtitle: "Placement mock papers" },
  { view: "leaderboard", title: "Leaderboard", subtitle: "Your college ranking, by section or branch too" },
  { view: "profile", title: "Profile", subtitle: "Badges, activity and points" },
  { view: "support", title: "Support", subtitle: "Help articles and tickets" },
];

/** Ranked, capped search across everything the student can open. */
export function searchAll(query: string, limit = 8): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const out: SearchResult[] = [];

  for (const lab of LABS) {
    for (const week of lab.weeks) {
      if (out.length >= 40) break;
      const haystack = `${lab.name} ${lab.code} ${week.summary}`.toLowerCase();
      const rank = rankOf(week.title, haystack, q);
      if (rank !== null) {
        out.push({
          id: `${lab.id}-${week.n}`,
          kind: "Lab week",
          rank,
          title: `Week ${week.n} · ${week.title}`,
          subtitle: lab.name,
          target: { type: "lab", labId: lab.id, week: week.n },
        });
      }
    }
  }

  for (const problem of PRACTICE_PROBLEMS) {
    const haystack = `${problem.tags.join(" ")} ${problem.companies.join(" ")}`.toLowerCase();
    const rank = rankOf(problem.exercise.title, haystack, q);
    if (rank !== null) {
      out.push({
        id: problem.exercise.id,
        kind: "Problem",
        rank,
        title: problem.exercise.title,
        subtitle: `${problem.exercise.difficulty} · ${problem.tags.join(", ")}`,
        target: { type: "problem", problemId: problem.exercise.id },
      });
    }
  }

  for (const course of ALL_COURSES) {
    const rank = rankOf(course.title, course.blurb.toLowerCase(), q);
    if (rank !== null) {
      out.push({
        id: course.id,
        kind: "Course",
        rank,
        title: course.title,
        subtitle: `${courseTopics(course).length} topics · ${course.scope === "tech" ? "tech" : "non-tech"}`,
        target: { type: "course", scope: course.scope, courseId: course.id },
      });
    }
  }

  for (const page of PAGES) {
    const rank = rankOf(page.title, page.subtitle.toLowerCase(), q);
    if (rank !== null) {
      out.push({
        id: page.view,
        kind: "Page",
        rank,
        title: page.title,
        subtitle: page.subtitle,
        target: { type: "view", view: page.view },
      });
    }
  }

  // Title matches beat body matches, and a title that starts with the query
  // beats one that merely contains it.
  out.sort((a, b) => (a.rank ?? 2) - (b.rank ?? 2));

  return out.slice(0, limit);
}

/** null when nothing matched; otherwise the sort rank for this hit. */
function rankOf(title: string, body: string, q: string): number | null {
  const t = title.toLowerCase();
  const words = t.split(/\W+/);
  if (t.startsWith(q) || words.some((w) => w.startsWith(q))) return 0;
  if (t.includes(q)) return 1;
  if (body.includes(q)) return 2;
  return null;
}

export type Notification = {
  id: string;
  title: string;
  body: string;
  when: string;
  unread: boolean;
  target: SearchResult["target"];
};

export const NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    title: "Week 7 material published",
    body: "Dr. Meera Raghavan released Trees for the Data Structures lab.",
    when: "10 min ago",
    unread: true,
    target: { type: "lab", labId: "cs-ds", week: 7 },
  },
  {
    id: "n2",
    title: "Placement Mock #4 opens today",
    body: "The exam window closes at 6:00 PM. 90 minutes, four sections.",
    when: "2 hours ago",
    unread: true,
    target: { type: "view", view: "exam" },
  },
  {
    id: "n3",
    title: "You moved up 2 places",
    body: "You are now #4 in CSE-A after last week's submissions.",
    when: "Yesterday",
    unread: false,
    target: { type: "view", view: "leaderboard" },
  },
  {
    id: "n4",
    title: "Ticket TCK-2214 updated",
    body: "AlgoSpark support replied to your compiler output question.",
    when: "2 days ago",
    unread: false,
    target: { type: "view", view: "support" },
  },
];
