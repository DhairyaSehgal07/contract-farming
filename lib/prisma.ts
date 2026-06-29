import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL or DIRECT_URL must be set for database access.",
    );
  }

  const adapter = new PrismaPg({ connectionString });

  return new PrismaClient({ adapter });
}

function isClientReady(client: PrismaClient) {
  return (
    typeof client.station?.findMany === "function" &&
    typeof client.variety?.findMany === "function" &&
    typeof client.farmer?.findMany === "function" &&
    typeof client.rolePermission?.findMany === "function" &&
    typeof client.location?.findMany === "function" &&
    typeof client.dispatch?.findMany === "function" &&
    typeof client.dispatchRequisition?.findMany === "function" &&
    typeof client.dispatchLot?.findMany === "function"
  );
}

function getPrismaClient() {
  const cached = globalForPrisma.prisma;

  if (cached && isClientReady(cached)) {
    return cached;
  }

  const client = createPrismaClient();
  globalForPrisma.prisma = client;
  return client;
}

const prisma = getPrismaClient();

/** Default interactive transaction options for multi-step server actions. */
export const prismaInteractiveTxOptions = {
  timeout: 15_000,
} as const;

export default prisma;
