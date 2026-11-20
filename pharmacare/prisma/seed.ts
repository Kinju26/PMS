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

const users: SeedUser[] = [
  { email: "admin@gmail.com", username: "admin", name: "Super Admin", role: "MASTER_ADMIN", status: "ACTIVE" },
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

async function main() {
  const password = process.env.SEED_PASSWORD;
  if (!password || password.length < 10) {
    throw new Error("Set SEED_PASSWORD in .env (min 10 characters) before seeding registered users.");
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const adminBootstrap = process.env.ADMIN_PASSWORD ?? process.env.DEMO_ADMIN_PASSWORD ?? "";
  const adminPasswordHash = adminBootstrap
    ? await bcrypt.hash(adminBootstrap, 12)
    : passwordHash;

  for (const user of users) {
    const hash = user.email === "admin@gmail.com" ? adminPasswordHash : passwordHash;
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        username: user.username,
        name: user.name,
        role: user.role,
        status: user.status,
        passwordHash: hash,
        failedLoginCount: 0,
        lockedUntil: null,
      },
      create: {
        ...user,
        passwordHash: hash,
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
