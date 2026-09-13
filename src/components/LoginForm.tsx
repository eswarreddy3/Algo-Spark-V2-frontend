"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, Eye, EyeOff, GraduationCap, Loader2 } from "lucide-react";
import { DEMO_ACCOUNTS, ROLE_HOME, signIn, useSession, type Role } from "@/lib/auth";

const ROLES: { id: Role; label: string; sub: string; icon: typeof GraduationCap }[] = [
  { id: "student", label: "Student", sub: "Labs, practice & exams", icon: GraduationCap },
  { id: "admin", label: "College Admin", sub: "Cohorts, reports & publishing", icon: Building2 },
];

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

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10 bg-cream">
      <div className="w-full max-w-[440px]">
        <Link href="/" className="flex items-center justify-center gap-[11px] mb-8" aria-label="AlgoSpark home">
          <Image src="/algospark_logo.png" alt="" width={1850} height={1850} className="w-10 h-10 object-contain" />
          <span className="font-display font-bold text-[24px] tracking-tight text-ink">
            Algo
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: "var(--blue-grad)" }}>
              Spark
            </span>
          </span>
        </Link>

        <div className="bg-white border border-line rounded-3xl p-6 sm:p-8 shadow-[0_18px_44px_rgba(16,20,51,0.08)]">
          <h1 className="text-[26px] text-ink">Welcome back</h1>
          <p className="mt-2 text-ink-soft">Choose how you&apos;re signing in.</p>

          <div className="grid grid-cols-2 gap-3 mt-6" role="radiogroup" aria-label="Account type">
            {ROLES.map((r) => {
              const active = role === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => pickRole(r.id)}
                  className={`text-left rounded-2xl border-2 p-3.5 transition-all cursor-pointer ${
                    active ? "border-royal bg-[#F3F4FF]" : "border-line hover:border-ink-mute/40"
                  }`}
                >
                  <r.icon size={22} className={active ? "text-royal" : "text-ink-mute"} />
                  <div className="mt-2 font-display font-semibold text-[15px] text-ink">{r.label}</div>
                  <div className="text-[12.5px] text-ink-mute mt-0.5 leading-snug">{r.sub}</div>
                </button>
              );
            })}
          </div>

          <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-[14px] font-semibold text-ink">Email</span>
              <input
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl border-2 border-line px-3.5 py-2.5 text-ink outline-none focus:border-royal"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[14px] font-semibold text-ink">Password</span>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border-2 border-line pl-3.5 pr-11 py-2.5 text-ink outline-none focus:border-royal"
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

            {error && (
              <p role="alert" className="text-[14px] text-[#E5484D] bg-[#FDECEC] rounded-xl px-3.5 py-2.5">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="mt-1 inline-flex items-center justify-center gap-2 font-semibold text-white rounded-2xl py-3.5 shadow-[0_10px_24px_rgba(36,48,216,0.24)] transition-all hover:-translate-y-0.5 disabled:opacity-70 cursor-pointer"
              style={{ backgroundImage: "var(--blue-grad)" }}
            >
              {busy && <Loader2 size={18} className="animate-spin" />}
              Log in as {role === "student" ? "Student" : "College Admin"}
            </button>
          </form>

          <p className="mt-5 text-[13px] text-ink-mute text-center">
            Demo account: <span className="font-mono">{DEMO_ACCOUNTS[role].email}</span> /{" "}
            <span className="font-mono">{DEMO_ACCOUNTS[role].password}</span>
          </p>
        </div>

        <p className="mt-6 text-center text-[14px] text-ink-soft">
          <Link href="/" className="font-semibold hover:text-ink">← Back to home</Link>
        </p>
      </div>
    </main>
  );
}
