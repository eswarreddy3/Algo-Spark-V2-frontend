"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { MenuIcon, CloseIcon } from "./icons";
import { Button } from "./Button";
import { ROLE_HOME, signOut, useSession } from "@/lib/auth";

const navLinks = [
  { href: "#journey", label: "How it works" },
  { href: "#tech", label: "Courses" },
  { href: "#labs", label: "Labs" },
  { href: "#exams", label: "Exams" },
  { href: "#admin", label: "For colleges" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const session = useSession();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-paper/85 backdrop-blur-md shadow-[0_1px_0_var(--line),0_6px_22px_rgba(16,20,51,0.05)]"
          : ""
      }`}
    >
      <div className="mx-auto max-w-[1180px] px-6">
        <nav className="flex items-center justify-between h-[78px]">
          <a href="#top" className="flex items-center gap-[11px]" aria-label="AlgoSpark home">
            <Image src="/algospark_logo.png" alt="" width={1850} height={1850} priority className="w-9 h-9 flex-none object-contain" />
            <span className="font-display font-bold text-[22px] tracking-tight text-ink">
              Algo
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "var(--blue-grad)" }}
              >
                Spark
              </span>
            </span>
          </a>

          <div className="hidden lg:flex gap-7">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="relative py-1 font-medium text-[16px] text-ink-soft hover:text-ink transition-colors group"
              >
                {l.label}
                <span className="absolute left-0 -bottom-0.5 h-0.5 w-0 bg-gold rounded-full transition-all duration-200 group-hover:w-full" />
              </a>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3.5">
            {session ? (
              <>
                <Link href={ROLE_HOME[session.role]} className="font-semibold text-ink-soft hover:text-ink transition-colors">
                  Dashboard
                </Link>
                <button onClick={signOut} className="font-semibold text-ink cursor-pointer">
                  Log out
                </button>
              </>
            ) : (
              <Link href="/login" className="font-semibold text-ink">
                Login
              </Link>
            )}
            <Button href="#book" className="!px-5 !py-2.5 !text-[15px]">
              Book a demo
            </Button>
          </div>

          <button
            className="lg:hidden flex items-center justify-center bg-transparent border-2 border-line rounded-[11px] w-[46px] h-[46px] cursor-pointer text-ink"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <CloseIcon className="w-[22px] h-[22px]" /> : <MenuIcon className="w-[22px] h-[22px]" />}
          </button>
        </nav>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.2, 0.7, 0.2, 1] }}
            className="lg:hidden overflow-hidden border-t border-line bg-paper"
          >
            <div className="flex flex-col px-6 py-5 gap-1">
              {navLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="py-2.5 font-medium text-ink-soft"
                >
                  {l.label}
                </a>
              ))}
              {session ? (
                <>
                  <Link href={ROLE_HOME[session.role]} onClick={() => setOpen(false)} className="py-2.5 font-medium text-ink-soft">
                    Dashboard
                  </Link>
                  <button onClick={() => { signOut(); setOpen(false); }} className="py-2.5 text-left font-semibold text-ink cursor-pointer">
                    Log out
                  </button>
                </>
              ) : (
                <Link href="/login" onClick={() => setOpen(false)} className="py-2.5 font-semibold text-ink">
                  Login
                </Link>
              )}
              <Button href="#book" className="justify-center mt-2" >
                Book a demo
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
