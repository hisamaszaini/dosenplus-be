import { KategoriPenelitian, StatusValidasi } from "@prisma/client";
import z from "zod";

export class CreatePenelitianDto { }

export const kategoriKaryaIlmiahEnum = z.enum(['BUKU', 'BOOKCHAPTER', 'JURNAL']);
export const jenisBukuEnum = z.enum(['BUKU_REFERENSI', 'BUKU_MONOGRAF']);
export const jenisBookChapterEnum = z.enum(['BC_INTERNASIONAL', 'BC_NASIONAL']);
export const jenisJurnalEnum = z.enum([
    'JURNAL_INT_BEREPUTASI',
    'JURNAL_INT_TERINDEKS',
    'JURNAL_INT',
    'JURNAL_NAS_DIKTI',
    'JURNAL_NAS_SINTA_1_2',
    'JURNAL_NAS_KEMENRISTEKDIKTI',
    'JURNAL_NAS_SINTA_3_4',
    'JURNAL_NAS',
    'JURNAL_PBB'
]);

export const KategoriDiseminasiEnum = z.enum([
    "PROSIDING_DIPUBLIKASIKAN",
    "SEMINAR_TANPA_PROSIDING",
    "PROSIDING_TANPA_PRESENTASI",
    "PUBLIKASI_POPULER",
]);

export const SubKategoriEnum = z.enum([
    // Prosiding dipublikasikan
    "INTERNASIONAL_BEREPUTASI",
    "INTERNASIONAL_NON_INDEKS",
    "NASIONAL",

    // Seminar tanpa prosiding
    "SEMINAR_INTERNASIONAL",
    "SEMINAR_NASIONAL",

    // Prosiding tanpa presentasi
    "PROSIDING_INTERNASIONAL",
    "PROSIDING_NASIONAL",
]);

export const jenisHkiEnum = z.enum([
    "INTERNASIONAL_INDUSTRI",
    "INTERNASIONAL",
    "NASIONAL_INDUSTRI",
    "NASIONAL",
    "PATEN_SEDERHANA_KI",
    "SERTIFIKAT_KI",
    "SERTIFIKAT_BAHAN_AJAR"
]);

export const jenisNonPatenEnum = z.enum([
    "INTERNASIONAL",
    "NASIONAL",
    "LOKAL",
]);

const fileSchema = z.any()
    .refine((file) => file && typeof file === 'object' && file.originalname?.endsWith('.pdf'), {
        message: 'File harus berupa PDF',
    });

export const penelitianBaseSchema = z.object({
    dosenId: z.coerce.number().positive({ message: 'ID Dosen wajib diisi' }).optional(),
    semesterId: z.coerce.number().positive({ message: 'ID Semester wajib diisi' }),
});

export const karyaIlmiahSchema = z.discriminatedUnion('jenisKategori', [
    z.object({
        kategori: z.literal(KategoriPenelitian.KARYA_ILMIAH),
        jenisKategori: z.literal('BUKU'),
        jenisProduk: jenisBukuEnum,

        judul: z.string().nonempty('Judul wajib diisi'),
        tglTerbit: z.coerce.date({ 'message': 'Tanggal terbit wajib diisi' }),
        penerbit: z.string().nonempty('Penerbit wajib diisi'),
        isbn: z.string().nonempty('ISBN wajib diisi'),
    }),
    z.object({
        kategori: z.literal(KategoriPenelitian.KARYA_ILMIAH),
        jenisKategori: z.literal('BOOKCHAPTER'),
        jenisProduk: jenisBookChapterEnum,

        judul: z.string().nonempty('Judul wajib diisi'),
        tglTerbit: z.coerce.date({ 'message': 'Tanggal terbit wajib diisi' }),
        penerbit: z.string().nonempty('Penerbit wajib diisi'),
        isbn: z.string().nonempty('ISBN wajib diisi'),

        judulTerkait: z.string().nonempty('Judul penelitian terkait wajib diisi'),
    }),
    z.object({
        kategori: z.literal(KategoriPenelitian.KARYA_ILMIAH),
        jenisKategori: z.literal('JURNAL'),
        jenisProduk: jenisJurnalEnum,

        judul: z.string().nonempty('Judul wajib diisi'),
        tglTerbit: z.coerce.date({ 'message': 'Tanggal terbit wajib diisi' }),
        penerbit: z.string().nonempty('Penerbit wajib diisi'),
        isbn: z.string().nonempty('ISBN wajib diisi'),

        jenisJurnal: z.string().nonempty('Judul wajib diisi'),
        penulsKe: z.coerce.number().positive({ message: 'Penulis ke- wajib diisi' }),
        corespondensi: z.boolean(),
        jumlahHalaman: z.coerce.number().positive('Jumlah halaman wajib diisi dan harus lebih dari 0'),
        link: z.string().nonempty('Tautan Wajib diisi'),
    }),
]);

export const penelitianDiseminasiSchema = z.discriminatedUnion("jenisKategori", [
    // Prosiding dipublikasikan
    z.object({
        kategori: z.literal(KategoriPenelitian.DISEMINASI),
        jenisKategori: z.literal("PROSIDING_DIPUBLIKASIKAN"),
        jenisProduk: z.enum([
            "INTERNASIONAL_BEREPUTASI",
            "INTERNASIONAL_NON_INDEKS",
            "NASIONAL",
        ]),
        judul: z.string().nonempty("Judul seminar wajib diisi"),
        judulArtikel: z.string().nonempty("Judul artikel wajib diisi"),
        penulsKe: z.coerce.number().positive({ message: 'Penulis ke- wajib diisi' }),
        corespondensi: z.boolean(),
        tglTerbit: z.coerce.date({ message: "Tanggal terbit wajib diisi" }),
        penerbit: z.string().nonempty('Penerbit wajib diisi'),
        isbn: z.string().nullable().optional(),
        issn: z.string().nullable().optional(),
        eissn: z.string().nullable().optional(),

        link: z.string().nullable().optional(),
    }),

    // Seminar tanpa prosiding
    z.object({
        kategori: z.literal(KategoriPenelitian.DISEMINASI),
        jenisKategori: z.literal("SEMINAR_TANPA_PROSIDING"),
        jenisProduk: z.enum([
            "SEMINAR_INTERNASIONAL",
            "SEMINAR_NASIONAL",
        ]),
        judul: z.string().nonempty("Judul seminar wajib diisi"),
        judulArtikel: z.string().nonempty("Judul artikel wajib diisi"),
        penulsKe: z.coerce.number().positive({ message: 'Penulis ke- wajib diisi' }),
        corespondensi: z.boolean(),
        tglTerbit: z.coerce.date({ message: "Tanggal terbit wajib diisi" }),
        penerbit: z.string().nonempty('Penerbit wajib diisi'),
        isbn: z.string().nullable().optional(),
        issn: z.string().nullable().optional(),
        eissn: z.string().nullable().optional(),

        link: z.string().nullable().optional(),
    }),

    // Prosiding tanpa presentasi
    z.object({
        kategori: z.literal(KategoriPenelitian.DISEMINASI),
        jenisKategori: z.literal("PROSIDING_TANPA_PRESENTASI"),
        jenisProduk: z.enum([
            "PROSIDING_INTERNASIONAL",
            "PROSIDING_NASIONAL",
        ]),
        judul: z.string().nonempty("Judul seminar wajib diisi"),
        judulArtikel: z.string().nonempty("Judul artikel wajib diisi"),
        penulsKe: z.coerce.number().positive({ message: 'Penulis ke- wajib diisi' }),
        corespondensi: z.boolean(),
        tglTerbit: z.coerce.date({ message: "Tanggal terbit wajib diisi" }),
        penerbit: z.string().nonempty('Penerbit wajib diisi'),
        isbn: z.string().nullable().optional(),
        issn: z.string().nullable().optional(),
        eissn: z.string().nullable().optional(),

        link: z.string().nullable().optional(),
    }),

    // Publikasi populer: koran, majalah, dll
    z.object({
        kategori: z.literal(KategoriPenelitian.DISEMINASI),
        jenisKategori: z.literal("PUBLIKASI_POPULER"),
        judul: z.string().nonempty("Nama koran atau majalah wajib diisi"),
        judulArtikel: z.string().nonempty("Judul artikel wajib diisi"),
        penulsKe: z.coerce.number().positive({ message: 'Penulis ke- wajib diisi' }),
        corespondensi: z.boolean(),
        tglTerbit: z.coerce.date({ message: "Tanggal wajib diisi" }),
        penerbit: z.string().nonempty('Penerbit wajib diisi'),
        isbn: z.string().nullable().optional(),
        issn: z.string().nullable().optional(),
        eissn: z.string().nullable().optional(),

        link: z.string().nullable().optional(),
    }),
]);

export const penelitianTidakDipublikasiSchema = z.object({
    kategori: z.literal(KategoriPenelitian.PENELITIAN_TIDAK_DIPUBLIKASIKAN),
    namaPerpus: z.string().nonempty("Nama perpustakaan wajib diisi"),
    judulArtikel: z.string().nonempty("Judul artikel wajib diisi"),
    corespondensi: z.boolean(),
    penulsKe: z.coerce.number().positive({ message: 'Penulis ke- wajib diisi' }),
    tglTerbit: z.coerce.date({ message: "Tanggal wajib diisi" }),
    penerbit: z.string().nonempty('Penerbit wajib diisi'),
    isbn: z.string().nullable().optional(),
    issn: z.string().nullable().optional(),
    eissn: z.string().nullable().optional(),

    link: z.string().nullable().optional(),
});

export const menerjemahkanBukuSchema = z.object({
    kategori: z.literal(KategoriPenelitian.MENERJEMAHKAN_BUKU),
    judulKarya: z.string().nonempty("Judul karya wajib diisi"),
    tglTerbit: z.coerce.date({ message: "Tanggal wajib diisi" }),
    penerbit: z.string().nonempty('Penerbit wajib diisi'),
    isbn: z.string().nullable().optional(),
});

export const editingBukuSchema = z.object({
    kategori: z.literal(KategoriPenelitian.EDITING_BUKU),
    judulKarya: z.string().nonempty("Judul karya wajib diisi"),
    tglTerbit: z.coerce.date({ message: "Tanggal wajib diisi" }),
    penerbit: z.string().nonempty('Penerbit wajib diisi'),
    isbn: z.string().nullable().optional(),
});

export const karyaPatenHkiSchema = z.object({
    kategori: z.literal(KategoriPenelitian.PATEN_HAKI),
    jenisKegiatan: jenisHkiEnum,
    judulKarya: z.string().nonempty("Judul karya wajib diisi"),
    tglTerbit: z.coerce.date({ message: "Tanggal wajib diisi" }),
    link: z.string().nullable().optional(),
});

export const karyaNonPatenSchema = z.object({
    kategori: z.literal(KategoriPenelitian.TEKNOLOGI_NON_PATEN),
    jenisKegiatan: jenisNonPatenEnum,
    judulKarya: z.string().nonempty("Judul karya wajib diisi"),
    tglTerbit: z.coerce.date({ message: "Tanggal wajib diisi" }),
    link: z.string().nullable().optional(),
});

export const seniNonHkiSchema = z.object({
    kategori: z.literal(KategoriPenelitian.SENI_NON_HKI),
    jenisKegiatan: jenisNonPatenEnum,
    judulKarya: z.string().nonempty("Judul karya wajib diisi"),
    tglTerbit: z.coerce.date({ message: "Tanggal wajib diisi" }),
    link: z.string().nullable().optional(),
});

export const createPenelitianDtoSchema = z.discriminatedUnion('kategori', [
    karyaIlmiahSchema,
    penelitianDiseminasiSchema,
    penelitianTidakDipublikasiSchema,
    menerjemahkanBukuSchema,
    editingBukuSchema,
    karyaPatenHkiSchema,
    karyaNonPatenSchema,
    seniNonHkiSchema
]);

export const fullCreatePenelitianSchema = penelitianBaseSchema.and(createPenelitianDtoSchema);

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

export type CreatePenelitianFullDto = z.infer<typeof fullCreatePenelitianSchema>;
export type UpdateStatusValidasiDto = z.infer<typeof updateStatusValidasiSchema>;