/*
  Warnings:

  - A unique constraint covering the columns `[reporterId,targetType,targetId]` on the table `ModerationReport` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `targetType` on the `ModerationReport` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ModerationTargetType" AS ENUM ('PET', 'USER', 'ADOPTION_REQUEST');

-- AlterTable
ALTER TABLE "ModerationReport" DROP COLUMN "targetType",
ADD COLUMN     "targetType" "ModerationTargetType" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ModerationReport_reporterId_targetType_targetId_key" ON "ModerationReport"("reporterId", "targetType", "targetId");
