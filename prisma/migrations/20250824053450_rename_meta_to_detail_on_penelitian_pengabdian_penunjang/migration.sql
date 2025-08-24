/*
  Warnings:

  - You are about to drop the column `meta` on the `Penelitian` table. All the data in the column will be lost.
  - You are about to drop the column `meta` on the `Pengabdian` table. All the data in the column will be lost.
  - You are about to drop the column `meta` on the `Penunjang` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Penelitian" DROP COLUMN "meta",
ADD COLUMN     "detail" JSONB NOT NULL DEFAULT '{}';

-- AlterTable
ALTER TABLE "Pengabdian" DROP COLUMN "meta",
ADD COLUMN     "detail" JSONB NOT NULL DEFAULT '{}';

-- AlterTable
ALTER TABLE "Penunjang" DROP COLUMN "meta",
ADD COLUMN     "detail" JSONB NOT NULL DEFAULT '{}';
