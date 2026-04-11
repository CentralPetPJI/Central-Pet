-- AlterTable
ALTER TABLE "Pet" ADD COLUMN     "deleted" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Pet_deleted_idx" ON "Pet"("deleted");
