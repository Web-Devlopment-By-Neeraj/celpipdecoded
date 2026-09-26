// Skeleton shown while a dashboard page loads. Renders inside the dashboard
// layout, so the real header and footer are already visible.
export default function DashboardLoading() {
  return (
    <div aria-busy="true" aria-label="Loading your dashboard">
      <div className="h-36 animate-pulse rounded-3xl bg-white ring-1 ring-ink/5" />

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="h-52 animate-pulse rounded-3xl bg-white ring-1 ring-ink/5"
          />
        ))}
      </div>
    </div>
  );
}
