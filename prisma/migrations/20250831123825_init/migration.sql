-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "TypeUserRole" AS ENUM ('ADMIN', 'DOSEN', 'VALIDATOR');

-- CreateEnum
CREATE TYPE "StatusValidasi" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "Jenjang" AS ENUM ('S1', 'S2', 'S3');

-- CreateEnum
CREATE TYPE "KategoriPendidikan" AS ENUM ('FORMAL', 'DIKLAT');

-- CreateEnum
CREATE TYPE "NamaSemester" AS ENUM ('GENAP', 'GANJIL');

-- CreateEnum
CREATE TYPE "SemesterStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "KategoriPelaksanaanPendidikan" AS ENUM ('PERKULIAHAN', 'MEMBIMBING_SEMINAR', 'MEMBIMBING_KKN_PKN_PKL', 'MEMBIMBING_TUGAS_AKHIR', 'PENGUJI_UJIAN_AKHIR', 'MEMBINA_KEGIATAN_MHS', 'MENGEMBANGKAN_PROGRAM', 'BAHAN_PENGAJARAN', 'ORASI_ILMIAH', 'MENDUDUKI_JABATAN', 'MEMBIMBING_DOSEN', 'DATASERING_PENCANGKOKAN', 'PENGEMBANGAN_DIRI');

-- CreateEnum
CREATE TYPE "JenisKategoriPelaksanaan" AS ENUM ('ASISTEN_AHLI', 'LEKTOR', 'LEKTOR_KEPALA', 'GURU_BESAR', 'KKN', 'PKL', 'PKN', 'PEMBIMBING_UTAMA', 'PEMBIMBING_PENDAMPING', 'KETUA_PENGUJI', 'ANGGOTA_PENGUJI', 'BUKU_AJAR', 'DIKTAT', 'MODUL', 'PETUNJUK_PRAKTIKUM', 'ALAT_BANTU', 'AUDIO_VISUAL', 'NASKAH_TUTORIAL', 'JOBSHEET', 'REKTOR', 'WAKIL', 'KETUA_SEKOLAH', 'PEMBANTU_KETUA_SEKOLAH', 'DIREKTUR_AKADEMI', 'PEMBANTU_DIREKTUR', 'SEKRETARIS_JURUSAN', 'PEMBIMBING_PENCANGKOKAN', 'PEMBIMBING_REGULER', 'DATASERING', 'PENCANGKOKAN', 'LEBIH_DARI_960', 'ANTARA_641_960', 'ANTARA_481_640', 'ANTARA_161_480', 'ANTARA_81_160', 'ANTARA_30_80', 'ANTARA_10_30');

-- CreateEnum
CREATE TYPE "subJenisPelaksanaan" AS ENUM ('DISERTASI', 'TESIS', 'SKRIPSI', 'LAPORAN_AKHIR_STUDI');

-- CreateEnum
CREATE TYPE "KategoriPenelitian" AS ENUM ('KARYA_ILMIAH', 'PENELITIAN_DIDEMINASI', 'PENELITIAN_TIDAK_DIPUBLIKASI', 'TERJEMAHAN_BUKU', 'SUNTINGAN_BUKU', 'KARYA_BERHAKI', 'KARYA_NON_HAKI', 'SENI_NON_HAKI');

-- CreateEnum
CREATE TYPE "JenisKategoriPenelitian" AS ENUM ('BUKU', 'BOOK_CHAPTER', 'JURNAL', 'PROSIDING_DIPUBLIKASIKAN', 'SEMINAR_TANPA_PROSIDING', 'PROSIDING_TANPA_SEMINAR', 'KORAN_MAJALAH', 'PATEN_INTERNASIONAL_INDUSTRI', 'PATEN_INTERNASIONAL', 'PATEN_NASIONAL_INDUSTRI', 'PATEN_NASIONAL', 'PATEN_SEDERHANA', 'CIPTAAN_DESAIN_GEOGRAFIS', 'CIPTAAN_BAHAN_PENGAJAR', 'INTERNASIONAL', 'NASIONAL', 'LOKAL');

-- CreateEnum
CREATE TYPE "SubJenisPenelitian" AS ENUM ('BUKU_REFERENSI', 'MONOGRAF', 'INTERNASIONAL', 'NASIONAL', 'JURNAL_INTERNASIONAL_BEREPUTASI', 'JURNAL_INTERNASIONAL_INDEKS_BEREPUTASI', 'JURNAL_INTERNASIONAL', 'JURNAL_INTERNASIONAL_TIDAK_TERINDEKS', 'JURNAL_NASIONAL_DIKTI', 'JURNAL_NASIONAL_TERAKREDITASI_P1_P2', 'JURNAL_NASIONAL_BERBAHASA_PBB_INDEKS', 'JURNAL_NASIONAL_TERAKREDITASI_P3_P4', 'JURNAL_NASIONAL', 'JURNAL_PBB_TIDAK_MEMENUHI', 'PROSIDING_INTERNASIONAL_TERINDEKS', 'PROSIDING_INTERNASIONAL_TIDAK_TERINDEKS', 'PROSIDING_NASIONAL_TIDAK_TERINDEKS');

-- CreateEnum
CREATE TYPE "KategoriPengabdian" AS ENUM ('JABATAN_PIMPINAN_LEMBAGA_PEMERINTAHAN', 'PENGEMBANGAN_HASIL_PENDIDIKAN_PENELITIAN', 'PENYULUHAN_MASYARAKAT_SEMESTER', 'PENYULUHAN_MASYARAKAT_KURANG_SEMESTER', 'PELAYANAN_MASYARAKAT', 'KARYA_TIDAK_DIPUBLIKASIKAN', 'KARYA_DIPUBLIKASIKAN', 'PENGELOLAAN_JURNAL');

-- CreateEnum
CREATE TYPE "JenisKegiatanPengabdian" AS ENUM ('BIDANG_KEAHLIAN', 'PENUGASAN_PT', 'FUNGSI_JABATAN');

-- CreateEnum
CREATE TYPE "TingkatPengabdian" AS ENUM ('INTERNASIONAL', 'NASIONAL', 'LOKAL', 'INSENDENTAL', 'JURNAL_INTERNASIONAL', 'JURNAL_NASIONAL');

-- CreateEnum
CREATE TYPE "KategoriPenunjang" AS ENUM ('ANGGOTA_PANITIA_PT', 'ANGGOTA_PANITIA_LEMBAGA_PEMERINTAH', 'ANGGOTA_ORGANISASI_PROFESI_INTERNASIONAL', 'ANGGOTA_ORGANISASI_PROFESI_NASIONAL', 'WAKIL_PT_PANITIA_ANTAR_LEMBAGA', 'DELEGASI_NASIONAL_PERTEMUAN_INTERNASIONAL', 'AKTIF_PERTEMUAN_ILMIAH_INT_NAS_REG', 'AKTIF_PERTEMUAN_ILMIAH_INTERNAL_PT', 'TANDA_JASA_PENGHARGAAN', 'MENULIS_BUKU_SLTA_NASIONAL', 'PRESTASI_OLAHRAGA_HUMANIORA', 'TIM_PENILAI_JABATAN_AKADEMIK');

-- CreateEnum
CREATE TYPE "JenisKegiatanPenunjang" AS ENUM ('KETUA_WAKIL_KEPALA_ANGGOTA_TAHUNAN', 'ANGGOTA_TAHUNAN', 'KETUA_WAKIL_PANITIA_PUSAT', 'ANGGOTA_PANITIA_PUSAT', 'KETUA_WAKIL_PANITIA_DAERAH', 'ANGGOTA_PANITIA_DAERAH', 'KETUA', 'ANGGOTA', 'PENGURUS', 'ANGGOTA_ATAS_PERMINTAAN', 'KETUA_DELEGASI', 'ANGGOTA_DELEGASI', 'SATYA_LENCANA_30_TAHUN', 'SATYA_LENCANA_20_TAHUN', 'SATYA_LENCANA_10_TAHUN', 'PENGHARGAAN_INTERNASIONAL', 'PENGHARGAAN_NASIONAL', 'PENGHARGAAN_DAERAH', 'BUKU_SMTA', 'BUKU_SMTP', 'BUKU_SD', 'PIAGAM_MEDALI_INTERNASIONAL', 'PIAGAM_MEDALI_NASIONAL', 'PIAGAM_MEDALI_DAERAH');

-- CreateTable
CREATE TABLE "Setting" (
    "id" SERIAL NOT NULL,
    "namaRektor" TEXT NOT NULL,
    "nikRektor" TEXT NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "externalId" INTEGER,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "fotoPath" TEXT,
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
    "name" "TypeUserRole" NOT NULL,

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
    "nik" TEXT,
    "jenis_kelamin" TEXT NOT NULL,
    "no_hp" TEXT,

    CONSTRAINT "Validator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fakultas" (
    "id" SERIAL NOT NULL,
    "externalId" INTEGER,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Fakultas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prodi" (
    "id" SERIAL NOT NULL,
    "externalId" INTEGER,
    "kode" TEXT NOT NULL,
    "kodeFp" TEXT,
    "nama" TEXT NOT NULL,
    "jenjang" TEXT NOT NULL,
    "fakultasId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prodi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dosen" (
    "id" INTEGER NOT NULL,
    "externalId" INTEGER,
    "nama" TEXT NOT NULL,
    "nik" TEXT,
    "nuptk" TEXT,
    "jenis_kelamin" TEXT NOT NULL,
    "no_hp" TEXT,
    "prodiId" INTEGER,
    "fakultasId" INTEGER,
    "jabatan" TEXT NOT NULL,
    "tmt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

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
CREATE TABLE "PendingUpdateDosen" (
    "id" SERIAL NOT NULL,
    "dosenId" INTEGER NOT NULL,
    "nama" TEXT NOT NULL,
    "nik" TEXT,
    "nuptk" TEXT,
    "jenis_kelamin" TEXT NOT NULL,
    "no_hp" TEXT,
    "prodiId" INTEGER,
    "fakultasId" INTEGER,
    "jabatan" TEXT,
    "tmt" TIMESTAMP(3),
    "fotoPath" TEXT,
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

    CONSTRAINT "PendingUpdateDosen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pendidikan" (
    "id" SERIAL NOT NULL,
    "externalId" INTEGER,
    "dosenId" INTEGER NOT NULL,
    "kategori" "KategoriPendidikan" NOT NULL,
    "jenjang" "Jenjang",
    "nilaiPak" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "filePath" TEXT NOT NULL,
    "statusValidasi" "StatusValidasi" NOT NULL DEFAULT 'PENDING',
    "reviewerId" INTEGER,
    "catatan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pendidikan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PendidikanFormal" (
    "id" SERIAL NOT NULL,
    "pendidikanId" INTEGER NOT NULL,
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
    "externalId" INTEGER,
    "kode" INTEGER NOT NULL,
    "nama" TEXT NOT NULL,
    "tipe" "NamaSemester" NOT NULL,
    "tahunMulai" INTEGER NOT NULL,
    "tahunSelesai" INTEGER NOT NULL,
    "status" "SemesterStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Semester_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PelaksanaanPendidikan" (
    "id" SERIAL NOT NULL,
    "externalId" INTEGER,
    "dosenId" INTEGER NOT NULL,
    "semesterId" INTEGER,
    "kategori" "KategoriPelaksanaanPendidikan" NOT NULL,
    "jenisKategori" "JenisKategoriPelaksanaan",
    "subJenis" "subJenisPelaksanaan",
    "nilaiPak" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "filePath" TEXT NOT NULL,
    "statusValidasi" "StatusValidasi" NOT NULL DEFAULT 'PENDING',
    "reviewerId" INTEGER,
    "catatan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "fakultasId" INTEGER,
    "prodiId" INTEGER,

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
    "prodiId" INTEGER,
    "fakultasId" INTEGER,

    CONSTRAINT "Perkuliahan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BimbingPengujiMhs" (
    "id" SERIAL NOT NULL,
    "pelaksanaanId" INTEGER NOT NULL,
    "prodiId" INTEGER,
    "fakultasId" INTEGER,
    "jumlahMhs" INTEGER NOT NULL,

    CONSTRAINT "BimbingPengujiMhs_pkey" PRIMARY KEY ("id")
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
    "prodiId" INTEGER,
    "fakultasId" INTEGER,
    "mataKuliah" TEXT NOT NULL,

    CONSTRAINT "PengembanganProgramKuliah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BahanPengajaran" (
    "id" SERIAL NOT NULL,
    "pelaksanaanId" INTEGER NOT NULL,
    "judul" TEXT,
    "jumlahHalaman" INTEGER,
    "mataKuliah" TEXT,
    "penerbit" TEXT,
    "tglTerbit" TIMESTAMP(3),
    "isbn" TEXT,
    "prodiId" INTEGER,
    "fakultasId" INTEGER,

    CONSTRAINT "BahanPengajaran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrasiIlmiah" (
    "id" SERIAL NOT NULL,
    "pelaksanaanId" INTEGER NOT NULL,
    "namaKegiatan" TEXT NOT NULL,
    "deskripsi" TEXT,
    "tingkat" TEXT NOT NULL,
    "penyelenggara" TEXT NOT NULL,
    "tgl" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrasiIlmiah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JabatanStruktural" (
    "id" SERIAL NOT NULL,
    "pelaksanaanId" INTEGER NOT NULL,
    "prodiId" INTEGER,
    "fakultasId" INTEGER,
    "afiliasi" TEXT NOT NULL,

    CONSTRAINT "JabatanStruktural_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BimbingDosen" (
    "id" SERIAL NOT NULL,
    "pelaksanaanId" INTEGER NOT NULL,
    "prodiId" INTEGER,
    "tglMulai" TIMESTAMP(3) NOT NULL,
    "tglSelesai" TIMESTAMP(3) NOT NULL,
    "jabatan" TEXT NOT NULL,
    "bidangAhli" TEXT NOT NULL,
    "deskripsi" TEXT,
    "jumlahDsn" INTEGER NOT NULL,

    CONSTRAINT "BimbingDosen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataseringPencangkokan" (
    "id" SERIAL NOT NULL,
    "pelaksanaanId" INTEGER NOT NULL,
    "perguruanTinggi" TEXT NOT NULL,
    "tglMulai" TIMESTAMP(3) NOT NULL,
    "tglSelesai" TIMESTAMP(3) NOT NULL,
    "bidangAhli" TEXT NOT NULL,

    CONSTRAINT "DataseringPencangkokan_pkey" PRIMARY KEY ("id")
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
    "prodiId" INTEGER,
    "fakultasId" INTEGER,

    CONSTRAINT "PengembanganDiri_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Penelitian" (
    "id" SERIAL NOT NULL,
    "externalId" INTEGER,
    "dosenId" INTEGER NOT NULL,
    "semesterId" INTEGER,
    "kategori" "KategoriPenelitian" NOT NULL,
    "jenisKategori" "JenisKategoriPenelitian",
    "subJenis" "SubJenisPenelitian",
    "judul" TEXT NOT NULL,
    "tglTerbit" TIMESTAMP(3),
    "nilaiPak" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "filePath" TEXT NOT NULL,
    "statusValidasi" "StatusValidasi" NOT NULL DEFAULT 'PENDING',
    "detail" JSONB NOT NULL DEFAULT '{}',
    "reviewerId" INTEGER,
    "catatan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Penelitian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pengabdian" (
    "id" SERIAL NOT NULL,
    "externalId" INTEGER,
    "dosenId" INTEGER NOT NULL,
    "semesterId" INTEGER,
    "kategori" "KategoriPengabdian" NOT NULL,
    "jenisKegiatan" "JenisKegiatanPengabdian",
    "tingkat" "TingkatPengabdian",
    "nilaiPak" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "filePath" TEXT NOT NULL,
    "statusValidasi" "StatusValidasi" NOT NULL DEFAULT 'PENDING',
    "detail" JSONB NOT NULL DEFAULT '{}',
    "reviewerId" INTEGER,
    "catatan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pengabdian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Penunjang" (
    "id" SERIAL NOT NULL,
    "externalId" INTEGER,
    "dosenId" INTEGER NOT NULL,
    "semesterId" INTEGER,
    "kategori" "KategoriPenunjang" NOT NULL,
    "jenisKegiatan" "JenisKegiatanPenunjang",
    "namaKegiatan" TEXT NOT NULL,
    "instansi" TEXT NOT NULL,
    "nilaiPak" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "filePath" TEXT NOT NULL,
    "statusValidasi" "StatusValidasi" NOT NULL DEFAULT 'PENDING',
    "detail" JSONB NOT NULL DEFAULT '{}',
    "reviewerId" INTEGER,
    "catatan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Penunjang_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_externalId_key" ON "User"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Validator_nik_key" ON "Validator"("nik");

-- CreateIndex
CREATE UNIQUE INDEX "Validator_no_hp_key" ON "Validator"("no_hp");

-- CreateIndex
CREATE UNIQUE INDEX "Fakultas_externalId_key" ON "Fakultas"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "Fakultas_kode_key" ON "Fakultas"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "Fakultas_nama_key" ON "Fakultas"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "Prodi_externalId_key" ON "Prodi"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "Prodi_kode_key" ON "Prodi"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "Prodi_kodeFp_key" ON "Prodi"("kodeFp");

-- CreateIndex
CREATE UNIQUE INDEX "Prodi_nama_key" ON "Prodi"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "Dosen_externalId_key" ON "Dosen"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "Dosen_nik_key" ON "Dosen"("nik");

-- CreateIndex
CREATE UNIQUE INDEX "Dosen_nuptk_key" ON "Dosen"("nuptk");

-- CreateIndex
CREATE UNIQUE INDEX "Dosen_no_hp_key" ON "Dosen"("no_hp");

-- CreateIndex
CREATE UNIQUE INDEX "PendingUpdateDosen_dosenId_key" ON "PendingUpdateDosen"("dosenId");

-- CreateIndex
CREATE UNIQUE INDEX "Pendidikan_externalId_key" ON "Pendidikan"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "PendidikanFormal_pendidikanId_key" ON "PendidikanFormal"("pendidikanId");

-- CreateIndex
CREATE UNIQUE INDEX "PendidikanDiklat_pendidikanId_key" ON "PendidikanDiklat"("pendidikanId");

-- CreateIndex
CREATE UNIQUE INDEX "Semester_externalId_key" ON "Semester"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "Semester_kode_key" ON "Semester"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "Semester_nama_key" ON "Semester"("nama");

-- CreateIndex
CREATE INDEX "Semester_tipe_idx" ON "Semester"("tipe");

-- CreateIndex
CREATE INDEX "Semester_tahunMulai_tahunSelesai_idx" ON "Semester"("tahunMulai", "tahunSelesai");

-- CreateIndex
CREATE UNIQUE INDEX "PelaksanaanPendidikan_externalId_key" ON "PelaksanaanPendidikan"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "Perkuliahan_pelaksanaanId_key" ON "Perkuliahan"("pelaksanaanId");

-- CreateIndex
CREATE UNIQUE INDEX "BimbingPengujiMhs_pelaksanaanId_key" ON "BimbingPengujiMhs"("pelaksanaanId");

-- CreateIndex
CREATE UNIQUE INDEX "PembinaKegiatanMhs_pelaksanaanId_key" ON "PembinaKegiatanMhs"("pelaksanaanId");

-- CreateIndex
CREATE UNIQUE INDEX "PengembanganProgramKuliah_pelaksanaanId_key" ON "PengembanganProgramKuliah"("pelaksanaanId");

-- CreateIndex
CREATE UNIQUE INDEX "BahanPengajaran_pelaksanaanId_key" ON "BahanPengajaran"("pelaksanaanId");

-- CreateIndex
CREATE UNIQUE INDEX "OrasiIlmiah_pelaksanaanId_key" ON "OrasiIlmiah"("pelaksanaanId");

-- CreateIndex
CREATE UNIQUE INDEX "JabatanStruktural_pelaksanaanId_key" ON "JabatanStruktural"("pelaksanaanId");

-- CreateIndex
CREATE UNIQUE INDEX "BimbingDosen_pelaksanaanId_key" ON "BimbingDosen"("pelaksanaanId");

-- CreateIndex
CREATE UNIQUE INDEX "DataseringPencangkokan_pelaksanaanId_key" ON "DataseringPencangkokan"("pelaksanaanId");

-- CreateIndex
CREATE UNIQUE INDEX "PengembanganDiri_pelaksanaanId_key" ON "PengembanganDiri"("pelaksanaanId");

-- CreateIndex
CREATE UNIQUE INDEX "Penelitian_externalId_key" ON "Penelitian"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "Pengabdian_externalId_key" ON "Pengabdian"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "Penunjang_externalId_key" ON "Penunjang"("externalId");

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Validator" ADD CONSTRAINT "Validator_id_fkey" FOREIGN KEY ("id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prodi" ADD CONSTRAINT "Prodi_fakultasId_fkey" FOREIGN KEY ("fakultasId") REFERENCES "Fakultas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dosen" ADD CONSTRAINT "Dosen_id_fkey" FOREIGN KEY ("id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dosen" ADD CONSTRAINT "Dosen_prodiId_fkey" FOREIGN KEY ("prodiId") REFERENCES "Prodi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dosen" ADD CONSTRAINT "Dosen_fakultasId_fkey" FOREIGN KEY ("fakultasId") REFERENCES "Fakultas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataKepegawaian" ADD CONSTRAINT "DataKepegawaian_id_fkey" FOREIGN KEY ("id") REFERENCES "Dosen"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PendingUpdateDosen" ADD CONSTRAINT "PendingUpdateDosen_dosenId_fkey" FOREIGN KEY ("dosenId") REFERENCES "Dosen"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PendingUpdateDosen" ADD CONSTRAINT "PendingUpdateDosen_prodiId_fkey" FOREIGN KEY ("prodiId") REFERENCES "Prodi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PendingUpdateDosen" ADD CONSTRAINT "PendingUpdateDosen_fakultasId_fkey" FOREIGN KEY ("fakultasId") REFERENCES "Fakultas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PendingUpdateDosen" ADD CONSTRAINT "PendingUpdateDosen_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pendidikan" ADD CONSTRAINT "Pendidikan_dosenId_fkey" FOREIGN KEY ("dosenId") REFERENCES "Dosen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pendidikan" ADD CONSTRAINT "Pendidikan_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PendidikanFormal" ADD CONSTRAINT "PendidikanFormal_pendidikanId_fkey" FOREIGN KEY ("pendidikanId") REFERENCES "Pendidikan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PendidikanDiklat" ADD CONSTRAINT "PendidikanDiklat_pendidikanId_fkey" FOREIGN KEY ("pendidikanId") REFERENCES "Pendidikan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PelaksanaanPendidikan" ADD CONSTRAINT "PelaksanaanPendidikan_dosenId_fkey" FOREIGN KEY ("dosenId") REFERENCES "Dosen"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PelaksanaanPendidikan" ADD CONSTRAINT "PelaksanaanPendidikan_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "Semester"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PelaksanaanPendidikan" ADD CONSTRAINT "PelaksanaanPendidikan_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PelaksanaanPendidikan" ADD CONSTRAINT "PelaksanaanPendidikan_fakultasId_fkey" FOREIGN KEY ("fakultasId") REFERENCES "Fakultas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PelaksanaanPendidikan" ADD CONSTRAINT "PelaksanaanPendidikan_prodiId_fkey" FOREIGN KEY ("prodiId") REFERENCES "Prodi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Perkuliahan" ADD CONSTRAINT "Perkuliahan_pelaksanaanId_fkey" FOREIGN KEY ("pelaksanaanId") REFERENCES "PelaksanaanPendidikan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Perkuliahan" ADD CONSTRAINT "Perkuliahan_prodiId_fkey" FOREIGN KEY ("prodiId") REFERENCES "Prodi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Perkuliahan" ADD CONSTRAINT "Perkuliahan_fakultasId_fkey" FOREIGN KEY ("fakultasId") REFERENCES "Fakultas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BimbingPengujiMhs" ADD CONSTRAINT "BimbingPengujiMhs_pelaksanaanId_fkey" FOREIGN KEY ("pelaksanaanId") REFERENCES "PelaksanaanPendidikan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BimbingPengujiMhs" ADD CONSTRAINT "BimbingPengujiMhs_prodiId_fkey" FOREIGN KEY ("prodiId") REFERENCES "Prodi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BimbingPengujiMhs" ADD CONSTRAINT "BimbingPengujiMhs_fakultasId_fkey" FOREIGN KEY ("fakultasId") REFERENCES "Fakultas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PembinaKegiatanMhs" ADD CONSTRAINT "PembinaKegiatanMhs_pelaksanaanId_fkey" FOREIGN KEY ("pelaksanaanId") REFERENCES "PelaksanaanPendidikan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PengembanganProgramKuliah" ADD CONSTRAINT "PengembanganProgramKuliah_pelaksanaanId_fkey" FOREIGN KEY ("pelaksanaanId") REFERENCES "PelaksanaanPendidikan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PengembanganProgramKuliah" ADD CONSTRAINT "PengembanganProgramKuliah_prodiId_fkey" FOREIGN KEY ("prodiId") REFERENCES "Prodi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PengembanganProgramKuliah" ADD CONSTRAINT "PengembanganProgramKuliah_fakultasId_fkey" FOREIGN KEY ("fakultasId") REFERENCES "Fakultas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BahanPengajaran" ADD CONSTRAINT "BahanPengajaran_prodiId_fkey" FOREIGN KEY ("prodiId") REFERENCES "Prodi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BahanPengajaran" ADD CONSTRAINT "BahanPengajaran_fakultasId_fkey" FOREIGN KEY ("fakultasId") REFERENCES "Fakultas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BahanPengajaran" ADD CONSTRAINT "BahanPengajaran_pelaksanaanId_fkey" FOREIGN KEY ("pelaksanaanId") REFERENCES "PelaksanaanPendidikan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrasiIlmiah" ADD CONSTRAINT "OrasiIlmiah_pelaksanaanId_fkey" FOREIGN KEY ("pelaksanaanId") REFERENCES "PelaksanaanPendidikan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JabatanStruktural" ADD CONSTRAINT "JabatanStruktural_pelaksanaanId_fkey" FOREIGN KEY ("pelaksanaanId") REFERENCES "PelaksanaanPendidikan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JabatanStruktural" ADD CONSTRAINT "JabatanStruktural_prodiId_fkey" FOREIGN KEY ("prodiId") REFERENCES "Prodi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JabatanStruktural" ADD CONSTRAINT "JabatanStruktural_fakultasId_fkey" FOREIGN KEY ("fakultasId") REFERENCES "Fakultas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BimbingDosen" ADD CONSTRAINT "BimbingDosen_pelaksanaanId_fkey" FOREIGN KEY ("pelaksanaanId") REFERENCES "PelaksanaanPendidikan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BimbingDosen" ADD CONSTRAINT "BimbingDosen_prodiId_fkey" FOREIGN KEY ("prodiId") REFERENCES "Prodi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataseringPencangkokan" ADD CONSTRAINT "DataseringPencangkokan_pelaksanaanId_fkey" FOREIGN KEY ("pelaksanaanId") REFERENCES "PelaksanaanPendidikan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PengembanganDiri" ADD CONSTRAINT "PengembanganDiri_pelaksanaanId_fkey" FOREIGN KEY ("pelaksanaanId") REFERENCES "PelaksanaanPendidikan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PengembanganDiri" ADD CONSTRAINT "PengembanganDiri_prodiId_fkey" FOREIGN KEY ("prodiId") REFERENCES "Prodi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PengembanganDiri" ADD CONSTRAINT "PengembanganDiri_fakultasId_fkey" FOREIGN KEY ("fakultasId") REFERENCES "Fakultas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Penelitian" ADD CONSTRAINT "Penelitian_dosenId_fkey" FOREIGN KEY ("dosenId") REFERENCES "Dosen"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Penelitian" ADD CONSTRAINT "Penelitian_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "Semester"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Penelitian" ADD CONSTRAINT "Penelitian_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pengabdian" ADD CONSTRAINT "Pengabdian_dosenId_fkey" FOREIGN KEY ("dosenId") REFERENCES "Dosen"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pengabdian" ADD CONSTRAINT "Pengabdian_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "Semester"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pengabdian" ADD CONSTRAINT "Pengabdian_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Penunjang" ADD CONSTRAINT "Penunjang_dosenId_fkey" FOREIGN KEY ("dosenId") REFERENCES "Dosen"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Penunjang" ADD CONSTRAINT "Penunjang_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "Semester"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Penunjang" ADD CONSTRAINT "Penunjang_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
