/*
  Warnings:

  - The `status` column on the `Semester` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "SemesterStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- AlterTable
ALTER TABLE "Semester" DROP COLUMN "status",
ADD COLUMN     "status" "SemesterStatus" NOT NULL DEFAULT 'ACTIVE';
