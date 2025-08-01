/*
  Warnings:

  - You are about to drop the column `kegiatan` on the `Pendidikan` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "StatusValidasi" AS ENUM ('PENDING', 'ACCEPT', 'REJECT');

-- AlterTable
ALTER TABLE "PelaksanaanPendidikan" ADD COLUMN     "statusValidasi" "StatusValidasi" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Pendidikan" DROP COLUMN "kegiatan",
ADD COLUMN     "statusValidasi" "StatusValidasi" NOT NULL DEFAULT 'PENDING';
