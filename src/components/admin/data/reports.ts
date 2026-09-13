import { RISK } from "../theme";
import { STUDENTS, completionOf, LAB_IDS, type Student } from "./cohort";
import { ADMIN_LABS } from "./labs";

/**
 * Report builder. Each preset is a column set plus a row mapper over the
 * roster, so a generated report is real data the admin can preview and
 * download rather than a stubbed file.
 */

export type ReportFilters = {
  branch: string;
  section: string;
  year: string;
};

export type ReportPreset = {
  id: string;
  name: string;
  description: string;
  columns: string[];
  rowsFor: (students: Student[]) => (string | number)[][];
};

const labName = (id: string) => ADMIN_LABS.find((l) => l.id === id)?.name.replace(" Lab", "") ?? id;

export const REPORT_PRESETS: ReportPreset[] = [
  {
    id: "progress",
    name: "Student progress",
    description: "Per-student completion, points and last activity across every lab.",
    columns: ["Roll", "Name", "Section", "Completion %", "Problems solved", "Points", "Last active"],
    rowsFor: (students) =>
      students.map((s) => [
        s.roll, s.name, s.section, completionOf(s), s.solved, s.points,
        s.lastActiveDays === 0 ? "Today" : `${s.lastActiveDays}d ago`,
      ]),
  },
  {
    id: "labs",
    name: "Lab-wise completion",
    description: "One column per lab, so a faculty member can see their own course at a glance.",
    columns: ["Roll", "Name", "Section", ...LAB_IDS.map(labName), "Average %"],
    rowsFor: (students) =>
      students.map((s) => [s.roll, s.name, s.section, ...LAB_IDS.map((id) => s.labs[id]), completionOf(s)]),
  },
  {
    id: "exams",
    name: "Exam performance",
    description: "Mock-exam averages with the 60% placement cutoff applied.",
    columns: ["Roll", "Name", "Section", "Exam avg %", "Cutoff cleared", "Attendance %"],
    rowsFor: (students) =>
      students.map((s) => [s.roll, s.name, s.section, s.examAvg, s.examAvg >= 60 ? "Yes" : "No", s.attendance]),
  },
  {
    id: "risk",
    name: "At-risk register",
    description: "Students who have stalled, ordered by how long they have been away.",
    columns: ["Roll", "Name", "Section", "Risk", "Days inactive", "Completion %", "Exam avg %"],
    rowsFor: (students) =>
      students
        .filter((s) => s.risk === "critical" || s.risk === "atRisk")
        .sort((a, b) => b.lastActiveDays - a.lastActiveDays)
        .map((s) => [s.roll, s.name, s.section, RISK[s.risk].label, s.lastActiveDays, completionOf(s), s.examAvg]),
  },
  {
    id: "placement",
    name: "Placement readiness",
    description: "The shortlist view: who clears both the completion and exam bars.",
    columns: ["Roll", "Name", "Branch", "Year", "Completion %", "Exam avg %", "Ready"],
    rowsFor: (students) =>
      students
        .slice()
        .sort((a, b) => Number(b.placementReady) - Number(a.placementReady) || b.examAvg - a.examAvg)
        .map((s) => [s.roll, s.name, s.branch, s.year, completionOf(s), s.examAvg, s.placementReady ? "Yes" : "No"]),
  },
];

export function getPreset(id: string) {
  return REPORT_PRESETS.find((p) => p.id === id) ?? REPORT_PRESETS[0];
}

export function applyFilters(filters: ReportFilters): Student[] {
  return STUDENTS.filter(
    (s) =>
      (filters.branch === "All" || s.branch === filters.branch) &&
      (filters.section === "All" || s.section === filters.section) &&
      (filters.year === "All" || String(s.year) === filters.year),
  );
}

/** RFC-4180-ish quoting: enough for names with commas and quoted text. */
export function toCsv(columns: string[], rows: (string | number)[][]): string {
  const cell = (v: string | number) => {
    const str = String(v);
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };
  return [columns.map(cell).join(","), ...rows.map((r) => r.map(cell).join(","))].join("\n");
}

/** Browser-side CSV download; the real console streams the file from the API. */
export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export type PastReport = {
  id: string;
  name: string;
  scope: string;
  rows: number;
  when: string;
  by: string;
};

export const REPORT_HISTORY: PastReport[] = [
  { id: "r-1", name: "At-risk register", scope: "CSE · Year 3", rows: 18, when: "Today, 9:12 AM", by: "Dr. Latha Nair" },
  { id: "r-2", name: "Placement readiness", scope: "All branches", rows: 152, when: "Yesterday, 4:40 PM", by: "Dr. Latha Nair" },
  { id: "r-3", name: "Lab-wise completion", scope: "CSE-A", rows: 46, when: "6 Sep, 11:02 AM", by: "Dr. Meera Raghavan" },
  { id: "r-4", name: "Exam performance", scope: "IT · Year 3", rows: 28, when: "4 Sep, 2:25 PM", by: "Prof. Anand Krishnan" },
];
