import z from "zod";

export const createProdiSchema = z.object({
  kode: z.string().trim().min(2, { message: 'Kode minimal 2 karakter' }),
  nama: z.string().trim().min(2, { message: 'Nama minimal 2 karakter' }),
  fakultasId: z
    .number()
    .refine(val => typeof val === 'number', { message: 'Fakultas wajib dipilih' })
    .int({ message: 'ID fakultas harus bilangan bulat' })
    .positive({ message: 'ID fakultas harus positif' }),
});

export const prodiResponseSchema = createProdiSchema.extend({
  id: z.number(),
})

export type CreateProdiDto = z.infer<typeof createProdiSchema>;
export const updateProdiSchema = createProdiSchema.partial();
export type UpdateProdiDto = z.infer<typeof updateProdiSchema>;
export type Prodi = z.infer<typeof prodiResponseSchema>;