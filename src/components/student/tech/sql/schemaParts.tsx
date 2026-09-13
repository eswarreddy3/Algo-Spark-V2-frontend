"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, Database, Eye, EyeOff, KeyRound, Link2, PanelRightClose, PanelRightOpen, Search, Table2, X } from "lucide-react";
import { C, FB, FD, FM, tint } from "../../theme";
import { PRACTICE_SCHEMA, type SqlTable } from "../../data/sqlSchema";

/* Schema building blocks shared by the Schema tab, the problem view and the playground. */

export function ColumnRow({ column, compact = false }: { column: SqlTable["columns"][number]; compact?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: compact ? "4px 8px" : "6px 8px", borderRadius: 7, fontFamily: FM, fontSize: compact ? 12 : 12.5 }}>
      <span style={{ width: 14, flex: "none", display: "flex" }}>
        {column.key === "PK" && <KeyRound size={13} color={C.goldDeep} aria-label="Primary key" />}
        {column.key === "FK" && <Link2 size={13} color={C.blue} aria-label="Foreign key" />}
      </span>
      <span style={{ minWidth: 0 }}>
        <span style={{ display: "block", color: C.ink, fontWeight: column.key === "PK" ? 600 : 400 }}>{column.name}</span>
        {column.references && !compact && <span style={{ display: "block", color: C.blue, fontSize: 11, marginTop: 1 }}>→ {column.references}</span>}
      </span>
      <span style={{ marginLeft: "auto", color: C.inkMute, fontSize: 11 }}>
        {column.type}
        {column.nullable ? "?" : ""}
      </span>
    </div>
  );
}

export function SampleTable({ table }: { table: SqlTable }) {
  return (
    <div style={{ overflowX: "auto", borderTop: `1px solid ${C.line}` }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr style={{ background: C.cream }}>
            {table.columns.map((c) => (
              <th key={c.name} style={{ textAlign: "left", padding: "7px 10px", fontFamily: FM, fontWeight: 500, color: C.inkSoft, whiteSpace: "nowrap" }}>{c.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.sample.map((row, r) => (
            <tr key={r} style={{ borderTop: `1px solid ${C.line}` }}>
              {row.map((cell, k) => (
                <td key={k} style={{ padding: "7px 10px", fontFamily: typeof cell === "number" ? FM : FB, whiteSpace: "nowrap", color: cell === null ? C.inkMute : C.ink }}>
                  {cell === null ? "NULL" : cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------------- resizable schema dock ---------------- */

const WIDTH_KEY = "algospark.sqlSchemaWidth";
const MIN_W = 220;
const MAX_W = 620;
const DEFAULT_W = 280;

/** Main content on the left, the schema docked on the right with a draggable, keyboard-adjustable divider. */
export function SchemaDock({ children, highlight }: { children: React.ReactNode; highlight: string[] }) {
  const [width, setWidth] = useState(DEFAULT_W);
  const [open, setOpen] = useState(true);
  const hostRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  useEffect(() => {
    try {
      const saved = Number(window.localStorage.getItem(WIDTH_KEY));
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrating from an external store
      if (saved >= MIN_W && saved <= MAX_W) setWidth(saved);
    } catch {
      /* default width is fine */
    }
  }, []);

  const commit = useCallback((w: number) => {
    const host = hostRef.current?.getBoundingClientRect().width ?? 1200;
    const next = Math.round(Math.min(Math.min(MAX_W, host * 0.55), Math.max(MIN_W, w)));
    setWidth(next);
    try {
      window.localStorage.setItem(WIDTH_KEY, String(next));
    } catch {
      /* width resets next visit */
    }
  }, []);

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    document.body.style.userSelect = "none";
  }
  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging.current || !hostRef.current) return;
    const right = hostRef.current.getBoundingClientRect().right;
    commit(right - e.clientX);
  }
  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    dragging.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
    document.body.style.userSelect = "";
  }
  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowLeft") { e.preventDefault(); commit(width + 24); }
    if (e.key === "ArrowRight") { e.preventDefault(); commit(width - 24); }
    if (e.key === "Home") { e.preventDefault(); commit(MAX_W); }
    if (e.key === "End") { e.preventDefault(); commit(MIN_W); }
  }

  return (
    <div
      ref={hostRef}
      className="as-sql-dock"
      data-open={open}
      style={{ ["--schema-w" as string]: `${width}px` } as React.CSSProperties}
    >
      <div className="as-sql-main">{children}</div>

      {open ? (
        <>
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize schema panel"
            aria-valuenow={width}
            aria-valuemin={MIN_W}
            aria-valuemax={MAX_W}
            tabIndex={0}
            className="as-sql-handle"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onKeyDown={onKeyDown}
            onDoubleClick={() => commit(DEFAULT_W)}
            title="Drag to resize · double-click to reset"
          >
            <span />
          </div>
          <SchemaPanel highlight={highlight} onClose={() => setOpen(false)} />
        </>
      ) : (
        <button onClick={() => setOpen(true)} className="as-sql-reopen" aria-label="Show schema">
          <PanelRightOpen size={16} />
          <span style={{ writingMode: "vertical-rl", fontFamily: FM, fontSize: 11.5, letterSpacing: ".1em" }}>SCHEMA</span>
        </button>
      )}
    </div>
  );
}

function SchemaPanel({ highlight, onClose }: { highlight: string[]; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState<string[]>(() =>
    highlight.length ? PRACTICE_SCHEMA.map((t) => t.name).filter((n) => !highlight.includes(n)) : [],
  );
  const [sample, setSample] = useState<string | null>(null);
  const q = query.trim().toLowerCase();
  const tables = PRACTICE_SCHEMA.filter((t) => !q || t.name.includes(q) || t.columns.some((c) => c.name.includes(q)));

  return (
    <aside className="as-sql-panel" aria-label="Database schema">
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 12px 10px", borderBottom: `1px solid ${C.line}` }}>
        <Database size={15} color={C.cyan} />
        <span style={{ fontFamily: FD, fontWeight: 600, fontSize: 14.5 }}>Schema</span>
        <span style={{ fontFamily: FM, fontSize: 11, color: C.inkMute }}>{PRACTICE_SCHEMA.length} tables</span>
        <button onClick={onClose} aria-label="Hide schema" title="Hide schema" style={{ marginLeft: "auto", border: "none", background: "none", cursor: "pointer", color: C.inkMute, display: "flex", padding: 4 }}>
          <PanelRightClose size={16} />
        </button>
      </div>
      <div style={{ padding: "10px 12px" }}>
        <label style={{ display: "flex", alignItems: "center", gap: 7, border: `1px solid ${C.line}`, borderRadius: 9, padding: "6px 9px" }}>
          <Search size={13} color={C.inkMute} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find table or column"
            aria-label="Find table or column"
            style={{ flex: 1, minWidth: 0, border: "none", outline: "none", background: "transparent", fontFamily: FB, fontSize: 13, color: C.ink }}
          />
          {query && (
            <button onClick={() => setQuery("")} aria-label="Clear" style={{ border: "none", background: "none", cursor: "pointer", color: C.inkMute, display: "flex" }}>
              <X size={13} />
            </button>
          )}
        </label>
      </div>

      <div style={{ overflowY: "auto", flex: 1, padding: "0 6px 10px" }}>
        {tables.map((t) => {
          const isOpen = q ? true : !collapsed.includes(t.name);
          const used = highlight.includes(t.name);
          return (
            <div key={t.name} style={{ marginBottom: 4 }}>
              <button
                onClick={() => setCollapsed((c) => (isOpen ? [...c, t.name] : c.filter((n) => n !== t.name)))}
                aria-expanded={isOpen}
                style={{ width: "100%", border: "none", background: used ? tint(C.royal, 8) : "transparent", borderRadius: 8, cursor: "pointer", padding: "7px 8px", display: "flex", alignItems: "center", gap: 7, textAlign: "left" }}
              >
                <ChevronDown size={13} color={C.inkMute} style={{ transform: isOpen ? "none" : "rotate(-90deg)", transition: "transform .15s" }} />
                <Table2 size={13} color={used ? C.royal : C.inkMute} />
                <span style={{ fontFamily: FM, fontSize: 12.5, fontWeight: 600, color: used ? C.royal : C.ink }}>{t.name}</span>
                <span style={{ marginLeft: "auto", fontFamily: FM, fontSize: 10.5, color: C.inkMute }}>{t.rowCount}</span>
              </button>
              {isOpen && (
                <div style={{ paddingLeft: 14 }}>
                  {t.columns
                    .filter((c) => !q || t.name.includes(q) || c.name.includes(q))
                    .map((c) => (
                      <ColumnRow key={c.name} column={c} compact />
                    ))}
                  <button
                    onClick={() => setSample(sample === t.name ? null : t.name)}
                    style={{ border: "none", background: "none", cursor: "pointer", color: C.blue, fontFamily: FB, fontSize: 12, fontWeight: 600, padding: "4px 8px", display: "flex", alignItems: "center", gap: 5 }}
                  >
                    {sample === t.name ? <EyeOff size={12} /> : <Eye size={12} />} {sample === t.name ? "Hide rows" : "Sample rows"}
                  </button>
                  {sample === t.name && (
                    <div style={{ border: `1px solid ${C.line}`, borderRadius: 8, overflow: "hidden", margin: "2px 6px 6px 0" }}>
                      <SampleTable table={t} />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}

/** Tables a problem's starter mentions, so the dock opens on the relevant ones. */
export function tablesIn(source: string) {
  return PRACTICE_SCHEMA.map((t) => t.name).filter((name) => new RegExp(`\\b${name}\\s*\\(`).test(source));
}

