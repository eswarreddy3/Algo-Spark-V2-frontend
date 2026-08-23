"use client";

/**
 * A dependency-free code editor: a transparent textarea sitting exactly on top
 * of a highlighted <pre>, with a synced line-number gutter. Swapping in
 * CodeMirror or Monaco later only touches this file.
 */
import React, { useCallback, useMemo, useRef } from "react";
import { EDITOR, FM } from "../theme";
import type { Language } from "./types";

const FONT_SIZE = 13;
const LINE_HEIGHT = 22;
const PAD = 14;
const GUTTER = 46;
const INDENT = "    ";

const KEYWORDS: Record<Language, string[]> = {
  python: ["def", "return", "if", "elif", "else", "for", "while", "in", "not", "and", "or", "None", "True", "False", "class", "import", "from", "global", "lambda", "pass", "break", "continue", "with", "as", "try", "except", "yield", "self"],
  cpp: ["int", "long", "double", "float", "char", "bool", "void", "auto", "const", "return", "if", "else", "for", "while", "struct", "class", "public", "private", "using", "namespace", "include", "vector", "string", "pair", "stack", "queue", "map", "nullptr", "true", "false", "new", "delete", "template", "typename", "break", "continue"],
  java: ["public", "private", "protected", "static", "final", "class", "interface", "void", "int", "long", "double", "float", "char", "boolean", "String", "return", "if", "else", "for", "while", "new", "null", "true", "false", "import", "extends", "implements", "try", "catch", "break", "continue", "this"],
  sql: ["select", "from", "where", "group", "by", "having", "order", "limit", "join", "inner", "left", "outer", "on", "as", "create", "table", "view", "insert", "into", "values", "update", "set", "delete", "primary", "key", "foreign", "references", "not", "null", "unique", "check", "default", "cascade", "and", "or", "desc", "asc", "count", "sum", "avg", "min", "max", "integer", "text", "real", "date", "distinct", "exists", "in", "between"],
};

const COLORS = {
  plain: EDITOR.text,
  comment: "#5F6796",
  string: "#8EEBC0",
  number: "#F5B838",
  keyword: "#7FC0FA",
  fn: "#C7B3FF",
} as const;

type TokenType = keyof typeof COLORS;
type Token = { type: TokenType; value: string };

function tokenRegex(language: Language) {
  const comment =
    language === "python" ? "#[^\\n]*" : language === "sql" ? "--[^\\n]*" : "\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/";
  return new RegExp(
    `(${comment})|("(?:[^"\\\\\\n]|\\\\.)*"|'(?:[^'\\\\\\n]|\\\\.)*')|(\\b\\d+(?:\\.\\d+)?\\b)|([A-Za-z_][A-Za-z0-9_]*)`,
    "g",
  );
}

function tokenize(source: string, language: Language): Token[] {
  const keywords = new Set(KEYWORDS[language]);
  const caseInsensitive = language === "sql";
  const re = tokenRegex(language);
  const tokens: Token[] = [];
  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = re.exec(source))) {
    if (m.index > last) tokens.push({ type: "plain", value: source.slice(last, m.index) });
    const [value, comment, str, num, word] = m;
    if (comment) tokens.push({ type: "comment", value });
    else if (str) tokens.push({ type: "string", value });
    else if (num) tokens.push({ type: "number", value });
    else if (word) {
      const probe = caseInsensitive ? word.toLowerCase() : word;
      const isCall = source[m.index + value.length] === "(";
      tokens.push({ type: keywords.has(probe) ? "keyword" : isCall ? "fn" : "plain", value });
    }
    last = m.index + value.length;
  }
  if (last < source.length) tokens.push({ type: "plain", value: source.slice(last) });
  return tokens;
}

export function CodeEditor({
  value,
  onChange,
  language,
  minHeight = 320,
  readOnly = false,
  onRun,
}: {
  value: string;
  onChange: (next: string) => void;
  language: Language;
  minHeight?: number;
  readOnly?: boolean;
  /** Ctrl/Cmd + Enter runs the code, as in every real editor. */
  onRun?: () => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  const tokens = useMemo(() => tokenize(value, language), [value, language]);
  const lineCount = useMemo(() => value.split("\n").length, [value]);

  const syncScroll = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    if (preRef.current) {
      preRef.current.scrollTop = ta.scrollTop;
      preRef.current.scrollLeft = ta.scrollLeft;
    }
    if (gutterRef.current) gutterRef.current.scrollTop = ta.scrollTop;
  }, []);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        onRun?.();
        return;
      }
      if (e.key !== "Tab") return;
      e.preventDefault();
      const ta = e.currentTarget;
      const { selectionStart: start, selectionEnd: end } = ta;
      const next = `${value.slice(0, start)}${INDENT}${value.slice(end)}`;
      onChange(next);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + INDENT.length;
      });
    },
    [value, onChange, onRun],
  );

  const surface: React.CSSProperties = {
    margin: 0,
    fontFamily: FM,
    fontSize: FONT_SIZE,
    lineHeight: `${LINE_HEIGHT}px`,
    padding: PAD,
    whiteSpace: "pre",
    tabSize: 4,
    border: "none",
    outline: "none",
    letterSpacing: "normal",
  };

  return (
    <div style={{ position: "relative", background: EDITOR.surface, minHeight, display: "flex" }}>
      <div
        ref={gutterRef}
        aria-hidden
        style={{
          width: GUTTER,
          flex: "none",
          overflow: "hidden",
          padding: `${PAD}px 0`,
          fontFamily: FM,
          fontSize: FONT_SIZE - 1,
          lineHeight: `${LINE_HEIGHT}px`,
          color: "#4C5488",
          textAlign: "right",
          userSelect: "none",
          borderRight: "1px solid rgba(255,255,255,.05)",
        }}
      >
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i} style={{ paddingRight: 10 }}>
            {i + 1}
          </div>
        ))}
      </div>

      <div style={{ position: "relative", flex: 1, minWidth: 0, minHeight }}>
        <pre ref={preRef} aria-hidden style={{ ...surface, position: "absolute", inset: 0, overflow: "hidden", color: EDITOR.text }}>
          {tokens.map((t, i) => (
            <span key={i} style={{ color: COLORS[t.type] }}>
              {t.value}
            </span>
          ))}
          {"\n"}
        </pre>
        <textarea
          ref={textareaRef}
          value={value}
          readOnly={readOnly}
          onChange={(e) => onChange(e.target.value)}
          onScroll={syncScroll}
          onKeyDown={onKeyDown}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          wrap="off"
          aria-label="Code editor"
          style={{
            ...surface,
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            resize: "none",
            overflow: "auto",
            background: "transparent",
            color: "transparent",
            caretColor: "#FFFFFF",
          }}
        />
      </div>
    </div>
  );
}
