"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

const DemoFlow = dynamic(() => import("./DemoFlow").then((mod) => mod.DemoFlow), {
  ssr: false,
});

export function HeroLauncher({
  prepSeconds,
  recordSeconds,
  prompt,
}: {
  prepSeconds: number;
  recordSeconds: number;
  prompt: string;
}) {
  const [started, setStarted] = useState(false);
  if (!started) {
    return (
      <button
        type="button"
        className="inline-flex min-h-11 items-center rounded-full bg-brand px-5 text-sm font-semibold text-white"
        onClick={() => setStarted(true)}
      >
        Start
      </button>
    );
  }
  return <DemoFlow prepSeconds={prepSeconds} recordSeconds={recordSeconds} prompt={prompt} />;
}
