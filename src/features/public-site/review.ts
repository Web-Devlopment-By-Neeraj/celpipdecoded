export type ReviewInput = {
  fullName: string;
  email: string | null;
  nameStyle: "first" | "first_initial" | "full";
  listening: number | null;
  reading: number | null;
  writing: number | null;
  speaking: number | null;
  testDate: string;
  before: { listening: number; reading: number; writing: number; speaking: number } | null;
  firstAttempt: boolean;
  body: string;
  instagram: string;
  consentWebsite: boolean;
  consentInstagram: boolean;
  trap: string;
  today: string;
  minChars: number;
  maxChars: number;
  requireEmail: boolean;
};

export type ReviewError = { field: string; message: string };

export function displayName(fullName: string, style: ReviewInput["nameStyle"]): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (style === "full") return parts.join(" ");
  if (style === "first") return parts[0];
  const initial = parts[1]?.[0];
  return initial ? `${parts[0]} ${initial}.` : parts[0];
}

export function normaliseInstagram(value: string): string {
  return value.trim().replace(/^@+/, "");
}

export function validateReview(input: ReviewInput): ReviewError[] {
  const errors: ReviewError[] = [];
  if (!input.fullName.trim()) {
    errors.push({ field: "fullName", message: "Full name is required." });
  }
  if (input.requireEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email ?? "")) {
    errors.push({ field: "email", message: "Email is required." });
  }

  for (const field of ["listening", "reading", "writing", "speaking"] as const) {
    const value = input[field];
    if (value === null || !Number.isInteger(value) || value < 4 || value > 12) {
      errors.push({
        field,
        message: `${field} must be a whole number from 4 to 12.`,
      });
    }
  }

  if (!input.testDate) {
    errors.push({ field: "testDate", message: "Test date is required." });
  } else if (input.testDate > input.today) {
    errors.push({ field: "testDate", message: "Test date cannot be in the future." });
  }

  if (!input.firstAttempt && input.before) {
    for (const [field, value] of Object.entries(input.before)) {
      if (!Number.isInteger(value) || value < 4 || value > 12) {
        errors.push({
          field: `before.${field}`,
          message: `Before ${field} must be a whole number from 4 to 12.`,
        });
      }
    }
  }

  if (input.body.trim().length < input.minChars || input.body.trim().length > input.maxChars) {
    errors.push({
      field: "body",
      message: `Review must be ${input.minChars} to ${input.maxChars} characters.`,
    });
  }

  const instagram = normaliseInstagram(input.instagram);
  if (instagram && !/^[A-Za-z0-9._]{1,30}$/.test(instagram)) {
    errors.push({
      field: "instagram",
      message: "Instagram handle can use letters, numbers, dots and underscores, up to 30 characters.",
    });
  }

  return errors;
}

export function reviewIsSpamTrap(trap: string): boolean {
  return trap.trim().length > 0;
}

export function tokenExpired(requestedAt: string, now: Date, ttlDays: number): boolean {
  const requested = Date.parse(requestedAt);
  if (Number.isNaN(requested)) return true;
  return now.getTime() - requested > ttlDays * 86_400_000;
}

export const WEBSITE_CONSENT =
  "You may show my review, scores and name as chosen above on celpipdecoded.com.";

export const INSTAGRAM_CONSENT =
  "You may share my review on CELPIP Decoded's Instagram. (Nothing is posted automatically.)";

const PROOF_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "application/pdf",
]);

export function proofAllowed(mime: string, bytes: number, maxMb: number): string | null {
  if (!PROOF_TYPES.has(mime)) {
    return "Proof must be a JPG, PNG, WEBP, HEIC or PDF.";
  }
  if (bytes > maxMb * 1024 * 1024) {
    return `Proof must be ${maxMb} MB or smaller.`;
  }
  return null;
}

export function videoAllowed(seconds: number, bytes: number, maxSeconds: number, maxMb: number): string | null {
  if (seconds > maxSeconds + 1) {
    return `Video must be ${maxSeconds} seconds or shorter.`;
  }
  if (bytes > maxMb * 1024 * 1024) {
    return `Video must be ${maxMb} MB or smaller.`;
  }
  return null;
}

// JPEG, PNG, WEBP, PDF and a common HEIC brand. A renamed executable
// does not match any of these.
export function sniffProofMime(bytes: Uint8Array): string | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return "image/png";
  }
  if (bytes.length >= 4 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
    return "application/pdf";
  }
  const head = new TextDecoder().decode(bytes.slice(0, 16));
  if (head.startsWith("RIFF") && head.includes("WEBP")) return "image/webp";
  if (head.includes("ftyp")) return "image/heic";
  return null;
}
