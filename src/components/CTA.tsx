import Image from "next/image";
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
          <Image
            src="https://images.unsplash.com/photo-1758270705317-3ef6142d306f?fm=jpg&q=80&w=1920&auto=format&fit=crop"
            alt="Students collaborating around a laptop"
            fill
            sizes="100vw"
            className="object-cover -z-20"
          />
          <div
            className="absolute inset-0 -z-10"
            style={{
              background:
                "linear-gradient(120deg, rgba(13,15,43,.94) 0%, rgba(13,15,43,.88) 45%, rgba(36,48,216,.55) 78%, rgba(236,72,153,.4) 100%)",
            }}
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
            Give your students a real place to practice — and give your placement cell a live
            dashboard of every student, every course, every lab.
          </p>
          <div className="relative z-[2] flex gap-3.5 flex-wrap justify-center">
            <Button href="#" variant="spark" icon>
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
