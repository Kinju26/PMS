import { homeForRole, type AuthRole } from "@/lib/auth/roles";

export const PERMISSIONS = [
  "view_patient",
  "create_patient",
  "modify_demographics",
  "enter_prescription",
  "modify_prescription",
  "perform_clinical_verification",
  "view_clinical_alerts",
  "override_dur",
  "submit_claim",
  "reverse_claim",
  "dispense",
  "perform_final_check",
  "modify_inventory",
  "create_purchase_order",
  "access_reports",
  "export_data",
  "access_audit_logs",
  "manage_users",
  "manage_roles",
  "access_workspace",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

const ALL_STAFF: Permission[] = [
  "view_patient",
  "access_reports",
];

const ROLE_PERMISSIONS: Record<AuthRole, readonly Permission[]> = {
  MASTER_ADMIN: PERMISSIONS,
  PHARMACY_OWNER: [
    ...ALL_STAFF,
    "create_patient",
    "modify_demographics",
    "access_reports",
    "export_data",
    "access_audit_logs",
    "manage_users",
    "manage_roles",
    "access_workspace",
    "modify_inventory",
    "create_purchase_order",
  ],
  PHARMACY_MANAGER: [
    ...ALL_STAFF,
    "create_patient",
    "modify_demographics",
    "enter_prescription",
    "modify_prescription",
    "submit_claim",
    "reverse_claim",
    "modify_inventory",
    "create_purchase_order",
    "export_data",
    "manage_users",
    "access_workspace",
  ],
  PHARMACIST: [
    ...ALL_STAFF,
    "create_patient",
    "modify_demographics",
    "enter_prescription",
    "modify_prescription",
    "perform_clinical_verification",
    "view_clinical_alerts",
    "override_dur",
    "submit_claim",
    "reverse_claim",
    "dispense",
    "perform_final_check",
    "access_workspace",
  ],
  PHARMACY_TECHNICIAN: [
    ...ALL_STAFF,
    "create_patient",
    "enter_prescription",
    "dispense",
    "perform_final_check",
    "submit_claim",
    "access_workspace",
  ],
  PHARMACY_ASSISTANT: ["view_patient", "create_patient", "enter_prescription", "access_workspace"],
  DATA_ENTRY_STAFF: ["view_patient", "create_patient", "modify_demographics", "enter_prescription", "access_workspace"],
  INVENTORY_MANAGER: ["modify_inventory", "create_purchase_order", "access_reports", "access_workspace"],
  DELIVERY_STAFF: ["view_patient", "access_workspace"],
  SYSTEM_ADMINISTRATOR: [
    "manage_users",
    "manage_roles",
    "access_audit_logs",
    "access_reports",
    "export_data",
    "access_workspace",
  ],
  AUDITOR: ["access_audit_logs", "access_reports", "export_data", "access_workspace"],
  PATIENT: ["view_patient"],
  CUSTOMER: [],
};

export function permissionsForRole(role: AuthRole): readonly Permission[] {
  switch (role) {
    case "MASTER_ADMIN":
    case "PHARMACY_OWNER":
    case "PHARMACY_MANAGER":
    case "PHARMACIST":
    case "PHARMACY_TECHNICIAN":
    case "PHARMACY_ASSISTANT":
    case "DATA_ENTRY_STAFF":
    case "INVENTORY_MANAGER":
    case "DELIVERY_STAFF":
    case "SYSTEM_ADMINISTRATOR":
    case "AUDITOR":
    case "PATIENT":
    case "CUSTOMER":
      return ROLE_PERMISSIONS[role];
    default: {
      const exhaustive: never = role;
      return exhaustive;
    }
  }
}

export function roleHasPermission(role: AuthRole, permission: Permission) {
  return permissionsForRole(role).includes(permission);
}

export function postLoginPath(role: AuthRole) {
  return homeForRole(role);
}
