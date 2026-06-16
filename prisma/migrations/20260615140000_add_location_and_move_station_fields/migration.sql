-- AlterTable
ALTER TABLE "station" ADD COLUMN "city" TEXT,
ADD COLUMN "state" TEXT;

-- Migrate city/state from localities to their parent stations
UPDATE "station" s
SET
  "city" = sub."city",
  "state" = sub."state"
FROM (
  SELECT DISTINCT ON ("stationId")
    "stationId",
    "city",
    "state"
  FROM "locality"
  WHERE "city" IS NOT NULL OR "state" IS NOT NULL
  ORDER BY "stationId", "updatedAt" DESC
) sub
WHERE s."id" = sub."stationId";

-- AlterTable
ALTER TABLE "locality" DROP COLUMN "city",
DROP COLUMN "state",
DROP COLUMN "postalCode";

-- CreateTable
CREATE TABLE "location" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "location_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "location_name_key" ON "location"("name");
