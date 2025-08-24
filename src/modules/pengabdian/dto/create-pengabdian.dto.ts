import { KategoriPengabdian, StatusValidasi } from "@prisma/client";
import z from "zod";

export const jenisTingkatPenyuluhanSemester = z.enum([
    'INTERNASIONAL',
    'NASIONAL',
    'LOKAL'
]);

export const jenisTingkatPenyuluhanKurangSem = z.enum([
    'INTERNASIONAL',
    'NASIONAL',
    'LOKAL',
    'INSENDENTAL'
]);

export const jenisPelayananMasyarakat = z.enum([
    'BIDANG_KEAHLIAN',
    'PENUGASAN_PT',
    'FUNGSI_JABATAN'
]);

export const jenisTingkatPengelolaanJurnal = z.enum([
    'JURNAL_INTERNASIONAL',
    'JURNAL_NASIONAL'
]);

export const pengabdianBaseSchema = z.object({
    dosenId: z.coerce.number().positive({ message: 'ID Dosen wajib diisi' }).optional(),
    semesterId: z.coerce.number().positive({ message: 'ID Semester wajib diisi' }),
});

export const jabatanPimpinanSchema = z.object({
    kategori: z.literal(KategoriPengabdian.JABATAN_PIMPINAN_LEMBAGA_PEMERINTAHAN),
    instansi: z.string().nonempty('Instansi wajib diisi'),
    namaJabatan: z.string().nonempty('Nama Jabatan wajib diisi'),
    tmt: z.coerce.date({ 'message': 'TMT / Tanggal Terhitung Mulai wajib diisi' }),
    lokasi: z.string().nonempty('Lokasi wajib diisi'),
    noSk: z.string().nonempty('Nomor SK wajib diisi'),
});

export const pengembanganDimanfaatkanSchema = z.object({
    kategori: z.literal(KategoriPengabdian.PENGEMBANGAN_HASIL_PENDIDIKAN_PENELITIAN),
    namaKegiatan: z.string().nonempty('Nama Kegiatan wajib diisi'),
    afiliasi: z.string().nonempty('Afiliasi wajib diisi'),
    lokasi: z.string().nonempty('Lokasi wajib diisi'),
    lamaKegiatan: z.string().nonempty('Lama kegiatan wajib diisi'),
    jumlahDana: z.coerce.number().min(0),
    noSk: z.string().nonempty('Nomor SK wajib diisi'),
});

export const penyuluhanSatuSemesterSchema = z.object({
    kategori: z.literal(KategoriPengabdian.PENYULUHAN_MASYARAKAT_SEMESTER),
    judulMakalah: z.string().nonempty('Judul makalah wajib diisi'),
    namaPertemuan: z.string().nonempty('Nama pertemuan wajib diisi'),
    penyelenggara: z.string().nonempty('Penyelenggara wajib diisi'),
    tingkat: jenisTingkatPenyuluhanSemester,
    tglMulai: z.coerce.date({ 'message': 'Tanggal mulai wajib diisi' }),
});

export const penyuluhanKurangSatuSemesterSchema = z.object({
    kategori: z.literal(KategoriPengabdian.PENYULUHAN_MASYARAKAT_KURANG_SEMESTER),
    judulMakalah: z.string().nonempty('Judul makalah wajib diisi'),
    namaPertemuan: z.string().nonempty('Nama pertemuan wajib diisi'),
    tingkat: jenisTingkatPenyuluhanKurangSem,
    penyelenggara: z.string().nonempty('Penyelenggara wajib diisi'),
    tglMulai: z.coerce.date({ 'message': 'Tanggal mulai wajib diisi' }),
});

export const pelayananMasyarakatSchema = z.object({
    kategori: z.literal(KategoriPengabdian.PELAYANAN_MASYARAKAT),
    namaKegiatan: z.string().nonempty('Nama kegiatan wajib diisi'),
    jenisKegiatan: jenisPelayananMasyarakat,
    afiliasi: z.string().nonempty('Afiliasi wajib diisi'),
    lokasi: z.string().nonempty('Lokasi wajib diisi'),
    lamaKegiatan: z.string().nonempty('Lama kegiatan wajib diisi'),
    jumlahDana: z.coerce.number().min(0),
    noSk: z.string().nonempty('Nomor SK wajib diisi'),
});

export const karyaPengabianTidakPublisSchema = z.object({
    kategori: z.literal(KategoriPengabdian.KARYA_TIDAK_DIPUBLIKASIKAN),
    judulKarya: z.string().nonempty('Judul karya wajib diisi'),
    mitra: z.string().nonempty('Mitra wajib diisi'),
    jumlahDana: z.coerce.number().min(0),
    afiliasi: z.string().nonempty('Afiliasi wajib diisi'),
    tglPelaksanaan: z.coerce.date({ 'message': 'Tanggal pelaksanaan wajib diisi' }),
    lamaPelaksanaan: z.string().nonempty('Lama pelaksanaan wajib diisi'),
});

export const karyaPengabianDipublisSchema = z.object({
    kategori: z.literal(KategoriPengabdian.KARYA_DIPUBLIKASIKAN),
    judulKarya: z.string().nonempty('Judul karya wajib diisi'),
    mitra: z.string().nonempty('Mitra wajib diisi'),
    jumlahDana: z.coerce.number().min(0),
    afiliasi: z.string().nonempty('Afiliasi wajib diisi'),
    tglPelaksanaan: z.coerce.date({ 'message': 'Tanggal pelaksanaan wajib diisi' }),
    lamaPelaksanaan: z.string().nonempty('Lama pelaksanaan wajib diisi'),
    namaJurnal: z.string().nonempty('Penerbit wajib diisi'),
    tglTerbit: z.coerce.date({ message: "Tanggal terbit wajib diisi" }),
    isbn: z.string().nullable().optional(),
    issn: z.string().nullable().optional(),
    eissn: z.string().nullable().optional(),
});

export const pengelolaJurnalSchema = z.object({
    kategori: z.literal(KategoriPengabdian.PENGELOLAAN_JURNAL),
    namaJabatan: z.string().nonempty('Nama jabatan wajib diisi'),
    namaJurnal: z.string().nonempty('Nama jurnal wajib diisi'),
    tingkat: jenisTingkatPengelolaanJurnal,
    noSk: z.string().nonempty('Nomor SK wajib diisi'),
});

export const createPengabdianDtoSchema = z.discriminatedUnion('kategori', [
    jabatanPimpinanSchema,
    pengembanganDimanfaatkanSchema,
    penyuluhanSatuSemesterSchema,
    penyuluhanKurangSatuSemesterSchema,
    pelayananMasyarakatSchema,
    karyaPengabianTidakPublisSchema,
    karyaPengabianDipublisSchema,
    pengelolaJurnalSchema
]);

export const fullCreatePengabdianSchema = pengabdianBaseSchema.and(createPengabdianDtoSchema);

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

export type CreatePengabdianFullDto = z.infer<typeof fullCreatePengabdianSchema>;
export type UpdateStatusValidasiDto = z.infer<typeof updateStatusValidasiSchema>;