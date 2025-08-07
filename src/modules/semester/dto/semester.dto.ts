import { NamaSemester, SemesterStatus } from "@prisma/client";
import z from "zod";

export const createSemesterSchema = z.object({
  tipe: z.nativeEnum(NamaSemester).refine((val) => Object.values(NamaSemester).includes(val), {
    message: 'Tipe semester tidak valid.',
  }),
  tahunMulai: z.number().min(2000, { message: 'Tahun mulai harus 4 digit angka' }).max(3000, { message: 'Tahun mulai harus 4 digit angka' }),
  tahunSelesai: z.number().min(2000, { message: 'Tahun selesai harus 4 digit angka' }).max(3000, { message: 'Tahun selesai harus 4 digit angka' }),
  // status: z.union([z.boolean(), z.string().refine((val) => val === 'true' || val === 'false', { message: 'Status harus bernilai "true" atau "false".', }),
  // ]).transform((val) => val === 'true' || val === true)
  status: z.nativeEnum(SemesterStatus)
    .refine((val) => Object.values(SemesterStatus).includes(val), {
      message: 'Status harus bernilai "ACTIVE" atau "INACTIVE".',
    }),
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