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

const SEED_REQUISITION_ID = "seed-requisition-001";
const SEED_REQUISITION_ID_2 = "seed-requisition-002";
const SEED_REQUISITION_ID_3 = "seed-requisition-003";
const SEED_REQUISITION_ID_4 = "seed-requisition-004";

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

async function seedRequisition({
  id,
  farmerId,
  varietyId,
  createdById,
  status = RequisitionStatus.PENDING,
}: {
  id: string;
  farmerId: string;
  varietyId: string;
  createdById: string;
  status?: RequisitionStatus;
}) {
  await prisma.requisition.upsert({
    where: { id },
    create: {
      id,
      requisitionDate: new Date("2026-06-01"),
      expectedDeliveryDate: new Date("2026-06-15"),
      acres: 2.5,
      initialQuantity: 100,
      fulfilledQuantity: 0,
      status,
      farmerId,
      varietyId,
      createdById,
    },
    update: {
      requisitionDate: new Date("2026-06-01"),
      expectedDeliveryDate: new Date("2026-06-15"),
      acres: 2.5,
      initialQuantity: 100,
      fulfilledQuantity: 0,
      status,
      rejectionRemarks: null,
      reviewedById: status === RequisitionStatus.PENDING ? null : createdById,
      reviewedAt: status === RequisitionStatus.PENDING ? null : new Date(),
      farmerId,
      varietyId,
      createdById,
    },
  });
}

async function clearAppData() {
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

async function main() {
  await clearAppData();
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
    station = await prisma.station.create({
      data: {
        name: "Bazpur",
        city: "Bazpur",
        state: "Uttarakhand",
      },
    });
  }

  let locality = await prisma.locality.findFirst({
    where: { name: "Puranpur", stationId: station.id },
  });
  if (!locality) {
    locality = await prisma.locality.create({
      data: {
        name: "Puranpur",
        stationId: station.id,
      },
    });
  }

  const farmer = await prisma.farmer.upsert({
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

  let bazpurZone1Locality = await prisma.locality.findFirst({
    where: { name: "Zone 1", stationId: station.id },
  });
  if (!bazpurZone1Locality) {
    bazpurZone1Locality = await prisma.locality.create({
      data: {
        name: "Zone 1",
        stationId: station.id,
      },
    });
  }

  let kashipurStation = await prisma.station.findFirst({
    where: { name: "Kashipur" },
  });
  if (!kashipurStation) {
    kashipurStation = await prisma.station.create({
      data: {
        name: "Kashipur",
        city: "Kashipur",
        state: "Uttarakhand",
      },
    });
  }

  let kashipurZone1Locality = await prisma.locality.findFirst({
    where: { name: "Zone 1", stationId: kashipurStation.id },
  });
  if (!kashipurZone1Locality) {
    kashipurZone1Locality = await prisma.locality.create({
      data: {
        name: "Zone 1",
        stationId: kashipurStation.id,
      },
    });
  }

  const ajitFarmer = await prisma.farmer.upsert({
    where: { accountNumber: "83" },
    create: {
      name: "Ajit Singh Punia S/O Harkewal Singh",
      accountNumber: "83",
      mobileNumber: "9639400000",
      aadharNumber: "443322110987",
      panCardNumber: "AJITP1234K",
      stationId: station.id,
      localityId: bazpurZone1Locality.id,
    },
    update: {
      name: "Ajit Singh Punia S/O Harkewal Singh",
      mobileNumber: "9639400000",
      aadharNumber: "443322110987",
      panCardNumber: "AJITP1234K",
      stationId: station.id,
      localityId: bazpurZone1Locality.id,
    },
  });

  const tirathFarmer = await prisma.farmer.upsert({
    where: { accountNumber: "82" },
    create: {
      name: "Tirath Singh S/O Gurcharan Singh",
      accountNumber: "82",
      mobileNumber: "9917146444",
      aadharNumber: "556677889900",
      panCardNumber: "TIRAT1234L",
      stationId: kashipurStation.id,
      localityId: kashipurZone1Locality.id,
    },
    update: {
      name: "Tirath Singh S/O Gurcharan Singh",
      mobileNumber: "9917146444",
      aadharNumber: "556677889900",
      panCardNumber: "TIRAT1234L",
      stationId: kashipurStation.id,
      localityId: kashipurZone1Locality.id,
    },
  });

  const variety = await prisma.variety.findUniqueOrThrow({
    where: { name: "Himalini" },
  });
  const createdBy = await prisma.user.findUniqueOrThrow({
    where: { email: "field.officer@example.com" },
  });

  await seedRequisition({
    id: SEED_REQUISITION_ID,
    farmerId: farmer.id,
    varietyId: variety.id,
    createdById: createdBy.id,
    status: RequisitionStatus.PENDING,
  });

  await seedRequisition({
    id: SEED_REQUISITION_ID_2,
    farmerId: farmer.id,
    varietyId: variety.id,
    createdById: createdBy.id,
    status: RequisitionStatus.APPROVED,
  });

  await seedRequisition({
    id: SEED_REQUISITION_ID_3,
    farmerId: ajitFarmer.id,
    varietyId: variety.id,
    createdById: createdBy.id,
    status: RequisitionStatus.PENDING,
  });

  await seedRequisition({
    id: SEED_REQUISITION_ID_4,
    farmerId: tirathFarmer.id,
    varietyId: variety.id,
    createdById: createdBy.id,
    status: RequisitionStatus.APPROVED,
  });

  console.log("Seed complete:");
  for (const user of SEED_USERS) {
    console.log(`  user: ${user.email} / ${SEED_PASSWORD} (${user.role})`);
  }
  console.log(`  ${VARIETIES.length} varieties`);
  console.log(`  ${GENERATIONS.length} generations`);
  console.log(`  ${SIZES.length} sizes`);
  console.log(
    "  2 stations (Bazpur, Kashipur), 3 localities (Puranpur, Bazpur Zone 1, Kashipur Zone 1), 3 farmers",
  );
  console.log("  4 requisitions (2 pending, 2 approved)");
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
