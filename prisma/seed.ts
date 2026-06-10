import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "dotenv";
import { PrismaClient } from "../app/generated/prisma/client";
import { auth } from "../lib/auth";

config({ override: true });

const DEV_USER = {
  email: "dev@coldop.local",
  password: "Password1!",
  name: "Dev User",
} as const;

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

async function seedDevUser() {
  const existing = await prisma.user.findUnique({
    where: { email: DEV_USER.email },
  });

  if (existing) {
    return;
  }

  await auth.api.signUpEmail({
    body: DEV_USER,
  });
}

async function main() {
  await seedDevUser();

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
  console.log(`  dev user: ${DEV_USER.email} / ${DEV_USER.password}`);
  console.log(`  ${VARIETIES.length} varieties`);
  console.log(`  ${GENERATIONS.length} generations`);
  console.log(`  ${SIZES.length} sizes`);
  console.log("  1 station (Bazpur), 1 locality (Puranpur), 1 farmer");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
