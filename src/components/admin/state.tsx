"use client";

/**
 * Everything the admin can change during a session.
 *
 * The console is read-mostly, but four actions have to stick as you navigate:
 * publishing a lab week, adding a question to the bank, replying to a ticket
 * and running a report. They live here rather than in each page so the header
 * counters and the pages agree.
 */
import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { ADMIN_LABS } from "./data/labs";
import { EMPTY_DRAFT, QUESTION_BANK, type BankItem, type QuestionDraft } from "./data/authoring";
import { TICKETS, type Ticket, type TicketStatus } from "./data/tickets";
import { REPORT_HISTORY, type PastReport } from "./data/reports";

export type Toast = { title: string; sub: string; tone: "info" | "good" | "warn" };

type AdminState = {
  publishedThrough: Record<string, number>;
  publishThrough: (labId: string, week: number) => void;
  bank: BankItem[];
  addQuestion: (item: BankItem) => void;
  /** The question being written, kept across navigation and collapsing. */
  draft: QuestionDraft;
  setDraft: React.Dispatch<React.SetStateAction<QuestionDraft>>;
  tickets: Ticket[];
  replyToTicket: (ticketId: string, body: string) => void;
  setTicketStatus: (ticketId: string, status: TicketStatus) => void;
  reports: PastReport[];
  addReport: (report: PastReport) => void;
  /** Students who have been sent a nudge this session. */
  nudged: string[];
  nudge: (studentIds: string[]) => void;
  notify: (toast: Toast) => void;
};

const StateContext = createContext<AdminState | null>(null);

const INITIAL_PUBLISHED = Object.fromEntries(ADMIN_LABS.map((l) => [l.id, l.publishedThrough]));

export function AdminStateProvider({
  onToast,
  children,
}: {
  onToast: (toast: Toast) => void;
  children: React.ReactNode;
}) {
  const [publishedThrough, setPublishedThrough] = useState<Record<string, number>>(INITIAL_PUBLISHED);
  const [bank, setBank] = useState<BankItem[]>(QUESTION_BANK);
  const [draft, setDraft] = useState<QuestionDraft>(EMPTY_DRAFT);
  const [tickets, setTickets] = useState<Ticket[]>(TICKETS);
  const [reports, setReports] = useState<PastReport[]>(REPORT_HISTORY);
  const [nudged, setNudged] = useState<string[]>([]);

  const publishThrough = useCallback((labId: string, week: number) => {
    setPublishedThrough((prev) => ({ ...prev, [labId]: week }));
  }, []);

  const addQuestion = useCallback((item: BankItem) => {
    setBank((prev) => [item, ...prev]);
  }, []);

  const replyToTicket = useCallback((ticketId: string, body: string) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              status: "pending" as TicketStatus,
              thread: [
                ...t.thread,
                { id: `m${t.thread.length + 1}`, from: "admin" as const, author: "Dr. Latha Nair", when: "Just now", body },
              ],
            }
          : t,
      ),
    );
  }, []);

  const setTicketStatus = useCallback((ticketId: string, status: TicketStatus) => {
    setTickets((prev) => prev.map((t) => (t.id === ticketId ? { ...t, status } : t)));
  }, []);

  const addReport = useCallback((report: PastReport) => {
    setReports((prev) => [report, ...prev]);
  }, []);

  const nudge = useCallback((studentIds: string[]) => {
    setNudged((prev) => Array.from(new Set([...prev, ...studentIds])));
  }, []);

  const value = useMemo<AdminState>(
    () => ({
      publishedThrough, publishThrough,
      bank, addQuestion,
      draft, setDraft,
      tickets, replyToTicket, setTicketStatus,
      reports, addReport,
      nudged, nudge,
      notify: onToast,
    }),
    [publishedThrough, publishThrough, bank, addQuestion, draft, tickets, replyToTicket, setTicketStatus, reports, addReport, nudged, nudge, onToast],
  );

  return <StateContext.Provider value={value}>{children}</StateContext.Provider>;
}

export function useAdminState() {
  const ctx = useContext(StateContext);
  if (!ctx) throw new Error("useAdminState must be used inside <AdminStateProvider>");
  return ctx;
}
