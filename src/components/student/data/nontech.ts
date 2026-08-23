import type { EmailPrompt } from "./emailFeedback";

export const EMAIL_PROMPTS: EmailPrompt[] = [
  {
    id: "interview-status",
    title: "Follow up on an interview",
    brief:
      "You interviewed with Zentra Systems for a Software Engineer role on 12 August and have not heard back. Write to the recruiter, Nisha Menon, asking for an update.",
    mustMention: ["Zentra", "Software Engineer", "12 August"],
    idealWords: [70, 150],
    model: `Subject: Following up — Software Engineer interview, 12 August

Dear Ms. Menon,

I interviewed for the Software Engineer role at Zentra Systems on 12 August and wanted to follow up on the outcome. The conversation about your payments platform was genuinely interesting, and I remain keen to join the team.

Could you share where my application currently stands, and when I might expect a decision? I am happy to provide any further information you need.

Thank you for your time.

Best regards,
Aditya Kumar
CSE-A · Roll 21CS042`,
  },
  {
    id: "internship-request",
    title: "Request an internship referral",
    brief:
      "Write to a senior alumnus, Rahul Verma, asking for a referral for the summer internship programme at his company, Northwind Labs. Mention your Data Structures coursework.",
    mustMention: ["Northwind", "internship", "referral"],
    idealWords: [80, 160],
    model: `Subject: Referral request — Northwind Labs summer internship

Dear Rahul,

I am a third-year CSE student at our college and I am applying to the summer internship programme at Northwind Labs. Having finished the Data Structures lab with a focus on graph and dynamic-programming problems, I believe I would contribute quickly to your backend team.

Would you be willing to refer me? I have attached my resume and can share my project repository if that helps.

Thank you for considering it.

Best regards,
Aditya Kumar
CSE-A · Roll 21CS042`,
  },
  {
    id: "deadline-extension",
    title: "Ask for a deadline extension",
    brief:
      "Write to your faculty, Dr. Meera Raghavan, requesting a two-day extension on the Week 6 lab submission because of a college hackathon. Offer a concrete new date.",
    mustMention: ["Week 6", "extension", "hackathon"],
    idealWords: [60, 130],
    model: `Subject: Request for a two-day extension — Week 6 lab submission

Respected Ma'am,

I am representing the college at the inter-college hackathon on 22 and 23 August, which overlaps with the Week 6 lab submission deadline.

Could I request a two-day extension, submitting by 25 August instead? The theory and MCQ components are already complete; only the coding task remains.

Thank you for considering my request.

Best regards,
Aditya Kumar
CSE-A · Roll 21CS042`,
  },
];

export type ReadingQuestion = { id: string; q: string; opts: string[]; a: number; explain: string };

export type Passage = {
  id: string;
  title: string;
  minutes: number;
  words: number;
  text: string[];
  questions: ReadingQuestion[];
};

export const PASSAGES: Passage[] = [
  {
    id: "spaced-repetition",
    title: "How spaced repetition works",
    minutes: 3,
    words: 168,
    text: [
      "Spaced repetition is a learning technique in which material is reviewed at increasing intervals. Rather than cramming the night before an exam, learners revisit a concept just as they are about to forget it — the point at which recall takes effort and therefore strengthens memory.",
      "The effect was first measured by Hermann Ebbinghaus in the 1880s. His forgetting curve showed that recall drops sharply within days of learning something new, but that each successful review flattens the curve, so the next review can be scheduled further out.",
      "Modern flashcard software automates the scheduling. A card answered easily is pushed weeks ahead; a card answered wrongly returns within minutes. The learner spends most of their time on the small fraction of material that is actually shaky, which is what makes the method efficient rather than merely thorough.",
    ],
    questions: [
      {
        id: "sr-1",
        q: "According to the passage, what is the main benefit of spaced repetition?",
        opts: ["It is faster to set up", "It improves long-term retention", "It removes the need for practice", "It replaces exams"],
        a: 1,
        explain: "Reviewing just before forgetting is what strengthens memory and flattens the forgetting curve.",
      },
      {
        id: "sr-2",
        q: "What did Ebbinghaus's forgetting curve demonstrate?",
        opts: [
          "Recall improves without review",
          "Recall drops sharply soon after learning",
          "Cramming outperforms review",
          "Memory is unrelated to time",
        ],
        a: 1,
        explain: "The curve showed a sharp drop within days, which each review then flattens.",
      },
      {
        id: "sr-3",
        q: "Why is the method described as efficient rather than merely thorough?",
        opts: [
          "It reviews everything equally often",
          "It concentrates time on the material the learner is shaky on",
          "It shortens every study session",
          "It avoids difficult topics",
        ],
        a: 1,
        explain: "Easy cards are pushed far ahead, so most study time lands on weak material.",
      },
    ],
  },
  {
    id: "code-review",
    title: "Why teams review code",
    minutes: 3,
    words: 154,
    text: [
      "Code review is the practice of having a second engineer read a change before it is merged. Teams adopt it expecting to catch bugs, and it does catch some — but studies of industrial projects consistently find that defect detection is not where most of the value sits.",
      "The larger effect is on shared understanding. A reviewer who reads a change learns the part of the system it touches, which spreads knowledge that would otherwise stay with one author. When that author leaves, or is simply on holiday, someone else can work in the same code.",
      "Reviews also apply quiet pressure toward smaller changes. A four-line change is read carefully; a four-hundred-line change is skimmed and approved. Teams that measure review quality usually end up shrinking their changes rather than lengthening their reviews.",
    ],
    questions: [
      {
        id: "cr-1",
        q: "What does the passage identify as the larger benefit of code review?",
        opts: ["Catching every bug", "Spreading understanding of the system", "Reducing meetings", "Enforcing style rules"],
        a: 1,
        explain: "The passage says defect detection is real but secondary to shared understanding.",
      },
      {
        id: "cr-2",
        q: "What happens to very large changes, according to the passage?",
        opts: ["They are rejected", "They are skimmed and approved", "They are split automatically", "They are reviewed twice"],
        a: 1,
        explain: "Four-hundred-line changes get skimmed, which is why teams shrink their changes.",
      },
      {
        id: "cr-3",
        q: "What do teams that measure review quality tend to do?",
        opts: ["Lengthen reviews", "Shrink their changes", "Add more reviewers", "Skip reviews for small fixes"],
        a: 1,
        explain: "The last line states they shrink changes rather than lengthen reviews.",
      },
    ],
  },
];

export type CourseModule = { id: string; title: string; kind: "slides" | "quiz" | "video"; minutes: number };

export type Course = {
  id: string;
  title: string;
  blurb: string;
  accent: string;
  modules: CourseModule[];
  /** Modules already completed when the demo starts. */
  completedSeed: number;
};

export const COURSES: Course[] = [
  {
    id: "aptitude",
    title: "Aptitude Foundations",
    blurb: "Percentages, ratios, time-and-work and the shortcuts that fit in 60 seconds.",
    accent: "#2430D8",
    completedSeed: 6,
    modules: [
      { id: "a1", title: "Numbers & divisibility", kind: "slides", minutes: 12 },
      { id: "a2", title: "Percentages", kind: "slides", minutes: 14 },
      { id: "a3", title: "Ratio & proportion", kind: "video", minutes: 16 },
      { id: "a4", title: "Averages & mixtures", kind: "slides", minutes: 13 },
      { id: "a5", title: "Time, speed & distance", kind: "video", minutes: 18 },
      { id: "a6", title: "Time & work", kind: "slides", minutes: 15 },
      { id: "a7", title: "Practice set A", kind: "quiz", minutes: 20 },
      { id: "a8", title: "Practice set B", kind: "quiz", minutes: 20 },
    ],
  },
  {
    id: "verbal",
    title: "Verbal Ability",
    blurb: "Sentence correction, para-jumbles and vocabulary that shows up in aptitude rounds.",
    accent: "#1EC8DC",
    completedSeed: 6,
    modules: [
      { id: "v1", title: "Parts of speech refresher", kind: "slides", minutes: 10 },
      { id: "v2", title: "Subject–verb agreement", kind: "slides", minutes: 12 },
      { id: "v3", title: "Sentence correction drills", kind: "quiz", minutes: 18 },
      { id: "v4", title: "Para-jumbles", kind: "video", minutes: 14 },
      { id: "v5", title: "Reading comprehension strategy", kind: "slides", minutes: 15 },
      { id: "v6", title: "Vocabulary in context", kind: "quiz", minutes: 16 },
    ],
  },
  {
    id: "logical",
    title: "Logical Reasoning",
    blurb: "Seating arrangements, syllogisms and puzzle patterns that repeat across companies.",
    accent: "#8B7CE8",
    completedSeed: 2,
    modules: [
      { id: "l1", title: "Series & analogies", kind: "slides", minutes: 12 },
      { id: "l2", title: "Syllogisms", kind: "video", minutes: 15 },
      { id: "l3", title: "Blood relations", kind: "slides", minutes: 11 },
      { id: "l4", title: "Seating arrangements", kind: "video", minutes: 20 },
      { id: "l5", title: "Data sufficiency", kind: "slides", minutes: 14 },
      { id: "l6", title: "Puzzle practice", kind: "quiz", minutes: 25 },
      { id: "l7", title: "Mixed drill", kind: "quiz", minutes: 22 },
    ],
  },
  {
    id: "interview",
    title: "Interview Skills",
    blurb: "Tell-me-about-yourself, project deep-dives and the questions to ask back.",
    accent: "#F59E0B",
    completedSeed: 0,
    modules: [
      { id: "i1", title: "Structuring your introduction", kind: "video", minutes: 14 },
      { id: "i2", title: "Explaining a project in three minutes", kind: "slides", minutes: 12 },
      { id: "i3", title: "Behavioural questions (STAR)", kind: "slides", minutes: 16 },
      { id: "i4", title: "Handling what you do not know", kind: "video", minutes: 11 },
      { id: "i5", title: "Mock interview checklist", kind: "quiz", minutes: 18 },
    ],
  },
];
