"use client";

import { motion } from "framer-motion";
import { CheckIcon, ClockIcon, LockIcon } from "./icons";

const subjects = ["Intro", "Arrays", "Strings", "Recursion", "Sorting", "Trees", "Graphs", "DP", "SQL", "OOP", "System", "Mock"];
const current = 7;
const totalWeeks = 12;

export function LabsRail() {
  const pct = ((current - 1) / (totalWeeks - 1)) * 92;

  return (
    <div className="relative p-2 sm:p-[30px]">
      <div className="relative grid grid-cols-6 sm:grid-cols-12 items-start gap-y-[18px] sm:gap-y-0">
        <div className="hidden sm:block absolute top-[22px] left-[4%] right-[4%] h-1 bg-line rounded-full" />
        <motion.div
          className="hidden sm:block absolute top-[22px] left-[4%] h-1 rounded-full"
          style={{ backgroundImage: "var(--blue-grad)" }}
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 1.5, ease: [0.3, 0.8, 0.3, 1], delay: 0.15 }}
        />
        {subjects.map((label, i) => {
          const w = i + 1;
          const done = w < current;
          const isCurrent = w === current;
          return (
            <div key={label} className="relative z-[2] flex flex-col items-center gap-2">
              <div
                className={`w-[34px] h-[34px] rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${
                  done
                    ? "border-transparent text-white"
                    : isCurrent
                    ? "border-transparent text-[#3A2A00] animate-pulse-ring"
                    : "bg-white border-line text-ink-mute"
                }`}
                style={
                  done
                    ? { backgroundImage: "var(--blue-grad)" }
                    : isCurrent
                    ? { backgroundImage: "var(--gold-grad)" }
                    : undefined
                }
              >
                {done ? (
                  <CheckIcon className="w-[15px] h-[15px]" />
                ) : isCurrent ? (
                  <ClockIcon className="w-[15px] h-[15px]" />
                ) : (
                  <LockIcon className="w-[15px] h-[15px]" />
                )}
              </div>
              <span className={`font-mono text-[10.5px] ${isCurrent ? "text-gold-deep font-medium" : "text-ink-mute"}`}>
                W{w}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
