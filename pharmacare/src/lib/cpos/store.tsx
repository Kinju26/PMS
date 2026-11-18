"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { DEFAULT_ROLES } from "@/lib/cpos/constants";
import { initialState, SESSION_SAVE_MESSAGE } from "@/lib/cpos/mock-data";
import { createId } from "@/lib/utils";
import type {
  AuditLogEntry,
  AuditModule,
  ContactInfo,
  CposState,
  DayHours,
  DeliveryConfig,
  DeliveryZone,
  DepartmentItem,
  Holiday,
  InventoryItem,
  LocationUser,
  Notice,
  NotificationSetting,
  PaymentMethodItem,
  PermissionKey,
  PharmacyLocation,
  PharmacyProfile,
  PicAssignment,
  PickupConfig,
  PrescriptionStatusItem,
  PriceRule,
  ReferenceDataItem,
  RegionalConfig,
  RegulatoryConfig,
  RoleDefinition,
  SharedRecordsConfig,
  SpecialHoursEntry,
  TaxRuleItem,
  Transfer,
  TransferPolicy,
  WorkflowConfig,
} from "@/types/cpos";

const STORAGE_KEY = "cpos.phase0.state.v2";

type CposContextValue = {
  state: CposState;
  notice: Notice | null;
  dismissNotice: () => void;
  notify: (tone: Notice["tone"], title: string, message?: string) => void;
  resetDemoData: () => void;
  savePharmacy: (pharmacy: PharmacyProfile) => void;
  saveFullPharmacyProfile: (
    pharmacy: PharmacyProfile,
    contact: ContactInfo,
    timeZone: string,
  ) => void;
  saveRegulatory: (regulatory: RegulatoryConfig) => void;
  savePicAssignment: (assignment: PicAssignment) => void;
  deletePicAssignment: (id: string) => void;
  saveDepartment: (item: DepartmentItem) => void;
  deleteDepartment: (id: string) => void;
  savePrescriptionStatus: (item: PrescriptionStatusItem) => void;
  deletePrescriptionStatus: (id: string) => void;
  savePaymentMethod: (item: PaymentMethodItem) => void;
  deletePaymentMethod: (id: string) => void;
  saveTaxRule: (item: TaxRuleItem) => void;
  deleteTaxRule: (id: string) => void;
  saveReferenceItem: (item: ReferenceDataItem) => void;
  deleteReferenceItem: (id: string) => void;
  saveContact: (contact: ContactInfo, regional: RegionalConfig) => void;
  saveHours: (hours: DayHours[]) => void;
  saveSpecialHours: (entry: SpecialHoursEntry) => void;
  deleteSpecialHours: (id: string) => void;
  saveHoliday: (holiday: Holiday) => void;
  deleteHoliday: (id: string) => void;
  saveDeliveryEnabled: (enabled: boolean) => void;
  saveDeliverySettings: (patch: Pick<DeliveryConfig, "enabled" | "instructions" | "timeWindows">) => void;
  saveZone: (zone: DeliveryZone) => void;
  deleteZone: (id: string) => void;
  savePickup: (pickup: PickupConfig) => void;
  saveNotifications: (notifications: NotificationSetting[]) => void;
  saveLocation: (location: PharmacyLocation) => void;
  setLocationStatus: (id: string, status: PharmacyLocation["status"]) => void;
  saveSharedRecords: (config: SharedRecordsConfig) => void;
  saveInventoryItem: (item: InventoryItem) => void;
  saveTransferPolicy: (policy: TransferPolicy) => void;
  saveUser: (user: LocationUser) => void;
  setUserStatus: (id: string, status: LocationUser["status"]) => void;
  saveRole: (role: RoleDefinition) => void;
  saveRolePermissions: (roleId: string, permissions: PermissionKey[]) => void;
  resetRolePermissions: () => void;
  saveTransfer: (transfer: Transfer) => void;
  setTransferStatus: (id: string, status: Transfer["status"]) => void;
  savePrice: (rule: PriceRule) => void;
  deletePrice: (id: string) => void;
  saveWorkflows: (workflows: WorkflowConfig) => void;
};

const CposContext = createContext<CposContextValue | null>(null);

function withNotice(title: string): Notice {
  return { id: Date.now(), tone: "success", title, message: SESSION_SAVE_MESSAGE };
}

function createAuditEntry(
  module: AuditModule,
  action: string,
  detail: string,
  risk: "standard" | "high-risk" = "standard",
): AuditLogEntry {
  const now = new Date();
  const stamp = `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)} Local`;
  return {
    id: createId("aud"),
    timestamp: stamp,
    actor: "Admin (Local)",
    module,
    action,
    detail,
    risk,
    source: "session",
  };
}

function loadStoredState(): CposState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CposState>;
    if (!parsed || typeof parsed !== "object") return null;
    return {
      ...initialState,
      ...parsed,
      pharmacy: { ...initialState.pharmacy, ...(parsed.pharmacy ?? {}) },
      regulatory: { ...initialState.regulatory, ...(parsed.regulatory ?? {}) },
      contact: { ...initialState.contact, ...(parsed.contact ?? {}) },
      regional: { ...initialState.regional, ...(parsed.regional ?? {}) },
      delivery: { ...initialState.delivery, ...(parsed.delivery ?? {}) },
      pickup: { ...initialState.pickup, ...(parsed.pickup ?? {}) },
      masterConfig: { ...initialState.masterConfig, ...(parsed.masterConfig ?? {}) },
    };
  } catch {
    return null;
  }
}

export function CposProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CposState>(initialState);
  const [notice, setNotice] = useState<Notice | null>(null);
  const hydratedRef = useRef(false);

  // Hydrate persisted demonstration state from browser localStorage
  useEffect(() => {
    const stored = loadStoredState();
    hydratedRef.current = true;
    if (stored) {
      queueMicrotask(() => setState(stored));
    }
  }, []);

  // Persist updates to localStorage after hydration
  useEffect(() => {
    if (!hydratedRef.current) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors in restricted browsing modes
    }
  }, [state]);

  // Auto-dismiss toast notifications cleanly
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 4800);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const api = useMemo<CposContextValue>(() => {
    const notify: CposContextValue["notify"] = (tone, title, message = SESSION_SAVE_MESSAGE) => {
      setNotice({ id: Date.now(), tone, title, message });
    };

    return {
      state,
      notice,
      dismissNotice: () => setNotice(null),
      notify,
      resetDemoData: () => {
        try {
          window.localStorage.removeItem(STORAGE_KEY);
        } catch {
          // ignore
        }
        setState(initialState);
        setNotice({
          id: Date.now(),
          tone: "success",
          title: "Demonstration data reset",
          message: "Restored default NorthStar Community Pharmacy configuration.",
        });
      },
      savePharmacy: (pharmacy) => {
        setState((current) => ({
          ...current,
          pharmacy,
          auditLogs: [
            createAuditEntry(
              "Pharmacy Details",
              "Updated pharmacy details",
              `Saved profile for ${pharmacy.operatingName} (${pharmacy.status}).`,
            ),
            ...current.auditLogs,
          ],
        }));
        setNotice(withNotice("Pharmacy details saved"));
      },
      saveFullPharmacyProfile: (pharmacy, contact, timeZone) => {
        setState((current) => ({
          ...current,
          pharmacy,
          contact,
          regional: { ...current.regional, timeZone },
          locations: current.locations.map((loc, index) =>
            loc.isPrimary || index === 0
              ? {
                  ...loc,
                  legalName: pharmacy.legalName,
                  operatingName: pharmacy.operatingName,
                  pharmacistInCharge: pharmacy.pharmacistInCharge,
                  street: contact.street,
                  city: contact.city,
                  province: contact.province,
                  postalCode: contact.postalCode,
                  phone: contact.phone,
                  fax: contact.fax,
                  email: contact.email,
                  timeZone,
                  status: pharmacy.status,
                }
              : loc,
          ),
          auditLogs: [
            createAuditEntry(
              "Pharmacy Details",
              "Updated pharmacy details",
              `Updated ${pharmacy.operatingName} (${contact.city}, ${contact.province}) · Status: ${pharmacy.status}.`,
            ),
            ...current.auditLogs,
          ],
        }));
        setNotice(withNotice("Pharmacy details saved"));
      },
      saveRegulatory: (regulatory) => {
        setState((current) => ({
          ...current,
          regulatory,
          pharmacy: {
            ...current.pharmacy,
            province: regulatory.province,
            regulatoryId: `${regulatory.pharmacyLicenceNumber} · ${regulatory.primaryIdentifier}`,
          },
          auditLogs: [
            createAuditEntry(
              "Regulatory Configuration",
              "Updated regulatory identifiers",
              `${regulatory.regulatoryAuthority} · Licence ${regulatory.pharmacyLicenceNumber} (${regulatory.additionalIdentifiers.length} custom IDs).`,
              "high-risk",
            ),
            ...current.auditLogs,
          ],
        }));
        setNotice(withNotice("Regulatory configuration saved"));
      },
      savePicAssignment: (assignment) => {
        setState((current) => {
          const exists = current.picAssignments.some((item) => item.id === assignment.id);
          let nextList = exists
            ? current.picAssignments.map((item) => (item.id === assignment.id ? assignment : item))
            : [assignment, ...current.picAssignments];

          // If this assignment is marked active, automatically end any previously active PIC
          if (assignment.status === "active") {
            const endDate = assignment.effectiveStartDate || new Date().toISOString().slice(0, 10);
            nextList = nextList.map((item) =>
              item.id !== assignment.id && item.status === "active"
                ? { ...item, status: "ended", effectiveEndDate: item.effectiveEndDate || endDate }
                : item,
            );
          }

          const activePic = nextList.find((item) => item.status === "active");

          return {
            ...current,
            picAssignments: nextList,
            pharmacy: activePic
              ? {
                  ...current.pharmacy,
                  pharmacistInCharge: `${activePic.pharmacistName} (${activePic.registrationNumber})`,
                }
              : current.pharmacy,
            auditLogs: [
              createAuditEntry(
                "Pharmacist-in-Charge",
                exists ? "Updated PIC assignment" : "Assigned Pharmacist-in-Charge",
                `${assignment.pharmacistName} (${assignment.registrationNumber}) · Status: ${assignment.status}.`,
                "high-risk",
              ),
              ...current.auditLogs,
            ],
          };
        });
        setNotice(withNotice("Pharmacist-in-Charge assignment saved"));
      },
      deletePicAssignment: (id) => {
        setState((current) => {
          const removed = current.picAssignments.find((item) => item.id === id);
          return {
            ...current,
            picAssignments: current.picAssignments.filter((item) => item.id !== id),
            auditLogs: [
              createAuditEntry(
                "Pharmacist-in-Charge",
                "Removed PIC history entry",
                removed ? `Removed ${removed.pharmacistName} (${removed.registrationNumber}).` : "Removed PIC record.",
                "high-risk",
              ),
              ...current.auditLogs,
            ],
          };
        });
        setNotice(withNotice("Assignment record deleted"));
      },
      saveDepartment: (item) => {
        setState((current) => {
          const exists = current.masterConfig.departments.some((d) => d.id === item.id);
          const departments = exists
            ? current.masterConfig.departments.map((d) => (d.id === item.id ? item : d))
            : [...current.masterConfig.departments, item];
          return {
            ...current,
            masterConfig: { ...current.masterConfig, departments },
            auditLogs: [
              createAuditEntry(
                "Master Configuration",
                exists ? "Updated department" : "Added department",
                `${item.name} (${item.code}) · ${item.status}.`,
              ),
              ...current.auditLogs,
            ],
          };
        });
        setNotice(withNotice("Department saved"));
      },
      deleteDepartment: (id) => {
        setState((current) => ({
          ...current,
          masterConfig: {
            ...current.masterConfig,
            departments: current.masterConfig.departments.filter((d) => d.id !== id),
          },
          auditLogs: [
            createAuditEntry("Master Configuration", "Deleted department", `Removed department ${id}.`),
            ...current.auditLogs,
          ],
        }));
        setNotice(withNotice("Department deleted"));
      },
      savePrescriptionStatus: (item) => {
        setState((current) => {
          const exists = current.masterConfig.prescriptionStatuses.some((s) => s.id === item.id);
          const prescriptionStatuses = exists
            ? current.masterConfig.prescriptionStatuses.map((s) => (s.id === item.id ? item : s))
            : [...current.masterConfig.prescriptionStatuses, item];
          return {
            ...current,
            masterConfig: { ...current.masterConfig, prescriptionStatuses },
            auditLogs: [
              createAuditEntry(
                "Master Configuration",
                exists ? "Updated prescription status" : "Added prescription status",
                `${item.label} (${item.code}) in stage ${item.stage}.`,
              ),
              ...current.auditLogs,
            ],
          };
        });
        setNotice(withNotice("Prescription status saved"));
      },
      deletePrescriptionStatus: (id) => {
        setState((current) => ({
          ...current,
          masterConfig: {
            ...current.masterConfig,
            prescriptionStatuses: current.masterConfig.prescriptionStatuses.filter((s) => s.id !== id),
          },
        }));
        setNotice(withNotice("Prescription status deleted"));
      },
      savePaymentMethod: (item) => {
        setState((current) => {
          const exists = current.masterConfig.paymentMethods.some((p) => p.id === item.id);
          const paymentMethods = exists
            ? current.masterConfig.paymentMethods.map((p) => (p.id === item.id ? item : p))
            : [...current.masterConfig.paymentMethods, item];
          return {
            ...current,
            masterConfig: { ...current.masterConfig, paymentMethods },
            auditLogs: [
              createAuditEntry(
                "Master Configuration",
                exists ? "Updated payment method" : "Added payment method",
                `${item.name} (${item.code}) · ${item.enabled ? "Enabled" : "Disabled"}.`,
              ),
              ...current.auditLogs,
            ],
          };
        });
        setNotice(withNotice("Payment method saved"));
      },
      deletePaymentMethod: (id) => {
        setState((current) => ({
          ...current,
          masterConfig: {
            ...current.masterConfig,
            paymentMethods: current.masterConfig.paymentMethods.filter((p) => p.id !== id),
          },
        }));
        setNotice(withNotice("Payment method removed"));
      },
      saveTaxRule: (item) => {
        setState((current) => {
          const exists = current.masterConfig.taxRules.some((t) => t.id === item.id);
          const taxRules = exists
            ? current.masterConfig.taxRules.map((t) => (t.id === item.id ? item : t))
            : [...current.masterConfig.taxRules, item];
          return {
            ...current,
            masterConfig: { ...current.masterConfig, taxRules },
            auditLogs: [
              createAuditEntry(
                "Master Configuration",
                exists ? "Updated tax rule" : "Added tax rule",
                `${item.name} (${item.taxType} ${item.rate}%) for ${item.province}.`,
              ),
              ...current.auditLogs,
            ],
          };
        });
        setNotice(withNotice("Tax rule saved"));
      },
      deleteTaxRule: (id) => {
        setState((current) => ({
          ...current,
          masterConfig: {
            ...current.masterConfig,
            taxRules: current.masterConfig.taxRules.filter((t) => t.id !== id),
          },
        }));
        setNotice(withNotice("Tax rule deleted"));
      },
      saveReferenceItem: (item) => {
        setState((current) => {
          const exists = current.masterConfig.referenceData.some((r) => r.id === item.id);
          const referenceData = exists
            ? current.masterConfig.referenceData.map((r) => (r.id === item.id ? item : r))
            : [...current.masterConfig.referenceData, item];
          return {
            ...current,
            masterConfig: { ...current.masterConfig, referenceData },
            auditLogs: [
              createAuditEntry(
                "Master Configuration",
                exists ? "Updated reference code" : "Added reference code",
                `${item.code} — ${item.label} (${item.category}).`,
              ),
              ...current.auditLogs,
            ],
          };
        });
        setNotice(withNotice("Reference data saved"));
      },
      deleteReferenceItem: (id) => {
        setState((current) => ({
          ...current,
          masterConfig: {
            ...current.masterConfig,
            referenceData: current.masterConfig.referenceData.filter((r) => r.id !== id),
          },
        }));
        setNotice(withNotice("Reference item deleted"));
      },
      saveContact: (contact, regional) => {
        setState((current) => ({
          ...current,
          contact,
          regional,
          auditLogs: [
            createAuditEntry(
              "Settings",
              "Updated contact and regional settings",
              `Currency ${regional.currency}, TZ ${regional.timeZone}, language ${regional.language}.`,
            ),
            ...current.auditLogs,
          ],
        }));
        setNotice(withNotice("Contact and regional settings saved"));
      },
      saveHours: (hours) => {
        setState((current) => ({
          ...current,
          hours,
          auditLogs: [
            createAuditEntry(
              "Operating Hours",
              "Saved weekly operating schedule",
              `${hours.filter((h) => h.open).length} open days configured.`,
            ),
            ...current.auditLogs,
          ],
        }));
        setNotice(withNotice("Operating schedule saved"));
      },
      saveSpecialHours: (entry) => {
        setState((current) => {
          const exists = current.specialHours.some((item) => item.id === entry.id);
          const specialHours = exists
            ? current.specialHours.map((item) => (item.id === entry.id ? entry : item))
            : [...current.specialHours, { ...entry, id: entry.id || createId("sh") }];
          return {
            ...current,
            specialHours,
            auditLogs: [
              createAuditEntry(
                "Operating Hours",
                exists ? "Updated special hours" : "Added special hours",
                `${entry.label} on ${entry.date} (${entry.opens}–${entry.closes}).`,
              ),
              ...current.auditLogs,
            ],
          };
        });
        setNotice(withNotice("Special operating hours saved"));
      },
      deleteSpecialHours: (id) => {
        setState((current) => {
          const removed = current.specialHours.find((item) => item.id === id);
          return {
            ...current,
            specialHours: current.specialHours.filter((item) => item.id !== id),
            auditLogs: [
              createAuditEntry(
                "Operating Hours",
                "Removed special hours",
                removed ? `Removed "${removed.label}" (${removed.date}).` : "Removed special hours entry.",
              ),
              ...current.auditLogs,
            ],
          };
        });
        setNotice(withNotice("Special hours entry removed"));
      },
      saveHoliday: (holiday) => {
        setState((current) => {
          const exists = current.holidays.some((item) => item.id === holiday.id);
          const holidays = exists
            ? current.holidays.map((item) => (item.id === holiday.id ? holiday : item))
            : [...current.holidays, { ...holiday, id: holiday.id || createId("hol") }];
          return {
            ...current,
            holidays,
            auditLogs: [
              createAuditEntry(
                "Holiday Schedule",
                exists ? "Updated holiday" : "Added holiday",
                `${holiday.name} (${holiday.date}) — ${holiday.closure === "full" ? "Closed" : `${holiday.opens}–${holiday.closes}`}.`,
              ),
              ...current.auditLogs,
            ],
          };
        });
        setNotice(withNotice("Holiday schedule saved"));
      },
      deleteHoliday: (id) => {
        setState((current) => {
          const target = current.holidays.find((item) => item.id === id);
          return {
            ...current,
            holidays: current.holidays.filter((item) => item.id !== id),
            auditLogs: [
              createAuditEntry(
                "Holiday Schedule",
                "Deleted holiday",
                target ? `Removed ${target.name} (${target.date}).` : "Removed holiday entry.",
              ),
              ...current.auditLogs,
            ],
          };
        });
        setNotice(withNotice("Holiday deleted"));
      },
      saveDeliveryEnabled: (enabled) => {
        setState((current) => ({
          ...current,
          delivery: { ...current.delivery, enabled },
          auditLogs: [
            createAuditEntry(
              "Delivery Settings",
              enabled ? "Enabled delivery service" : "Disabled delivery service",
              `Delivery availability switched ${enabled ? "on" : "off"}.`,
            ),
            ...current.auditLogs,
          ],
        }));
        setNotice(withNotice(enabled ? "Delivery enabled" : "Delivery disabled"));
      },
      saveDeliverySettings: (patch) => {
        setState((current) => ({
          ...current,
          delivery: { ...current.delivery, ...patch },
          auditLogs: [
            createAuditEntry(
              "Delivery Settings",
              "Updated delivery time windows & instructions",
              `${patch.timeWindows.filter((w) => w.enabled).length} active delivery windows configured.`,
            ),
            ...current.auditLogs,
          ],
        }));
        setNotice(withNotice("Delivery settings saved"));
      },
      saveZone: (zone) => {
        setState((current) => {
          const exists = current.delivery.zones.some((item) => item.id === zone.id);
          const zones = exists
            ? current.delivery.zones.map((item) => (item.id === zone.id ? zone : item))
            : [...current.delivery.zones, { ...zone, id: zone.id || createId("zone") }];
          return {
            ...current,
            delivery: { ...current.delivery, zones },
            auditLogs: [
              createAuditEntry(
                "Delivery Settings",
                exists ? "Updated delivery zone" : "Added delivery zone",
                `${zone.name} (${zone.postalCodes}) · $${zone.fee} CAD.`,
              ),
              ...current.auditLogs,
            ],
          };
        });
        setNotice(withNotice("Delivery zone saved"));
      },
      deleteZone: (id) => {
        setState((current) => {
          const target = current.delivery.zones.find((z) => z.id === id);
          return {
            ...current,
            delivery: {
              ...current.delivery,
              zones: current.delivery.zones.filter((zone) => zone.id !== id),
            },
            auditLogs: [
              createAuditEntry(
                "Delivery Settings",
                "Removed delivery zone",
                target ? `Removed zone "${target.name}".` : "Removed delivery zone.",
              ),
              ...current.auditLogs,
            ],
          };
        });
        setNotice(withNotice("Delivery zone removed"));
      },
      savePickup: (pickup) => {
        setState((current) => ({
          ...current,
          pickup,
          auditLogs: [
            createAuditEntry(
              "Pickup Settings",
              "Updated pickup configuration",
              `Pickup ${pickup.enabled ? "enabled" : "disabled"}; hours mode: ${pickup.pickupHoursMode}.`,
            ),
            ...current.auditLogs,
          ],
        }));
        setNotice(withNotice("Pickup settings saved"));
      },
      saveNotifications: (notifications) => {
        setState((current) => ({
          ...current,
          notifications,
          auditLogs: [
            createAuditEntry(
              "Notification Settings",
              "Updated notification preferences",
              `${notifications.filter((n) => n.enabled).length} of ${notifications.length} preferences enabled.`,
            ),
            ...current.auditLogs,
          ],
        }));
        setNotice(withNotice("Notification preferences saved"));
      },
      saveLocation: (location) => {
        setState((current) => {
          const exists = current.locations.some((item) => item.id === location.id);
          const locations = exists
            ? current.locations.map((item) => (item.id === location.id ? location : item))
            : [...current.locations, location];
          const accessExists = current.sharedRecords.access.some((item) => item.locationId === location.id);
          const access = accessExists
            ? current.sharedRecords.access
            : [...current.sharedRecords.access, { locationId: location.id, canView: false, canEdit: false }];
          return {
            ...current,
            locations,
            sharedRecords: { ...current.sharedRecords, access },
            auditLogs: [
              createAuditEntry(
                "Location Configuration",
                exists ? "Updated pharmacy location" : "Added pharmacy location",
                `${location.operatingName} (${location.code}) — ${location.city}, ${location.province}.`,
              ),
              ...current.auditLogs,
            ],
          };
        });
        setNotice(withNotice("Location saved"));
      },
      setLocationStatus: (id, status) => {
        setState((current) => {
          const loc = current.locations.find((item) => item.id === id);
          return {
            ...current,
            locations: current.locations.map((location) =>
              location.id === id ? { ...location, status } : location,
            ),
            auditLogs: [
              createAuditEntry(
                "Location Configuration",
                "Changed location status",
                `${loc?.operatingName ?? id} status set to ${status}.`,
              ),
              ...current.auditLogs,
            ],
          };
        });
        setNotice(withNotice("Location status updated"));
      },
      saveSharedRecords: (sharedRecords) => {
        setState((current) => ({ ...current, sharedRecords }));
        setNotice(withNotice("Shared record policy saved"));
      },
      saveInventoryItem: (item) => {
        setState((current) => ({
          ...current,
          inventory: current.inventory.map((row) => (row.id === item.id ? item : row)),
        }));
        setNotice(withNotice("Inventory row updated"));
      },
      saveTransferPolicy: (transferPolicy) => {
        setState((current) => ({ ...current, transferPolicy }));
        setNotice(withNotice("Transfer policy saved"));
      },
      saveUser: (user) => {
        setState((current) => {
          const exists = current.users.some((item) => item.id === user.id);
          const users = exists
            ? current.users.map((item) => (item.id === user.id ? user : item))
            : [...current.users, user];
          return {
            ...current,
            users,
            auditLogs: [
              createAuditEntry(
                "User Management",
                exists ? "Updated staff profile" : "Created staff account",
                `${user.name} (${user.role}) — ${user.status}.`,
                "high-risk",
              ),
              ...current.auditLogs,
            ],
          };
        });
        setNotice(withNotice("User profile saved"));
      },
      setUserStatus: (id, status) => {
        setState((current) => {
          const target = current.users.find((u) => u.id === id);
          return {
            ...current,
            users: current.users.map((user) => (user.id === id ? { ...user, status } : user)),
            auditLogs: [
              createAuditEntry(
                "User Management",
                status === "active" ? "Activated user account" : "Deactivated user account",
                `${target?.name ?? id} (${target?.role ?? "Staff"}) marked ${status}.`,
                "high-risk",
              ),
              ...current.auditLogs,
            ],
          };
        });
        setNotice(withNotice("User status updated"));
      },
      saveRole: (role) => {
        setState((current) => {
          const exists = current.roles.some((r) => r.id === role.id);
          const roles = exists
            ? current.roles.map((r) => (r.id === role.id ? role : r))
            : [...current.roles, role];
          return {
            ...current,
            roles,
            auditLogs: [
              createAuditEntry(
                "Roles & Permissions",
                exists ? "Updated role definition" : "Created custom role",
                `${role.name} (${role.scope}) with ${role.permissions.length} assigned permissions.`,
                "high-risk",
              ),
              ...current.auditLogs,
            ],
          };
        });
        setNotice(withNotice("Role saved"));
      },
      saveRolePermissions: (roleId, permissions) => {
        setState((current) => {
          const target = current.roles.find((r) => r.id === roleId);
          return {
            ...current,
            roles: current.roles.map((role) =>
              role.id === roleId ? { ...role, permissions } : role,
            ),
            auditLogs: [
              createAuditEntry(
                "Roles & Permissions",
                "Modified role permission matrix",
                `Updated ${target?.name ?? roleId} to ${permissions.length} active permissions.`,
                "high-risk",
              ),
              ...current.auditLogs,
            ],
          };
        });
        setNotice(withNotice("Role permissions updated"));
      },
      resetRolePermissions: () => {
        setState((current) => ({
          ...current,
          roles: DEFAULT_ROLES,
          auditLogs: [
            createAuditEntry(
              "Roles & Permissions",
              "Reset role matrix to defaults",
              "Restored all 10 standard pharmacy roles to recommended defaults.",
              "high-risk",
            ),
            ...current.auditLogs,
          ],
        }));
        setNotice(withNotice("Role matrix reset to defaults"));
      },
      saveTransfer: (transfer) => {
        setState((current) => {
          const exists = current.transfers.some((item) => item.id === transfer.id);
          const transfers = exists
            ? current.transfers.map((item) => (item.id === transfer.id ? transfer : item))
            : [transfer, ...current.transfers];
          return { ...current, transfers };
        });
        setNotice(withNotice("Transfer saved"));
      },
      setTransferStatus: (id, status) => {
        setState((current) => ({
          ...current,
          transfers: current.transfers.map((transfer) =>
            transfer.id === id ? { ...transfer, status } : transfer,
          ),
        }));
        setNotice(withNotice("Transfer status updated"));
      },
      savePrice: (rule) => {
        setState((current) => {
          const exists = current.pricing.some((item) => item.id === rule.id);
          const pricing = exists
            ? current.pricing.map((item) => (item.id === rule.id ? rule : item))
            : [...current.pricing, rule];
          return { ...current, pricing };
        });
        setNotice(withNotice("Pricing rule saved"));
      },
      deletePrice: (id) => {
        setState((current) => ({
          ...current,
          pricing: current.pricing.filter((rule) => rule.id !== id),
        }));
        setNotice(withNotice("Pricing rule removed"));
      },
      saveWorkflows: (workflows) => {
        setState((current) => ({ ...current, workflows }));
        setNotice(withNotice("Workflow rules saved"));
      },
    };
  }, [notice, state]);

  return <CposContext.Provider value={api}>{children}</CposContext.Provider>;
}

export function useCpos() {
  const context = useContext(CposContext);
  if (!context) {
    throw new Error("useCpos must be used inside CposProvider");
  }
  return context;
}
