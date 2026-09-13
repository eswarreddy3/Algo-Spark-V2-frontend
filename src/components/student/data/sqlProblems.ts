import type { Exercise } from "../labs/types";
import type { PracticeProblem } from "./problems";

/**
 * SQL practice bank. Every problem runs against `PRACTICE_SCHEMA`; `tags` are
 * the SQL concepts a problem exercises and drive the topic filter.
 */

const cols = (...names: string[]) => names.map((key) => ({ key, label: key }));

function sql(p: Omit<Exercise, "languages" | "constraints"> & { constraints?: string[] }): Exercise {
  return { constraints: [], ...p, languages: ["sql"] };
}

/** A SQL problem adds progressive hints and a reference solution to the shared problem shape. */
export type SqlProblem = PracticeProblem & { hints: string[]; solution: string };

const BASE: PracticeProblem[] = [
  {
    tags: ["Filtering", "Sorting"],
    companies: ["TCS", "Infosys"],
    acceptance: 78,
    solvedSeed: true,
    exercise: sql({
      id: "sql-active-cse",
      title: "Active CSE Students",
      difficulty: "Easy",
      points: 20,
      statement: [
        "List the `roll`, `name` and `cgpa` of every active student in the department with code `CSE`. Order the result by `cgpa`, highest first.",
      ],
      constraints: ["active = 1 means the student is enrolled", "Look up the department by its code, not a hard-coded id"],
      examples: [{ input: "students, departments", output: "21CS001 | Aarav Sharma | 9.1" }],
      signals: ["where", "order by", "desc"],
      starter: { sql: "-- students(id, roll, name, dept_id, year, cgpa, score, active)\n-- departments(id, code, name, hod)\n\nSELECT roll, name, cgpa\nFROM students\n;" },
      tests: [
        { id: "t1", name: "Only CSE", input: "students across 6 departments", expected: "CSE rows only" },
        { id: "t2", name: "Inactive excluded", input: "one inactive CSE student", expected: "not returned" },
        { id: "t3", name: "Ordering", input: "cgpa 9.1 / 8.7 / 8.2", expected: "descending", hidden: true },
      ],
      resultColumns: cols("roll", "name", "cgpa"),
      resultRows: [["21CS001", "Aarav Sharma", 9.1], ["21CS002", "Rohan Das", 8.7], ["21CS019", "Meera Joshi", 8.2]],
    }),
  },
  {
    tags: ["Aggregation", "Joins"],
    companies: ["Zoho", "Accenture"],
    acceptance: 69,
    solvedSeed: false,
    exercise: sql({
      id: "sql-dept-count",
      title: "Students per Department",
      difficulty: "Easy",
      points: 25,
      statement: [
        "For every department, return its `code` and the number of active students as `students`. Departments with no students should still appear with `0`.",
      ],
      constraints: ["Order by students descending, then code"],
      examples: [{ input: "departments, students", output: "CSE | 124" }],
      signals: ["left join", "count", "group by"],
      starter: { sql: "-- departments(id, code, name, hod)\n-- students(id, roll, name, dept_id, year, cgpa, score, active)\n\nSELECT d.code\nFROM departments d\n;" },
      tests: [
        { id: "t1", name: "Counts per department", input: "6 departments", expected: "6 rows" },
        { id: "t2", name: "Empty department kept", input: "MECH with no students", expected: "MECH | 0" },
        { id: "t3", name: "Inactive not counted", input: "inactive students present", expected: "active only", hidden: true },
      ],
      resultColumns: cols("code", "students"),
      resultRows: [["CSE", 124], ["IT", 98], ["ECE", 86], ["EEE", 72], ["CIVIL", 0], ["MECH", 0]],
    }),
  },
  {
    tags: ["Aggregation", "Having"],
    companies: ["Amazon"],
    acceptance: 58,
    solvedSeed: false,
    exercise: sql({
      id: "sql-course-average",
      title: "High-Scoring Courses",
      difficulty: "Medium",
      points: 35,
      statement: [
        "Return each course `title` with the average of its non-null `marks` as `avg_marks` (rounded to 1 decimal). Keep only courses whose average is above 75 and that have at least 20 graded enrolments.",
      ],
      constraints: ["NULL marks mean not yet graded", "Order by avg_marks descending"],
      examples: [{ input: "courses, enrolment", output: "Data Structures | 82.4" }],
      signals: ["avg", "group by", "having"],
      starter: { sql: "-- courses(id, code, title, dept_id, credits)\n-- enrolment(student_id, course_id, semester, marks)\n\nSELECT c.title\nFROM courses c\n;" },
      tests: [
        { id: "t1", name: "Average above 75", input: "averages 82.4 / 74.9", expected: "only 82.4" },
        { id: "t2", name: "Minimum graded rows", input: "course with 12 graded rows", expected: "excluded" },
        { id: "t3", name: "NULL marks ignored", input: "ungraded enrolments", expected: "not averaged", hidden: true },
      ],
      resultColumns: cols("title", "avg_marks"),
      resultRows: [["Data Structures", 82.4], ["Database Systems", 79.1], ["Operating Systems", 76.3]],
    }),
  },
  {
    tags: ["Joins", "Null handling"],
    companies: ["Microsoft", "Flipkart"],
    acceptance: 52,
    solvedSeed: false,
    exercise: sql({
      id: "sql-no-enrolment",
      title: "Students Without Enrolments",
      difficulty: "Medium",
      points: 35,
      statement: [
        "Find every active student who is not enrolled in any course this semester (`semester = 3`). Return `roll` and `name`, ordered by `roll`.",
      ],
      constraints: ["A student enrolled only in other semesters still counts as not enrolled"],
      examples: [{ input: "students, enrolment", output: "21EC031 | Divya N" }],
      signals: ["left join", "is null"],
      starter: { sql: "-- students(id, roll, name, dept_id, year, cgpa, score, active)\n-- enrolment(student_id, course_id, semester, marks)\n\nSELECT s.roll, s.name\nFROM students s\n;" },
      tests: [
        { id: "t1", name: "Never enrolled", input: "student with no rows", expected: "returned" },
        { id: "t2", name: "Enrolled in semester 3", input: "student with a sem-3 row", expected: "not returned" },
        { id: "t3", name: "Only older semesters", input: "student with sem-2 rows only", expected: "returned", hidden: true },
      ],
      resultColumns: cols("roll", "name"),
      resultRows: [["21EC031", "Divya N"], ["21EE007", "Harish K"]],
    }),
  },
  {
    tags: ["Subqueries"],
    companies: ["Google", "Amazon"],
    acceptance: 44,
    solvedSeed: false,
    exercise: sql({
      id: "sql-second-package",
      title: "Second Highest Package",
      difficulty: "Medium",
      points: 40,
      statement: [
        "Return the second highest distinct `package_lpa` from `placements` as `second_highest`. If there is no second value, return `NULL`.",
      ],
      constraints: ["Duplicate packages count once"],
      examples: [{ input: "packages 32.5, 32.5, 24.0", output: "24.0" }],
      signals: ["max", "select max", "<"],
      starter: { sql: "-- placements(id, student_id, company, package_lpa, offer_date)\n\nSELECT\n;" },
      tests: [
        { id: "t1", name: "Distinct values", input: "32.5, 32.5, 24.0", expected: "24.0" },
        { id: "t2", name: "Single package", input: "only 32.5", expected: "NULL" },
        { id: "t3", name: "Many offers", input: "212 rows", expected: "28.0", hidden: true },
      ],
      resultColumns: cols("second_highest"),
      resultRows: [[28.0]],
    }),
  },
  {
    tags: ["Window functions"],
    companies: ["Uber", "Meta"],
    acceptance: 36,
    solvedSeed: false,
    exercise: sql({
      id: "sql-rank-in-dept",
      title: "Rank Students Within Department",
      difficulty: "Hard",
      points: 50,
      statement: [
        "For each active student return `dept_code`, `name`, `score` and `dept_rank`: their rank by score inside their own department (1 = highest). Ties share a rank and the next rank is not skipped.",
        "Return only the top 3 of every department.",
      ],
      constraints: ["Use a window function", "Order by dept_code, dept_rank"],
      examples: [{ input: "CSE scores 982, 940, 940", output: "ranks 1, 2, 2" }],
      signals: ["dense_rank", "over", "partition by"],
      starter: { sql: "-- students(id, roll, name, dept_id, year, cgpa, score, active)\n-- departments(id, code, name, hod)\n\nSELECT\n;" },
      tests: [
        { id: "t1", name: "Rank restarts per department", input: "CSE and IT", expected: "both start at 1" },
        { id: "t2", name: "Ties share a rank", input: "940, 940", expected: "2, 2 then 3" },
        { id: "t3", name: "Top three only", input: "10 students per department", expected: "≤ 3 rows each", hidden: true },
      ],
      resultColumns: cols("dept_code", "name", "score", "dept_rank"),
      resultRows: [["CSE", "Aarav Sharma", 982, 1], ["CSE", "Rohan Das", 940, 2], ["IT", "Sneha Reddy", 955, 1]],
    }),
  },
  {
    tags: ["Joins", "Aggregation"],
    companies: ["Google", "Adobe"],
    acceptance: 31,
    solvedSeed: false,
    exercise: sql({
      id: "sql-placement-rate",
      title: "Placement Rate by Department",
      difficulty: "Hard",
      points: 55,
      statement: [
        "For every department return `code`, the number of final-year (`year = 4`) students as `eligible`, how many of them have at least one offer as `placed`, and `rate` = placed / eligible × 100 rounded to 1 decimal.",
        "A student with several offers counts once. Order by `rate` descending.",
      ],
      constraints: ["Departments with no eligible students are left out", "Avoid integer division"],
      examples: [{ input: "CSE: 120 eligible, 96 placed", output: "CSE | 120 | 96 | 80.0" }],
      signals: ["count(distinct", "left join", "group by"],
      starter: { sql: "-- departments(id, code, name, hod)\n-- students(id, roll, name, dept_id, year, cgpa, score, active)\n-- placements(id, student_id, company, package_lpa, offer_date)\n\nSELECT d.code\nFROM departments d\n;" },
      tests: [
        { id: "t1", name: "Multiple offers count once", input: "student with 3 offers", expected: "placed += 1" },
        { id: "t2", name: "Rate precision", input: "96 / 120", expected: "80.0" },
        { id: "t3", name: "No eligible students", input: "department of first-years", expected: "excluded", hidden: true },
      ],
      resultColumns: cols("code", "eligible", "placed", "rate"),
      resultRows: [["CSE", 120, 96, 80.0], ["IT", 94, 71, 75.5], ["ECE", 82, 49, 59.8]],
    }),
  },
];

/** Deterministic roster so the expected output is long enough to page through. */
function cseRoster(): (string | number)[][] {
  const first = ["Aarav", "Rohan", "Meera", "Karthik", "Divya", "Ishaan", "Priya", "Nikhil", "Ananya", "Varun", "Sneha", "Harish", "Kavya", "Arjun", "Pooja", "Siddharth", "Lakshmi", "Rahul", "Tanvi", "Aditya", "Neha", "Vikram", "Ritu", "Manoj"];
  const last = ["Sharma", "Das", "Joshi", "V", "N", "Rao", "Menon", "Gupta", "Iyer", "Reddy", "Nair", "K", "Pillai", "Singh", "Verma", "Kulkarni", "Bhat", "Mehta", "Shah", "Kumar", "Patel", "Chopra", "Sinha", "Jain"];
  return first
    .map((f, i) => [`21CS${String(i + 1).padStart(3, "0")}`, `${f} ${last[i]}`, Math.round((9.4 - i * 0.07) * 10) / 10])
    .sort((a, b) => (b[2] as number) - (a[2] as number));
}

const EXTRAS: Record<string, { hints: string[]; solution: string; resultRows?: (string | number)[][] }> = {
  "sql-active-cse": {
    hints: [
      "Join students to departments on students.dept_id = departments.id.",
      "Filter with WHERE d.code = 'CSE' AND s.active = 1.",
      "Finish with ORDER BY s.cgpa DESC.",
    ],
    solution: "SELECT s.roll, s.name, s.cgpa\nFROM students s\nJOIN departments d ON d.id = s.dept_id\nWHERE d.code = 'CSE'\n  AND s.active = 1\nORDER BY s.cgpa DESC;",
    resultRows: cseRoster(),
  },
  "sql-dept-count": {
    hints: [
      "Start FROM departments so every department is kept.",
      "LEFT JOIN students, putting active = 1 in the ON clause, not in WHERE.",
      "COUNT(s.id) counts only matched students, so empty departments give 0.",
    ],
    solution: "SELECT d.code, COUNT(s.id) AS students\nFROM departments d\nLEFT JOIN students s\n  ON s.dept_id = d.id AND s.active = 1\nGROUP BY d.code\nORDER BY students DESC, d.code;",
  },
  "sql-course-average": {
    hints: [
      "AVG and COUNT on a column both skip NULLs.",
      "Group enrolment rows by course, then filter the groups.",
      "Aggregate conditions go in HAVING: AVG(marks) > 75 AND COUNT(marks) >= 20.",
    ],
    solution: "SELECT c.title, ROUND(AVG(e.marks), 1) AS avg_marks\nFROM courses c\nJOIN enrolment e ON e.course_id = c.id\nGROUP BY c.id, c.title\nHAVING AVG(e.marks) > 75 AND COUNT(e.marks) >= 20\nORDER BY avg_marks DESC;",
  },
  "sql-no-enrolment": {
    hints: [
      "An anti-join finds rows with no match: LEFT JOIN, then keep rows where the right side IS NULL.",
      "Put semester = 3 in the ON clause so older enrolments do not count as a match.",
    ],
    solution: "SELECT s.roll, s.name\nFROM students s\nLEFT JOIN enrolment e\n  ON e.student_id = s.id AND e.semester = 3\nWHERE s.active = 1\n  AND e.student_id IS NULL\nORDER BY s.roll;",
  },
  "sql-second-package": {
    hints: [
      "The highest package is SELECT MAX(package_lpa) FROM placements.",
      "The second highest is the maximum of everything below that value.",
      "MAX over an empty set returns NULL, which covers the single-package case.",
    ],
    solution: "SELECT MAX(package_lpa) AS second_highest\nFROM placements\nWHERE package_lpa < (SELECT MAX(package_lpa) FROM placements);",
  },
  "sql-rank-in-dept": {
    hints: [
      "DENSE_RANK() gives tied rows the same rank without skipping the next one.",
      "PARTITION BY dept_id restarts the ranking for each department.",
      "Rank in a subquery or CTE, then filter dept_rank <= 3 outside it.",
    ],
    solution: "WITH ranked AS (\n  SELECT d.code AS dept_code, s.name, s.score,\n         DENSE_RANK() OVER (PARTITION BY s.dept_id ORDER BY s.score DESC) AS dept_rank\n  FROM students s\n  JOIN departments d ON d.id = s.dept_id\n  WHERE s.active = 1\n)\nSELECT * FROM ranked\nWHERE dept_rank <= 3\nORDER BY dept_code, dept_rank;",
  },
  "sql-placement-rate": {
    hints: [
      "Eligible students are year = 4; count them per department.",
      "LEFT JOIN placements and use COUNT(DISTINCT p.student_id) so several offers count once.",
      "Multiply by 100.0 before dividing to avoid integer division.",
    ],
    solution: "SELECT d.code,\n       COUNT(DISTINCT s.id) AS eligible,\n       COUNT(DISTINCT p.student_id) AS placed,\n       ROUND(COUNT(DISTINCT p.student_id) * 100.0 / COUNT(DISTINCT s.id), 1) AS rate\nFROM departments d\nJOIN students s ON s.dept_id = d.id AND s.year = 4\nLEFT JOIN placements p ON p.student_id = s.id\nGROUP BY d.code\nORDER BY rate DESC;",
  },
};

export const SQL_PROBLEMS: SqlProblem[] = BASE.map((p) => {
  const extra = EXTRAS[p.exercise.id];
  return {
    ...p,
    hints: extra?.hints ?? [],
    solution: extra?.solution ?? "",
    exercise: extra?.resultRows ? { ...p.exercise, resultRows: extra.resultRows } : p.exercise,
  };
});

export function getSqlProblem(id: string) {
  return SQL_PROBLEMS.find((p) => p.exercise.id === id);
}
