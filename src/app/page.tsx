import { LandingHeader } from "@/components/landing/LandingHeader";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ProgramHeroSection } from "@/components/landing/ProgramHeroSection";
import { IncludedSection } from "@/components/landing/IncludedSection";
import { LiveClassesSection } from "@/components/landing/LiveClassesSection";
import { AiPracticeSection } from "@/components/landing/AiPracticeSection";
import { CollegeMomentsSection } from "@/components/landing/CollegeMomentsSection";
import { ProgramOptionsSection } from "@/components/landing/ProgramOptionsSection";
import { EarlyAccessForm } from "@/components/landing/EarlyAccessForm";
import { Footer } from "@/components/landing/Footer";
import { LeaveOfferDialog } from "@/components/landing/LeaveOfferDialog";

export default async function Home() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const signedIn = Boolean(user);

  return (
    <div className="flex flex-1 flex-col">
      <LandingHeader signedIn={signedIn} />
      <main className="flex-1">
        <ProgramHeroSection signedIn={signedIn} />
        <IncludedSection />
        <LiveClassesSection />
        <AiPracticeSection />
        <CollegeMomentsSection />
        <ProgramOptionsSection />
        <EarlyAccessForm />
      </main>
      <Footer />
      <LeaveOfferDialog />
    </div>
  );
}
