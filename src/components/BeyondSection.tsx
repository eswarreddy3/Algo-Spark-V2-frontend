import { Reveal } from "./Reveal";
import { EmailIcon, ReadingIcon, ExamIcon } from "./icons";

const items = [
  {
    icon: EmailIcon,
    bg: "linear-gradient(135deg,#1EC8DC,#4DA3F5)",
    title: "AI email writing",
    text: "Real feedback on tone, clarity, and structure",
  },
  {
    icon: ReadingIcon,
    bg: "linear-gradient(135deg,#8B7CE8,#2F5BF0)",
    title: "AI paragraph reading",
    text: "Comprehension practice that builds real fluency",
  },
  {
    icon: ExamIcon,
    bg: "var(--gold-grad)",
    title: "Section-wise exams",
    text: "MCQs, coding, email & paragraph in one sitting",
  },
];

export function BeyondSection() {
  return (
    <section className="py-24 sm:py-[100px]" id="beyond">
      <div className="mx-auto max-w-[1180px] px-6">
        <Reveal className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div>
            <span className="font-mono text-[13px] font-medium tracking-[0.16em] uppercase text-blue">
              Beyond code
            </span>
            <h3 className="text-[28px] sm:text-[34px] md:text-[40px] tracking-[-0.02em] mt-3.5">
              Placements test{" "}
              <em className="font-serif-em not-italic text-royal" style={{ fontStyle: "italic" }}>
                more
              </em>{" "}
              than algorithms.
            </h3>
            <p className="text-ink-soft text-lg mt-4">
              So students practice the other half too — communication and full assessments,
              guided by AI.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            {items.map((it) => {
              const Icon = it.icon;
              return (
                <div
                  key={it.title}
                  className="flex items-center gap-[13px] bg-white rounded-2xl px-4 py-[14px] shadow-[0_4px_16px_rgba(16,20,51,0.05)]"
                >
                  <span
                    className="w-[38px] h-[38px] rounded-[11px] flex-none flex items-center justify-center text-white"
                    style={{ backgroundImage: it.bg }}
                  >
                    <Icon className="w-[19px] h-[19px]" />
                  </span>
                  <div>
                    <b className="font-display font-semibold text-[15px] block">{it.title}</b>
                    <span className="text-[13px] text-ink-mute">{it.text}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
