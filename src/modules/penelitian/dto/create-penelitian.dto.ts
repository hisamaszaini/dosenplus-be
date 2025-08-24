import { KategoriPenelitian, StatusValidasi } from "@prisma/client";
import z from "zod";

export const kategoriKaryaIlmiahEnum = z.enum(['BUKU', 'BOOK_CHAPTER', 'JURNAL']);
export const jenisBukuEnum = z.enum(['BUKU_REFERENSI', 'MONOGRAF']);
export const jenisBookChapterEnum = z.enum(['INTERNASIONAL', 'NASIONAL']);
export const jenisJurnalEnum = z.enum([
    'JURNAL_INTERNASIONAL_BEREPUTASI',
    'JURNAL_INTERNASIONAL_INDEKS_BEREPUTASI',
    'JURNAL_INTERNASIONAL',
    'JURNAL_INTERNASIONAL_TIDAK_TERINDEKS',
    'JURNAL_NASIONAL_DIKTI',
    'JURNAL_NASIONAL_TERAKREDITASI_P1_P2',
    'JURNAL_NASIONAL_BERBAHASA_PBB_INDEKS',
    'JURNAL_NASIONAL_TERAKREDITASI_P3_P4',
    'JURNAL_NASIONAL',
    'JURNAL_PBB_TIDAK_MEMENUHI',
]);

export const KategoriPenelitianDideminasiEnum = z.enum([
    "PROSIDING_DIPUBLIKASIKAN",
    "SEMINAR_TANPA_PROSIDING",
    "PROSIDING_TANPA_SEMINAR",
    "KORAN_MAJALAH",
]);

export const jenisProsidingEnum = z.enum([
    "PROSIDING_INTERNASIONAL_TERINDEKS",
    "PROSIDING_INTERNASIONAL_TIDAK_TERINDEKS",
    "PROSIDING_NASIONAL_TIDAK_TERINDEKS"
]);

export const jenisSeminarTanpaProsidingEnum = z.enum([
    "INTERNASIONAL",
    "NASIONAL"
]);

export const jenisProsidingTanpaSeminarEnum = z.enum([
    "INTERNASIONAL",
    "NASIONAL"
]);

export const KategoriKaryaHAKIEnum = z.enum([
    "PATEN_INTERNASIONAL_INDUSTRI",
    "PATEN_INTERNASIONAL",
    "PATEN_NASIONAL_INDUSTRI",
    "PATEN_NASIONAL",
    "PATEN_SEDERHANA",
    "CIPTAAN_DESAIN_GEOGRAFIS",
    "CIPTAAN_BAHAN_PENGAJAR"
]);

export const KategoriKaryaNonPaten = z.enum([
    "INTERNASIONAL",
    "NASIONAL",
    "LOKAL"
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
        subJenis: jenisBukuEnum,

        judul: z.string().nonempty('Judul wajib diisi'),
        tglTerbit: z.coerce.date({ 'message': 'Tanggal terbit wajib diisi' }),
        penerbit: z.string().nonempty('Penerbit wajib diisi'),
        isbn: z.string().nonempty('ISBN wajib diisi'),
    }),
    z.object({
        kategori: z.literal(KategoriPenelitian.KARYA_ILMIAH),
        jenisKategori: z.literal('BOOK_CHAPTER'),
        subJenis: jenisBookChapterEnum,

        judul: z.string().nonempty('Judul wajib diisi'),
        tglTerbit: z.coerce.date({ 'message': 'Tanggal terbit wajib diisi' }),
        penerbit: z.string().nonempty('Penerbit wajib diisi'),
        isbn: z.string().nonempty('ISBN wajib diisi'),

        judulTerkait: z.string().nonempty('Judul penelitian terkait wajib diisi'),
    }),
    z.object({
        kategori: z.literal(KategoriPenelitian.KARYA_ILMIAH),
        jenisKategori: z.literal('JURNAL'),
        subJenis: jenisJurnalEnum,

        judul: z.string().nonempty('Judul wajib diisi'),
        tglTerbit: z.coerce.date({ 'message': 'Tanggal terbit wajib diisi' }),
        penerbit: z.string().nonempty('Penerbit wajib diisi'),
        isbn: z.string().nonempty('ISBN wajib diisi'),

        penulisKe: z.coerce.number().positive({ message: 'Penulis ke- wajib diisi' }),
        jumlahPenulis: z.coerce.number().positive({ message: 'Jumlah penulis wajib diisi'}),
        corespondensi: z.boolean(),
        jumlahHalaman: z.coerce.number().positive('Jumlah halaman wajib diisi dan harus lebih dari 0'),
        link: z.string().nonempty('Tautan Wajib diisi'),
    }),
]);

export const penelitianDiseminasiSchema = z.discriminatedUnion("jenisKategori", [
    // Prosiding dipublikasikan
    z.object({
        kategori: z.literal(KategoriPenelitian.PENELITIAN_DIDEMINASI),
        jenisKategori: z.literal("PROSIDING_DIPUBLIKASIKAN"),
        subJenis: jenisProsidingEnum,

        judul: z.string().nonempty("Judul artikel wajib diisi"),

        judulSeminar: z.string().nonempty("Judul seminar wajib diisi"),
        penulisKe: z.coerce.number().positive({ message: 'Penulis ke- wajib diisi' }),
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
        kategori: z.literal(KategoriPenelitian.PENELITIAN_DIDEMINASI),
        jenisKategori: z.literal("SEMINAR_TANPA_PROSIDING"),
        subJenis: jenisSeminarTanpaProsidingEnum,

        judul: z.string().nonempty("Judul artikel wajib diisi"),

        judulSeminar: z.string().nonempty("Judul seminar wajib diisi"),
        penulisKe: z.coerce.number().positive({ message: 'Penulis ke- wajib diisi' }),
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
        kategori: z.literal(KategoriPenelitian.PENELITIAN_DIDEMINASI),
        jenisKategori: z.literal("PROSIDING_TANPA_SEMINAR"),
        subJenis: jenisProsidingTanpaSeminarEnum,

        judul: z.string().nonempty("Judul artikel wajib diisi"),

        penulisKe: z.coerce.number().positive({ message: 'Penulis ke- wajib diisi' }),
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
        kategori: z.literal(KategoriPenelitian.PENELITIAN_DIDEMINASI),
        jenisKategori: z.literal("KORAN_MAJALAH"),
        nama: z.string().nonempty("Nama koran atau majalah wajib diisi"),
        judul: z.string().nonempty("Judul artikel wajib diisi"),
        penulisKe: z.coerce.number().positive({ message: 'Penulis ke- wajib diisi' }),
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
    kategori: z.literal(KategoriPenelitian.PENELITIAN_TIDAK_DIPUBLIKASI),
    namaPerpus: z.string().nonempty("Nama perpustakaan wajib diisi"),
    judul: z.string().nonempty("Judul artikel wajib diisi"),
    corespondensi: z.boolean(),
    penulisKe: z.coerce.number().positive({ message: 'Penulis ke- wajib diisi' }),
    tglTerbit: z.coerce.date({ message: "Tanggal wajib diisi" }),
    penerbit: z.string().nonempty('Penerbit wajib diisi'),
    isbn: z.string().nullable().optional(),
    issn: z.string().nullable().optional(),
    eissn: z.string().nullable().optional(),

    link: z.string().nullable().optional(),
});

export const menerjemahkanBukuSchema = z.object({
    kategori: z.literal(KategoriPenelitian.TERJEMAHAN_BUKU),
    judul: z.string().nonempty("Judul karya wajib diisi"),
    tglTerbit: z.coerce.date({ message: "Tanggal wajib diisi" }),
    penerbit: z.string().nonempty('Penerbit wajib diisi'),
    isbn: z.string().nullable().optional(),
});

export const editingBukuSchema = z.object({
    kategori: z.literal(KategoriPenelitian.SUNTINGAN_BUKU),
    judul: z.string().nonempty("Judul karya wajib diisi"),
    tglTerbit: z.coerce.date({ message: "Tanggal wajib diisi" }),
    penerbit: z.string().nonempty('Penerbit wajib diisi'),
    isbn: z.string().nullable().optional(),
});

export const karyaPatenHkiSchema = z.object({
    kategori: z.literal(KategoriPenelitian.KARYA_BERHAKI),
    jenisKategori: KategoriKaryaHAKIEnum,
    judul: z.string().nonempty("Judul karya wajib diisi"),
    tglTerbit: z.coerce.date({ message: "Tanggal wajib diisi" }),
    link: z.string().nullable().optional(),
});

export const karyaNonPatenSchema = z.object({
    kategori: z.literal(KategoriPenelitian.KARYA_NON_HAKI),
    jenisKategori: KategoriKaryaNonPaten,
    judul: z.string().nonempty("Judul karya wajib diisi"),
    tglTerbit: z.coerce.date({ message: "Tanggal wajib diisi" }),
    link: z.string().nullable().optional(),
});

export const seniNonHkiSchema = z.object({
    kategori: z.literal(KategoriPenelitian.SENI_NON_HAKI),
    jenisKategori: KategoriKaryaNonPaten,
    judul: z.string().nonempty("Judul karya wajib diisi"),
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