"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CrsForm() {
  const router = useRouter();
  const [score, setScore] = useState("");
  const [error, setError] = useState("");

  return (
    <form
      className="mt-6"
      onSubmit={(event) => {
        event.preventDefault();
        const value = Number(score);
        if (!Number.isInteger(value) || value < 0 || value > 1200) {
          setError("Enter a whole number from 0 to 1200.");
          return;
        }
        router.push(`/express-entry-draws?score=${value}`);
      }}
    >
      <label className="text-sm font-semibold">
        CRS score
        <input
          inputMode="numeric"
          value={score}
          onChange={(event) => setScore(event.target.value)}
          className="mt-1 min-h-11 w-full rounded-xl border border-ink/15 px-3 text-base"
        />
      </label>
      {error ? <p className="mt-2 text-sm text-red-800">{error}</p> : null}
      <button type="submit" className="mt-4 min-h-11 rounded-full bg-brand px-5 text-sm font-semibold text-white">
        Compare with draws
      </button>
    </form>
  );
}
