"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  compareScore,
  comparisonSentence,
  drawsToQuery,
  filterDraws,
  formatDrawDate,
  formatInvitations,
  type DrawFilters,
  type DrawRecord,
} from "@/features/public-site/draws";

export function DrawsBoard({
  draws,
  filters,
  score,
  compareCount,
}: {
  draws: DrawRecord[];
  filters: DrawFilters;
  score: number | null;
  compareCount: number;
}) {
  const router = useRouter();
  const [localScore, setLocalScore] = useState(score ? String(score) : "");
  const types = useMemo(() => [...new Set(draws.map((draw) => draw.drawType))].sort(), [draws]);
  const years = useMemo(
    () => [...new Set(draws.map((draw) => Number(draw.drawDate.slice(0, 4))))].sort((a, b) => b - a),
    [draws],
  );
  const visible = filterDraws(draws, filters);
  const parsed = Number(localScore);
  const comparison = Number.isInteger(parsed) && parsed >= 0 && parsed <= 1200
    ? compareScore(draws, parsed, compareCount)
    : [];

  function push(next: DrawFilters) {
    const scoreQuery = localScore ? `&score=${localScore}` : "";
    router.push(`/express-entry-draws${drawsToQuery(next)}${drawsToQuery(next) ? scoreQuery : localScore ? `?score=${localScore}` : ""}`);
    void fetch("/api/analytics", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: "draws_filtered",
        props: { types: next.types.join(","), year: next.year ?? "", min: next.minCrs ?? "", max: next.maxCrs ?? "" },
      }),
    });
  }

  return (
    <div className="mt-8 space-y-6">
      <form className="grid gap-3 rounded-3xl bg-white p-4 ring-1 ring-ink/10 md:grid-cols-4" action="/express-entry-draws">
        <label className="text-sm font-semibold">
          Draw type
          <select
            name="type"
            className="mt-1 min-h-11 w-full rounded-xl border border-ink/15 px-3 text-base"
            defaultValue={filters.types[0] ?? ""}
            onChange={(event) => push({ ...filters, types: event.target.value ? [event.target.value] : [] })}
          >
            <option value="">All types</option>
            {types.map((type) => <option key={type}>{type}</option>)}
          </select>
        </label>
        <label className="text-sm font-semibold">
          Year
          <select
            name="year"
            className="mt-1 min-h-11 w-full rounded-xl border border-ink/15 px-3 text-base"
            defaultValue={filters.year ?? ""}
            onChange={(event) => push({ ...filters, year: event.target.value ? Number(event.target.value) : null })}
          >
            <option value="">All years</option>
            {years.map((year) => <option key={year}>{year}</option>)}
          </select>
        </label>
        <label className="text-sm font-semibold">
          Min CRS
          <input name="min" inputMode="numeric" defaultValue={filters.minCrs ?? ""} className="mt-1 min-h-11 w-full rounded-xl border border-ink/15 px-3 text-base" />
        </label>
        <label className="text-sm font-semibold">
          Max CRS
          <input name="max" inputMode="numeric" defaultValue={filters.maxCrs ?? ""} className="mt-1 min-h-11 w-full rounded-xl border border-ink/15 px-3 text-base" />
        </label>
        <button className="min-h-11 rounded-full bg-ink px-4 text-sm font-semibold text-cream" type="submit">Apply filters</button>
        <a className="inline-flex min-h-11 items-center text-sm font-semibold underline" href="/express-entry-draws">Clear filters</a>
      </form>

      <form
        className="rounded-3xl bg-cream p-4"
        onSubmit={(event) => {
          event.preventDefault();
          const next = new URLSearchParams();
          if (filters.types[0]) next.set("type", filters.types[0]);
          if (filters.year) next.set("year", String(filters.year));
          if (localScore) next.set("score", localScore);
          router.push(`/express-entry-draws?${next.toString()}`);
        }}
      >
        <label className="text-sm font-semibold">
          Your CRS score
          <input
            inputMode="numeric"
            value={localScore}
            onChange={(event) => setLocalScore(event.target.value)}
            className="mt-1 min-h-11 w-full max-w-xs rounded-xl border border-ink/15 px-3 text-base"
          />
        </label>
        <button type="submit" className="ml-0 mt-3 min-h-11 rounded-full bg-brand px-4 text-sm font-semibold text-white md:ml-3">
          Compare
        </button>
        {comparison.length > 0 ? (
          <div className="mt-4" aria-live="polite">
            <p>{comparisonSentence(parsed).replace("12", String(compareCount))}</p>
            <p className="mt-1 text-sm">This is general information, not a prediction and not immigration advice.</p>
            <ul className="mt-3 space-y-2 text-sm">
              {comparison.map((item) => (
                <li key={item.drawType}>
                  {item.drawType}: {item.atOrBelow} of {item.label} had a minimum CRS at or below {parsed}.
                  {item.gap !== null ? ` Gap to the latest cut-off: ${item.gap}.` : ""}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </form>

      {visible.length === 0 ? <p>No draws match these filters</p> : null}

      <div className="hidden md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr>
              <th className="py-2">Date</th>
              <th>Draw type</th>
              <th>Invitations</th>
              <th>Minimum CRS</th>
              <th>Tie-break</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((draw) => (
              <tr key={draw.id} className="border-t border-ink/10">
                <td className="py-3">{formatDrawDate(draw.drawDate)}</td>
                <td>{draw.drawType}</td>
                <td>{formatInvitations(draw.invitations)}</td>
                <td>{draw.minCrs}</td>
                <td>{draw.tieBreak ? formatDrawDate(draw.tieBreak) : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="space-y-3 md:hidden">
        {visible.map((draw) => (
          <li key={draw.id} className="rounded-2xl bg-white p-4 ring-1 ring-ink/10">
            <p className="font-semibold">{formatDrawDate(draw.drawDate)}</p>
            <p>{draw.drawType}</p>
            <p>{formatInvitations(draw.invitations)} invitations · CRS {draw.minCrs}</p>
            <p className="text-sm">Tie-break {draw.tieBreak ? formatDrawDate(draw.tieBreak) : "not listed"}</p>
          </li>
        ))}
      </ul>
      <CutoffChart draws={visible} score={Number.isInteger(parsed) ? parsed : null} />
    </div>
  );
}

function CutoffChart({ draws, score }: { draws: DrawRecord[]; score: number | null }) {
  const width = 640;
  const height = 220;
  const max = 1200;
  const points = [...draws].reverse();
  return (
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Minimum CRS over time. The table above is the text alternative." className="w-full">
      {points.map((draw, index) => {
        const x = points.length === 1 ? width / 2 : (index / (points.length - 1)) * (width - 40) + 20;
        const y = height - 20 - (draw.minCrs / max) * (height - 40);
        return <circle key={draw.id} cx={x} cy={y} r="4" fill="#12314f"><title>{`${draw.drawType} ${draw.minCrs}`}</title></circle>;
      })}
      {score !== null ? (
        <line x1="0" x2={width} y1={height - 20 - (score / max) * (height - 40)} y2={height - 20 - (score / max) * (height - 40)} stroke="#0a7a54" strokeDasharray="4 4" />
      ) : null}
    </svg>
  );
}
