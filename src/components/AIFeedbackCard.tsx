"use client";

import { motion } from "framer-motion";
import { Sparkle } from "./icons";

const metrics = [
  { label: "Clarity", pct: 92, color: "#4DA3F5" },
  { label: "Tone", pct: 88, color: "#8B7CE8" },
  { label: "Grammar", pct: 95, color: "#1EC8DC" },
];

export function AIFeedbackCard() {
  return (
    <div className="bg-[#141834] rounded-[20px] overflow-hidden border border-white/[0.08]">
      <div className="flex items-center gap-2 px-[15px] py-[13px] bg-[#1B2044] border-b border-white/[0.06]">
        <Sparkle className="w-4 h-4 flex-none" gradient="spg" />
        <span className="font-mono text-[12.5px] text-[#8E96C6]">AI Evaluation</span>
        <span className="font-mono text-[12.5px] text-[#565C86] hidden sm:inline">
          · email_response.txt
        </span>
        <span className="ml-auto font-mono text-[11px] text-gold bg-gold/[0.14] px-[9px] py-[3px] rounded-md">
          AI
        </span>
      </div>

      <div className="px-[18px] pt-[18px] pb-4 text-[13.5px] leading-[1.85] text-[#C4C9EC]">
        Hi Ma&apos;am,
        <br />
        Thank you for the update.{" "}
        <span className="text-sky-lt underline decoration-sky decoration-2 underline-offset-4">
          I have reviewed the onboarding steps
        </span>{" "}
        and everything looks clear.{" "}
        <span className="text-amber underline decoration-amber decoration-2 underline-offset-4">
          Please let me know if anything else is needed
        </span>{" "}
        from my end.
      </div>

      <div className="px-[18px] pb-[14px] flex flex-col gap-2.5">
        {metrics.map((m, i) => (
          <div key={m.label} className="flex items-center gap-3">
            <span className="font-mono text-[11px] text-[#8E96C6] w-14 flex-none">{m.label}</span>
            <div className="flex-1 h-[6px] rounded-full bg-white/[0.08] overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: m.color }}
                initial={{ width: 0 }}
                whileInView={{ width: `${m.pct}%` }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 1, delay: 0.15 + i * 0.1, ease: [0.3, 0.8, 0.3, 1] }}
              />
            </div>
            <span className="font-mono text-[11px] text-[#8E96C6] w-7 flex-none text-right">
              {m.pct}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-start gap-2.5 mx-[18px] mb-[18px] p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
        <Sparkle className="w-4 h-4 flex-none mt-0.5" gradient="gg" />
        <p className="text-[12.5px] text-[#AEB6E0] italic leading-snug">
          Confident and professional — consider a warmer closing line before you sign off.
        </p>
      </div>
    </div>
  );
}
