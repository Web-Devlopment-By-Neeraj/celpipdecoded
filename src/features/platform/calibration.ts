// Calibration compares today's scores with known levels and the previous
// run. Positive signed error means the model was more generous.

export type CalibrationSample = {
  id: string;
  label: string;
  knownLevel: number;
  retiredAt: Date | null;
};

export type CalibrationRun = {
  sampleId: string;
  batchId: string;
  modelVersion: string;
  scoredLevel: number;
  runAt: Date;
  costCents: number;
};

export type CalibrationRow = {
  sampleId: string;
  label: string;
  knownLevel: number;
  todayLevel: number;
  delta: number;
  previousLevel: number | null;
  deltaVsPrevious: number | null;
};

export type CalibrationSummary = {
  rows: CalibrationRow[];
  meanSignedError: number;
  meanAbsoluteError: number;
  withinOneLevelPercent: number;
  driftingGenerous: boolean;
  modelChanged: boolean;
};

export function activeSamples(samples: CalibrationSample[]): CalibrationSample[] {
  return samples.filter((sample) => sample.retiredAt === null);
}

export function summarizeBatch(
  samples: CalibrationSample[],
  runs: CalibrationRun[],
  batchId: string,
  generousAlert: number,
): CalibrationSummary {
  const current = runs.filter((run) => run.batchId === batchId);
  const rows: CalibrationRow[] = current.map((run) => {
    const sample = samples.find((item) => item.id === run.sampleId);
    const known = sample?.knownLevel ?? 0;
    const earlier = runs
      .filter(
        (item) =>
          item.sampleId === run.sampleId &&
          item.batchId !== batchId &&
          item.runAt.getTime() < run.runAt.getTime(),
      )
      .sort((a, b) => b.runAt.getTime() - a.runAt.getTime())[0];
    return {
      sampleId: run.sampleId,
      label: sample?.label ?? run.sampleId,
      knownLevel: known,
      todayLevel: run.scoredLevel,
      delta: run.scoredLevel - known,
      previousLevel: earlier?.scoredLevel ?? null,
      deltaVsPrevious: earlier ? run.scoredLevel - earlier.scoredLevel : null,
    };
  });

  const signed = rows.reduce((sum, row) => sum + row.delta, 0);
  const absolute = rows.reduce((sum, row) => sum + Math.abs(row.delta), 0);
  const within = rows.filter((row) => Math.abs(row.delta) <= 1).length;
  const count = rows.length || 1;
  const previousVersion = runs.find((run) => run.batchId !== batchId)?.modelVersion;
  const currentVersion = current[0]?.modelVersion;

  return {
    rows,
    meanSignedError: rows.length ? signed / rows.length : 0,
    meanAbsoluteError: rows.length ? absolute / rows.length : 0,
    withinOneLevelPercent: rows.length ? (within / count) * 100 : 0,
    driftingGenerous: rows.length > 0 && signed / rows.length > generousAlert,
    modelChanged: Boolean(previousVersion && currentVersion && previousVersion !== currentVersion),
  };
}

export function calibrationSpend(runs: CalibrationRun[]): number {
  return runs.reduce((sum, run) => sum + run.costCents, 0);
}
