import Image from "next/image";

const columns = [
  {
    heading: "Learn",
    links: [
      { href: "#journey", label: "How it works" },
      { href: "#arena", label: "Coding arena" },
      { href: "#labs", label: "Weekly labs" },
      { href: "#beyond", label: "Non-tech skills" },
    ],
  },
  {
    heading: "Platform",
    links: [
      { href: "#beyond", label: "Exams" },
      { href: "#outcomes", label: "Leaderboards" },
      { href: "#book", label: "Book a demo" },
      { href: "#", label: "Login" },
    ],
  },
  {
    heading: "Company",
    links: [
      { href: "#", label: "About" },
      { href: "#", label: "Support" },
      { href: "#", label: "Privacy" },
      { href: "#", label: "Terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-paper border-t border-line pt-16 pb-[34px]">
      <div className="mx-auto max-w-[1180px] px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-[1.5fr_1fr_1fr_1fr] gap-8 pb-10 border-b border-line">
          <div>
            <a href="#top" className="flex items-center gap-[11px]">
              <Image src="/algospark_logo.png" alt="" width={1850} height={1850} className="w-9 h-9 flex-none object-contain" />
              <span className="font-display font-bold text-[22px] tracking-tight">
                Algo
                <span className="bg-clip-text text-transparent" style={{ backgroundImage: "var(--blue-grad)" }}>
                  Spark
                </span>
              </span>
            </a>
            <p className="text-ink-mute text-[15px] mt-3.5 max-w-[32ch]">
              Learn. Think. Innovate. Where engineering students learn to code by doing — and get
              placement-ready.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.heading}>
              <h4 className="font-display text-sm font-semibold mb-3.5">{col.heading}</h4>
              {col.links.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  className="block text-ink-soft text-[15px] py-[5px] hover:text-royal transition-colors"
                >
                  {l.label}
                </a>
              ))}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between flex-wrap gap-3 pt-[22px]">
          <p className="text-ink-mute text-sm">© 2026 AlgoSpark. All rights reserved.</p>
          <span className="font-mono text-[13px] text-ink-mute">
            Powered by MindSpark · Built by Fynity Innovations LLP
          </span>
        </div>
      </div>
    </footer>
  );
}
