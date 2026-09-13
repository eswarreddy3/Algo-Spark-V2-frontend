/**
 * Design tokens for the college admin app.
 *
 * Colours are the shared, themed tokens in ../theme; this module adds the
 * status and risk scales only the admin console needs. Fonts and gradients
 * carry no theme and come from the student app.
 */
export { FD, FB, FM, FS, blueGrad, goldGrad, inkGrad, EDITOR } from "../student/theme";

export { C, tint } from "../theme/tokens";
import { C, tint } from "../theme/tokens";

/** Status colours for anything that is scheduled, live, closed or blocked. */
export const STATUS = {
  live: { fg: C.green, bg: C.greenBg, label: "Live" },
  scheduled: { fg: C.blue, bg: tint(C.blue, 12), label: "Scheduled" },
  draft: { fg: C.inkMute, bg: C.cream, label: "Draft" },
  closed: { fg: C.inkSoft, bg: C.cream, label: "Closed" },
  overdue: { fg: C.red, bg: C.redBg, label: "Overdue" },
} as const;

export type StatusKey = keyof typeof STATUS;

/** Risk bands for a student's engagement, worst first. */
export const RISK = {
  critical: { fg: C.red, bg: C.redBg, label: "Critical" },
  atRisk: { fg: C.warn, bg: C.warnBg, label: "At risk" },
  watch: { fg: C.violet, bg: tint(C.violet, 14), label: "Watch" },
  healthy: { fg: C.green, bg: C.greenBg, label: "On track" },
} as const;

export type RiskKey = keyof typeof RISK;

/** Chart series colours, in the order a cohort chart should consume them. */
export const SERIES = [C.royal, C.cyan, C.violet, C.goldDeep, C.sky, C.green] as const;
