-- AlterTable
ALTER TABLE "requisition" DROP COLUMN "actualDeliveryDate";

-- CreateTable
CREATE TABLE "dispatch" (
    "id" TEXT NOT NULL,
    "dispatchDate" DATE,
    "dateOfReceiving" DATE,
    "truckNumber" TEXT,
    "manualGatePassNumber" TEXT,
    "grossWeight" DECIMAL(12,2),
    "tareWeight" DECIMAL(12,2),
    "netWeight" DECIMAL(12,2),
    "averageWeightPerBag" DECIMAL(12,2),
    "driverMobileNumber" TEXT,
    "remarks" TEXT,
    "generationId" TEXT,
    "locationId" TEXT,
    "toLocationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dispatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dispatch_requisition" (
    "id" TEXT NOT NULL,
    "dispatchId" TEXT NOT NULL,
    "requisitionId" TEXT NOT NULL,

    CONSTRAINT "dispatch_requisition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dispatch_requisition_size_line" (
    "id" TEXT NOT NULL,
    "dispatchRequisitionId" TEXT NOT NULL,
    "sizeId" TEXT NOT NULL,
    "quantity" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "dispatch_requisition_size_line_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "dispatch_dispatchDate_idx" ON "dispatch"("dispatchDate");

-- CreateIndex
CREATE INDEX "dispatch_generationId_idx" ON "dispatch"("generationId");

-- CreateIndex
CREATE INDEX "dispatch_locationId_idx" ON "dispatch"("locationId");

-- CreateIndex
CREATE INDEX "dispatch_toLocationId_idx" ON "dispatch"("toLocationId");

-- CreateIndex
CREATE INDEX "dispatch_requisition_dispatchId_idx" ON "dispatch_requisition"("dispatchId");

-- CreateIndex
CREATE UNIQUE INDEX "dispatch_requisition_requisitionId_key" ON "dispatch_requisition"("requisitionId");

-- CreateIndex
CREATE INDEX "dispatch_requisition_size_line_sizeId_idx" ON "dispatch_requisition_size_line"("sizeId");

-- CreateIndex
CREATE UNIQUE INDEX "dispatch_requisition_size_line_dispatchRequisitionId_sizeId_key" ON "dispatch_requisition_size_line"("dispatchRequisitionId", "sizeId");

-- AddForeignKey
ALTER TABLE "dispatch" ADD CONSTRAINT "dispatch_generationId_fkey" FOREIGN KEY ("generationId") REFERENCES "generation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispatch" ADD CONSTRAINT "dispatch_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispatch" ADD CONSTRAINT "dispatch_toLocationId_fkey" FOREIGN KEY ("toLocationId") REFERENCES "location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispatch_requisition" ADD CONSTRAINT "dispatch_requisition_dispatchId_fkey" FOREIGN KEY ("dispatchId") REFERENCES "dispatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispatch_requisition" ADD CONSTRAINT "dispatch_requisition_requisitionId_fkey" FOREIGN KEY ("requisitionId") REFERENCES "requisition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispatch_requisition_size_line" ADD CONSTRAINT "dispatch_requisition_size_line_dispatchRequisitionId_fkey" FOREIGN KEY ("dispatchRequisitionId") REFERENCES "dispatch_requisition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispatch_requisition_size_line" ADD CONSTRAINT "dispatch_requisition_size_line_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "size"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
