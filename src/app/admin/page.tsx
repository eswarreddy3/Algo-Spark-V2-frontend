import type { Metadata } from "next";
import AdminApp from "@/components/admin/AdminApp";
import { AuthGuard } from "@/components/AuthGuard";

export const metadata: Metadata = {
  title: "College Admin Prototype — AlgoSpark",
  description:
    "Clickable prototype of the AlgoSpark college admin console: cohort dashboard, student drill-down, lab publishing, question authoring, exams, leaderboards, reports and support.",
};

export default function AdminPrototypePage() {
  return (
    <AuthGuard role="admin">
      <AdminApp />
    </AuthGuard>
  );
}
