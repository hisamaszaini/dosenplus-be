import { KategoriPenunjang, StatusValidasi } from "@prisma/client";
import z from "zod";

export const jenisPanitiaPTEnum = z.enum([
    'KETUA_WAKIL_KEPALA_ANGGOTA_TAHUNAN',
    'ANGGOTA_TAHUNAN'
]);

export const jenisPanitiaLembagaPemerintahEnum = z.enum([
    'KETUA_WAKIL_PANITIA_PUSAT',
    'ANGGOTA_PANITIA_PUSAT',
    'KETUA_WAKIL_PANITIA_DAERAH',
    'ANGGOTA_PANITIA_DAERAH'
]);

export const jenisAnggotaPertemuanEnum = z.enum([
    'KETUA',
    'ANGGOTA'
]);

export const jenisAnggotaOrganisasiProfesiEnum = z.enum([
    'PENGURUS',
    'ANGGOTA_ATAS_PERMINTAAN',
    'ANGGOTA'
]);

export const jenisAnggotaDelegasiNasionalEnum = z.enum([
    'KETUA_DELEGASI',
    'ANGGOTA_DELEGASI'
]);

export const jenisTandaJasaPenghargaanEnum = z.enum([
    "SATYA_LENCANA_30_TAHUN",
    "SATYA_LENCANA_20_TAHUN",
    "SATYA_LENCANA_10_TAHUN",
    "PENGHARGAAN_INTERNASIONAL",
    "PENGHARGAAN_NASIONAL",
    "PENGHARGAAN_DAERAH"
]);

export const jenisMenulisBukuEnum = z.enum([
    'BUKU_SMTA',
    'BUKU_SMTP',
    'BUKU_SD'
]);

export const jenisPrestasiOlahragaEnum = z.enum([
    'PIAGAM_MEDALI_INTERNASIONAL',
    'PIAGAM_MEDALI_NASIONAL',
    'PIAGAM_MEDALI_DAERAH'
]);

export const penunjangBaseSchema = z.object({
    dosenId: z.coerce.number().positive({ message: 'ID Dosen wajib diisi' }).optional(),
    semesterId: z.coerce.number().positive({ message: 'ID Semester wajib diisi' }),
});

export const anggotaPanitiaPTSchema = z.object({
    kategori: z.literal(KategoriPenunjang.ANGGOTA_PANITIA_PT),
    jenisKegiatan: jenisPanitiaPTEnum,
    namaKegiatan: z.string().nonempty({ message: "Nama kegiatan wajib diisi" }),
    instansi: z.string().nonempty({ message: "Instansi wajib diisi" }),
    noSk: z.string().nonempty('Nomor SK wajib diisi'),
    tglMulai: z.coerce.date({ 'message': 'Tanggal mulai wajib diisi' }),
    tglSelesai: z.coerce.date({ 'message': 'Tanggal selesai wajib diisi' }),
});

export const anggotaPanitiaLPSchema = z.object({
    kategori: z.literal(KategoriPenunjang.ANGGOTA_PANITIA_LEMBAGA_PEMERINTAH),
    jenisKegiatan: jenisPanitiaLembagaPemerintahEnum,
    namaKegiatan: z.string().nonempty({ message: "Nama kegiatan wajib diisi" }),
    instansi: z.string().nonempty({ message: "Instansi wajib diisi" }),
    noSk: z.string().nonempty('Nomor SK wajib diisi'),
    tglMulai: z.coerce.date({ 'message': 'Tanggal mulai wajib diisi' }),
    tglSelesai: z.coerce.date({ 'message': 'Tanggal selesai wajib diisi' }),
});

export const anggotaOrganisasiProfesiInternasionalSchema = z.object({
    kategori: z.literal(KategoriPenunjang.ANGGOTA_ORGANISASI_PROFESI_INTERNASIONAL),
    jenisKegiatan: jenisAnggotaOrganisasiProfesiEnum,
    namaKegiatan: z.string().nonempty({ message: "Nama kegiatan wajib diisi" }),
    instansi: z.string().nonempty({ message: "Instansi wajib diisi" }),
    noSk: z.string().nonempty('Nomor SK wajib diisi'),
    tglMulai: z.coerce.date({ 'message': 'Tanggal mulai wajib diisi' }),
    tglSelesai: z.coerce.date({ 'message': 'Tanggal selesai wajib diisi' }),
});

export const anggotaOrganisasiProfesiNasionalSchema = z.object({
    kategori: z.literal(KategoriPenunjang.ANGGOTA_ORGANISASI_PROFESI_NASIONAL),
    jenisKegiatan: jenisAnggotaOrganisasiProfesiEnum,
    namaKegiatan: z.string().nonempty({ message: "Nama kegiatan wajib diisi" }),
    instansi: z.string().nonempty({ message: "Instansi wajib diisi" }),
    noSk: z.string().nonempty('Nomor SK wajib diisi'),
    tglMulai: z.coerce.date({ 'message': 'Tanggal mulai wajib diisi' }),
    tglSelesai: z.coerce.date({ 'message': 'Tanggal selesai wajib diisi' }),
});

export const wakilPTPanitiaAntarLembagaSchema = z.object({
    kategori: z.literal(KategoriPenunjang.WAKIL_PT_PANITIA_ANTAR_LEMBAGA),
    namaKegiatan: z.string().nonempty({ message: "Nama kegiatan wajib diisi" }),
    instansi: z.string().nonempty({ message: "Instansi wajib diisi" }),
    noSk: z.string().nonempty('Nomor SK wajib diisi'),
    tglMulai: z.coerce.date({ 'message': 'Tanggal mulai wajib diisi' }),
    tglSelesai: z.coerce.date({ 'message': 'Tanggal selesai wajib diisi' }),
});

export const delegasiNasionalPertemuanInterSchema = z.object({
    kategori: z.literal(KategoriPenunjang.DELEGASI_NASIONAL_PERTEMUAN_INTERNASIONAL),
    jenisKegiatan: jenisAnggotaDelegasiNasionalEnum,
    namaKegiatan: z.string().nonempty({ message: "Nama kegiatan wajib diisi" }),
    instansi: z.string().nonempty({ message: "Instansi wajib diisi" }),
    noSk: z.string().nonempty('Nomor SK wajib diisi'),
    tglMulai: z.coerce.date({ 'message': 'Tanggal mulai wajib diisi' }),
    tglSelesai: z.coerce.date({ 'message': 'Tanggal selesai wajib diisi' }),
});

export const aktifPertemuanIlmiahIntNasRegSchema = z.object({
    kategori: z.literal(KategoriPenunjang.AKTIF_PERTEMUAN_ILMIAH_INT_NAS_REG),
    jenisKegiatan: jenisAnggotaPertemuanEnum,
    namaKegiatan: z.string().nonempty({ message: "Nama kegiatan wajib diisi" }),
    instansi: z.string().nonempty({ message: "Instansi wajib diisi" }),
    noSk: z.string().nonempty('Nomor SK wajib diisi'),
    tglMulai: z.coerce.date({ 'message': 'Tanggal mulai wajib diisi' }),
    tglSelesai: z.coerce.date({ 'message': 'Tanggal selesai wajib diisi' }),
});

export const aktifPertemuanIlmiahInternalPTSchema = z.object({
    kategori: z.literal(KategoriPenunjang.AKTIF_PERTEMUAN_ILMIAH_INTERNAL_PT),
    jenisKegiatan: jenisAnggotaPertemuanEnum,
    namaKegiatan: z.string().nonempty({ message: "Nama kegiatan wajib diisi" }),
    instansi: z.string().nonempty({ message: "Instansi wajib diisi" }),
    noSk: z.string().nonempty('Nomor SK wajib diisi'),
    tglMulai: z.coerce.date({ 'message': 'Tanggal mulai wajib diisi' }),
    tglSelesai: z.coerce.date({ 'message': 'Tanggal selesai wajib diisi' }),
});

export const tandaJasaPenghargaanSchema = z.object({
    kategori: z.literal(KategoriPenunjang.TANDA_JASA_PENGHARGAAN),
    jenisKegiatan: jenisTandaJasaPenghargaanEnum,
    namaKegiatan: z.string().nonempty({ message: "Nama kegiatan wajib diisi" }),
    instansi: z.string().nonempty({ message: "Instansi wajib diisi" }),
    noSk: z.string().nonempty('Nomor SK wajib diisi'),
    tglMulai: z.coerce.date({ 'message': 'Tanggal mulai wajib diisi' }),
    tglSelesai: z.coerce.date({ 'message': 'Tanggal selesai wajib diisi' }),
});

export const menulisBukuSLTANasionalSchema = z.object({
    kategori: z.literal(KategoriPenunjang.MENULIS_BUKU_SLTA_NASIONAL),
    jenisKegiatan: jenisMenulisBukuEnum,
    namaKegiatan: z.string().nonempty({ message: "Nama kegiatan wajib diisi" }),
    instansi: z.string().nonempty({ message: "Instansi wajib diisi" }),
    noSk: z.string().nonempty('Nomor SK wajib diisi'),
    tglMulai: z.coerce.date({ 'message': 'Tanggal mulai wajib diisi' }),
    tglSelesai: z.coerce.date({ 'message': 'Tanggal selesai wajib diisi' }),
});

export const prestasiOlahragaHumanioraSchema = z.object({
    kategori: z.literal(KategoriPenunjang.PRESTASI_OLAHRAGA_HUMANIORA),
    jenisKegiatan: jenisPrestasiOlahragaEnum,
    namaKegiatan: z.string().nonempty({ message: "Nama kegiatan wajib diisi" }),
    instansi: z.string().nonempty({ message: "Instansi wajib diisi" }),
    noSk: z.string().nonempty('Nomor SK wajib diisi'),
    tglMulai: z.coerce.date({ 'message': 'Tanggal mulai wajib diisi' }),
    tglSelesai: z.coerce.date({ 'message': 'Tanggal selesai wajib diisi' }),
});

export const timPenilaiJabatanAkademikDosenSchema = z.object({
    kategori: z.literal(KategoriPenunjang.TIM_PENILAI_JABATAN_AKADEMIK),
    jenisKegiatan: jenisPrestasiOlahragaEnum,
    namaKegiatan: z.string().nonempty({ message: "Nama kegiatan wajib diisi" }),
    instansi: z.string().nonempty({ message: "Instansi wajib diisi" }),
    noSk: z.string().nonempty('Nomor SK wajib diisi'),
    tglMulai: z.coerce.date({ 'message': 'Tanggal mulai wajib diisi' }),
    tglSelesai: z.coerce.date({ 'message': 'Tanggal selesai wajib diisi' }),
});

export const createPenunjangDtoSchema = z.discriminatedUnion('kategori', [
    anggotaPanitiaPTSchema,
    anggotaPanitiaLPSchema,
    anggotaOrganisasiProfesiInternasionalSchema,
    anggotaOrganisasiProfesiNasionalSchema,
    wakilPTPanitiaAntarLembagaSchema,
    delegasiNasionalPertemuanInterSchema,
    aktifPertemuanIlmiahIntNasRegSchema,
    aktifPertemuanIlmiahInternalPTSchema,
    tandaJasaPenghargaanSchema,
    menulisBukuSLTANasionalSchema,
    prestasiOlahragaHumanioraSchema,
    timPenilaiJabatanAkademikDosenSchema
]);

export const fullCreatePenunjangSchema = penunjangBaseSchema.and(createPenunjangDtoSchema);

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

export type CreatePenunjangFullDto = z.infer<typeof fullCreatePenunjangSchema>;
export type UpdateStatusValidasiDto = z.infer<typeof updateStatusValidasiSchema>;