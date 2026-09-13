"use client";

import React, { useMemo } from "react";
import { CalendarPlus, ClipboardList, Download, Users } from "lucide-react";
import { C, FD, FM, tint } from "../theme";
import {
  BarList, Button, Card, CardHeader, ColumnChart, H2, Kicker, Pill, ProgressBar, Serif, StatusPill,
} from "../ui";
import { EXAMS, attemptsFor, branchResultsFor, distributionFor, getExam } from "../data/exams";
import { completionOf } from "../data/cohort";
import { downloadCsv, toCsv } from "../data/reports";
import { useAdminNav } from "../nav";
import { useAdminState } from "../state";

export function ExamsPage() {
  const nav = useAdminNav();
  const { notify } = useAdminState();
  const exam = (nav.examId ? getExam(nav.examId) : undefined) ?? EXAMS[0];
  const attempts = useMemo(() => attemptsFor(exam), [exam]);
  const distribution = useMemo(() => distributionFor(attempts), [attempts]);
  const branchRows = useMemo(() => branchResultsFor(exam, attempts), [exam, attempts]);
  const hasResults = attempts.length > 0;

  const cutoffIndex = Math.round(exam.cutoff / 10);
  const clearedCount = attempts.filter((a) => a.score >= exam.cutoff).length;
  const topPerformers = attempts.slice(0, 6);

  function exportResults() {
    const csv = toCsv(
      ["Roll", "Name", "Section", "Score %", "Cleared cutoff"],
      attempts.map((a) => [a.student.roll, a.student.name, a.student.section, a.score, a.score >= exam.cutoff ? "Yes" : "No"]),
    );
    downloadCsv(`${exam.id}-results.csv`, csv);
    notify({ title: "Results exported", sub: `${attempts.length} attempts written to CSV.`, tone: "good" });
  }

  return (
    <div>
      <Kicker>Exams</Kicker>
      <H2>
        Placement mocks, <Serif>marked instantly.</Serif>
      </H2>
      <p style={{ color: C.inkSoft, marginTop: 8, fontSize: 15.5, maxWidth: 660 }}>
        Schedule a paper for a branch or a year, watch attempts arrive live, and read the score spread against your cutoff.
      </p>

      <div className="ad-split-main" style={{ marginTop: 18 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card style={{ padding: 0, overflow: "hidden" }}>
            <CardHeader
              title={exam.title}
              subtitle={`${exam.window} · ${exam.duration} · ${exam.audience}`}
              action={<StatusPill status={exam.status} />}
            />

            <div className="ad-grid-4" style={{ padding: 18, gap: 12 }}>
              <MiniStat label="Registered" value={String(exam.registered)} />
              <MiniStat label="Attempted" value={hasResults ? String(attempts.length) : "—"} />
              <MiniStat label="Average" value={hasResults ? `${Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length)}%` : "—"} />
              <MiniStat label="Cleared cutoff" value={hasResults ? `${Math.round((clearedCount / attempts.length) * 100)}%` : "—"} />
            </div>

            {hasResults ? (
              <div style={{ padding: "0 18px 18px" }}>
                <div style={{ fontFamily: FD, fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Score distribution</div>
                <div style={{ color: C.inkMute, fontSize: 13, marginBottom: 14 }}>
                  Each column is a ten-point band. The line marks the {exam.cutoff}% cutoff.
                </div>
                <ColumnChart
                  data={distribution.map((b) => ({
                    label: `${b.bucket}`,
                    value: b.count,
                    caption: `${b.bucket}–${Number(b.bucket) + 9}%: ${b.count} students`,
                  }))}
                  valueLabel={(v) => String(v)}
                  marker={{ atIndex: cutoffIndex, label: `Cutoff ${exam.cutoff}% · ${clearedCount} of ${attempts.length} cleared it` }}
                />
              </div>
            ) : (
              <div style={{ padding: "0 18px 22px", color: C.inkMute, fontSize: 14 }}>
                No attempts yet. Results appear here the moment the window opens.
              </div>
            )}
          </Card>

          <Card style={{ padding: 0, overflow: "hidden" }}>
            <CardHeader title="Sections" subtitle="Section-wise averages tell you which round to drill next." />
            <div className="ad-scroll-x">
              <table className="ad-table" style={{ minWidth: 520 }}>
                <thead>
                  <tr>
                    <th>Section</th>
                    <th style={{ textAlign: "right" }}>Questions</th>
                    <th style={{ textAlign: "right" }}>Minutes</th>
                    <th style={{ width: 200 }}>Average</th>
                  </tr>
                </thead>
                <tbody>
                  {exam.sections.map((s) => (
                    <tr key={s.name}>
                      <td style={{ fontWeight: 600 }}>{s.name}</td>
                      <td className="ad-num">{s.questions}</td>
                      <td className="ad-num">{s.minutes}</td>
                      <td>
                        {hasResults ? (
                          <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ flex: 1 }}>
                              <ProgressBar value={s.avgPercent} color={s.avgPercent >= 65 ? C.green : s.avgPercent >= 50 ? C.goldDeep : C.red} height={6} />
                            </span>
                            <span className="ad-num" style={{ width: 38 }}>{s.avgPercent}%</span>
                          </span>
                        ) : (
                          <span style={{ color: C.inkMute, fontSize: 13 }}>Not started</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {hasResults && (
            <Card style={{ padding: 0 }}>
              <CardHeader title="Pass rate by branch" subtitle={`Share of students clearing ${exam.cutoff}%.`} />
              <div style={{ padding: 18 }}>
                <BarList
                  rows={branchRows.map((b) => ({ label: b.branch, value: b.passRate, caption: `avg ${b.avg}%` }))}
                  color={C.cyan}
                />
              </div>
            </Card>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card style={{ padding: 0, overflow: "hidden" }}>
            <CardHeader
              title="All papers"
              action={
                <Button
                  size="sm"
                  icon={CalendarPlus}
                  onClick={() => notify({ title: "Scheduling opens the paper builder", sub: "Pick sections, window and audience — not wired up in this prototype.", tone: "info" })}
                >
                  New
                </Button>
              }
            />
            <div>
              {EXAMS.map((e, i) => {
                const active = e.id === exam.id;
                return (
                  <button
                    key={e.id}
                    onClick={() => nav.openExam(e.id)}
                    className="ad-row"
                    aria-pressed={active}
                    style={{
                      width: "100%", textAlign: "left", border: "none", borderTop: i ? `1px solid ${C.line}` : "none",
                      background: active ? tint(C.royal, 9) : C.white, cursor: "pointer", padding: "13px 16px",
                      display: "flex", gap: 12, alignItems: "center",
                    }}
                  >
                    <span style={{ width: 34, height: 34, flex: "none", borderRadius: 10, background: active ? tint(C.royal, 16) : C.cream, color: active ? C.royal : C.inkMute, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <ClipboardList size={17} />
                    </span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: "block", fontWeight: 600, fontSize: 14.5, color: active ? C.royal : C.ink }}>{e.title}</span>
                      <span style={{ display: "block", fontSize: 12.5, color: C.inkMute, marginTop: 2 }}>{e.window}</span>
                    </span>
                    <StatusPill status={e.status} />
                  </button>
                );
              })}
            </div>
          </Card>

          {hasResults && (
            <Card style={{ padding: 0, overflow: "hidden" }}>
              <CardHeader
                title="Top of the paper"
                action={
                  <Button size="sm" variant="ghost" icon={Download} onClick={exportResults}>
                    Export
                  </Button>
                }
              />
              <div>
                {topPerformers.map(({ student: s, score }, i) => (
                  <button
                    key={s.id}
                    onClick={() => nav.openStudent(s.id)}
                    className="ad-row"
                    style={{ width: "100%", textAlign: "left", border: "none", borderTop: i ? `1px solid ${C.line}` : "none", background: C.white, cursor: "pointer", padding: "11px 16px", display: "flex", alignItems: "center", gap: 11 }}
                  >
                    <span style={{ width: 22, fontFamily: FD, fontWeight: 700, color: i < 3 ? C.goldDeep : C.inkMute, fontSize: 14 }}>{i + 1}</span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: "block", fontSize: 14, fontWeight: 600 }}>{s.name}</span>
                      <span style={{ display: "block", fontSize: 12.5, color: C.inkMute }}>{s.section} · {completionOf(s)}% labs done</span>
                    </span>
                    <span style={{ fontFamily: FM, fontSize: 13.5 }}>{score}%</span>
                  </button>
                ))}
              </div>
            </Card>
          )}

          <Card style={{ padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, fontFamily: FD, fontWeight: 600, fontSize: 15 }}>
              <Users size={16} color={C.royal} /> Who sits this paper
            </div>
            <p style={{ color: C.inkSoft, fontSize: 13.5, marginTop: 8, lineHeight: 1.6 }}>
              {exam.audience}. Registration is automatic for anyone in that group, and the window closes for everyone at the same moment.
            </p>
            <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
              <Pill>{exam.registered} registered</Pill>
              <Pill>{exam.duration}</Pill>
              <Pill>Cutoff {exam.cutoff}%</Pill>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: C.paper, borderRadius: 13, padding: 14 }}>
      <div style={{ fontFamily: FD, fontWeight: 700, fontSize: 21 }}>{value}</div>
      <div style={{ color: C.inkMute, fontSize: 12.5, marginTop: 2 }}>{label}</div>
    </div>
  );
}
