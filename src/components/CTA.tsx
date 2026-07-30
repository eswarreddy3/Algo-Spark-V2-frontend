import Image from "next/image";
import { FlowLines } from "./FlowLines";
import { Reveal } from "./Reveal";
import { Button } from "./Button";

export function CTA() {
  return (
    <section className="pt-10 pb-24 sm:pb-[110px]" id="book">
      <div className="mx-auto max-w-[1180px] px-6">
        <Reveal
          className="relative rounded-[32px] px-6 sm:px-10 py-[56px] sm:py-[70px] text-center text-white overflow-hidden"
          as="div"
        >
          <div className="absolute inset-0 bg-ink -z-10" />
          <FlowLines
            className="-z-[5]"
            viewBox="0 0 1200 420"
            lines={[
              { d: "M-40 120 C 300 40 560 220 900 120 S 1300 60 1320 180", stroke: "url(#bg)", strokeWidth: 2, opacity: 0.5 },
              { d: "M-40 300 C 340 380 620 200 980 320 S 1300 360 1320 260", stroke: "url(#gg)", strokeWidth: 2, opacity: 0.5, delay: 0.3 },
            ]}
          />
          <Image
            src="/algospark_primary.png"
            alt="AlgoSpark — Learn. Think. Innovate."
            width={3840}
            height={2160}
            className="relative z-[2] h-28 sm:h-32 w-auto mx-auto mb-2"
          />
          <h2 className="relative z-[2] text-[32px] sm:text-[42px] md:text-[52px]">
            Bring the{" "}
            <em className="font-serif-em not-italic text-gold-deep" style={{ fontStyle: "italic" }}>
              spark
            </em>{" "}
            to your college.
          </h2>
          <p className="relative z-[2] text-[#B6BEE6] text-[19px] my-5 mx-auto max-w-[46ch]">
            Give your students a real place to practice — and turn everyday effort into
            placement-ready skills.
          </p>
          <div className="relative z-[2] flex gap-3.5 flex-wrap justify-center">
            <Button href="#" icon>
              Book a demo
            </Button>
            <Button href="#journey" variant="glass">
              See how it works
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
