/*
  Warnings:

  - A unique constraint covering the columns `[kode]` on the table `Semester` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nama]` on the table `Semester` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Semester_kode_key" ON "Semester"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "Semester_nama_key" ON "Semester"("nama");
