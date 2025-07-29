import { z } from 'zod';

export const pendidikanBaseUpdateSchema = z.object({
  id: z.coerce.number().positive({ message: 'ID pendidikan harus diisi' }),
  dosenId: z.coerce.number().positive({ message: 'ID dosen harus diisi' }),
  filePath: z.string().min(6, { message: 'Path file minimal 6 karakter' }).optional(),
});

export const pendidikanFormalUpdateSchema = z.object({
  kategori: z.literal('FORMAL'),
  jenjang: z.enum(['S1', 'S2', 'S3'], { message: 'Jenjang harus S1, S2, atau S3' }).optional(),
  prodi: z.string().min(1, { message: 'Prodi wajib diisi' }).optional(),
  fakultas: z.string().min(1, { message: 'Fakultas wajib diisi' }).optional(),
  perguruanTinggi: z.string().min(1, { message: 'Perguruan Tinggi wajib diisi' }).optional(),
  lulusTahun: z.coerce.number().int({ message: 'Tahun lulus harus berupa bilangan bulat' }).optional(),
});

export const pendidikanDiklatUpdateSchema = z.object({
  kategori: z.literal('DIKLAT'),
  namaDiklat: z.string().min(1, { message: 'Nama Diklat wajib diisi' }).optional(),
  jenisDiklat: z.string().min(1, { message: 'Jenis Diklat wajib diisi' }).optional(),
  penyelenggara: z.string().min(1, { message: 'Penyelenggara wajib diisi' }).optional(),
  peran: z.string().min(1, { message: 'Peran wajib diisi' }).optional(),
  tingkatan: z.string().min(1, { message: 'Tingkatan wajib diisi' }).optional(),
  jumlahJam: z.coerce.number().positive({ message: 'Jumlah jam harus lebih dari 0' }).optional(),
  noSertifikat: z.string().min(1, { message: 'No Sertifikat wajib diisi' }).optional(),
  tglSertifikat: z.coerce.date({ message: 'Tanggal sertifikat wajib diisi' }).optional(),
  tempat: z.string().min(1, { message: 'Tempat wajib diisi' }).optional(),
  tglMulai: z.coerce.date({ message: 'Tanggal mulai wajib diisi' }).optional(),
  tglSelesai: z.coerce.date({ message: 'Tanggal selesai wajib diisi' }).optional(),
});

export const updatePendidikanDtoSchema = z.discriminatedUnion('kategori', [
  pendidikanFormalUpdateSchema,
  pendidikanDiklatUpdateSchema,
]);

export type UpdatePendidikanDto = z.infer<typeof updatePendidikanDtoSchema>;

export const fullUpdatePendidikanSchema = z.intersection(
  pendidikanBaseUpdateSchema,
  updatePendidikanDtoSchema
);

