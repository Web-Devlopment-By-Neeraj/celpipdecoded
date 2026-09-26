import { LandingHeader } from "@/components/landing/LandingHeader";
import { ProgramHeroSection } from "@/components/landing/ProgramHeroSection";
import { IncludedSection } from "@/components/landing/IncludedSection";
import { LiveClassesSection } from "@/components/landing/LiveClassesSection";
import { AiPracticeSection } from "@/components/landing/AiPracticeSection";
import { CollegeMomentsSection } from "@/components/landing/CollegeMomentsSection";
import { ProgramOptionsSection } from "@/components/landing/ProgramOptionsSection";
import { EarlyAccessForm } from "@/components/landing/EarlyAccessForm";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <LandingHeader />
      <main className="flex-1">
        <ProgramHeroSection />
        <IncludedSection />
        <LiveClassesSection />
        <AiPracticeSection />
        <CollegeMomentsSection />
        <ProgramOptionsSection />
        <EarlyAccessForm />
      </main>
      <Footer />
    </div>
  );
}
