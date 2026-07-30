import { Reveal } from "./Reveal";
import { LabsRail } from "./LabsRail";

const tags = ["Theory · Code · MCQs", "Weekly unlock", "Live completion per section"];

export function LabsSection() {
  return (
    <section className="py-24 sm:py-[100px] bg-cream" id="labs">
      <div className="mx-auto max-w-[1180px] px-6">
        <Reveal className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div className="md:order-2">
            <span className="font-mono text-[13px] font-medium tracking-[0.16em] uppercase text-blue">
              Weekly labs
            </span>
            <h3 className="text-[28px] sm:text-[34px] md:text-[40px] tracking-[-0.02em] mt-3.5">
              A batch that moves{" "}
              <em className="font-serif-em not-italic text-royal" style={{ fontStyle: "italic" }}>
                together.
              </em>
            </h3>
            <p className="text-ink-soft text-lg mt-4">
              Each subject lab bundles theory, a code exercise, and MCQs. Finish this week to
              unlock the next — so nobody races ahead and nobody slips away quietly.
            </p>
            <div className="flex flex-wrap gap-2.5 mt-[22px]">
              {tags.map((t) => (
                <span
                  key={t}
                  className="font-mono text-[13px] text-royal bg-royal/[0.08] border border-royal/[0.16] px-[14px] py-[7px] rounded-full"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div className="md:order-1">
            <div className="rounded-[30px] border border-line shadow-[0_24px_60px_rgba(36,48,216,0.12)]" style={{ background: "linear-gradient(135deg,#EAF1FF,#F3F6FF)" }}>
              <LabsRail />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
