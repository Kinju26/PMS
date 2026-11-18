export type Province =
  | "AB"
  | "BC"
  | "MB"
  | "NB"
  | "NL"
  | "NS"
  | "NT"
  | "NU"
  | "ON"
  | "PE"
  | "QC"
  | "SK"
  | "YT";

export type DayKey =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export type DayHours = {
  day: DayKey;
  open: boolean;
  opens: string;
  closes: string;
  hasBreak?: boolean;
  breakStart?: string;
  breakEnd?: string;
};

export type SpecialHoursEntry = {
  id: string;
  label: string;
  date: string;
  opens: string;
  closes: string;
  notes: string;
};

export type HolidayClosure = "full" | "special";
export type HolidayType = "Statutory" | "Provincial" | "Civic" | "Pharmacy Custom";

export type Holiday = {
  id: string;
  name: string;
  date: string;
  holidayType?: HolidayType;
  closure: HolidayClosure;
  opens: string;
  closes: string;
};

export type PharmacyStatus = "active" | "pending" | "inactive";

export type PharmacyProfile = {
  legalName: string;
  operatingName: string;
  logoName: string;
  pharmacyType: string;
  regulatoryId: string;
  pharmacistInCharge: string;
  province: Province;
  status: PharmacyStatus;
};

export type RegulatoryIdentifierItem = {
  id: string;
  label: string;
  value: string;
  notes: string;
};

export type RegulatoryConfig = {
  province: Province;
  regulatoryAuthority: string;
  pharmacyLicenceNumber: string;
  primaryIdentifier: string;
  additionalIdentifiers: RegulatoryIdentifierItem[];
};

export type PicAssignmentStatus = "active" | "scheduled" | "ended";

export type PicAssignment = {
  id: string;
  pharmacistName: string;
  registrationNumber: string;
  phone: string;
  email: string;
  effectiveStartDate: string;
  effectiveEndDate: string;
  status: PicAssignmentStatus;
  notes: string;
};

export type DepartmentItem = {
  id: string;
  code: string;
  name: string;
  lead: string;
  description: string;
  status: "active" | "inactive";
};

export type PrescriptionStatusItem = {
  id: string;
  code: string;
  label: string;
  stage: "Intake" | "Clinical" | "Dispensing" | "Release" | "Exception";
  tone: "neutral" | "brand" | "success" | "warning" | "danger";
  sortOrder: number;
  active: boolean;
};

export type PaymentMethodItem = {
  id: string;
  code: string;
  name: string;
  category: "Cash" | "Card" | "Insurance" | "Account";
  requiresReference: boolean;
  enabled: boolean;
};

export type TaxRuleItem = {
  id: string;
  name: string;
  province: Province;
  taxType: "HST" | "GST" | "PST" | "QST";
  rate: number;
  appliesToRx: boolean;
  appliesToOtc: boolean;
  effectiveDate: string;
  active: boolean;
};

export type ReferenceDataCategory =
  | "dosage-forms"
  | "routes"
  | "sig-codes"
  | "hold-reasons";

export type ReferenceDataItem = {
  id: string;
  category: ReferenceDataCategory;
  code: string;
  label: string;
  description: string;
  active: boolean;
};

export type MasterConfigState = {
  departments: DepartmentItem[];
  prescriptionStatuses: PrescriptionStatusItem[];
  paymentMethods: PaymentMethodItem[];
  taxRules: TaxRuleItem[];
  referenceData: ReferenceDataItem[];
};

export type ContactInfo = {
  street: string;
  suite: string;
  city: string;
  province: Province;
  postalCode: string;
  country: string;
  phone: string;
  fax: string;
  email: string;
};

export type RegionalConfig = {
  timeZone: string;
  dateFormat: string;
  timeFormat: "12-hour" | "24-hour";
  currency: "CAD";
  language: string;
};

export type DeliveryZone = {
  id: string;
  name: string;
  serviceAreas: string;
  postalCodes: string;
  fee: string;
  minimumOrder: string;
  eta: string;
  available: boolean;
};

export type DeliveryTimeWindow = {
  id: string;
  label: string;
  startTime: string;
  endTime: string;
  enabled: boolean;
};

export type DeliveryConfig = {
  enabled: boolean;
  instructions: string;
  timeWindows: DeliveryTimeWindow[];
  zones: DeliveryZone[];
};

export type PickupConfig = {
  enabled: boolean;
  instructions: string;
  availability: string;
  pickupHoursMode: "same-as-pharmacy" | "custom";
  pickupOpens: string;
  pickupCloses: string;
  eta: string;
  requireIdVerification: boolean;
  curbsideEnabled: boolean;
  notifyReady: boolean;
  notifyDelay: boolean;
};

export type NotificationKey =
  | "email"
  | "sms"
  | "push"
  | "prescription"
  | "delivery"
  | "refill"
  | "appointment";

export type NotificationGroup = "channel" | "event";

export type NotificationSetting = {
  key: NotificationKey;
  group: NotificationGroup;
  label: string;
  description: string;
  enabled: boolean;
  integrationConnected: boolean;
  integrationNote: string;
};

export type LocationStatus = "active" | "inactive" | "pending";

export type PharmacyLocation = {
  id: string;
  legalName: string;
  operatingName: string;
  code: string;
  logoName: string;
  pharmacistInCharge: string;
  street: string;
  city: string;
  province: Province;
  postalCode: string;
  phone: string;
  fax: string;
  email: string;
  timeZone: string;
  hours: DayHours[];
  holidays: Holiday[];
  deliveryEnabled: boolean;
  pickupEnabled: boolean;
  notificationsEnabled: boolean;
  status: LocationStatus;
  manager: string;
  isPrimary?: boolean;
};

export type LocationAccess = {
  locationId: string;
  canView: boolean;
  canEdit: boolean;
};

export type SharedRecordsConfig = {
  enabled: boolean;
  visibility: "treating-location" | "authorized-network" | "restricted";
  restrictByLocation: boolean;
  access: LocationAccess[];
};

export type StockStatus = "healthy" | "low" | "out";

export type InventoryItem = {
  id: string;
  locationId: string;
  product: string;
  din: string;
  onHand: number;
  reorderPoint: number;
  status: StockStatus;
};

export type TransferPolicy = {
  enabled: boolean;
  requireApproval: boolean;
  allowPartialReceipt: boolean;
};

export type UserRoleName =
  | "Pharmacy Owner"
  | "Pharmacy Manager"
  | "Pharmacist"
  | "Pharmacy Technician"
  | "Pharmacy Assistant"
  | "Data-entry Staff"
  | "Inventory Manager"
  | "Delivery Staff"
  | "System Administrator"
  | "Auditor";

export type PermissionKey =
  | "patient_access"
  | "patient_create_edit"
  | "rx_entry"
  | "rx_modification"
  | "clinical_verification"
  | "clinical_alerts"
  | "dur_override"
  | "claim_submission"
  | "claim_reversal"
  | "dispensing"
  | "final_verification"
  | "inventory_modification"
  | "purchase_order_creation"
  | "reports_access"
  | "data_export"
  | "audit_log_access";

export type PermissionDomain =
  | "Patient & Clinical"
  | "Dispensing & Billing"
  | "Inventory & Operations"
  | "Reporting & Governance";

export type PermissionDefinition = {
  key: PermissionKey;
  label: string;
  domain: PermissionDomain;
  description: string;
  highRisk: boolean;
  riskReason?: string;
};

export type RoleDefinition = {
  id: string;
  name: string;
  description: string;
  scope: "Clinical" | "Operations" | "Administration" | "Compliance";
  isSystem: boolean;
  permissions: PermissionKey[];
};

export type LocationUser = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  licenceNumber?: string;
  role: string;
  locationId: string;
  permissions: string[];
  status: "active" | "inactive";
};

export type AuditModule =
  | "Pharmacy Details"
  | "Regulatory Configuration"
  | "Operating Hours"
  | "Holiday Schedule"
  | "Pharmacist-in-Charge"
  | "Master Configuration"
  | "Location Configuration"
  | "Delivery Settings"
  | "Pickup Settings"
  | "Notification Settings"
  | "User Management"
  | "Roles & Permissions"
  | "Settings";

export type AuditLogEntry = {
  id: string;
  timestamp: string;
  actor: string;
  module: AuditModule;
  action: string;
  detail: string;
  risk: "standard" | "high-risk";
  source: "session" | "demo";
};

export type TransferStatus =
  | "draft"
  | "pending"
  | "approved"
  | "in-transit"
  | "received"
  | "cancelled";

export type Transfer = {
  id: string;
  reference: string;
  sourceId: string;
  destinationId: string;
  date: string;
  product: string;
  quantity: number;
  status: TransferStatus;
  createdBy: string;
  notes: string;
};

export type PriceRule = {
  id: string;
  locationId: string;
  product: string;
  defaultPrice: number;
  overridePrice: number | null;
  effectiveFrom: string;
  effectiveTo: string;
};

export type WorkflowConfig = {
  pharmacistRelease: boolean;
  dualCheckControlled: boolean;
  inventoryApproval: boolean;
  transferApproval: boolean;
  notifyTransfer: boolean;
  notifyLowStock: boolean;
};

export type SalesPoint = {
  locationId: string;
  sales: number;
  transfers: number;
};

export type CposState = {
  pharmacy: PharmacyProfile;
  regulatory: RegulatoryConfig;
  picAssignments: PicAssignment[];
  masterConfig: MasterConfigState;
  contact: ContactInfo;
  regional: RegionalConfig;
  hours: DayHours[];
  specialHours: SpecialHoursEntry[];
  holidays: Holiday[];
  delivery: DeliveryConfig;
  pickup: PickupConfig;
  notifications: NotificationSetting[];
  locations: PharmacyLocation[];
  sharedRecords: SharedRecordsConfig;
  inventory: InventoryItem[];
  transferPolicy: TransferPolicy;
  users: LocationUser[];
  roles: RoleDefinition[];
  auditLogs: AuditLogEntry[];
  transfers: Transfer[];
  pricing: PriceRule[];
  workflows: WorkflowConfig;
  sales: SalesPoint[];
};

export type Notice = {
  id: number;
  tone: "success" | "error";
  title: string;
  message: string;
};

export type DashboardNotification = {
  id: string;
  title: string;
  description: string;
  time: string;
  severity: "warning" | "danger" | "info" | "success";
  read: boolean;
  href: string;
};
