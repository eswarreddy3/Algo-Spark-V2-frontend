import type { Week } from "../types";
import { outline } from "./shared";

export const DBMS_WEEKS: Week[] = [
  {
    n: 1,
    title: "ER Modelling & Schema Design",
    summary: "Turning a written requirement into entities, relationships and keys.",
    objectives: [
      "Identify entities, attributes and relationships from a problem statement",
      "Choose a primary key and justify it",
      "Map an ER diagram to relational tables",
    ],
    points: 150,
    readingMinutes: 18,
    mcqPassRatio: 0.6,
    resources: [
      { label: "Week 1 slides — ER Modelling", kind: "pdf", meta: "PDF · 2.2 MB" },
      { label: "Case study — college database requirements", kind: "link", meta: "Handout" },
    ],
    slides: [
      {
        title: "From requirement to model",
        bullets: [
          "Nouns in the requirement are candidate entities",
          "Verbs connecting them are candidate relationships",
          "Adjectives and values are attributes",
        ],
      },
      {
        title: "Keys",
        bullets: [
          "Super key — any set of attributes that identifies a row uniquely",
          "Candidate key — a minimal super key",
          "Primary key — the candidate key you choose; never null, never reused",
        ],
      },
      {
        title: "Cardinality",
        bullets: [
          "1:1 — a student has one library card",
          "1:N — a department has many students",
          "M:N — students enrol in many courses; needs a junction table",
        ],
      },
      {
        title: "ER to tables",
        bullets: [
          "Each entity becomes a table; attributes become columns",
          "1:N puts the foreign key on the N side",
          "M:N becomes its own table holding both foreign keys",
        ],
        code: {
          language: "sql",
          source: "-- M:N enrolment between students and courses\nCREATE TABLE enrolment (\n  student_id INTEGER REFERENCES students(id),\n  course_id  INTEGER REFERENCES courses(id),\n  PRIMARY KEY (student_id, course_id)\n);",
        },
      },
      {
        title: "Common modelling mistakes",
        bullets: [
          "Storing a comma-separated list instead of a junction table",
          "Using a mutable value (email, phone) as the primary key",
          "Duplicating an attribute across two tables instead of joining",
        ],
        note: "Bring your ER diagram to the lab — the exercise assumes the schema on slide 4.",
      },
    ],
    mcqs: [
      {
        id: "db1-1",
        q: "A minimal set of attributes that uniquely identifies a row is called:",
        opts: ["Super key", "Candidate key", "Foreign key", "Composite attribute"],
        a: 1,
        explain: "Every candidate key is a super key, but no proper subset of it identifies a row.",
      },
      {
        id: "db1-2",
        q: "An M:N relationship between students and courses is represented by:",
        opts: [
          "A foreign key on students",
          "A foreign key on courses",
          "A separate junction table holding both keys",
          "A comma-separated column",
        ],
        a: 2,
        explain: "Neither side can hold a single foreign key, so the relationship gets its own table.",
      },
      {
        id: "db1-3",
        q: "In a 1:N relationship, the foreign key is placed on:",
        opts: ["The 1 side", "The N side", "Both sides", "Neither side"],
        a: 1,
        explain: "Each row on the N side points at exactly one row on the 1 side.",
      },
      {
        id: "db1-4",
        q: "Which is the weakest choice for a primary key?",
        opts: ["A surrogate integer id", "Roll number", "Email address", "Composite (student_id, course_id)"],
        a: 2,
        explain: "Email changes; a primary key must be stable for the lifetime of the row.",
      },
    ],
    exercise: {
      id: "db1-schema",
      title: "Create the Enrolment Schema",
      difficulty: "Easy",
      points: 50,
      statement: [
        "Write the DDL for a junction table `enrolment` that links `students(id)` and `courses(id)`.",
        "It must carry the enrolment date, prevent the same student enrolling twice in one course, and cascade deletes from students.",
      ],
      constraints: [
        "Use a composite primary key",
        "Both foreign keys must reference the parent tables",
        "enrolled_on defaults to the current date",
      ],
      examples: [
        { input: "students(id, name), courses(id, title)", output: "enrolment(student_id, course_id, enrolled_on)" },
      ],
      languages: ["sql"],
      signals: ["create table", "primary key", "references"],
      starter: {
        sql: `-- students(id INTEGER PRIMARY KEY, name TEXT)
-- courses(id INTEGER PRIMARY KEY, title TEXT)

CREATE TABLE enrolment (
  -- TODO: student_id, course_id, enrolled_on
  -- TODO: composite primary key + foreign keys with ON DELETE CASCADE
);`,
      },
      tests: [
        { id: "t1", name: "Table created", input: "PRAGMA table_info(enrolment)", expected: "3 columns" },
        { id: "t2", name: "Composite primary key", input: "duplicate (1, 1) insert", expected: "constraint violation" },
        { id: "t3", name: "Foreign keys declared", input: "insert with unknown course_id", expected: "constraint violation" },
        { id: "t4", name: "Cascade on delete", input: "DELETE FROM students WHERE id = 1", expected: "enrolment rows removed", hidden: true },
      ],
      resultColumns: [
        { key: "cid", label: "cid" },
        { key: "name", label: "name" },
        { key: "type", label: "type" },
        { key: "pk", label: "pk" },
      ],
      resultRows: [
        [0, "student_id", "INTEGER", 1],
        [1, "course_id", "INTEGER", 1],
        [2, "enrolled_on", "DATE", 0],
      ],
    },
  },

  {
    n: 2,
    title: "SQL DDL & Constraints",
    summary: "Types, defaults and the constraints that keep bad rows out.",
    objectives: [
      "Create and alter tables with appropriate column types",
      "Apply NOT NULL, UNIQUE, CHECK and DEFAULT correctly",
      "Predict which insert a given constraint will reject",
    ],
    points: 150,
    readingMinutes: 16,
    mcqPassRatio: 0.6,
    resources: [
      { label: "Week 2 slides — DDL & Constraints", kind: "pdf", meta: "PDF · 1.7 MB" },
      { label: "SQLite type affinity reference", kind: "link", meta: "Reference" },
    ],
    slides: [
      {
        title: "DDL vs DML",
        bullets: [
          "DDL defines structure: CREATE, ALTER, DROP",
          "DML moves data: INSERT, UPDATE, DELETE, SELECT",
          "DDL usually commits implicitly — be careful in production",
        ],
      },
      {
        title: "Choosing column types",
        bullets: [
          "INTEGER for counts and ids, REAL for measurements",
          "TEXT for names; store dates as DATE / ISO-8601 text",
          "Never store a number as text just because it has leading zeros — use a format on display",
        ],
      },
      {
        title: "Constraints",
        bullets: [
          "NOT NULL — the column must always have a value",
          "UNIQUE — no two rows may share the value",
          "CHECK — an arbitrary boolean the row must satisfy",
          "DEFAULT — the value used when the insert omits the column",
        ],
        code: {
          language: "sql",
          source: "CREATE TABLE students (\n  id     INTEGER PRIMARY KEY,\n  roll   TEXT    NOT NULL UNIQUE,\n  name   TEXT    NOT NULL,\n  cgpa   REAL    CHECK (cgpa BETWEEN 0 AND 10),\n  active INTEGER DEFAULT 1\n);",
        },
      },
      {
        title: "Referential integrity",
        bullets: [
          "A foreign key must match an existing parent row",
          "ON DELETE CASCADE removes children with the parent",
          "ON DELETE RESTRICT refuses the delete while children exist",
        ],
      },
      {
        title: "Altering a live table",
        bullets: [
          "ALTER TABLE … ADD COLUMN is cheap; dropping a column often is not",
          "Adding a NOT NULL column needs a DEFAULT for existing rows",
          "Always test the migration on a copy first",
        ],
        note: "The lab exam gives you a broken schema and asks which constraint would have prevented the bad data.",
      },
    ],
    mcqs: [
      {
        id: "db2-1",
        q: "Which constraint enforces that cgpa never exceeds 10?",
        opts: ["UNIQUE", "CHECK", "NOT NULL", "DEFAULT"],
        a: 1,
        explain: "CHECK evaluates a boolean expression for every inserted or updated row.",
      },
      {
        id: "db2-2",
        q: "A UNIQUE column may contain:",
        opts: ["Duplicate values", "At most one NULL in most engines", "Only integers", "Only primary keys"],
        a: 1,
        explain: "Duplicates are rejected; NULL handling varies, and SQLite allows multiple NULLs while a single-NULL rule is common elsewhere.",
      },
      {
        id: "db2-3",
        q: "ON DELETE CASCADE means:",
        opts: [
          "The delete is refused while children exist",
          "Child rows are deleted along with the parent",
          "Child foreign keys are set to NULL",
          "Nothing happens to children",
        ],
        a: 1,
        explain: "The delete propagates down the relationship.",
      },
      {
        id: "db2-4",
        q: "Adding a NOT NULL column to a table with existing rows requires:",
        opts: ["A DEFAULT value", "Dropping the table", "A new primary key", "Nothing extra"],
        a: 0,
        explain: "The existing rows need a value for the new column, and the DEFAULT supplies it.",
      },
    ],
    exercise: {
      id: "db2-constraints",
      title: "Constrain the Students Table",
      difficulty: "Easy",
      points: 50,
      statement: [
        "Rewrite the `students` table so bad data cannot get in: roll numbers are unique and mandatory, names are mandatory, CGPA sits between 0 and 10, and new students are active by default.",
      ],
      constraints: ["Keep id as an INTEGER PRIMARY KEY", "Use CHECK for the CGPA range", "active defaults to 1"],
      examples: [
        { input: "INSERT INTO students(roll, name, cgpa) VALUES ('21CS042', 'Aditya', 11.2)", output: "rejected by CHECK" },
      ],
      languages: ["sql"],
      signals: ["check", "unique"],
      starter: {
        sql: `CREATE TABLE students (
  id   INTEGER PRIMARY KEY,
  roll TEXT,
  name TEXT,
  cgpa REAL,
  active INTEGER
  -- TODO: add NOT NULL, UNIQUE, CHECK and DEFAULT where they belong
);`,
      },
      tests: [
        { id: "t1", name: "Duplicate roll rejected", input: "two inserts with roll '21CS042'", expected: "UNIQUE violation" },
        { id: "t2", name: "Missing name rejected", input: "INSERT with name = NULL", expected: "NOT NULL violation" },
        { id: "t3", name: "CGPA above 10 rejected", input: "cgpa = 11.2", expected: "CHECK violation" },
        { id: "t4", name: "active defaults to 1", input: "INSERT without active", expected: "active = 1", hidden: true },
      ],
    },
  },

  {
    n: 3,
    title: "SELECT, Joins & Aggregation",
    summary: "Reading data back: filtering, joining and grouping.",
    objectives: [
      "Write INNER and LEFT joins and predict their row counts",
      "Group rows and filter groups with HAVING",
      "Order and limit a result set for a report",
    ],
    points: 150,
    readingMinutes: 20,
    mcqPassRatio: 0.6,
    resources: [
      { label: "Week 3 slides — Joins & Aggregation", kind: "pdf", meta: "PDF · 2.3 MB" },
      { label: "Recorded lecture — joins on the whiteboard", kind: "video", meta: "Video · 19:52" },
      { label: "Practice database — students.db", kind: "link", meta: "Dataset" },
    ],
    slides: [
      {
        title: "The order SQL actually runs",
        bullets: [
          "FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT",
          "That is why a SELECT alias cannot be used in WHERE",
          "But it can be used in ORDER BY, which runs later",
        ],
      },
      {
        title: "Joins",
        bullets: [
          "INNER JOIN keeps only rows matching on both sides",
          "LEFT JOIN keeps every left row, filling the right with NULL",
          "The join condition lives in ON; extra filtering lives in WHERE",
        ],
        code: {
          language: "sql",
          source: "SELECT s.name, c.title\nFROM students s\nJOIN enrolment e ON e.student_id = s.id\nJOIN courses  c ON c.id = e.course_id\nWHERE s.active = 1;",
        },
      },
      {
        title: "Aggregation",
        bullets: [
          "COUNT, SUM, AVG, MIN, MAX collapse many rows into one",
          "GROUP BY says which column defines a group",
          "Every non-aggregated SELECT column must appear in GROUP BY",
        ],
      },
      {
        title: "WHERE vs HAVING",
        bullets: [
          "WHERE filters rows before grouping",
          "HAVING filters groups after aggregation",
          "Putting an aggregate in WHERE is an error — that is what HAVING is for",
        ],
      },
      {
        title: "Reporting shape",
        bullets: [
          "ORDER BY … DESC for leaderboards, then LIMIT for a top-N list",
          "Alias every computed column so the report reads cleanly",
          "NULLs sort together — decide where you want them",
        ],
        note: "The exercise below is the query your admin dashboard runs for the branch leaderboard.",
      },
    ],
    mcqs: [
      {
        id: "db3-1",
        q: "Which clause filters groups after aggregation?",
        opts: ["WHERE", "HAVING", "ON", "LIMIT"],
        a: 1,
        explain: "WHERE runs before GROUP BY, so aggregate conditions belong in HAVING.",
      },
      {
        id: "db3-2",
        q: "A LEFT JOIN returns:",
        opts: [
          "Only matching rows",
          "Every left row, with NULLs where the right has no match",
          "Every right row",
          "The cartesian product",
        ],
        a: 1,
        explain: "The left table is preserved in full; unmatched right columns become NULL.",
      },
      {
        id: "db3-3",
        q: "SELECT branch, MAX(score) FROM students GROUP BY branch returns:",
        opts: ["One row per student", "One row per branch", "A single row", "An error"],
        a: 1,
        explain: "GROUP BY collapses the rows of each branch into one output row.",
      },
      {
        id: "db3-4",
        q: "Why can't you use a SELECT alias inside WHERE?",
        opts: [
          "Aliases are not allowed in SQL",
          "WHERE is evaluated before SELECT",
          "It would be ambiguous with column names",
          "You can — it is valid everywhere",
        ],
        a: 1,
        explain: "The alias does not exist yet at the time WHERE runs.",
      },
    ],
    exercise: {
      id: "db3-leaderboard",
      title: "Branch Leaderboard Query",
      difficulty: "Medium",
      points: 60,
      statement: [
        "The admin dashboard shows the top scorer of every branch. Using `students(id, name, branch, score, active)`, return one row per branch with the branch, the name of its highest scorer and that score, aliased as `top`.",
        "Only active students count, and branches with fewer than three active students should be left out. Order by `top` descending.",
      ],
      constraints: ["Use GROUP BY on branch", "Filter inactive students before grouping", "Filter small branches with HAVING"],
      examples: [
        { input: "students table with CSE, IT, ECE rows", output: "CSE | Aarav Sharma | 982" },
      ],
      languages: ["sql"],
      signals: ["group by", "having", "order by"],
      starter: {
        sql: `-- students(id, name, branch, score, active)

SELECT branch
FROM students
-- TODO: keep only active students
-- TODO: group by branch and take the maximum score as "top"
-- TODO: drop branches with fewer than 3 active students
-- TODO: order by top, highest first
;`,
      },
      tests: [
        { id: "t1", name: "One row per branch", input: "12 students across 3 branches", expected: "3 rows" },
        { id: "t2", name: "Inactive students excluded", input: "top scorer marked inactive", expected: "next highest returned" },
        { id: "t3", name: "Small branches dropped", input: "branch with 2 active students", expected: "not in result" },
        { id: "t4", name: "Ordering", input: "scores 982 / 940 / 915", expected: "descending by top", hidden: true },
      ],
      resultColumns: [
        { key: "branch", label: "branch" },
        { key: "name", label: "name" },
        { key: "top", label: "top" },
      ],
      resultRows: [
        ["CSE", "Aarav Sharma", 982],
        ["IT", "Sneha Reddy", 940],
        ["ECE", "Karthik V", 915],
      ],
    },
  },

  {
    n: 4,
    title: "Subqueries & Views",
    summary: "Composing queries and naming the ones you reuse.",
    objectives: [
      "Write scalar, IN and correlated subqueries",
      "Replace a repeated subquery with a view",
      "Reason about when a subquery is cheaper than a join",
    ],
    points: 150,
    readingMinutes: 17,
    mcqPassRatio: 0.6,
    resources: [
      { label: "Week 4 slides — Subqueries & Views", kind: "pdf", meta: "PDF · 1.9 MB" },
    ],
    slides: [
      {
        title: "Kinds of subquery",
        bullets: [
          "Scalar — returns one value, usable anywhere a value is",
          "IN / EXISTS — returns a set to test membership against",
          "Derived table — a full result set used in FROM",
        ],
      },
      {
        title: "Correlated subqueries",
        bullets: [
          "References a column from the outer query",
          "Runs once per outer row — powerful but easy to make slow",
          "Often rewritable as a join plus aggregation",
        ],
        code: {
          language: "sql",
          source: "SELECT name, score\nFROM students s\nWHERE score = (\n  SELECT MAX(score) FROM students WHERE branch = s.branch\n);",
        },
      },
      {
        title: "EXISTS vs IN",
        bullets: [
          "EXISTS stops at the first match — good for large inner sets",
          "IN materialises the set — fine when it is small",
          "NOT IN with a NULL in the set returns no rows; NOT EXISTS does not have that trap",
        ],
      },
      {
        title: "Views",
        bullets: [
          "A named query you can select from like a table",
          "Keeps reporting logic in one place",
          "Not materialised by default — it re-runs on every use",
        ],
      },
      {
        title: "When to use which",
        bullets: [
          "Reused reporting shape → view",
          "One-off filter against a set → IN / EXISTS",
          "Row-by-row comparison against a group → correlated subquery or window function",
        ],
        note: "Window functions arrive in the theory paper; this lab stays on subqueries and views.",
      },
    ],
    mcqs: [
      {
        id: "db4-1",
        q: "A correlated subquery is one that:",
        opts: [
          "Returns exactly one row",
          "References a column from the outer query",
          "Is stored in the schema",
          "Cannot be used with EXISTS",
        ],
        a: 1,
        explain: "That reference is what forces it to be evaluated per outer row.",
      },
      {
        id: "db4-2",
        q: "A view is:",
        opts: [
          "A copy of the data",
          "A stored query that runs when selected from",
          "An index",
          "A backup",
        ],
        a: 1,
        explain: "Unless it is a materialised view, no data is duplicated.",
      },
      {
        id: "db4-3",
        q: "NOT IN (SELECT …) returns no rows when the inner set:",
        opts: ["Is empty", "Contains a NULL", "Contains duplicates", "Is sorted"],
        a: 1,
        explain: "Comparing against NULL yields UNKNOWN, so no row satisfies the predicate. NOT EXISTS avoids this.",
      },
      {
        id: "db4-4",
        q: "EXISTS is usually preferred over IN when:",
        opts: ["The inner result is very large", "The outer table is empty", "Both tables are tiny", "You need ordering"],
        a: 0,
        explain: "EXISTS short-circuits on the first match instead of building the whole set.",
      },
    ],
    exercise: {
      id: "db4-view",
      title: "Active Toppers View",
      difficulty: "Medium",
      points: 60,
      statement: [
        "Create a view `active_toppers` that lists every active student whose score equals the highest score in their own branch.",
        "Return the columns name, branch and score, highest score first.",
      ],
      constraints: ["Use CREATE VIEW", "The inner comparison must be per branch", "Only active students appear"],
      examples: [
        { input: "SELECT * FROM active_toppers", output: "one row per branch topper" },
      ],
      languages: ["sql"],
      signals: ["create view", "select"],
      starter: {
        sql: `-- students(id, name, branch, score, active)

CREATE VIEW active_toppers AS
-- TODO: select the active students whose score is the branch maximum
;`,
      },
      tests: [
        { id: "t1", name: "View exists", input: "SELECT * FROM active_toppers", expected: "runs without error" },
        { id: "t2", name: "One topper per branch", input: "3 branches", expected: "3 rows" },
        { id: "t3", name: "Inactive excluded", input: "inactive top scorer", expected: "not listed" },
        { id: "t4", name: "Ties both listed", input: "two students tie at 982", expected: "2 rows for that branch", hidden: true },
      ],
      resultColumns: [
        { key: "name", label: "name" },
        { key: "branch", label: "branch" },
        { key: "score", label: "score" },
      ],
      resultRows: [
        ["Aarav Sharma", "CSE", 982],
        ["Sneha Reddy", "IT", 940],
        ["Karthik V", "ECE", 915],
      ],
    },
  },

  outline(5, "Normalization", "1NF to BCNF, and the anomalies each form removes.", [
    "Identify insertion, update and deletion anomalies in a flat table",
    "Decompose a relation to 3NF without losing dependencies",
    "Argue when denormalisation is the right call",
  ]),
  outline(6, "Transactions & ACID", "Concurrency, isolation levels and rollback.", [
    "Explain each ACID property with a banking example",
    "Reproduce a dirty read and a lost update",
    "Pick an isolation level for a given workload",
  ]),
  outline(7, "Indexing", "B-trees, selectivity and reading a query plan.", [
    "Explain how a B-tree index turns a scan into a seek",
    "Read EXPLAIN QUERY PLAN output",
    "Decide which columns deserve an index",
  ]),
  outline(8, "Stored Procedures & Triggers", "Logic that lives inside the database.", [
    "Write a procedure with parameters and control flow",
    "Use a trigger to maintain an audit table",
  ]),
  outline(9, "NoSQL Basics", "Document stores and when relational is the wrong shape.", [
    "Compare document, key-value and column stores",
    "Model the same data relationally and as documents",
  ]),
  outline(10, "Mini Project", "Design, build and defend a small database application.", [
    "Deliver a schema, seed data and five reporting queries",
    "Defend the design choices in a viva",
  ]),
];
