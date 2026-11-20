import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import type { AuthRole } from "../src/lib/auth/roles";

const prisma = new PrismaClient();

type SeedUser = {
  email: string;
  username: string;
  name: string;
  role: AuthRole;
  status: "ACTIVE" | "INACTIVE" | "PENDING_ACTIVATION";
};

const MASTER_USERNAME = "admin";
const MASTER_EMAIL = "admin@cpos.local";
const MASTER_ROLE: AuthRole = "SUPER_ADMIN";

const staffUsers: SeedUser[] = [
  { email: "owner@cpos.local", username: "owner", name: "Avery Lang", role: "PHARMACY_OWNER", status: "ACTIVE" },
  { email: "manager@cpos.local", username: "manager", name: "Jordan Reid", role: "PHARMACY_MANAGER", status: "ACTIVE" },
  { email: "pharmacist@cpos.local", username: "pharmacist", name: "Amrita Shah", role: "PHARMACIST", status: "ACTIVE" },
  { email: "technician@cpos.local", username: "technician", name: "Chris Patel", role: "PHARMACY_TECHNICIAN", status: "ACTIVE" },
  { email: "assistant@cpos.local", username: "assistant", name: "Sam Cole", role: "PHARMACY_ASSISTANT", status: "ACTIVE" },
  { email: "dataentry@cpos.local", username: "dataentry", name: "Riley Nguyen", role: "DATA_ENTRY_STAFF", status: "ACTIVE" },
  { email: "inventory@cpos.local", username: "inventory", name: "Morgan Ellis", role: "INVENTORY_MANAGER", status: "ACTIVE" },
  { email: "delivery@cpos.local", username: "delivery", name: "Casey Brooks", role: "DELIVERY_STAFF", status: "ACTIVE" },
  { email: "sysadmin@cpos.local", username: "sysadmin", name: "Taylor Kim", role: "SYSTEM_ADMINISTRATOR", status: "ACTIVE" },
  { email: "auditor@cpos.local", username: "auditor", name: "Quinn Fraser", role: "AUDITOR", status: "ACTIVE" },
  { email: "patient@cpos.local", username: "patient", name: "Jamie Singh", role: "PATIENT", status: "ACTIVE" },
  { email: "customer@cpos.local", username: "customer", name: "Alex Martin", role: "CUSTOMER", status: "ACTIVE" },
  { email: "inactive@cpos.local", username: "inactive", name: "Inactive Staff", role: "PHARMACIST", status: "INACTIVE" },
  { email: "pending@cpos.local", username: "pending", name: "Pending Staff", role: "PHARMACY_ASSISTANT", status: "PENDING_ACTIVATION" },
];

async function upsertMasterAdmin(passwordHash: string) {
  const byUsername = await prisma.user.findUnique({ where: { username: MASTER_USERNAME } });
  const byLegacyEmail = await prisma.user.findUnique({ where: { email: "admin@gmail.com" } });
  const byEmail = await prisma.user.findUnique({ where: { email: MASTER_EMAIL } });
  const existing = byUsername ?? byEmail ?? byLegacyEmail;

  const data = {
    email: MASTER_EMAIL,
    username: MASTER_USERNAME,
    name: "Super Admin",
    role: MASTER_ROLE,
    status: "ACTIVE" as const,
    passwordHash,
    failedLoginCount: 0,
    lockedUntil: null,
  };

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data,
    });
  } else {
    await prisma.user.create({ data });
  }

  await prisma.user.updateMany({
    where: {
      username: { not: MASTER_USERNAME },
      role: { in: ["MASTER_ADMIN", "SUPER_ADMIN"] },
    },
    data: { role: "SYSTEM_ADMINISTRATOR" },
  });
}

async function main() {
  const password = process.env.SEED_PASSWORD;
  if (!password || password.length < 10) {
    throw new Error("Set SEED_PASSWORD in .env (min 10 characters) before seeding registered users.");
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const masterPassword = process.env.ADMIN_PASSWORD ?? process.env.DEMO_ADMIN_PASSWORD ?? "admin";
  const masterPasswordHash = await bcrypt.hash(masterPassword, 12);

  await upsertMasterAdmin(masterPasswordHash);

  for (const user of staffUsers) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        username: user.username,
        name: user.name,
        role: user.role,
        status: user.status,
        passwordHash: passwordHash,
        failedLoginCount: 0,
        lockedUntil: null,
      },
      create: {
        ...user,
        passwordHash,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
