import z from "zod";
import { editingBukuSchema, jenisBookChapterEnum, jenisBukuEnum, jenisJurnalEnum, jenisProsidingEnum, jenisProsidingTanpaSeminarEnum, jenisSeminarTanpaProsidingEnum, karyaIlmiahSchema, karyaNonPatenSchema, karyaPatenHkiSchema, menerjemahkanBukuSchema, penelitianBaseSchema, penelitianDiseminasiSchema, penelitianTidakDipublikasiSchema, seniNonHkiSchema } from "./create-penelitian.dto";
import { KategoriPenelitian } from "@prisma/client";

export const updateBukuKaryaIlmiahSchema = z.object({
    kategori: z.literal(KategoriPenelitian.KARYA_ILMIAH),
    jenisKategori: z.literal('BUKU'),
    subJenis: jenisBukuEnum,

    judul: z.string().nonempty('Judul wajib diisi'),
    tglTerbit: z.coerce.date({ 'message': 'Tanggal terbit wajib diisi' }),
    penerbit: z.string().nonempty('Penerbit wajib diisi'),
    isbn: z.string().nonempty('ISBN wajib diisi'),
}).partial().required({ kategori: true, jenisKategori: true });

export const updateBookChapterKaryaIlmiahSchema = z.object({
    kategori: z.literal(KategoriPenelitian.KARYA_ILMIAH),
    jenisKategori: z.literal('BOOK_CHAPTER'),
    subJenis: jenisBookChapterEnum,

    judul: z.string().nonempty('Judul wajib diisi'),
    tglTerbit: z.coerce.date({ 'message': 'Tanggal terbit wajib diisi' }),
    penerbit: z.string().nonempty('Penerbit wajib diisi'),
    isbn: z.string().nonempty('ISBN wajib diisi'),

    judulTerkait: z.string().nonempty('Judul penelitian terkait wajib diisi'),
}).partial().required({ kategori: true, jenisKategori: true });

export const updateJurnalKaryaIlmiahSchema = z.object({
    kategori: z.literal(KategoriPenelitian.KARYA_ILMIAH),
    jenisKategori: z.literal('JURNAL'),
    subJenis: jenisJurnalEnum,

    judul: z.string().nonempty('Judul wajib diisi'),
    tglTerbit: z.coerce.date({ 'message': 'Tanggal terbit wajib diisi' }),
    penerbit: z.string().nonempty('Penerbit wajib diisi'),
    isbn: z.string().nonempty('ISBN wajib diisi'),

    penulisKe: z.coerce.number().positive({ message: 'Penulis ke- wajib diisi' }),
    jumlahPenulis: z.coerce.number().positive({ message: 'Jumlah penulis wajib diisi' }),
    corespondensi: z.boolean(),
    jumlahHalaman: z.coerce.number().positive('Jumlah halaman wajib diisi dan harus lebih dari 0'),
    link: z.string().nonempty('Tautan Wajib diisi'),
}).partial().required({ kategori: true, jenisKategori: true });

const updateProsidingDipublikasikanSchema = z.object({
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
}).partial().required({ kategori: true, jenisKategori: true });

const updateSeminarTanpaProsidingSchema = z.object({
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
}).partial().required({ kategori: true, jenisKategori: true });

const updateProsidingTanpaPresentasiSchema = z.object({
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
}).partial().required({ kategori: true, jenisKategori: true });

const updatePublikasiPopulerSchema = z.object({
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
}).partial().required({ kategori: true, jenisKategori: true });

export const updatePenelitianDiseminasiSchema = z.discriminatedUnion("jenisKategori", [
    updateProsidingDipublikasikanSchema,
    updateSeminarTanpaProsidingSchema,
    updateProsidingTanpaPresentasiSchema,
    updatePublikasiPopulerSchema,
]);

const updateKaryaIlmiahSchema = z.discriminatedUnion('jenisKategori', [
    updateBukuKaryaIlmiahSchema,
    updateBookChapterKaryaIlmiahSchema,
    updateJurnalKaryaIlmiahSchema,
]);

// 1) Penelitian Tidak Dipublikasi
export const updatePenelitianTidakDipublikasiSchema = penelitianTidakDipublikasiSchema
    .partial()
    .required({ kategori: true });

// 2) Menerjemahkan Buku
export const updateMenerjemahkanBukuSchema = menerjemahkanBukuSchema
    .partial()
    .required({ kategori: true });

// 3) Editing Buku
export const updateEditingBukuSchema = editingBukuSchema
    .partial()
    .required({ kategori: true });

// 4) Karya Paten HKI
export const updateKaryaPatenHkiSchema = karyaPatenHkiSchema
    .partial()
    .required({ kategori: true });

// 5) Teknologi Non-Paten
export const updateKaryaNonPatenSchema = karyaNonPatenSchema
    .partial()
    .required({ kategori: true });

// 6) Seni Non-HKI
export const updateSeniNonHkiSchema = seniNonHkiSchema
    .partial()
    .required({ kategori: true });

// ------------------------------------------------------------------
// 2.  Gabungkan menjadi satu discriminated union untuk update
// ------------------------------------------------------------------
export const updatePenelitianDtoSchema = z.discriminatedUnion('kategori', [
    updateKaryaIlmiahSchema,
    updatePenelitianDiseminasiSchema,
    updatePenelitianTidakDipublikasiSchema,
    updateMenerjemahkanBukuSchema,
    updateEditingBukuSchema,
    updateKaryaPatenHkiSchema,
    updateKaryaNonPatenSchema,
    updateSeniNonHkiSchema,
]);

// ------------------------------------------------------------------
// 3.  Base schema untuk update (semua field optional)
// ------------------------------------------------------------------
const penelitianBaseUpdateSchema = penelitianBaseSchema.partial();

// ------------------------------------------------------------------
// 4.  Schema final untuk update (body + base)
// ------------------------------------------------------------------
export const fullUpdatePenelitianSchema = penelitianBaseUpdateSchema.and(updatePenelitianDtoSchema);

// ------------------------------------------------------------------
// 5.  Tipe TypeScript-nya
// ------------------------------------------------------------------
export type UpdatePenelitianFullDto = z.infer<typeof fullUpdatePenelitianSchema>;