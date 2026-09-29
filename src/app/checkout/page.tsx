import { PublicShell } from "@/components/site/PublicShell";
import { PRODUCTS } from "@/features/public-site/seed";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const code = typeof params.plan === "string" ? params.plan : "test_sprint";
  const product = PRODUCTS.find((item) => item.code === code) ?? PRODUCTS[1];
  return (
    <PublicShell>
      <article className="mx-auto w-full max-w-xl px-5 py-10 sm:px-8">
        <h1 className="font-serif text-4xl">Checkout</h1>
        <p className="mt-3 text-base">{product.name} · ${product.priceCents / 100} CAD. Tax is shown before payment.</p>
        <p className="mt-3 text-sm">Card checkout is handled by the payment provider. This page is the return point after payment.</p>
      </article>
    </PublicShell>
  );
}
