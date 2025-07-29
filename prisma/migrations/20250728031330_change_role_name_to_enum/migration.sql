-- Tambah kolom enum sementara
ALTER TABLE "Role" ADD COLUMN "name_tmp" "TypeUserRole";

-- Salin isi kolom lama ke kolom enum
UPDATE "Role" SET "name_tmp" = 
  CASE
    WHEN "name" = 'ADMIN' THEN 'ADMIN'::"TypeUserRole"
    WHEN "name" = 'DOSEN' THEN 'DOSEN'::"TypeUserRole"
    WHEN "name" = 'VALIDATOR' THEN 'VALIDATOR'::"TypeUserRole"
    ELSE NULL
  END;

-- Hapus kolom lama
ALTER TABLE "Role" DROP COLUMN "name";

-- Ganti nama kolom baru
ALTER TABLE "Role" RENAME COLUMN "name_tmp" TO "name";

-- Tambahkan kembali constraint unik (kalau perlu)
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");
