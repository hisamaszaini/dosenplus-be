/*
  Warnings:

  - Changed the type of `targetType` on the `ActivityLog` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "ActivityLog" DROP COLUMN "targetType",
ADD COLUMN     "targetType" TEXT NOT NULL;

-- DropEnum
DROP TYPE "TargetType";
