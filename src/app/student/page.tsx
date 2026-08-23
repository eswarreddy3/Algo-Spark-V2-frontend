import type { Metadata } from "next";
import StudentApp from "@/components/student/StudentApp";

export const metadata: Metadata = {
  title: "Student Prototype — AlgoSpark",
  description:
    "Clickable prototype of the AlgoSpark student experience: labs, tech & non-tech practice, exams, leaderboard and profile.",
};

export default function StudentPrototypePage() {
  return <StudentApp />;
}
