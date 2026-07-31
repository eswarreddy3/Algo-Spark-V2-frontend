import { Reveal } from "./Reveal";
import { EditorWindow, CodeLine } from "./EditorWindow";
import { LearnIcon, CodeBracketsIcon, QuizIcon } from "./icons";

const moduleParts = [
  { icon: LearnIcon, label: "Theory (PPT)" },
  { icon: CodeBracketsIcon, label: "Code + test cases" },
  { icon: QuizIcon, label: "MCQs practice" },
];

const languages = ["Python", "Java", "C++", "C", "JavaScript", "Go", "SQL"];

export function ArenaSection() {
  return (
    <section className="py-24 sm:py-[100px]" id="tech">
      <div className="mx-auto max-w-[1180px] px-6">
        <Reveal className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div>
            <span className="font-mono text-[13px] font-medium tracking-[0.16em] uppercase text-blue">
              Tech courses
            </span>
            <h3 className="text-[28px] sm:text-[34px] md:text-[40px] tracking-[-0.02em] mt-3.5">
              Every module built to{" "}
              <em className="font-serif-em not-italic text-royal" style={{ fontStyle: "italic" }}>
                write
              </em>{" "}
              code, not just read it.
            </h3>
            <p className="text-ink-soft text-lg mt-4">
              Each course is broken into modules — short theory, a graded code exercise, and MCQs
              for practice. Then it&apos;s time for the coding arena: a full playground that
              compiles 6+ languages, including SQL, right in the browser.
            </p>
            <div className="flex flex-wrap gap-2.5 mt-[22px]">
              {moduleParts.map((m) => {
                const Icon = m.icon;
                return (
                  <span
                    key={m.label}
                    className="inline-flex items-center gap-2 font-mono text-[13px] text-royal bg-royal/[0.08] border border-royal/[0.16] px-[14px] py-[7px] rounded-full"
                  >
                    <Icon className="w-[14px] h-[14px]" />
                    {m.label}
                  </span>
                );
              })}
            </div>
            <div className="mt-6">
              <span className="font-mono text-[12px] tracking-[0.1em] uppercase text-ink-mute">
                Coding arena languages
              </span>
              <div className="flex flex-wrap gap-2 mt-2.5">
                {languages.map((lang) => (
                  <span
                    key={lang}
                    className="font-mono text-[12.5px] text-ink-soft bg-cream border border-line px-3 py-[5px] rounded-md"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="relative">
            <div
              className="relative p-[22px] rounded-[30px] shadow-[0_30px_70px_rgba(36,48,216,0.22)]"
              style={{ background: "#0E1230" }}
            >
              <EditorWindow filename="query.sql" lang="SQL" runLabel="Run query" result="4 rows · 12 ms" bordered={false}>
                <CodeLine>
                  <span className="code-cm">-- top scorer per branch</span>
                </CodeLine>
                <CodeLine>
                  <span className="code-kw">SELECT</span> branch, name, <span className="code-fn">MAX</span>(score)
                </CodeLine>
                <CodeLine>
                  <span className="code-kw">FROM</span> students
                </CodeLine>
                <CodeLine>
                  <span className="code-kw">GROUP BY</span> branch
                </CodeLine>
                <CodeLine>
                  <span className="code-kw">ORDER BY</span> score <span className="code-kw">DESC</span>;
                </CodeLine>
              </EditorWindow>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
