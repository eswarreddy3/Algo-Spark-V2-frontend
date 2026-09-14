"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  BookOpen, CheckCircle2, ChevronLeft, ChevronRight, Clock, Download, FileText, Link2, Lock, Play,
  Presentation, Target,
} from "lucide-react";
import { C, EDITOR, FB, FD, FM, goldGrad, inkGrad } from "../theme";
import { Card, Pill, ProgressBar } from "../ui";
import { FORMAT_LABEL, type Topic, type MaterialFormat } from "../data/courses";
import type { Resource, Slide } from "../labs/types";

export const FORMAT_ICON: Record<MaterialFormat, typeof FileText> = { ppt: Presentation };
const RESOURCE_ICON = { pdf: FileText, video: Play, link: Link2 } as const;

/** Topic material in its authored format, with outcomes and resources alongside. */
export function MaterialViewer({ topic, done, onComplete }: { topic: Topic; done: boolean; onComplete: () => void }) {
  const { format, slides } = topic.material;
  // The student has to reach the end of the material before marking it read.
  const [reachedEnd, setReachedEnd] = useState(done || slides.length <= 1);
  const onEnd = useCallback(() => setReachedEnd(true), []);

  if (!slides.length) {
    return <Card style={{ padding: 24, color: C.inkMute, fontSize: 14.5 }}>The PPT for this topic hasn’t been added yet.</Card>;
  }

  const markButton = (
    <button
      onClick={onComplete}
      disabled={done || !reachedEnd}
      title={!reachedEnd ? "Reach the end of the material first" : undefined}
      style={{
        border: "none", borderRadius: 10, padding: "9px 16px", fontFamily: FB, fontWeight: 600, fontSize: 14,
        display: "flex", alignItems: "center", gap: 7,
        background: done ? C.greenBg : reachedEnd ? goldGrad : C.line,
        color: done ? C.green : reachedEnd ? "#3A2A00" : C.inkMute,
        cursor: done ? "default" : reachedEnd ? "pointer" : "not-allowed",
      }}
    >
      {done ? <><CheckCircle2 size={16} /> PPT viewed</> : reachedEnd ? "Mark PPT as viewed" : <><Lock size={14} /> Mark PPT as viewed</>}
    </button>
  );

  return (
    <div className="as-material-split">
      <div style={{ minWidth: 0 }}>
        <PptDeck slides={slides} onEnd={onEnd} action={markButton} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Card style={{ padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: FD, fontWeight: 600, fontSize: 15 }}>
            <Target size={17} color={C.royal} /> Learning outcomes
          </div>
          <ul style={{ margin: "10px 0 0", paddingLeft: 18, color: C.inkSoft, fontSize: 14, lineHeight: 1.7 }}>
            {topic.objectives.map((o) => (
              <li key={o} style={{ marginBottom: 4 }}>{o}</li>
            ))}
          </ul>
          <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
            <Pill><FormatIcon format={format} /> {FORMAT_LABEL[format]}</Pill>
            <Pill><Clock size={11} style={{ display: "inline", marginRight: 4, verticalAlign: -1 }} />{topic.minutes} min</Pill>
            <Pill><BookOpen size={11} style={{ display: "inline", marginRight: 4, verticalAlign: -1 }} />{slides.length} slides</Pill>
          </div>
        </Card>

        {topic.material.resources.length > 0 && (
          <Card style={{ padding: 18 }}>
            <div style={{ fontFamily: FD, fontWeight: 600, fontSize: 15 }}>Resources</div>
            <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
              {topic.material.resources.map((r) => (
                <ResourceRow key={r.label} resource={r} />
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

function FormatIcon({ format }: { format: MaterialFormat }) {
  const Icon = FORMAT_ICON[format];
  return <Icon size={11} style={{ display: "inline", marginRight: 4, verticalAlign: -1 }} />;
}

/** Keyboard paging shared by the deck and the PDF. */
function usePager(count: number, onEnd: () => void) {
  const [i, setI] = useState(0);
  const go = useCallback((delta: number) => setI((prev) => Math.min(count - 1, Math.max(0, prev + delta))), [count]);

  useEffect(() => {
    if (i === count - 1) onEnd();
  }, [i, count, onEnd]);

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

  return { i, setI, go };
}

function PagerButtons({ i, count, go, action }: { i: number; count: number; go: (d: number) => void; action: React.ReactNode }) {
  const last = i === count - 1;
  return (
    <>
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
        action
      )}
    </>
  );
}

function ViewerBar({ icon: Icon, name, children }: { icon: typeof FileText; name: string; children?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderBottom: `1px solid ${C.line}`, background: C.cream, flexWrap: "wrap" }}>
      <Icon size={15} color={C.royal} />
      <span style={{ fontFamily: FM, fontSize: 12.5, color: C.inkSoft, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
      <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
        {children}
        <button type="button" title="Download" style={iconButton}>
          <Download size={14} />
        </button>
      </span>
    </div>
  );
}

const iconButton: React.CSSProperties = {
  border: `1px solid ${C.line}`, background: C.white, color: C.inkSoft, borderRadius: 8, width: 30, height: 30,
  display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
};

const slug = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/* ---------------- PPT ---------------- */

function PptDeck({ slides, onEnd, action }: { slides: Slide[]; onEnd: () => void; action: React.ReactNode }) {
  const { i, setI, go } = usePager(slides.length, onEnd);
  const slide = slides[i];

  return (
    <Card style={{ padding: 0, overflow: "hidden" }}>
      <ViewerBar icon={Presentation} name={`${slug(slides[0].title)}.pptx`}>
        <span style={{ fontFamily: FM, fontSize: 12, color: C.inkMute }}>{i + 1} / {slides.length}</span>
      </ViewerBar>
      <div style={{ background: inkGrad, color: "#fff", padding: "40px 34px 34px", minHeight: 340, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontFamily: FM, fontSize: 11.5, color: "#AEB6E0", letterSpacing: ".12em" }}>SLIDE {i + 1}</div>
        <div style={{ fontFamily: FD, fontWeight: 700, fontSize: 28, letterSpacing: "-.02em", marginTop: 8 }}>{slide.title}</div>
        <ul style={{ margin: "16px 0 0", paddingLeft: 20, color: "#D3D9F6", fontSize: 15, lineHeight: 1.75 }}>
          {slide.bullets.map((b) => (
            <li key={b} style={{ marginBottom: 4 }}>{b}</li>
          ))}
        </ul>
        {slide.code && (
          <pre style={{ margin: "18px 0 0", background: EDITOR.surface, border: "1px solid rgba(255,255,255,.08)", borderRadius: 12, padding: 14, fontFamily: FM, fontSize: 12.5, lineHeight: 1.7, color: EDITOR.text, overflowX: "auto" }}>
            {slide.code.source}
          </pre>
        )}
        {slide.note && (
          <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,.1)", color: "#AEB6E0", fontSize: 13.5, display: "flex", gap: 9 }}>
            <Target size={16} style={{ flex: "none", marginTop: 2 }} /> {slide.note}
          </div>
        )}
      </div>
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
        <PagerButtons i={i} count={slides.length} go={go} action={action} />
      </div>
    </Card>
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

export { ProgressBar };
