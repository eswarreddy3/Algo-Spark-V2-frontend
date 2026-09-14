import { C } from "../../theme/tokens";
import type { Exercise, Mcq, Resource, Slide, Week } from "../labs/types";
import { PRACTICE_PROBLEMS } from "./problems";
import { DS_WEEKS } from "../labs/content/ds";
import { DBMS_WEEKS } from "../labs/content/dbms";
import { OS_WEEKS } from "../labs/content/os";

/**
 * Self-paced courses. A course is split into modules (e.g. "Introduction"),
 * each module into topics, and every topic carries up to three parts: a PPT
 * deck, a set of MCQs and a set of coding questions. Non-tech topics have no
 * coding questions. (`sections` in the data shape are the modules.)
 */

/** Course material is always a PPT deck: Module → PPT → (Coding) → MCQ. */
export type MaterialFormat = "ppt";

export const FORMAT_LABEL: Record<MaterialFormat, string> = { ppt: "PPT" };

export type TopicMaterial = {
  format: MaterialFormat;
  /**
   * One content shape for every format: a slide is a slide in a PPT, a page in
   * a PDF and a section in a web article.
   */
  slides: Slide[];
  resources: Resource[];
};

export type Topic = {
  id: string;
  title: string;
  summary: string;
  objectives: string[];
  minutes: number;
  points: number;
  material: TopicMaterial;
  mcqs: Mcq[];
  mcqPassRatio: number;
  /** Coding questions; empty for non-tech topics. */
  exercises: Exercise[];
};

export type Section = { id: string; title: string; topics: Topic[] };

export type CourseScope = "tech" | "nontech";

export type Course = {
  id: string;
  scope: CourseScope;
  title: string;
  blurb: string;
  accent: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  instructor: string;
  sections: Section[];
  /** Topics already completed when the demo starts, counted from the first. */
  completedSeed: number;
};

export const courseTopics = (course: Course) => course.sections.flatMap((s) => s.topics);

export function courseMinutes(course: Course) {
  return courseTopics(course).reduce((sum, l) => sum + l.minutes, 0);
}

/** A practice-bank problem reused as a course coding question. */
const practice = (id: string): Exercise => {
  const ex = (PRACTICE_PROBLEMS.find((p) => p.exercise.id === id) as (typeof PRACTICE_PROBLEMS)[number]).exercise;
  return { ...ex, id: `course-${ex.id}` };
};

/**
 * Builds a topic from a published lab week, so courses and labs share one body
 * of content. `extra` adds more coding questions on top of the week's own.
 */
function fromWeek(courseId: string, week: Week, format: MaterialFormat, extra: Exercise[] = []): Topic {
  const id = `${courseId}-${week.exercise?.id ?? `w${week.n}`}`;
  return {
    id,
    title: week.title,
    summary: week.summary,
    objectives: week.objectives,
    minutes: week.readingMinutes + 25,
    points: 80,
    material: { format, slides: week.slides, resources: week.resources },
    mcqs: week.mcqs,
    mcqPassRatio: week.mcqPassRatio,
    // A separate id keeps course drafts and submissions apart from the lab's.
    exercises: [...(week.exercise ? [{ ...week.exercise, id: `course-${week.exercise.id}` }] : []), ...extra],
  };
}

const week = (weeks: Week[], n: number) => weeks.find((w) => w.n === n) as Week;

/* ---------------- OOP (written for the course) ---------------- */

const OOP_SECTIONS: Section[] = [
  {
    id: "oop-basics",
    title: "Objects & Classes",
    topics: [
      {
        id: "t-oop-classes",
        title: "Classes, Objects & Encapsulation",
        summary: "Model a real thing as a class, and keep its state behind methods.",
        objectives: ["Define a class with state and behaviour", "Explain encapsulation in one sentence", "Spot a leaky abstraction"],
        minutes: 35,
        points: 80,
        material: {
          format: "ppt",
          resources: [{ label: "OOP cheat sheet", kind: "pdf", meta: "PDF · 640 KB" }],
          slides: [
            {
              title: "A class is a blueprint",
              bullets: ["State lives in attributes", "Behaviour lives in methods", "Each object is one instance with its own state"],
              code: { language: "python", source: "class Account:\n    def __init__(self, owner):\n        self.owner = owner\n        self._balance = 0\n\n    def deposit(self, amount):\n        self._balance += amount" },
            },
            {
              title: "Encapsulation",
              bullets: ["Callers change state only through methods", "Methods protect invariants — a balance never goes negative", "The underscore marks internal state in Python"],
            },
            {
              title: "Interview angle",
              bullets: ["Ask: what must always be true about this object?", "Put that rule inside the class, not in every caller"],
              note: "The coding task asks you to enforce exactly one invariant.",
            },
          ],
        },
        mcqPassRatio: 0.6,
        mcqs: [
          { id: "oop1-1", q: "Encapsulation mainly protects:", opts: ["Performance", "An object's invariants", "Inheritance chains", "Memory"], a: 1, explain: "Keeping state behind methods lets the class enforce its own rules." },
          { id: "oop1-2", q: "An object is:", opts: ["A class definition", "An instance of a class", "A module", "A method"], a: 1, explain: "The class is the blueprint; each object is one instance." },
          { id: "oop1-3", q: "Which call breaks encapsulation?", opts: ["acc.deposit(50)", "acc.withdraw(20)", "acc._balance = -100", "acc.statement()"], a: 2, explain: "Writing internal state directly skips the checks in the methods." },
        ],
        exercises: [{
          id: "course-oop-account",
          title: "Safe Bank Account",
          difficulty: "Easy",
          points: 40,
          statement: [
            "Complete the `Account` class. `deposit(amount)` adds to the balance, `withdraw(amount)` subtracts from it, and `balance()` returns the current balance.",
            "A withdrawal that would take the balance below zero must `raise ValueError` and leave the balance unchanged.",
          ],
          constraints: ["amount is a positive integer", "The balance starts at 0"],
          examples: [{ input: "deposit(100); withdraw(30); balance()", output: "70" }],
          languages: ["python"],
          signals: ["raise valueerror", "self._balance"],
          starter: {
            python: `class Account:
    def __init__(self):
        self._balance = 0

    def deposit(self, amount):
        # TODO
        pass

    def withdraw(self, amount):
        # TODO: refuse to go below zero
        pass

    def balance(self):
        return self._balance
`,
          },
          tests: [
            { id: "t1", name: "Deposit then withdraw", input: "deposit(100); withdraw(30)", expected: "70" },
            { id: "t2", name: "Overdraw is refused", input: "deposit(10); withdraw(50)", expected: "ValueError" },
            { id: "t3", name: "Balance unchanged after refusal", input: "deposit(10); withdraw(50); balance()", expected: "10", hidden: true },
          ],
        }],
      },
      {
        id: "t-oop-inheritance",
        title: "Inheritance & Polymorphism",
        summary: "Share behaviour through a base class and let each subclass answer differently.",
        objectives: ["Override a method in a subclass", "Call code through a base-class reference", "Know when composition is the better fit"],
        minutes: 40,
        points: 80,
        material: {
          format: "ppt",
          resources: [{ label: "Composition over inheritance", kind: "link", meta: "Article" }],
          slides: [
            {
              title: "Inheritance",
              bullets: ["A subclass reuses and extends a base class", "Use it for true is-a relationships", "Deep hierarchies are hard to change"],
            },
            {
              title: "Polymorphism",
              bullets: ["The same call does the right thing for each type", "Callers depend on the base type, not the subclasses"],
              code: { language: "python", source: "class Shape:\n    def area(self): raise NotImplementedError\n\nclass Square(Shape):\n    def __init__(self, s): self.s = s\n    def area(self): return self.s * self.s" },
            },
            {
              title: "Composition",
              bullets: ["Has-a beats is-a when behaviour varies independently", "Swap a collaborator instead of adding a subclass"],
            },
          ],
        },
        mcqPassRatio: 0.6,
        mcqs: [
          { id: "oop2-1", q: "Polymorphism lets you:", opts: ["Hide attributes", "Call one method name on many types", "Avoid classes", "Speed up loops"], a: 1, explain: "Each subclass supplies its own implementation behind one interface." },
          { id: "oop2-2", q: "A Car has an Engine. That is:", opts: ["Inheritance", "Composition", "Overloading", "Encapsulation"], a: 1, explain: "Has-a relationships are modelled with composition." },
          { id: "oop2-3", q: "A subclass method with the same signature as the base class:", opts: ["Overloads it", "Overrides it", "Deletes it", "Hides the class"], a: 1, explain: "Same name and signature in a subclass is an override." },
        ],
        exercises: [{
          id: "course-oop-shapes",
          title: "Total Area of Shapes",
          difficulty: "Easy",
          points: 40,
          statement: [
            "`Square` and `Circle` both extend `Shape`. Implement `area()` on each, then complete `total_area(shapes)` so it sums the areas without checking any shape's type.",
          ],
          constraints: ["Use math.pi for circles", "Round the total to 2 decimals"],
          examples: [{ input: "[Square(2), Circle(1)]", output: "7.14" }],
          languages: ["python"],
          signals: ["def area", "sum("],
          starter: {
            python: `import math

class Shape:
    def area(self):
        raise NotImplementedError

class Square(Shape):
    def __init__(self, side):
        self.side = side
    # TODO: area

class Circle(Shape):
    def __init__(self, r):
        self.r = r
    # TODO: area

def total_area(shapes):
    # TODO: no isinstance checks
    pass
`,
          },
          tests: [
            { id: "t1", name: "Mixed shapes", input: "[Square(2), Circle(1)]", expected: "7.14" },
            { id: "t2", name: "Empty list", input: "[]", expected: "0" },
            { id: "t3", name: "Many squares", input: "[Square(1)] * 5", expected: "5.0", hidden: true },
          ],
        }],
      },
    ],
  },
];

/* ---------------- tech catalog ---------------- */

export const TECH_COURSES: Course[] = [
  {
    id: "t-dsa",
    scope: "tech",
    title: "DSA for Placements",
    blurb: "Arrays to trees, taught around the patterns interviewers actually ask.",
    accent: C.royal,
    level: "Intermediate",
    instructor: "Dr. Meera Raghavan",
    completedSeed: 3,
    sections: [
      {
        id: "dsa-intro",
        title: "Introduction",
        topics: [
          fromWeek("t-dsa", week(DS_WEEKS, 1), "ppt"),
          fromWeek("t-dsa", week(DS_WEEKS, 2), "ppt", [practice("two-sum"), practice("merge-intervals")]),
        ],
      },
      {
        id: "dsa-linear",
        title: "Strings & Linked Lists",
        topics: [
          fromWeek("t-dsa", week(DS_WEEKS, 3), "ppt", [practice("group-anagrams")]),
          fromWeek("t-dsa", week(DS_WEEKS, 4), "ppt", [practice("lru-cache")]),
        ],
      },
      {
        id: "dsa-recursive",
        title: "Recursion, Stacks & Trees",
        topics: [
          fromWeek("t-dsa", week(DS_WEEKS, 5), "ppt"),
          fromWeek("t-dsa", week(DS_WEEKS, 6), "ppt", [practice("valid-parentheses"), practice("kth-largest")]),
          fromWeek("t-dsa", week(DS_WEEKS, 7), "ppt", [practice("word-ladder")]),
        ],
      },
    ],
  },
  {
    id: "t-dbms",
    scope: "tech",
    title: "DBMS & SQL",
    blurb: "Model a schema, constrain it, then query it — pair it with the SQL compiler.",
    accent: C.cyan,
    level: "Beginner",
    instructor: "Prof. Anand Krishnan",
    completedSeed: 1,
    sections: [
      { id: "db-modelling", title: "Modelling & DDL", topics: [fromWeek("t-dbms", week(DBMS_WEEKS, 1), "ppt"), fromWeek("t-dbms", week(DBMS_WEEKS, 2), "ppt")] },
      { id: "db-querying", title: "Querying", topics: [fromWeek("t-dbms", week(DBMS_WEEKS, 3), "ppt"), fromWeek("t-dbms", week(DBMS_WEEKS, 4), "ppt")] },
    ],
  },
  {
    id: "t-os",
    scope: "tech",
    title: "OS Core Concepts",
    blurb: "Processes, scheduling and synchronisation — the rapid-fire round, covered.",
    accent: C.goldDeep,
    level: "Intermediate",
    instructor: "Dr. Suchitra Menon",
    completedSeed: 0,
    sections: [
      { id: "os-processes", title: "Processes", topics: [fromWeek("t-os", week(OS_WEEKS, 1), "ppt"), fromWeek("t-os", week(OS_WEEKS, 2), "ppt")] },
      { id: "os-concurrency", title: "Concurrency", topics: [fromWeek("t-os", week(OS_WEEKS, 3), "ppt")] },
    ],
  },
  {
    id: "t-oop",
    scope: "tech",
    title: "OOP & Design Basics",
    blurb: "Classes, inheritance and the modelling questions asked in product rounds.",
    accent: C.violet,
    level: "Beginner",
    instructor: "Rahul Verma",
    completedSeed: 0,
    sections: OOP_SECTIONS,
  },
];
