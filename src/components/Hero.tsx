"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { FlowLines } from "./FlowLines";
import { GlowOrbs } from "./GlowOrbs";
import { EditorWindow, CodeLine } from "./EditorWindow";
import { Button } from "./Button";
import { Sparkle } from "./icons";

function useCountUp(target: number, duration = 1.4, delay = 0.6) {
  const reduce = useReducedMotion();
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (reduce) {
      setValue(target);
      return;
    }
    let raf = 0;
    const timer = setTimeout(() => {
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min((now - start) / (duration * 1000), 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(Math.round(eased * target));
        if (progress < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, delay * 1000);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [target, duration, delay, reduce]);
  return value;
}

const stats: { target: number; suffix: string; label: string; comma?: boolean }[] = [
  { target: 40, suffix: "+", label: "Colleges onboard" },
  { target: 1248, suffix: "", label: "Active students", comma: true },
  { target: 6, suffix: "+", label: "Languages" },
];

function StatCounter({ target, suffix, label, comma }: (typeof stats)[number]) {
  const value = useCountUp(target);
  const display = comma ? value.toLocaleString() : String(value);
  return (
    <div>
      <div className="font-display font-bold text-[26px] sm:text-[30px] text-ink tracking-tight tabular-nums">
        {display}
        {suffix}
      </div>
      <div className="text-[12.5px] text-ink-mute mt-0.5">{label}</div>
    </div>
  );
}

function ParallaxTilt({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 150, damping: 20, mass: 0.6 });
  const sry = useSpring(ry, { stiffness: 150, damping: 20, mass: 0.6 });

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    ry.set(px * 9);
    rx.set(py * -9);
  }
  function onMouseLeave() {
    rx.set(0);
    ry.set(0);
  }

  return (
    <div ref={ref} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave} style={{ perspective: 1200 }}>
      <motion.div style={{ rotateX: srx, rotateY: sry }}>{children}</motion.div>
    </div>
  );
}

const avatars = [
  { initial: "A", bg: "linear-gradient(135deg,#2430D8,#4DA3F5)" },
  { initial: "R", bg: "linear-gradient(135deg,#8B5CF6,#EC4899)" },
  { initial: "S", bg: "linear-gradient(135deg,#1EC8DC,#4DA3F5)" },
  { initial: "P", bg: "var(--gold-grad)" },
];

export function Hero() {
  const reduce = useReducedMotion();

  // `hidden` values stay static (never keyed off `reduce`) so the server-rendered
  // initial state always matches the client's first paint before hydration —
  // only the transition timing (applied post-mount) is conditional.
  const container = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : 0.14, delayChildren: reduce ? 0 : 0.1 } },
  };
  const item = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: reduce ? 0 : 0.7, ease: [0.2, 0.7, 0.2, 1] as const } },
  };
  const headlineItem = {
    hidden: { opacity: 0, y: 28, filter: "blur(8px)" },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: reduce ? 0 : 0.8, ease: [0.2, 0.7, 0.2, 1] as const },
    },
  };

  return (
    <section className="relative overflow-hidden pt-14 pb-8" id="top">
      <GlowOrbs variant="light" />
      <FlowLines
        viewBox="0 0 1440 720"
        lines={[
          { d: "M-40 250 C 300 120 640 360 1000 200 S 1500 120 1520 260", stroke: "url(#bg)", strokeWidth: 2.5, opacity: 0.5 },
          { d: "M-40 470 C 340 560 620 320 980 480 S 1460 600 1520 440", stroke: "url(#gg)", strokeWidth: 2.5, opacity: 0.55, delay: 0.3 },
          { d: "M-40 610 C 380 520 700 700 1080 560 S 1480 500 1520 620", stroke: "url(#bg)", strokeWidth: 1.6, opacity: 0.3, delay: 0.6 },
        ]}
      />
      <div className="relative z-[3] mx-auto max-w-[1180px] px-6">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-[1.06fr_0.94fr] gap-12 items-center py-11 md:pb-[60px]"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <div>
            <motion.div variants={item}>
              <span className="inline-flex items-center gap-2 font-mono text-[12.5px] font-medium text-royal bg-white border border-royal/[0.18] px-3.5 py-[7px] rounded-full shadow-[0_4px_18px_rgba(36,48,216,0.14)] animate-pulse-ai">
                <Sparkle className="w-[14px] h-[14px]" gradient="gg" />
                AI-powered learning platform
              </span>
            </motion.div>

            <motion.div variants={item} className="flex gap-5 font-mono text-[13px] font-medium tracking-[0.14em] uppercase text-ink-mute mt-4">
              <span className="inline-flex items-center gap-[7px]">
                <i className="w-2 h-2 rounded-full block bg-cyan" />
                Learn
              </span>
              <span className="inline-flex items-center gap-[7px]">
                <i className="w-2 h-2 rounded-full block bg-violet" />
                Think
              </span>
              <span className="inline-flex items-center gap-[7px]">
                <i className="w-2 h-2 rounded-full block bg-amber" />
                Innovate
              </span>
            </motion.div>

            <motion.h1
              variants={headlineItem}
              className="text-[40px] sm:text-[54px] md:text-[64px] lg:text-[72px] mt-[22px] leading-[1.02] tracking-[-0.03em]"
            >
              Where students learn to code — and{" "}
              <span className="relative inline-block">
                <em
                  className="font-serif-em not-italic text-gold-deep font-normal"
                  style={{ fontStyle: "italic", filter: "drop-shadow(0 6px 22px rgba(245,158,11,0.35))" }}
                >
                  spark
                </em>
              </span>{" "}
              real careers.
            </motion.h1>

            <motion.p variants={item} className="text-xl text-ink-soft mt-[26px] max-w-[36ch]">
              The full college platform: tech &amp; non-tech courses, sem-wise labs, and
              placement-style exams — all AI-graded, with a live admin dashboard for every
              cohort.
            </motion.p>

            <motion.div variants={item} className="flex gap-3.5 flex-wrap mt-[34px]">
              <Button href="#book" icon className="!shadow-none animate-pulse-cta">
                Book a demo
              </Button>
              <Button href="#journey" variant="line">
                See how it works
              </Button>
            </motion.div>

            <motion.div variants={item} className="flex flex-wrap gap-x-10 gap-y-5 mt-[38px] pt-[26px] border-t border-line max-w-[440px]">
              {stats.map((s) => (
                <StatCounter key={s.label} {...s} />
              ))}
            </motion.div>
          </div>

          <motion.div variants={item} className="relative">
            <ParallaxTilt>
              <div
                className="relative p-6 shadow-[0_40px_90px_rgba(36,48,216,0.28)] animate-morph"
                style={{
                  background: "#0E1230",
                  borderRadius: "42% 58% 58% 42% / 48% 46% 54% 52%",
                }}
              >
                <EditorWindow filename="two_sum.py" lang="PYTHON" runLabel="Run tests" result="6 / 6 passed · O(n)">
                  <CodeLine>
                    <span className="code-cm"># indices of two numbers adding to target</span>
                  </CodeLine>
                  <CodeLine>
                    <span className="code-kw">def</span> <span className="code-fn">two_sum</span>(nums, target):
                  </CodeLine>
                  <CodeLine>
                    {"    "}seen <span className="code-op">=</span> {"{}"}
                  </CodeLine>
                  <CodeLine>
                    {"    "}
                    <span className="code-kw">for</span> i, n <span className="code-kw">in</span>{" "}
                    <span className="code-fn">enumerate</span>(nums):
                  </CodeLine>
                  <CodeLine>
                    {"        "}
                    <span className="code-kw">if</span> target <span className="code-op">-</span> n{" "}
                    <span className="code-kw">in</span> seen:
                  </CodeLine>
                  <CodeLine>
                    {"            "}
                    <span className="code-kw">return</span> [seen[target<span className="code-op">-</span>n], i]
                  </CodeLine>
                  <CodeLine>
                    {"        "}seen[n] <span className="code-op">=</span> i
                  </CodeLine>
                </EditorWindow>
              </div>
            </ParallaxTilt>

            <div className="absolute -top-4 right-1.5 z-[4] bg-white rounded-[14px] px-[15px] py-[10px] shadow-[0_16px_34px_rgba(16,20,51,0.14)] flex items-center gap-[9px] font-semibold text-sm animate-float-a">
              <Sparkle className="w-[26px] h-[26px]" gradient="spg" />
              +120 XP · Rank #14 → #9
            </div>

            <div className="absolute -bottom-5 -left-3 sm:-left-7 z-[4] bg-white rounded-[16px] pl-3 pr-[18px] py-[10px] shadow-[0_16px_34px_rgba(16,20,51,0.14)] flex items-center gap-3 animate-float-b">
              <div className="flex -space-x-2.5 flex-none">
                {avatars.map((a) => (
                  <span
                    key={a.initial}
                    className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-[11px] font-bold flex-none"
                    style={{ backgroundImage: a.bg }}
                  >
                    {a.initial}
                  </span>
                ))}
              </div>
              <div>
                <div className="text-[13.5px] font-semibold text-ink flex items-center gap-[7px] whitespace-nowrap">
                  <i className="relative flex w-2 h-2 flex-none">
                    <i className="absolute inset-0 rounded-full bg-[#22C55E] animate-ping opacity-75" />
                    <i className="relative w-2 h-2 rounded-full bg-[#22C55E] block" />
                  </i>
                  1,248 learning now
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
