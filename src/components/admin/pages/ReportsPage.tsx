"use client";

import React, { useMemo, useState } from "react";
import { Download, FileSpreadsheet, Table2 } from "lucide-react";
import { C, FD, FM, tint } from "../theme";
import { Button, Card, CardHeader, EmptyState, H2, Kicker, Pill, Select, Serif, num } from "../ui";
import { BRANCHES, SECTION_LIST } from "../data/cohort";
import { REPORT_PRESETS, applyFilters, downloadCsv, getPreset, toCsv, type ReportFilters } from "../data/reports";
import { useAdminState } from "../state";

const PREVIEW_ROWS = 8;

export function ReportsPage() {
  const { reports, addReport, notify } = useAdminState();
  const [presetId, setPresetId] = useState(REPORT_PRESETS[0].id);
  const [filters, setFilters] = useState<ReportFilters>({ branch: "All", section: "All", year: "All" });

  const preset = getPreset(presetId);
  const students = useMemo(() => applyFilters(filters), [filters]);
  const rows = useMemo(() => preset.rowsFor(students), [preset, students]);
  const scopeLabel = [
    filters.branch === "All" ? "All branches" : filters.branch,
    filters.section === "All" ? null : filters.section,
    filters.year === "All" ? null : `Year ${filters.year}`,
  ].filter(Boolean).join(" · ");

  function run(download: boolean) {
    if (download) {
      downloadCsv(`algospark-${preset.id}-${Date.now()}.csv`, toCsv(preset.columns, rows));
    }
    addReport({
      id: `r-${Date.now()}`,
      name: preset.name,
      scope: scopeLabel,
      rows: rows.length,
      when: "Just now",
      by: "Dr. Latha Nair",
    });
    notify({
      title: download ? `${preset.name} downloaded` : `${preset.name} saved`,
      sub: `${rows.length} rows · ${scopeLabel}.`,
      tone: "good",
    });
  }

  return (
    <div>
      <Kicker>Reports</Kicker>
      <H2>
        Pick a shape, <Serif>take the file.</Serif>
      </H2>
      <p style={{ color: C.inkSoft, marginTop: 8, fontSize: 15.5, maxWidth: 660 }}>
        Every report runs against the live roster. Preview it here, then download the same rows as CSV for your placement records.
      </p>

      <div className="ad-split-main" style={{ marginTop: 18 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card style={{ padding: 14, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <Select
              label="Branch"
              value={filters.branch}
              onChange={(v) => setFilters((f) => ({ ...f, branch: v, section: "All" }))}
              options={[{ value: "All", label: "All branches" }, ...BRANCHES.map((b) => ({ value: b, label: b }))]}
            />
            <Select
              label="Section"
              value={filters.section}
              onChange={(v) => setFilters((f) => ({ ...f, section: v }))}
              options={[
                { value: "All", label: "All sections" },
                ...SECTION_LIST.filter((s) => filters.branch === "All" || s.startsWith(filters.branch)).map((s) => ({ value: s, label: s })),
              ]}
            />
            <Select
              label="Year"
              value={filters.year}
              onChange={(v) => setFilters((f) => ({ ...f, year: v }))}
              options={[
                { value: "All", label: "All years" },
                { value: "2", label: "Year 2" },
                { value: "3", label: "Year 3" },
                { value: "4", label: "Year 4" },
              ]}
            />
            <Pill>{students.length} students in scope</Pill>
            <span style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
              <Button variant="ghost" onClick={() => run(false)} disabled={rows.length === 0}>
                Save to history
              </Button>
              <Button icon={Download} onClick={() => run(true)} disabled={rows.length === 0}>
                Download CSV
              </Button>
            </span>
          </Card>

          <Card style={{ padding: 0, overflow: "hidden" }}>
            <CardHeader
              title={preset.name}
              subtitle={`${rows.length} rows · ${preset.columns.length} columns · ${scopeLabel}`}
              action={<span style={{ fontFamily: FM, fontSize: 12, color: C.inkMute }}>preview of {Math.min(PREVIEW_ROWS, rows.length)}</span>}
            />
            {rows.length === 0 ? (
              <EmptyState title="Nothing to report" body="No student in the current scope matches this report. Widen the filters above." />
            ) : (
              <div className="ad-scroll-x">
                <table className="ad-table">
                  <thead>
                    <tr>
                      {preset.columns.map((c, ci) => (
                        <th key={c} style={{ textAlign: typeof rows[0][ci] === "number" ? "right" : "left" }}>
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, PREVIEW_ROWS).map((r, i) => (
                      <tr key={i}>
                        {r.map((cell, j) => (
                          <td key={j} className={typeof cell === "number" ? "ad-num" : undefined} style={typeof cell === "number" ? undefined : { color: j === 0 ? C.inkSoft : C.ink }}>
                            {typeof cell === "number" ? num(cell) : cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {rows.length > PREVIEW_ROWS && (
              <div style={{ padding: "12px 18px", borderTop: `1px solid ${C.line}`, color: C.inkMute, fontSize: 13 }}>
                {rows.length - PREVIEW_ROWS} more rows are in the download.
              </div>
            )}
          </Card>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card style={{ padding: 0, overflow: "hidden" }}>
            <CardHeader title="Report types" />
            <div>
              {REPORT_PRESETS.map((p, i) => {
                const active = p.id === presetId;
                return (
                  <button
                    key={p.id}
                    onClick={() => setPresetId(p.id)}
                    aria-pressed={active}
                    className="ad-row"
                    style={{
                      width: "100%", textAlign: "left", border: "none", borderTop: i ? `1px solid ${C.line}` : "none",
                      background: active ? tint(C.royal, 9) : C.white, cursor: "pointer", padding: "13px 16px",
                      display: "flex", gap: 12, alignItems: "flex-start",
                    }}
                  >
                    <span style={{ width: 32, height: 32, flex: "none", borderRadius: 9, background: active ? tint(C.royal, 16) : C.cream, color: active ? C.royal : C.inkMute, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Table2 size={16} />
                    </span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: "block", fontWeight: 600, fontSize: 14.5, color: active ? C.royal : C.ink }}>{p.name}</span>
                      <span style={{ display: "block", fontSize: 12.5, color: C.inkMute, marginTop: 3, lineHeight: 1.5 }}>{p.description}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card style={{ padding: 0, overflow: "hidden" }}>
            <CardHeader title="Recently run" subtitle="Shared with everyone in the placement cell." />
            <div>
              {reports.map((r, i) => (
                <div key={r.id} style={{ borderTop: i ? `1px solid ${C.line}` : "none", padding: "12px 16px", display: "flex", gap: 11, alignItems: "center" }}>
                  <span style={{ width: 30, height: 30, flex: "none", borderRadius: 9, background: C.cream, color: C.inkMute, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <FileSpreadsheet size={15} />
                  </span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: "block", fontSize: 14, fontWeight: 600 }}>{r.name}</span>
                    <span style={{ display: "block", fontSize: 12.5, color: C.inkMute }}>{r.scope} · {r.by}</span>
                  </span>
                  <span style={{ textAlign: "right" }}>
                    <span style={{ display: "block", fontFamily: FM, fontSize: 12.5 }}>{r.rows} rows</span>
                    <span style={{ display: "block", fontSize: 11.5, color: C.inkMute }}>{r.when}</span>
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card style={{ padding: 18 }}>
            <div style={{ fontFamily: FD, fontWeight: 600, fontSize: 15 }}>Scheduled delivery</div>
            <p style={{ color: C.inkSoft, fontSize: 13.5, marginTop: 8, lineHeight: 1.6 }}>
              The at-risk register goes to every class mentor at 8:00 AM on Mondays, and the placement readiness sheet to the principal on the first of each month.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
