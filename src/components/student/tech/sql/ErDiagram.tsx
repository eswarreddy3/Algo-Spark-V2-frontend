"use client";

import React, { useMemo, useState } from "react";
import { KeyRound, Link2, Maximize2, ZoomIn, ZoomOut } from "lucide-react";
import { C, FB, FD, FM, tint } from "../../theme";
import { Card } from "../../ui";
import { PRACTICE_SCHEMA, type SqlTable } from "../../data/sqlSchema";

/* Geometry, in diagram units. Table positions come from `SqlTable.er`. */
const BOX_W = 230;
const HEAD_H = 40;
const ROW_H = 26;
const PAD = 24;

const boxHeight = (t: SqlTable) => HEAD_H + t.columns.length * ROW_H + 8;
const rowY = (t: SqlTable, column: string) =>
  t.er.y + HEAD_H + t.columns.findIndex((c) => c.name === column) * ROW_H + ROW_H / 2;

type Edge = { id: string; from: SqlTable; fromCol: string; to: SqlTable; toCol: string };

function edgesOf(schema: SqlTable[]): Edge[] {
  const byName = new Map(schema.map((t) => [t.name, t]));
  return schema.flatMap((t) =>
    t.columns
      .filter((c) => c.references)
      .map((c) => {
        const [table, col] = (c.references as string).split(".");
        return { id: `${t.name}.${c.name}`, from: t, fromCol: c.name, to: byName.get(table) as SqlTable, toCol: col };
      })
      .filter((e) => e.to),
  );
}

/**
 * Orthogonal connector from the foreign-key row to the primary-key row, with
 * crow's-foot notation: a fork on the many side, a bar on the one side.
 */
function connector(e: Edge, offset: number) {
  const sy = rowY(e.from, e.fromCol);
  const ty = rowY(e.to, e.toCol);
  const fromLeftOfTarget = e.from.er.x + BOX_W <= e.to.er.x;
  const toLeftOfSource = e.to.er.x + BOX_W <= e.from.er.x;

  let sx: number, tx: number, sDir: number, tDir: number, path: string;
  if (toLeftOfSource || fromLeftOfTarget) {
    sx = toLeftOfSource ? e.from.er.x : e.from.er.x + BOX_W;
    tx = toLeftOfSource ? e.to.er.x + BOX_W : e.to.er.x;
    sDir = toLeftOfSource ? -1 : 1;
    tDir = -sDir;
    const mid = (sx + tx) / 2 + offset;
    path = `M ${sx} ${sy} H ${mid} V ${ty} H ${tx}`;
  } else {
    // Stacked in the same column: loop out on the right-hand side.
    sx = e.from.er.x + BOX_W;
    tx = e.to.er.x + BOX_W;
    sDir = 1;
    tDir = 1;
    const out = Math.max(sx, tx) + 36 + offset;
    path = `M ${sx} ${sy} H ${out} V ${ty} H ${tx}`;
  }

  // Crow's foot at the source (many), a double bar at the target (one).
  const f = 12 * sDir;
  const many = `M ${sx + f} ${sy} L ${sx} ${sy - 7} M ${sx + f} ${sy} L ${sx} ${sy} M ${sx + f} ${sy} L ${sx} ${sy + 7}`;
  const b1 = tx + 8 * tDir;
  const b2 = tx + 13 * tDir;
  const one = `M ${b1} ${ty - 7} V ${ty + 7} M ${b2} ${ty - 7} V ${ty + 7}`;
  return { path, many, one, label: { x: (sx + tx) / 2, y: (sy + ty) / 2 } };
}

/** Entity–relationship diagram of the practice database. */
export function ErDiagram({ schema = PRACTICE_SCHEMA }: { schema?: SqlTable[] }) {
  const [zoom, setZoom] = useState(1);
  const [focus, setFocus] = useState<string | null>(null);
  const edges = useMemo(() => edgesOf(schema), [schema]);
  // Connectors crossing the same gap between columns get their own vertical channel, so they never overlap.
  const offsets = useMemo(() => {
    const gap = (e: Edge) => `${Math.min(e.from.er.x, e.to.er.x)}-${Math.max(e.from.er.x, e.to.er.x)}`;
    const groups = new Map<string, Edge[]>();
    edges.forEach((e) => groups.set(gap(e), [...(groups.get(gap(e)) ?? []), e]));
    const out = new Map<string, number>();
    groups.forEach((list) => list.forEach((e, i) => out.set(e.id, (i - (list.length - 1) / 2) * 16)));
    return out;
  }, [edges]);

  const width = Math.max(...schema.map((t) => t.er.x + BOX_W)) + PAD * 2 + 40;
  const height = Math.max(...schema.map((t) => t.er.y + boxHeight(t))) + PAD * 2;
  const related = (e: Edge) => !focus || e.from.name === focus || e.to.name === focus;
  const tableRelated = (t: SqlTable) =>
    !focus || t.name === focus || edges.some((e) => (e.from.name === focus && e.to === t) || (e.to.name === focus && e.from === t));

  return (
    <Card style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderBottom: `1px solid ${C.line}`, flexWrap: "wrap" }}>
        <span style={{ fontFamily: FD, fontWeight: 600, fontSize: 16 }}>ER diagram</span>
        <span style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: FM, fontSize: 11.5, color: C.inkMute, flexWrap: "wrap" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}><KeyRound size={12} color={C.goldDeep} /> primary key</span>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Link2 size={12} color={C.blue} /> foreign key</span>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <svg width="30" height="14" aria-hidden><path d="M2 7 H28 M16 7 L28 1 M16 7 L28 13 M6 1 V13" style={{ stroke: C.inkMute, fill: "none", strokeWidth: 1.4 }} /></svg>
            one → many
          </span>
        </span>
        <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
          <ToolButton label="Zoom out" onClick={() => setZoom((z) => Math.max(0.6, +(z - 0.1).toFixed(2)))}><ZoomOut size={14} /></ToolButton>
          <span style={{ fontFamily: FM, fontSize: 12, color: C.inkMute, width: 42, textAlign: "center" }}>{Math.round(zoom * 100)}%</span>
          <ToolButton label="Zoom in" onClick={() => setZoom((z) => Math.min(1.5, +(z + 0.1).toFixed(2)))}><ZoomIn size={14} /></ToolButton>
          <ToolButton label="Reset zoom" onClick={() => setZoom(1)}><Maximize2 size={14} /></ToolButton>
        </span>
      </div>

      <div
        style={{
          overflow: "auto", maxHeight: 620,
          backgroundColor: C.paper,
          backgroundImage: `radial-gradient(${tint(C.inkMute, 22)} 1px, transparent 1px)`,
          backgroundSize: "18px 18px",
        }}
      >
        <div style={{ width: width * zoom, height: height * zoom, margin: "0 auto" }}>
          <div style={{ position: "relative", width, height, transform: `scale(${zoom})`, transformOrigin: "0 0" }}>
            <svg width={width} height={height} style={{ position: "absolute", inset: 0, overflow: "visible" }} aria-hidden>
              <g transform={`translate(${PAD} ${PAD})`}>
                {edges.map((e) => {
                  const c = connector(e, offsets.get(e.id) ?? 0);
                  const on = related(e);
                  const stroke = { stroke: focus && on ? C.royal : C.inkMute, fill: "none", strokeWidth: focus && on ? 2 : 1.4, opacity: on ? 1 : 0.18, transition: "opacity .15s" };
                  return (
                    <g key={e.id}>
                      <path d={c.path} style={stroke} />
                      <path d={c.many} style={stroke} />
                      <path d={c.one} style={stroke} />
                    </g>
                  );
                })}
              </g>
            </svg>

            {schema.map((t) => {
              const dim = !tableRelated(t);
              return (
                <div
                  key={t.name}
                  onMouseEnter={() => setFocus(t.name)}
                  onMouseLeave={() => setFocus(null)}
                  onFocus={() => setFocus(t.name)}
                  onBlur={() => setFocus(null)}
                  tabIndex={0}
                  aria-label={`${t.name} table, ${t.columns.length} columns`}
                  style={{
                    position: "absolute", left: t.er.x + PAD, top: t.er.y + PAD, width: BOX_W, height: boxHeight(t),
                    background: C.white, border: `1.5px solid ${focus === t.name ? C.royal : C.line}`, borderRadius: 12,
                    boxShadow: `0 6px 18px ${C.shadow}`, overflow: "hidden", opacity: dim ? 0.35 : 1,
                    transition: "opacity .15s, border-color .15s", outline: "none",
                  }}
                >
                  <div style={{ height: HEAD_H, display: "flex", alignItems: "center", gap: 8, padding: "0 12px", background: tint(C.royal, focus === t.name ? 14 : 8), borderBottom: `1px solid ${C.line}` }}>
                    <span style={{ fontFamily: FM, fontWeight: 700, fontSize: 13.5, color: C.ink }}>{t.name}</span>
                    <span style={{ marginLeft: "auto", fontFamily: FM, fontSize: 10.5, color: C.inkMute }}>{t.rowCount.toLocaleString()} rows</span>
                  </div>
                  {t.columns.map((col) => (
                    <div key={col.name} style={{ height: ROW_H, display: "flex", alignItems: "center", gap: 7, padding: "0 12px", fontFamily: FM, fontSize: 12 }}>
                      <span style={{ width: 13, display: "flex" }}>
                        {col.key === "PK" && <KeyRound size={12} color={C.goldDeep} />}
                        {col.key === "FK" && <Link2 size={12} color={C.blue} />}
                      </span>
                      <span style={{ color: C.ink, fontWeight: col.key === "PK" ? 700 : 400, textDecoration: col.key === "PK" ? "underline" : "none", textUnderlineOffset: 3 }}>{col.name}</span>
                      <span style={{ marginLeft: "auto", color: C.inkMute, fontSize: 10.5 }}>{col.type.toLowerCase()}{col.nullable ? "?" : ""}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ padding: "10px 16px", borderTop: `1px solid ${C.line}`, display: "flex", gap: 16, flexWrap: "wrap", fontFamily: FB, fontSize: 13, color: C.inkSoft }}>
        {edges.map((e) => (
          <span key={e.id} style={{ fontFamily: FM, fontSize: 11.5 }}>
            {e.from.name}.{e.fromCol} <span style={{ color: C.inkMute }}>→</span> {e.to.name}.{e.toCol}
          </span>
        ))}
      </div>
    </Card>
  );
}

function ToolButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      style={{ border: `1px solid ${C.line}`, background: C.white, color: C.inkSoft, borderRadius: 8, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
    >
      {children}
    </button>
  );
}
