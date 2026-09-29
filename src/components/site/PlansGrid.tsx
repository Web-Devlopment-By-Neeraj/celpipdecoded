import Link from "next/link";
import { BATCH_CURRICULUM } from "@/features/public-site/booking";
import { formatPlanPrice } from "@/features/public-site/access";
import { PRODUCTS } from "@/features/public-site/seed";
import { DEFAULT_SETTINGS } from "@/features/public-site/settings";

export function PlansGrid() {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 lg:grid-cols-3">
        {PRODUCTS.filter((product) => ["free", "test_sprint", "decoded_course"].includes(product.code)).map((product) => (
          <article key={product.code} className="rounded-3xl bg-white p-5 ring-1 ring-ink/10">
            <h3 className="font-serif text-2xl">{product.name}</h3>
            <p className="mt-2 text-lg font-semibold">{formatPlanPrice(product.priceCents)} CAD</p>
            <p className="text-sm">{product.billing}</p>
            <p className="mt-3 text-sm leading-6">{product.bestFor}</p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-6">
              {product.contents.map((line) => (
                <li key={line}>
                  {line.includes("limits")
                    ? `AI-evaluated writing and speaking, up to ${DEFAULT_SETTINGS.sprintDailyLimit} a day, ${DEFAULT_SETTINGS.sprintWeeklyLimit} a week and ${DEFAULT_SETTINGS.sprintMonthlyLimit} a month`
                    : line.replace("3 writing", `${DEFAULT_SETTINGS.freeEvaluationLimit} writing`)}
                </li>
              ))}
            </ul>
            <PlanCta code={product.code} />
          </article>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {PRODUCTS.filter((product) => product.code === "live_batch" || product.code === "private_1to1").map((product) => (
          <article key={product.code} className="rounded-3xl bg-cream p-5">
            <h3 className="font-serif text-2xl">{product.name}</h3>
            <p className="mt-2 font-semibold">{formatPlanPrice(product.priceCents)} CAD · {product.billing}</p>
            <p className="mt-2 text-sm leading-6">{product.bestFor}</p>
            <ul className="mt-3 list-disc pl-5 text-sm">
              {product.contents.map((line) => <li key={line}>{line}</li>)}
            </ul>
            {product.code === "live_batch" ? (
              <ol className="mt-4 space-y-1 text-sm">
                {BATCH_CURRICULUM.map((item) => (
                  <li key={`${item.week}-${item.day}`}>Week {item.week} {item.day}: {item.topic}</li>
                ))}
              </ol>
            ) : null}
            <p className="mt-3 text-sm">Class time: 7:30-8:30 PM Eastern. Your time follows the timezone in your account.</p>
            <p className="mt-2 text-sm">Your card is saved, not charged. You pay only if the batch runs. It runs with at least {DEFAULT_SETTINGS.batchMinToRun} students.</p>
            <Link href="/book" className="mt-4 inline-flex min-h-11 items-center rounded-full bg-ink px-4 text-sm font-semibold text-cream">
              {product.code === "live_batch" ? "Reserve a seat" : "Book an hour"}
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}

function PlanCta({ code }: { code: string }) {
  if (code === "free") {
    return (
      <Link href="/signup?source=plans" className="mt-4 inline-flex min-h-11 items-center rounded-full bg-brand px-4 text-sm font-semibold text-white">
        Sign up
      </Link>
    );
  }
  return (
    <Link href={`/checkout?plan=${code}`} className="mt-4 inline-flex min-h-11 items-center rounded-full bg-ink px-4 text-sm font-semibold text-cream">
      Continue to checkout
    </Link>
  );
}
