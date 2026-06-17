import { PrismaPg } from "@prisma/adapter-pg";
import { generateId } from "better-auth";
import { hashPassword } from "better-auth/crypto";
import { config } from "dotenv";
import {
  PrismaClient,
  RequisitionStatus,
  Role,
} from "../app/generated/prisma/client";

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
    name: "Harsh",
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

const DASHBOARD_READ = [{ resource: "dashboard", action: "read" }] as const;

const REQUISITION_ACCESS = [
  { resource: "requisition", action: "read" },
  { resource: "requisition", action: "write" },
] as const;

const REQUISITION_APPROVE = [
  { resource: "requisition", action: "approve" },
] as const;

const DISPATCH_ACCESS = [
  { resource: "dispatch", action: "read" },
  { resource: "dispatch", action: "write" },
] as const;

const DEFAULT_ROLE_PERMISSIONS: Record<
  Role,
  { resource: string; action: string }[]
> = {
  [Role.MANAGING_DIRECTOR]: [],
  [Role.PROGRAMME_MANAGER]: [
    { resource: "dashboard", action: "read" },
    { resource: "master", action: "read" },
    { resource: "master", action: "write" },
    ...REQUISITION_ACCESS,
    ...REQUISITION_APPROVE,
    ...DISPATCH_ACCESS,
  ],
  [Role.ACCOUNTS_SETTLEMENTS_MANAGER]: [
    ...DASHBOARD_READ,
    ...REQUISITION_ACCESS,
    ...REQUISITION_APPROVE,
    ...DISPATCH_ACCESS,
  ],
  [Role.FIELD_OPERATIONS_MANAGER]: [
    ...DASHBOARD_READ,
    ...REQUISITION_ACCESS,
    ...DISPATCH_ACCESS,
  ],
  [Role.ACCOUNTS_SEEDS_SUPPLY_MANAGER]: [...DASHBOARD_READ],
  [Role.LOGISTICS_EXECUTIVE]: [...DASHBOARD_READ, ...DISPATCH_ACCESS],
  [Role.FIELD_OFFICER]: [...DASHBOARD_READ],
  [Role.USER]: [...DASHBOARD_READ],
};

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

const LOCATIONS = [
  { name: "Bazpur Cold Store", category: "Source" },
  { name: "Kashipur Warehouse", category: "Source" },
  { name: "Rudrapur Processing Unit", category: "Source" },
] as const;

const SEED_IDS = {
  requisitionPending: "seed-requisition-001",
  requisitionApprovedPartial: "seed-requisition-002",
  requisitionPending2: "seed-requisition-003",
  requisitionApprovedOpen: "seed-requisition-004",
  dispatch: "seed-dispatch-001",
} as const;

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL ?? process.env.DIRECT_URL,
});
const prisma = new PrismaClient({ adapter });

async function clearAllData() {
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
    data: [
      { role: Role.MANAGING_DIRECTOR, resource: "permissions", action: "read" },
      { role: Role.MANAGING_DIRECTOR, resource: "permissions", action: "write" },
    ],
  });
}

async function seedMasterData() {
  for (const name of VARIETIES) {
    await prisma.variety.create({ data: { name } });
  }

  for (const name of GENERATIONS) {
    await prisma.generation.create({ data: { name } });
  }

  for (const name of SIZES) {
    await prisma.size.create({ data: { name } });
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

  const bazpurZone1Locality = await prisma.locality.create({
    data: { name: "Zone 1", stationId: bazpurStation.id },
  });

  const kashipurZone1Locality = await prisma.locality.create({
    data: { name: "Zone 1", stationId: kashipurStation.id },
  });

  const amandeepFarmer = await prisma.farmer.create({
    data: {
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
      stationId: bazpurStation.id,
      localityId: puranpurLocality.id,
    },
  });

  const ajitFarmer = await prisma.farmer.create({
    data: {
      name: "Ajit Singh Punia S/O Harkewal Singh",
      accountNumber: "83",
      mobileNumber: "9639400000",
      aadharNumber: "443322110987",
      panCardNumber: "AJITP1234K",
      stationId: bazpurStation.id,
      localityId: bazpurZone1Locality.id,
    },
  });

  const tirathFarmer = await prisma.farmer.create({
    data: {
      name: "Tirath Singh S/O Gurcharan Singh",
      accountNumber: "82",
      mobileNumber: "9917146444",
      aadharNumber: "556677889900",
      panCardNumber: "TIRAT1234L",
      stationId: kashipurStation.id,
      localityId: kashipurZone1Locality.id,
    },
  });

  return {
    bazpurStation,
    amandeepFarmer,
    ajitFarmer,
    tirathFarmer,
  };
}

async function seedRequisitions({
  varietyId,
  createdById,
  reviewedById,
  amandeepFarmerId,
  ajitFarmerId,
  tirathFarmerId,
}: {
  varietyId: string;
  createdById: string;
  reviewedById: string;
  amandeepFarmerId: string;
  ajitFarmerId: string;
  tirathFarmerId: string;
}) {
  await prisma.requisition.create({
    data: {
      id: SEED_IDS.requisitionPending,
      requisitionDate: new Date("2026-06-01"),
      expectedDeliveryDate: new Date("2026-06-15"),
      acres: 2.5,
      initialQuantity: 100,
      fulfilledQuantity: 0,
      status: RequisitionStatus.PENDING,
      farmerId: amandeepFarmerId,
      varietyId,
      createdById,
    },
  });

  await prisma.requisition.create({
    data: {
      id: SEED_IDS.requisitionApprovedPartial,
      requisitionDate: new Date("2026-06-02"),
      expectedDeliveryDate: new Date("2026-06-16"),
      approvedDeliveryDate: new Date("2026-06-12"),
      acres: 3,
      initialQuantity: 100,
      fulfilledQuantity: 40,
      status: RequisitionStatus.APPROVED,
      farmerId: amandeepFarmerId,
      varietyId,
      createdById,
      reviewedById,
      reviewedAt: new Date("2026-06-10T10:00:00.000Z"),
      approvalDate: new Date("2026-06-10"),
    },
  });

  await prisma.requisition.create({
    data: {
      id: SEED_IDS.requisitionPending2,
      requisitionDate: new Date("2026-06-03"),
      expectedDeliveryDate: new Date("2026-06-18"),
      acres: 1.5,
      initialQuantity: 60,
      fulfilledQuantity: 0,
      status: RequisitionStatus.PENDING,
      farmerId: ajitFarmerId,
      varietyId,
      createdById,
    },
  });

  await prisma.requisition.create({
    data: {
      id: SEED_IDS.requisitionApprovedOpen,
      requisitionDate: new Date("2026-06-04"),
      expectedDeliveryDate: new Date("2026-06-20"),
      approvedDeliveryDate: new Date("2026-06-14"),
      acres: 2,
      initialQuantity: 80,
      fulfilledQuantity: 0,
      status: RequisitionStatus.APPROVED,
      farmerId: tirathFarmerId,
      varietyId,
      createdById,
      reviewedById,
      reviewedAt: new Date("2026-06-11T10:00:00.000Z"),
      approvalDate: new Date("2026-06-11"),
    },
  });
}

async function seedDispatch({
  requisitionId,
  generationId,
  locationId,
  sizeId,
}: {
  requisitionId: string;
  generationId: string;
  locationId: string;
  sizeId: string;
}) {
  await prisma.dispatch.create({
    data: {
      id: SEED_IDS.dispatch,
      dispatchDate: new Date("2026-06-12"),
      dateOfReceiving: new Date("2026-06-13"),
      truckNumber: "UP32AB1234",
      manualGatePassNumber: "GP-1001",
      weightSlipNumber: "12345",
      grossWeight: 5200,
      tareWeight: 1200,
      netWeight: 4000,
      averageWeightPerBag: 100,
      driverMobileNumber: "9876501234",
      remarks: "Seed dispatch for testing",
      generationId,
      locationId,
      toLocation: "Puranpur Field",
      requisitions: {
        create: {
          requisitionId,
          sizeLines: {
            create: {
              sizeId,
              quantity: 40,
            },
          },
        },
      },
    },
  });
}

async function main() {
  console.log("Clearing all data…");
  await clearAllData();

  const { bazpurStation, amandeepFarmer, ajitFarmer, tirathFarmer } =
    await seedGeography();

  console.log("Seeding users and permissions…");
  await seedUsers(bazpurStation.id);
  await seedRolePermissions();

  console.log("Seeding master data…");
  await seedMasterData();

  const variety = await prisma.variety.findUniqueOrThrow({
    where: { name: "Himalini" },
  });
  const generation = await prisma.generation.findUniqueOrThrow({
    where: { name: "G2" },
  });
  const size = await prisma.size.findUniqueOrThrow({
    where: { name: "25-30" },
  });
  const location = await prisma.location.findUniqueOrThrow({
    where: { name: "Bazpur Cold Store" },
  });
  const fieldOfficer = await prisma.user.findUniqueOrThrow({
    where: { email: "field.officer@example.com" },
  });
  const programmeManager = await prisma.user.findUniqueOrThrow({
    where: { email: "programme.manager@example.com" },
  });

  console.log("Seeding requisitions…");
  await seedRequisitions({
    varietyId: variety.id,
    createdById: fieldOfficer.id,
    reviewedById: programmeManager.id,
    amandeepFarmerId: amandeepFarmer.id,
    ajitFarmerId: ajitFarmer.id,
    tirathFarmerId: tirathFarmer.id,
  });

  console.log("Seeding dispatches…");
  await seedDispatch({
    requisitionId: SEED_IDS.requisitionApprovedPartial,
    generationId: generation.id,
    locationId: location.id,
    sizeId: size.id,
  });

  console.log("Seed complete:");
  for (const user of SEED_USERS) {
    console.log(`  user: ${user.email} / ${SEED_PASSWORD} (${user.role})`);
  }
  console.log(`  ${VARIETIES.length} varieties`);
  console.log(`  ${GENERATIONS.length} generations`);
  console.log(`  ${SIZES.length} sizes`);
  console.log(`  ${LOCATIONS.length} locations`);
  console.log(
    "  2 stations (Bazpur, Kashipur), 3 localities, 3 farmers",
  );
  console.log("  4 requisitions (2 pending, 2 approved)");
  console.log("  1 dispatch (40 bags on partially fulfilled requisition)");
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
