/*
  Warnings:

  - A unique constraint covering the columns `[reporterId,targetType,targetId]` on the table `ModerationReport` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `targetType` on the `ModerationReport` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ModerationTargetType" AS ENUM ('PET', 'USER', 'ADOPTION_REQUEST');

-- AlterTable (Step 1: Add new nullable column)
ALTER TABLE "ModerationReport" ADD COLUMN "targetType_new" "ModerationTargetType";

-- Backfill (Step 2: Backfill from existing data)
UPDATE "ModerationReport"
SET "targetType_new" = CAST("targetType" AS text)::"ModerationTargetType";

-- Deduplication (Step 3: Remove potential duplicates that would violate uniqueness)
DELETE FROM "ModerationReport" a
USING "ModerationReport" b
WHERE a.id < b.id
  AND a."reporterId" = b."reporterId"
  AND a."targetId" = b."targetId"
  AND a."targetType" = b."targetType";

-- Finalize (Step 4: Set NOT NULL, drop old, rename new, create index)
ALTER TABLE "ModerationReport" DROP COLUMN "targetType";
ALTER TABLE "ModerationReport" RENAME COLUMN "targetType_new" TO "targetType";
ALTER TABLE "ModerationReport" ALTER COLUMN "targetType" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ModerationReport_reporterId_targetType_targetId_key" ON "ModerationReport"("reporterId", "targetType", "targetId");
