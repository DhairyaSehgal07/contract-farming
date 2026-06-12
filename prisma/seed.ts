import { PrismaPg } from "@prisma/adapter-pg";
import { generateId } from "better-auth";
import { hashPassword } from "better-auth/crypto";
import { config } from "dotenv";
import { PrismaClient, Role } from "../app/generated/prisma/client";

config({ override: true });

const SEED_PASSWORD = "12345678";

const SEED_USERS = [
  {
    email: "managing.director@example.com",
    name: "Managing Director",
    role: Role.MANAGING_DIRECTOR,
  },
  {
    email: "programme.manager@example.com",
    name: "Programme Manager",
    role: Role.PROGRAMME_MANAGER,
  },
  {
    email: "accounts.settlements@example.com",
    name: "Accounts Settlements Manager",
    role: Role.ACCOUNTS_SETTLEMENTS_MANAGER,
  },
  {
    email: "field.operations@example.com",
    name: "Field Operations Manager",
    role: Role.FIELD_OPERATIONS_MANAGER,
  },
  {
    email: "accounts.seeds@example.com",
    name: "Accounts Seeds Supply Manager",
    role: Role.ACCOUNTS_SEEDS_SUPPLY_MANAGER,
  },
  {
    email: "logistics.executive@example.com",
    name: "Logistics Executive",
    role: Role.LOGISTICS_EXECUTIVE,
  },
  {
    email: "field.officer@example.com",
    name: "Field Officer",
    role: Role.FIELD_OFFICER,
  },
  {
    email: "user@example.com",
    name: "Standard User",
    role: Role.USER,
  },
] as const;

const DASHBOARD_READ = [{ resource: "dashboard", action: "read" }] as const;

const DEFAULT_ROLE_PERMISSIONS: Record<
  Role,
  { resource: string; action: string }[]
> = {
  [Role.MANAGING_DIRECTOR]: [],
  [Role.PROGRAMME_MANAGER]: [
    { resource: "dashboard", action: "read" },
    { resource: "master", action: "read" },
    { resource: "master", action: "write" },
  ],
  [Role.ACCOUNTS_SETTLEMENTS_MANAGER]: [...DASHBOARD_READ],
  [Role.FIELD_OPERATIONS_MANAGER]: [...DASHBOARD_READ],
  [Role.ACCOUNTS_SEEDS_SUPPLY_MANAGER]: [...DASHBOARD_READ],
  [Role.LOGISTICS_EXECUTIVE]: [...DASHBOARD_READ],
  [Role.FIELD_OFFICER]: [...DASHBOARD_READ],
  [Role.USER]: [...DASHBOARD_READ],
};

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL ?? process.env.DIRECT_URL,
});
const prisma = new PrismaClient({ adapter });

const VARIETIES = ["Himalini", "B101", "Jyoti"] as const;

const GENERATIONS = ["G2", "G3", "Foundation", "Certified"] as const;

const SIZES = [
  "Below 25",
  "25-30",
  "Below 30",
  "30-35",
  "30-40",
  "35-40",
  "40-45",
  "40-50",
  "45-50",
  "50-55",
  "Above 50",
  "Above 55",
  "Cut",
  "ungraded",
] as const;

async function upsertCredentialUser({
  email,
  name,
  role,
  password = "12345678",
}: {
  email: string;
  name: string;
  role: Role;
  password?: string;
}) {
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: { role, name },
    });
    return existing.id;
  }

  const userId = generateId();
  const hashedPassword = await hashPassword(password);

  await prisma.user.create({
    data: {
      id: userId,
      name,
      email,
      emailVerified: true,
      role,
      accounts: {
        create: {
          id: generateId(),
          accountId: userId,
          providerId: "credential",
          password: hashedPassword,
        },
      },
    },
  });

  return userId;
}

async function seedUsers() {
  for (const user of SEED_USERS) {
    await upsertCredentialUser({ ...user, password: SEED_PASSWORD });
  }
}

async function seedRolePermissions() {
  for (const role of Object.values(Role)) {
    if (role === Role.MANAGING_DIRECTOR) continue;

    const grants = DEFAULT_ROLE_PERMISSIONS[role];
    await prisma.rolePermission.deleteMany({ where: { role } });

    if (grants.length > 0) {
      await prisma.rolePermission.createMany({
        data: grants.map((grant) => ({
          role,
          resource: grant.resource,
          action: grant.action,
        })),
      });
    }
  }

  const permissionsGrants = [
    { resource: "permissions", action: "read" },
    { resource: "permissions", action: "write" },
  ];

  await prisma.rolePermission.createMany({
    data: permissionsGrants.map((grant) => ({
      role: Role.MANAGING_DIRECTOR,
      ...grant,
    })),
    skipDuplicates: true,
  });
}

async function main() {
  await seedUsers();
  await seedRolePermissions();

  for (const name of VARIETIES) {
    await prisma.variety.upsert({
      where: { name },
      create: { name },
      update: {},
    });
  }

  for (const name of GENERATIONS) {
    await prisma.generation.upsert({
      where: { name },
      create: { name },
      update: {},
    });
  }

  for (const name of SIZES) {
    await prisma.size.upsert({
      where: { name },
      create: { name },
      update: {},
    });
  }

  let station = await prisma.station.findFirst({ where: { name: "Bazpur" } });
  if (!station) {
    station = await prisma.station.create({ data: { name: "Bazpur" } });
  }

  let locality = await prisma.locality.findFirst({
    where: { name: "Puranpur", stationId: station.id },
  });
  if (!locality) {
    locality = await prisma.locality.create({
      data: {
        name: "Puranpur",
        city: "Bazpur",
        state: "Uttarakhand",
        postalCode: "262401",
        stationId: station.id,
      },
    });
  }

  await prisma.farmer.upsert({
    where: { accountNumber: "1" },
    create: {
      name: "Amandeep Singh S/O Kashmir Singh",
      accountNumber: "1",
      mobileNumber: "9876543210",
      aadharNumber: "234567891234",
      panCardNumber: "ABCPK1234D",
      bankAccountName: "Amandeep Singh",
      bankName: "Punjab National Bank",
      bankAccountNumber: "12345678901234",
      bankIfscCode: "PUNB0123400",
      bankBranchName: "Bazpur",
      stationId: station.id,
      localityId: locality.id,
    },
    update: {
      name: "Amandeep Singh S/O Kashmir Singh",
      mobileNumber: "9876543210",
      aadharNumber: "234567891234",
      panCardNumber: "ABCPK1234D",
      bankAccountName: "Amandeep Singh",
      bankName: "Punjab National Bank",
      bankAccountNumber: "12345678901234",
      bankIfscCode: "PUNB0123400",
      bankBranchName: "Bazpur",
      stationId: station.id,
      localityId: locality.id,
    },
  });

  console.log("Seed complete:");
  for (const user of SEED_USERS) {
    console.log(`  user: ${user.email} / ${SEED_PASSWORD} (${user.role})`);
  }
  console.log(`  ${VARIETIES.length} varieties`);
  console.log(`  ${GENERATIONS.length} generations`);
  console.log(`  ${SIZES.length} sizes`);
  console.log("  1 station (Bazpur), 1 locality (Puranpur), 1 farmer");
  console.log("  default role permissions seeded");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
