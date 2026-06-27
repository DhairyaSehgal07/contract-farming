-- CreateTable
CREATE TABLE "farmer_stock_balance" (
    "id" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,
    "varietyId" TEXT NOT NULL,
    "sizeId" TEXT NOT NULL,
    "generationId" TEXT NOT NULL,
    "quantity" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "farmer_stock_balance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_transfer" (
    "id" TEXT NOT NULL,
    "transferDate" DATE NOT NULL,
    "remarks" TEXT,
    "fromFarmerId" TEXT NOT NULL,
    "toFarmerId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_transfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_transfer_line" (
    "id" TEXT NOT NULL,
    "transferId" TEXT NOT NULL,
    "varietyId" TEXT NOT NULL,
    "sizeId" TEXT NOT NULL,
    "generationId" TEXT NOT NULL,
    "quantity" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "stock_transfer_line_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "farmer_stock_balance_farmerId_idx" ON "farmer_stock_balance"("farmerId");

-- CreateIndex
CREATE INDEX "farmer_stock_balance_varietyId_idx" ON "farmer_stock_balance"("varietyId");

-- CreateIndex
CREATE UNIQUE INDEX "farmer_stock_balance_farmerId_varietyId_sizeId_generationId_key" ON "farmer_stock_balance"("farmerId", "varietyId", "sizeId", "generationId");

-- CreateIndex
CREATE INDEX "stock_transfer_transferDate_idx" ON "stock_transfer"("transferDate");

-- CreateIndex
CREATE INDEX "stock_transfer_fromFarmerId_idx" ON "stock_transfer"("fromFarmerId");

-- CreateIndex
CREATE INDEX "stock_transfer_toFarmerId_idx" ON "stock_transfer"("toFarmerId");

-- CreateIndex
CREATE INDEX "stock_transfer_createdById_idx" ON "stock_transfer"("createdById");

-- CreateIndex
CREATE INDEX "stock_transfer_line_transferId_idx" ON "stock_transfer_line"("transferId");

-- CreateIndex
CREATE INDEX "stock_transfer_line_varietyId_idx" ON "stock_transfer_line"("varietyId");

-- CreateIndex
CREATE INDEX "stock_transfer_line_sizeId_idx" ON "stock_transfer_line"("sizeId");

-- CreateIndex
CREATE INDEX "stock_transfer_line_generationId_idx" ON "stock_transfer_line"("generationId");

-- AddForeignKey
ALTER TABLE "farmer_stock_balance" ADD CONSTRAINT "farmer_stock_balance_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "farmer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "farmer_stock_balance" ADD CONSTRAINT "farmer_stock_balance_varietyId_fkey" FOREIGN KEY ("varietyId") REFERENCES "variety"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "farmer_stock_balance" ADD CONSTRAINT "farmer_stock_balance_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "size"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "farmer_stock_balance" ADD CONSTRAINT "farmer_stock_balance_generationId_fkey" FOREIGN KEY ("generationId") REFERENCES "generation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_transfer" ADD CONSTRAINT "stock_transfer_fromFarmerId_fkey" FOREIGN KEY ("fromFarmerId") REFERENCES "farmer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_transfer" ADD CONSTRAINT "stock_transfer_toFarmerId_fkey" FOREIGN KEY ("toFarmerId") REFERENCES "farmer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_transfer" ADD CONSTRAINT "stock_transfer_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_transfer_line" ADD CONSTRAINT "stock_transfer_line_transferId_fkey" FOREIGN KEY ("transferId") REFERENCES "stock_transfer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_transfer_line" ADD CONSTRAINT "stock_transfer_line_varietyId_fkey" FOREIGN KEY ("varietyId") REFERENCES "variety"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_transfer_line" ADD CONSTRAINT "stock_transfer_line_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "size"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_transfer_line" ADD CONSTRAINT "stock_transfer_line_generationId_fkey" FOREIGN KEY ("generationId") REFERENCES "generation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Backfill farmer stock balances from received dispatch lots
INSERT INTO "farmer_stock_balance" ("id", "farmerId", "varietyId", "sizeId", "generationId", "quantity", "createdAt", "updatedAt")
SELECT
    gen_random_uuid()::text,
    grouped."farmerId",
    grouped."varietyId",
    grouped."sizeId",
    grouped."generationId",
    grouped.total_quantity,
    NOW(),
    NOW()
FROM (
    SELECT
        r."farmerId",
        r."varietyId",
        sl."sizeId",
        sl."generationId",
        SUM(sl."quantity") AS total_quantity
    FROM "dispatch_lot" lot
    INNER JOIN "dispatch_requisition" dr ON dr."id" = lot."dispatchRequisitionId"
    INNER JOIN "dispatch_requisition_size_line" sl ON sl."dispatchRequisitionId" = dr."id"
    INNER JOIN "requisition" r ON r."id" = dr."requisitionId"
    WHERE lot."status" = 'RECEIVED'
    GROUP BY r."farmerId", r."varietyId", sl."sizeId", sl."generationId"
) AS grouped;
