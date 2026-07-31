"use client";

import { motion } from "framer-motion";
import { Reveal } from "./Reveal";
import { CheckIcon, DashboardIcon, ProfileIcon, TrophyIcon, PencilIcon, DownloadIcon } from "./icons";

const checklist = [
  {
    title: "Cohort dashboard",
    text: "Live stats across every student, course, and lab.",
  },
  {
    title: "Student profiles & reports",
    text: "Drill into any student's activity and export reports.",
  },
  {
    title: "Leaderboards",
    text: "Rank students by points across courses, labs, and exams.",
  },
  {
    title: "Question authoring",
    text: "Create your own lab exercises and test cases.",
  },
];

const branches = [
  { label: "CSE", pct: 92 },
  { label: "ECE", pct: 84 },
  { label: "MECH", pct: 71 },
  { label: "CIVIL", pct: 63 },
];

export function AdminSection() {
  return (
    <section className="py-24 sm:py-[100px]" id="admin">
      <div className="mx-auto max-w-[1180px] px-6">
        <Reveal className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div>
            <span className="font-mono text-[13px] font-medium tracking-[0.16em] uppercase text-blue">
              For college admins
            </span>
            <h3 className="text-[28px] sm:text-[34px] md:text-[40px] tracking-[-0.02em] mt-3.5">
              Every cohort,{" "}
              <em className="font-serif-em not-italic text-royal" style={{ fontStyle: "italic" }}>
                visible
              </em>{" "}
              in one dashboard.
            </h3>
            <p className="text-ink-soft text-lg mt-4">
              Give your placement cell a live view of the whole batch — not just the toppers.
              Track individual students, download reports, run leaderboards, and author your own
              lab questions.
            </p>
            <ul className="flex flex-col gap-4 mt-6">
              {checklist.map((c) => (
                <li key={c.title} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-royal/10 text-royal flex items-center justify-center flex-none mt-0.5">
                    <CheckIcon className="w-3 h-3" />
                  </span>
                  <span>
                    <b className="font-display font-semibold text-[15px]">{c.title}</b>
                    <span className="block text-ink-mute text-[14px] mt-0.5">{c.text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <div
              className="relative p-[22px] rounded-[30px] shadow-[0_30px_70px_rgba(36,48,216,0.22)]"
              style={{ background: "#0E1230" }}
            >
              <div className="bg-[#141834] rounded-[20px] overflow-hidden border border-white/[0.08]">
                <div className="flex items-center gap-2 px-[15px] py-[13px] bg-[#1B2044] border-b border-white/[0.06]">
                  <DashboardIcon className="w-4 h-4 text-sky" />
                  <span className="font-mono text-[12.5px] text-[#8E96C6]">Cohort overview</span>
                  <span className="ml-auto inline-flex items-center gap-1.5 font-mono text-[10.5px] text-[#5AD6B0] bg-[#5AD6B0]/[0.12] px-2 py-[3px] rounded-full">
                    <i className="w-[6px] h-[6px] rounded-full bg-[#5AD6B0] block" />
                    LIVE
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2.5 p-[18px]">
                  {[
                    { icon: ProfileIcon, value: "1,248", label: "Students" },
                    { icon: TrophyIcon, value: "86%", label: "Avg. completion" },
                    { icon: DownloadIcon, value: "4.7k", label: "Reports run" },
                  ].map((s) => {
                    const Icon = s.icon;
                    return (
                      <div key={s.label} className="bg-white/[0.04] rounded-xl px-3 py-3">
                        <Icon className="w-4 h-4 text-sky-lt mb-2" />
                        <div className="font-display font-bold text-white text-[19px] leading-none">
                          {s.value}
                        </div>
                        <div className="font-mono text-[10px] text-[#8E96C6] mt-1.5 leading-tight">
                          {s.label}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="px-[18px] pb-[18px]">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="font-mono text-[10.5px] uppercase tracking-wide text-[#8E96C6]">
                      Branch completion
                    </span>
                    <PencilIcon className="w-3.5 h-3.5 text-[#8E96C6]" />
                  </div>
                  <div className="flex flex-col gap-2.5">
                    {branches.map((b, i) => (
                      <div key={b.label} className="flex items-center gap-3">
                        <span className="font-mono text-[11px] text-[#C4C9EC] w-11 flex-none">
                          {b.label}
                        </span>
                        <div className="flex-1 h-[6px] rounded-full bg-white/[0.08] overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundImage: "var(--blue-grad)" }}
                            initial={{ width: 0 }}
                            whileInView={{ width: `${b.pct}%` }}
                            viewport={{ once: true, margin: "-40px" }}
                            transition={{ duration: 1.1, ease: [0.3, 0.8, 0.3, 1], delay: 0.15 + i * 0.1 }}
                          />
                        </div>
                        <span className="font-mono text-[11px] text-[#8E96C6] w-8 flex-none text-right">
                          {b.pct}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
