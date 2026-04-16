/*
  Warnings:

  - A unique constraint covering the columns `[id,version]` on the table `AdoptionRequest` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "AdoptionRequest_id_version_key" ON "AdoptionRequest"("id", "version");
