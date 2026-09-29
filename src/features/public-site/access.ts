export type PlanCode = "free" | "test_sprint" | "decoded_course" | "live_batch" | "private_1to1";

export type AccessArea =
  | "dashboard"
  | "practice"
  | "mock_1"
  | "mocks"
  | "courses_section_1"
  | "courses"
  | "mini_free"
  | "mini_paid"
  | "live"
  | "ask"
  | "templates"
  | "history"
  | "performance"
  | "tools";

export type Viewer = {
  signedIn: boolean;
  verified: boolean;
  plans: PlanCode[];
};

const AREA_PLAN: Record<AccessArea, PlanCode | "visitor" | "signed_in"> = {
  dashboard: "signed_in",
  practice: "signed_in",
  mock_1: "signed_in",
  mocks: "test_sprint",
  courses_section_1: "signed_in",
  courses: "decoded_course",
  mini_free: "signed_in",
  mini_paid: "test_sprint",
  live: "signed_in",
  ask: "signed_in",
  templates: "test_sprint",
  history: "test_sprint",
  performance: "test_sprint",
  tools: "visitor",
};

export function hasPlan(viewer: Viewer, plan: PlanCode): boolean {
  if (viewer.plans.includes("decoded_course") && (plan === "test_sprint" || plan === "free")) {
    return true;
  }
  if (viewer.plans.includes("test_sprint") && plan === "free") return true;
  return viewer.plans.includes(plan);
}

export function areaUnlocked(viewer: Viewer, area: AccessArea): boolean {
  const required = AREA_PLAN[area];
  if (required === "visitor") return true;
  if (!viewer.signedIn) return false;
  if (required === "signed_in") return true;
  return hasPlan(viewer, required);
}

export function unlockingPlan(area: AccessArea): PlanCode | "free" {
  const required = AREA_PLAN[area];
  if (required === "visitor" || required === "signed_in") return "free";
  return required;
}

export type ProductPrice = { code: PlanCode; name: string; priceCents: number; billing: string };

export function formatPlanPrice(priceCents: number): string {
  return `$${Math.round(priceCents / 100)}`;
}
