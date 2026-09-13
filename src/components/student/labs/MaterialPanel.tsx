"use client";

import React, { useCallback, useEffect, useState } from "react";
import { BookOpen, CheckCircle2, ChevronLeft, ChevronRight, Clock, FileText, Link2, Play, Target } from "lucide-react";
import { C, EDITOR, FB, FD, FM, goldGrad, inkGrad } from "../theme";
import { Card, Pill, ProgressBar } from "../ui";
import type { Resource, Week } from "./types";

const RESOURCE_ICON = { pdf: FileText, video: Play, link: Link2 } as const;

export function MaterialPanel({
  week,
  done,
  onComplete,
}: {
  week: Week;
  done: boolean;
  onComplete: () => void;
}) {
  const [i, setI] = useState(0);
  const slides = week.slides;
  const last = i === slides.length - 1;

  const go = useCallback(
    (delta: number) => setI((prev) => Math.min(slides.length - 1, Math.max(0, prev + delta))),
    [slides.length],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  if (!slides.length) {
    return (
      <Card style={{ padding: 24, color: C.inkMute, fontSize: 14.5 }}>
        Slides for this week have not been published yet.
      </Card>
    );
  }

  const slide = slides[i];

  return (
    <div className="as-material-split">
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Card style={{ padding: 0, overflow: "hidden", flex: 1, display: "flex", flexDirection: "column" }}>
          {/* slide */}
          <div style={{ background: inkGrad, color: "#fff", padding: "44px 32px 34px", minHeight: 320, flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, position: "absolute", top: 20, left: 32, right: 32 }}>
              <span style={{ fontFamily: FM, fontSize: 11.5, color: "#AEB6E0", letterSpacing: ".12em" }}>
                SLIDE {i + 1} / {slides.length}
              </span>
              <span style={{ flex: 1 }} />
              <span style={{ fontFamily: FM, fontSize: 11.5, color: "#AEB6E0" }}>WEEK {week.n}</span>
            </div>

            <div style={{ fontFamily: FD, fontWeight: 700, fontSize: 28, letterSpacing: "-.02em", marginTop: 14 }}>
              {slide.title}
            </div>

            <ul style={{ margin: "16px 0 0", paddingLeft: 20, color: "#D3D9F6", fontSize: 15, lineHeight: 1.75 }}>
              {slide.bullets.map((b) => (
                <li key={b} style={{ marginBottom: 4 }}>
                  {b}
                </li>
              ))}
            </ul>

            {slide.code && (
              <pre style={{ margin: "18px 0 0", background: EDITOR.surface, border: "1px solid rgba(255,255,255,.08)", borderRadius: 12, padding: 14, fontFamily: FM, fontSize: 12.5, lineHeight: 1.7, color: EDITOR.text, overflowX: "auto" }}>
                {slide.code.source}
              </pre>
            )}

            {slide.note && (
              <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,.1)", color: "#AEB6E0", fontSize: 13.5, display: "flex", gap: 9 }}>
                <Target size={16} style={{ flex: "none", marginTop: 2 }} />
                {slide.note}
              </div>
            )}
          </div>

          {/* deck controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 14, flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: 5, flex: 1, minWidth: 120 }}>
              {slides.map((s, k) => (
                <button
                  key={s.title}
                  onClick={() => setI(k)}
                  aria-label={`Slide ${k + 1}`}
                  style={{ width: 28, height: 6, borderRadius: 3, border: "none", padding: 0, cursor: "pointer", background: k <= i ? C.royal : C.line }}
                />
              ))}
            </div>
            <button
              onClick={() => go(-1)}
              disabled={i === 0}
              style={{ border: `1px solid ${C.line}`, background: C.white, borderRadius: 10, padding: "9px 13px", cursor: i === 0 ? "not-allowed" : "pointer", opacity: i === 0 ? 0.5 : 1, fontFamily: FB, fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}
            >
              <ChevronLeft size={16} /> Prev
            </button>
            {!last ? (
              <button
                onClick={() => go(1)}
                style={{ border: "none", background: C.royal, color: "#fff", borderRadius: 10, padding: "9px 16px", cursor: "pointer", fontFamily: FB, fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}
              >
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={onComplete}
                disabled={done}
                style={{ border: "none", background: done ? C.greenBg : goldGrad, color: done ? C.green : "#3A2A00", borderRadius: 10, padding: "9px 16px", cursor: done ? "default" : "pointer", fontFamily: FB, fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 7 }}
              >
                {done ? <><CheckCircle2 size={16} /> Marked as read</> : "Mark as read"}
              </button>
            )}
          </div>
        </Card>

        <div style={{ display: "flex", alignItems: "center", gap: 8, color: C.inkMute, fontSize: 12.5, fontFamily: FM }}>
          <span>← →</span> <span style={{ fontFamily: FB }}>arrow keys move through the deck</span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Card style={{ padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: FD, fontWeight: 600, fontSize: 15 }}>
            <Target size={17} color={C.royal} /> Learning outcomes
          </div>
          <ul style={{ margin: "10px 0 0", paddingLeft: 18, color: C.inkSoft, fontSize: 14, lineHeight: 1.7 }}>
            {week.objectives.map((o) => (
              <li key={o} style={{ marginBottom: 4 }}>
                {o}
              </li>
            ))}
          </ul>
          <div style={{ marginTop: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: C.inkMute, marginBottom: 6 }}>
              <span>Deck progress</span>
              <span style={{ fontFamily: FM }}>{i + 1}/{slides.length}</span>
            </div>
            <ProgressBar value={((i + 1) / slides.length) * 100} />
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
            <Pill><Clock size={11} style={{ display: "inline", marginRight: 4, verticalAlign: -1 }} />{week.readingMinutes} min read</Pill>
            <Pill><BookOpen size={11} style={{ display: "inline", marginRight: 4, verticalAlign: -1 }} />{slides.length} slides</Pill>
          </div>
        </Card>

        <Card style={{ padding: 18 }}>
          <div style={{ fontFamily: FD, fontWeight: 600, fontSize: 15 }}>Resources</div>
          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
            {week.resources.map((r) => (
              <ResourceRow key={r.label} resource={r} />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function ResourceRow({ resource }: { resource: Resource }) {
  const Icon = RESOURCE_ICON[resource.kind];
  return (
    <button
      type="button"
      style={{ display: "flex", alignItems: "center", gap: 11, width: "100%", textAlign: "left", border: `1px solid ${C.line}`, background: C.white, borderRadius: 12, padding: "11px 13px", cursor: "pointer" }}
    >
      <span style={{ width: 34, height: 34, flex: "none", borderRadius: 10, background: C.cream, color: C.royal, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={16} />
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 14, fontWeight: 500, color: C.ink }}>{resource.label}</span>
        <span style={{ display: "block", fontFamily: FM, fontSize: 11.5, color: C.inkMute, marginTop: 2 }}>{resource.meta}</span>
      </span>
      <ChevronRight size={16} color={C.inkMute} />
    </button>
  );
}
