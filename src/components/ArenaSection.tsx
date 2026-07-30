import { Reveal } from "./Reveal";
import { EditorWindow, CodeLine } from "./EditorWindow";

const tags = ["Module-wise problems", "SQL compiler", "Time complexity · Big-O", "Company tags", "Free compile"];

export function ArenaSection() {
  return (
    <section className="py-24 sm:py-[100px]" id="arena">
      <div className="mx-auto max-w-[1180px] px-6">
        <Reveal className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div>
            <span className="font-mono text-[13px] font-medium tracking-[0.16em] uppercase text-blue">
              The coding arena
            </span>
            <h3 className="text-[28px] sm:text-[34px] md:text-[40px] tracking-[-0.02em] mt-3.5">
              A place built to{" "}
              <em className="font-serif-em not-italic text-royal" style={{ fontStyle: "italic" }}>
                write
              </em>{" "}
              code, not just read it.
            </h3>
            <p className="text-ink-soft text-lg mt-4">
              Everything a student needs to practice like it&apos;s an interview — in the browser,
              no setup, no excuses.
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
