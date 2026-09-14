"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  Sparkles,
} from "lucide-react";
import { DEMO_ACCOUNTS, ROLE_HOME, signIn, useSession, type Role } from "@/lib/auth";
import { GlowOrbs } from "./GlowOrbs";

const ROLES: { id: Role; label: string; icon: typeof GraduationCap }[] = [
  { id: "student", label: "Student", icon: GraduationCap },
  { id: "admin", label: "College Admin", icon: Building2 },
];

// Brand-panel copy swaps with the selected role so the page speaks to whoever is signing in.
const PANEL: Record<Role, { eyebrow: string; lead: string; em: string; body: string; points: string[] }> = {
  student: {
    eyebrow: "For students",
    lead: "Write code.",
    em: "Get graded in seconds.",
    body: "Pick up your sem-wise labs, practice placement-style problems, and get line-by-line AI feedback the moment you submit.",
    points: ["Sem-wise labs & practice sets", "Instant AI grading with hints", "Placement-style mock exams"],
  },
  admin: {
    eyebrow: "For colleges",
    lead: "Every cohort.",
    em: "One live dashboard.",
    body: "Publish labs and exams, watch progress in real time, and export department-ready reports without chasing spreadsheets.",
    points: ["Publish labs & exams in minutes", "Live cohort & department analytics", "One-click downloadable reports"],
  },
};

function Wordmark({ dark = false }: { dark?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center gap-[11px]" aria-label="AlgoSpark home">
      <Image src="/algospark_logo.png" alt="" width={1850} height={1850} priority className="w-9 h-9 object-contain" />
      <span className={`font-display font-bold text-[22px] tracking-tight ${dark ? "text-white" : "text-ink"}`}>
        Algo
        <span className="bg-clip-text text-transparent" style={{ backgroundImage: "var(--blue-grad)" }}>
          Spark
        </span>
      </span>
    </Link>
  );
}

function FeedbackPreview({ role }: { role: Role }) {
  return (
    <div className="relative rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-md p-5 shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="grid place-items-center w-8 h-8 rounded-lg" style={{ backgroundImage: "var(--brand-grad)" }}>
            {role === "student" ? <Sparkles size={16} className="text-white" /> : <BarChart3 size={16} className="text-white" />}
          </span>
          <div>
            <div className="font-display font-semibold text-[14px] text-white">
              {role === "student" ? "AI Feedback · Lab 4" : "CSE · Sem 5 overview"}
            </div>
            <div className="font-mono text-[11px] text-white/50">
              {role === "student" ? "binary_search.py" : "Updated just now"}
            </div>
          </div>
        </div>
        <span className="font-mono text-[11px] text-gold bg-gold/10 border border-gold/25 px-2 py-0.5 rounded-full">
          {role === "student" ? "92 / 100" : "Live"}
        </span>
      </div>

      {role === "student" ? (
        <div className="mt-4 space-y-2.5 text-[13px]">
          <div className="flex gap-2.5 text-white/80">
            <CheckCircle2 size={16} className="text-[#5ad6b0] flex-none mt-0.5" />
            Correct on all 12 test cases, O(log n) as expected.
          </div>
          <div className="flex gap-2.5 text-white/80">
            <Sparkles size={16} className="text-gold flex-none mt-0.5" />
            <span>
              Use <code className="font-mono text-sky-lt">mid = lo + (hi - lo) // 2</code> to avoid overflow in other languages.
            </span>
          </div>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-3 gap-3">
          {[
            { v: "86%", l: "Lab completion" },
            { v: "74", l: "Avg exam score" },
            { v: "312", l: "Active today" },
          ].map((s) => (
            <div key={s.l} className="rounded-xl bg-white/[0.05] border border-white/10 px-3 py-2.5">
              <div className="font-display font-bold text-[20px] text-white tabular-nums">{s.v}</div>
              <div className="text-[11px] text-white/50 leading-tight mt-0.5">{s.l}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function LoginForm({ initialRole }: { initialRole: Role }) {
  const router = useRouter();
  const session = useSession();
  const [role, setRole] = useState<Role>(initialRole);
  const [email, setEmail] = useState(DEMO_ACCOUNTS[initialRole].email);
  const [password, setPassword] = useState(DEMO_ACCOUNTS[initialRole].password);
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Already signed in → straight to the right dashboard.
  useEffect(() => {
    if (session) router.replace(ROLE_HOME[session.role]);
  }, [session, router]);

  const pickRole = (r: Role) => {
    setRole(r);
    setEmail(DEMO_ACCOUNTS[r].email);
    setPassword(DEMO_ACCOUNTS[r].password);
    setError("");
  };

  const fillDemo = () => {
    setEmail(DEMO_ACCOUNTS[role].email);
    setPassword(DEMO_ACCOUNTS[role].password);
    setError("");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const result = signIn(role, email, password);
    if (typeof result === "string") {
      setError(result);
      setBusy(false);
      return;
    }
    router.replace(ROLE_HOME[result.role]);
  };

  const panel = PANEL[role];

  return (
    <main className="min-h-screen grid lg:grid-cols-[1.05fr_1fr] bg-paper">
      {/* Brand panel */}
      <aside className="relative isolate hidden lg:flex flex-col justify-between overflow-hidden bg-ink-grad text-white px-12 xl:px-16 py-12">
        <GlowOrbs variant="dark" />
        <div
          className="absolute inset-0 -z-10 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            maskImage: "radial-gradient(ellipse at 30% 40%, black 30%, transparent 75%)",
          }}
          aria-hidden="true"
        />

        <Wordmark dark />

        <div className="max-w-[500px] py-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={role}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
            >
              {/* Spacing lives on the eyebrow: globals.css zeroes heading margins outside Tailwind's layers. */}
              <span className="flex items-center gap-2 mb-5 font-mono text-[12px] tracking-wide uppercase text-gold">
                <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse-ring" />
                {panel.eyebrow}
              </span>
              <h2 className="text-[44px] xl:text-[52px] text-white">
                {panel.lead}
                <br />
                <span className="font-serif-em text-[1.08em] bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(120deg,#7fc0fa,#c4b5fd 50%,#fbbf24)" }}>
                  {panel.em}
                </span>
              </h2>
              <p className="mt-5 text-[16px] leading-relaxed text-white/65">{panel.body}</p>
              <ul className="mt-6 space-y-2.5">
                {panel.points.map((p) => (
                  <li key={p} className="flex items-center gap-2.5 text-[15px] text-white/85">
                    <CheckCircle2 size={17} className="text-sky-lt flex-none" />
                    {p}
                  </li>
                ))}
              </ul>
              <div className="mt-9 animate-float-a">
                <FeedbackPreview role={role} />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <p className="text-[13px] text-white/45">Trusted by 40+ colleges · 1,248 active students</p>
      </aside>

      {/* Form */}
      <section className="relative isolate flex flex-col px-5 sm:px-10 py-8 sm:py-10">
        <GlowOrbs variant="light" />

        <div className="flex items-center justify-between">
          <div className="lg:hidden">
            <Wordmark />
          </div>
          <Link
            href="/"
            className="ml-auto inline-flex items-center gap-1.5 text-[14px] font-semibold text-ink-soft hover:text-ink transition-colors"
          >
            <ArrowLeft size={16} />
            Back to home
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center py-10">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.2, 0.7, 0.2, 1] }}
            className="w-full max-w-[420px]"
          >
            <h1 className="text-[32px] sm:text-[36px] text-ink">
              Welcome <span className="font-serif-em text-[1.1em] text-royal">back</span>
            </h1>
            <p className="mt-2.5 text-[15.5px] text-ink-soft">Sign in to continue to your AlgoSpark workspace.</p>

            <div
              className="relative mt-7 grid grid-cols-2 p-1 rounded-2xl bg-white border border-line shadow-[0_2px_10px_rgba(16,20,51,0.04)]"
              role="radiogroup"
              aria-label="Account type"
            >
              {ROLES.map((r) => {
                const active = role === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => pickRole(r.id)}
                    className={`relative z-10 flex items-center justify-center gap-2 rounded-xl py-2.5 text-[14.5px] font-semibold transition-colors cursor-pointer ${
                      active ? "text-white" : "text-ink-mute hover:text-ink"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="role-pill"
                        className="absolute inset-0 -z-10 rounded-xl shadow-[0_6px_16px_rgba(36,48,216,0.28)]"
                        style={{ backgroundImage: "var(--blue-grad)" }}
                        transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      />
                    )}
                    <r.icon size={17} />
                    {r.label}
                  </button>
                );
              })}
            </div>

            <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-[14px] font-semibold text-ink">Email</span>
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-mute pointer-events-none" />
                  <input
                    type="email"
                    required
                    autoComplete="username"
                    placeholder="you@college.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border-2 border-line bg-white pl-11 pr-3.5 py-3 text-ink placeholder:text-ink-mute/60 outline-none transition-[border-color,box-shadow] focus:border-royal focus:shadow-[0_0_0_4px_rgba(36,48,216,0.1)]"
                  />
                </div>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="flex items-center justify-between text-[14px] font-semibold text-ink">
                  Password
                  <span className="text-[13px] font-medium text-ink-mute">Forgot? Ask your admin</span>
                </span>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-mute pointer-events-none" />
                  <input
                    type={showPw ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border-2 border-line bg-white pl-11 pr-11 py-3 text-ink placeholder:text-ink-mute/60 outline-none transition-[border-color,box-shadow] focus:border-royal focus:shadow-[0_0_0_4px_rgba(36,48,216,0.1)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((s) => !s)}
                    aria-label={showPw ? "Hide password" : "Show password"}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-ink-mute hover:text-ink cursor-pointer"
                  >
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>

              <AnimatePresence>
                {error && (
                  <motion.p
                    role="alert"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-[14px] text-[#E5484D] bg-[#FDECEC] border border-[#F8CFCF] rounded-xl px-3.5 py-2.5"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={busy}
                className="group mt-1 inline-flex items-center justify-center gap-2 font-semibold text-[16px] text-white rounded-2xl py-3.5 shadow-[0_10px_24px_rgba(36,48,216,0.24)] transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(36,48,216,0.32)] disabled:opacity-70 disabled:hover:translate-y-0 cursor-pointer"
                style={{ backgroundImage: "var(--blue-grad)" }}
              >
                {busy ? <Loader2 size={18} className="animate-spin" /> : null}
                Log in as {role === "student" ? "Student" : "College Admin"}
                {!busy && <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />}
              </button>
            </form>

            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-dashed border-violet/40 bg-violet/[0.06] px-4 py-3">
              <span className="grid place-items-center w-9 h-9 rounded-xl bg-white border border-line flex-none">
                <KeyRound size={17} className="text-violet-deep" />
              </span>
              <div className="min-w-0 flex-1 text-[13px] leading-snug">
                <div className="font-semibold text-ink">Demo {role === "student" ? "student" : "admin"} account</div>
                <div className="font-mono text-[12px] text-ink-mute truncate">
                  {DEMO_ACCOUNTS[role].email} · {DEMO_ACCOUNTS[role].password}
                </div>
              </div>
              <button
                type="button"
                onClick={fillDemo}
                className="text-[13px] font-semibold text-royal hover:underline cursor-pointer flex-none"
              >
                Autofill
              </button>
            </div>

            <p className="mt-8 text-center text-[14px] text-ink-soft">
              New college?{" "}
              <Link href="/#book" className="font-semibold text-royal hover:underline">
                Book a demo
              </Link>
            </p>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
