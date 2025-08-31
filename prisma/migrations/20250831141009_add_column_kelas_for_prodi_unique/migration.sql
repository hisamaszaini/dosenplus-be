/*
  Warnings:

  - A unique constraint covering the columns `[kelas]` on the table `Prodi` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `kelas` to the `Prodi` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Prodi_kode_key";

-- DropIndex
DROP INDEX "Prodi_nama_key";

-- AlterTable
ALTER TABLE "Prodi" ADD COLUMN     "kelas" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Prodi_kelas_key" ON "Prodi"("kelas");
