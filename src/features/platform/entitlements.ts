// Access is decided only from entitlement rows. Purchases and anything
// the browser claims are not an access check.

import { addMonths } from "./time";

export type ProductCode = "sprint" | "course" | "batch" | "private_1to1";

export type Entitlement = {
  id: string;
  userId: string;
  productCode: ProductCode | string;
  startsAt: Date;
  endsAt: Date | null;
  sourcePurchaseId: string;
  revokedAt: Date | null;
};

export type Purchase = {
  id: string;
  userId: string;
  productCode: ProductCode | string;
  method: "card" | "interac" | "manual";
  periodEnd?: Date | null;
  includedSprintMonths?: number;
};

export type Capability =
  | "mock_test_1"
  | "all_mocks"
  | "evaluations_sprint"
  | "course_videos"
  | "templates"
  | "history";

export function isEntitlementActive(entitlement: Entitlement, now: Date): boolean {
  if (entitlement.revokedAt) return false;
  if (entitlement.startsAt.getTime() > now.getTime()) return false;
  if (entitlement.endsAt && entitlement.endsAt.getTime() <= now.getTime()) {
    return false;
  }
  return true;
}

export function activeProductCodes(
  entitlements: Entitlement[],
  now: Date,
): Set<string> {
  return new Set(
    entitlements
      .filter((entitlement) => isEntitlementActive(entitlement, now))
      .map((entitlement) => entitlement.productCode),
  );
}

export function can(
  entitlements: Entitlement[],
  capability: Capability,
  now: Date,
): boolean {
  const active = activeProductCodes(entitlements, now);
  const sprint = active.has("sprint");
  const course = active.has("course");

  switch (capability) {
    case "mock_test_1":
      return true;
    case "all_mocks":
    case "evaluations_sprint":
      return sprint;
    case "course_videos":
    case "templates":
      return course;
    case "history":
      return sprint || course;
    default:
      return false;
  }
}

export function canStartMock(
  mockId: string,
  entitlements: Entitlement[],
  now: Date,
): boolean {
  if (mockId === "mock-test-1") return can(entitlements, "mock_test_1", now);
  return can(entitlements, "all_mocks", now);
}

let entitlementSeq = 0;

function nextEntitlementId(): string {
  entitlementSeq += 1;
  return `ent_${entitlementSeq}`;
}

export function grantEntitlement(purchase: Purchase, now: Date): Entitlement[] {
  const base = {
    userId: purchase.userId,
    startsAt: now,
    sourcePurchaseId: purchase.id,
    revokedAt: null,
  };

  if (purchase.productCode === "course") {
    const months = purchase.includedSprintMonths ?? 3;
    return [
      {
        ...base,
        id: nextEntitlementId(),
        productCode: "course",
        endsAt: null,
      },
      {
        ...base,
        id: nextEntitlementId(),
        productCode: "sprint",
        endsAt: addMonths(now, months),
      },
    ];
  }

  if (purchase.productCode === "sprint") {
    return [
      {
        ...base,
        id: nextEntitlementId(),
        productCode: "sprint",
        endsAt: purchase.periodEnd ?? addMonths(now, 1),
      },
    ];
  }

  return [
    {
      ...base,
      id: nextEntitlementId(),
      productCode: purchase.productCode,
      endsAt: purchase.periodEnd ?? null,
    },
  ];
}

export function revokePurchase(
  entitlements: Entitlement[],
  purchaseId: string,
  now: Date,
): Entitlement[] {
  return entitlements.map((entitlement) =>
    entitlement.sourcePurchaseId === purchaseId && !entitlement.revokedAt
      ? { ...entitlement, revokedAt: now }
      : entitlement,
  );
}
