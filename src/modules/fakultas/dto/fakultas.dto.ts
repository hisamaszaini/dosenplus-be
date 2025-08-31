import z from "zod";

export const createFakultasSchema = z.object({
  externalId: z.number().nullable().optional(),
  kode: z.string().min(1, { message: 'Kode fakultas minimal 1 karakter' }),
  nama: z.string().min(5, { message: 'Nama fakultas minimal 5 karakter' }),
});

export const updateFakultasSchema = z.object({
  externalId: z.number().nullable().optional(),
  kode: z.string().min(1, { message: 'Kode fakultas minimal 1 karakter' }).optional(),
  nama: z.string().min(5, { message: 'Nama fakultas minimal 5 karakter' }).optional(),
});

export const fakultasResponseSchema = createFakultasSchema.extend({
  id: z.number(),
});

export type CreateFakultasDto = z.infer<typeof createFakultasSchema>;
export type UpdateFakultasDto = z.infer<typeof updateFakultasSchema>;
export type Fakultas = z.infer<typeof fakultasResponseSchema>;