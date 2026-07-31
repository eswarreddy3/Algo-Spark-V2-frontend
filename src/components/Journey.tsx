"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { Reveal } from "./Reveal";
import { LearnIcon, PracticeIcon, FeedbackIcon, LevelUpIcon } from "./icons";

const steps = [
  {
    n: "01",
    title: "Learn",
    text: "Short, focused theory and PPT lessons that set up each concept — no fluff, no filler.",
    icon: LearnIcon,
    node: "bg-blue-node",
    side: "left" as const,
    threshold: 0.12,
  },
  {
    n: "02",
    title: "Practice",
    text: "Solve real problems in a live editor and answer MCQs — hands on the keyboard, not the remote.",
    icon: PracticeIcon,
    node: "bg-cyan-node",
    side: "right" as const,
    threshold: 0.38,
  },
  {
    n: "03",
    title: "Get feedback",
    text: "Instant judging, test cases, and Big-O insight show a student exactly what to fix and why.",
    icon: FeedbackIcon,
    node: "bg-violet-node",
    side: "left" as const,
    threshold: 0.62,
  },
  {
    n: "04",
    title: "Level up",
    text: "Earn points, climb the leaderboard, and unlock next week's lab. Momentum, made visible.",
    icon: LevelUpIcon,
    node: "bg-gold-node",
    side: "right" as const,
    threshold: 0.88,
  },
];

const nodeGradients: Record<string, string> = {
  "bg-blue-node": "var(--blue-grad)",
  "bg-cyan-node": "linear-gradient(120deg, #1EC8DC, #4DA3F5)",
  "bg-violet-node": "linear-gradient(120deg, #8B7CE8, #2F5BF0)",
  "bg-gold-node": "var(--gold-grad)",
};

function JourneyNode({
  step,
  progress,
}: {
  step: (typeof steps)[number];
  progress: MotionValue<number>;
}) {
  const t = step.threshold;
  const scale = useTransform(progress, [t - 0.16, t, t + 0.1], [0.86, 1.2, 1]);
  const fill = useTransform(progress, [t - 0.05, t + 0.04], [0, 1]);
  const iconColor = useTransform(progress, [t - 0.05, t + 0.04], ["#AEB4DE", "#FFFFFF"]);
  const ring = useTransform(progress, [t - 0.16, t, t + 0.16], [0, 1, 0]);
  const Icon = step.icon;

  return (
    <motion.div style={{ scale }} className="relative flex items-center justify-center">
      <motion.div
        className="absolute -inset-2.5 rounded-full"
        style={{
          opacity: ring,
          boxShadow: "0 0 0 4px rgba(36,48,216,0.14)",
        }}
      />
      <div className="relative w-16 h-16 rounded-full bg-white shadow-[0_12px_30px_rgba(36,48,216,0.18)] flex items-center justify-center overflow-hidden">
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ backgroundImage: nodeGradients[step.node], opacity: fill }}
        />
        <motion.div style={{ color: iconColor }} className="relative z-10">
          <Icon className="w-7 h-7" />
        </motion.div>
      </div>
    </motion.div>
  );
}

export function Journey() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start end", "end start"],
  });

  return (
    <section className="py-24 sm:py-[100px] bg-cream relative overflow-hidden" id="journey">
      <div className="mx-auto max-w-[1180px] px-6">
        <Reveal className="max-w-[680px] mx-auto text-center">
          <span className="font-mono text-[13px] font-medium tracking-[0.16em] uppercase text-blue">
            The learning experience
          </span>
          <h2 className="text-[34px] sm:text-[44px] md:text-[52px] mt-4 tracking-[-0.025em]">
            How every student{" "}
            <em className="font-serif-em not-italic text-gold-deep" style={{ fontStyle: "italic" }}>
              sparks.
            </em>
          </h2>
          <p className="text-ink-soft text-[19px] mt-[18px]">
            Not passive watching — a loop students run every day, on every topic, until the skill sticks.
          </p>
        </Reveal>

        <div ref={wrapRef} className="relative max-w-[940px] mx-auto mt-14">
          <svg
            className="hidden md:block absolute left-1/2 top-0 h-full -translate-x-1/2 z-[1] pointer-events-none"
            width="120"
            viewBox="0 0 120 820"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M60 20 C 10 140 110 260 60 400 S 10 660 60 800"
              stroke="var(--line)"
              strokeWidth="4"
              fill="none"
            />
            <motion.path
              d="M60 20 C 10 140 110 260 60 400 S 10 660 60 800"
              stroke="url(#bg)"
              strokeWidth="4"
              fill="none"
              style={{ pathLength: scrollYProgress }}
            />
          </svg>

          {steps.map((step, i) => {
            const isLeft = step.side === "left";
            return (
              <Reveal
                key={step.n}
                delay={i * 0.05}
                className="relative z-[2] grid grid-cols-1 md:grid-cols-[1fr_96px_1fr] items-center min-h-0 md:min-h-[200px] border-l-[3px] md:border-l-0 border-line pl-[22px] md:pl-0 ml-2 md:ml-0 py-[22px] md:py-0"
              >
                <div
                  className={`${isLeft ? "md:col-start-1 md:text-right" : "md:col-start-3 md:text-left"} text-left`}
                >
                  <h3 className={`text-2xl mb-2 ${isLeft ? "md:ml-auto" : ""} max-w-[34ch]`}>
                    <span className="font-serif-em not-italic text-gold-deep mr-2" style={{ fontStyle: "italic" }}>
                      {step.n}
                    </span>
                    {step.title}
                  </h3>
                  <p className={`text-ink-soft text-[16.5px] max-w-[34ch] ${isLeft ? "md:ml-auto" : ""}`}>
                    {step.text}
                  </p>
                </div>
                <div className="hidden md:flex justify-center md:col-start-2">
                  <JourneyNode step={step} progress={scrollYProgress} />
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
