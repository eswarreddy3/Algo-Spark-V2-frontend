import type { Lab } from "./types";
import { DS_WEEKS } from "./content/ds";
import { DBMS_WEEKS } from "./content/dbms";
import { OS_WEEKS } from "./content/os";

/**
 * The lab catalog. In the real app this comes from the courses API for the
 * student's section; the shape below is what that endpoint returns.
 */
export const LABS: Lab[] = [
  {
    id: "cs-ds",
    code: "CS-DS-201",
    name: "Data Structures Lab",
    description:
      "Twelve weeks from complexity analysis to dynamic programming, each with slides, a quiz and a coding task.",
    semester: "Semester 3",
    faculty: "Dr. Meera Raghavan",
    schedule: "Mon & Thu · 2:00 PM",
    room: "Lab 204",
    accent: "#2430D8",
    weeks: DS_WEEKS,
  },
  {
    id: "cs-db",
    code: "CS-DB-204",
    name: "Database Systems Lab",
    description:
      "Model a schema, then query it. Ten weeks of SQL against a live practice database.",
    semester: "Semester 3",
    faculty: "Prof. Anand Krishnan",
    schedule: "Tue · 10:00 AM",
    room: "Lab 108",
    accent: "#1EC8DC",
    weeks: DBMS_WEEKS,
  },
  {
    id: "cs-os",
    code: "CS-OS-206",
    name: "Operating Systems Lab",
    description:
      "Processes, scheduling and synchronisation — simulated in code, then defended in a viva.",
    semester: "Semester 4",
    faculty: "Dr. Suchitra Menon",
    schedule: "Wed & Fri · 11:30 AM",
    room: "Lab 204",
    accent: "#8B7CE8",
    weeks: OS_WEEKS,
  },
];

export function getLab(labId: string) {
  return LABS.find((l) => l.id === labId);
}

export function getWeek(labId: string, week: number) {
  return getLab(labId)?.weeks.find((w) => w.n === week);
}
