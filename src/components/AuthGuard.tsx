"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ROLE_HOME, useSession, type Role } from "@/lib/auth";

/** Renders children only for a signed-in user of `role`; otherwise redirects. */
export function AuthGuard({ role, children }: { role: Role; children: React.ReactNode }) {
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session === undefined) return;
    if (session === null) router.replace(`/login?role=${role}`);
    else if (session.role !== role) router.replace(ROLE_HOME[session.role]);
  }, [session, role, router]);

  if (!session || session.role !== role) {
    return (
      <div className="min-h-screen flex items-center justify-center text-ink-mute font-medium">
        Checking your session…
      </div>
    );
  }
  return <>{children}</>;
}
