"use client";

import { useCallback, useSyncExternalStore } from "react";

export type ThemeChoice = "light" | "dark";

/**
 * The viewer's theme, shared by the student app and the admin console so a
 * choice made in one carries to the other.
 *
 * `choice` is what they picked, or null when they have not picked and the
 * console follows the operating system. `resolved` is what is on screen. Both
 * read from external sources — localStorage and the colour-scheme media query —
 * through `useSyncExternalStore`, so the server render and hydration agree and
 * nothing is set from an effect.
 */

const KEY = "algospark.theme";
const EVENT = "algospark:theme";
const QUERY = "(prefers-color-scheme: dark)";

/** Fallback when storage is blocked, so the toggle still works for the tab. */
let memoryChoice: ThemeChoice | null = null;

function readChoice(): ThemeChoice | null {
  try {
    const value = window.localStorage.getItem(KEY);
    if (value === "light" || value === "dark") return value;
  } catch {
    // Storage can be blocked (private mode, site-data settings).
  }
  return memoryChoice;
}

function subscribeChoice(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(EVENT, onChange);
  };
}

function subscribeSystem(onChange: () => void) {
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

export function useTheme() {
  const choice = useSyncExternalStore(subscribeChoice, readChoice, () => null);
  const systemDark = useSyncExternalStore(subscribeSystem, () => window.matchMedia(QUERY).matches, () => false);
  const resolved: ThemeChoice = choice ?? (systemDark ? "dark" : "light");

  const setTheme = useCallback((next: ThemeChoice) => {
    memoryChoice = next;
    try {
      window.localStorage.setItem(KEY, next);
    } catch {
      // Not persisted; memoryChoice still switches this tab.
    }
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return { choice, resolved, setTheme };
}
