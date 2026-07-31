"use client";

import { motion } from "framer-motion";
import { FlowLines } from "./FlowLines";
import { GlowOrbs } from "./GlowOrbs";
import { EditorWindow, CodeLine } from "./EditorWindow";
import { Button } from "./Button";
import { Sparkle } from "./icons";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.14, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.2, 0.7, 0.2, 1] as const } },
};

export function Hero() {
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
          className="grid grid-cols-1 md:grid-cols-[1.06fr_0.94fr] gap-12 items-center py-11 md:pb-[70px]"
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

            <motion.h1 variants={item} className="text-[42px] sm:text-[56px] md:text-[72px] mt-[22px] leading-[1.02] tracking-[-0.03em]">
              Where students learn to code — and{" "}
              <em className="font-serif-em not-italic text-gold-deep font-normal" style={{ fontStyle: "italic" }}>
                spark
              </em>{" "}
              real careers.
            </motion.h1>

            <motion.p variants={item} className="text-xl text-ink-soft mt-[26px] max-w-[34ch]">
              The full college platform: tech &amp; non-tech courses, sem-wise labs, and
              placement-style exams — all AI-graded, with a live admin dashboard for every
              cohort.
            </motion.p>

            <motion.div variants={item} className="flex gap-3.5 flex-wrap mt-[34px]">
              <Button href="#book" icon>
                Book a demo
              </Button>
              <Button href="#journey" variant="line">
                See how it works
              </Button>
            </motion.div>

            <motion.p variants={item} className="mt-[26px] text-[15px] text-ink-mute">
              Trusted by engineering colleges — from <b className="text-royal font-semibold">first year</b> to{" "}
              <b className="text-royal font-semibold">final placements</b>.
            </motion.p>
          </div>

          <motion.div variants={item} className="relative">
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
            <div className="absolute -top-4 right-1.5 z-[4] bg-white rounded-[14px] px-[15px] py-[10px] shadow-[0_16px_34px_rgba(16,20,51,0.14)] flex items-center gap-[9px] font-semibold text-sm">
              <Sparkle className="w-[26px] h-[26px]" gradient="spg" />
              +120 XP · Rank #14 → #9
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
