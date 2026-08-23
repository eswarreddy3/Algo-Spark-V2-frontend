"use client";

import React, { useMemo, useState } from "react";
import {
  BookOpen, CheckCircle2, ChevronRight, Clock, LifeBuoy, Mail, MessageSquare, Search, Send, Ticket,
} from "lucide-react";
import { C, FB, FD, FM, blueGrad } from "../theme";
import { Card, H2, Kicker, Pill, Serif } from "../ui";

type Faq = { id: string; category: string; q: string; a: string };

const FAQS: Faq[] = [
  {
    id: "f1",
    category: "Labs",
    q: "How do I unlock the next week's lab?",
    a: "Finish all three parts of the current week — read the material, clear the MCQs and submit the coding exercise. The next week unlocks immediately and the week's XP is credited to your total.",
  },
  {
    id: "f2",
    category: "Labs",
    q: "A week says “publishes on…” — what does that mean?",
    a: "Your faculty releases material week by week, usually before the lab session. The outline is visible so you can prepare; the slides, quiz and exercise appear on the date shown.",
  },
  {
    id: "f3",
    category: "Coding",
    q: "Why is my submission timing out?",
    a: "The hidden tests use much larger inputs than the samples. Check the target complexity on the problem card — an O(n²) solution will not clear a 10⁵ input. Optimise, then run again.",
  },
  {
    id: "f4",
    category: "Coding",
    q: "Can I switch languages halfway through a problem?",
    a: "Yes. Your draft is saved separately per language, so you can start in Python and finish in C++ without losing either version. Only your last submission is graded.",
  },
  {
    id: "f5",
    category: "Exams",
    q: "What happens if I lose connection during an exam?",
    a: "Answers are saved as you go. Reopen the exam and you will return to where you were, with the timer still counting from when you started.",
  },
  {
    id: "f6",
    category: "Exams",
    q: "When do written sections get graded?",
    a: "Email and paragraph sections are graded by faculty after the exam window closes. MCQ and coding sections are graded automatically and appear immediately.",
  },
  {
    id: "f7",
    category: "Points",
    q: "How is the leaderboard calculated?",
    a: "Points come from labs, practice problems, non-tech tasks and exams. You can view the leaderboard by section, branch or the whole college; rankings refresh nightly.",
  },
  {
    id: "f8",
    category: "Points",
    q: "Can I retake an MCQ set?",
    a: "Yes. If you score below the pass mark you can retry as often as you like — your best attempt is the one that counts toward unlocking the week.",
  },
];

type TicketRecord = {
  id: string;
  subject: string;
  status: "Open" | "In progress" | "Resolved";
  updated: string;
  replies: number;
};

const EXISTING_TICKETS: TicketRecord[] = [
  { id: "TCK-2214", subject: "Compiler shows wrong output for Python 3", status: "In progress", updated: "2 hours ago", replies: 2 },
  { id: "TCK-2190", subject: "Week 4 slides missing a page", status: "Resolved", updated: "Yesterday", replies: 3 },
];

const CATEGORIES = ["All", "Labs", "Coding", "Exams", "Points"];

export function SupportPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [open, setOpen] = useState<string | null>(FAQS[0].id);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [touched, setTouched] = useState(false);
  const [tickets, setTickets] = useState(EXISTING_TICKETS);
  const [sent, setSent] = useState<string | null>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FAQS.filter((f) => {
      if (category !== "All" && f.category !== category) return false;
      if (!q) return true;
      return f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q);
    });
  }, [query, category]);

  const subjectError = touched && subject.trim().length < 6 ? "Give the subject at least 6 characters" : "";
  const bodyError = touched && body.trim().length < 20 ? "Describe the issue in at least 20 characters" : "";
  const canSubmit = subject.trim().length >= 6 && body.trim().length >= 20;

  function raise() {
    setTouched(true);
    if (!canSubmit) return;
    const id = `TCK-${2215 + tickets.length}`;
    setTickets((t) => [{ id, subject: subject.trim(), status: "Open", updated: "Just now", replies: 0 }, ...t]);
    setSent(id);
    setSubject("");
    setBody("");
    setTouched(false);
  }

  return (
    <div>
      <Kicker>Support</Kicker>
      <H2>
        How can we <Serif>help?</Serif>
      </H2>
      <p style={{ color: C.inkSoft, marginTop: 8, fontSize: 15.5, maxWidth: 620 }}>
        Most questions are answered below. If yours is not, raise a ticket and your college admin picks it up — usually
        within a working day.
      </p>

      <div className="as-split-main" style={{ marginTop: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Card style={{ padding: 16 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 9, background: C.cream, border: `1px solid ${C.line}`, borderRadius: 11, padding: "10px 13px" }}>
              <Search size={16} color={C.inkMute} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search help articles"
                aria-label="Search help articles"
                style={{ flex: 1, border: "none", background: "transparent", outline: "none", fontFamily: FB, fontSize: 14.5, color: C.ink, minWidth: 0 }}
              />
            </label>
            <div style={{ display: "flex", gap: 7, marginTop: 12, flexWrap: "wrap" }}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  aria-pressed={category === cat}
                  style={{
                    border: `1.5px solid ${category === cat ? C.royal : C.line}`,
                    background: category === cat ? "rgba(47,91,240,.06)" : "#fff",
                    color: category === cat ? C.royal : C.inkSoft, borderRadius: 999, padding: "6px 14px",
                    cursor: "pointer", fontFamily: FB, fontWeight: 600, fontSize: 13,
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </Card>

          {results.length === 0 ? (
            <Card style={{ padding: 32, textAlign: "center" }}>
              <div style={{ fontFamily: FD, fontWeight: 600, fontSize: 16 }}>Nothing matches “{query}”</div>
              <p style={{ color: C.inkMute, fontSize: 14, marginTop: 6 }}>Raise a ticket on the right and we will answer directly.</p>
            </Card>
          ) : (
            results.map((f) => (
              <Card key={f.id} style={{ padding: 0, overflow: "hidden" }}>
                <button
                  onClick={() => setOpen(open === f.id ? null : f.id)}
                  aria-expanded={open === f.id}
                  style={{ width: "100%", textAlign: "left", border: "none", background: "#fff", padding: "16px 18px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}
                >
                  <Pill>{f.category}</Pill>
                  <span style={{ flex: 1, fontFamily: FD, fontWeight: 600, fontSize: 15 }}>{f.q}</span>
                  <ChevronRight size={18} color={C.inkMute} style={{ transform: open === f.id ? "rotate(90deg)" : "none", transition: "transform .2s" }} />
                </button>
                {open === f.id && (
                  <div style={{ padding: "0 18px 16px", color: C.inkSoft, fontSize: 14.5, lineHeight: 1.65 }}>{f.a}</div>
                )}
              </Card>
            ))
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Card style={{ padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: FD, fontWeight: 600, fontSize: 16 }}>
              <LifeBuoy size={17} color={C.royal} /> Still stuck?
            </div>
            <p style={{ color: C.inkMute, fontSize: 14, marginTop: 6, lineHeight: 1.55 }}>
              Raise a ticket and your college admin will get back to you.
            </p>

            {sent && (
              <div style={{ marginTop: 14, background: C.greenBg, color: C.green, borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10, fontWeight: 600, fontSize: 14 }}>
                <CheckCircle2 size={18} /> Ticket {sent} raised — we’ll be in touch.
              </div>
            )}

            <div style={{ marginTop: 14 }}>
              <Field label="Subject" error={subjectError}>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Short summary of the problem"
                  aria-label="Ticket subject"
                  style={{ width: "100%", border: `1px solid ${subjectError ? C.red : C.line}`, borderRadius: 11, padding: "11px 13px", fontFamily: FB, fontSize: 14, outline: "none", color: C.ink }}
                />
              </Field>
              <Field label="Description" error={bodyError} hint={`${body.trim().length}/20 characters minimum`}>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="What happened, what you expected, and the page you were on."
                  aria-label="Ticket description"
                  style={{ width: "100%", minHeight: 110, border: `1px solid ${bodyError ? C.red : C.line}`, borderRadius: 11, padding: "11px 13px", fontFamily: FB, fontSize: 14, outline: "none", resize: "vertical", color: C.ink }}
                />
              </Field>
              <button
                onClick={raise}
                style={{ width: "100%", marginTop: 4, background: blueGrad, color: "#fff", border: "none", borderRadius: 11, padding: "12px", fontFamily: FB, fontWeight: 600, fontSize: 14.5, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              >
                <Send size={16} /> Raise ticket
              </button>
            </div>
          </Card>

          <Card style={{ padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: FD, fontWeight: 600, fontSize: 15 }}>
              <Ticket size={16} color={C.royal} /> Your tickets
            </div>
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
              {tickets.map((t) => (
                <div key={t.id} style={{ border: `1px solid ${C.line}`, borderRadius: 12, padding: "11px 13px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontFamily: FM, fontSize: 11.5, color: C.inkMute }}>{t.id}</span>
                    <StatusPill status={t.status} />
                  </div>
                  <div style={{ fontSize: 14, marginTop: 5, fontWeight: 500 }}>{t.subject}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 6, color: C.inkMute, fontSize: 12.5 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <Clock size={12} /> {t.updated}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <MessageSquare size={12} /> {t.replies} repl{t.replies === 1 ? "y" : "ies"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card style={{ padding: 18 }}>
            <div style={{ fontFamily: FD, fontWeight: 600, fontSize: 15 }}>Other ways to reach us</div>
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10, fontSize: 14, color: C.inkSoft }}>
              <span style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <Mail size={15} color={C.inkMute} /> support@algospark.app
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <BookOpen size={15} color={C.inkMute} /> Student handbook (PDF)
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <Clock size={15} color={C.inkMute} /> Lab desk · Mon–Fri, 9 AM to 5 PM
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: C.inkSoft, marginBottom: 6 }}>{label}</div>
      {children}
      {(error || hint) && (
        <div style={{ marginTop: 5, fontSize: 12, color: error ? C.red : C.inkMute, fontFamily: error ? FB : FM }}>
          {error || hint}
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: TicketRecord["status"] }) {
  const map = {
    Open: { color: C.goldDeep, bg: "#FFF4E0" },
    "In progress": { color: C.blue, bg: "rgba(47,91,240,.08)" },
    Resolved: { color: C.green, bg: C.greenBg },
  } as const;
  const { color, bg } = map[status];
  return (
    <Pill color={color} bg={bg}>
      {status}
    </Pill>
  );
}
