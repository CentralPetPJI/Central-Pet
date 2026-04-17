/*
  Warnings:

  - A unique constraint covering the columns `[petId,adopterId]` on the table `AdoptionRequest` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "AdoptionRequest_id_version_key";

-- AlterTable
ALTER TABLE "AdoptionRequest" ADD COLUMN     "responsibleContactShareConsent" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "AdoptionRequest_petId_adopterId_key" ON "AdoptionRequest"("petId", "adopterId");
