import Image from "next/image";
import { FlowLines } from "./FlowLines";
import { Reveal } from "./Reveal";

export function Outcomes() {
  return (
    <section className="py-24 sm:py-[100px] bg-ink text-white relative overflow-hidden" id="outcomes">
      <FlowLines
        viewBox="0 0 1440 500"
        lines={[
          { d: "M-40 380 C 380 260 720 460 1080 320 S 1480 260 1520 400", stroke: "url(#gg)", strokeWidth: 2, opacity: 0.35 },
        ]}
      />
      <div className="relative z-[2] mx-auto max-w-[1180px] px-6">
        <Reveal>
          <Image
            src="/algospark_secondery.png"
            alt="AlgoSpark"
            width={2635}
            height={1004}
            className="h-9 w-auto mb-6"
          />
          <span className="font-mono text-[13px] font-medium tracking-[0.16em] uppercase text-sky">
            Momentum you can measure
          </span>
        </Reveal>
        <Reveal delay={0.1} className="mt-[18px]">
          <p className="font-display font-bold text-[30px] sm:text-[44px] md:text-[58px] leading-[1.14] tracking-[-0.03em] max-w-[16ch]">
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: "var(--gold-grad)" }}>
              4
            </span>{" "}
            ways to practice,{" "}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: "var(--gold-grad)" }}>
              12
            </span>{" "}
            weeks of guided labs,{" "}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: "var(--gold-grad)" }}>
              100%
            </span>{" "}
            in the browser,{" "}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: "var(--gold-grad)" }}>
              0
            </span>{" "}
            setup.
          </p>
        </Reveal>
        <Reveal delay={0.2} className="text-[#AEB6E0] text-lg mt-[26px] max-w-[44ch]">
          Points, ranks, and streaks turn daily practice into visible progress — and give faculty
          a live read on the whole cohort, not just the toppers.
        </Reveal>
      </div>
    </section>
  );
}
