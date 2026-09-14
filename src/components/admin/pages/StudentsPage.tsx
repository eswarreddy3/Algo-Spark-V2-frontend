"use client";

import React, { useMemo, useState } from "react";
import { Download, Mail, Search, SlidersHorizontal } from "lucide-react";
import { C, FD, FM, RISK, blueGrad } from "../theme";
import {
  Avatar, Button, Card, CardHeader, Donut, Drawer, EmptyState, H2, Kicker, num, Pill, ProgressBar, RiskPill, Select, Serif,
} from "../ui";
import { BRANCHES, LAB_IDS, SECTION_LIST, STUDENTS, completionOf, getStudent, type Student } from "../data/cohort";
import { ADMIN_LABS } from "../data/labs";
import { downloadCsv, toCsv } from "../data/reports";
import { useAdminNav } from "../nav";
import { useAdminState } from "../state";

type SortKey = "points" | "completion" | "examAvg" | "lastActiveDays" | "name";

const PAGE_SIZE = 20;

const labName = (id: string) => ADMIN_LABS.find((l) => l.id === id)?.name.replace(" Lab", "") ?? id;

export function StudentsPage() {
  const nav = useAdminNav();
  const { nudged, nudge, notify } = useAdminState();
  const [query, setQuery] = useState("");
  const [branch, setBranch] = useState("All");
  const [section, setSection] = useState("All");
  const [risk, setRisk] = useState("All");
  const [sort, setSort] = useState<SortKey>("points");
  const [shown, setShown] = useState(PAGE_SIZE);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = STUDENTS.filter(
      (s) =>
        (branch === "All" || s.branch === branch) &&
        (section === "All" || s.section === section) &&
        (risk === "All" || s.risk === risk) &&
        (!q || s.name.toLowerCase().includes(q) || s.roll.toLowerCase().includes(q)),
    );
    const sorted = filtered.slice().sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "completion") return completionOf(b) - completionOf(a);
      if (sort === "lastActiveDays") return b.lastActiveDays - a.lastActiveDays;
      return b[sort] - a[sort];
    });
    return sorted;
  }, [query, branch, section, risk, sort]);

  const visible = rows.slice(0, shown);
  const student = nav.studentId ? getStudent(nav.studentId) : undefined;

  function exportRoster() {
    const columns = ["Roll", "Name", "Section", "Year", "Completion %", "Exam avg %", "Points", "Last active (days)", "Risk"];
    const csv = toCsv(
      columns,
      rows.map((s) => [s.roll, s.name, s.section, s.year, completionOf(s), s.examAvg, s.points, s.lastActiveDays, RISK[s.risk].label]),
    );
    downloadCsv(`algospark-roster-${branch.toLowerCase()}.csv`, csv);
    notify({ title: "Roster exported", sub: `${rows.length} rows written to CSV.`, tone: "good" });
  }

  return (
    <div>
      <Kicker>Students</Kicker>
      <H2>
        Every student, <Serif>not just the toppers.</Serif>
      </H2>
      <p style={{ color: C.inkSoft, marginTop: 8, fontSize: 15.5, maxWidth: 640 }}>
        Filter the roster, open anyone for a full breakdown, and send a nudge to the students who have gone quiet.
      </p>

      <Card className="ad-filter-bar" style={{ padding: 14, marginTop: 18, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <label style={{ display: "flex", alignItems: "center", gap: 9, background: C.white, border: `1px solid ${C.line}`, borderRadius: 11, padding: "9px 12px", minWidth: 240, flex: 1 }}>
          <Search size={16} color={C.inkMute} />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setShown(PAGE_SIZE); }}
            placeholder="Name or roll number"
            aria-label="Search the roster"
            style={{ flex: 1, border: "none", outline: "none", fontSize: 14, color: C.ink, minWidth: 0, background: "transparent" }}
          />
        </label>
        <SlidersHorizontal size={16} color={C.inkMute} />
        <Select label="Branch" value={branch} onChange={(v) => { setBranch(v); setSection("All"); setShown(PAGE_SIZE); }} options={[{ value: "All", label: "All branches" }, ...BRANCHES.map((b) => ({ value: b, label: b }))]} />
        <Select label="Section" value={section} onChange={(v) => { setSection(v); setShown(PAGE_SIZE); }} options={[{ value: "All", label: "All sections" }, ...SECTION_LIST.filter((s) => branch === "All" || s.startsWith(branch)).map((s) => ({ value: s, label: s }))]} />
        <Select label="Risk" value={risk} onChange={(v) => { setRisk(v); setShown(PAGE_SIZE); }} options={[{ value: "All", label: "Any status" }, ...Object.entries(RISK).map(([k, v]) => ({ value: k, label: v.label }))]} />
        <Select label="Sort" value={sort} onChange={(v) => setSort(v as SortKey)} options={[
          { value: "points", label: "Sort: points" },
          { value: "completion", label: "Sort: completion" },
          { value: "examAvg", label: "Sort: exam average" },
          { value: "lastActiveDays", label: "Sort: most inactive" },
          { value: "name", label: "Sort: name" },
        ]} />
        <Button variant="ghost" icon={Download} onClick={exportRoster}>
          Export
        </Button>
      </Card>

      <Card style={{ padding: 0, marginTop: 16, overflow: "hidden" }}>
        <CardHeader
          title={`${rows.length} ${rows.length === 1 ? "student" : "students"}`}
          subtitle={`${rows.filter((s) => s.risk === "critical" || s.risk === "atRisk").length} need attention · ${rows.filter((s) => s.placementReady).length} placement ready`}
        />
        {rows.length === 0 ? (
          <EmptyState title="No students match those filters" body="Widen the branch or risk filter, or clear the search box." />
        ) : (
          <>
            <div className="ad-scroll-x">
              <table className="ad-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th className="ad-hide-sm">Section</th>
                    <th style={{ width: 170 }}>Lab completion</th>
                    <th className="ad-hide-md" style={{ textAlign: "right" }}>Exam avg</th>
                    <th className="ad-hide-md" style={{ textAlign: "right" }}>Points</th>
                    <th className="ad-hide-sm" style={{ textAlign: "right" }}>Last active</th>
                    <th style={{ textAlign: "right" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((s) => {
                    const pct = completionOf(s);
                    return (
                      <tr key={s.id} data-clickable="true" onClick={() => nav.openStudent(s.id)}>
                        <td>
                          <span style={{ display: "flex", alignItems: "center", gap: 11 }}>
                            <Avatar name={s.name} size={34} />
                            <span style={{ minWidth: 0 }}>
                              <span style={{ display: "block", fontWeight: 600, fontSize: 14.5 }}>{s.name}</span>
                              <span style={{ display: "block", fontFamily: FM, fontSize: 12, color: C.inkMute }}>{s.roll}</span>
                            </span>
                          </span>
                        </td>
                        <td className="ad-hide-sm" style={{ color: C.inkSoft }}>{s.section}</td>
                        <td>
                          <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ flex: 1, minWidth: 70 }}>
                              <ProgressBar value={pct} color={pct >= 70 ? C.green : pct >= 45 ? C.goldDeep : C.red} height={6} />
                            </span>
                            <span className="ad-num" style={{ width: 34 }}>{pct}%</span>
                          </span>
                        </td>
                        <td className="ad-hide-md ad-num">{s.examAvg}%</td>
                        <td className="ad-hide-md ad-num">{num(s.points)}</td>
                        <td className="ad-hide-sm ad-num" style={{ color: s.lastActiveDays > 6 ? C.red : C.inkSoft }}>
                          {s.lastActiveDays === 0 ? "Today" : `${s.lastActiveDays}d`}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <RiskPill risk={s.risk} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {shown < rows.length && (
              <div style={{ padding: 14, borderTop: `1px solid ${C.line}`, display: "flex", justifyContent: "center" }}>
                <Button variant="ghost" onClick={() => setShown((n) => n + PAGE_SIZE)}>
                  Show {Math.min(PAGE_SIZE, rows.length - shown)} more
                </Button>
              </div>
            )}
          </>
        )}
      </Card>

      {student && (
        <StudentDrawer
          student={student}
          nudged={nudged.includes(student.id)}
          onNudge={() => {
            nudge([student.id]);
            notify({ title: `Nudge sent to ${student.name.split(" ")[0]}`, sub: "Reminder queued for email and the student app.", tone: "good" });
          }}
          onExport={() => {
            const columns = ["Field", "Value"];
            const csv = toCsv(columns, [
              ["Roll", student.roll], ["Name", student.name], ["Section", student.section], ["Year", student.year],
              ...LAB_IDS.map((id) => [`${labName(id)} %`, student.labs[id]] as (string | number)[]),
              ["Exam average %", student.examAvg], ["Attendance %", student.attendance],
              ["Points", student.points], ["Problems solved", student.solved],
              ["Days inactive", student.lastActiveDays], ["Status", RISK[student.risk].label],
            ]);
            downloadCsv(`algospark-${student.roll.toLowerCase()}.csv`, csv);
            notify({ title: "Student report exported", sub: `${student.roll} written to CSV.`, tone: "good" });
          }}
          onClose={nav.closeStudent}
        />
      )}
    </div>
  );
}

function StudentDrawer({
  student,
  nudged,
  onNudge,
  onExport,
  onClose,
}: {
  student: Student;
  nudged: boolean;
  onNudge: () => void;
  onExport: () => void;
  onClose: () => void;
}) {
  const pct = completionOf(student);

  return (
    <Drawer
      title={student.name}
      subtitle={`${student.roll} · ${student.section} · Year ${student.year}`}
      onClose={onClose}
      footer={
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Button icon={Mail} onClick={onNudge} disabled={nudged}>
            {nudged ? "Nudge sent" : "Send a nudge"}
          </Button>
          <Button variant="ghost" icon={Download} onClick={onExport}>
            Export report
          </Button>
          <Button variant="quiet" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <span style={{ width: 58, height: 58, borderRadius: 999, background: blueGrad, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FD, fontWeight: 700, fontSize: 20 }}>
          {student.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
        </span>
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <RiskPill risk={student.risk} />
            {student.placementReady && <Pill color={C.green} bg={C.greenBg}>Placement ready</Pill>}
            <Pill>{student.email}</Pill>
          </div>
          <div style={{ color: C.inkMute, fontSize: 13, marginTop: 8 }}>
            {student.lastActiveDays === 0 ? "Active today" : `Last active ${student.lastActiveDays} days ago`}
            {student.streak > 0 && ` · ${student.streak} day streak`}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 18, marginTop: 20, flexWrap: "wrap", alignItems: "center" }}>
        <Donut value={pct} color={pct >= 70 ? C.green : pct >= 45 ? C.goldDeep : C.red} caption="of published lab work completed" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 14, flex: 1, minWidth: 200 }}>
          <Metric label="Points" value={num(student.points)} />
          <Metric label="Solved" value={String(student.solved)} />
          <Metric label="Exam avg" value={`${student.examAvg}%`} />
          <Metric label="Attendance" value={`${student.attendance}%`} />
        </div>
      </div>

      <div style={{ fontFamily: FD, fontWeight: 600, fontSize: 15, marginTop: 24 }}>Lab by lab</div>
      <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 14 }}>
        {ADMIN_LABS.map((lab) => (
          <div key={lab.id}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, marginBottom: 7 }}>
              <span style={{ color: C.inkSoft }}>
                {lab.name.replace(" Lab", "")} <span style={{ color: C.inkMute, fontFamily: FM, fontSize: 12 }}>{lab.code}</span>
              </span>
              <span style={{ fontFamily: FM, fontSize: 13 }}>{student.labs[lab.id]}%</span>
            </div>
            <ProgressBar value={student.labs[lab.id]} color={lab.accent} height={7} />
          </div>
        ))}
      </div>

      <div style={{ fontFamily: FD, fontWeight: 600, fontSize: 15, marginTop: 24 }}>Recent activity</div>
      <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 2 }}>
        {activityFor(student).map((a) => (
          <div key={a.when} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: `1px solid ${C.line}` }}>
            <span style={{ fontFamily: FM, fontSize: 12, color: C.inkMute, width: 92, flex: "none" }}>{a.when}</span>
            <span style={{ fontSize: 13.5, color: C.inkSoft }}>{a.what}</span>
          </div>
        ))}
      </div>
    </Drawer>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontFamily: FD, fontWeight: 700, fontSize: 20 }}>{value}</div>
      <div style={{ color: C.inkMute, fontSize: 12.5 }}>{label}</div>
    </div>
  );
}

/** A plausible trail for the drawer, derived from the student's own numbers. */
function activityFor(student: Student): { when: string; what: string }[] {
  const trail = [
    { when: student.lastActiveDays === 0 ? "Today" : `${student.lastActiveDays}d ago`, what: `Submitted a Data Structures exercise · ${student.examAvg >= 60 ? "all tests passed" : "3 of 8 tests passed"}` },
    { when: `${student.lastActiveDays + 2}d ago`, what: `Scored ${Math.min(10, Math.round(student.examAvg / 10))}/10 on a weekly quiz` },
    { when: `${student.lastActiveDays + 5}d ago`, what: "Completed the reading module of a non-tech course" },
    { when: `${student.lastActiveDays + 9}d ago`, what: `Attempted Placement Mock #3 · scored ${Math.max(20, student.examAvg - 5)}%` },
  ];
  return trail;
}
