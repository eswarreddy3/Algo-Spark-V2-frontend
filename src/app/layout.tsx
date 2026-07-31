import type { Metadata } from "next";
import { Sora, Instrument_Serif, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import { MotionProvider } from "@/components/MotionProvider";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
});

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "AlgoSpark — AI-Powered Learning Platform for Colleges",
  description:
    "AlgoSpark is the AI-powered college platform for tech & non-tech courses, sem-wise labs, and placement-style exams — with instant AI grading and a live admin dashboard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${instrumentSerif.variable} ${instrumentSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
