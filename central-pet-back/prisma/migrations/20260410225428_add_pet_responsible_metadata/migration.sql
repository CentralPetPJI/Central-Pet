-- AlterTable
ALTER TABLE "Pet" ADD COLUMN     "responsibleUserId" TEXT,
ADD COLUMN     "selectedPersonalitiesJson" TEXT NOT NULL DEFAULT '[]',
ADD COLUMN     "sourceName" TEXT,
ADD COLUMN     "sourceType" "UserRole",
ADD COLUMN     "state" TEXT;

-- CreateIndex
CREATE INDEX "Pet_responsibleUserId_idx" ON "Pet"("responsibleUserId");

-- AddForeignKey
ALTER TABLE "Pet" ADD CONSTRAINT "Pet_responsibleUserId_fkey" FOREIGN KEY ("responsibleUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
