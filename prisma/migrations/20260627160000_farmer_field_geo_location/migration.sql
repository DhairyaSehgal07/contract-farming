-- DropForeignKey
ALTER TABLE "irrigation_cycle" DROP CONSTRAINT "irrigation_cycle_fieldId_fkey";

-- DropForeignKey
ALTER TABLE "plantation" DROP CONSTRAINT "plantation_fieldId_fkey";

-- DropForeignKey
ALTER TABLE "plantation" DROP CONSTRAINT "plantation_varietyId_fkey";

-- DropForeignKey
ALTER TABLE "farmer_field" DROP CONSTRAINT "farmer_field_farmerId_fkey";

-- DropTable
DROP TABLE "irrigation_cycle";

-- DropTable
DROP TABLE "plantation";

-- AlterTable
ALTER TABLE "farmer_field" ADD COLUMN "geoLocation" TEXT;

UPDATE "farmer_field"
SET "geoLocation" = CONCAT("latitude"::text, ', ', "longitude"::text)
WHERE "latitude" IS NOT NULL AND "longitude" IS NOT NULL;

UPDATE "farmer_field"
SET "geoLocation" = ''
WHERE "geoLocation" IS NULL;

ALTER TABLE "farmer_field"
DROP COLUMN "latitude",
DROP COLUMN "longitude",
ALTER COLUMN "geoLocation" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "farmer_field_farmerId_name_key" ON "farmer_field"("farmerId", "name");

-- AddForeignKey
ALTER TABLE "farmer_field" ADD CONSTRAINT "farmer_field_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "farmer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
