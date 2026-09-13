"use client";

import { useSyncExternalStore } from "react";

/**
 * Client-side mock auth. There is no backend yet, so the session lives in
 * localStorage and is validated against the demo accounts below. Swap
 * `signIn` / `signOut` for real API calls when the backend lands.
 */

export type Role = "student" | "admin";

export type Session = {
  role: Role;
  email: string;
  name: string;
};

export const DEMO_ACCOUNTS: Record<Role, { email: string; password: string; name: string }> = {
  student: { email: "student@algospark.in", password: "student123", name: "Aditya Kumar" },
  admin: { email: "admin@algospark.in", password: "admin123", name: "Dr. Latha Nair" },
};

export const ROLE_HOME: Record<Role, string> = {
  student: "/student",
  admin: "/admin",
};

const KEY = "algospark.session";
const EVENT = "algospark:auth";

function read(): string | null {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function parse(raw: string | null): Session | null {
  if (!raw) return null;
  try {
    const s = JSON.parse(raw) as Session;
    return s && (s.role === "student" || s.role === "admin") ? s : null;
  } catch {
    return null;
  }
}

export function signIn(role: Role, email: string, password: string): Session | string {
  const account = DEMO_ACCOUNTS[role];
  if (email.trim().toLowerCase() !== account.email || password !== account.password) {
    return "Invalid email or password for this account type.";
  }
  const session: Session = { role, email: account.email, name: account.name };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(session));
  } catch {
    return "Your browser blocked storage, so we couldn't keep you signed in.";
  }
  window.dispatchEvent(new Event(EVENT));
  return session;
}

export function signOut() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb); // sign-in/out in other tabs
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

/**
 * Current session. `undefined` during SSR / before hydration (unknown),
 * `null` when signed out.
 */
export function useSession(): Session | null | undefined {
  const raw = useSyncExternalStore(subscribe, read, () => undefined);
  return raw === undefined ? undefined : parse(raw);
}
