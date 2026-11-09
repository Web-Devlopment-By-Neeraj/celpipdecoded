import type { Metadata } from "next";
import { AppPageShell } from "@/components/app/AppPageShell";

export const metadata: Metadata = {
  title: "Ask Amar - CELPIP Decoded",
  description: "Ask a practice question. Amar answers account and immigration questions.",
};

export default function AskAmarPage() {
  return (
    <AppPageShell
      eyebrow="Learn with Amar"
      title="Ask Amar"
      description="The AI assistant button on this screen answers from help articles and can say the reply out loud. Questions about immigration, refunds, or your account go to Amar."
      width="narrow"
    >
      <p className="text-sm leading-6 text-ink/70">
        Open the assistant from the corner of the page. You are already signed in, so the question is attached to you.
      </p>
    </AppPageShell>
  );
}
