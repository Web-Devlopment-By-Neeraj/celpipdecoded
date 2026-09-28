// Owner, admin and coach share one users table. A coach is denied private
// notes and WhatsApp numbers unless the owner turns that permission on.

export type RoleName = "student" | "coach" | "admin" | "owner";

export type CoachPermission =
  | "notes"
  | "whatsapp"
  | "extra_evaluations"
  | "broadcasts"
  | "sales"
  | "settings"
  | "refunds"
  | "grant_access"
  | "calibration";

export type RolePermissions = Record<CoachPermission, boolean>;

export const COACH_DEFAULT_PERMISSIONS: RolePermissions = {
  notes: false,
  whatsapp: false,
  extra_evaluations: false,
  broadcasts: false,
  sales: false,
  settings: false,
  refunds: false,
  grant_access: false,
  calibration: false,
};

export const OWNER_PERMISSIONS: RolePermissions = {
  notes: true,
  whatsapp: true,
  extra_evaluations: true,
  broadcasts: true,
  sales: true,
  settings: true,
  refunds: true,
  grant_access: true,
  calibration: true,
};

export type Viewer = {
  userId: string;
  role: RoleName;
  permissions: RolePermissions;
};

export type StudentRecord = {
  userId: string;
  email: string;
  whatsappE164: string | null;
  notesBody: string | null;
};

export function permissionsFor(role: RoleName): RolePermissions {
  if (role === "owner" || role === "admin") return { ...OWNER_PERMISSIONS };
  return { ...COACH_DEFAULT_PERMISSIONS };
}

export function redactStudentRecord(
  record: StudentRecord,
  viewer: Viewer,
): StudentRecord {
  return {
    ...record,
    whatsappE164: viewer.permissions.whatsapp ? record.whatsappE164 : null,
    notesBody: viewer.permissions.notes ? record.notesBody : null,
  };
}

export type AdminAction =
  | "read_notes"
  | "read_whatsapp"
  | "sales"
  | "settings"
  | "refunds"
  | "grant_access"
  | "calibration"
  | "answer_questions"
  | "extra_evaluations";

const ACTION_PERMISSION: Record<AdminAction, CoachPermission | "always"> = {
  read_notes: "notes",
  read_whatsapp: "whatsapp",
  sales: "sales",
  settings: "settings",
  refunds: "refunds",
  grant_access: "grant_access",
  calibration: "calibration",
  extra_evaluations: "extra_evaluations",
  answer_questions: "always",
};

export function authorizeAction(
  viewer: Viewer,
  action: AdminAction,
): { ok: true } | { ok: false; status: 403 } {
  if (viewer.role === "student") return { ok: false, status: 403 };
  const permission = ACTION_PERMISSION[action];
  if (permission === "always") {
    if (viewer.role === "coach" || viewer.role === "admin" || viewer.role === "owner") {
      return { ok: true };
    }
  }
  if (permission !== "always" && viewer.permissions[permission]) {
    return { ok: true };
  }
  return { ok: false, status: 403 };
}
