import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "dotenv";
import { Prisma, PrismaClient } from "../app/generated/prisma/client";

config({ override: true });

const adapter = new PrismaPg({
	connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

const userData: Prisma.UserCreateInput[] = [
	{ name: "Alice", email: "alice@prisma.io" },
	{ name: "Bob", email: "bob@prisma.io" },
];

async function main() {
	for (const u of userData) {
		await prisma.user.upsert({
			where: { email: u.email },
			update: { name: u.name },
			create: u,
		});
	}

	console.log(`Seeded ${userData.length} users`);
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
