// Types for the estimated CELPIP Listening band (EXAM-15C).
//
// Types only, no runtime values, so this file can be imported from a server
// component or a client component without pulling behaviour along with it.
// Same rule listening-types.ts and listening-review-types.ts follow.
//
// House style: normal hyphens only, no long hyphens or em dashes.

// One row of the Listening score chart in the program materials.
//
// level is the label exactly as the chart prints it, which is why it is a
// string and not a number: the chart's top row is "10-12" and its bottom
// row is "M-2", neither of which is a single level.
//
// minCorrect and maxCorrect are inclusive. The rows in the source chart
// overlap at their edges, so a raw score can sit in two of them, and that
// is a property of the chart rather than a transcription mistake. See the
// note on the chart in listening-band-score.ts.
export type ListeningBandChartRow = {
  level: string;
  minCorrect: number;
  maxCorrect: number;
};

// An estimated band for one Listening attempt.
//
// levels holds every chart level whose range contains the raw score,
// highest first, so an overlap is carried rather than resolved by picking
// one side of it. label is the display string built from those levels.
//
// descriptor is optional and unset today. The program materials carry a raw
// score chart for Listening but no per level Listening descriptor text, so
// there is nothing to print and nothing is invented. It is here so the
// ticket that adds real descriptors has somewhere to put them.
export type ListeningBandEstimate = {
  correctCount: number;
  totalQuestions: number;
  levels: string[];
  label: string;
  descriptor?: string;
};
