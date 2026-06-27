-- CreateEnum
CREATE TYPE "FieldActivityRound" AS ENUM ('FIRST', 'SECOND');

-- CreateTable
CREATE TABLE "field_plantation" (
    "id" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "varietyId" TEXT NOT NULL,
    "sizeId" TEXT NOT NULL,
    "bagCount" DECIMAL(12,2) NOT NULL,
    "acresPlanted" DECIMAL(10,2) NOT NULL,
    "plantedAt" DATE NOT NULL,
    "imageUrl" TEXT,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "field_plantation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "field_irrigation" (
    "id" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "cycleNumber" INTEGER NOT NULL,
    "irrigatedAt" DATE NOT NULL,
    "imageUrl" TEXT,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "field_irrigation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "field_dehaulming" (
    "id" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "round" "FieldActivityRound" NOT NULL,
    "activityDate" DATE NOT NULL,
    "result" TEXT,
    "remarks" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "field_dehaulming_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "field_rouging" (
    "id" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "activityDate" DATE NOT NULL,
    "result" TEXT,
    "remarks" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "field_rouging_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "field_strip_test" (
    "id" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "round" "FieldActivityRound" NOT NULL,
    "activityDate" DATE NOT NULL,
    "result" TEXT,
    "remarks" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "field_strip_test_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "field_harvest" (
    "id" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "activityDate" DATE NOT NULL,
    "result" TEXT,
    "remarks" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "field_harvest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "field_plantation_fieldId_idx" ON "field_plantation"("fieldId");

-- CreateIndex
CREATE INDEX "field_plantation_varietyId_idx" ON "field_plantation"("varietyId");

-- CreateIndex
CREATE INDEX "field_plantation_sizeId_idx" ON "field_plantation"("sizeId");

-- CreateIndex
CREATE INDEX "field_irrigation_fieldId_idx" ON "field_irrigation"("fieldId");

-- CreateIndex
CREATE UNIQUE INDEX "field_irrigation_fieldId_cycleNumber_key" ON "field_irrigation"("fieldId", "cycleNumber");

-- CreateIndex
CREATE INDEX "field_dehaulming_fieldId_idx" ON "field_dehaulming"("fieldId");

-- CreateIndex
CREATE INDEX "field_rouging_fieldId_idx" ON "field_rouging"("fieldId");

-- CreateIndex
CREATE INDEX "field_strip_test_fieldId_idx" ON "field_strip_test"("fieldId");

-- CreateIndex
CREATE INDEX "field_harvest_fieldId_idx" ON "field_harvest"("fieldId");

-- AddForeignKey
ALTER TABLE "field_plantation" ADD CONSTRAINT "field_plantation_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "farmer_field"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "field_plantation" ADD CONSTRAINT "field_plantation_varietyId_fkey" FOREIGN KEY ("varietyId") REFERENCES "variety"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "field_plantation" ADD CONSTRAINT "field_plantation_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "size"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "field_irrigation" ADD CONSTRAINT "field_irrigation_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "farmer_field"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "field_dehaulming" ADD CONSTRAINT "field_dehaulming_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "farmer_field"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "field_rouging" ADD CONSTRAINT "field_rouging_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "farmer_field"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "field_strip_test" ADD CONSTRAINT "field_strip_test_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "farmer_field"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "field_harvest" ADD CONSTRAINT "field_harvest_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "farmer_field"("id") ON DELETE CASCADE ON UPDATE CASCADE;
