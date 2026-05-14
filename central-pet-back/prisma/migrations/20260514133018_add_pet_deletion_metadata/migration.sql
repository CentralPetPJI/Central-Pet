-- AlterTable
ALTER TABLE "Pet" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedBy" TEXT,
ADD COLUMN     "deletedReason" TEXT;
