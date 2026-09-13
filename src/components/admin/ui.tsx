"use client";

import React, { useId, useState } from "react";
import { C, FB, FD, FM, FS, RISK, STATUS, tint, type RiskKey, type StatusKey } from "./theme";

/* ------------------------------------------------------------- primitives
   The same shapes as the student app's primitives, drawn with the admin's
   themed tokens so they follow light and dark. */

export function Card({
  children,
  style,
  className,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <div className={className} style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: 18, ...style }}>
      {children}
    </div>
  );
}

export function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: FM, fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", color: C.blue, fontWeight: 500 }}>
      {children}
    </div>
  );
}

export function H2({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <h2 style={{ fontFamily: FD, fontWeight: 700, fontSize: 28, letterSpacing: "-.02em", margin: "6px 0 0", color: C.ink, ...style }}>
      {children}
    </h2>
  );
}

export function Serif({ children }: { children: React.ReactNode }) {
  return <em style={{ fontFamily: FS, fontStyle: "italic", color: C.goldDeep }}>{children}</em>;
}

/** Small monospace chip used for tags, languages, difficulty and statuses. */
export function Pill({
  children,
  color = C.inkSoft,
  bg = C.cream,
  style,
}: {
  children: React.ReactNode;
  color?: string;
  bg?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span style={{ fontFamily: FM, fontSize: 11, padding: "4px 9px", borderRadius: 999, background: bg, color, fontWeight: 500, whiteSpace: "nowrap", ...style }}>
      {children}
    </span>
  );
}

export function ProgressBar({
  value,
  color = C.royal,
  height = 7,
  track = C.cream,
}: {
  value: number;
  color?: string;
  height?: number;
  track?: string;
}) {
  return (
    <div style={{ height, borderRadius: height, background: track, overflow: "hidden" }}>
      <div style={{ height, borderRadius: height, width: `${Math.max(0, Math.min(100, value))}%`, background: color, transition: "width .35s ease" }} />
    </div>
  );
}

/**
 * Group a number with commas.
 *
 * `toLocaleString` reads the runtime's locale, which differs between the Node
 * process that prerenders the page and the browser that hydrates it, so the
 * same figure can render two ways. Grouping by hand keeps them identical.
 */
export function num(value: number): string {
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/* ------------------------------------------------------------------ inputs */

export function Button({
  children,
  onClick,
  variant = "primary",
  disabled,
  icon: Icon,
  size = "md",
  title,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "quiet" | "danger";
  disabled?: boolean;
  icon?: React.ComponentType<{ size?: number }>;
  size?: "sm" | "md";
  title?: string;
}) {
  const skin = {
    primary: { background: "linear-gradient(120deg,#2430D8,#4DA3F5)", color: "#fff", border: "1px solid transparent" },
    ghost: { background: C.white, color: C.ink, border: `1px solid ${C.line}` },
    quiet: { background: "transparent", color: C.blue, border: "1px solid transparent" },
    danger: { background: C.redBg, color: C.red, border: `1px solid ${C.redBg}` },
  }[variant];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        ...skin,
        borderRadius: 11,
        padding: size === "sm" ? "7px 13px" : "10px 17px",
        fontFamily: FB,
        fontWeight: 600,
        fontSize: size === "sm" ? 13 : 14.5,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        whiteSpace: "nowrap",
      }}
    >
      {Icon && <Icon size={size === "sm" ? 14 : 16} />}
      {children}
    </button>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: "block" }}>
      <span style={{ display: "block", fontFamily: FM, fontSize: 11, letterSpacing: ".08em", color: C.inkMute, marginBottom: 6 }}>
        {label.toUpperCase()}
      </span>
      {children}
      {hint && <span style={{ display: "block", fontSize: 12.5, color: C.inkMute, marginTop: 5 }}>{hint}</span>}
    </label>
  );
}

const controlStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  border: `1px solid ${C.line}`,
  borderRadius: 11,
  padding: "10px 12px",
  fontFamily: FB,
  fontSize: 14,
  color: C.ink,
  background: C.white,
  outline: "none",
};

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} style={{ ...controlStyle, ...props.style }} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} style={{ ...controlStyle, resize: "vertical", lineHeight: 1.55, ...props.style }} />;
}

export function CodeArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      spellCheck={false}
      {...props}
      style={{
        ...controlStyle,
        background: "#101430",
        color: "#C4C9EC",
        border: "1px solid #1E2350",
        fontFamily: FM,
        fontSize: 13,
        lineHeight: 1.7,
        resize: "vertical",
        ...props.style,
      }}
    />
  );
}

export function Select({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  label: string;
}) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ ...controlStyle, width: "auto", minWidth: 132, cursor: "pointer", paddingRight: 30 }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div style={{ display: "inline-flex", gap: 6, flexWrap: "wrap" }}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            aria-pressed={active}
            style={{
              border: `1.5px solid ${active ? C.royal : C.line}`,
              background: active ? tint(C.royal, 10) : C.white,
              color: active ? C.royal : C.inkSoft,
              borderRadius: 999,
              padding: "8px 16px",
              cursor: "pointer",
              fontFamily: FB,
              fontWeight: 600,
              fontSize: 13.5,
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function Toggle({
  on,
  onChange,
  label,
  disabled,
}: {
  on: boolean;
  onChange: (on: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!on)}
      style={{
        width: 42, height: 24, borderRadius: 999, border: "none", padding: 3, flex: "none",
        background: on ? C.green : C.line, cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1, display: "flex", justifyContent: on ? "flex-end" : "flex-start",
      }}
    >
      <span style={{ width: 18, height: 18, borderRadius: 999, background: "#fff", display: "block", boxShadow: `0 1px 3px ${C.shadow}` }} />
    </button>
  );
}

/* ------------------------------------------------------------------ badges */

export function StatusPill({ status }: { status: StatusKey }) {
  const s = STATUS[status];
  return (
    <Pill color={s.fg} bg={s.bg} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      {status === "live" && <span style={{ width: 6, height: 6, borderRadius: 999, background: s.fg, display: "inline-block" }} />}
      {s.label}
    </Pill>
  );
}

export function RiskPill({ risk }: { risk: RiskKey }) {
  const r = RISK[risk];
  return (
    <Pill color={r.fg} bg={r.bg}>
      {r.label}
    </Pill>
  );
}

export function Avatar({ name, size = 36, fill }: { name: string; size?: number; fill?: string }) {
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("");
  return (
    <span
      aria-hidden
      style={{
        width: size, height: size, flex: "none", borderRadius: 999,
        background: fill ?? C.cream, color: fill ? "#fff" : C.inkSoft,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.36, fontWeight: 600, fontFamily: FB,
      }}
    >
      {initials}
    </span>
  );
}

export function StatTile({
  icon: Icon,
  label,
  value,
  sub,
  color = C.royal,
  bg = tint(C.royal, 12),
  onClick,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  value: string;
  sub: string;
  color?: string;
  bg?: string;
  onClick?: () => void;
}) {
  const body = (
    <>
      <div style={{ width: 40, height: 40, borderRadius: 11, background: bg, color, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
        <Icon size={20} />
      </div>
      <div style={{ fontFamily: FD, fontWeight: 700, fontSize: 24 }}>{value}</div>
      <div style={{ color: C.inkMute, fontSize: 13.5 }}>{label}</div>
      <div style={{ color, fontSize: 12.5, marginTop: 6, fontFamily: FM }}>{sub}</div>
    </>
  );

  return (
    <Card style={{ padding: 0 }} className={onClick ? "ad-card-lift" : undefined}>
      {onClick ? (
        <button onClick={onClick} style={{ all: "unset", cursor: "pointer", display: "block", width: "100%", padding: 18, boxSizing: "border-box" }}>
          {body}
        </button>
      ) : (
        <div style={{ padding: 18 }}>{body}</div>
      )}
    </Card>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div style={{ padding: "36px 24px", textAlign: "center" }}>
      <div style={{ fontFamily: FD, fontWeight: 600, fontSize: 16 }}>{title}</div>
      <p style={{ color: C.inkMute, fontSize: 14, marginTop: 6, maxWidth: 380, marginInline: "auto" }}>{body}</p>
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: React.ReactNode;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "16px 18px", borderBottom: `1px solid ${C.line}` }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: FD, fontWeight: 600, fontSize: 16 }}>{title}</div>
        {subtitle && <div style={{ color: C.inkMute, fontSize: 13, marginTop: 3 }}>{subtitle}</div>}
      </div>
      {action}
    </div>
  );
}

/* ------------------------------------------------------------- collapsible */

/**
 * A card whose body folds away behind its header. Controlled when `open` is
 * passed, so a link elsewhere in the console can expand it; otherwise it keeps
 * its own state.
 */
export function Collapsible({
  id,
  title,
  subtitle,
  icon: Icon,
  badge,
  open: controlledOpen,
  onToggle,
  defaultOpen = false,
  children,
}: {
  id?: string;
  title: string;
  subtitle?: string;
  icon?: React.ComponentType<{ size?: number }>;
  badge?: React.ReactNode;
  open?: boolean;
  onToggle?: (open: boolean) => void;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [localOpen, setLocalOpen] = useState(defaultOpen);
  const open = controlledOpen ?? localOpen;
  const bodyId = useId();

  function toggle() {
    const next = !open;
    if (controlledOpen === undefined) setLocalOpen(next);
    onToggle?.(next);
  }

  return (
    <Card style={{ padding: 0, overflow: "hidden" }}>
      <div id={id} style={{ scrollMarginTop: 80 }}>
        <button
          onClick={toggle}
          aria-expanded={open}
          aria-controls={bodyId}
          className="ad-row"
          style={{
            width: "100%", textAlign: "left", border: "none", background: C.white, cursor: "pointer",
            padding: "16px 18px", display: "flex", alignItems: "center", gap: 13,
            borderBottom: open ? `1px solid ${C.line}` : "none",
          }}
        >
          {Icon && (
            <span style={{ width: 38, height: 38, flex: "none", borderRadius: 11, background: tint(C.violet, 14), color: C.violet, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon size={18} />
            </span>
          )}
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
              <span style={{ fontFamily: FD, fontWeight: 600, fontSize: 16, color: C.ink }}>{title}</span>
              {badge}
            </span>
            {subtitle && <span style={{ display: "block", color: C.inkMute, fontSize: 13, marginTop: 3 }}>{subtitle}</span>}
          </span>
          <svg
            width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="2.2"
            strokeLinecap="round" strokeLinejoin="round" aria-hidden
            // SVG presentation attributes do not resolve CSS variables; style does.
            style={{ stroke: C.inkMute, flex: "none", transition: "transform .2s ease", transform: open ? "rotate(180deg)" : "none" }}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      </div>
      {/* Hidden rather than unmounted, so folding the section keeps whatever
          was typed inside it. */}
      <div id={bodyId} hidden={!open} style={{ background: C.paper }}>
        {children}
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ drawer */

export function Drawer({
  title,
  subtitle,
  onClose,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <>
      <div className="ad-scrim" style={{ display: "block", position: "fixed", inset: 0, zIndex: 62, background: C.scrim }} onClick={onClose} aria-hidden />
      <aside className="ad-drawer" role="dialog" aria-modal="true" aria-label={title}>
        <div style={{ padding: "18px 20px", borderBottom: `1px solid ${C.line}`, display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: FD, fontWeight: 700, fontSize: 19 }}>{title}</div>
            {subtitle && <div style={{ color: C.inkMute, fontSize: 13.5, marginTop: 3 }}>{subtitle}</div>}
          </div>
          <button onClick={onClose} aria-label="Close panel" style={{ border: `1px solid ${C.line}`, background: C.white, borderRadius: 10, width: 34, height: 34, cursor: "pointer", color: C.inkSoft, fontSize: 17, lineHeight: 1 }}>
            ×
          </button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>{children}</div>
        {footer && <div style={{ borderTop: `1px solid ${C.line}`, padding: "14px 20px", background: C.paper }}>{footer}</div>}
      </aside>
    </>
  );
}

/* ------------------------------------------------------------------ charts */

/**
 * A single-series column chart: one hue for magnitude, a 4px rounded top
 * anchored to the baseline, a 2px gap between bars, and a hover read-out. Only
 * the peak is labelled directly — a number on every column is noise.
 */
export function ColumnChart({
  data,
  color = C.royal,
  height = 168,
  valueLabel,
  marker,
}: {
  data: { label: string; value: number; caption?: string }[];
  color?: string;
  height?: number;
  valueLabel: (value: number) => string;
  /** Optional reference line, e.g. an exam cutoff. */
  marker?: { atIndex: number; label: string };
}) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(...data.map((d) => d.value), 1);
  const peak = data.reduce((best, d, i) => (d.value > data[best].value ? i : best), 0);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height, position: "relative" }}>
        {marker && (
          <div
            aria-hidden
            style={{
              position: "absolute", top: 0, bottom: 0,
              left: `calc(${(marker.atIndex / data.length) * 100}% - 1px)`,
              width: 2, background: C.line,
            }}
          />
        )}
        {data.map((d, i) => {
          const active = hover === i;
          const barHeight = Math.max(3, Math.round((d.value / max) * (height - 26)));
          return (
            <div
              key={`${d.label}-${i}`}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center", height: "100%", position: "relative" }}
            >
              {(active || i === peak) && (
                <span style={{ fontFamily: FM, fontSize: 11, color: active ? C.ink : C.inkMute, marginBottom: 4, whiteSpace: "nowrap" }}>
                  {valueLabel(d.value)}
                </span>
              )}
              <div
                className="ad-bar"
                style={{
                  width: "100%", height: barHeight, borderRadius: "4px 4px 0 0",
                  background: active ? color : tint(color, 82),
                  boxShadow: active ? `0 0 0 2px ${C.white}` : "none",
                }}
              />
              {active && d.caption && (
                <span
                  role="status"
                  style={{
                    position: "absolute", bottom: barHeight + 26, left: "50%", transform: "translateX(-50%)",
                    // Inverse of the surface, so the read-out stands out in either theme.
                    background: C.ink, color: C.white, borderRadius: 9, padding: "6px 10px",
                    fontSize: 12, whiteSpace: "nowrap", zIndex: 5, pointerEvents: "none",
                  }}
                >
                  {d.caption}
                </span>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 2, marginTop: 8, borderTop: `1px solid ${C.line}`, paddingTop: 7 }}>
        {data.map((d, i) => (
          <span
            key={`${d.label}-axis-${i}`}
            style={{ flex: 1, minWidth: 0, textAlign: "center", fontFamily: FM, fontSize: 10.5, color: hover === i ? C.ink : C.inkMute, overflow: "hidden", whiteSpace: "nowrap" }}
          >
            {d.label}
          </span>
        ))}
      </div>
      {marker && (
        <div style={{ fontFamily: FM, fontSize: 11, color: C.inkMute, marginTop: 6 }}>{marker.label}</div>
      )}
    </div>
  );
}

/** Labelled horizontal bars — the right form for ranking a handful of groups. */
export function BarList({
  rows,
  color = C.royal,
  suffix = "%",
  onPick,
}: {
  rows: { label: string; value: number; caption?: string }[];
  color?: string;
  suffix?: string;
  onPick?: (label: string) => void;
}) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
      {rows.map((r) => {
        const inner = (
          <>
            <span style={{ fontFamily: FM, fontSize: 12, color: C.inkSoft, width: 58, flex: "none", textAlign: "left" }}>{r.label}</span>
            <span style={{ flex: 1, minWidth: 0, height: 8, borderRadius: 999, background: C.cream, overflow: "hidden", display: "block" }}>
              <span className="ad-fill" style={{ display: "block", height: "100%", width: `${(r.value / max) * 100}%`, borderRadius: 999, background: color }} />
            </span>
            <span style={{ fontFamily: FM, fontSize: 12.5, color: C.ink, width: 46, flex: "none", textAlign: "right" }}>
              {r.value}
              {suffix}
            </span>
            {r.caption && <span className="ad-hide-sm" style={{ fontSize: 12, color: C.inkMute, width: 92, flex: "none", textAlign: "right" }}>{r.caption}</span>}
          </>
        );
        return onPick ? (
          <button key={r.label} onClick={() => onPick(r.label)} className="ad-row" style={{ display: "flex", alignItems: "center", gap: 12, border: "none", background: "transparent", padding: "3px 4px", borderRadius: 8, cursor: "pointer", textAlign: "left" }}>
            {inner}
          </button>
        ) : (
          <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "3px 4px" }}>
            {inner}
          </div>
        );
      })}
    </div>
  );
}

/** A compact ring for one percentage — used where a bar would be overkill. */
export function Donut({ value, color = C.royal, size = 92, caption }: { value: number; color?: string; size?: number; caption: string }) {
  const id = useId();
  const r = (size - 12) / 2;
  const circumference = 2 * Math.PI * r;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <svg width={size} height={size} role="img" aria-labelledby={id}>
        <title id={id}>{`${value}% — ${caption}`}</title>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={10} style={{ stroke: C.cream }} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={10} strokeLinecap="round" style={{ stroke: color }}
          strokeDasharray={`${(value / 100) * circumference} ${circumference}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fontFamily={FD} fontWeight={700} fontSize={size * 0.24} style={{ fill: C.ink }}>
          {value}%
        </text>
      </svg>
      <div style={{ fontSize: 13.5, color: C.inkSoft, maxWidth: 150 }}>{caption}</div>
    </div>
  );
}
