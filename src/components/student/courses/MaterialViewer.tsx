"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  BookOpen, CheckCircle2, ChevronLeft, ChevronRight, Clock, Download, FileText, Globe, Link2, Lock, Play,
  Presentation, Target, ZoomIn, ZoomOut,
} from "lucide-react";
import { C, EDITOR, FB, FD, FM, goldGrad, inkGrad, tint } from "../theme";
import { Card, Pill, ProgressBar } from "../ui";
import { FORMAT_LABEL, type Topic, type MaterialFormat } from "../data/courses";
import type { Resource, Slide } from "../labs/types";

export const FORMAT_ICON: Record<MaterialFormat, typeof FileText> = { ppt: Presentation, pdf: FileText, web: Globe };
const RESOURCE_ICON = { pdf: FileText, video: Play, link: Link2 } as const;

/** Topic material in its authored format, with outcomes and resources alongside. */
export function MaterialViewer({ topic, done, onComplete }: { topic: Topic; done: boolean; onComplete: () => void }) {
  const { format, slides } = topic.material;
  // The student has to reach the end of the material before marking it read.
  const [reachedEnd, setReachedEnd] = useState(done || slides.length <= 1);
  const onEnd = useCallback(() => setReachedEnd(true), []);

  if (!slides.length) {
    return <Card style={{ padding: 24, color: C.inkMute, fontSize: 14.5 }}>Material for this topic has not been published yet.</Card>;
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
      {done ? <><CheckCircle2 size={16} /> Marked as read</> : reachedEnd ? "Mark as read" : <><Lock size={14} /> Mark as read</>}
    </button>
  );

  return (
    <div className="as-material-split">
      <div style={{ minWidth: 0 }}>
        {format === "ppt" && <PptDeck slides={slides} onEnd={onEnd} action={markButton} />}
        {format === "pdf" && <PdfDocument topic={topic} onEnd={onEnd} action={markButton} />}
        {format === "web" && <WebArticle topic={topic} onEnd={onEnd} action={markButton} />}
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
            <Pill><BookOpen size={11} style={{ display: "inline", marginRight: 4, verticalAlign: -1 }} />{slides.length} {format === "ppt" ? "slides" : format === "pdf" ? "pages" : "sections"}</Pill>
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

/* ---------------- PDF ---------------- */

function PdfDocument({ topic, onEnd, action }: { topic: Topic; onEnd: () => void; action: React.ReactNode }) {
  const pages = topic.material.slides;
  const { i, setI, go } = usePager(pages.length, onEnd);
  const [zoom, setZoom] = useState(100);
  const page = pages[i];

  return (
    <Card style={{ padding: 0, overflow: "hidden" }}>
      <ViewerBar icon={FileText} name={`${slug(topic.title)}.pdf`}>
        <button type="button" title="Zoom out" onClick={() => setZoom((z) => Math.max(80, z - 10))} style={iconButton}><ZoomOut size={14} /></button>
        <span style={{ fontFamily: FM, fontSize: 12, color: C.inkMute, width: 40, textAlign: "center" }}>{zoom}%</span>
        <button type="button" title="Zoom in" onClick={() => setZoom((z) => Math.min(130, z + 10))} style={iconButton}><ZoomIn size={14} /></button>
      </ViewerBar>

      <div style={{ display: "flex", background: C.cream, minHeight: 420 }}>
        <div className="as-hide-sm" style={{ width: 92, flex: "none", padding: 12, display: "flex", flexDirection: "column", gap: 10, borderRight: `1px solid ${C.line}` }}>
          {pages.map((p, k) => (
            <button
              key={p.title}
              onClick={() => setI(k)}
              aria-label={`Page ${k + 1}`}
              style={{ border: `2px solid ${k === i ? C.royal : "transparent"}`, background: C.white, borderRadius: 4, height: 84, padding: 6, cursor: "pointer", display: "flex", flexDirection: "column", gap: 4, alignItems: "stretch" }}
            >
              <span style={{ height: 5, background: C.ink, opacity: 0.7, borderRadius: 2, width: "70%" }} />
              {[90, 80, 85, 60].map((w) => (
                <span key={w} style={{ height: 3, background: C.line, borderRadius: 2, width: `${w}%` }} />
              ))}
              <span style={{ marginTop: "auto", fontFamily: FM, fontSize: 9.5, color: C.inkMute }}>{k + 1}</span>
            </button>
          ))}
        </div>

        <div style={{ flex: 1, minWidth: 0, padding: 20, overflowX: "auto" }}>
          <article
            style={{
              background: C.white, margin: "0 auto", maxWidth: `${(zoom / 100) * 620}px`, minHeight: 380, padding: "38px 40px",
              boxShadow: `0 8px 24px ${C.shadow}`, fontSize: `${(zoom / 100) * 14.5}px`, color: C.ink,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: FM, fontSize: 10.5, color: C.inkMute, letterSpacing: ".08em" }}>
              <span>{topic.title.toUpperCase()}</span>
              <span>PAGE {i + 1}</span>
            </div>
            <h3 style={{ fontFamily: FD, fontWeight: 700, fontSize: "1.55em", margin: "18px 0 0", letterSpacing: "-.01em" }}>{page.title}</h3>
            <div style={{ height: 3, width: 44, background: C.royal, borderRadius: 2, margin: "10px 0 16px" }} />
            {page.bullets.map((b) => (
              <p key={b} style={{ lineHeight: 1.75, color: C.inkSoft, margin: "0 0 10px" }}>{b}.</p>
            ))}
            {page.code && (
              <pre style={{ background: C.cream, borderRadius: 6, padding: 12, fontFamily: FM, fontSize: "0.85em", lineHeight: 1.65, overflowX: "auto", color: C.ink, margin: "14px 0 0" }}>
                {page.code.source}
              </pre>
            )}
            {page.note && <p style={{ marginTop: 16, fontStyle: "italic", color: C.inkMute, lineHeight: 1.6 }}>Note: {page.note}</p>}
          </article>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 14, flexWrap: "wrap" }}>
        <span style={{ flex: 1, minWidth: 120, fontFamily: FM, fontSize: 12.5, color: C.inkMute }}>Page {i + 1} of {pages.length}</span>
        <PagerButtons i={i} count={pages.length} go={go} action={action} />
      </div>
    </Card>
  );
}

/* ---------------- Web ---------------- */

function WebArticle({ topic, onEnd, action }: { topic: Topic; onEnd: () => void; action: React.ReactNode }) {
  const sections = topic.material.slides;
  const [read, setRead] = useState(0);

  function onScroll(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    const ratio = (el.scrollTop + el.clientHeight) / el.scrollHeight;
    setRead((r) => Math.max(r, Math.min(1, ratio)));
    if (ratio > 0.97) onEnd();
  }

  return (
    <Card style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderBottom: `1px solid ${C.line}`, background: C.cream }}>
        <span style={{ display: "flex", gap: 6 }}>
          {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
            <span key={c} style={{ width: 10, height: 10, borderRadius: 999, background: c }} />
          ))}
        </span>
        <span style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 8, background: C.white, border: `1px solid ${C.line}`, borderRadius: 8, padding: "5px 10px", fontFamily: FM, fontSize: 12, color: C.inkSoft, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
          <Globe size={13} color={C.inkMute} style={{ flex: "none" }} /> algospark.in/learn/{slug(topic.title)}
        </span>
      </div>
      <div style={{ height: 3, background: C.line }}>
        <div style={{ height: 3, width: `${Math.round(read * 100)}%`, background: C.royal, transition: "width .15s" }} />
      </div>

      <div onScroll={onScroll} style={{ maxHeight: 520, overflowY: "auto", padding: "28px 34px" }}>
        <h2 style={{ fontFamily: FD, fontWeight: 700, fontSize: 28, letterSpacing: "-.02em", margin: 0 }}>{topic.title}</h2>
        <p style={{ color: C.inkMute, fontSize: 15, marginTop: 8, lineHeight: 1.6 }}>{topic.summary}</p>
        {sections.map((s) => (
          <section key={s.title} style={{ marginTop: 26 }}>
            <h3 style={{ fontFamily: FD, fontWeight: 600, fontSize: 19, margin: 0 }}>{s.title}</h3>
            <ul style={{ margin: "10px 0 0", paddingLeft: 20, color: C.inkSoft, fontSize: 15, lineHeight: 1.8 }}>
              {s.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
            {s.code && (
              <pre style={{ margin: "14px 0 0", background: EDITOR.surface, borderRadius: 10, padding: 14, fontFamily: FM, fontSize: 12.5, lineHeight: 1.7, color: EDITOR.text, overflowX: "auto" }}>
                {s.code.source}
              </pre>
            )}
            {s.note && (
              <div style={{ marginTop: 14, borderLeft: `3px solid ${C.goldDeep}`, background: tint(C.goldDeep, 8), padding: "10px 14px", borderRadius: "0 8px 8px 0", color: C.inkSoft, fontSize: 14 }}>
                {s.note}
              </div>
            )}
          </section>
        ))}
        <div style={{ marginTop: 30, paddingTop: 18, borderTop: `1px solid ${C.line}`, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span style={{ flex: 1, color: C.inkMute, fontSize: 13.5 }}>You have reached the end of the article.</span>
          <ReachEnd onEnd={onEnd} />
          {action}
        </div>
      </div>
    </Card>
  );
}

/** Short articles never scroll; seeing the footer counts as reading to the end. */
function ReachEnd({ onEnd }: { onEnd: () => void }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && onEnd());
    io.observe(el);
    return () => io.disconnect();
  }, [onEnd]);
  return <span ref={ref} />;
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
