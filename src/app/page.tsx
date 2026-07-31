import { SvgDefs } from "@/components/SvgDefs";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Marquee } from "@/components/Marquee";
import { Banner } from "@/components/Banner";
import { Journey } from "@/components/Journey";
import { ArenaSection } from "@/components/ArenaSection";
import { LabsSection } from "@/components/LabsSection";
import { NonTechSection } from "@/components/NonTechSection";
import { ExamsSection } from "@/components/ExamsSection";
import { AIEvaluationSection } from "@/components/AIEvaluationSection";
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
        <Banner
          id="built-for-colleges"
          src="https://images.unsplash.com/photo-1568333261345-0918efdce2d9?fm=jpg&q=80&w=1920&auto=format&fit=crop"
          alt="Students working on laptops together in a college lab"
          kicker="Built for engineering colleges"
          heading={
            <>
              Not a demo. A platform built for a real{" "}
              <em className="font-serif-em not-italic text-gold-deep" style={{ fontStyle: "italic" }}>
                classroom.
              </em>
            </>
          }
          subtext="From first-year orientation to final placements, AlgoSpark runs in the same lab rooms and browsers your students already use."
        />
        <Journey />
        <ArenaSection />
        <LabsSection />
        <NonTechSection />
        <ExamsSection />
        <AIEvaluationSection />
        <AdminSection />
        <Outcomes />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
