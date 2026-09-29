export type DrawRecord = {
  id: string;
  drawDate: string;
  drawType: string;
  invitations: number;
  minCrs: number;
  tieBreak: string | null;
  sourceUrl: string;
  updatedAt: string;
};

export type DrawFilters = {
  types: string[];
  year: number | null;
  minCrs: number | null;
  maxCrs: number | null;
};

export type DrawFieldError = { field: string; message: string };

export type DrawComparison = {
  drawType: string;
  compared: number;
  atOrBelow: number;
  latestCutoff: number | null;
  gap: number | null;
  label: string;
};

export function filterDraws(draws: DrawRecord[], filters: DrawFilters): DrawRecord[] {
  return draws
    .filter((draw) => {
      if (filters.types.length > 0 && !filters.types.includes(draw.drawType)) {
        return false;
      }
      if (filters.year !== null && yearOf(draw.drawDate) !== filters.year) {
        return false;
      }
      if (filters.minCrs !== null && draw.minCrs < filters.minCrs) return false;
      if (filters.maxCrs !== null && draw.minCrs > filters.maxCrs) return false;
      return true;
    })
    .sort((a, b) => (a.drawDate < b.drawDate ? 1 : -1));
}

export function compareScore(
  draws: DrawRecord[],
  score: number,
  compareCount: number,
): DrawComparison[] {
  const types = [...new Set(draws.map((draw) => draw.drawType))].sort();

  return types.map((drawType) => {
    const matching = draws
      .filter((draw) => draw.drawType === drawType)
      .sort((a, b) => (a.drawDate < b.drawDate ? 1 : -1));
    const slice = matching.slice(0, compareCount);
    const atOrBelow = slice.filter((draw) => draw.minCrs <= score).length;
    const latest = slice[0]?.minCrs ?? null;
    const gap = latest === null ? null : score - latest;
    const label =
      slice.length < compareCount ? `the last ${slice.length}` : `the last ${compareCount}`;

    return {
      drawType,
      compared: slice.length,
      atOrBelow,
      latestCutoff: latest,
      gap,
      label,
    };
  });
}

export function comparisonSentence(score: number): string {
  return `Your score is ${score}. Here is how that compares with the last 12 draws of each type.`;
}

export function validateDrawInput(input: {
  drawDate: string;
  drawType: string;
  invitations: number;
  minCrs: number;
}): DrawFieldError[] {
  const errors: DrawFieldError[] = [];
  if (!input.drawDate) {
    errors.push({ field: "drawDate", message: "Draw date is required." });
  }
  if (!input.drawType.trim()) {
    errors.push({ field: "drawType", message: "Draw type is required." });
  }
  if (!Number.isInteger(input.invitations) || input.invitations < 1) {
    errors.push({
      field: "invitations",
      message: "Invitations must be a positive whole number.",
    });
  }
  if (!Number.isInteger(input.minCrs) || input.minCrs < 0 || input.minCrs > 1200) {
    errors.push({
      field: "minCrs",
      message: "Minimum CRS must be a whole number from 0 to 1200.",
    });
  }
  return errors;
}

export function duplicateDrawWarning(
  draws: DrawRecord[],
  drawDate: string,
  drawType: string,
): string | null {
  const exists = draws.some(
    (draw) => draw.drawDate === drawDate && draw.drawType === drawType,
  );
  return exists
    ? "A draw with this date and type is already listed. You can still save."
    : null;
}

export function drawsToQuery(filters: DrawFilters): string {
  const params = new URLSearchParams();
  if (filters.types.length > 0) params.set("type", filters.types.join(","));
  if (filters.year !== null) params.set("year", String(filters.year));
  if (filters.minCrs !== null) params.set("min", String(filters.minCrs));
  if (filters.maxCrs !== null) params.set("max", String(filters.maxCrs));
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function filtersFromSearch(search: URLSearchParams): DrawFilters {
  const type = search.get("type");
  const year = search.get("year");
  const min = search.get("min");
  const max = search.get("max");
  return {
    types: type ? type.split(",").filter(Boolean) : [],
    year: year ? Number(year) : null,
    minCrs: min ? Number(min) : null,
    maxCrs: max ? Number(max) : null,
  };
}

export function formatDrawDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatInvitations(value: number): string {
  return new Intl.NumberFormat("en-CA").format(value);
}

function yearOf(isoDate: string): number {
  return Number(isoDate.slice(0, 4));
}

export function lastUpdated(draws: DrawRecord[]): string | null {
  if (draws.length === 0) return null;
  return draws.reduce((latest, draw) =>
    draw.updatedAt > latest ? draw.updatedAt : latest,
  draws[0].updatedAt);
}
