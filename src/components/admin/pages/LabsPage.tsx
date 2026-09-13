"use client";

import React from "react";
import { AlertTriangle, CalendarClock, CheckCircle2, FlaskConical, Library, MapPin, PenSquare, Send, Users } from "lucide-react";
import { C, FD, FM, tint } from "../theme";
import { Button, Card, CardHeader, Collapsible, H2, Kicker, Pill, ProgressBar, Serif, Toggle } from "../ui";
import { AuthoringPanel, QuestionBank } from "./AuthoringPanel";
import { ADMIN_LABS, getAdminLab } from "../data/labs";
import { useAdminNav } from "../nav";
import { useAdminState } from "../state";

export function LabsPage() {
  const nav = useAdminNav();
  const { publishedThrough, publishThrough, bank, draft, notify } = useAdminState();
  const selectedId = nav.labId ?? ADMIN_LABS[0].id;
  const lab = getAdminLab(selectedId) ?? ADMIN_LABS[0];
  const through = publishedThrough[lab.id] ?? lab.publishedThrough;

  const published = lab.weeks.filter((w) => w.n <= through);
  const avgPass = published.length ? Math.round(published.reduce((s, w) => s + w.passRate, 0) / published.length) : 0;
  const avgScore = published.length ? Math.round(published.reduce((s, w) => s + w.avgScore, 0) / published.length) : 0;
  const flagged = published.reduce((s, w) => s + w.flagged, 0);

  function setWeekPublished(week: number, on: boolean) {
    const next = on ? Math.max(through, week) : week - 1;
    publishThrough(lab.id, next);
    notify({
      title: on ? `Week ${week} published` : `Week ${week} withdrawn`,
      sub: on
        ? `${lab.enrolled} students can open it now.`
        : `Weeks ${week} and later are drafts again.`,
      tone: on ? "good" : "warn",
    });
  }

  return (
    <div>
      <Kicker>Labs</Kicker>
      <H2>
        Publish a week, <Serif>watch it land.</Serif>
      </H2>
      <p style={{ color: C.inkSoft, marginTop: 8, fontSize: 15.5, maxWidth: 660 }}>
        Weeks release in order. Everything you publish here is what students see in their lab workspace the moment you flip it.
      </p>

      <div className="ad-grid-3" style={{ marginTop: 18 }}>
        {ADMIN_LABS.map((l) => {
          const active = l.id === lab.id;
          const cut = publishedThrough[l.id] ?? l.publishedThrough;
          return (
            <Card key={l.id} style={{ padding: 0, border: `1px solid ${active ? l.accent : C.line}` }} className="ad-card-lift">
              <button
                onClick={() => nav.openLab(l.id)}
                aria-pressed={active}
                style={{ all: "unset", cursor: "pointer", display: "block", width: "100%", padding: 18, boxSizing: "border-box" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ width: 40, height: 40, borderRadius: 11, background: tint(l.accent, 14), color: l.accent, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                    <FlaskConical size={19} />
                  </span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: "block", fontFamily: FD, fontWeight: 600, fontSize: 15 }}>{l.name.replace(" Lab", "")}</span>
                    <span style={{ display: "block", color: C.inkMute, fontSize: 12.5, fontFamily: FM }}>{l.code}</span>
                  </span>
                  <Pill color={l.accent} bg={tint(l.accent, 12)}>
                    {cut}/{l.weeks.length}
                  </Pill>
                </div>
                <div style={{ marginTop: 12, fontSize: 13, color: C.inkSoft }}>{l.faculty}</div>
                <div style={{ marginTop: 10 }}>
                  <ProgressBar value={(cut / l.weeks.length) * 100} color={l.accent} height={6} />
                </div>
              </button>
            </Card>
          );
        })}
      </div>

      <Card style={{ padding: 0, marginTop: 16, overflow: "hidden" }}>
        <CardHeader
          title={lab.name}
          subtitle={`${lab.semester} · ${lab.faculty}`}
          action={
            <Button
              icon={Send}
              size="sm"
              disabled={through >= lab.weeks.length}
              onClick={() => setWeekPublished(through + 1, true)}
            >
              {through >= lab.weeks.length ? "All weeks live" : `Publish week ${through + 1}`}
            </Button>
          }
        />

        <div style={{ display: "flex", gap: 22, padding: "14px 18px", flexWrap: "wrap", borderBottom: `1px solid ${C.line}`, color: C.inkSoft, fontSize: 13.5 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}><Users size={15} color={C.inkMute} /> {lab.enrolled} enrolled</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}><CalendarClock size={15} color={C.inkMute} /> {lab.schedule}</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}><MapPin size={15} color={C.inkMute} /> {lab.room}</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}><CheckCircle2 size={15} color={C.green} /> {avgPass}% average pass rate</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7, color: flagged ? C.red : C.inkSoft }}>
            <AlertTriangle size={15} color={flagged ? C.red : C.inkMute} /> {flagged} flagged for similarity
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>Avg score {avgScore}%</span>
        </div>

        <div className="ad-scroll-x">
          <table className="ad-table">
            <thead>
              <tr>
                <th style={{ width: 60 }}>Week</th>
                <th>Topic</th>
                <th style={{ width: 130 }}>Published</th>
                <th className="ad-hide-sm" style={{ textAlign: "right" }}>Submissions</th>
                <th className="ad-hide-md" style={{ textAlign: "right" }}>Avg score</th>
                <th style={{ textAlign: "right" }}>Pass rate</th>
                <th className="ad-hide-md" style={{ textAlign: "right" }}>Avg time</th>
                <th className="ad-hide-sm" style={{ textAlign: "right" }}>Flagged</th>
              </tr>
            </thead>
            <tbody>
              {lab.weeks.map((w) => {
                const live = w.n <= through;
                return (
                  <tr key={w.n}>
                    <td className="ad-num" style={{ textAlign: "left", color: C.inkMute }}>{w.n}</td>
                    <td>
                      <span style={{ fontWeight: 600, fontSize: 14.5, color: live ? C.ink : C.inkMute }}>{w.title}</span>
                    </td>
                    <td>
                      <span style={{ display: "flex", alignItems: "center", gap: 9 }}>
                        <Toggle on={live} onChange={(on) => setWeekPublished(w.n, on)} label={`Publish week ${w.n}`} />
                        <span style={{ fontSize: 12.5, color: live ? C.green : C.inkMute }}>{live ? "Live" : "Draft"}</span>
                      </span>
                    </td>
                    <td className="ad-hide-sm ad-num">{live ? w.submissions : "—"}</td>
                    <td className="ad-hide-md ad-num">{live ? `${w.avgScore}%` : "—"}</td>
                    <td className="ad-num">
                      {live ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 9, justifyContent: "flex-end", width: "100%" }}>
                          <span style={{ width: 62 }}>
                            <ProgressBar value={w.passRate} color={w.passRate >= 70 ? C.green : w.passRate >= 50 ? C.goldDeep : C.red} height={6} />
                          </span>
                          {w.passRate}%
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="ad-hide-md ad-num">{live ? `${w.avgMinutes}m` : "—"}</td>
                    <td className="ad-hide-sm ad-num" style={{ color: w.flagged ? C.red : C.inkMute }}>{live ? w.flagged : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 16 }}>
        <Collapsible
          id="lab-authoring"
          icon={PenSquare}
          title="Author a question"
          subtitle="Write an exercise with test cases and attach it to any lab week."
          badge={draft.title.trim() ? <Pill color={C.warn} bg={C.warnBg}>Draft in progress</Pill> : undefined}
          open={nav.authoringOpen}
          onToggle={nav.setAuthoringOpen}
        >
          <AuthoringPanel />
        </Collapsible>

        <Collapsible
          icon={Library}
          title="Question bank"
          subtitle="Every question across the labs and the practice set."
          badge={<Pill>{bank.length} questions</Pill>}
        >
          <QuestionBank />
        </Collapsible>
      </div>
    </div>
  );
}
