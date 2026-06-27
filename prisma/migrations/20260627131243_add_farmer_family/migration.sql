-- AlterTable
ALTER TABLE "farmer" ADD COLUMN     "familyId" TEXT;

-- CreateTable
CREATE TABLE "farmer_family" (
    "id" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "stationId" TEXT NOT NULL,
    "localityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "farmer_family_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "farmer_family_accountNumber_key" ON "farmer_family"("accountNumber");

-- CreateIndex
CREATE INDEX "farmer_family_stationId_idx" ON "farmer_family"("stationId");

-- CreateIndex
CREATE INDEX "farmer_family_localityId_idx" ON "farmer_family"("localityId");

-- CreateIndex
CREATE INDEX "farmer_familyId_idx" ON "farmer"("familyId");

-- AddForeignKey
ALTER TABLE "farmer_family" ADD CONSTRAINT "farmer_family_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "station"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "farmer_family" ADD CONSTRAINT "farmer_family_localityId_fkey" FOREIGN KEY ("localityId") REFERENCES "locality"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "farmer" ADD CONSTRAINT "farmer_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "farmer_family"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "dispatch_requisition_size_line_dispatchRequisitionId_sizeId_gen" RENAME TO "dispatch_requisition_size_line_dispatchRequisitionId_sizeId_key";
