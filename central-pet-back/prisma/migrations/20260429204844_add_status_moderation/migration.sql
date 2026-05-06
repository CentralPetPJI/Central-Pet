/*
  Warnings:

  - The `status` column on the `ModerationReport` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ModerationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'DISMISSED');

-- AlterTable
ALTER TABLE "ModerationReport" DROP COLUMN "status",
ADD COLUMN     "status" "ModerationStatus" NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE INDEX "ModerationReport_status_idx" ON "ModerationReport"("status");
