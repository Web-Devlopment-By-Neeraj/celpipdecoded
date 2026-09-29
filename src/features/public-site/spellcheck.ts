const LETTER = /\p{L}/u;

export type SpellToken = {
  text: string;
  misspelled: boolean;
};

export function shouldIgnoreToken(token: string): boolean {
  const core = token.replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/g, "");
  if (!core) return true;
  if (core.length === 1) return true;
  if (/^\d+$/.test(core)) return true;
  if (/^[A-Z]{2,5}$/.test(core)) return true;
  if (core.includes("@") || core.includes("://") || core.startsWith("www.")) return true;
  return false;
}

export function isMisspelled(token: string, dictionary: Set<string>): boolean {
  if (shouldIgnoreToken(token)) return false;
  const core = token.replace(/^[^A-Za-z0-9']+|[^A-Za-z0-9']+$/g, "").toLowerCase();
  if (!LETTER.test(core)) return false;
  return !dictionary.has(core);
}

export function markMisspellings(text: string, dictionary: Set<string>): SpellToken[] {
  const parts = text.split(/(\s+)/);
  return parts.map((part) => ({
    text: part,
    misspelled: part.trim().length > 0 && isMisspelled(part, dictionary),
  }));
}
