export function ScoreRing({
  label,
  score,
}: {
  label: string;
  score: number;
}) {
  const color = score >= 9 ? "#0a7a54" : score >= 7 ? "#a1591a" : "#b3261e";
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const fill = Math.max(0, Math.min(1, score / 12));

  return (
    <figure className="flex w-16 flex-col items-center text-center">
      <svg viewBox="0 0 72 72" className="h-16 w-16" role="img" aria-label={`${label} ${score} out of 12`}>
        <circle cx="36" cy="36" r={radius} fill="none" stroke="#e7edf4" strokeWidth="6" />
        <circle
          cx="36"
          cy="36"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeDasharray={`${circumference * fill} ${circumference}`}
          strokeLinecap="round"
          transform="rotate(-90 36 36)"
        />
        <text x="36" y="40" textAnchor="middle" fontSize="16" fill="#12314f" fontWeight="700">
          {score}
        </text>
      </svg>
      <figcaption className="mt-1 text-xs font-semibold">{label}</figcaption>
    </figure>
  );
}
