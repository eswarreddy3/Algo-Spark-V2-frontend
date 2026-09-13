"use client";

import React, { useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Eye, Plus, Trash2, Wand2 } from "lucide-react";
import { DIFF_COLOR, LANGUAGE_LABEL, type Difficulty, type Language } from "../../student/labs/types";
import { C, FD, FM, tint } from "../theme";
import {
  Button, Card, CardHeader, CodeArea, Field, Pill, SegmentedControl, Select, TextArea, TextInput, Toggle,
} from "../ui";
import {
  BANK_STATUS_META, EMPTY_DRAFT, SAMPLE_DRAFT, STARTER_TEMPLATES, draftToExercise, validateDraft,
  type BankItem, type QuestionDraft,
} from "../data/authoring";
import { ADMIN_LABS } from "../data/labs";
import { useAdminState } from "../state";

const LANGUAGES: Language[] = ["python", "cpp", "java", "sql"];
const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];

/** Where a new question can be attached: any week of any lab, or nowhere yet. */
const ATTACH_OPTIONS = [
  { value: "unassigned", label: "Keep in the bank" },
  ...ADMIN_LABS.flatMap((lab) =>
    lab.weeks.map((w) => ({ value: `${lab.id}:${w.n}`, label: `${lab.name.replace(" Lab", "")} · Week ${w.n}` })),
  ),
];

/**
 * Question authoring, embedded in the Labs page. The draft lives in session
 * state, so collapsing the section or visiting another page keeps it.
 */
export function AuthoringPanel() {
  const { addQuestion, draft, setDraft, notify } = useAdminState();
  const [showPreview, setShowPreview] = useState(true);

  const issues = useMemo(() => validateDraft(draft), [draft]);
  const exercise = useMemo(() => draftToExercise(draft), [draft]);
  const set = <K extends keyof QuestionDraft>(key: K, value: QuestionDraft[K]) => setDraft((d) => ({ ...d, [key]: value }));

  function toggleLanguage(lang: Language) {
    setDraft((d) => {
      const on = d.languages.includes(lang);
      const languages = on ? d.languages.filter((l) => l !== lang) : [...d.languages, lang];
      const primary = languages.includes(d.primaryLanguage) ? d.primaryLanguage : languages[0] ?? d.primaryLanguage;
      return { ...d, languages, primaryLanguage: primary, starter: primary === d.primaryLanguage ? d.starter : STARTER_TEMPLATES[primary] };
    });
  }

  function publish() {
    const attached = ATTACH_OPTIONS.find((o) => o.value === draft.attachTo);
    const item: BankItem = {
      id: exercise.id,
      title: exercise.title,
      difficulty: draft.difficulty,
      languages: draft.languages,
      tags: draft.tags.split(",").map((t) => t.trim()).filter(Boolean),
      author: "Dr. Latha Nair",
      status: draft.attachTo === "unassigned" ? "review" : "published",
      tests: exercise.tests.length,
      usedIn: draft.attachTo === "unassigned" ? "Unassigned" : (attached?.label ?? "Unassigned"),
      attempts: 0,
      solveRate: 0,
      updated: "Just now",
    };
    addQuestion(item);
    notify({
      title: `“${item.title}” added to the bank`,
      sub: item.status === "published" ? `Attached to ${item.usedIn}.` : "Sent for review before it can be attached.",
      tone: "good",
    });
    setDraft(EMPTY_DRAFT);
  }

  return (
    <div style={{ padding: 18 }}>
      <p style={{ color: C.inkSoft, margin: 0, fontSize: 14.5, maxWidth: 680, lineHeight: 1.55 }}>
        The form produces exactly the object the student runner executes: statement, allowed languages, starter code and test cases.
      </p>

      <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
        <Button variant="ghost" icon={Wand2} onClick={() => setDraft(SAMPLE_DRAFT)}>
          Load a worked example
        </Button>
        <Button variant="ghost" icon={Eye} onClick={() => setShowPreview((v) => !v)}>
          {showPreview ? "Hide student preview" : "Show student preview"}
        </Button>
        <Button variant="quiet" onClick={() => setDraft(EMPTY_DRAFT)}>
          Clear form
        </Button>
      </div>

      <div className="ad-split-main" style={{ marginTop: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card style={{ padding: 18 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Field label="Title">
                <TextInput value={draft.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Rotate an Array by K" />
              </Field>

              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-end" }}>
                <Field label="Difficulty">
                  <SegmentedControl
                    value={draft.difficulty}
                    onChange={(v) => set("difficulty", v)}
                    options={DIFFICULTIES.map((d) => ({ value: d, label: d }))}
                  />
                </Field>
                <Field label="Points">
                  <TextInput
                    type="number"
                    value={draft.points}
                    onChange={(e) => set("points", Number(e.target.value) || 0)}
                    style={{ width: 110 }}
                  />
                </Field>
                <Field label="Attach to">
                  <Select label="Attach to" value={draft.attachTo} onChange={(v) => set("attachTo", v)} options={ATTACH_OPTIONS} />
                </Field>
              </div>

              <Field label="Tags" hint="Comma separated. Used for search and for the practice filters.">
                <TextInput value={draft.tags} onChange={(e) => set("tags", e.target.value)} placeholder="Arrays, Two pointers" />
              </Field>

              <Field label="Statement" hint="Blank lines separate paragraphs, exactly as the student sees them.">
                <TextArea rows={6} value={draft.statement} onChange={(e) => set("statement", e.target.value)} placeholder="Describe the task, the input and what to return." />
              </Field>

              <div className="ad-grid-2">
                <Field label="Constraints" hint="One per line.">
                  <TextArea rows={4} value={draft.constraints} onChange={(e) => set("constraints", e.target.value)} placeholder={"1 <= n <= 10^5"} />
                </Field>
                <Field label="Target complexity" hint="Shown as the bar to beat. Optional.">
                  <TextInput value={draft.targetComplexity} onChange={(e) => set("targetComplexity", e.target.value)} placeholder="O(n) time, O(1) space" />
                </Field>
              </div>

              <Field label="Allowed languages">
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {LANGUAGES.map((lang) => {
                    const on = draft.languages.includes(lang);
                    return (
                      <button
                        key={lang}
                        onClick={() => toggleLanguage(lang)}
                        aria-pressed={on}
                        style={{
                          border: `1.5px solid ${on ? C.royal : C.line}`, background: on ? tint(C.royal, 10) : C.white,
                          color: on ? C.royal : C.inkSoft, borderRadius: 999, padding: "8px 15px", cursor: "pointer",
                          fontWeight: 600, fontSize: 13.5,
                        }}
                      >
                        {LANGUAGE_LABEL[lang]}
                      </button>
                    );
                  })}
                </div>
              </Field>

              <Field label={`Starter code · ${LANGUAGE_LABEL[draft.primaryLanguage]}`} hint="What the student opens the editor with.">
                <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                  {draft.languages.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setDraft((d) => ({ ...d, primaryLanguage: lang, starter: STARTER_TEMPLATES[lang] }))}
                      style={{
                        border: "none", background: lang === draft.primaryLanguage ? tint(C.royal, 14) : "transparent",
                        color: lang === draft.primaryLanguage ? C.royal : C.inkMute, borderRadius: 8, padding: "5px 10px",
                        cursor: "pointer", fontFamily: FM, fontSize: 12,
                      }}
                    >
                      {LANGUAGE_LABEL[lang]}
                    </button>
                  ))}
                </div>
                <CodeArea rows={7} value={draft.starter} onChange={(e) => set("starter", e.target.value)} />
              </Field>
            </div>
          </Card>

          <Card style={{ padding: 0 }}>
            <CardHeader
              title="Test cases"
              subtitle="Visible cases become the worked examples; hidden cases run only on submit."
              action={
                <Button
                  size="sm"
                  variant="ghost"
                  icon={Plus}
                  onClick={() =>
                    setDraft((d) => ({
                      ...d,
                      tests: [...d.tests, { id: `t${d.tests.length + 1}-${Date.now()}`, name: `Case ${d.tests.length + 1}`, input: "", expected: "", hidden: true }],
                    }))
                  }
                >
                  Add case
                </Button>
              }
            />
            <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
              {draft.tests.map((t, i) => (
                <div key={t.id} style={{ border: `1px solid ${C.line}`, borderRadius: 13, padding: 13, background: C.paper }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10, flexWrap: "wrap" }}>
                    <TextInput
                      value={t.name}
                      onChange={(e) => setDraft((d) => ({ ...d, tests: d.tests.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)) }))}
                      style={{ width: 190 }}
                      aria-label={`Case ${i + 1} name`}
                    />
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
                      <span style={{ fontSize: 13, color: C.inkSoft }}>Hidden</span>
                      <Toggle
                        on={Boolean(t.hidden)}
                        label={`Hide case ${i + 1} from the student`}
                        onChange={(on) => setDraft((d) => ({ ...d, tests: d.tests.map((x, j) => (j === i ? { ...x, hidden: on } : x)) }))}
                      />
                      <button
                        onClick={() => setDraft((d) => ({ ...d, tests: d.tests.filter((_, j) => j !== i) }))}
                        aria-label={`Remove case ${i + 1}`}
                        style={{ border: "none", background: "none", color: C.inkMute, cursor: "pointer", display: "flex", padding: 4 }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </span>
                  </div>
                  <div className="ad-grid-2">
                    <TextInput
                      value={t.input}
                      onChange={(e) => setDraft((d) => ({ ...d, tests: d.tests.map((x, j) => (j === i ? { ...x, input: e.target.value } : x)) }))}
                      placeholder="Call or stdin, e.g. rotate([1,2,3], 1)"
                      aria-label={`Case ${i + 1} input`}
                      style={{ fontFamily: FM, fontSize: 13 }}
                    />
                    <TextInput
                      value={t.expected}
                      onChange={(e) => setDraft((d) => ({ ...d, tests: d.tests.map((x, j) => (j === i ? { ...x, expected: e.target.value } : x)) }))}
                      placeholder="Expected output"
                      aria-label={`Case ${i + 1} expected output`}
                      style={{ fontFamily: FM, fontSize: 13 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card style={{ padding: 18 }}>
            <div style={{ fontFamily: FD, fontWeight: 600, fontSize: 16 }}>Before it can go out</div>
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 9 }}>
              {issues.length === 0 ? (
                <div style={{ display: "flex", gap: 9, alignItems: "flex-start", color: C.green, fontSize: 13.5 }}>
                  <CheckCircle2 size={16} style={{ marginTop: 1, flex: "none" }} />
                  Everything checks out. {exercise.tests.length} test cases, {exercise.tests.filter((t) => t.hidden).length} of them hidden.
                </div>
              ) : (
                issues.map((issue) => (
                  <div key={issue} style={{ display: "flex", gap: 9, alignItems: "flex-start", color: C.inkSoft, fontSize: 13.5 }}>
                    <AlertCircle size={16} color={C.goldDeep} style={{ marginTop: 1, flex: "none" }} />
                    {issue}
                  </div>
                ))
              )}
            </div>
            <div style={{ marginTop: 16 }}>
              <Button onClick={publish} disabled={issues.length > 0}>
                {draft.attachTo === "unassigned" ? "Save to bank" : "Publish to the week"}
              </Button>
            </div>
          </Card>

          {showPreview && (
            <Card style={{ padding: 0, overflow: "hidden" }}>
              <CardHeader title="Student preview" subtitle="How the exercise renders in the lab workspace." />
              <div style={{ padding: 18 }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                  <Pill color={DIFF_COLOR[draft.difficulty]} bg={tint(DIFF_COLOR[draft.difficulty], 12)}>{draft.difficulty}</Pill>
                  <Pill>{draft.points} pts</Pill>
                  {draft.languages.map((l) => (
                    <Pill key={l}>{LANGUAGE_LABEL[l]}</Pill>
                  ))}
                </div>
                <div style={{ fontFamily: FD, fontWeight: 700, fontSize: 19, marginTop: 12 }}>
                  {exercise.title || "Untitled exercise"}
                </div>
                {exercise.statement.length ? (
                  exercise.statement.map((p, i) => (
                    <p key={i} style={{ color: C.inkSoft, fontSize: 14, lineHeight: 1.6, marginTop: 10 }}>{p}</p>
                  ))
                ) : (
                  <p style={{ color: C.inkMute, fontSize: 14, marginTop: 10 }}>The statement will appear here as you type.</p>
                )}

                {exercise.constraints.length > 0 && (
                  <>
                    <div style={{ fontFamily: FM, fontSize: 11, letterSpacing: ".08em", color: C.inkMute, marginTop: 16 }}>CONSTRAINTS</div>
                    <ul style={{ margin: "8px 0 0", paddingLeft: 18, color: C.inkSoft, fontSize: 13.5, lineHeight: 1.7 }}>
                      {exercise.constraints.map((c) => (
                        <li key={c} style={{ fontFamily: FM, fontSize: 12.5 }}>{c}</li>
                      ))}
                    </ul>
                  </>
                )}

                {exercise.examples.length > 0 && (
                  <>
                    <div style={{ fontFamily: FM, fontSize: 11, letterSpacing: ".08em", color: C.inkMute, marginTop: 16 }}>EXAMPLES</div>
                    {exercise.examples.map((ex, i) => (
                      <div key={i} style={{ background: "#101430", borderRadius: 12, padding: 13, marginTop: 8, fontFamily: FM, fontSize: 12.5, color: "#C4C9EC" }}>
                        <div>{ex.input}</div>
                        <div style={{ color: "#5AD6B0", marginTop: 5 }}>→ {ex.output}</div>
                      </div>
                    ))}
                  </>
                )}

                {exercise.targetComplexity && (
                  <div style={{ marginTop: 14, fontSize: 13, color: C.inkSoft }}>
                    Target: <span style={{ fontFamily: FM, fontSize: 12.5 }}>{exercise.targetComplexity}</span>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

/** The question bank table, shown as its own collapsible section on the Labs page. */
export function QuestionBank() {
  const { bank } = useAdminState();
  return (
    <div style={{ background: C.white }}>
    <div className="ad-scroll-x">
      <table className="ad-table">
        <thead>
          <tr>
            <th>Question</th>
            <th className="ad-hide-sm">Difficulty</th>
            <th className="ad-hide-md">Languages</th>
            <th>Attached to</th>
            <th className="ad-hide-sm" style={{ textAlign: "right" }}>Tests</th>
            <th className="ad-hide-md" style={{ textAlign: "right" }}>Solve rate</th>
            <th style={{ textAlign: "right" }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {bank.map((item) => {
            const meta = BANK_STATUS_META[item.status];
            return (
              <tr key={item.id}>
                <td>
                  <span style={{ display: "block", fontWeight: 600, fontSize: 14.5 }}>{item.title}</span>
                  <span style={{ display: "block", fontSize: 12.5, color: C.inkMute }}>
                    {item.author} · {item.updated}
                  </span>
                </td>
                <td className="ad-hide-sm">
                  <Pill color={DIFF_COLOR[item.difficulty]} bg={tint(DIFF_COLOR[item.difficulty], 12)}>{item.difficulty}</Pill>
                </td>
                <td className="ad-hide-md" style={{ fontFamily: FM, fontSize: 12, color: C.inkSoft }}>
                  {item.languages.join(", ")}
                </td>
                <td style={{ color: C.inkSoft, fontSize: 13.5 }}>{item.usedIn}</td>
                <td className="ad-hide-sm ad-num">{item.tests}</td>
                <td className="ad-hide-md ad-num">{item.attempts ? `${item.solveRate}%` : "—"}</td>
                <td style={{ textAlign: "right" }}>
                  <Pill color={meta.fg} bg={meta.bg}>{meta.label}</Pill>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
    </div>
  );
}
