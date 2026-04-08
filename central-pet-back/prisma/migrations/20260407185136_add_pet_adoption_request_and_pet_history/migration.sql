-- CreateEnum
CREATE TYPE "PetSpecies" AS ENUM ('DOG', 'CAT');

-- CreateEnum
CREATE TYPE "PetSex" AS ENUM ('FEMALE', 'MALE');

-- CreateEnum
CREATE TYPE "PetSize" AS ENUM ('SMALL', 'MEDIUM', 'LARGE');

-- CreateEnum
CREATE TYPE "PetStatus" AS ENUM ('AVAILABLE', 'PENDING_ADOPTION', 'ADOPTED', 'UNAVAILABLE');

-- CreateEnum
CREATE TYPE "AdoptionRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PetHistoryEventType" AS ENUM ('CREATED', 'TRANSFERRED', 'ADOPTION_APPROVED', 'RETURNED', 'STATUS_CHANGED', 'UPDATED');

-- CreateTable
CREATE TABLE "Pet" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ageText" TEXT NOT NULL,
    "species" "PetSpecies" NOT NULL,
    "breed" TEXT NOT NULL,
    "sex" "PetSex" NOT NULL,
    "size" "PetSize" NOT NULL,
    "profilePhoto" TEXT NOT NULL,
    "galleryPhotosJson" TEXT,
    "microchipped" BOOLEAN NOT NULL DEFAULT false,
    "vaccinated" BOOLEAN NOT NULL DEFAULT false,
    "neutered" BOOLEAN NOT NULL DEFAULT false,
    "dewormed" BOOLEAN NOT NULL DEFAULT false,
    "needsHealthCare" BOOLEAN NOT NULL DEFAULT false,
    "physicalLimitation" BOOLEAN NOT NULL DEFAULT false,
    "visualLimitation" BOOLEAN NOT NULL DEFAULT false,
    "hearingLimitation" BOOLEAN NOT NULL DEFAULT false,
    "tutor" TEXT NOT NULL,
    "shelter" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "status" "PetStatus" NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdoptionRequest" (
    "id" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "message" TEXT,
    "status" "AdoptionRequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdoptionRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PetHistory" (
    "id" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "eventType" "PetHistoryEventType" NOT NULL,
    "description" TEXT NOT NULL,
    "fromResponsible" TEXT,
    "toResponsible" TEXT,
    "fromLocation" TEXT,
    "toLocation" TEXT,
    "performedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PetHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Pet_status_idx" ON "Pet"("status");

-- CreateIndex
CREATE INDEX "Pet_species_idx" ON "Pet"("species");

-- CreateIndex
CREATE INDEX "Pet_city_idx" ON "Pet"("city");

-- CreateIndex
CREATE INDEX "AdoptionRequest_petId_idx" ON "AdoptionRequest"("petId");

-- CreateIndex
CREATE INDEX "AdoptionRequest_requesterId_idx" ON "AdoptionRequest"("requesterId");

-- CreateIndex
CREATE INDEX "AdoptionRequest_status_idx" ON "AdoptionRequest"("status");

-- CreateIndex
CREATE INDEX "PetHistory_petId_idx" ON "PetHistory"("petId");

-- CreateIndex
CREATE INDEX "PetHistory_performedByUserId_idx" ON "PetHistory"("performedByUserId");

-- CreateIndex
CREATE INDEX "PetHistory_eventType_idx" ON "PetHistory"("eventType");

-- CreateIndex
CREATE INDEX "PetHistory_createdAt_idx" ON "PetHistory"("createdAt");

-- AddForeignKey
ALTER TABLE "AdoptionRequest" ADD CONSTRAINT "AdoptionRequest_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdoptionRequest" ADD CONSTRAINT "AdoptionRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PetHistory" ADD CONSTRAINT "PetHistory_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PetHistory" ADD CONSTRAINT "PetHistory_performedByUserId_fkey" FOREIGN KEY ("performedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
