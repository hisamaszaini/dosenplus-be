import { KategoriPendidikan, StatusValidasi } from '@prisma/client';
import { z } from 'zod';

export const pendidikanBaseSchema = z.object({
  dosenId: z.coerce.number().positive({ message: 'ID Dosen diisi' }).optional(),
  filePath: z.string().min(6),
});

export const pendidikanFormalSchema = z.object({
  kategori: z.literal(KategoriPendidikan.FORMAL),
  jenjang: z.enum(['S1', 'S2', 'S3']),
  prodi: z.string().trim().min(1, { message: 'Prodi wajib diisi' }),
  fakultas: z.string().trim().min(1, { message: 'Fakultas wajib diisi' }),
  perguruanTinggi: z.string().min(1, { message: 'Perguruan Tinggi wajib diisi' }),
  lulusTahun: z.coerce.number().int().gte(1950).lte(new Date().getFullYear()),
});

export const pendidikanDiklatSchema = z.object({
  kategori: z.literal(KategoriPendidikan.DIKLAT),
  namaDiklat: z.string().trim().min(1, { message: 'Nama Diklat wajib diisi' }),
  jenisDiklat: z.string().trim().min(1, { message: 'Jenis Diklat wajib diisi' }),
  penyelenggara: z.string().trim().min(1, { message: 'Penyelenggara wajib diisi' }),
  peran: z.string().trim().min(1, { message: 'Peran wajib diisi' }),
  tingkatan: z.string().trim().min(1, { message: 'Tingkatan wajib diisi' }),
  jumlahJam: z.coerce.number().positive({ message: 'Jumlah Jam wajib diisi' }),
  noSertifikat: z.string().trim().min(1, { message: 'No Sertifikat wajib diisi' }),
  tglSertifikat: z.coerce.date().refine(d => !isNaN(d.getTime()), {
    message: 'Tanggal Sertifikat wajib diisi dan harus valid.',
  }),
  tempat: z.string().trim().min(1, { message: 'Tempat wajib diisi' }),
  tglMulai: z.coerce.date().refine(d => !isNaN(d.getTime()), {
    message: 'Tanggal mulai wajib diisi dan harus valid.',
  }),
  tglSelesai: z.coerce.date().refine(d => !isNaN(d.getTime()), {
    message: 'Tanggal selesai wajib diisi dan harus valid.',
  }),
}).refine(data => data.tglSelesai >= data.tglMulai, {
  message: 'Tanggal selesai tidak boleh sebelum tanggal mulai.',
  path: ['tglSelesai'],
});

export const createPendidikanDtoSchema = z.discriminatedUnion('kategori', [
  pendidikanFormalSchema,
  pendidikanDiklatSchema,
]);

export type CreatePendidikanDto = z.infer<typeof createPendidikanDtoSchema>;

export const fullPendidikanSchema = z.intersection(
  pendidikanBaseSchema,
  createPendidikanDtoSchema
);

export type CreatePendidikanFullDto = z.infer<typeof fullPendidikanSchema>;

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

export type UpdateStatusValidasiDto = z.infer<typeof updateStatusValidasiSchema>;