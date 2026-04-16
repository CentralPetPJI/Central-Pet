/*
  Warnings:

  - Made the column `responsibleUserId` on table `Pet` required. This step will fail if there are existing NULL values in that column.
  - Made the column `sourceName` on table `Pet` required. This step will fail if there are existing NULL values in that column.
  - Made the column `sourceType` on table `Pet` required. This step will fail if there are existing NULL values in that column.
  - Made the column `state` on table `Pet` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Pet" ALTER COLUMN "responsibleUserId" SET NOT NULL,
ALTER COLUMN "sourceName" SET NOT NULL,
ALTER COLUMN "sourceType" SET NOT NULL,
ALTER COLUMN "state" SET NOT NULL;
