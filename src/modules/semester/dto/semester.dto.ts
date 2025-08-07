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

export const findSemesterQuerySchema = z
  .object({
    page: z.string().optional().transform(val => (val ? parseInt(val) : 1)).refine(val => !isNaN(val) && val > 0, { message: 'Page harus angka positif' }),
    limit: z.string().optional().transform(val => (val ? parseInt(val) : 10)).refine(val => !isNaN(val) && val > 0 && val <= 100, { message: 'Limit harus antara 1–100' }),
    search: z.string().optional(),
    tahunMulai: z.string().optional().transform(val => (val ? parseInt(val) : undefined)).refine(val => val === undefined || (!isNaN(val) && val >= 2000), { message: 'Tahun mulai tidak valid' }),
    tahunSelesai: z.string().optional().transform(val => (val ? parseInt(val) : undefined)).refine(val => val === undefined || (!isNaN(val) && val <= 3000), { message: 'Tahun selesai tidak valid' }),
    sortBy: z.string().optional().default('tahunMulai'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
    tipe: z.string().transform(val => (val === '' ? undefined : val)).optional().pipe(z.nativeEnum(NamaSemester).optional()),
    status: z.string().transform(val => (val === '' ? undefined : val)).optional().pipe(z.nativeEnum(SemesterStatus).optional()),
  })
  .refine(data => !data.tahunMulai || !data.tahunSelesai || data.tahunMulai <= data.tahunSelesai, {
    message: 'Tahun mulai tidak boleh lebih besar dari tahun selesai',
    path: ['tahunMulai'],
  });

export type CreateSemesterDto = z.infer<typeof createSemesterSchema>;
export type UpdateSemesterDto = z.infer<typeof updateSemesterSchema>;
export type Semester = z.infer<typeof semesterResponseSchema>;
export type FindSemesterQueryDto = z.infer<typeof findSemesterQuerySchema>;