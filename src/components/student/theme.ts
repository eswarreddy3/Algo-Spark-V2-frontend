/**
 * Design tokens for the student app.
 *
 * Colours are the shared, themed tokens in ../theme (light and dark), the
 * same palette the admin console uses. The font stacks point at the
 * `next/font` variables declared in the root layout, so the student app never
 * loads a second copy of the type. Gradients and the editor surface are fixed:
 * they are dark in both themes.
 */
export { C, tint } from "../theme/tokens";

export const FD = "var(--font-sora), system-ui, sans-serif";
export const FB = "var(--font-instrument-sans), system-ui, sans-serif";
export const FM = "var(--font-jetbrains), ui-monospace, monospace";
export const FS = "var(--font-instrument-serif), Georgia, serif";

export const blueGrad = "linear-gradient(120deg,#2430D8,#4DA3F5)";
export const goldGrad = "linear-gradient(120deg,#F59E0B,#FBBF24)";
export const inkGrad = "linear-gradient(135deg,#101433,#1E2A6B)";

/** Editor / console surface — shared by every code and SQL pad. */
export const EDITOR = {
  chrome: "#141834",
  surface: "#101430",
  bar: "#181C3C",
  console: "#0B0E24",
  text: "#C4C9EC",
  dim: "#8E96C6",
  ok: "#5AD6B0",
  bad: "#FF8A8A",
} as const;
