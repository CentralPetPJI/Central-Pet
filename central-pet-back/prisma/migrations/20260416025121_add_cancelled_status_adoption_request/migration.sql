-- AlterEnum
ALTER TYPE "AdoptionRequestStatus" ADD VALUE 'CANCELLED';

-- AlterTable
ALTER TABLE "AdoptionRequest" ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 0;
