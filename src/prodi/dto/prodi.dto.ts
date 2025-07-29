import z from "zod";

export const createProdiSchema = z.object({
  kode: z.string().min(2),
  nama: z.string().min(2),
  fakultasId: z.number().int().positive(),
});

export const prodiResponseSchema = createProdiSchema.extend({
  id: z.number(),
})

export type CreateProdiDto = z.infer<typeof createProdiSchema>;
export const updateProdiSchema = createProdiSchema.partial();
export type UpdateProdiDto = z.infer<typeof updateProdiSchema>;
export type Prodi = z.infer<typeof prodiResponseSchema>;