"use client";

import React, { useMemo, useState } from "react";
import { CheckCircle2, LifeBuoy, MessageSquare, Send } from "lucide-react";
import { C, FD, FM, tint } from "../theme";
import {
  Avatar, Button, Card, CardHeader, Drawer, EmptyState, H2, Kicker, Pill, SegmentedControl, Serif, StatTile, TextArea,
} from "../ui";
import { TICKET_STATUS_META, type Ticket, type TicketStatus } from "../data/tickets";
import { useAdminNav } from "../nav";
import { useAdminState } from "../state";

type Filter = "all" | TicketStatus;

const PRIORITY_META = {
  high: { label: "High", fg: C.red, bg: C.redBg },
  normal: { label: "Normal", fg: C.inkSoft, bg: C.cream },
  low: { label: "Low", fg: C.inkMute, bg: C.cream },
} as const;

export function SupportPage() {
  const nav = useAdminNav();
  const { tickets, replyToTicket, setTicketStatus, notify } = useAdminState();
  const [filter, setFilter] = useState<Filter>("all");

  const rows = useMemo(
    () => (filter === "all" ? tickets : tickets.filter((t) => t.status === filter)),
    [tickets, filter],
  );

  const open = tickets.filter((t) => t.status === "open");
  const pending = tickets.filter((t) => t.status === "pending");
  const resolved = tickets.filter((t) => t.status === "resolved");
  const ticket = nav.ticketId ? tickets.find((t) => t.id === nav.ticketId) : undefined;

  return (
    <div>
      <Kicker>Support</Kicker>
      <H2>
        Answer a student, <Serif>close the loop.</Serif>
      </H2>
      <p style={{ color: C.inkSoft, marginTop: 8, fontSize: 15.5, maxWidth: 640 }}>
        Tickets arrive from the student app with the lab, week and submission already attached, so nobody has to describe a bug twice.
      </p>

      <div className="ad-grid-3" style={{ marginTop: 20 }}>
        <StatTile icon={LifeBuoy} label="Open tickets" value={String(open.length)} sub="waiting on us" color={C.red} bg={C.redBg} onClick={() => setFilter("open")} />
        <StatTile icon={MessageSquare} label="Awaiting student" value={String(pending.length)} sub="replied, no answer yet" color={C.warn} bg={C.warnBg} onClick={() => setFilter("pending")} />
        <StatTile icon={CheckCircle2} label="Resolved" value={String(resolved.length)} sub="this fortnight" color={C.green} bg={C.greenBg} onClick={() => setFilter("resolved")} />
      </div>

      <div style={{ marginTop: 18 }}>
        <SegmentedControl<Filter>
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: `All (${tickets.length})` },
            { value: "open", label: `Open (${open.length})` },
            { value: "pending", label: `Awaiting student (${pending.length})` },
            { value: "resolved", label: `Resolved (${resolved.length})` },
          ]}
        />
      </div>

      <Card style={{ padding: 0, marginTop: 16, overflow: "hidden" }}>
        <CardHeader title="Queue" subtitle="Oldest unanswered ticket first once you open the Open filter." />
        {rows.length === 0 ? (
          <EmptyState title="Nothing in this bucket" body="Switch the filter above to see the rest of the queue." />
        ) : (
          rows.map((t, i) => {
            const meta = TICKET_STATUS_META[t.status];
            const priority = PRIORITY_META[t.priority];
            return (
              <button
                key={t.id}
                onClick={() => nav.openTicket(t.id)}
                className="ad-row"
                style={{ width: "100%", textAlign: "left", border: "none", borderTop: i ? `1px solid ${C.line}` : "none", background: C.white, cursor: "pointer", padding: "14px 18px", display: "flex", gap: 13, alignItems: "center" }}
              >
                <Avatar name={t.studentName} size={36} />
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 600, fontSize: 14.5 }}>{t.subject}</span>
                    <Pill color={priority.fg} bg={priority.bg}>{priority.label}</Pill>
                  </span>
                  <span style={{ display: "block", fontSize: 12.5, color: C.inkMute, marginTop: 3 }}>
                    <span style={{ fontFamily: FM }}>{t.id}</span> · {t.studentName} · {t.section} · {t.category} · {t.opened}
                  </span>
                </span>
                <span className="ad-hide-sm" style={{ fontSize: 12.5, color: C.inkMute, display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <MessageSquare size={13} /> {t.thread.length}
                </span>
                <Pill color={meta.fg} bg={meta.bg}>{meta.label}</Pill>
              </button>
            );
          })
        )}
      </Card>

      {ticket && (
        <TicketDrawer
          ticket={ticket}
          onClose={() => nav.openTicket(null)}
          onReply={(body) => {
            replyToTicket(ticket.id, body);
            notify({ title: `Replied to ${ticket.id}`, sub: `${ticket.studentName} has been notified.`, tone: "good" });
          }}
          onResolve={() => {
            setTicketStatus(ticket.id, "resolved");
            notify({ title: `${ticket.id} resolved`, sub: "It moves to the resolved bucket.", tone: "good" });
          }}
          onOpenStudent={() => nav.openStudent(ticket.studentId)}
        />
      )}
    </div>
  );
}

function TicketDrawer({
  ticket,
  onClose,
  onReply,
  onResolve,
  onOpenStudent,
}: {
  ticket: Ticket;
  onClose: () => void;
  onReply: (body: string) => void;
  onResolve: () => void;
  onOpenStudent: () => void;
}) {
  const [reply, setReply] = useState("");
  const meta = TICKET_STATUS_META[ticket.status];

  return (
    <Drawer
      title={ticket.subject}
      subtitle={`${ticket.id} · ${ticket.category} · opened ${ticket.opened}`}
      onClose={onClose}
      footer={
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Button
            icon={Send}
            disabled={reply.trim().length < 4}
            onClick={() => {
              onReply(reply.trim());
              setReply("");
            }}
          >
            Send reply
          </Button>
          <Button variant="ghost" icon={CheckCircle2} onClick={onResolve} disabled={ticket.status === "resolved"}>
            {ticket.status === "resolved" ? "Resolved" : "Mark resolved"}
          </Button>
          <Button variant="quiet" onClick={onOpenStudent}>
            Open student
          </Button>
        </div>
      }
    >
      <div style={{ display: "flex", gap: 9, flexWrap: "wrap", alignItems: "center" }}>
        <Pill color={meta.fg} bg={meta.bg}>{meta.label}</Pill>
        <Pill>{ticket.studentName}</Pill>
        <Pill>{ticket.section}</Pill>
      </div>

      <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 14 }}>
        {ticket.thread.map((m) => {
          const fromAdmin = m.from === "admin";
          return (
            <div
              key={m.id}
              style={{
                border: `1px solid ${C.line}`, borderRadius: 14, padding: 14,
                background: fromAdmin ? tint(C.royal, 9) : C.white,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <Avatar name={m.author} size={28} />
                <span style={{ fontWeight: 600, fontSize: 13.5, color: fromAdmin ? C.royal : C.ink }}>{m.author}</span>
                <span style={{ marginLeft: "auto", fontFamily: FM, fontSize: 11.5, color: C.inkMute }}>{m.when}</span>
              </div>
              <p style={{ margin: "10px 0 0", fontSize: 14, color: C.inkSoft, lineHeight: 1.6 }}>{m.body}</p>
            </div>
          );
        })}
      </div>

      <div style={{ fontFamily: FD, fontWeight: 600, fontSize: 15, marginTop: 22 }}>Your reply</div>
      <div style={{ marginTop: 10 }}>
        <TextArea
          rows={5}
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Students see this in the app and by email."
          aria-label="Reply to the student"
        />
      </div>
    </Drawer>
  );
}
