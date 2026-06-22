-- DropForeignKey
ALTER TABLE "dispatch" DROP CONSTRAINT IF EXISTS "dispatch_generationId_fkey";

-- DropIndex
DROP INDEX IF EXISTS "dispatch_generationId_idx";

-- AlterTable
ALTER TABLE "dispatch" DROP COLUMN IF EXISTS "generationId";
