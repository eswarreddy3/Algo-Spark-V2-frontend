"use client";

import React, { useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, CalendarRange, ChevronDown, Info, Pencil, ShieldCheck, Sparkles, Target, TrendingDown, TrendingUp } from "lucide-react";
import { C, FB, FD, FM, tint } from "../theme";
import { Card, H2, Kicker, Pill, ProgressBar, Serif } from "../ui";
import { DIFF_COLOR } from "../labs/types";
import { moduleOfProblem } from "../data/problemModules";
import { useNav } from "../nav";
import { useCoach, useOpenTarget, useSetGoal } from "./useCoach";
import type { GapArea } from "./engine";
import { BAND_COLOR, GoalSetup, PlanItemRow, ReadinessRing, STATUS_META } from "./widgets";

const GROUPS: GapArea["group"][] = ["Coding topics", "Labs", "Exams & communication"];

export function CoachPage() {
  const { readiness, areas, drills, plan, weak, strong, goal } = useCoach();
  const setGoal = useSetGoal();
  const openTarget = useOpenTarget();
  const nav = useNav();
  const [editing, setEditing] = useState(false);
  const [showFormula, setShowFormula] = useState(false);
  const [weekIndex, setWeekIndex] = useState(0);

  const bandColor = BAND_COLOR[readiness.band.tone];
  const shownWeek = plan?.weeks[Math.min(weekIndex, plan.weeks.length - 1)];
  const topDrills = drills.slice(0, 5);
  const thisWeekDone = plan?.thisWeek ? plan.thisWeek.items.filter((i) => i.done).length : 0;
  const thisWeekTotal = plan?.thisWeek?.items.length ?? 0;

  const grouped = useMemo(() => GROUPS.map((g) => ({ group: g, areas: areas.filter((a) => a.group === g) })), [areas]);

  return (
    <div>
      <Kicker>AI Prep Coach</Kicker>
      <H2>
        Your path to <Serif>placement.</Serif>
      </H2>
      <p style={{ color: C.inkSoft, marginTop: 8, fontSize: 15.5, maxWidth: 720, lineHeight: 1.6 }}>
        The coach reads your lab, coding, exam and AI-graded scores, finds your gaps, and orders existing labs, courses and
        problems toward your target companies. It recomputes whenever a new score lands.
      </p>
      <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
        <Pill color={C.green} bg={C.greenBg}>
          <ShieldCheck size={11} style={{ display: "inline", marginRight: 4, verticalAlign: -1 }} />
          uses only existing AlgoSpark content
        </Pill>
        <Pill>never unlocks a lab week early</Pill>
      </div>

      {(!goal || editing) && (
        <Card style={{ padding: 22, marginTop: 18, border: `1.5px solid ${tint(C.royal, 40)}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, fontFamily: FD, fontWeight: 600, fontSize: 17 }}>
            <Target size={18} color={C.royal} /> {goal ? "Change your goal" : "Set your goal to get a plan"}
          </div>
          <p style={{ color: C.inkMute, fontSize: 14, marginTop: 6, marginBottom: 16 }}>
            The plan is built week by week from these targets and re-plans itself as you progress or fall behind.
          </p>
          <GoalSetup
            key={goal?.setAt ?? "new"}
            initialCompanies={goal?.companies}
            initialWeeks={goal?.weeks}
            onSave={(companies, weeks) => { setGoal(companies, weeks); setEditing(false); setWeekIndex(0); }}
            onCancel={goal ? () => setEditing(false) : undefined}
          />
        </Card>
      )}

      <div className="as-split-main" style={{ marginTop: 16 }}>
        {/* readiness */}
        <Card style={{ padding: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 22, flexWrap: "wrap" }}>
            <ReadinessRing score={readiness.score} color={bandColor} />
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontFamily: FM, fontSize: 11.5, color: C.inkMute, letterSpacing: ".1em" }}>PLACEMENT READINESS</div>
              <div style={{ fontFamily: FD, fontWeight: 700, fontSize: 24, marginTop: 4, color: bandColor }}>{readiness.band.label}</div>
              <p style={{ color: C.inkSoft, fontSize: 14, marginTop: 6, lineHeight: 1.55 }}>
                {weak.length
                  ? `Biggest lift available: ${weak.map((a) => a.label).slice(0, 2).join(" and ")}.`
                  : "No weak areas right now — keep your streak and take the next mock."}
              </p>
            </div>
          </div>

          <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 12 }}>
            {readiness.components.map((c) => (
              <div key={c.id}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, marginBottom: 5, gap: 10 }}>
                  <span>
                    {c.label} <span style={{ color: C.inkMute, fontSize: 12 }}>· {Math.round(c.weight * 100)}%</span>
                  </span>
                  <span style={{ fontFamily: FM, color: c.score === null ? C.inkMute : C.inkSoft }}>{c.score ?? "—"}</span>
                </div>
                <ProgressBar value={c.score ?? 0} color={c.score === null ? C.line : c.score >= 75 ? C.green : c.score >= 50 ? C.goldDeep : C.red} height={7} />
                <div style={{ fontSize: 12, color: C.inkMute, marginTop: 4 }}>{c.evidence}</div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setShowFormula((v) => !v)}
            aria-expanded={showFormula}
            style={{ marginTop: 14, border: "none", background: "none", padding: 0, color: C.blue, fontFamily: FB, fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
          >
            <Info size={14} /> How is this calculated?
            <ChevronDown size={14} style={{ transform: showFormula ? "rotate(180deg)" : "none", transition: "transform .18s" }} />
          </button>
          {showFormula && (
            <div style={{ marginTop: 10, background: C.cream, borderRadius: 12, padding: "12px 14px", fontSize: 13, color: C.inkSoft, lineHeight: 1.65 }}>
              Readiness = 30% labs + 30% coding + 25% exams + 15% email & reading. Labs blend week completion (70%) with MCQ
              accuracy (30%). Coding is solved problems weighted Easy 1 · Medium 2 · Hard 3; with a goal set, 60% of it comes from
              your target companies&apos; problems. Exams average your last three results. A part with no data yet is left out
              and the rest rescale.
            </div>
          )}
        </Card>

        {/* strengths & gaps */}
        <Card style={{ padding: 22 }}>
          <div style={{ fontFamily: FD, fontWeight: 600, fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <TrendingDown size={17} color={C.red} /> Work on these
          </div>
          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
            {weak.length ? weak.map((a) => <AreaLine key={a.id} area={a} targeted={Boolean(goal) && a.targetWeight > 0} />) : <Empty text="Nothing below 75 — nice." />}
          </div>
          <div style={{ fontFamily: FD, fontWeight: 600, fontSize: 16, display: "flex", alignItems: "center", gap: 8, marginTop: 20 }}>
            <TrendingUp size={17} color={C.green} /> Strengths
          </div>
          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
            {strong.length ? strong.map((a) => <AreaLine key={a.id} area={a} targeted={false} />) : <Empty text="Strengths show up once an area passes 75." />}
          </div>
        </Card>
      </div>

      {/* plan */}
      {plan && goal && !editing && (
        <Card style={{ padding: 0, overflow: "hidden", marginTop: 16 }}>
          <div style={{ padding: "18px 20px", borderBottom: `1px solid ${C.line}`, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 240 }}>
              <div style={{ fontFamily: FD, fontWeight: 600, fontSize: 17, display: "flex", alignItems: "center", gap: 8 }}>
                <CalendarRange size={18} color={C.royal} /> Your prep plan · week {plan.currentWeek} of {plan.totalWeeks}
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                {goal.companies.map((c) => (
                  <Pill key={c} color={C.blue} bg={tint(C.royal, 9)}>{c}</Pill>
                ))}
                <Pill
                  color={plan.status === "behind" ? C.red : plan.status === "ahead" ? C.green : C.royal}
                  bg={plan.status === "behind" ? C.redBg : plan.status === "ahead" ? C.greenBg : tint(C.royal, 9)}
                >
                  {plan.status === "behind" ? "behind schedule" : plan.status === "ahead" ? "ahead of schedule" : "on track"}
                </Pill>
              </div>
            </div>
            <div style={{ minWidth: 180 }}>
              <div style={{ fontSize: 12.5, color: C.inkMute, marginBottom: 5 }}>This week · {thisWeekDone}/{thisWeekTotal} done</div>
              <ProgressBar value={thisWeekTotal ? (thisWeekDone / thisWeekTotal) * 100 : 0} height={7} />
            </div>
            <button
              onClick={() => setEditing(true)}
              style={{ border: `1px solid ${C.line}`, background: C.white, borderRadius: 11, padding: "9px 14px", fontFamily: FB, fontWeight: 600, fontSize: 13.5, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: C.ink }}
            >
              <Pencil size={14} /> Edit goal
            </button>
          </div>

          <div style={{ padding: "12px 20px", background: plan.status === "behind" ? C.warnBg : C.cream, color: plan.status === "behind" ? C.warnInk : C.inkSoft, fontSize: 13.5, display: "flex", gap: 9 }}>
            {plan.status === "behind" ? <AlertTriangle size={16} style={{ flex: "none", marginTop: 1 }} /> : <Sparkles size={16} color={C.violet} style={{ flex: "none", marginTop: 1 }} />}
            <span>{plan.notes.join(" ")}</span>
          </div>

          <div style={{ display: "flex", gap: 6, padding: "12px 20px 0", overflowX: "auto" }}>
            {plan.weeks.map((w, i) => {
              const active = i === weekIndex;
              return (
                <button
                  key={w.n}
                  onClick={() => setWeekIndex(i)}
                  aria-pressed={active}
                  style={{
                    flex: "none", border: `1.5px solid ${active ? C.royal : C.line}`, background: active ? tint(C.royal, 8) : C.white,
                    color: active ? C.royal : C.inkSoft, borderRadius: 999, padding: "7px 14px", fontFamily: FB, fontWeight: 600, fontSize: 13, cursor: "pointer",
                  }}
                >
                  {w.current ? "This week" : `Week ${w.n}`}
                </button>
              );
            })}
          </div>

          <div style={{ margin: "12px 20px 20px", border: `1px solid ${C.line}`, borderRadius: 14, overflow: "hidden" }}>
            {shownWeek && shownWeek.items.length ? (
              shownWeek.items.map((item, i) => <PlanItemRow key={item.id} item={item} first={i === 0} onOpen={() => openTarget(item.target)} />)
            ) : (
              <div style={{ padding: 20, color: C.inkMute, fontSize: 14 }}>Nothing scheduled — you&apos;ve cleared everything this plan covers.</div>
            )}
          </div>
        </Card>
      )}

      <div className="as-split-main" style={{ marginTop: 16 }}>
        {/* gap map */}
        <Card style={{ padding: 22 }}>
          <div style={{ fontFamily: FD, fontWeight: 600, fontSize: 16 }}>Gap map</div>
          <p style={{ color: C.inkMute, fontSize: 13, marginTop: 4 }}>
            Every area the diagnostic scores.{goal ? " Areas your target companies test are marked." : ""}
          </p>
          {grouped.map(({ group, areas: list }) => (
            <div key={group} style={{ marginTop: 16 }}>
              <div style={{ fontFamily: FM, fontSize: 11, letterSpacing: ".1em", color: C.inkMute, textTransform: "uppercase" }}>{group}</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 10, marginTop: 8 }}>
                {list.map((a) => {
                  const meta = STATUS_META[a.status];
                  return (
                    <div key={a.id} style={{ border: `1px solid ${C.line}`, borderRadius: 12, padding: "10px 12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600 }}>{a.label}</span>
                        <span style={{ fontFamily: FM, fontSize: 12.5, color: meta.color }}>{a.score ?? "—"}</span>
                      </div>
                      <div style={{ marginTop: 6 }}>
                        <ProgressBar value={a.score ?? 0} color={a.score === null ? C.line : meta.color} height={5} />
                      </div>
                      <div style={{ display: "flex", gap: 6, marginTop: 7, alignItems: "center", flexWrap: "wrap" }}>
                        <Pill color={meta.color} bg={meta.bg}>{meta.label}</Pill>
                        {goal && a.targetWeight > 0 && <Pill color={C.blue} bg={tint(C.royal, 9)}>target</Pill>}
                        <span style={{ fontSize: 11.5, color: C.inkMute }}>{a.evidence}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </Card>

        {/* targeted drills */}
        <Card style={{ padding: 0, overflow: "hidden", alignSelf: "start" }}>
          <div style={{ padding: "18px 18px 12px" }}>
            <div style={{ fontFamily: FD, fontWeight: 600, fontSize: 16 }}>Targeted drills</div>
            <p style={{ color: C.inkMute, fontSize: 13, marginTop: 4 }}>
              Picked from the problem bank for your weak topics{goal ? " and target companies" : ""}.
            </p>
          </div>
          {topDrills.length ? (
            topDrills.map((d) => {
              const mod = d.kind === "coding" ? moduleOfProblem(d.problem.exercise.id) : undefined;
              return (
                <div key={d.problem.exercise.id} style={{ borderTop: `1px solid ${C.line}`, padding: "12px 18px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 600, fontSize: 14.5, flex: 1, minWidth: 140 }}>{d.problem.exercise.title}</span>
                    <span style={{ fontFamily: FM, fontSize: 12, fontWeight: 600, color: DIFF_COLOR[d.problem.exercise.difficulty] }}>{d.problem.exercise.difficulty}</span>
                  </div>
                  <div style={{ fontSize: 12.5, color: C.inkSoft, marginTop: 3 }}>{d.reason}</div>
                  <div style={{ display: "flex", gap: 6, marginTop: 7, flexWrap: "wrap" }}>
                    {d.problem.tags.map((t) => <Pill key={t}>{t}</Pill>)}
                    {d.problem.companies.map((c) => <Pill key={c} color={C.blue} bg={tint(C.royal, 9)}>{c}</Pill>)}
                  </div>
                  <div style={{ display: "flex", gap: 12, marginTop: 9, flexWrap: "wrap" }}>
                    <button
                      onClick={() => openTarget(d.kind === "sql" ? { type: "sql", problemId: d.problem.exercise.id } : { type: "problem", problemId: d.problem.exercise.id })}
                      style={{ border: "none", background: "none", padding: 0, color: C.blue, fontFamily: FB, fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}
                    >
                      Solve <ArrowRight size={13} />
                    </button>
                    {mod && (
                      <button
                        onClick={() => nav.openProblemModule(mod.id, "companies")}
                        style={{ border: "none", background: "none", padding: 0, color: C.inkSoft, fontFamily: FB, fontWeight: 600, fontSize: 13, cursor: "pointer" }}
                      >
                        More in {mod.title}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ padding: "0 18px 18px", color: C.inkMute, fontSize: 14 }}>Every problem in the bank is solved.</div>
          )}
        </Card>
      </div>
    </div>
  );
}

function AreaLine({ area, targeted }: { area: GapArea; targeted: boolean }) {
  const meta = STATUS_META[area.status];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ width: 8, height: 8, borderRadius: 999, background: meta.color, flex: "none" }} />
      <span style={{ flex: 1, fontSize: 14 }}>
        {area.label} <span style={{ color: C.inkMute, fontSize: 12.5 }}>· {area.evidence}</span>
      </span>
      {targeted && <Pill color={C.blue} bg={tint(C.royal, 9)}>target</Pill>}
      <span style={{ fontFamily: FM, fontSize: 13, color: meta.color }}>{area.score ?? "—"}</span>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <div style={{ fontSize: 13.5, color: C.inkMute }}>{text}</div>;
}
