"use client";

import { useSyncExternalStore } from "react";

/**
 * The current time, rounded to the minute. Reading `Date.now()` during render
 * makes the server and client renders disagree, so time comes from an external
 * store instead: the server snapshot is 0 ("unknown"), and the client ticks
 * every 30 seconds.
 */
const listeners = new Set<() => void>();
let timer: number | null = null;

function subscribe(cb: () => void) {
  listeners.add(cb);
  if (timer === null) {
    timer = window.setInterval(() => listeners.forEach((l) => l()), 30_000);
  }
  return () => {
    listeners.delete(cb);
    if (!listeners.size && timer !== null) {
      window.clearInterval(timer);
      timer = null;
    }
  };
}

const snapshot = () => Math.floor(Date.now() / 60_000) * 60_000;

export function useNow() {
  return useSyncExternalStore(subscribe, snapshot, () => 0);
}

const DAY = 86_400_000;

/** "Just now", "12 min ago", "3 h ago", "Yesterday", "4 days ago". */
export function relativeTime(at: number, now: number) {
  if (!now) return "";
  const diff = Math.max(0, now - at);
  if (diff < 60_000) return "Just now";
  if (diff < 3_600_000) return `${Math.round(diff / 60_000)} min ago`;
  if (diff < DAY) return `${Math.round(diff / 3_600_000)} h ago`;
  const days = Math.floor(diff / DAY);
  return days === 1 ? "Yesterday" : `${days} days ago`;
}

/** "2d 4h", "3h 10m", "25m" — for countdowns. */
export function formatSpan(ms: number) {
  const m = Math.max(0, Math.round(ms / 60_000));
  const d = Math.floor(m / 1440);
  const h = Math.floor((m % 1440) / 60);
  const min = m % 60;
  if (d) return `${d}d ${h}h`;
  if (h) return `${h}h ${min}m`;
  return `${min}m`;
}

/** Monday 00:00 of the week containing `now`, local time. */
export function startOfWeek(now: number) {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  const day = (d.getDay() + 6) % 7; // Monday = 0
  d.setDate(d.getDate() - day);
  return d.getTime();
}

export { DAY };
