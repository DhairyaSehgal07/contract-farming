/*
  Warnings:

  - You are about to alter the column `quantity` on the `requisition` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,3)` to `Decimal(12,2)`.

*/
-- AlterTable
ALTER TABLE "requisition" ALTER COLUMN "quantity" SET DATA TYPE DECIMAL(12,2);
