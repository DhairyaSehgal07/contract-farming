-- AlterTable
ALTER TABLE "dispatch" ADD COLUMN "toLocation" TEXT;

-- Migrate existing to-location names from the location relation
UPDATE "dispatch" d
SET "toLocation" = l."name"
FROM "location" l
WHERE d."toLocationId" = l."id";

-- DropForeignKey
ALTER TABLE "dispatch" DROP CONSTRAINT "dispatch_toLocationId_fkey";

-- DropIndex
DROP INDEX "dispatch_toLocationId_idx";

-- AlterTable
ALTER TABLE "dispatch" DROP COLUMN "toLocationId";
