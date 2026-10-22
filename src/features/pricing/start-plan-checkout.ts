export async function startPlanCheckout(input: {
  productCode: string;
  offer?: string;
}): Promise<{ ok: true; url: string } | { ok: false; error: string; needsLogin?: boolean }> {
  const response = await fetch("/api/app/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      productCode: input.productCode,
      offer: input.offer,
    }),
  });

  const payload = (await response.json()) as { url?: string; error?: string };

  if (response.status === 401) {
    return { ok: false, error: "Sign in required.", needsLogin: true };
  }

  if (!response.ok || !payload.url) {
    return {
      ok: false,
      error: payload.error ?? "Checkout could not start.",
    };
  }

  return { ok: true, url: payload.url };
}

export function loginNextPathForCheckout(productCode: string, offer?: string): string {
  const pricing = offer ? `/pricing?offer=${offer}` : "/pricing";
  return `/login?next=${encodeURIComponent(pricing)}`;
}
