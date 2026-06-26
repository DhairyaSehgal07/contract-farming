import { PrismaPg } from "@prisma/adapter-pg";
import { generateId } from "better-auth";
import { hashPassword } from "better-auth/crypto";
import { config } from "dotenv";
import {
  DEFAULT_ROLE_PERMISSIONS,
  MANAGING_DIRECTOR_DB_PERMISSIONS,
} from "../lib/auth/default-role-permissions";
import { PrismaClient, Role } from "../app/generated/prisma/client";

config({ override: true });

const SEED_PASSWORD = "12345678";

const SEED_USERS = [
  {
    email: "managing.director@example.com",
    name: "Tanvir Bhatti",
    role: Role.MANAGING_DIRECTOR,
  },
  {
    email: "programme.manager@example.com",
    name: "Dr Sridhar",
    role: Role.PROGRAMME_MANAGER,
  },
  {
    email: "accounts.settlements@example.com",
    name: "Ashok",
    role: Role.ACCOUNTS_SETTLEMENTS_MANAGER,
  },
  {
    email: "field.operations@example.com",
    name: "Jyot Singh",
    role: Role.FIELD_OPERATIONS_MANAGER,
  },
  {
    email: "accounts.seeds@example.com",
    name: "Ashok",
    role: Role.ACCOUNTS_SEEDS_SUPPLY_MANAGER,
  },
  {
    email: "logistics.executive@example.com",
    name: "Logistics Executive",
    role: Role.LOGISTICS_EXECUTIVE,
  },
  {
    email: "field.officer@example.com",
    name: "Deepak",
    role: Role.FIELD_OFFICER,
  },
] as const;

const VARIETIES = ["Himalini", "B101", "Jyoti"] as const;

const GENERATIONS = ["G2", "G3", "Foundation", "Certified"] as const;

const SIZES = [
  { name: "Below 25", bagsPerAcre: 21 },
  { name: "25-30", bagsPerAcre: 35 },
  { name: "Below 30", bagsPerAcre: 21 },
  { name: "30-35", bagsPerAcre: 35 },
  { name: "30-40", bagsPerAcre: 30 },
  { name: "35-40", bagsPerAcre: 30 },
  { name: "40-45", bagsPerAcre: 25 },
  { name: "40-50", bagsPerAcre: 25 },
  { name: "45-50", bagsPerAcre: 25 },
  { name: "50-55", bagsPerAcre: 21 },
  { name: "Above 50", bagsPerAcre: 21 },
  { name: "Above 55", bagsPerAcre: 21 },
  { name: "Cut", bagsPerAcre: 21 },
  { name: "ungraded", bagsPerAcre: 21 },
] as const;

const LOCATIONS = [
  { name: "Bazpur Cold Store", category: "Source" },
  { name: "Kashipur Warehouse", category: "Source" },
  { name: "Rudrapur Processing Unit", category: "Source" },
] as const;

const SEED_FARMERS = [
  {
    name: "Kulwinder Singh",
    accountNumber: "86",
    mobileNumber: "9800000001",
    aadharNumber: "100000000001",
  },
  {
    name: "Inderjit Singh",
    accountNumber: "87",
    mobileNumber: "9800000002",
    aadharNumber: "100000000002",
  },
  {
    name: "Gurvinder Singh",
    accountNumber: "88",
    mobileNumber: "9800000003",
    aadharNumber: "100000000003",
  },
  {
    name: "Jaspal Singh",
    accountNumber: "89",
    mobileNumber: "9800000004",
    aadharNumber: "100000000004",
  },
  {
    name: "Sohan Singh",
    accountNumber: "90",
    mobileNumber: "9800000005",
    aadharNumber: "100000000005",
  },
  {
    name: "Sukhdev Singh",
    accountNumber: "91",
    mobileNumber: "9800000006",
    aadharNumber: "100000000006",
  },
  {
    name: "Lakhvinder Singh",
    accountNumber: "92",
    mobileNumber: "9800000007",
    aadharNumber: "100000000007",
  },
  {
    name: "Kamaljeet",
    accountNumber: "93",
    mobileNumber: "9800000008",
    aadharNumber: "100000000008",
  },
] as const;

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL ?? process.env.DIRECT_URL,
});
const prisma = new PrismaClient({ adapter });

async function clearAllData() {
  await prisma.otpChallenge.deleteMany();
  await prisma.dispatchLot.deleteMany();
  await prisma.dispatchRequisitionSizeLine.deleteMany();
  await prisma.dispatchRequisition.deleteMany();
  await prisma.dispatch.deleteMany();
  await prisma.requisition.deleteMany();
  await prisma.farmer.deleteMany();
  await prisma.locality.deleteMany();
  await prisma.station.deleteMany();
  await prisma.variety.deleteMany();
  await prisma.size.deleteMany();
  await prisma.generation.deleteMany();
  await prisma.location.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verification.deleteMany();
  await prisma.user.deleteMany();
}

async function createCredentialUser({
  email,
  name,
  role,
  stationId,
  password = SEED_PASSWORD,
}: {
  email: string;
  name: string;
  role: Role;
  stationId?: string;
  password?: string;
}) {
  const userId = generateId();
  const hashedPassword = await hashPassword(password);

  await prisma.user.create({
    data: {
      id: userId,
      name,
      email,
      emailVerified: true,
      role,
      stationId: stationId ?? null,
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

async function seedUsers(stationId: string) {
  for (const user of SEED_USERS) {
    const stationIdForUser =
      user.role === Role.FIELD_OFFICER ? stationId : undefined;
    await createCredentialUser({ ...user, stationId: stationIdForUser });
  }
}

async function seedRolePermissions() {
  for (const role of Object.values(Role)) {
    if (role === Role.MANAGING_DIRECTOR) continue;

    const grants = DEFAULT_ROLE_PERMISSIONS[role];
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

  await prisma.rolePermission.createMany({
    data: MANAGING_DIRECTOR_DB_PERMISSIONS.map((grant) => ({
      role: Role.MANAGING_DIRECTOR,
      resource: grant.resource,
      action: grant.action,
    })),
  });
}

async function seedMasterData() {
  for (const name of VARIETIES) {
    await prisma.variety.create({ data: { name } });
  }

  for (const name of GENERATIONS) {
    await prisma.generation.create({ data: { name } });
  }

  for (const size of SIZES) {
    await prisma.size.create({ data: size });
  }

  for (const location of LOCATIONS) {
    await prisma.location.create({ data: location });
  }
}

async function seedGeography() {
  const bazpurStation = await prisma.station.create({
    data: {
      name: "Bazpur",
      city: "Bazpur",
      state: "Uttarakhand",
    },
  });

  const kashipurStation = await prisma.station.create({
    data: {
      name: "Kashipur",
      city: "Kashipur",
      state: "Uttarakhand",
    },
  });

  const puranpurLocality = await prisma.locality.create({
    data: { name: "Puranpur", stationId: bazpurStation.id },
  });

  await prisma.locality.create({
    data: { name: "Zone 1", stationId: bazpurStation.id },
  });

  await prisma.locality.create({
    data: { name: "Zone 1", stationId: kashipurStation.id },
  });

  for (const farmer of SEED_FARMERS) {
    await prisma.farmer.create({
      data: {
        name: farmer.name,
        accountNumber: farmer.accountNumber,
        mobileNumber: farmer.mobileNumber,
        aadharNumber: farmer.aadharNumber,
        stationId: bazpurStation.id,
        localityId: puranpurLocality.id,
      },
    });
  }

  return bazpurStation;
}

async function main() {
  console.log("Clearing all data…");
  await clearAllData();

  const bazpurStation = await seedGeography();

  console.log("Seeding users and permissions…");
  await seedUsers(bazpurStation.id);
  await seedRolePermissions();

  console.log("Seeding master data…");
  await seedMasterData();

  console.log("Seed complete:");
  for (const user of SEED_USERS) {
    console.log(`  user: ${user.email} / ${SEED_PASSWORD} (${user.role})`);
  }
  console.log(`  ${VARIETIES.length} varieties`);
  console.log(`  ${GENERATIONS.length} generations`);
  console.log(`  ${SIZES.length} sizes`);
  console.log(`  ${LOCATIONS.length} locations`);
  console.log(
    `  2 stations (Bazpur, Kashipur), 3 localities, ${SEED_FARMERS.length} farmers`,
  );
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
