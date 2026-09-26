// Skeleton shown while speaking pages load. Renders inside the dashboard
// layout, so the real header and footer are already visible.
export default function SpeakingLoading() {
  return (
    <div aria-busy="true" aria-label="Loading speaking practice">
      <div className="h-44 animate-pulse rounded-3xl bg-white ring-1 ring-ink/5" />

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="h-56 animate-pulse rounded-3xl bg-white ring-1 ring-ink/5"
          />
        ))}
      </div>
    </div>
  );
}
