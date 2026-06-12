import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "dotenv";
import { PrismaClient } from "../app/generated/prisma/client";

config({ override: true });

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({
      connectionString: process.env.DATABASE_URL ?? process.env.DIRECT_URL,
    }),
  });

  const { count } = await prisma.user.deleteMany();

  console.log(`Deleted ${count} user(s) (sessions and accounts cascade-deleted).`);

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
