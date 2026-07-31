import { SvgDefs } from "@/components/SvgDefs";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Marquee } from "@/components/Marquee";
import { Journey } from "@/components/Journey";
import { ArenaSection } from "@/components/ArenaSection";
import { LabsSection } from "@/components/LabsSection";
import { NonTechSection } from "@/components/NonTechSection";
import { ExamsSection } from "@/components/ExamsSection";
import { AdminSection } from "@/components/AdminSection";
import { Outcomes } from "@/components/Outcomes";
import { CTA } from "@/components/CTA";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <SvgDefs />
      <Header />
      <main>
        <Hero />
        <Marquee />
        <Journey />
        <ArenaSection />
        <LabsSection />
        <NonTechSection />
        <ExamsSection />
        <AdminSection />
        <Outcomes />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
