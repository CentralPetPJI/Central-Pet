-- CreateEnum
CREATE TYPE "AdoptionRequestStatus" AS ENUM ('pending', 'contact_shared', 'approved', 'rejected');

-- CreateTable
CREATE TABLE "AdoptionRequest" (
    "id" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "responsibleUserId" TEXT NOT NULL,
    "adopterId" TEXT NOT NULL,
    "adopterContactShareConsent" BOOLEAN NOT NULL DEFAULT false,
    "message" TEXT NOT NULL,
    "status" "AdoptionRequestStatus" NOT NULL DEFAULT 'pending',
    "note" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdoptionRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdoptionRequest_responsibleUserId_requestedAt_idx" ON "AdoptionRequest"("responsibleUserId", "requestedAt");

-- CreateIndex
CREATE INDEX "AdoptionRequest_adopterId_idx" ON "AdoptionRequest"("adopterId");

-- CreateIndex
CREATE INDEX "AdoptionRequest_petId_idx" ON "AdoptionRequest"("petId");
