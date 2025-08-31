import z from "zod";

export const JenjangEnum = z.enum(["DI", "D2", "D3", "D4", "S1", "S2", "S3"]);

export const baseProdiSchema = z.object({
  externalId: z.number().nullable().optional(),
  kodeFp: z.string().nullable().optional(),
  kode: z.string().min(1, { message: "Kode prodi minimal 1 karakter" }),
  nama: z.string().min(5, { message: "Nama prodi minimal 5 karakter" }),
  jenjang: JenjangEnum,
  fakultasId: z
    .number()
    .int({ message: "ID fakultas harus bilangan bulat" })
    .positive({ message: "ID fakultas harus positif" })
    .refine(val => val !== null && val !== undefined, {
      message: "Fakultas wajib dipilih",
    }),
});

export const createProdiSchema = baseProdiSchema;
export const updateProdiSchema = baseProdiSchema.partial();
export const prodiResponseSchema = baseProdiSchema.extend({
  id: z.number(),
});

// Types
export type CreateProdiDto = z.infer<typeof createProdiSchema>;
export type UpdateProdiDto = z.infer<typeof updateProdiSchema>;
export type Prodi = z.infer<typeof prodiResponseSchema>;
