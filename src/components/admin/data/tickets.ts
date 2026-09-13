import { STUDENTS } from "./cohort";
import { C } from "../theme";

/** Support tickets students raise from the student app's Support page. */

export type TicketStatus = "open" | "pending" | "resolved";
export type TicketPriority = "high" | "normal" | "low";

export type TicketMessage = {
  id: string;
  from: "student" | "admin";
  author: string;
  when: string;
  body: string;
};

export type Ticket = {
  id: string;
  subject: string;
  studentId: string;
  studentName: string;
  section: string;
  category: "Compiler" | "Exam" | "Account" | "Content" | "Points";
  status: TicketStatus;
  priority: TicketPriority;
  opened: string;
  thread: TicketMessage[];
};

/**
 * Tickets belong to real people in the roster. The first one is the ticket the
 * student app shows in its own notification list, so it is bound by name rather
 * than by position.
 */
const byName = (name: string, fallback: number) => STUDENTS.find((st) => st.name === name) ?? STUDENTS[fallback];
const s = (i: number) => STUDENTS[i];
const ADITYA = byName("Aditya Kumar", 8);

export const TICKETS: Ticket[] = [
  {
    id: "TCK-2214",
    subject: "Compiler output truncated on Week 6 exercise",
    studentId: ADITYA.id,
    studentName: ADITYA.name,
    section: ADITYA.section,
    category: "Compiler",
    status: "open",
    priority: "high",
    opened: "2 hours ago",
    thread: [
      {
        id: "m1", from: "student", author: ADITYA.name, when: "2 hours ago",
        body: `My solution prints 40 lines but the console stops at 20. The hidden tests then fail with a mismatch even though the logic looks right. Roll ${ADITYA.roll}, Week 6 of the Data Structures lab.`,
      },
      {
        id: "m2", from: "admin", author: "Placement Cell", when: "1 hour ago",
        body: "Thanks — we can reproduce it. The console caps stdout at 20 lines; the judge does not. Re-running your last submission now.",
      },
      {
        id: "m3", from: "student", author: ADITYA.name, when: "40 min ago",
        body: "Still shows the same verdict on my side. Should I resubmit?",
      },
    ],
  },
  {
    id: "TCK-2213",
    subject: "Mock #4 timer kept running after submit",
    studentId: s(15).id,
    studentName: s(15).name,
    section: s(15).section,
    category: "Exam",
    status: "open",
    priority: "high",
    opened: "5 hours ago",
    thread: [
      {
        id: "m1", from: "student", author: s(15).name, when: "5 hours ago",
        body: "I submitted the aptitude section with 4 minutes left, but the timer carried the leftover time into the coding section and then ended it early.",
      },
    ],
  },
  {
    id: "TCK-2211",
    subject: "Points not credited for Week 5 MCQs",
    studentId: s(23).id,
    studentName: s(23).name,
    section: s(23).section,
    category: "Points",
    status: "pending",
    priority: "normal",
    opened: "Yesterday",
    thread: [
      {
        id: "m1", from: "student", author: s(23).name, when: "Yesterday",
        body: "I scored 8/10 on the Week 5 quiz but my total did not move.",
      },
      {
        id: "m2", from: "admin", author: "Placement Cell", when: "Yesterday",
        body: "Points post overnight. If it has not appeared by tomorrow morning, reply here and we will credit it manually.",
      },
    ],
  },
  {
    id: "TCK-2208",
    subject: "Cannot sign in after roll number change",
    studentId: s(31).id,
    studentName: s(31).name,
    section: s(31).section,
    category: "Account",
    status: "pending",
    priority: "normal",
    opened: "2 days ago",
    thread: [
      {
        id: "m1", from: "student", author: s(31).name, when: "2 days ago",
        body: "The registrar corrected my roll number last week and now the login rejects both the old and the new one.",
      },
    ],
  },
  {
    id: "TCK-2205",
    subject: "Week 7 slides link opens an empty PDF",
    studentId: s(40).id,
    studentName: s(40).name,
    section: s(40).section,
    category: "Content",
    status: "resolved",
    priority: "low",
    opened: "4 days ago",
    thread: [
      {
        id: "m1", from: "student", author: s(40).name, when: "4 days ago",
        body: "The Trees slide deck downloads as a 0 KB file.",
      },
      {
        id: "m2", from: "admin", author: "Placement Cell", when: "3 days ago",
        body: "Re-uploaded by Dr. Meera Raghavan. Please clear the cached copy and try again.",
      },
      {
        id: "m3", from: "student", author: s(40).name, when: "3 days ago",
        body: "Works now, thank you.",
      },
    ],
  },
  {
    id: "TCK-2199",
    subject: "SQL pad rejects a valid JOIN",
    studentId: s(52).id,
    studentName: s(52).name,
    section: s(52).section,
    category: "Compiler",
    status: "resolved",
    priority: "normal",
    opened: "6 days ago",
    thread: [
      {
        id: "m1", from: "student", author: s(52).name, when: "6 days ago",
        body: "A LEFT JOIN that runs in my local SQLite returns a syntax error in the practice pad.",
      },
      {
        id: "m2", from: "admin", author: "Placement Cell", when: "5 days ago",
        body: "The pad was pinned to an older SQLite build. Upgraded — your query runs.",
      },
    ],
  },
];

export const TICKET_STATUS_META: Record<TicketStatus, { label: string; fg: string; bg: string }> = {
  open: { label: "Open", fg: C.red, bg: C.redBg },
  pending: { label: "Awaiting student", fg: C.warn, bg: C.warnBg },
  resolved: { label: "Resolved", fg: C.green, bg: C.greenBg },
};
