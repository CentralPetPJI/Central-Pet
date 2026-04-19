/*
  Warnings:

  - You are about to drop the column `city` on the `Institution` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Institution` table. All the data in the column will be lost.
  - You are about to drop the column `mobile` on the `Institution` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Institution` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `Institution` table. All the data in the column will be lost.
  - You are about to drop the column `cnpj` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `facebook` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `foundedAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `instagram` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `organizationName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `website` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[cnpj]` on the table `Institution` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "User_cnpj_key";

-- AlterTable
ALTER TABLE "Institution" DROP COLUMN "city",
DROP COLUMN "email",
DROP COLUMN "mobile",
DROP COLUMN "phone",
DROP COLUMN "state",
ADD COLUMN     "cnpj" TEXT,
ADD COLUMN     "foundedAt" DATE;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "cnpj",
DROP COLUMN "facebook",
DROP COLUMN "foundedAt",
DROP COLUMN "instagram",
DROP COLUMN "organizationName",
DROP COLUMN "website";

-- CreateIndex
CREATE UNIQUE INDEX "Institution_cnpj_key" ON "Institution"("cnpj");
