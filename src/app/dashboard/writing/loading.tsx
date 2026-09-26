// Skeleton shown while writing pages load. Renders inside the dashboard
// layout, so the real header and footer are already visible.
export default function WritingLoading() {
  return (
    <div aria-busy="true" aria-label="Loading writing practice">
      <div className="h-44 animate-pulse rounded-3xl bg-white ring-1 ring-ink/5" />

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-56 animate-pulse rounded-3xl bg-white ring-1 ring-ink/5"
          />
        ))}
      </div>
    </div>
  );
}
