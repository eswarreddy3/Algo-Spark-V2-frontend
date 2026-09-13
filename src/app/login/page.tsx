import type { Metadata } from "next";
import { LoginForm } from "@/components/LoginForm";

export const metadata: Metadata = {
  title: "Log in — AlgoSpark",
  description: "Sign in to AlgoSpark as a student or college admin.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { role } = await searchParams;
  return <LoginForm initialRole={role === "admin" ? "admin" : "student"} />;
}
