"use client";

import React, { useMemo, useState } from "react";
import { Download, Flame, Trophy } from "lucide-react";
import { C, FD, FM, blueGrad } from "../theme";
import { Avatar, Button, Card, CardHeader, EmptyState, H2, Kicker, Pill, SegmentedControl, Select, Serif, num } from "../ui";
import { BRANCHES, SECTION_LIST, STUDENTS, completionOf } from "../data/cohort";
import { downloadCsv, toCsv } from "../data/reports";
import { useAdminNav } from "../nav";
import { useAdminState } from "../state";

type Scope = "college" | "branch" | "section";

export function LeaderboardPage() {
  const nav = useAdminNav();
  const { notify } = useAdminState();
  const [scope, setScope] = useState<Scope>("college");
  const [branch, setBranch] = useState<string>("CSE");
  const [section, setSection] = useState<string>(SECTION_LIST[0]);

  const { rows, label } = useMemo(() => {
    if (scope === "branch") {
      return { rows: STUDENTS.filter((s) => s.branch === branch), label: `${branch} · all sections` };
    }
    if (scope === "section") {
      return { rows: STUDENTS.filter((s) => s.section === section), label: section };
    }
    return { rows: STUDENTS, label: "All branches" };
  }, [scope, branch, section]);

  const ranked = useMemo(() => rows.slice().sort((a, b) => b.points - a.points), [rows]);
  const podium = ranked.slice(0, 3);
  const top = ranked.slice(0, 25);

  function exportBoard() {
    const csv = toCsv(
      ["Rank", "Roll", "Name", "Section", "Points", "Problems solved", "Completion %", "Exam avg %", "Streak"],
      ranked.map((s, i) => [i + 1, s.roll, s.name, s.section, s.points, s.solved, completionOf(s), s.examAvg, s.streak]),
    );
    downloadCsv(`algospark-leaderboard-${scope}.csv`, csv);
    notify({ title: "Leaderboard exported", sub: `${ranked.length} rows written to CSV.`, tone: "good" });
  }

  return (
    <div>
      <Kicker>Leaderboard</Kicker>
      <H2>
        Rank the batch, <Serif>any way you slice it.</Serif>
      </H2>
      <p style={{ color: C.inkSoft, marginTop: 8, fontSize: 15.5, maxWidth: 640 }}>
        Points come from labs, practice, non-tech tasks and exams. Rankings refresh every night; this view is the same one students see, one level up.
      </p>

      <div style={{ display: "flex", gap: 12, marginTop: 18, flexWrap: "wrap", alignItems: "center" }}>
        <SegmentedControl<Scope>
          value={scope}
          onChange={setScope}
          options={[
            { value: "college", label: "College" },
            { value: "branch", label: "Branch" },
            { value: "section", label: "Section" },
          ]}
        />
        {scope === "branch" && (
          <Select label="Branch" value={branch} onChange={setBranch} options={BRANCHES.map((b) => ({ value: b, label: b }))} />
        )}
        {scope === "section" && (
          <Select label="Section" value={section} onChange={setSection} options={SECTION_LIST.map((s) => ({ value: s, label: s }))} />
        )}
        <Pill>{label} · {ranked.length} students</Pill>
        <span style={{ marginLeft: "auto" }}>
          <Button variant="ghost" icon={Download} onClick={exportBoard}>
            Export
          </Button>
        </span>
      </div>

      {podium.length === 3 && (
        <div style={{ display: "flex", gap: 14, marginTop: 22, alignItems: "flex-end", justifyContent: "center", flexWrap: "wrap" }}>
          {[podium[1], podium[0], podium[2]].map((s, i) => {
            const height = i === 1 ? 132 : 100;
            const medal = i === 1 ? C.gold : i === 0 ? "#C0C7D8" : "#E1A06B";
            const rank = i === 1 ? 1 : i === 0 ? 2 : 3;
            return (
              <button
                key={s.id}
                onClick={() => nav.openStudent(s.id)}
                style={{ all: "unset", cursor: "pointer", textAlign: "center", width: 140 }}
              >
                <span style={{ width: 54, height: 54, borderRadius: 999, background: blueGrad, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px", fontFamily: FD, fontWeight: 700 }}>
                  {s.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                </span>
                <span style={{ display: "block", fontFamily: FD, fontWeight: 600, fontSize: 14 }}>{s.name.split(" ")[0]}</span>
                <span style={{ display: "block", fontFamily: FM, fontSize: 12, color: C.inkMute }}>{num(s.points)}</span>
                <span style={{ display: "flex", height, borderRadius: "12px 12px 0 0", background: `linear-gradient(180deg,${medal},${medal}88)`, marginTop: 8, alignItems: "flex-start", justifyContent: "center", paddingTop: 10, fontFamily: FD, fontWeight: 700, color: "#fff", fontSize: 22 }}>
                  {rank}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <Card style={{ padding: 0, marginTop: 20, overflow: "hidden" }}>
        <CardHeader title="Top 25" subtitle="Click a row to open the student's full breakdown." />
        {top.length === 0 ? (
          <EmptyState title="Nobody in this group yet" body="Pick another branch or section." />
        ) : (
          <div className="ad-scroll-x">
            <table className="ad-table">
              <thead>
                <tr>
                  <th style={{ width: 54 }}>#</th>
                  <th>Student</th>
                  <th className="ad-hide-sm">Section</th>
                  <th className="ad-hide-md" style={{ textAlign: "right" }}>Solved</th>
                  <th className="ad-hide-md" style={{ textAlign: "right" }}>Completion</th>
                  <th className="ad-hide-sm" style={{ textAlign: "right" }}>Streak</th>
                  <th style={{ textAlign: "right" }}>Points</th>
                </tr>
              </thead>
              <tbody>
                {top.map((s, i) => (
                  <tr key={s.id} data-clickable="true" onClick={() => nav.openStudent(s.id)}>
                    <td>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: FD, fontWeight: 700, color: i < 3 ? C.goldDeep : C.inkMute }}>
                        {i < 3 && <Trophy size={13} />}
                        {i + 1}
                      </span>
                    </td>
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
                    <td className="ad-hide-md ad-num">{s.solved}</td>
                    <td className="ad-hide-md ad-num">{completionOf(s)}%</td>
                    <td className="ad-hide-sm ad-num">
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, justifyContent: "flex-end" }}>
                        <Flame size={12} color={s.streak >= 10 ? C.goldDeep : C.inkMute} />
                        {s.streak}
                      </span>
                    </td>
                    <td className="ad-num" style={{ fontFamily: FD, fontWeight: 700, fontSize: 15 }}>{num(s.points)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
