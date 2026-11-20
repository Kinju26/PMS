import {
  Boxes,
  CalendarDays,
  ClipboardList,
  Clock3,
  CreditCard,
  FileBarChart,
  HelpCircle,
  KeyRound,
  Layers,
  LayoutDashboard,
  Scale,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Store,
  UserCheck,
  UserCog,
  Users,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
  keywords?: string[];
};

export type NavGroup = {
  id: string;
  label: string;
  icon: LucideIcon;
  children: NavItem[];
};

export type SidebarSection = {
  id: string;
  heading: string;
  entries: Array<
    | { kind: "item"; item: NavItem }
    | { kind: "group"; group: NavGroup }
  >;
};

export const dashboardItem: NavItem = {
  href: "/dashboard",
  label: "Dashboard",
  icon: LayoutDashboard,
  keywords: ["setup", "home", "overview", "completion", "phase 0"],
};

export const sidebarSections: SidebarSection[] = [
  {
    id: "workspace",
    heading: "Pharmacy Operations",
    entries: [
      { kind: "item", item: dashboardItem },
      {
        kind: "item",
        item: {
          href: "/locations/workflows",
          label: "Prescriptions",
          icon: ClipboardList,
          keywords: ["rx", "dispensing", "workflows", "verification"],
        },
      },
      {
        kind: "item",
        item: {
          href: "/locations/shared-records",
          label: "Patients",
          icon: Users,
          keywords: ["patient", "records", "profiles"],
        },
      },
      {
        kind: "item",
        item: {
          href: "/locations/inventory",
          label: "Inventory",
          icon: Boxes,
          keywords: ["stock", "din", "reorder", "medicines"],
        },
      },
      {
        kind: "item",
        item: {
          href: "/locations/pricing",
          label: "Billing & Claims",
          icon: CreditCard,
          keywords: ["claims", "pricing", "dispensing fee", "cad"],
        },
      },
      {
        kind: "item",
        item: {
          href: "/locations/reporting",
          label: "Reports",
          icon: FileBarChart,
          keywords: ["analytics", "reporting", "exports"],
        },
      },
    ],
  },
  {
    id: "configuration",
    heading: "Phase 0 · Configuration",
    entries: [
      {
        kind: "group",
        group: {
          id: "pharmacy-configuration",
          label: "Pharmacy Configuration",
          icon: SlidersHorizontal,
          children: [
            {
              href: "/configuration/pharmacy",
              label: "Pharmacy Details",
              icon: Store,
              keywords: ["legal", "operating name", "address", "logo", "status"],
            },
            {
              href: "/configuration/regulatory",
              label: "Regulatory Configuration",
              icon: Scale,
              keywords: ["licence", "ocp", "authority", "province", "identifiers"],
            },
            {
              href: "/configuration/hours",
              label: "Operating Hours",
              icon: Clock3,
              keywords: ["schedule", "opening", "closing", "break hours", "closed"],
            },
            {
              href: "/configuration/holidays",
              label: "Holiday Schedule",
              icon: CalendarDays,
              keywords: ["holidays", "statutory", "modified hours", "closures"],
            },
            {
              href: "/configuration/pic",
              label: "Pharmacist-in-Charge",
              icon: UserCheck,
              keywords: ["pic", "designated manager", "registration", "assignment"],
            },
          ],
        },
      },
      {
        kind: "item",
        item: {
          href: "/configuration/master",
          label: "Master Configuration",
          icon: Layers,
          keywords: [
            "locations",
            "departments",
            "prescription statuses",
            "payment methods",
            "tax",
            "notifications",
            "reference data",
          ],
        },
      },
      {
        kind: "group",
        group: {
          id: "users-and-roles",
          label: "Users & Roles",
          icon: ShieldCheck,
          children: [
            {
              href: "/locations/users",
              label: "Users",
              icon: Users,
              keywords: ["staff", "accounts", "pharmacist", "technician"],
            },
            {
              href: "/access/roles",
              label: "Roles",
              icon: UserCog,
              keywords: ["roles", "auditor", "manager", "owner"],
            },
            {
              href: "/access/permissions",
              label: "Permissions Matrix",
              icon: KeyRound,
              keywords: ["permissions", "matrix", "dur override", "high risk"],
            },
          ],
        },
      },
    ],
  },
  {
    id: "system",
    heading: "System",
    entries: [
      {
        kind: "item",
        item: {
          href: "/configuration/contact",
          label: "Settings",
          icon: Settings,
          keywords: ["regional", "time zone", "currency", "cad", "language"],
        },
      },
      {
        kind: "item",
        item: {
          href: "/settings/security",
          label: "Admin Security",
          icon: KeyRound,
          keywords: ["password", "security", "super admin", "credentials"],
        },
      },
      {
        kind: "item",
        item: {
          href: "/support",
          label: "Support",
          icon: HelpCircle,
          keywords: ["help", "documentation", "phase 0", "audit logs", "system info"],
        },
      },
    ],
  },
];

export type QuickNavLink = {
  href: string;
  label: string;
  section: string;
  keywords: string[];
};

export const quickSearchLinks: QuickNavLink[] = [
  ...sidebarSections.flatMap((section) =>
    section.entries.flatMap((entry) =>
      entry.kind === "item"
        ? [
            {
              href: entry.item.href,
              label: entry.item.label,
              section: section.heading,
              keywords: entry.item.keywords ?? [],
            },
          ]
        : entry.group.children.map((child) => ({
            href: child.href,
            label: child.label,
            section: entry.group.label,
            keywords: [...(child.keywords ?? []), entry.group.label.toLowerCase()],
          })),
    ),
  ),
  {
    href: "/configuration/master/locations",
    label: "Master · Pharmacy Locations",
    section: "Master Configuration",
    keywords: ["locations", "branches", "sites"],
  },
  {
    href: "/configuration/master/departments",
    label: "Master · Departments",
    section: "Master Configuration",
    keywords: ["departments", "dispensary", "compounding", "otc"],
  },
  {
    href: "/configuration/master/prescription-statuses",
    label: "Master · Prescription Status Settings",
    section: "Master Configuration",
    keywords: ["rx status", "workflow", "queue"],
  },
  {
    href: "/configuration/master/payment-methods",
    label: "Master · Payment Methods",
    section: "Master Configuration",
    keywords: ["payment", "interac", "cash", "insurance", "cad"],
  },
  {
    href: "/configuration/master/tax",
    label: "Master · Tax Configuration",
    section: "Master Configuration",
    keywords: ["hst", "gst", "pst", "qst", "tax"],
  },
  {
    href: "/configuration/master/notifications",
    label: "Master · Notification Preferences",
    section: "Master Configuration",
    keywords: ["email", "sms", "push", "alerts"],
  },
  {
    href: "/configuration/master/reference-data",
    label: "Master · Common Reference Data",
    section: "Master Configuration",
    keywords: ["dosage", "sig", "routes", "hold reasons"],
  },
  {
    href: "/audit-logs",
    label: "Audit Logs",
    section: "Governance",
    keywords: ["audit", "history", "changes", "compliance"],
  },
];
