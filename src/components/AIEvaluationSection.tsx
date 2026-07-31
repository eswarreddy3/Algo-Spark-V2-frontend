import { Reveal } from "./Reveal";
import { GlowOrbs } from "./GlowOrbs";
import { AIFeedbackCard } from "./AIFeedbackCard";
import { Sparkle } from "./icons";

const points = [
  "Grades email writing for tone, clarity, and grammar",
  "Scores paragraph reading for comprehension and fluency",
  "Judges code against hidden test cases the instant it runs",
  "Turns every score into points that feed the leaderboard",
];

export function AIEvaluationSection() {
  return (
    <section className="py-24 sm:py-[100px] bg-ink-grad text-white relative overflow-hidden" id="ai">
      <GlowOrbs variant="dark" />
      <div className="relative z-[2] mx-auto max-w-[1180px] px-6">
        <Reveal className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div>
            <span className="inline-flex items-center gap-2 font-mono text-[13px] font-medium tracking-[0.16em] uppercase text-sky">
              <Sparkle className="w-4 h-4" gradient="gg" />
              AI evaluation engine
            </span>
            <h3 className="text-[28px] sm:text-[34px] md:text-[40px] tracking-[-0.02em] mt-3.5">
              One AI, grading{" "}
              <em className="font-serif-em not-italic text-gold-deep" style={{ fontStyle: "italic" }}>
                everything.
              </em>
            </h3>
            <p className="text-[#B6BEE6] text-lg mt-4">
              Every submission — a line of code, a paragraph, an email — gets graded the moment a
              student hits submit. No queue, no waiting for office hours, no inconsistent grading
              between sections.
            </p>
            <ul className="flex flex-col gap-3 mt-6">
              {points.map((p) => (
                <li key={p} className="flex items-start gap-2.5 text-[#C4C9EC] text-[15px]">
                  <Sparkle className="w-4 h-4 flex-none mt-0.5" gradient="gg" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative">
            <div
              className="relative p-[22px] rounded-[30px] shadow-[0_30px_70px_rgba(0,0,0,0.35)]"
              style={{ background: "#0E1230" }}
            >
              <AIFeedbackCard />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
