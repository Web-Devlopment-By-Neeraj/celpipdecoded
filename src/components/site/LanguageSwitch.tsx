"use client";

import { useSyncExternalStore } from "react";
import { Noto_Sans_Devanagari, Noto_Sans_Gurmukhi } from "next/font/google";
import { followLine, LANGUAGES, switchLanguages } from "@/features/public-site/courses";

const devanagari = Noto_Sans_Devanagari({
  weight: ["400", "600"],
  subsets: ["devanagari"],
  display: "swap",
});

const gurmukhi = Noto_Sans_Gurmukhi({
  weight: ["400", "600"],
  subsets: ["gurmukhi"],
  display: "swap",
});

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function readLanguage() {
  return window.localStorage.getItem("cd_course_lang") ?? "en";
}

export function LanguageSwitch({
  onChange,
}: {
  onChange?: (code: string) => void;
}) {
  const options = switchLanguages(LANGUAGES);
  const selected = useSyncExternalStore(subscribe, readLanguage, () => "en");

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Course language">
        {options.map((option) => {
          const disabled = option.status !== "live";
          return (
            <button
              key={option.code}
              type="button"
              role="radio"
              aria-checked={selected === option.code}
              disabled={disabled}
              lang={option.code}
              className="min-h-11 rounded-full px-4 text-base font-semibold ring-1 ring-ink/15 disabled:opacity-60"
              style={{
                fontFamily:
                  option.code === "hi"
                    ? devanagari.style.fontFamily
                    : option.code === "pa"
                      ? gurmukhi.style.fontFamily
                      : undefined,
              }}
              onClick={() => {
                if (disabled) return;
                window.localStorage.setItem("cd_course_lang", option.code);
                listeners.forEach((listener) => listener());
                onChange?.(option.code);
                void fetch("/api/analytics", {
                  method: "POST",
                  headers: { "content-type": "application/json" },
                  body: JSON.stringify({ name: "lesson_played", props: { lang: option.code } }),
                });
              }}
            >
              {option.nativeName}
              {disabled ? " · Soon" : ""}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-sm">{followLine(LANGUAGES)}</p>
    </div>
  );
}
