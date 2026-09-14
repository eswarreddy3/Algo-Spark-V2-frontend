# AlgoSpark V2 — Requirements & Features Specification

_College-integrated placement-readiness platform_

> Source: `AlgoSpark_V2_Requirements.pdf`

## Contents

1. [Overview](#1-overview)
2. [Roles & Access](#2-roles--access)
3. [Student Features](#3-student-features)
4. [College Admin Features](#4-college-admin-features)
5. [Super Admin Features](#5-super-admin-features)
6. [Cross-cutting Logic](#6-cross-cutting-logic)
7. [Role–Permissions Matrix](#7-rolepermissions-matrix)
8. [Open Items](#8-open-items)

---

## 1. Overview

AlgoSpark V2 is a college-integrated placement-readiness platform — not a standalone coding arena. Content flows top-down through three roles: the **Super Admin** authors all courses, labs, and exams and onboards colleges; each **College Admin** manages their own students, labs, and reporting; and **Students** consume labs, tech and non-tech courses, and exams.

The distinguishing idea of V2 is that it takes an entire college cohort from enrolled to placement-ready through week-by-week gated progression, breadth across tech and non-tech skills, an AI prep coach that diagnoses each student and plans their path toward target companies, and role-based visibility for faculty and administrators.

### Confirmed design decisions

These decisions are baked into the requirements below:

- Three roles only: Super Admin, College Admin, Student. No separate faculty role — College Admin covers faculty functions.
- Leaderboard is per-college, fed by lab points + coding + exam scores, with branch and section filters within the college.
- A week unlocks only after PPT viewed + MCQs passed + all code solved.
- AI email/paragraph grading returns a score plus written feedback plus suggestions.
- Super Admin onboards students via both bulk CSV upload and manual entry; College Admin is view-only on students.
- College Admin may edit lab exercise content for their college but cannot author new labs.
- Promoting a college to the next semester loads fresh content while keeping student points/history.
- Tech module-wise coding and Labs code share one execution engine but use different problem sets; Labs code is graded and gates progression.
- Time complexity (Big-O) is shown as information only and does not affect scoring.
- All support tickets route to the Super Admin.
- Student coding problems are segregated by company, topic, and difficulty within each module.
- The AI Prep Coach curates/sequences existing content only — it never generates new material — and plans within the week-gating.
- College Admin gets read-only visibility of each student's AI readiness and plan.
- AI mock interviews, generated scenarios, and live coaching are out of scope for this release.
- Submitting feedback after an exam is mandatory; a consolidated feedback report is available to the Super Admin.

---

## 2. Roles & Access

The platform has three roles arranged as a content-and-management hierarchy. Every screen and permission in this document maps to exactly one of these roles.

### Super Admin

The platform owner. Authors all content, onboards colleges and students, maps content to cohorts, controls semester promotion, and owns support and platform-wide analytics.

**Acceptance criteria**

- Has unrestricted access to every college, cohort, and content item.
- Is the only role that can create courses, labs, and exams.
- Is the only role that can onboard students and college admins.

### College Admin

Manages a single college. Sees only their own students, reports, and leaderboard, and may adjust lab exercise content for their college. Also fulfils the faculty function — there is no separate teacher role.

**Acceptance criteria**

- Sees data scoped strictly to their own college.
- Can view but not create, edit, or delete students.
- Can edit lab exercise content for their college but cannot author new labs, courses, or exams.

### Student

The learner. Consumes labs, tech and non-tech courses, and exams; appears on their college leaderboard; and raises support tickets.

**Acceptance criteria**

- Sees only labs, courses, and exams mapped to their college, branch, year, and section.
- Cannot see other colleges or any admin tooling.
- Can edit only a limited subset of their own profile.

---

## 3. Student Features

### 3.1 Core

#### Dashboard

The landing view after login: a read-only snapshot of the student's progress that links into Labs, Tech, and Exams.

**Acceptance criteria**

- Shows current week/lab, overall completion %, upcoming exams, current rank, and recent activity.
- Every summary widget links to its detailed screen.
- Displays no data belonging to other students beyond leaderboard rank.
- _Open item:_ the exact set of dashboard widgets is to be finalised.

#### Leaderboard

Ranks the student against others in their own college. Points come from lab completion, coding, and exam scores combined. The college board can be narrowed to the student's branch or section.

**Acceptance criteria**

- Ranking is scoped to the student's college only.
- The college leaderboard has **Branch** and **Section** filters; filtering narrows the same college ranking and never shows other colleges.
- Score = lab points + coding points + exam scores (cumulative).
- Shows rank, name, total points, and streak.
- Updates whenever a scoring event (lab/code/exam) is recorded.

#### Support

Lets the student raise a query as a ticket. All tickets route to the Super Admin.

**Acceptance criteria**

- Student can create a ticket and view its status (open / resolved).
- Tickets are delivered to the Super Admin queue.
- Student can see their own ticket history.

#### Profile

Personal and institutional information. Institutional fields are set at onboarding and are read-only to the student.

**Acceptance criteria**

- Shows college, branch, year, section, and earned stats/badges.
- Student may edit only a limited subset (e.g. photo, password).
- Institutional fields (college/branch/year/section) are view-only.

### 3.2 Labs

#### Eligible subject labs

The student sees only the labs mapped to their college, branch, year, and section by the Super Admin.

**Acceptance criteria**

- No lab outside the student's mapping is visible or accessible.
- Lab availability follows the Super Admin's mapping exactly.

#### Week-wise structure & contents

Each subject lab is divided into weeks. A week is the unit of progress and contains three parts: **PPT** (theory/reading), **MCQs** (quiz), and **Code** (coding exercises).

**Acceptance criteria**

- Each week exposes PPT, MCQ, and Code sections.
- Code exercises track execution log time (attempt timestamp/duration) and window time (the allowed attempt window).
- Points are awarded per the Super Admin's configured point values for that lab.

#### Weekly unlock (progression gate)

The next week stays locked until the current week is fully completed.

**Acceptance criteria**

- A week counts as complete only when: all PPT viewed **AND** all MCQs passed **AND** all code exercises solved.
- The next week unlocks automatically the moment all three conditions are met.
- A partially finished week does not unlock the next.

### 3.3 Tech

#### Courses (carried from V1, modified)

Existing V1 tech courses are brought forward with modifications, in a module-based structure.

**Acceptance criteria**

- Course content is organised by module.
- V1 course material is migrated and editable by Super Admin.

#### Module-wise coding page (new)

A new coding surface where problems are organised module by module. Within each module, problems are segregated three ways — by company, by topic, and by difficulty — so a student can drill precisely. It shares the same execution engine as Labs code but uses a different problem set and is practice-oriented (not a progression gate).

**Acceptance criteria**

- Problems are grouped by module.
- Within each module, problems are filterable/segregated by company, topic, and difficulty.
- Uses the same code execution engine as Labs; the problem set is separate.
- Unlike Labs code, it does not gate weekly progression.

#### SQL compiler

An in-browser environment to write and run SQL.

**Acceptance criteria**

- Student can write and execute SQL queries and see results.
- Available within the tech coding experience.

#### Time complexity (Big-O)

Displays the time complexity of a solution as informational context only.

**Acceptance criteria**

- Big-O is shown to the student as information.
- It does **NOT** affect the score or gate progression.

#### Question tags & filtering

Problems carry topic tags, company tags, and a difficulty level for browsing and filtering.

**Acceptance criteria**

- Each problem carries topic tags, company tags, and difficulty (Easy/Medium/Hard).
- Students can filter/browse the problem set by these tags.

#### Free Compile

An open scratchpad compiler for writing and running code with no specific problem attached.

**Acceptance criteria**

- Student can write and run arbitrary code with no problem context.
- _Open item:_ the exact set of supported languages is to be confirmed.

### 3.4 Non-Tech

#### Email writing (AI)

A prompt-based email task graded by AI.

**Acceptance criteria**

- Student submits an email against a given prompt.
- AI returns a score plus written feedback plus improvement suggestions.

#### Paragraph reading (AI)

A reading/comprehension task graded by AI.

**Acceptance criteria**

- Student completes a reading/comprehension task.
- AI returns a score plus written feedback plus improvement suggestions.

#### Courses (PPT + MCQ)

Non-tech / aptitude / soft-skill courses delivered as PPT plus MCQ.

**Acceptance criteria**

- Each course is delivered as PPT content followed by MCQs.
- Authored by the Super Admin.

### 3.5 Exam

#### Exams (four section types)

Exams are assembled from four section types — section-wise MCQs, coding problems, email writing, and paragraph reading — assigned by admin, timed, and scored.

**Acceptance criteria**

- An exam may include any combination of: MCQ sections, coding problems, email writing, paragraph reading.
- Exams are timed and scored.
- Exam scores contribute to the per-college leaderboard.
- Email/paragraph sections within an exam are AI-graded (score + feedback + suggestions).
- On completing an exam, the student **MUST** submit feedback before results/return — feedback is mandatory.
- Submitted feedback is stored and rolls up into a Super Admin feedback report.

### 3.6 AI Prep Coach

A planning-and-guidance layer that sits on top of everything the student already has. It never generates new material — it diagnoses the student, then sequences and recommends existing admin-authored content toward the student's placement goal. It runs periodically (on demand and as the student progresses), not as a continuous live service.

#### Readiness diagnostic

Reads the student's existing performance signals and turns them into a readiness picture.

**Acceptance criteria**

- Inputs: lab completion, coding activity by tag/difficulty, exam scores, AI email/paragraph scores.
- Outputs an overall readiness score plus a gap map (strengths and weak areas).
- Recomputes as new performance data arrives.
- _Open item:_ exact readiness-score formula to be defined.

#### AI prep plan

From the student's goal (target companies + timeline), the AI builds and maintains a week-by-week plan that sequences existing labs, courses, and coding problems toward that goal.

**Acceptance criteria**

- Student sets target companies and a timeline; the plan is generated from these.
- The plan only sequences and recommends existing content — it never creates new content.
- The plan operates **WITHIN** the week-gating: it guides order and layers extra practice around gated labs, and never unlocks locked material ahead of schedule.
- Surfaces on the dashboard as "today's focus" and "this week" rather than a full task wall.
- Re-plans automatically as the student progresses or falls behind.
- _Open item:_ whether to cap plan re-generations per student.

#### Targeted drills

Directs the student to existing problem sets matched to their weak areas and target companies.

**Acceptance criteria**

- Uses the student's weak topic tags and their target companies' tags to select existing problems.
- Curated from the existing problem bank — no generated problems.
- Reuses the coding page's company/topic/difficulty segregation.

> **Out of scope for this release**
>
> - AI mock interviews (technical or HR).
> - AI-generated real-time scenarios.
> - Live/continuous AI coaching.
> - These can be revisited once an admin-authored interview/scenario bank exists.

---

## 4. College Admin Features

### Dashboard

An overview scoped to the admin's own college: student count, cohort progress, exam performance, and active labs.

**Acceptance criteria**

- Shows metrics for the admin's college only.
- No data from other colleges is visible.

### Students list

A view of the college's students. View-only — student creation and editing stay with the Super Admin.

**Acceptance criteria**

- Admin can view their college's students and details.
- Admin cannot add, edit, deactivate, or remove students.

### Report & analysis of students

Per-student and cohort analytics for the college.

**Acceptance criteria**

- Provides lab completion, exam scores, coding activity, and weak-area analysis.
- Available at both individual-student and cohort level, scoped to the college.

### Leaderboard

The college's own leaderboard.

**Acceptance criteria**

- Shows ranking for the admin's college only.

### Lab subject exercise modifications

The admin may edit lab exercise content for their college, within the labs the Super Admin has mapped.

**Acceptance criteria**

- Admin can edit exercise content of mapped labs for their college.
- Admin cannot author new labs from scratch.
- _Open item:_ precise boundary of editable fields to be confirmed.

### Student AI readiness & plan (read-only)

The admin can see each student's AI readiness score and prep plan for oversight, scoped to their own college.

**Acceptance criteria**

- Admin can view any of their college's students' readiness score, gap map, and prep plan.
- Read-only: the admin cannot edit or override a student's plan.
- Scoped strictly to the admin's own college.

---

## 5. Super Admin Features

### Dashboard

A platform-wide overview across all colleges, students, content, and activity.

**Acceptance criteria**

- Shows aggregate metrics across every college and cohort.

### College Admin onboarding & list (with course allocation)

Create and list college admin accounts, and allocate which courses/labs each college receives.

**Acceptance criteria**

- Super Admin can create and list college admin accounts.
- Super Admin allocates courses/labs per college.

### Student onboarding & list

Create students and assign them to college, branch, year, and section — via bulk upload or manually.

**Acceptance criteria**

- Supports both bulk CSV upload and manual one-by-one entry.
- Each student is assigned college, branch, year, and section.
- _Open item:_ exact CSV field format to be defined.

### Tech course creation

Author tech courses in the structure **Module → PPT → Coding → MCQ**.

**Acceptance criteria**

- Super Admin can create modules, each containing PPT, coding, and MCQ content.
- Point values are configurable per item.

### Non-Tech course creation

Author non-tech courses in the structure **Module → PPT → MCQ**.

**Acceptance criteria**

- Super Admin can create modules, each containing PPT and MCQ content.

### Email writing / Paragraph reading authoring

Create the AI-graded non-tech tasks and configure their grading.

**Acceptance criteria**

- Super Admin can create email-writing and paragraph-reading tasks.
- Super Admin configures AI grading (score + feedback + suggestions).

### Exam creation

Build exams from a question bank, defining sections, timing, and assignment.

**Acceptance criteria**

- Super Admin can assemble exams from MCQ / Coding / Email / Paragraph sections.
- Timing and cohort assignment are configurable.
- Exam scores flow to the per-college leaderboard.

### Lab subject creation

Author labs week-by-week in the structure **Theory → Code Exercise → MCQ**, with point values.

**Acceptance criteria**

- Each lab is authored as a sequence of weeks.
- Each week contains Theory, Code Exercise, and MCQ, each with configurable point values.

### Lab subject mapping

Assign labs to a specific college + branch + year + section.

**Acceptance criteria**

- Mapping targets a precise college/branch/year/section combination.
- A student sees only labs mapped to their exact cohort.

### Promote college to next semester

Advance a college's cohort to the next semester, loading the new content set while retaining history.

**Acceptance criteria**

- Loads the fresh content set for the new semester.
- Student points and history are retained (leaderboard is cumulative).
- _Open item:_ define which content, if any, remains accessible from the prior semester.

### Reports & analysis

Platform-wide analytics across all colleges.

**Acceptance criteria**

- Aggregate and drill-down analytics spanning every college and cohort.

### Exam feedback report

A consolidated report of the mandatory feedback students submit after each exam.

**Acceptance criteria**

- Aggregates the feedback captured at exam completion across students, exams, and colleges.
- Viewable only by the Super Admin.
- Supports filtering by exam and by college.
- _Open item:_ exact feedback fields/format (rating scale, free text, or both) to be defined.

### Support

Manage and resolve tickets from all roles.

**Acceptance criteria**

- All student (and college admin) tickets arrive in the Super Admin queue.
- Super Admin can respond to and resolve tickets.

---

## 6. Cross-cutting Logic

These rules are not owned by a single screen but govern behaviour across the platform. They are called out separately so implementation is unambiguous.

### Scoring & points model

A single cumulative points model drives the leaderboard.

**Acceptance criteria**

- Points accrue from lab completion, coding activity, and exam scores.
- The leaderboard total is the cumulative sum of these, scoped per college.
- Point values per lab/course/exam item are set by the Super Admin at authoring time.

### Progression & unlock

Weekly gating is the core progression mechanic.

**Acceptance criteria**

- A week unlocks only when PPT + MCQ + all code are complete for the prior week.
- Semester promotion (Super Admin) resets the available content set forward while preserving points/history.

### AI grading behaviour

Email-writing and paragraph-reading tasks, wherever they appear (non-tech practice or exams), are graded by AI in a consistent way.

**Acceptance criteria**

- AI returns a numeric score, written feedback, and improvement suggestions.
- Grading configuration is owned by the Super Admin.

### Role & data scoping

Visibility is strictly bounded by role and, for College Admin and Student, by college/cohort.

**Acceptance criteria**

- Student data is scoped to their own cohort mapping.
- College Admin data is scoped to their own college.
- Super Admin has platform-wide scope.

---

## 7. Role–Permissions Matrix

A quick reference of who can do what. "Yes" = allowed; "—" = not available to that role; scoped notes indicate the boundary.

| Capability | Student | College Admin | Super Admin |
|---|:---:|:---:|:---:|
| View own labs / courses / exams | Yes | — | — |
| Attempt code / MCQ / exams | Yes | — | — |
| Appear on leaderboard | Yes | — | — |
| Use AI prep coach (own plan) | Yes | — | — |
| Submit mandatory post-exam feedback | Yes | — | — |
| View students' AI readiness & plan | — | Own college (RO) | Yes |
| View exam feedback report | — | — | Yes |
| Raise support ticket | Yes | Yes | — |
| View own college students | — | View only | Yes |
| View own college reports | — | Yes | Yes |
| Edit lab exercise content | — | Own college | Yes |
| Author new labs / courses / exams | — | — | Yes |
| Onboard students (CSV + manual) | — | — | Yes |
| Onboard college admins | — | — | Yes |
| Map labs to college/branch/year/section | — | — | Yes |
| Promote college to next semester | — | — | Yes |
| Configure AI grading | — | — | Yes |
| Resolve support tickets | — | — | Yes |
| Platform-wide analytics | — | — | Yes |

---

## 8. Open Items

Minor points still to confirm. None block the specification; each has a sensible default that can be assumed if unanswered.

- **Free Compile:** exact set of supported programming languages.
- **Student Dashboard:** final set of widgets to display.
- **Student onboarding:** exact CSV field format / template.
- **College Admin lab edits:** precise boundary of editable fields.
- **Semester promotion:** which prior-semester content (if any) stays accessible.
- **AI Prep Coach:** exact readiness-score formula.
- **AI Prep Coach:** whether to cap plan re-generations per student.
- **Post-exam feedback:** exact fields/format (rating scale, free text, or both).
