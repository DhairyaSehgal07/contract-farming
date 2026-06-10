import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

config({ override: true });

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    }),
  });

  const [stations, varieties, farmers, sizes, generations] = await Promise.all([
    prisma.station.findMany({ take: 3 }),
    prisma.variety.findMany({ take: 3 }),
    prisma.farmer.findMany({ take: 3 }),
    prisma.size.count(),
    prisma.generation.count(),
  ]);

  console.log(
    JSON.stringify(
      {
        stationCount: stations.length,
        stations,
        varietyCount: varieties.length,
        varieties,
        farmerCount: farmers.length,
        farmers,
        sizeCount: sizes,
        generationCount: generations,
      },
      null,
      2,
    ),
  );

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
