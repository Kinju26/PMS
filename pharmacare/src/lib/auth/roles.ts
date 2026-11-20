export const AUTH_ROLES = [
  "MASTER_ADMIN",
  "SUPER_ADMIN",
  "PHARMACY_OWNER",
  "PHARMACY_MANAGER",
  "PHARMACIST",
  "PHARMACY_TECHNICIAN",
  "PHARMACY_ASSISTANT",
  "DATA_ENTRY_STAFF",
  "INVENTORY_MANAGER",
  "DELIVERY_STAFF",
  "SYSTEM_ADMINISTRATOR",
  "AUDITOR",
  "PATIENT",
  "CUSTOMER",
] as const;

export type AuthRole = (typeof AUTH_ROLES)[number];

export const ACCOUNT_STATUSES = ["ACTIVE", "INACTIVE", "LOCKED", "PENDING_ACTIVATION"] as const;
export type AccountStatus = (typeof ACCOUNT_STATUSES)[number];

export const ROLE_LABELS: Record<AuthRole, string> = {
  MASTER_ADMIN: "Pharmacy Owner / Master Admin",
  SUPER_ADMIN: "Super Admin",
  PHARMACY_OWNER: "Pharmacy Owner",
  PHARMACY_MANAGER: "Pharmacy Manager",
  PHARMACIST: "Pharmacist",
  PHARMACY_TECHNICIAN: "Pharmacy Technician",
  PHARMACY_ASSISTANT: "Pharmacy Assistant",
  DATA_ENTRY_STAFF: "Data Entry Staff",
  INVENTORY_MANAGER: "Inventory Manager",
  DELIVERY_STAFF: "Delivery Staff",
  SYSTEM_ADMINISTRATOR: "System Administrator",
  AUDITOR: "Auditor",
  PATIENT: "Patient",
  CUSTOMER: "Customer",
};

export const ROLE_HOME: Record<AuthRole, string> = {
  MASTER_ADMIN: "/dashboard",
  SUPER_ADMIN: "/dashboard",
  PHARMACY_OWNER: "/dashboard",
  PHARMACY_MANAGER: "/dashboard",
  PHARMACIST: "/dashboard",
  PHARMACY_TECHNICIAN: "/dashboard",
  PHARMACY_ASSISTANT: "/dashboard",
  DATA_ENTRY_STAFF: "/dashboard",
  INVENTORY_MANAGER: "/dashboard",
  DELIVERY_STAFF: "/dashboard",
  SYSTEM_ADMINISTRATOR: "/dashboard",
  AUDITOR: "/dashboard",
  PATIENT: "/home",
  CUSTOMER: "/home",
};

export function isAuthRole(value: string): value is AuthRole {
  return (AUTH_ROLES as readonly string[]).includes(value);
}

export function homeForRole(role: AuthRole) {
  switch (role) {
    case "MASTER_ADMIN":
    case "SUPER_ADMIN":
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
      return ROLE_HOME[role];
    default: {
      const exhaustive: never = role;
      return exhaustive;
    }
  }
}
