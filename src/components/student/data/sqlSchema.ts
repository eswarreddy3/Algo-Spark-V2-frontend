/**
 * The read-only practice database every SQL problem and the playground run
 * against. The real app loads this from the judge's schema endpoint.
 */

export type SqlColumnDef = {
  name: string;
  type: "INTEGER" | "TEXT" | "REAL" | "DATE";
  key?: "PK" | "FK";
  /** `table.column` for foreign keys. */
  references?: string;
  nullable?: boolean;
};

export type SqlTable = {
  name: string;
  description: string;
  rowCount: number;
  columns: SqlColumnDef[];
  sample: (string | number | null)[][];
  /** Top-left corner of the table's box in the ER diagram. */
  er: { x: number; y: number };
};

export const PRACTICE_SCHEMA: SqlTable[] = [
  {
    name: "departments",
    er: { x: 0, y: 150 },
    description: "Academic departments and their heads",
    rowCount: 6,
    columns: [
      { name: "id", type: "INTEGER", key: "PK" },
      { name: "code", type: "TEXT" },
      { name: "name", type: "TEXT" },
      { name: "hod", type: "TEXT", nullable: true },
    ],
    sample: [
      [1, "CSE", "Computer Science & Engg.", "Dr. Meera Raghavan"],
      [2, "IT", "Information Technology", "Prof. Anand Krishnan"],
      [3, "ECE", "Electronics & Communication", "Dr. Suchitra Menon"],
    ],
  },
  {
    name: "students",
    er: { x: 320, y: 0 },
    description: "One row per enrolled student",
    rowCount: 380,
    columns: [
      { name: "id", type: "INTEGER", key: "PK" },
      { name: "roll", type: "TEXT" },
      { name: "name", type: "TEXT" },
      { name: "dept_id", type: "INTEGER", key: "FK", references: "departments.id" },
      { name: "year", type: "INTEGER" },
      { name: "cgpa", type: "REAL" },
      { name: "score", type: "INTEGER" },
      { name: "active", type: "INTEGER" },
    ],
    sample: [
      [1, "21CS001", "Aarav Sharma", 1, 3, 9.1, 982, 1],
      [2, "21CS002", "Rohan Das", 1, 3, 8.7, 940, 1],
      [3, "21IT014", "Sneha Reddy", 2, 3, 8.9, 955, 1],
    ],
  },
  {
    name: "courses",
    er: { x: 320, y: 300 },
    description: "Courses offered each semester",
    rowCount: 24,
    columns: [
      { name: "id", type: "INTEGER", key: "PK" },
      { name: "code", type: "TEXT" },
      { name: "title", type: "TEXT" },
      { name: "dept_id", type: "INTEGER", key: "FK", references: "departments.id" },
      { name: "credits", type: "INTEGER" },
    ],
    sample: [
      [1, "CS201", "Data Structures", 1, 4],
      [2, "CS204", "Database Systems", 1, 4],
      [3, "IT210", "Web Technologies", 2, 3],
    ],
  },
  {
    name: "enrolment",
    er: { x: 640, y: 300 },
    description: "Which student took which course, and the marks",
    rowCount: 1204,
    columns: [
      { name: "student_id", type: "INTEGER", key: "FK", references: "students.id" },
      { name: "course_id", type: "INTEGER", key: "FK", references: "courses.id" },
      { name: "semester", type: "INTEGER" },
      { name: "marks", type: "INTEGER", nullable: true },
    ],
    sample: [
      [1, 1, 3, 91],
      [1, 2, 3, 88],
      [2, 1, 3, 76],
    ],
  },
  {
    name: "placements",
    er: { x: 640, y: 0 },
    description: "Offers received in campus placements",
    rowCount: 212,
    columns: [
      { name: "id", type: "INTEGER", key: "PK" },
      { name: "student_id", type: "INTEGER", key: "FK", references: "students.id" },
      { name: "company", type: "TEXT" },
      { name: "package_lpa", type: "REAL" },
      { name: "offer_date", type: "DATE" },
    ],
    sample: [
      [1, 1, "Google", 32.5, "2026-08-12"],
      [2, 3, "Amazon", 24.0, "2026-08-14"],
      [3, 2, "Zoho", 8.4, "2026-08-20"],
    ],
  },
];
