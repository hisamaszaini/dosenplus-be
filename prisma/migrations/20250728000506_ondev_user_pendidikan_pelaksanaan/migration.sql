-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "TypeUserRole" AS ENUM ('ADMIN', 'DOSEN', 'VALIDATOR');

-- CreateEnum
CREATE TYPE "Jenjang" AS ENUM ('S1', 'S2', 'S3');

-- CreateEnum
CREATE TYPE "KategoriPendidikan" AS ENUM ('FORMAL', 'DIKLAT');

-- CreateEnum
CREATE TYPE "NamaSemester" AS ENUM ('GENAP', 'GANJIL');

-- CreateEnum
CREATE TYPE "KategoriKegiatan" AS ENUM ('PERKULIAHAN', 'BIMBINGAN_SEMINAR', 'BIMBINGAN_TUGAS_AKHIR', 'BIMBINGAN_KKN_PKN_PKL', 'PENGUJI_UJIAN_AKHIR', 'PEMBINA_KEGIATAN_MHS', 'PENGEMBANGAN_PROGRAM', 'BAHAN_PENGAJARAN', 'ORASI_ILMIAH', 'JABATAN_STRUKTURAL', 'BIMBING_DOSEN', 'DATA_SERING_PENCAKOKAN', 'PENGEMBANGAN_DIRI');

-- CreateEnum
CREATE TYPE "JenisKegiatan" AS ENUM ('DOSEN_PEMBIMBING', 'DOSEN_PENGUJI', 'PEMBINA', 'PENULIS_BUKU', 'NARASUMBER', 'PENGEMBANGAN');

-- CreateEnum
CREATE TYPE "JabatanFungsional" AS ENUM ('ASISTEN_AHLI', 'LEKTOR', 'LEKTOR_KEPALA', 'GURU_BESAR');

-- CreateEnum
CREATE TYPE "JenisKKNPKNPKL" AS ENUM ('KKN', 'PKN', 'PKL');

-- CreateEnum
CREATE TYPE "JenisBahanPengajaran" AS ENUM ('BUKU_AJAR', 'PRODUK_LAIN');

-- CreateEnum
CREATE TYPE "Tingkat" AS ENUM ('LOKAL', 'DAERAH', 'NASIONAL', 'INTERNASIONAL');

-- CreateEnum
CREATE TYPE "JenisBimbingan" AS ENUM ('REGULER', 'PENCAKOKAN');

-- CreateEnum
CREATE TYPE "JenisDatasering" AS ENUM ('DATASERING', 'PENCAKOKAN');

-- CreateTable
CREATE TABLE "Setting" (
    "id" SERIAL NOT NULL,
    "namaRektor" TEXT NOT NULL,
    "nipRektor" TEXT NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "hashedRefreshToken" TEXT,
    "passwordResetToken" TEXT,
    "passwordResetExpires" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "roleId" INTEGER NOT NULL,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Validator" (
    "id" INTEGER NOT NULL,
    "nama" TEXT NOT NULL,
    "nip" TEXT,
    "jenis_kelamin" TEXT NOT NULL,
    "no_hp" TEXT,

    CONSTRAINT "Validator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fakultas" (
    "id" SERIAL NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Fakultas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prodi" (
    "id" SERIAL NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "fakultasId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prodi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dosen" (
    "id" INTEGER NOT NULL,
    "nama" TEXT NOT NULL,
    "nip" TEXT,
    "nuptk" TEXT,
    "jenis_kelamin" TEXT NOT NULL,
    "no_hp" TEXT,
    "prodiId" INTEGER NOT NULL,
    "fakultasId" INTEGER NOT NULL,
    "jabatan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dosen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataKepegawaian" (
    "id" INTEGER NOT NULL,
    "npwp" TEXT,
    "nama_bank" TEXT,
    "no_rek" TEXT,
    "bpjs_kesehatan" TEXT,
    "bpjs_tkerja" TEXT,
    "no_kk" TEXT,

    CONSTRAINT "DataKepegawaian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pendidikan" (
    "id" SERIAL NOT NULL,
    "dosenId" INTEGER NOT NULL,
    "kategori" "KategoriPendidikan" NOT NULL,
    "kegiatan" TEXT,
    "nilaiPak" INTEGER NOT NULL,
    "filePath" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pendidikan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PendidikanFormal" (
    "id" SERIAL NOT NULL,
    "pendidikanId" INTEGER NOT NULL,
    "jenjang" TEXT NOT NULL,
    "prodi" TEXT NOT NULL,
    "fakultas" TEXT NOT NULL,
    "perguruanTinggi" TEXT NOT NULL,
    "lulusTahun" INTEGER NOT NULL,

    CONSTRAINT "PendidikanFormal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PendidikanDiklat" (
    "id" SERIAL NOT NULL,
    "pendidikanId" INTEGER NOT NULL,
    "jenisDiklat" TEXT NOT NULL,
    "namaDiklat" TEXT NOT NULL,
    "penyelenggara" TEXT NOT NULL,
    "peran" TEXT NOT NULL,
    "tingkatan" TEXT NOT NULL,
    "jumlahJam" INTEGER NOT NULL,
    "noSertifikat" TEXT NOT NULL,
    "tglSertifikat" TIMESTAMP(3) NOT NULL,
    "tempat" TEXT NOT NULL,
    "tglMulai" TIMESTAMP(3) NOT NULL,
    "tglSelesai" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PendidikanDiklat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Semester" (
    "id" SERIAL NOT NULL,
    "kode" INTEGER NOT NULL,
    "nama" TEXT NOT NULL,
    "tipe" "NamaSemester" NOT NULL,
    "tahunMulai" INTEGER NOT NULL,
    "tahunSelesai" INTEGER NOT NULL,
    "status" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Semester_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PelaksanaanPendidikan" (
    "id" SERIAL NOT NULL,
    "dosenId" INTEGER NOT NULL,
    "semesterId" INTEGER NOT NULL,
    "kategori" "KategoriKegiatan" NOT NULL,
    "nilaiPak" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "filePath" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PelaksanaanPendidikan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Perkuliahan" (
    "id" SERIAL NOT NULL,
    "pelaksanaanId" INTEGER NOT NULL,
    "mataKuliah" TEXT NOT NULL,
    "sks" INTEGER NOT NULL,
    "jumlahKelas" INTEGER NOT NULL,
    "totalSks" INTEGER NOT NULL,
    "prodiId" INTEGER NOT NULL,
    "fakultasId" INTEGER NOT NULL,

    CONSTRAINT "Perkuliahan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BimbinganSeminar" (
    "id" SERIAL NOT NULL,
    "pelaksanaanId" INTEGER NOT NULL,
    "prodiId" INTEGER NOT NULL,
    "fakultasId" INTEGER NOT NULL,
    "jumlahMhs" INTEGER NOT NULL,

    CONSTRAINT "BimbinganSeminar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BimbinganKknPknPkl" (
    "id" SERIAL NOT NULL,
    "pelaksanaanId" INTEGER NOT NULL,
    "jenis" "JenisKKNPKNPKL" NOT NULL,
    "prodiId" INTEGER NOT NULL,
    "fakultasId" INTEGER NOT NULL,
    "jumlahMhs" INTEGER NOT NULL,

    CONSTRAINT "BimbinganKknPknPkl_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BimbinganTugasAkhir" (
    "id" SERIAL NOT NULL,
    "pelaksanaanId" INTEGER NOT NULL,
    "jenis" TEXT NOT NULL,
    "peran" TEXT NOT NULL,
    "jumlahMhs" INTEGER NOT NULL,

    CONSTRAINT "BimbinganTugasAkhir_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PengujiUjianAkhir" (
    "id" SERIAL NOT NULL,
    "pelaksanaanId" INTEGER NOT NULL,
    "peran" TEXT NOT NULL,
    "jumlahMhs" INTEGER NOT NULL,

    CONSTRAINT "PengujiUjianAkhir_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PembinaKegiatanMhs" (
    "id" SERIAL NOT NULL,
    "pelaksanaanId" INTEGER NOT NULL,
    "namaKegiatan" TEXT NOT NULL,
    "luaran" TEXT NOT NULL,

    CONSTRAINT "PembinaKegiatanMhs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PengembanganProgramKuliah" (
    "id" SERIAL NOT NULL,
    "pelaksanaanId" INTEGER NOT NULL,
    "programPengembangan" TEXT NOT NULL,
    "prodiId" INTEGER NOT NULL,
    "fakultasId" INTEGER NOT NULL,
    "mataKuliah" TEXT NOT NULL,

    CONSTRAINT "PengembanganProgramKuliah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BahanPengajaran" (
    "id" SERIAL NOT NULL,
    "pelaksanaanId" INTEGER NOT NULL,
    "jenis" "JenisBahanPengajaran" NOT NULL,
    "bukuAjarId" INTEGER,
    "produkLainId" INTEGER,

    CONSTRAINT "BahanPengajaran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BukuAjar" (
    "id" SERIAL NOT NULL,
    "judul" TEXT NOT NULL,
    "tglTerbit" TIMESTAMP(3) NOT NULL,
    "penerbit" TEXT NOT NULL,
    "jumlahHalaman" INTEGER NOT NULL,
    "isbn" TEXT,

    CONSTRAINT "BukuAjar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProdukBahanLainnya" (
    "id" SERIAL NOT NULL,
    "jenisProduk" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "jumlahHalaman" INTEGER NOT NULL,
    "mataKuliah" TEXT NOT NULL,
    "prodiId" INTEGER NOT NULL,
    "fakultasId" INTEGER NOT NULL,

    CONSTRAINT "ProdukBahanLainnya_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrasiIlmiah" (
    "id" SERIAL NOT NULL,
    "pelaksanaanId" INTEGER NOT NULL,
    "namaKegiatan" TEXT NOT NULL,
    "deskripsi" TEXT,
    "tingkat" "Tingkat" NOT NULL,
    "penyelenggara" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrasiIlmiah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JabatanStruktural" (
    "id" SERIAL NOT NULL,
    "pelaksanaanId" INTEGER NOT NULL,
    "namaJabatan" TEXT NOT NULL,
    "prodiId" INTEGER NOT NULL,
    "fakultasId" INTEGER NOT NULL,
    "afiliasi" TEXT NOT NULL,

    CONSTRAINT "JabatanStruktural_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BimbingDosen" (
    "id" SERIAL NOT NULL,
    "pelaksanaanId" INTEGER NOT NULL,
    "prodiId" INTEGER NOT NULL,
    "tglMulai" TIMESTAMP(3) NOT NULL,
    "tglSelesai" TIMESTAMP(3) NOT NULL,
    "jenisBimbingan" "JenisBimbingan" NOT NULL,
    "jabatan" "JabatanFungsional" NOT NULL,
    "bidangAhli" TEXT NOT NULL,
    "deskripsi" TEXT,
    "jumlahDsn" INTEGER NOT NULL,

    CONSTRAINT "BimbingDosen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataseringPencakokan" (
    "id" SERIAL NOT NULL,
    "pelaksanaanId" INTEGER NOT NULL,
    "perguruanTinggi" TEXT NOT NULL,
    "jenis" "JenisDatasering" NOT NULL,
    "tglMulai" TIMESTAMP(3) NOT NULL,
    "tglSelesai" TIMESTAMP(3) NOT NULL,
    "bidangAhli" TEXT NOT NULL,

    CONSTRAINT "DataseringPencakokan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PengembanganDiri" (
    "id" SERIAL NOT NULL,
    "pelaksanaanId" INTEGER NOT NULL,
    "namaKegiatan" TEXT NOT NULL,
    "deskripsi" TEXT,
    "tglMulai" TIMESTAMP(3) NOT NULL,
    "tglSelesai" TIMESTAMP(3) NOT NULL,
    "penyelenggara" TEXT NOT NULL,
    "tempat" TEXT NOT NULL,
    "lamaJam" INTEGER NOT NULL,
    "prodiId" INTEGER NOT NULL,
    "fakultasId" INTEGER NOT NULL,

    CONSTRAINT "PengembanganDiri_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Validator_nip_key" ON "Validator"("nip");

-- CreateIndex
CREATE UNIQUE INDEX "Validator_no_hp_key" ON "Validator"("no_hp");

-- CreateIndex
CREATE UNIQUE INDEX "Fakultas_kode_key" ON "Fakultas"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "Fakultas_nama_key" ON "Fakultas"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "Prodi_kode_key" ON "Prodi"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "Prodi_nama_key" ON "Prodi"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "Dosen_nip_key" ON "Dosen"("nip");

-- CreateIndex
CREATE UNIQUE INDEX "Dosen_nuptk_key" ON "Dosen"("nuptk");

-- CreateIndex
CREATE UNIQUE INDEX "Dosen_no_hp_key" ON "Dosen"("no_hp");

-- CreateIndex
CREATE UNIQUE INDEX "DataKepegawaian_npwp_key" ON "DataKepegawaian"("npwp");

-- CreateIndex
CREATE UNIQUE INDEX "PendidikanFormal_pendidikanId_key" ON "PendidikanFormal"("pendidikanId");

-- CreateIndex
CREATE UNIQUE INDEX "PendidikanDiklat_pendidikanId_key" ON "PendidikanDiklat"("pendidikanId");

-- CreateIndex
CREATE INDEX "Semester_tipe_idx" ON "Semester"("tipe");

-- CreateIndex
CREATE INDEX "Semester_tahunMulai_tahunSelesai_idx" ON "Semester"("tahunMulai", "tahunSelesai");

-- CreateIndex
CREATE UNIQUE INDEX "Perkuliahan_pelaksanaanId_key" ON "Perkuliahan"("pelaksanaanId");

-- CreateIndex
CREATE UNIQUE INDEX "BimbinganSeminar_pelaksanaanId_key" ON "BimbinganSeminar"("pelaksanaanId");

-- CreateIndex
CREATE UNIQUE INDEX "BimbinganKknPknPkl_pelaksanaanId_key" ON "BimbinganKknPknPkl"("pelaksanaanId");

-- CreateIndex
CREATE UNIQUE INDEX "BimbinganTugasAkhir_pelaksanaanId_key" ON "BimbinganTugasAkhir"("pelaksanaanId");

-- CreateIndex
CREATE UNIQUE INDEX "PengujiUjianAkhir_pelaksanaanId_key" ON "PengujiUjianAkhir"("pelaksanaanId");

-- CreateIndex
CREATE UNIQUE INDEX "PembinaKegiatanMhs_pelaksanaanId_key" ON "PembinaKegiatanMhs"("pelaksanaanId");

-- CreateIndex
CREATE UNIQUE INDEX "PengembanganProgramKuliah_pelaksanaanId_key" ON "PengembanganProgramKuliah"("pelaksanaanId");

-- CreateIndex
CREATE UNIQUE INDEX "BahanPengajaran_pelaksanaanId_key" ON "BahanPengajaran"("pelaksanaanId");

-- CreateIndex
CREATE UNIQUE INDEX "BahanPengajaran_bukuAjarId_key" ON "BahanPengajaran"("bukuAjarId");

-- CreateIndex
CREATE UNIQUE INDEX "BahanPengajaran_produkLainId_key" ON "BahanPengajaran"("produkLainId");

-- CreateIndex
CREATE UNIQUE INDEX "OrasiIlmiah_pelaksanaanId_key" ON "OrasiIlmiah"("pelaksanaanId");

-- CreateIndex
CREATE UNIQUE INDEX "JabatanStruktural_pelaksanaanId_key" ON "JabatanStruktural"("pelaksanaanId");

-- CreateIndex
CREATE UNIQUE INDEX "BimbingDosen_pelaksanaanId_key" ON "BimbingDosen"("pelaksanaanId");

-- CreateIndex
CREATE UNIQUE INDEX "DataseringPencakokan_pelaksanaanId_key" ON "DataseringPencakokan"("pelaksanaanId");

-- CreateIndex
CREATE UNIQUE INDEX "PengembanganDiri_pelaksanaanId_key" ON "PengembanganDiri"("pelaksanaanId");

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Validator" ADD CONSTRAINT "Validator_id_fkey" FOREIGN KEY ("id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prodi" ADD CONSTRAINT "Prodi_fakultasId_fkey" FOREIGN KEY ("fakultasId") REFERENCES "Fakultas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dosen" ADD CONSTRAINT "Dosen_id_fkey" FOREIGN KEY ("id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dosen" ADD CONSTRAINT "Dosen_prodiId_fkey" FOREIGN KEY ("prodiId") REFERENCES "Prodi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dosen" ADD CONSTRAINT "Dosen_fakultasId_fkey" FOREIGN KEY ("fakultasId") REFERENCES "Fakultas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataKepegawaian" ADD CONSTRAINT "DataKepegawaian_id_fkey" FOREIGN KEY ("id") REFERENCES "Dosen"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pendidikan" ADD CONSTRAINT "Pendidikan_dosenId_fkey" FOREIGN KEY ("dosenId") REFERENCES "Dosen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PendidikanFormal" ADD CONSTRAINT "PendidikanFormal_pendidikanId_fkey" FOREIGN KEY ("pendidikanId") REFERENCES "Pendidikan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PendidikanDiklat" ADD CONSTRAINT "PendidikanDiklat_pendidikanId_fkey" FOREIGN KEY ("pendidikanId") REFERENCES "Pendidikan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PelaksanaanPendidikan" ADD CONSTRAINT "PelaksanaanPendidikan_dosenId_fkey" FOREIGN KEY ("dosenId") REFERENCES "Dosen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PelaksanaanPendidikan" ADD CONSTRAINT "PelaksanaanPendidikan_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "Semester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Perkuliahan" ADD CONSTRAINT "Perkuliahan_pelaksanaanId_fkey" FOREIGN KEY ("pelaksanaanId") REFERENCES "PelaksanaanPendidikan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Perkuliahan" ADD CONSTRAINT "Perkuliahan_prodiId_fkey" FOREIGN KEY ("prodiId") REFERENCES "Prodi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Perkuliahan" ADD CONSTRAINT "Perkuliahan_fakultasId_fkey" FOREIGN KEY ("fakultasId") REFERENCES "Fakultas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BimbinganSeminar" ADD CONSTRAINT "BimbinganSeminar_pelaksanaanId_fkey" FOREIGN KEY ("pelaksanaanId") REFERENCES "PelaksanaanPendidikan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BimbinganSeminar" ADD CONSTRAINT "BimbinganSeminar_prodiId_fkey" FOREIGN KEY ("prodiId") REFERENCES "Prodi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BimbinganSeminar" ADD CONSTRAINT "BimbinganSeminar_fakultasId_fkey" FOREIGN KEY ("fakultasId") REFERENCES "Fakultas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BimbinganKknPknPkl" ADD CONSTRAINT "BimbinganKknPknPkl_pelaksanaanId_fkey" FOREIGN KEY ("pelaksanaanId") REFERENCES "PelaksanaanPendidikan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BimbinganKknPknPkl" ADD CONSTRAINT "BimbinganKknPknPkl_prodiId_fkey" FOREIGN KEY ("prodiId") REFERENCES "Prodi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BimbinganKknPknPkl" ADD CONSTRAINT "BimbinganKknPknPkl_fakultasId_fkey" FOREIGN KEY ("fakultasId") REFERENCES "Fakultas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BimbinganTugasAkhir" ADD CONSTRAINT "BimbinganTugasAkhir_pelaksanaanId_fkey" FOREIGN KEY ("pelaksanaanId") REFERENCES "PelaksanaanPendidikan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PengujiUjianAkhir" ADD CONSTRAINT "PengujiUjianAkhir_pelaksanaanId_fkey" FOREIGN KEY ("pelaksanaanId") REFERENCES "PelaksanaanPendidikan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PembinaKegiatanMhs" ADD CONSTRAINT "PembinaKegiatanMhs_pelaksanaanId_fkey" FOREIGN KEY ("pelaksanaanId") REFERENCES "PelaksanaanPendidikan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PengembanganProgramKuliah" ADD CONSTRAINT "PengembanganProgramKuliah_pelaksanaanId_fkey" FOREIGN KEY ("pelaksanaanId") REFERENCES "PelaksanaanPendidikan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PengembanganProgramKuliah" ADD CONSTRAINT "PengembanganProgramKuliah_prodiId_fkey" FOREIGN KEY ("prodiId") REFERENCES "Prodi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PengembanganProgramKuliah" ADD CONSTRAINT "PengembanganProgramKuliah_fakultasId_fkey" FOREIGN KEY ("fakultasId") REFERENCES "Fakultas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BahanPengajaran" ADD CONSTRAINT "BahanPengajaran_bukuAjarId_fkey" FOREIGN KEY ("bukuAjarId") REFERENCES "BukuAjar"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BahanPengajaran" ADD CONSTRAINT "BahanPengajaran_produkLainId_fkey" FOREIGN KEY ("produkLainId") REFERENCES "ProdukBahanLainnya"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BahanPengajaran" ADD CONSTRAINT "BahanPengajaran_pelaksanaanId_fkey" FOREIGN KEY ("pelaksanaanId") REFERENCES "PelaksanaanPendidikan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProdukBahanLainnya" ADD CONSTRAINT "ProdukBahanLainnya_prodiId_fkey" FOREIGN KEY ("prodiId") REFERENCES "Prodi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProdukBahanLainnya" ADD CONSTRAINT "ProdukBahanLainnya_fakultasId_fkey" FOREIGN KEY ("fakultasId") REFERENCES "Fakultas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrasiIlmiah" ADD CONSTRAINT "OrasiIlmiah_pelaksanaanId_fkey" FOREIGN KEY ("pelaksanaanId") REFERENCES "PelaksanaanPendidikan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JabatanStruktural" ADD CONSTRAINT "JabatanStruktural_pelaksanaanId_fkey" FOREIGN KEY ("pelaksanaanId") REFERENCES "PelaksanaanPendidikan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JabatanStruktural" ADD CONSTRAINT "JabatanStruktural_prodiId_fkey" FOREIGN KEY ("prodiId") REFERENCES "Prodi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JabatanStruktural" ADD CONSTRAINT "JabatanStruktural_fakultasId_fkey" FOREIGN KEY ("fakultasId") REFERENCES "Fakultas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BimbingDosen" ADD CONSTRAINT "BimbingDosen_pelaksanaanId_fkey" FOREIGN KEY ("pelaksanaanId") REFERENCES "PelaksanaanPendidikan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BimbingDosen" ADD CONSTRAINT "BimbingDosen_prodiId_fkey" FOREIGN KEY ("prodiId") REFERENCES "Prodi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataseringPencakokan" ADD CONSTRAINT "DataseringPencakokan_pelaksanaanId_fkey" FOREIGN KEY ("pelaksanaanId") REFERENCES "PelaksanaanPendidikan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PengembanganDiri" ADD CONSTRAINT "PengembanganDiri_pelaksanaanId_fkey" FOREIGN KEY ("pelaksanaanId") REFERENCES "PelaksanaanPendidikan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PengembanganDiri" ADD CONSTRAINT "PengembanganDiri_prodiId_fkey" FOREIGN KEY ("prodiId") REFERENCES "Prodi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PengembanganDiri" ADD CONSTRAINT "PengembanganDiri_fakultasId_fkey" FOREIGN KEY ("fakultasId") REFERENCES "Fakultas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
