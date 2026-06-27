import { PrismaPg } from "@prisma/adapter-pg";
import { generateId } from "better-auth";
import { hashPassword } from "better-auth/crypto";
import { config } from "dotenv";
import {
  DEFAULT_ROLE_PERMISSIONS,
  MANAGING_DIRECTOR_DB_PERMISSIONS,
} from "../lib/auth/default-role-permissions";
import { PrismaClient, Role } from "../app/generated/prisma/client";
import { SEED_FARMERS, SEED_FARMER_FAMILIES } from "./seed-farmers";

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
    name: "Harjot Singh",
    role: Role.ACCOUNTS_SEEDS_SUPPLY_MANAGER,
  },
  {
    email: "logistics.executive@example.com",
    name: "Logistics Executive",
    role: Role.LOGISTICS_EXECUTIVE,
  },
  {
    email: "mohit.chamola@example.com",
    name: "Mohit Chamola",
    role: Role.FIELD_OFFICER,
  },
  {
    email: "brijesh@example.com",
    name: "Brijesh",
    role: Role.FIELD_OFFICER,
  },
  {
    email: "rajiv@example.com",
    name: "Rajiv",
    role: Role.FIELD_OFFICER,
  },
  {
    email: "arvind@example.com",
    name: "Arvind",
    role: Role.FIELD_OFFICER,
  },
  {
    email: "vivek@example.com",
    name: "Vivek",
    role: Role.FIELD_OFFICER,
  },
  {
    email: "deepak.satwal@example.com",
    name: "Deepak Satwal",
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

function normalizeStationName(name: string) {
  return name.trim().toUpperCase();
}

function normalizeZoneName(name: string) {
  return name.trim().replace(/`+$/, "").toUpperCase();
}

function seedMobileNumber(serial: number) {
  return `98${String(serial).padStart(8, "0")}`;
}

function formatFarmerDisplayName(name: string, fatherName: string) {
  const cleanName = name.trim().replace(/\s+/g, " ");
  const cleanFatherName = fatherName.trim().replace(/\s+/g, " ");

  const wifeOfMatch = cleanFatherName.match(/^W\/O\.?\s+(.+)$/i);
  if (wifeOfMatch) {
    return `${cleanName} W/O. ${wifeOfMatch[1]}`;
  }

  const daughterOfMatch = cleanFatherName.match(/^D\/O\.?\s+(.+)$/i);
  if (daughterOfMatch) {
    return `${cleanName} D/O. ${daughterOfMatch[1]}`;
  }

  return `${cleanName} S/O ${cleanFatherName}`;
}

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
  await prisma.farmerFamily.deleteMany();
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
  const stationNames = [
    ...new Set(
      SEED_FARMERS.map((farmer) => normalizeStationName(farmer.station)),
    ),
  ];

  const stationMap = new Map<string, string>();
  for (const name of stationNames) {
    const station = await prisma.station.create({ data: { name } });
    stationMap.set(name, station.id);
  }

  const localityMap = new Map<string, string>();
  for (const farmer of SEED_FARMERS) {
    const stationId = stationMap.get(normalizeStationName(farmer.station))!;
    const zoneName = normalizeZoneName(farmer.zone);
    const localityKey = `${stationId}:${zoneName}`;

    if (!localityMap.has(localityKey)) {
      const locality = await prisma.locality.create({
        data: { name: zoneName, stationId },
      });
      localityMap.set(localityKey, locality.id);
    }
  }

  const farmerBySerial = new Map(SEED_FARMERS.map((f) => [f.serial, f]));
  const familyIdByAccountNumber = new Map<string, string>();
  const reservedFamilyAccounts = new Set<string>(
    SEED_FARMER_FAMILIES.map((family) => family.accountNumber),
  );

  function resolveSeedAccountNumber(farmer: (typeof SEED_FARMERS)[number]) {
    if (farmer.accountNumber) {
      return farmer.accountNumber;
    }

    const serialAccount = String(farmer.serial);
    if (reservedFamilyAccounts.has(serialAccount)) {
      return String(1000 + farmer.serial);
    }

    return serialAccount;
  }

  for (const family of SEED_FARMER_FAMILIES) {
    const headFarmer = farmerBySerial.get(family.headSerial);
    if (!headFarmer) {
      throw new Error(
        `Head farmer serial ${family.headSerial} not found for family ${family.accountNumber}.`,
      );
    }

    const stationId = stationMap.get(normalizeStationName(headFarmer.station))!;
    const localityId = localityMap.get(
      `${stationId}:${normalizeZoneName(headFarmer.zone)}`,
    )!;

    const created = await prisma.farmerFamily.create({
      data: {
        accountNumber: family.accountNumber,
        name: `${headFarmer.name.trim()} Family`,
        stationId,
        localityId,
      },
    });
    familyIdByAccountNumber.set(family.accountNumber, created.id);
  }

  for (const farmer of SEED_FARMERS) {
    const stationId = stationMap.get(normalizeStationName(farmer.station))!;
    const localityId = localityMap.get(
      `${stationId}:${normalizeZoneName(farmer.zone)}`,
    )!;

    const familyId = farmer.familyAccountNumber
      ? familyIdByAccountNumber.get(farmer.familyAccountNumber)
      : undefined;

    await prisma.farmer.create({
      data: {
        name: formatFarmerDisplayName(farmer.name, farmer.fatherName),
        accountNumber: resolveSeedAccountNumber(farmer),
        mobileNumber: seedMobileNumber(farmer.serial),
        aadharNumber: farmer.aadhar,
        panCardNumber: farmer.pan?.toUpperCase() ?? null,
        bankAccountName: farmer.fatherName.trim(),
        bankName: farmer.bankName.trim(),
        bankAccountNumber: String(farmer.bankAccountNumber),
        bankIfscCode: farmer.bankIfscCode.trim().toUpperCase(),
        bankBranchName: farmer.location.trim(),
        stationId,
        localityId,
        familyId: familyId ?? null,
      },
    });
  }

  const bazpurStationId = stationMap.get("BAZPUR-I");
  if (!bazpurStationId) {
    throw new Error("BAZPUR-I station missing from seed farmers.");
  }

  return { id: bazpurStationId };
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
    `  ${SEED_FARMERS.length} farmers across seeded stations and zones`,
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
