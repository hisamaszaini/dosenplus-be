/*
  Warnings:

  - You are about to drop the column `fotoPath` on the `Dosen` table. All the data in the column will be lost.
  - You are about to drop the column `fotoPath` on the `Validator` table. All the data in the column will be lost.
  - You are about to drop the `PendingDosenUpdate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PendingKepegawaianUpdate` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "TargetType" AS ENUM ('BIODATA', 'KEPEGAWAIAN', 'PENDIDIKAN', 'PELAKSANAAN_PENDIDIKAN', 'PENELITIAN', 'PENGABDIAN', 'PENUNJANG');

-- DropForeignKey
ALTER TABLE "PendingDosenUpdate" DROP CONSTRAINT "PendingDosenUpdate_dosenId_fkey";

-- DropForeignKey
ALTER TABLE "PendingKepegawaianUpdate" DROP CONSTRAINT "PendingKepegawaianUpdate_dosenId_fkey";

-- AlterTable
ALTER TABLE "Dosen" DROP COLUMN "fotoPath";

-- AlterTable
ALTER TABLE "PelaksanaanPendidikan" ADD COLUMN     "catatan" TEXT;

-- AlterTable
ALTER TABLE "Pendidikan" ADD COLUMN     "catatan" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "fotoPath" TEXT;

-- AlterTable
ALTER TABLE "Validator" DROP COLUMN "fotoPath";

-- DropTable
DROP TABLE "PendingDosenUpdate";

-- DropTable
DROP TABLE "PendingKepegawaianUpdate";

-- CreateTable
CREATE TABLE "PendingBiodataDosen" (
    "id" SERIAL NOT NULL,
    "dosenId" INTEGER NOT NULL,
    "nama" TEXT NOT NULL,
    "nip" TEXT,
    "nuptk" TEXT,
    "jenis_kelamin" TEXT NOT NULL,
    "no_hp" TEXT,
    "prodiId" INTEGER NOT NULL,
    "fakultasId" INTEGER NOT NULL,
    "jabatan" TEXT,
    "fotoPath" TEXT,
    "status" "StatusValidasi" NOT NULL DEFAULT 'PENDING',
    "reviewerId" INTEGER,
    "catatan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PendingBiodataDosen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PendingDataKepegawaian" (
    "id" SERIAL NOT NULL,
    "dosenId" INTEGER NOT NULL,
    "npwp" TEXT,
    "nama_bank" TEXT,
    "no_rek" TEXT,
    "bpjs_kesehatan" TEXT,
    "bpjs_tkerja" TEXT,
    "no_kk" TEXT,
    "status" "StatusValidasi" NOT NULL DEFAULT 'PENDING',
    "reviewerId" INTEGER,
    "catatan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PendingDataKepegawaian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "targetType" "TargetType" NOT NULL,
    "targetId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PendingBiodataDosen_dosenId_key" ON "PendingBiodataDosen"("dosenId");

-- CreateIndex
CREATE UNIQUE INDEX "PendingDataKepegawaian_dosenId_key" ON "PendingDataKepegawaian"("dosenId");

-- AddForeignKey
ALTER TABLE "PendingBiodataDosen" ADD CONSTRAINT "PendingBiodataDosen_prodiId_fkey" FOREIGN KEY ("prodiId") REFERENCES "Prodi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PendingBiodataDosen" ADD CONSTRAINT "PendingBiodataDosen_fakultasId_fkey" FOREIGN KEY ("fakultasId") REFERENCES "Fakultas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PendingBiodataDosen" ADD CONSTRAINT "PendingBiodataDosen_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PendingBiodataDosen" ADD CONSTRAINT "PendingBiodataDosen_dosenId_fkey" FOREIGN KEY ("dosenId") REFERENCES "Dosen"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PendingDataKepegawaian" ADD CONSTRAINT "PendingDataKepegawaian_dosenId_fkey" FOREIGN KEY ("dosenId") REFERENCES "Dosen"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PendingDataKepegawaian" ADD CONSTRAINT "PendingDataKepegawaian_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
