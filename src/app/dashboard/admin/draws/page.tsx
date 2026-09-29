import { AdminAccessDenied } from "@/components/admin/mock-tests/AdminAccessDenied";
import { getAdminSession } from "@/lib/admin/require-admin";
import { SEED_DRAWS } from "@/features/public-site/seed";

export default async function AdminDrawsPage() {
  const admin = await getAdminSession();
  if (!admin.ok) return <AdminAccessDenied reason={admin.reason} />;

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl">Express Entry draws</h1>
      <p className="text-sm">Add a draw and it publishes on the next page load. Invalid numbers are blocked.</p>
      <form className="grid gap-3" action="/api/draws" method="post">
        <input name="drawDate" type="date" required className="min-h-11 rounded-xl border px-3 text-base" aria-label="Draw date" />
        <input name="drawType" required placeholder="Draw type" className="min-h-11 rounded-xl border px-3 text-base" />
        <input name="invitations" inputMode="numeric" required placeholder="Invitations" className="min-h-11 rounded-xl border px-3 text-base" />
        <input name="minCrs" inputMode="numeric" required placeholder="Minimum CRS" className="min-h-11 rounded-xl border px-3 text-base" />
        <button className="min-h-11 rounded-full bg-academy-navy px-4 text-sm font-semibold text-white" type="submit">Save draw</button>
      </form>
      <ul className="text-sm">
        {SEED_DRAWS.map((draw) => (
          <li key={draw.id}>{draw.drawDate} · {draw.drawType} · {draw.minCrs}</li>
        ))}
      </ul>
    </div>
  );
}
