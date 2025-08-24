/*
  Warnings:

  - The values [PUBLIKASI_ILMIAH] on the enum `JenisKategoriPenelitian` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "JenisKategoriPenelitian_new" AS ENUM ('BUKU', 'BOOK_CHAPTER', 'JURNAL', 'PROSIDING_DIPUBLIKASIKAN', 'SEMINAR_TANPA_PROSIDING', 'PROSIDING_TANPA_SEMINAR', 'KORAN_MAJALAH', 'PATEN_INTERNASIONAL_INDUSTRI', 'PATEN_INTERNASIONAL', 'PATEN_NASIONAL_INDUSTRI', 'PATEN_NASIONAL', 'PATEN_SEDERHANA', 'CIPTAAN_DESAIN_GEOGRAFIS', 'CIPTAAN_BAHAN_PENGAJAR', 'INTERNASIONAL', 'NASIONAL', 'LOKAL');
ALTER TABLE "Penelitian" ALTER COLUMN "jenisKategori" TYPE "JenisKategoriPenelitian_new" USING ("jenisKategori"::text::"JenisKategoriPenelitian_new");
ALTER TYPE "JenisKategoriPenelitian" RENAME TO "JenisKategoriPenelitian_old";
ALTER TYPE "JenisKategoriPenelitian_new" RENAME TO "JenisKategoriPenelitian";
DROP TYPE "JenisKategoriPenelitian_old";
COMMIT;
