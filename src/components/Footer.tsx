import Image from "next/image";

const columns = [
  {
    heading: "Learn",
    links: [
      { href: "#journey", label: "How it works" },
      { href: "#tech", label: "Tech courses" },
      { href: "#nontech", label: "Non-tech courses" },
      { href: "#labs", label: "Labs" },
      { href: "#exams", label: "Exams" },
    ],
  },
  {
    heading: "Colleges",
    links: [
      { href: "#admin", label: "Admin dashboard" },
      { href: "#admin", label: "Student reports" },
      { href: "#admin", label: "Leaderboards" },
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
              Learn. Think. Innovate. The college platform where students train on tech and
              non-tech courses, sem-wise labs, and AI-graded exams — fully visible to your admin
              dashboard.
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
          <a
            href="https://www.fynityinnovations.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2.5 rounded-full border border-royal/20 bg-white pl-2 pr-4 py-1.5 shadow-[0_4px_18px_rgba(36,48,216,0.12)] transition-all duration-200 hover:-translate-y-0.5 hover:border-royal/40 hover:shadow-[0_8px_24px_rgba(36,48,216,0.2)]"
          >
            <Image src="/fynity.png" alt="" width={698} height={698} className="w-7 h-7 flex-none object-contain" />
            <span className="text-sm text-ink-mute">
              Developed by{" "}
              <span className="font-semibold bg-clip-text text-transparent" style={{ backgroundImage: "var(--blue-grad)" }}>
                Fynity Innovations LLP
              </span>
            </span>
            <span className="text-ink-mute transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true">
              ↗
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
}
