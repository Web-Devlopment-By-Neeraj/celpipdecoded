"use client";

import { createContext, useContext, type ReactNode } from "react";
import { playerBar } from "@/features/exam-engine/mock-test-player-theme";

const MockSaveStatusContext = createContext<string | null>(null);

export function MockSaveStatusProvider({
  status,
  children,
}: {
  status: string | null;
  children: ReactNode;
}) {
  return (
    <MockSaveStatusContext.Provider value={status}>
      {children}
    </MockSaveStatusContext.Provider>
  );
}

export function MockSaveStatusBadge() {
  const status = useContext(MockSaveStatusContext);
  if (!status) return null;

  return (
    <span className={playerBar.meta} aria-live="polite">
      {status}
    </span>
  );
}
