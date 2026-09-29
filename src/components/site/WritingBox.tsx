"use client";

import { useEffect, useRef, useState } from "react";
import { countWords } from "@/features/writing/word-count";
import { markMisspellings } from "@/features/public-site/spellcheck";
import { clampWritingText, SPELLCHECK_ATTRIBUTES } from "@/features/public-site/writing-box";

export function WritingBox({
  value,
  onChange,
  readOnly = false,
  ariaLabel,
  id = "writing-box",
  showCount = true,
}: {
  value: string;
  onChange: (text: string, wordCount: number) => void;
  readOnly?: boolean;
  ariaLabel: string;
  id?: string;
  showCount?: boolean;
}) {
  const [dictionary, setDictionary] = useState<Set<string> | null>(null);
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const mirrorRef = useRef<HTMLDivElement>(null);
  const count = countWords(value);
  const countId = `${id}-count`;

  useEffect(() => {
    let cancelled = false;
    import("@/features/public-site/dictionary")
      .then((mod) => {
        if (!cancelled) setDictionary(mod.DICTIONARY);
      })
      .catch(() => {
        if (!cancelled) setDictionary(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const tokens = dictionary ? markMisspellings(value, dictionary) : [{ text: value, misspelled: false }];

  return (
    <div className="min-w-0">
      {showCount ? (
        <p id={countId} className="sticky top-0 z-10 bg-cream py-2 text-sm font-semibold">
          Words: {count}
        </p>
      ) : null}
      <div className="relative min-h-[320px]">
        <div
          ref={mirrorRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden whitespace-pre-wrap break-words p-4 text-base leading-7 text-transparent"
        >
          {tokens.map((token, index) => (
            <span
              key={`${index}-${token.text}`}
              className={token.misspelled ? "underline decoration-red-700 decoration-wavy" : undefined}
            >
              {token.text}
            </span>
          ))}
        </div>
        <textarea
          ref={areaRef}
          id={id}
          value={value}
          readOnly={readOnly}
          aria-label={ariaLabel}
          aria-describedby={showCount ? countId : undefined}
          {...SPELLCHECK_ATTRIBUTES}
          className="relative min-h-[320px] w-full resize-y bg-transparent p-4 text-base leading-7 text-ink outline-none ring-1 ring-ink/15 focus-visible:ring-2 focus-visible:ring-brand"
          onScroll={(event) => {
            if (mirrorRef.current) mirrorRef.current.scrollTop = event.currentTarget.scrollTop;
          }}
          onChange={(event) => {
            const next = clampWritingText(event.target.value);
            onChange(next, countWords(next));
          }}
        />
      </div>
    </div>
  );
}
