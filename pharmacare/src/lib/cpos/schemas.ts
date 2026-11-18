import { z } from "zod";

const postalCode = z
  .string()
  .regex(/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/, "Enter a valid postal code (e.g., M5V 1K2)");

const provinceCode = z.enum(["AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT"]);

export const pharmacySchema = z.object({
  legalName: z.string().trim().min(2, "Enter the legal pharmacy name"),
  operatingName: z.string().trim().min(2, "Enter the operating name"),
  logoName: z.string(),
  pharmacyType: z.string().min(1, "Choose a pharmacy type"),
  regulatoryId: z.string().trim().min(3, "Enter the regulatory identifiers"),
  pharmacistInCharge: z.string().trim().min(2, "Name the pharmacist-in-charge"),
  province: provinceCode,
  status: z.enum(["active", "pending", "inactive"]),
});

export const pharmacyProfileFullSchema = z.object({
  legalName: z.string().trim().min(2, "Enter the legal pharmacy name"),
  operatingName: z.string().trim().min(2, "Enter the operating name"),
  logoName: z.string(),
  pharmacyType: z.string().min(1, "Choose a pharmacy type"),
  regulatoryId: z.string().trim().min(2, "Enter regulatory identifiers"),
  pharmacistInCharge: z.string().trim().min(2, "Name the pharmacist-in-charge"),
  status: z.enum(["active", "pending", "inactive"]),
  street: z.string().trim().min(3, "Enter the street address"),
  suite: z.string(),
  city: z.string().trim().min(2, "Enter the city"),
  province: provinceCode,
  postalCode,
  country: z.string().trim().min(2, "Enter the country"),
  phone: z.string().trim().min(10, "Enter a valid phone number"),
  fax: z.string(),
  email: z.string().trim().email("Enter a valid email address"),
  timeZone: z.string().min(1, "Choose a time zone"),
});

export const regulatorySchema = z.object({
  province: provinceCode,
  regulatoryAuthority: z.string().trim().min(2, "Enter the regulatory authority"),
  pharmacyLicenceNumber: z.string().trim().min(2, "Enter the pharmacy licence number"),
  primaryIdentifier: z.string().trim().min(2, "Enter primary regulatory identifiers"),
});

export const picAssignmentSchema = z
  .object({
    id: z.string(),
    pharmacistName: z.string().trim().min(2, "Enter the pharmacist's full name"),
    registrationNumber: z.string().trim().min(2, "Enter the registration / licence number"),
    phone: z.string().trim().min(7, "Enter a contact phone number"),
    email: z.string().trim().email("Enter a valid contact email"),
    effectiveStartDate: z.string().min(1, "Choose an effective start date"),
    effectiveEndDate: z.string(),
    status: z.enum(["active", "scheduled", "ended"]),
    notes: z.string(),
  })
  .refine(
    (value) => !value.effectiveEndDate || value.effectiveEndDate >= value.effectiveStartDate,
    {
      message: "Effective end date cannot be earlier than start date",
      path: ["effectiveEndDate"],
    },
  );

export const contactSchema = z.object({
  street: z.string().trim().min(3, "Enter the street address"),
  suite: z.string(),
  city: z.string().trim().min(2, "Enter the city"),
  province: provinceCode,
  postalCode,
  country: z.string().trim().min(2),
  phone: z.string().trim().min(10, "Enter a phone number"),
  fax: z.string(),
  email: z.string().trim().email("Enter a valid email address"),
  timeZone: z.string().min(1),
  dateFormat: z.string().min(1),
  timeFormat: z.enum(["12-hour", "24-hour"]),
  currency: z.literal("CAD"),
  language: z.string().min(1),
});

export const pickupSchema = z
  .object({
    enabled: z.boolean(),
    instructions: z.string().trim().min(8, "Add pickup instructions for staff and patients"),
    availability: z.string().trim().min(3, "Describe when pickup is available"),
    pickupHoursMode: z.enum(["same-as-pharmacy", "custom"]),
    pickupOpens: z.string(),
    pickupCloses: z.string(),
    eta: z.string().trim().min(3, "Enter an estimated pickup time"),
    requireIdVerification: z.boolean(),
    curbsideEnabled: z.boolean(),
    notifyReady: z.boolean(),
    notifyDelay: z.boolean(),
  })
  .refine(
    (value) =>
      value.pickupHoursMode === "same-as-pharmacy" ||
      (value.pickupOpens && value.pickupCloses && value.pickupCloses > value.pickupOpens),
    {
      message: "Custom pickup closing time must be later than opening time",
      path: ["pickupCloses"],
    },
  );

export const zoneSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(2, "Name the zone"),
  serviceAreas: z.string().trim().min(2, "Describe the service areas"),
  postalCodes: z.string().trim().min(3, "List the postal codes covered"),
  fee: z.string().regex(/^\d+(\.\d{1,2})?$/, "Enter a fee in dollars"),
  minimumOrder: z.string().regex(/^\d+(\.\d{1,2})?$/, "Enter a minimum order amount"),
  eta: z.string().trim().min(2, "Enter an estimated delivery time"),
  available: z.boolean(),
});

export const holidaySchema = z
  .object({
    id: z.string(),
    name: z.string().trim().min(2, "Name the holiday"),
    date: z.string().min(1, "Choose a date"),
    holidayType: z.enum(["Statutory", "Provincial", "Civic", "Pharmacy Custom"]),
    closure: z.enum(["full", "special"]),
    opens: z.string(),
    closes: z.string(),
  })
  .refine((value) => value.closure === "full" || (value.opens && value.closes && value.closes > value.opens), {
    message: "Modified hours require an opening time earlier than the closing time",
    path: ["closes"],
  });

export const specialHoursSchema = z
  .object({
    id: z.string(),
    label: z.string().trim().min(2, "Enter a label for the special hours"),
    date: z.string().min(1, "Choose a date"),
    opens: z.string().min(1, "Choose an opening time"),
    closes: z.string().min(1, "Choose a closing time"),
    notes: z.string(),
  })
  .refine((value) => value.closes > value.opens, {
    message: "Closing time must be later than opening time",
    path: ["closes"],
  });

export const locationSchema = z.object({
  id: z.string(),
  legalName: z.string().trim().min(2, "Enter the legal name"),
  operatingName: z.string().trim().min(2, "Enter the operating name"),
  code: z.string().trim().min(2, "Enter a location code"),
  logoName: z.string(),
  pharmacistInCharge: z.string().trim().min(2, "Name the pharmacist-in-charge"),
  street: z.string().trim().min(3, "Enter the address"),
  city: z.string().trim().min(2, "Enter the city"),
  province: provinceCode,
  postalCode,
  phone: z.string().trim().min(10, "Enter a phone number"),
  fax: z.string(),
  email: z.string().trim().email("Enter a valid email"),
  timeZone: z.string().min(1),
  deliveryEnabled: z.boolean(),
  pickupEnabled: z.boolean(),
  notificationsEnabled: z.boolean(),
  status: z.enum(["active", "inactive", "pending"]),
  manager: z.string().trim().min(2, "Name the assigned manager"),
});

export const transferSchema = z
  .object({
    id: z.string(),
    reference: z.string().trim().min(3, "Enter a reference number"),
    sourceId: z.string().min(1, "Choose a source"),
    destinationId: z.string().min(1, "Choose a destination"),
    date: z.string().min(1, "Choose a date"),
    product: z.string().trim().min(2, "Name the product"),
    quantity: z.number().int().positive("Enter a quantity"),
    status: z.enum(["draft", "pending", "approved", "in-transit", "received", "cancelled"]),
    createdBy: z.string().trim().min(2),
    notes: z.string(),
  })
  .refine((value) => value.sourceId !== value.destinationId, {
    message: "Source and destination must be different locations",
    path: ["destinationId"],
  });

export const userSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(2, "Enter the user's full name"),
  email: z.string().trim().email("Enter a valid work email"),
  phone: z.string().optional(),
  licenceNumber: z.string().optional(),
  role: z.string().min(1, "Choose a role"),
  locationId: z.string().min(1, "Choose a pharmacy location"),
  permissions: z.array(z.string()).min(1, "Choose at least one permission"),
  status: z.enum(["active", "inactive"]),
});

export const priceSchema = z.object({
  id: z.string(),
  locationId: z.string().min(1),
  product: z.string().trim().min(2, "Name the priced item"),
  defaultPrice: z.number().positive("Enter the default price"),
  overridePrice: z.number().positive().nullable(),
  effectiveFrom: z.string().min(1, "Choose a start date"),
  effectiveTo: z.string().min(1, "Choose an end date"),
});
