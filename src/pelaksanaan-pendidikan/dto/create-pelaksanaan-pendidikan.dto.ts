import { JabatanFungsional, JenisBahanPengajaran, JenisBimbingan, JenisDatasering, JenisKKNPKNPKL, KategoriKegiatan, Tingkat } from '@prisma/client';
import { file, z } from 'zod'

const fileSchema = z
  .any()
  .refine((file) => file && typeof file === 'object' && file.originalname?.endsWith('.pdf'), {
    message: 'File harus berupa PDF',
  });

export const pelaksanaanPendidikanBaseSchema = z.object({
  dosenId: z.coerce.number().positive({ message: 'ID Dosen diisi' }),
  semesterId: z.coerce.number().positive({ message: 'ID Semester wajib diisi' }),
  nilaiPak: z.coerce.number().positive({ message: 'Nilai Pak wajib diisi' }),
  filePath: z.string().min(6),
});

export const perkuliahanSchema = z.object({
  kategori: z.literal(KategoriKegiatan.PERKULIAHAN),
  mataKuliah: z.string().min(1, { message: 'Mata Kuliah diisi' }),
  sks: z.coerce.number().positive({ message: 'SKS wajib diisi dan harus > 0' }),
  jumlahKelas: z.coerce.number().positive({ message: 'Jumlah kelas harus > 0' }),
  prodiId: z.coerce.number().positive({ message: 'ID Prodi wajib diisi' }),
  fakultasId: z.coerce.number().positive({ message: 'ID Fakultas wajib diisi' }),
});

export const bimbinganSeminarSchema = z.object({
  kategori: z.literal(KategoriKegiatan.BIMBINGAN_SEMINAR),
  prodiId: z.coerce.number().positive({ message: 'ID Prodi wajib diisi' }),
  fakultasId: z.coerce.number().positive({ message: 'ID Fakultas wajib diisi' }),
  jumlahMhs: z.coerce.number().positive({ message: 'Jumlah mahasiswa wajib diisi' })
});

export const bimbinganKknPknPklSchema = z.object({
  kategori: z.literal(KategoriKegiatan.BIMBINGAN_KKN_PKN_PKL),
  jenis: z.enum(JenisKKNPKNPKL),
  prodiId: z.coerce.number().positive({ message: 'ID Prodi wajib diisi' }),
  fakultasId: z.coerce.number().positive({ message: 'ID Fakultas wajib diisi' }),
  jumlahMhs: z.coerce.number().positive({ message: 'Jumlah mahasiswa wajib diisi' })
});

export const bimbinganTugasAkhirSchema = z.object({
  kategori: z.literal(KategoriKegiatan.BIMBINGAN_TUGAS_AKHIR),
  jenis: z.enum(['Disertasi', 'Tesis', 'Skripsi', 'Laporan Studi Akhir']),
  peran: z.enum(['Pembimbing Utama', 'Pembimbing Pendamping']),
  jumlahMhs: z.coerce.number().positive({ message: 'Jumlah mahasiswa wajib diisi' })
});

export const pengujiUjianAkhirSchema = z.object({
  kategori: z.literal(KategoriKegiatan.PENGUJI_UJIAN_AKHIR),
  peran: z.enum(['Ketua Penguji', 'Anggota Penguji']),
  jumlahMhs: z.coerce.number().positive({ message: 'Jumlah mahasiswa wajib diisi' })
});

export const pembinaKegiatanMhsSchema = z.object({
  kategori: z.literal(KategoriKegiatan.PEMBINA_KEGIATAN_MHS),
  namaKegiatan: z.string().min(1, { message: 'Nama Kegiatan wajib diisi' }),
  luaran: z.string().min(1, { message: 'Luaran wajib diisi' }),
});

export const pengembanganProgramKuliahSchema = z.object({
  kategori: z.literal(KategoriKegiatan.PENGEMBANGAN_PROGRAM),
  mataKuliah: z.string().min(1, { message: 'Mata Kuliah wajib diisi' }),
  programPengembangan: z.string().min(1, { message: 'Program Pengembangan wajib diisi' }),
  prodiId: z.coerce.number().positive({ message: 'ID Prodi wajib diisi' }),
  fakultasId: z.coerce.number().positive({ message: 'ID Fakultas wajib diisi' })
});

export const bahanPengajaranSchema = z.discriminatedUnion('jenis', [
  z.object({
    kategori: z.literal(KategoriKegiatan.BAHAN_PENGAJARAN),
    jenis: z.literal(JenisBahanPengajaran.BUKU_AJAR),
    judul: z.string().min(1, { message: "Judul buku ajar wajib diisi." }),
    tglTerbit: z.coerce.date({ message: "Tanggal terbit wajib diisi." }),
    penerbit: z.string().min(1, { message: "Penerbit wajib diisi." }),
    jumlahHalaman: z.coerce.number().int().positive({ message: "Jumlah halaman harus angka positif." }),
    isbn: z.string().optional(),
  }),
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
    ]),
    judul: z.string().min(1, { message: "Judul produk wajib diisi." }),
    jumlahHalaman: z.coerce.number().int().positive({ message: "Jumlah halaman harus angka positif." }),
    mataKuliah: z.string().min(1, { message: "Mata kuliah wajib diisi." }),
    prodiId: z.coerce.number().int().positive({ message: "Prodi wajib dipilih." }),
    fakultasId: z.coerce.number().int().positive({ message: "Fakultas wajib dipilih." }),
  }),
]);

export const orasiIlmiahSchema = z.object({
  kategori: z.literal(KategoriKegiatan.ORASI_ILMIAH),
  namaKegiatan: z.string().min(1, { message: 'Nama Kegiatan wajib diisi' }),
  deskripsi: z.string().optional(),
  tingkat: z.enum(Tingkat),
  penyelenggara: z.string().min(1, { message: 'Penyelenggara wajib diisi' }),
  tgl: z.coerce.date({ message: 'Tanggal wajib diisi' }),
});

export const jabatanStrukturalSchema = z.object({
  kategori: z.literal(KategoriKegiatan.JABATAN_STRUKTURAL),
  namaJabatan: z.enum([
    'Rektor', 'Wakil Rektor', 'Ketua Sekolah', 'Pembantu Ketua Sekolah',
    'Direktur Akademi', 'Pembantu Direktur', 'Sekretaris Jurusan',
  ]),

  prodiId: z.coerce.number().int().positive({ message: "Prodi wajib dipilih." }),
  fakultasId: z.coerce.number().int().positive({ message: "Fakultas wajib dipilih." }),
  afiliasi: z.string().min(1, { message: "Afiliasi wajib diisi." }),
});

export const bimbingDosenSchema = z.object({
  kategori: z.literal(KategoriKegiatan.BIMBING_DOSEN),
  prodiId: z.coerce.number().int().positive({ message: "Program Studi wajib dipilih." }),
  tglMulai: z.coerce.date({ message: "Tanggal mulai wajib diisi." }),
  tglSelesai: z.coerce.date({ message: "Tanggal selesai wajib diisi." }),
  JenisBimbingan: z.enum(JenisBimbingan),
  jabatan: z.enum(JabatanFungsional),
  bidangAhli: z.string().min(1, { message: "Bidang ahli wajib diisi." }),
  deskripsi: z.string().optional(),
  jumlahDsn: z.coerce.number().int().positive({ message: "Jumlah dosen wajib diisi." }),
});

export const dataseringPencakokanSchema = z.object({
  kategori: z.literal(KategoriKegiatan.DATA_SERING_PENCAKOKAN),
  perguruanTinggi: z.string().min(1, { message: "Perguruan tinggi wajib diisi." }),
  jenis: z.enum(JenisDatasering),
  tglMulai: z.coerce.date({ message: "Tanggal mulai wajib diisi." }),
  tglSelesai: z.coerce.date({ message: "Tanggal selesai wajib diisi." }),
  bidangAhli: z.string().min(1, { message: "Bidang ahli wajib diisi." }),
});

export const pengembanganDiriSchema = z.object({
  kategori: z.literal(KategoriKegiatan.PENGEMBANGAN_DIRI),
  namaKegiatan: z.string().min(1, { message: "Nama kegiatan wajib diisi." }),
  deskripsi: z.string().optional(),
  tglMulai: z.coerce.date({ message: "Tanggal mulai wajib diisi." }),
  tglSelesai: z.coerce.date({ message: "Tanggal selesai wajib diisi." }),
  penyelenggara: z.string().min(1, { message: 'Penyelenggara wajib diisi' }),
  tempat: z.string().min(1, { message: 'Tempat wajib diisi' }),
  lamaJam: z.coerce.number().int().positive({ message: "Lama jam wajib diisi" }),
  prodiId: z.coerce.number().int().positive({ message: "Prodi wajib dipilih." }),
  fakultasId: z.coerce.number().int().positive({ message: "Fakultas wajib dipilih." }),
});

export const createPelaksanaanPendidikanDtoSchema = z.discriminatedUnion('kategori', [
  perkuliahanSchema,
  bimbinganSeminarSchema,
  bimbinganKknPknPklSchema,
  bimbinganTugasAkhirSchema,
  pengujiUjianAkhirSchema,
  pembinaKegiatanMhsSchema,
  pengembanganProgramKuliahSchema,
  bahanPengajaranSchema,
  orasiIlmiahSchema,
  jabatanStrukturalSchema,
  bimbingDosenSchema,
  dataseringPencakokanSchema,
  pengembanganDiriSchema
]);

export type CreatePelaksanaanPendidikanDto = z.infer<typeof createPelaksanaanPendidikanDtoSchema>;

export const fullPelaksanaanPendidikanSchema = z.intersection(
  pelaksanaanPendidikanBaseSchema,
  createPelaksanaanPendidikanDtoSchema
);

export type CreatePelaksanaanPendidikanFullDto = z.infer<typeof fullPelaksanaanPendidikanSchema>;
