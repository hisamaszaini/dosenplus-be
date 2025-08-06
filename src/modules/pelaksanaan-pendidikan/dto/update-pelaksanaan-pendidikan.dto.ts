import { JabatanFungsional, JenisBahanPengajaran, JenisBimbingan, JenisDatasering, JenisKKNPKNPKL, KategoriKegiatan, Tingkat } from '@prisma/client';
import { z } from 'zod';

export const pelaksanaanPendidikanUpdateBaseSchema = z.object({
  id: z.coerce.number().positive({ message: 'ID wajib diisi untuk update' }),
  dosenId: z.coerce.number().positive({ message: 'ID Dosen diisi' }),
  semesterId: z.coerce.number().positive({ message: 'ID Semester wajib diisi' }),
  nilaiPak: z.coerce.number().positive({ message: 'Nilai Pak wajib diisi' }),
  filePath: z.string().min(6).optional(), // Optional untuk update
});

export const updatePerkuliahanSchema = z.object({
  kategori: z.literal(KategoriKegiatan.PERKULIAHAN),
  mataKuliah: z.string().min(1, { message: 'Mata Kuliah diisi' }).optional(),
  sks: z.coerce.number().positive({ message: 'SKS wajib diisi dan harus > 0' }).optional(),
  jumlahKelas: z.coerce.number().positive({ message: 'Jumlah kelas harus > 0' }).optional(),
  prodiId: z.coerce.number().positive({ message: 'ID Prodi wajib diisi' }).optional(),
  fakultasId: z.coerce.number().positive({ message: 'ID Fakultas wajib diisi' }).optional(),
}).merge(pelaksanaanPendidikanUpdateBaseSchema);

export const updateBimbinganSeminarSchema = z.object({
  kategori: z.literal(KategoriKegiatan.BIMBINGAN_SEMINAR),
  prodiId: z.coerce.number().positive({ message: 'ID Prodi wajib diisi' }).optional(),
  fakultasId: z.coerce.number().positive({ message: 'ID Fakultas wajib diisi' }).optional(),
  jumlahMhs: z.coerce.number().positive({ message: 'Jumlah mahasiswa wajib diisi' }).optional()
}).merge(pelaksanaanPendidikanUpdateBaseSchema);

export const updateBimbinganKknPknPklSchema = z.object({
  kategori: z.literal(KategoriKegiatan.BIMBINGAN_KKN_PKN_PKL),
  jenis: z.enum(Object.values(JenisKKNPKNPKL) as [string, ...string[]]).optional(),
  prodiId: z.coerce.number().positive({ message: 'ID Prodi wajib diisi' }).optional(),
  fakultasId: z.coerce.number().positive({ message: 'ID Fakultas wajib diisi' }).optional(),
  jumlahMhs: z.coerce.number().positive({ message: 'Jumlah mahasiswa wajib diisi' }).optional()
}).merge(pelaksanaanPendidikanUpdateBaseSchema);

export const updateBimbinganTugasAkhirSchema = z.object({
  kategori: z.literal(KategoriKegiatan.BIMBINGAN_TUGAS_AKHIR),
  jenis: z.enum(['Disertasi', 'Tesis', 'Skripsi', 'Laporan Studi Akhir']).optional(),
  peran: z.enum(['Pembimbing Utama', 'Pembimbing Pendamping']).optional(),
  jumlahMhs: z.coerce.number().positive({ message: 'Jumlah mahasiswa wajib diisi' }).optional()
}).merge(pelaksanaanPendidikanUpdateBaseSchema);

export const updatePengujiUjianAkhirSchema = z.object({
  kategori: z.literal(KategoriKegiatan.PENGUJI_UJIAN_AKHIR),
  peran: z.enum(['Ketua Penguji', 'Anggota Penguji']).optional(),
  jumlahMhs: z.coerce.number().positive({ message: 'Jumlah mahasiswa wajib diisi' }).optional()
}).merge(pelaksanaanPendidikanUpdateBaseSchema);

export const updatePembinaKegiatanMhsSchema = z.object({
  kategori: z.literal(KategoriKegiatan.PEMBINA_KEGIATAN_MHS),
  namaKegiatan: z.string().min(1, { message: 'Nama Kegiatan wajib diisi' }).optional(),
  luaran: z.string().min(1, { message: 'Luaran wajib diisi' }).optional(),
}).merge(pelaksanaanPendidikanUpdateBaseSchema);

export const updatePengembanganProgramKuliahSchema = z.object({
  kategori: z.literal(KategoriKegiatan.PENGEMBANGAN_PROGRAM),
  mataKuliah: z.string().min(1, { message: 'Mata Kuliah wajib diisi' }).optional(),
  programPengembangan: z.string().min(1, { message: 'Program Pengembangan wajib diisi' }).optional(),
  prodiId: z.coerce.number().positive({ message: 'ID Prodi wajib diisi' }).optional(),
  fakultasId: z.coerce.number().positive({ message: 'ID Fakultas wajib diisi' }).optional()
}).merge(pelaksanaanPendidikanUpdateBaseSchema);

export const updateBahanPengajaranSchema = z.discriminatedUnion('jenis', [
  z.object({
    kategori: z.literal(KategoriKegiatan.BAHAN_PENGAJARAN),
    jenis: z.literal(JenisBahanPengajaran.BUKU_AJAR),
    judul: z.string().min(1, { message: "Judul buku ajar wajib diisi." }).optional(),
    tglTerbit: z.coerce.date({ message: "Tanggal terbit wajib diisi." }).optional(),
    penerbit: z.string().min(1, { message: "Penerbit wajib diisi." }).optional(),
    jumlahHalaman: z.coerce.number().int().positive({ message: "Jumlah halaman harus angka positif." }).optional(),
    isbn: z.string().optional(),
  }).merge(pelaksanaanPendidikanUpdateBaseSchema),
  z.object({
    kategori: z.literal(KategoriKegiatan.BAHAN_PENGAJARAN),
    jenis: z.literal(JenisBahanPengajaran.PRODUK_LAIN),
    jenisProduk: z.enum([
      'Diktat',
      'Modul',
      'Petunjuk praktikum',
      'Model',
      'Alat bantu',
      'Audio visual',
      'Naskah tutorial',
      'Job sheet praktikum',
    ]).optional(),
    judul: z.string().min(1, { message: "Judul produk wajib diisi." }).optional(),
    jumlahHalaman: z.coerce.number().int().positive({ message: "Jumlah halaman harus angka positif." }).optional(),
    mataKuliah: z.string().min(1, { message: "Mata kuliah wajib diisi." }).optional(),
    prodiId: z.coerce.number().int().positive({ message: "Prodi wajib dipilih." }).optional(),
    fakultasId: z.coerce.number().int().positive({ message: "Fakultas wajib dipilih." }).optional(),
  }).merge(pelaksanaanPendidikanUpdateBaseSchema),
]);

export const updateOrasiIlmiahSchema = z.object({
  kategori: z.literal(KategoriKegiatan.ORASI_ILMIAH),
  namaKegiatan: z.string().min(1, { message: 'Nama Kegiatan wajib diisi' }).optional(),
  deskripsi: z.string().optional(),
  tingkat: z.enum(Object.values(Tingkat) as [string, ...string[]]).optional(),
  penyelenggara: z.string().min(1, { message: 'Penyelenggara wajib diisi' }).optional(),
  tgl: z.coerce.date({ message: 'Tanggal wajib diisi' }).optional(),
}).merge(pelaksanaanPendidikanUpdateBaseSchema);

export const updateJabatanStrukturalSchema = z.object({
  kategori: z.literal(KategoriKegiatan.JABATAN_STRUKTURAL),
  namaJabatan: z.enum([
    'Rektor', 'Wakil Rektor', 'Ketua Sekolah', 'Pembantu Ketua Sekolah',
    'Direktur Akademi', 'Pembantu Direktur', 'Sekretaris Jurusan',
  ]).optional(),
  prodiId: z.coerce.number().int().positive({ message: "Prodi wajib dipilih." }).optional(),
  fakultasId: z.coerce.number().int().positive({ message: "Fakultas wajib dipilih." }).optional(),
  afiliasi: z.string().min(1, { message: "Afiliasi wajib diisi." }).optional(),
}).merge(pelaksanaanPendidikanUpdateBaseSchema);

export const updateBimbingDosenSchema = z.object({
  kategori: z.literal(KategoriKegiatan.BIMBING_DOSEN),
  prodiId: z.coerce.number().int().positive({ message: "Program Studi wajib dipilih." }).optional(),
  tglMulai: z.coerce.date({ message: "Tanggal mulai wajib diisi." }).optional(),
  tglSelesai: z.coerce.date({ message: "Tanggal selesai wajib diisi." }).optional(),
  JenisBimbingan: z.enum(Object.values(JenisBimbingan) as [string, ...string[]]).optional(),
  jabatan: z.enum(Object.values(JabatanFungsional) as [string, ...string[]]).optional(),
  bidangAhli: z.string().min(1, { message: "Bidang ahli wajib diisi." }).optional(),
  deskripsi: z.string().optional(),
  jumlahDsn: z.coerce.number().int().positive({ message: "Jumlah dosen wajib diisi." }).optional(),
}).merge(pelaksanaanPendidikanUpdateBaseSchema);

export const updateDataseringPencakokanSchema = z.object({
  kategori: z.literal(KategoriKegiatan.DATA_SERING_PENCAKOKAN),
  perguruanTinggi: z.string().min(1, { message: "Perguruan tinggi wajib diisi." }).optional(),
  jenis: z.enum(Object.values(JenisDatasering) as [string, ...string[]]).optional(),
  tglMulai: z.coerce.date({ message: "Tanggal mulai wajib diisi." }).optional(),
  tglSelesai: z.coerce.date({ message: "Tanggal selesai wajib diisi." }).optional(),
  bidangAhli: z.string().min(1, { message: "Bidang ahli wajib diisi." }).optional(),
}).merge(pelaksanaanPendidikanUpdateBaseSchema);

export const updatePengembanganDiriSchema = z.object({
  kategori: z.literal(KategoriKegiatan.PENGEMBANGAN_DIRI),
  namaKegiatan: z.string().min(1, { message: "Nama kegiatan wajib diisi." }).optional(),
  deskripsi: z.string().optional(),
  tglMulai: z.coerce.date({ message: "Tanggal mulai wajib diisi." }).optional(),
  tglSelesai: z.coerce.date({ message: "Tanggal selesai wajib diisi." }).optional(),
  penyelenggara: z.string().min(1, { message: 'Penyelenggara wajib diisi' }).optional(),
  tempat: z.string().min(1, { message: 'Tempat wajib diisi' }).optional(),
  lamaJam: z.coerce.number().int().positive({ message: "Lama jam wajib diisi" }).optional(),
  prodiId: z.coerce.number().int().positive({ message: "Prodi wajib dipilih." }).optional(),
  fakultasId: z.coerce.number().int().positive({ message: "Fakultas wajib dipilih." }).optional(),
}).merge(pelaksanaanPendidikanUpdateBaseSchema);

export const updatePelaksanaanPendidikanDtoSchema = z.discriminatedUnion('kategori', [
  updatePerkuliahanSchema,
  updateBimbinganSeminarSchema,
  updateBimbinganKknPknPklSchema,
  updateBimbinganTugasAkhirSchema,
  updatePengujiUjianAkhirSchema,
  updatePembinaKegiatanMhsSchema,
  updatePengembanganProgramKuliahSchema,
  updateBahanPengajaranSchema,
  updateOrasiIlmiahSchema,
  updateJabatanStrukturalSchema,
  updateBimbingDosenSchema,
  updateDataseringPencakokanSchema,
  updatePengembanganDiriSchema
]);

export type UpdatePelaksanaanPendidikanDto = z.infer<typeof updatePelaksanaanPendidikanDtoSchema>;

export const fullUpdatePelaksanaanSchema = z.intersection(
  pelaksanaanPendidikanUpdateBaseSchema,
  updatePelaksanaanPendidikanDtoSchema
);