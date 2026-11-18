import type {
  DayHours,
  DayKey,
  HolidayType,
  PermissionDefinition,
  PermissionKey,
  Province,
  RoleDefinition,
  UserRoleName,
} from "@/types/cpos";

export const PROVINCES: { code: Province; name: string }[] = [
  { code: "AB", name: "Alberta" },
  { code: "BC", name: "British Columbia" },
  { code: "MB", name: "Manitoba" },
  { code: "NB", name: "New Brunswick" },
  { code: "NL", name: "Newfoundland and Labrador" },
  { code: "NS", name: "Nova Scotia" },
  { code: "NT", name: "Northwest Territories" },
  { code: "NU", name: "Nunavut" },
  { code: "ON", name: "Ontario" },
  { code: "PE", name: "Prince Edward Island" },
  { code: "QC", name: "Quebec" },
  { code: "SK", name: "Saskatchewan" },
  { code: "YT", name: "Yukon" },
];

/**
 * Editable provincial authority suggestions (administrators can customize freely).
 */
export const PROVINCE_REGULATORY_PRESETS: Record<
  Province,
  { authority: string; identifierExamples: string[] }
> = {
  ON: {
    authority: "Ontario College of Pharmacists (OCP)",
    identifierExamples: ["Accreditation / Licence #", "ODB Billing ID", "GST/HST #"],
  },
  BC: {
    authority: "College of Pharmacists of British Columbia (CPBC)",
    identifierExamples: ["Pharmacy Licence #", "PharmaNet Site ID", "GST/PST #"],
  },
  AB: {
    authority: "Alberta College of Pharmacy (ACP)",
    identifierExamples: ["Pharmacy Licence #", "Netcare / ABC Billing ID", "GST #"],
  },
  QC: {
    authority: "Ordre des pharmaciens du Québec (OPQ)",
    identifierExamples: ["Permis de pharmacie", "RAMQ Billing ID", "GST/QST #"],
  },
  MB: {
    authority: "College of Pharmacists of Manitoba (CPhM)",
    identifierExamples: ["Pharmacy Licence #", "DPIN Site ID", "GST/RST #"],
  },
  SK: {
    authority: "Saskatchewan College of Pharmacy Professionals (SCPP)",
    identifierExamples: ["Permit Number", "PIP Site ID", "GST/PST #"],
  },
  NS: {
    authority: "Nova Scotia College of Pharmacists (NSCP)",
    identifierExamples: ["Pharmacy Licence #", "DIS Facility ID", "HST #"],
  },
  NB: {
    authority: "New Brunswick College of Pharmacists (NBCP)",
    identifierExamples: ["Certificate of Accreditation", "NB Drug Plan ID", "HST #"],
  },
  NL: {
    authority: "Newfoundland and Labrador Pharmacy Board (NLPB)",
    identifierExamples: ["Pharmacy Licence #", "Pharmacy Network ID", "HST #"],
  },
  PE: {
    authority: "Prince Edward Island College of Pharmacy",
    identifierExamples: ["Pharmacy Permit #", "DIS Site ID", "HST #"],
  },
  NT: {
    authority: "Government of Northwest Territories Health Professions",
    identifierExamples: ["Pharmacy Registration #", "Facility Identifier", "GST #"],
  },
  NU: {
    authority: "Government of Nunavut Department of Health",
    identifierExamples: ["Pharmacy Registration #", "Facility Identifier", "GST #"],
  },
  YT: {
    authority: "Yukon Government Professional Licensing",
    identifierExamples: ["Pharmacy Licence #", "Facility Identifier", "GST #"],
  },
};

export const DAYS: { key: DayKey; label: string }[] = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
];

export const HOLIDAY_TYPES: HolidayType[] = [
  "Statutory",
  "Provincial",
  "Civic",
  "Pharmacy Custom",
];

export const PHARMACY_TYPES = [
  "Community pharmacy",
  "Hospital outpatient",
  "Compounding pharmacy",
  "Long-term care",
  "Clinic pharmacy",
] as const;

export const TIME_ZONES = [
  "America/St_Johns",
  "America/Halifax",
  "America/Toronto",
  "America/Winnipeg",
  "America/Edmonton",
  "America/Vancouver",
  "America/Whitehorse",
] as const;

export const DATE_FORMATS = ["YYYY-MM-DD", "DD/MM/YYYY", "MM/DD/YYYY"] as const;
export const LANGUAGES = ["English", "French", "English and French"] as const;

export const USER_ROLES: UserRoleName[] = [
  "Pharmacy Owner",
  "Pharmacy Manager",
  "Pharmacist",
  "Pharmacy Technician",
  "Pharmacy Assistant",
  "Data-entry Staff",
  "Inventory Manager",
  "Delivery Staff",
  "System Administrator",
  "Auditor",
];

export const PERMISSION_CATALOG: PermissionDefinition[] = [
  {
    key: "patient_access",
    label: "Patient access",
    domain: "Patient & Clinical",
    description: "View patient demographics, coverage metadata, allergies, and medication profiles.",
    highRisk: false,
  },
  {
    key: "patient_create_edit",
    label: "Patient creation and editing",
    domain: "Patient & Clinical",
    description: "Create patient profiles and maintain contact, insurance, and consent records.",
    highRisk: false,
  },
  {
    key: "rx_entry",
    label: "Prescription entry",
    domain: "Patient & Clinical",
    description: "Transcribe incoming prescriptions, prescriber details, and directions into queue.",
    highRisk: false,
  },
  {
    key: "rx_modification",
    label: "Prescription modification",
    domain: "Patient & Clinical",
    description: "Amend active prescription instructions, quantities, repeats, or substitutions.",
    highRisk: true,
    riskReason: "Modifies active clinical therapy orders.",
  },
  {
    key: "clinical_verification",
    label: "Clinical verification",
    domain: "Patient & Clinical",
    description: "Perform pharmacist therapeutic assessment and clinical sign-off before release.",
    highRisk: true,
    riskReason: "Regulated pharmacist-only clinical responsibility.",
  },
  {
    key: "clinical_alerts",
    label: "Clinical alerts",
    domain: "Patient & Clinical",
    description: "Inspect drug-drug, allergy, duplication, and dosing alerts during workflow review.",
    highRisk: false,
  },
  {
    key: "dur_override",
    label: "DUR override",
    domain: "Patient & Clinical",
    description: "Document clinical rationale and override Drug Utilization Review (DUR) stops.",
    highRisk: true,
    riskReason: "Bypasses clinical safety alerts; requires documented rationale.",
  },
  {
    key: "claim_submission",
    label: "Claim submission",
    domain: "Dispensing & Billing",
    description: "Transmit provincial drug plan and third-party adjudication claims.",
    highRisk: true,
    riskReason: "Initiates external payer billing and financial settlement.",
  },
  {
    key: "claim_reversal",
    label: "Claim reversal",
    domain: "Dispensing & Billing",
    description: "Reverse previously adjudicated insurance claims and initiate adjustments.",
    highRisk: true,
    riskReason: "Modifies settled payer transactions; subject to insurer audit.",
  },
  {
    key: "dispensing",
    label: "Dispensing",
    domain: "Dispensing & Billing",
    description: "Prepare medications, print labels, and log product selection.",
    highRisk: true,
    riskReason: "Controls physical medication preparation and controlled-drug handling.",
  },
  {
    key: "final_verification",
    label: "Final verification",
    domain: "Dispensing & Billing",
    description: "Approve physical accuracy check and authorize release for pickup or delivery.",
    highRisk: true,
    riskReason: "Final safety gate before medication reaches the patient.",
  },
  {
    key: "inventory_modification",
    label: "Inventory modification",
    domain: "Inventory & Operations",
    description: "Adjust on-hand counts, log expiry write-offs, and maintain reorder thresholds.",
    highRisk: false,
  },
  {
    key: "purchase_order_creation",
    label: "Purchase order creation",
    domain: "Inventory & Operations",
    description: "Create wholesaler purchase orders and submit replenishment requisitions.",
    highRisk: false,
  },
  {
    key: "reports_access",
    label: "Reports access",
    domain: "Reporting & Governance",
    description: "View operational, dispensing volume, and compliance summary reports.",
    highRisk: false,
  },
  {
    key: "data_export",
    label: "Data export",
    domain: "Reporting & Governance",
    description: "Export patient-adjacent tables, financial summaries, or configuration datasets.",
    highRisk: true,
    riskReason: "Privacy exposure risk if exported externally.",
  },
  {
    key: "audit_log_access",
    label: "Audit log access",
    domain: "Reporting & Governance",
    description: "Inspect immutable security, clinical override, and configuration audit trails.",
    highRisk: true,
    riskReason: "Sensitive compliance telemetry restricted to governance roles.",
  },
];

export const DEFAULT_ROLES: RoleDefinition[] = [
  {
    id: "role-owner",
    name: "Pharmacy Owner",
    description: "Executive oversight across pharmacy governance, reporting, staffing, and compliance.",
    scope: "Administration",
    isSystem: true,
    permissions: [
      "patient_access",
      "reports_access",
      "data_export",
      "audit_log_access",
      "inventory_modification",
      "purchase_order_creation",
      "claim_submission",
      "claim_reversal",
    ],
  },
  {
    id: "role-manager",
    name: "Pharmacy Manager",
    description: "Designated Manager / Pharmacist-in-Charge responsible for clinical operations and compliance.",
    scope: "Clinical",
    isSystem: true,
    permissions: [
      "patient_access",
      "patient_create_edit",
      "rx_entry",
      "rx_modification",
      "clinical_verification",
      "clinical_alerts",
      "dur_override",
      "claim_submission",
      "claim_reversal",
      "dispensing",
      "final_verification",
      "inventory_modification",
      "purchase_order_creation",
      "reports_access",
      "data_export",
      "audit_log_access",
    ],
  },
  {
    id: "role-pharmacist",
    name: "Pharmacist",
    description: "Licensed pharmacist performing clinical verification, DUR overrides, counselling, and release.",
    scope: "Clinical",
    isSystem: true,
    permissions: [
      "patient_access",
      "patient_create_edit",
      "rx_entry",
      "rx_modification",
      "clinical_verification",
      "clinical_alerts",
      "dur_override",
      "claim_submission",
      "claim_reversal",
      "dispensing",
      "final_verification",
      "reports_access",
    ],
  },
  {
    id: "role-technician",
    name: "Pharmacy Technician",
    description: "Regulated technician performing product verification, rx entry, and inventory operations.",
    scope: "Clinical",
    isSystem: true,
    permissions: [
      "patient_access",
      "patient_create_edit",
      "rx_entry",
      "clinical_alerts",
      "claim_submission",
      "dispensing",
      "final_verification",
      "inventory_modification",
      "purchase_order_creation",
    ],
  },
  {
    id: "role-assistant",
    name: "Pharmacy Assistant",
    description: "Supports intake, preparation, and front-counter pickup under pharmacist supervision.",
    scope: "Operations",
    isSystem: true,
    permissions: [
      "patient_access",
      "patient_create_edit",
      "rx_entry",
      "dispensing",
      "inventory_modification",
    ],
  },
  {
    id: "role-data-entry",
    name: "Data-entry Staff",
    description: "Enters patient demographics, coverage profiles, and incoming prescription queues.",
    scope: "Operations",
    isSystem: true,
    permissions: ["patient_access", "patient_create_edit", "rx_entry", "claim_submission"],
  },
  {
    id: "role-inventory",
    name: "Inventory Manager",
    description: "Maintains stock levels, expiry audits, reorder points, and wholesaler purchase orders.",
    scope: "Operations",
    isSystem: true,
    permissions: ["inventory_modification", "purchase_order_creation", "reports_access"],
  },
  {
    id: "role-delivery",
    name: "Delivery Staff",
    description: "Views assigned delivery manifests and logs handoff confirmations.",
    scope: "Operations",
    isSystem: true,
    permissions: ["patient_access"],
  },
  {
    id: "role-sysadmin",
    name: "System Administrator",
    description: "Configures master settings, user roles, permissions, and audit controls.",
    scope: "Administration",
    isSystem: true,
    permissions: ["reports_access", "data_export", "audit_log_access"],
  },
  {
    id: "role-auditor",
    name: "Auditor",
    description: "Read-only compliance reviewer with access to reports and audit logs.",
    scope: "Compliance",
    isSystem: true,
    permissions: ["patient_access", "reports_access", "data_export", "audit_log_access"],
  },
];

export const FUTURE_PHASES = [
  { phase: "Phase 1", name: "Patient Intake & Identity Management" },
  { phase: "Phase 2", name: "Prescription Reception" },
  { phase: "Phase 3", name: "Clinical Decision Support & DUR" },
  { phase: "Phase 4", name: "Third-Party Billing & Adjudication" },
  { phase: "Phase 5", name: "Pharmacist Clinical Verification" },
  { phase: "Phase 6", name: "Prescription Preparation & Dispensing" },
  { phase: "Phase 7", name: "Inventory Management" },
  { phase: "Phase 8", name: "Pickup / Will-Call" },
  { phase: "Phase 9", name: "Delivery Management" },
  { phase: "Phase 10", name: "Video Consultation" },
  { phase: "Phase 11", name: "Voice Documentation & Command Engine" },
] as const;

export function provinceName(code: Province) {
  return PROVINCES.find((province) => province.code === code)?.name ?? code;
}

export function permissionLabel(key: PermissionKey): string {
  return PERMISSION_CATALOG.find((item) => item.key === key)?.label ?? key;
}

export function weekdayHours(
  openDays: DayKey[] = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
): DayHours[] {
  return DAYS.map(({ key }) => {
    const open = openDays.includes(key);
    return {
      day: key,
      open,
      opens: "09:00",
      closes: key === "saturday" ? "17:00" : "20:00",
      hasBreak: open && key !== "saturday",
      breakStart: "13:00",
      breakEnd: "13:30",
    };
  });
}
