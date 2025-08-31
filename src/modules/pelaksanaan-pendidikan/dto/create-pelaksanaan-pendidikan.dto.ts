import { KategoriPelaksanaanPendidikan, StatusValidasi } from '@prisma/client';
import { z } from 'zod'
export const jenisJabatanFungsionalEnum = z.enum([
  "ASISTEN_AHLI",
  "LEKTOR",
  "LEKTOR_KEPALA",
  "GURU_BESAR",
]);

export const jenisKKNPKNPKLEnum = z.enum([
  'KKN',
  'PKN',
  'PKL',
])

export const jenisTingkatOrasiIlmiahEnum = z.enum([
  'LOKAL',
  'DAERAH',
  'NASIONAL',
  'INTERNASIONAL'
]);

export const jenisPengujiUjianAkhirEnum = z.enum([
  'KETUA_PENGUJI',
  'ANGGOTA_PENGUJI'
]);

export const jenisKategoriBahanPengajaranEnum = z.enum([
  'BUKU_AJAR',
  'DIKTAT',
  'MODUL',
  'PETUNJUK_PRAKTIKUM',
  'ALAT_BANTU',
  'AUDIO_VISUAL',
  'NASKAH_TUTORIAL',
  'JOBSHEET',
]);

export const jenisBimbinganTugasAkhirEnum = z.enum([
  'PEMBIMBING_UTAMA',
  'PEMBIMBING_PENDAMPING',
]);

export const jenisJabatanEnum = z.enum([
  "REKTOR",
  "WAKIL",
  "KETUA_SEKOLAH",
  "PEMBANTU_KETUA_SEKOLAH",
  "DIREKTUR_AKADEMI",
  "PEMBANTU_DIREKTUR",
  "SEKRETARIS_JURUSAN",
]);

export const jenisBimbinganDosenEnum = z.enum([
  "PEMBIMBING_PENCANGKOKAN",
  "PEMBIMBING_REGULER",
])

export const jenisDataseringEnum = z.enum([
  "DATASERING",
  "PENCANGKOKAN",
]);

export const jenisLamaPengembanganDiriEnum = z.enum([
  "LEBIH_DARI_960",
  "ANTARA_641_960",
  "ANTARA_481_640",
  "ANTARA_161_480",
  "ANTARA_81_160",
  "ANTARA_30_80",
  "ANTARA_10_30",
]);

export const subJenisTugasAkhir = z.enum([
  'DISERTASI',
  'TESIS',
  'SKRIPSI',
  'LAPORAN_AKHIR_STUDI',
]);


export const pelaksanaanPendidikanBaseSchema = z.object({
  dosenId: z.coerce.number().positive({ message: 'ID Dosen diisi' }).optional(),
  semesterId: z.coerce.number().positive({ message: 'ID Semester wajib diisi' }),
  // nilaiPak: z.coerce.number().positive({ message: 'Nilai Pak wajib diisi' }),
  // filePath: z.string().min(6),
});

export const perkuliahanSchema = z.object({
  kategori: z.literal(KategoriPelaksanaanPendidikan.PERKULIAHAN),
  mataKuliah: z.string().min(1, { message: 'Mata Kuliah diisi' }),
  sks: z.coerce.number().positive({ message: 'SKS wajib diisi dan harus > 0' }),
  jumlahKelas: z.coerce.number().positive({ message: 'Jumlah kelas harus > 0' }),
  prodiId: z.coerce.number().positive({ message: 'ID Prodi wajib diisi' }),
  fakultasId: z.coerce.number().positive({ message: 'ID Fakultas wajib diisi' }),
  totalSks: z.coerce.number().positive({ message: 'Total SKS harus lebih besar dari 0' }).optional(),
});

export const bimbinganSeminarSchema = z.object({
  kategori: z.literal(KategoriPelaksanaanPendidikan.MEMBIMBING_SEMINAR),
  prodiId: z.coerce.number().positive({ message: 'ID Prodi wajib diisi' }),
  fakultasId: z.coerce.number().positive({ message: 'ID Fakultas wajib diisi' }),
  jumlahMhs: z.coerce.number().positive({ message: 'Jumlah mahasiswa wajib diisi' })
});

export const bimbinganKknPknPklSchema = z.object({
  kategori: z.literal(KategoriPelaksanaanPendidikan.MEMBIMBING_KKN_PKN_PKL),
  jenisKategori: jenisKKNPKNPKLEnum,
  prodiId: z.coerce.number().positive({ message: 'ID Prodi wajib diisi' }),
  fakultasId: z.coerce.number().positive({ message: 'ID Fakultas wajib diisi' }),
  jumlahMhs: z.coerce.number().positive({ message: 'Jumlah mahasiswa wajib diisi' })
});

export const bimbinganTugasAkhirSchema = z.object({
  kategori: z.literal(KategoriPelaksanaanPendidikan.MEMBIMBING_TUGAS_AKHIR),
  jenisKategori: jenisBimbinganTugasAkhirEnum,
  subJenis: subJenisTugasAkhir,
  jumlahMhs: z.coerce.number().positive({ message: 'Jumlah mahasiswa wajib diisi' })
});

export const pengujiUjianAkhirSchema = z.object({
  kategori: z.literal(KategoriPelaksanaanPendidikan.PENGUJI_UJIAN_AKHIR),
  jenisKategori: jenisPengujiUjianAkhirEnum,
  jumlahMhs: z.coerce.number().positive({ message: 'Jumlah mahasiswa wajib diisi' })
});

export const pembinaKegiatanMhsSchema = z.object({
  kategori: z.literal(KategoriPelaksanaanPendidikan.MEMBINA_KEGIATAN_MHS),
  namaKegiatan: z.string().min(1, { message: 'Nama Kegiatan wajib diisi' }),
  luaran: z.string().min(1, { message: 'Luaran wajib diisi' }),
});

export const pengembanganProgramKuliahSchema = z.object({
  kategori: z.literal(KategoriPelaksanaanPendidikan.MENGEMBANGKAN_PROGRAM),
  mataKuliah: z.string().min(1, { message: 'Mata Kuliah wajib diisi' }),
  programPengembangan: z.string().min(1, { message: 'Program Pengembangan wajib diisi' }),
  prodiId: z.coerce.number().positive({ message: 'ID Prodi wajib diisi' }),
  fakultasId: z.coerce.number().positive({ message: 'ID Fakultas wajib diisi' })
});

export const bahanPengajaranSchema = z.discriminatedUnion("jenisKategori", [
  // Buku Ajar
  z.object({
    kategori: z.literal(KategoriPelaksanaanPendidikan.BAHAN_PENGAJARAN),
    jenisKategori: z.literal(jenisKategoriBahanPengajaranEnum.enum.BUKU_AJAR),
    judul: z.string().min(1, { message: "Judul buku ajar wajib diisi." }),
    tglSelesai: z.coerce.date({ message: "Tanggal terbit wajib diisi." }),
    penerbit: z.string().min(1, { message: "Penerbit wajib diisi." }),
    jumlahHalaman: z.coerce.number().int().positive({ message: "Jumlah halaman harus angka positif." }),
    isbn: z.string().optional(),
  }),

  // Selain Buku Ajar
  z.object({
    kategori: z.literal(KategoriPelaksanaanPendidikan.BAHAN_PENGAJARAN),
    jenisKategori: z.enum([
      jenisKategoriBahanPengajaranEnum.enum.DIKTAT,
      jenisKategoriBahanPengajaranEnum.enum.MODUL,
      jenisKategoriBahanPengajaranEnum.enum.PETUNJUK_PRAKTIKUM,
      jenisKategoriBahanPengajaranEnum.enum.ALAT_BANTU,
      jenisKategoriBahanPengajaranEnum.enum.AUDIO_VISUAL,
      jenisKategoriBahanPengajaranEnum.enum.NASKAH_TUTORIAL,
      jenisKategoriBahanPengajaranEnum.enum.JOBSHEET,
    ]),
    judul: z.string().min(1, { message: "Judul produk wajib diisi." }),
    jumlahHalaman: z.coerce.number().int().positive({ message: "Jumlah halaman harus angka positif." }),
    mataKuliah: z.string().min(1, { message: "Mata kuliah wajib diisi." }),
    prodiId: z.coerce.number().int().positive({ message: "Prodi wajib dipilih." }),
    fakultasId: z.coerce.number().int().positive({ message: "Fakultas wajib dipilih." }),
  }),
]);

export const orasiIlmiahSchema = z.object({
  kategori: z.literal(KategoriPelaksanaanPendidikan.ORASI_ILMIAH),
  namaKegiatan: z.string().min(1, { message: 'Nama Kegiatan wajib diisi' }),
  deskripsi: z.string().optional(),
  tingkat: jenisTingkatOrasiIlmiahEnum,
  penyelenggara: z.string().min(1, { message: 'Penyelenggara wajib diisi' }),
  tgl: z.coerce.date({ message: 'Tanggal wajib diisi' }),
});

export const jabatanStrukturalSchema = z.object({
  kategori: z.literal(KategoriPelaksanaanPendidikan.MENDUDUKI_JABATAN),
  jenisKategori: jenisJabatanEnum,
  prodiId: z.coerce.number().int().positive({ message: "Prodi wajib dipilih." }),
  fakultasId: z.coerce.number().int().positive({ message: "Fakultas wajib dipilih." }),
  afiliasi: z.string().min(1, { message: "Afiliasi wajib diisi." }),
});

export const bimbingDosenSchema = z.object({
  kategori: z.literal(KategoriPelaksanaanPendidikan.MEMBIMBING_DOSEN),
  jenisKategori: jenisBimbinganDosenEnum,
  prodiId: z.coerce.number().int().positive({ message: "Program Studi wajib dipilih." }),
  tglMulai: z.coerce.date({ message: "Tanggal mulai wajib diisi." }),
  tglSelesai: z.coerce.date({ message: "Tanggal selesai wajib diisi." }),
  jabatan: jenisJabatanFungsionalEnum,
  bidangAhli: z.string().min(1, { message: "Bidang ahli wajib diisi." }),
  deskripsi: z.string().optional(),
  jumlahDsn: z.coerce.number().int().positive({ message: "Jumlah dosen wajib diisi." }),
});

export const dataseringPencakokanSchema = z.object({
  kategori: z.literal(KategoriPelaksanaanPendidikan.DATASERING_PENCANGKOKAN),
  jenisKategori: jenisDataseringEnum,
  perguruanTinggi: z.string().min(1, { message: "Perguruan tinggi wajib diisi." }),
  tglMulai: z.coerce.date({ message: "Tanggal mulai wajib diisi." }),
  tglSelesai: z.coerce.date({ message: "Tanggal selesai wajib diisi." }),
  bidangAhli: z.string().min(1, { message: "Bidang ahli wajib diisi." }),
});

export const pengembanganDiriSchema = z.object({
  kategori: z.literal(KategoriPelaksanaanPendidikan.PENGEMBANGAN_DIRI),
  jenisKategori: jenisLamaPengembanganDiriEnum,
  namaKegiatan: z.string().min(1, { message: "Nama kegiatan wajib diisi." }),
  deskripsi: z.string().optional(),
  tglMulai: z.coerce.date({ message: "Tanggal mulai wajib diisi." }),
  tglSelesai: z.coerce.date({ message: "Tanggal selesai wajib diisi." }),
  penyelenggara: z.string().min(1, { message: 'Penyelenggara wajib diisi' }),
  tempat: z.string().min(1, { message: 'Tempat wajib diisi' }),
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

export const updatePelaksanaanPendidikanDtoSchema = createPelaksanaanPendidikanDtoSchema;

export const updateStatusValidasiSchema = z.object({
  statusValidasi: z.nativeEnum(StatusValidasi),
  catatan: z
    .string()
    .max(255)
    .trim()
    .optional()
}).superRefine((val, ctx) => {
  if (val.statusValidasi === 'REJECTED' && (!val.catatan || val.catatan.trim() === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['catatan'],
      message: 'Catatan wajib diisi jika status ditolak',
    });
  }
});


export type CreatePelaksanaanPendidikanDto = z.infer<typeof createPelaksanaanPendidikanDtoSchema>;

export const fullPelaksanaanPendidikanSchema = z.intersection(
  pelaksanaanPendidikanBaseSchema,
  createPelaksanaanPendidikanDtoSchema
);

export const fullUpdatePelaksanaanSchema = fullPelaksanaanPendidikanSchema;

export type CreatePelaksanaanPendidikanFullDto = z.infer<typeof fullPelaksanaanPendidikanSchema>;
export type UpdateStatusValidasiDto = z.infer<typeof updateStatusValidasiSchema>;
