/**
 * Colour tokens shared by the student app and the admin console.
 *
 * Every value is a CSS custom property defined in `palette.css`, so inline
 * styles follow light and dark without a re-render. Anything that needs a
 * translucent version of a token goes through `tint`, because hex-alpha
 * concatenation (`${color}18`) cannot wrap a CSS variable.
 */
const v = (name: string) => `var(--app-${name})`;

export const C = {
  royal: v("royal"), blue: v("blue"), sky: v("sky"), skyLt: v("sky-lt"),
  gold: v("gold"), goldDeep: v("gold-deep"), glow: v("glow"),
  cyan: v("cyan"), violet: v("violet"), amber: v("amber"),
  ink: v("ink"), inkSoft: v("ink-soft"), inkMute: v("ink-mute"),
  paper: v("paper"), cream: v("cream"), white: v("surface"), line: v("line"),
  green: v("green"), greenBg: v("green-bg"),
  red: v("red"), redBg: v("red-bg"),
  warn: v("warn"), warnBg: v("warn-bg"),
  /** Body text on a warning wash. */
  warnInk: v("warn-ink"),
  /** Row hover and selected-row wash. */
  hover: v("hover"),
  /** Translucent bar behind a sticky top bar. */
  glass: v("glass"),
  shadow: v("shadow"),
  scrim: v("scrim"),
} as const;

/** A translucent wash of any colour, token or hex. */
export function tint(color: string, percent: number) {
  return `color-mix(in srgb, ${color} ${percent}%, transparent)`;
}
