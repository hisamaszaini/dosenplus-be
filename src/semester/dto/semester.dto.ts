import { NamaSemester } from "@prisma/client";
import z from "zod";

export const createSemesterSchema = z.object({
  tipe: z.nativeEnum(NamaSemester),
  tahunMulai: z.number().min(2000, { message: 'Tahun mulai harus 4 digit angka' }).max(3000, { message: 'Tahun mulai harus 4 digit angka' }),
  tahunSelesai: z.number() .min(2000, { message: 'Tahun selesai harus 4 digit angka' }) .max(3000, { message: 'Tahun selesai harus 4 digit angka' }),
  status: z.boolean(),
}).refine(data => data.tahunSelesai > data.tahunMulai, {
  message: 'Tahun selesai harus lebih besar dari tahun mulai',
  path: ['tahunSelesai'],
});

export const updateSemesterSchema = createSemesterSchema;

export const semesterResponseSchema = createSemesterSchema.extend({
  id: z.number(),
  kode: z.string(),
  nama: z.string(),
});

export type CreateSemesterDto = z.infer<typeof createSemesterSchema>;
export type UpdateSemesterDto = z.infer<typeof updateSemesterSchema>;
export type Semester = z.infer<typeof semesterResponseSchema>; 