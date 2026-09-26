// Skeleton shown while the attempt history loads. Renders inside the
// dashboard layout, so the real header and footer are already visible.
export default function SpeakingAttemptsLoading() {
  return (
    <div aria-busy="true" aria-label="Loading attempt history">
      <div className="h-28 animate-pulse rounded-3xl bg-white ring-1 ring-ink/5" />
      <div className="mt-6 h-28 animate-pulse rounded-3xl bg-white ring-1 ring-ink/5" />
      <div className="mt-6 h-80 animate-pulse rounded-3xl bg-white ring-1 ring-ink/5" />
    </div>
  );
}
