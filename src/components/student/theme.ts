/**
 * Design tokens for the student app.
 *
 * Colours mirror the marketing site's CSS variables in `globals.css`; the font
 * stacks point at the `next/font` variables declared in the root layout, so the
 * student app never loads a second copy of the type.
 */
export const C = {
  royal: "#2430D8", blue: "#2F5BF0", sky: "#4DA3F5", skyLt: "#7FC0FA",
  gold: "#FBBF24", goldDeep: "#F59E0B", glow: "#FF8A00",
  cyan: "#1EC8DC", violet: "#8B7CE8", amber: "#F5B838",
  ink: "#101433", inkSoft: "#3F456B", inkMute: "#767CA0",
  paper: "#F6F8FD", cream: "#F1F4FB", white: "#fff", line: "#E7EBF6",
  green: "#12B886", greenBg: "#E4F7EF",
  red: "#E5484D", redBg: "#FDECEC",
} as const;

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
