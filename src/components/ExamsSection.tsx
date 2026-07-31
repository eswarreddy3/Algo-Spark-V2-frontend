import { Reveal } from "./Reveal";
import { QuizIcon, CodeBracketsIcon, EmailIcon, ReadingIcon } from "./icons";

const items = [
  {
    icon: QuizIcon,
    bg: "var(--gold-grad)",
    title: "MCQs",
    text: "Timed multiple-choice sections across every subject",
  },
  {
    icon: CodeBracketsIcon,
    bg: "linear-gradient(135deg,#2430D8,#4DA3F5)",
    title: "Coding questions",
    text: "Auto-judged against hidden test cases",
  },
  {
    icon: EmailIcon,
    bg: "linear-gradient(135deg,#1EC8DC,#4DA3F5)",
    title: "Email writing",
    text: "AI evaluated for tone, clarity, and structure",
  },
  {
    icon: ReadingIcon,
    bg: "linear-gradient(135deg,#8B7CE8,#2F5BF0)",
    title: "Paragraph reading",
    text: "AI evaluated comprehension and fluency",
  },
];

export function ExamsSection() {
  return (
    <section className="py-24 sm:py-[100px] bg-cream" id="exams">
      <div className="mx-auto max-w-[1180px] px-6">
        <Reveal className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div className="md:order-2">
            <span className="font-mono text-[13px] font-medium tracking-[0.16em] uppercase text-blue">
              Exams
            </span>
            <h3 className="text-[28px] sm:text-[34px] md:text-[40px] tracking-[-0.02em] mt-3.5">
              One sitting, every skill{" "}
              <em className="font-serif-em not-italic text-royal" style={{ fontStyle: "italic" }}>
                graded.
              </em>
            </h3>
            <p className="text-ink-soft text-lg mt-4">
              Section-wise exams bring MCQs, coding questions, email writing, and paragraph
              reading into a single test. AI evaluates the language sections instantly, and every
              section rolls up into points and marks.
            </p>
          </div>
          <div className="md:order-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {items.map((it) => {
              const Icon = it.icon;
              return (
                <div
                  key={it.title}
                  className="flex flex-col gap-3 bg-white rounded-2xl px-4 py-4 shadow-[0_4px_16px_rgba(16,20,51,0.05)]"
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
