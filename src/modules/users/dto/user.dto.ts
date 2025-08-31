import { Dosen, StatusValidasi, TypeUserRole, UserStatus, Validator } from '@prisma/client';
import { z } from 'zod';

export const USER_STATUSES = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  PENDING: 'PENDING',
} as const;

export type UserStatusType = typeof USER_STATUSES[keyof typeof USER_STATUSES];

export const USER_ROLES = {
  ADMIN: 'ADMIN',
  DOSEN: 'DOSEN',
  VALIDATOR: 'VALIDATOR',
} as const;

// export type TypeUserRoleDeclared = typeof USER_ROLES[keyof typeof USER_ROLES];
export type TypeUserRoleDeclared = keyof typeof USER_ROLES;

export const optionalStringToNull = z
  .string()
  .optional()
  .transform(val => val?.trim() === '' ? null : val)
  .nullable();

export const LoginSchema = z.object({
  email: z.string().email({ message: 'Format email tidak valid' }),
  password: z.string().min(1, { message: 'Password tidak boleh kosong' }),
});

export const CreateDosenBiodataSchema = z.object({
  nama: z.string().nonempty('Nama wajib diisi'),
  nik: z.string().nullable().optional().transform(val => val?.trim() === '' ? null : val),
  nuptk: z.string().nullable().optional().transform(val => val?.trim() === '' ? null : val),
  jenis_kelamin: z.string().refine((val): val is 'Laki-laki' | 'Perempuan' => val === 'Laki-laki' || val === 'Perempuan', { message: 'Jenis kelamin wajib dipilih' }),
  no_hp: z.string().nullable().optional().transform(val => val?.trim() === '' ? null : val),
  prodiId: z.preprocess(val => { const num = Number(val); return isNaN(num) || num <= 0 ? undefined : num }, z.number().int().refine(val => val > 0, { message: 'Program studi wajib dipilih' })),
  fakultasId: z.preprocess(val => { const num = Number(val); return isNaN(num) || num <= 0 ? undefined : num }, z.number().int().refine(val => val > 0, { message: 'Fakultas wajib dipilih' })),
  jabatan: z.string().refine((val): val is 'Asisten Ahli' | 'Lektor' | 'Lektor Kepala' | 'Guru Besar' => ['Asisten Ahli', 'Lektor', 'Lektor Kepala', 'Guru Besar'].includes(val), { message: 'Jabatan wajib dipilih' }),
  tmt: z .union([ z.literal('').transform(() => null), z.coerce.date({ message: 'TMT / Tanggal Terhitung Mulai tidak valid' })]).nullable().optional()
});

export const CreateDataKepegawaianSchema = z.object({
  npwp: z.string().nullable().optional().transform(val => val?.trim() === '' ? null : val),
  nama_bank: z.string().nullable().optional().transform(val => val?.trim() === '' ? null : val),
  no_rek: z.string().nullable().optional().transform(val => val?.trim() === '' ? null : val),
  bpjs_kesehatan: z.string().nullable().optional().transform(val => val?.trim() === '' ? null : val),
  bpjs_tkerja: z.string().nullable().optional().transform(val => val?.trim() === '' ? null : val),
  no_kk: z.string().nullable().optional().transform(val => val?.trim() === '' ? null : val),
});

export const CreateValidatorBiodataSchema = z.object({
  nama: z.string().nonempty('Nama wajib diisi'),
  nik: z.string().nullable().optional().transform(val => val?.trim() === '' ? null : val),
  jenis_kelamin: z.string().refine((val): val is 'Laki-laki' | 'Perempuan' => val === 'Laki-laki' || val === 'Perempuan', { message: 'Jenis kelamin wajib dipilih' }),
  no_hp: z.string().nullable().optional().transform(val => val?.trim() === '' ? null : val),
});

export const UserStatusEnum = Object.values(USER_STATUSES) as [string, ...string[]];
export const UserRoleEnum = Object.values(USER_ROLES) as [string, ...string[]];

export const CreateUserSchema = z
  .object({
    email: z.string().nonempty('Email wajib diisi').email('Format email tidak valid'),
    username: z.string().nonempty('Username wajib diisi').min(3, 'Username minimal 3 karakter'),
    name: z.string().nonempty('Nama wajib diisi'),
    status: z.nativeEnum(UserStatus).optional().default(UserStatus.ACTIVE),
    password: z.string().nonempty('Password wajib diisi').min(8, 'Password minimal 8 karakter'),
    confirmPassword: z.string().nonempty('Konfirmasi password wajib diisi').min(8, 'Konfirmasi password minimal 8 karakter'),
    roles: z.array(z.nativeEnum(USER_ROLES)).min(1, 'Setidaknya pilih 1 role'),
    // fotoPath: z.string().optional(),
  }).extend({
    fotoPath: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Password dan konfirmasi password tidak cocok',
    path: ['confirmPassword'],
  });

export const CreateFlexibleUserSchema = z.object({
  dataUser: CreateUserSchema,
  dosenBiodata: CreateDosenBiodataSchema.optional(),
  validatorBiodata: CreateValidatorBiodataSchema.optional(),
  dataKepegawaian: CreateDataKepegawaianSchema.optional(),
}).superRefine((data, ctx) => {
  const roles = data.dataUser.roles || [];

  if (roles.includes('DOSEN')) {
    if (!data.dosenBiodata) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['dosenBiodata'],
        message: 'Data dosen wajib diisi karena role DOSEN dipilih',
      });
    }
  }

  if (roles.includes('VALIDATOR')) {
    if (!data.validatorBiodata) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['validatorBiodata'],
        message: 'Data validator wajib diisi karena role VALIDATOR dipilih',
      });
    }
  }
});

export const RoleDataSchema = z.object({
  id: z.number(),
  name: z.enum(UserRoleEnum),
});

export const UserRoleSchema = z.object({
  id: z.number(),
  userId: z.number(),
  roleId: z.number(),
  role: RoleDataSchema,
});

export const BaseUpdateUserSchema = CreateUserSchema.partial().refine(
  (data) => {
    if (data.password || data.confirmPassword) {
      return data.password === data.confirmPassword;
    }
    return true;
  },
  {
    message: 'Password dan konfirmasi password tidak cocok',
    path: ['confirmPassword'],
  }
);

export const UpdateAdminProfileSchema = z.object({
  dataUser: BaseUpdateUserSchema.optional(),
});

export const UpdateDosenProfileSchema = z.object({
  dataUser: BaseUpdateUserSchema.optional(),
  biodata: CreateDosenBiodataSchema.partial().optional(),
  dataKepegawaian: CreateDataKepegawaianSchema.partial().optional(),
});

export const UpdateValidatorProfileSchema = z.object({
  dataUser: BaseUpdateUserSchema.optional(),
  validatorBiodata: CreateValidatorBiodataSchema.partial().optional(),
});

export const UpdateFlexibleUserSchema = z.object({
  dataUser: BaseUpdateUserSchema,
})
  .and(z.object({
    dosenBiodata: CreateDosenBiodataSchema.optional(),
    dataKepegawaian: CreateDataKepegawaianSchema.optional(),
  }).partial())
  .and(z.object({
    validatorBiodata: CreateValidatorBiodataSchema,
  }).partial())
  .superRefine((data, ctx) => {
    const roles = data.dataUser.roles || [];

    if (roles.includes('DOSEN') && !data.dosenBiodata) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['dosenBiodata'],
        message: 'Biodata DOSEN wajib diisi karena role DOSEN dipilih.',
      });
    }

    if (!roles.includes('DOSEN') && data.dosenBiodata) {
      const isEmpty = Object.values(data.dosenBiodata).every(
        (val) => val === '' || val === null || val === undefined || val === 0
      );
      if (!isEmpty) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['dosenBiodata'],
          message: 'Role DOSEN tidak dipilih, tetapi biodata DOSEN dikirim.',
        });
      }
    }

    if (roles.includes('VALIDATOR') && !data.validatorBiodata) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['validatorBiodata'],
        message: 'Biodata VALIDATOR wajib diisi karena role VALIDATOR dipilih.',
      });
    }

    if (!roles.includes('VALIDATOR') && data.validatorBiodata) {
      const isEmpty = Object.values(data.validatorBiodata).every(
        (val) => val === '' || val === null || val === undefined
      );
      if (!isEmpty) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['validatorBiodata'],
          message: 'Role VALIDATOR tidak dipilih, tetapi biodata VALIDATOR dikirim.',
        });
      }
    }
  });

export const ChangePasswordSchema = z
  .object({
    oldPassword: z.string().min(1),
    newPassword: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Password baru dan konfirmasi password tidak cocok',
    path: ['confirmPassword'],
  })
  .refine((data) => data.oldPassword !== data.newPassword, {
    message: 'Password baru harus berbeda dari password lama',
    path: ['newPassword'],
  });

export const UpdateUserStatusSchema = z.object({
  status: z.nativeEnum(UserStatus),
});

export const PaginationMetaSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
  hasNext: z.boolean(),
  hasPrev: z.boolean(),
});

export type User = {
  id: number;
  name: string;
  email: string;
  username: string;
  fotoPath?: string;
  status: UserStatus;
  userRoles: UserRole[];
  dosen?: Dosen | null;
  validator?: Validator | null;
};


export type LoginDto = z.infer<typeof LoginSchema>;

export type CreateFlexibleUserDto = z.infer<typeof CreateFlexibleUserSchema>;

export type UpdateDosenProfileDto = z.infer<typeof UpdateDosenProfileSchema>;
export type UpdateAdminProfileDto = z.infer<typeof UpdateAdminProfileSchema>;
export type UpdateValidatorProfileDto = z.infer<typeof UpdateValidatorProfileSchema>;
export type ChangePasswordDto = z.infer<typeof ChangePasswordSchema>;
export type UpdateUserStatusDto = z.infer<typeof UpdateUserStatusSchema>;
export type UpdateDataKepegawaianDto = z.infer<typeof CreateDataKepegawaianSchema>;
export type UpdateFlexibleUserDto = z.infer<typeof UpdateFlexibleUserSchema>;
export type RoleData = z.infer<typeof RoleDataSchema>;
export type UserRole = z.infer<typeof UserRoleSchema>;

export enum StatusValidationEnum {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export const CreatePendingUpdateSchema = z.object({
  // Biodata
  nama: z.string().nonempty(),
  nik: z.string().optional().nullable(),
  nuptk: z.string().optional().nullable(),
  jenis_kelamin: z.enum(['Laki-laki', 'Perempuan']),
  no_hp: z.string().optional().nullable(),
  prodiId: z.number(),
  fakultasId: z.number(),
  jabatan: z.string().nonempty('Jabatan wajib diisi').refine((val): val is 'Asisten Ahli' | 'Lektor' | 'Lektor Kepala' | 'Guru Besar' =>
      ['Asisten Ahli', 'Lektor', 'Lektor Kepala', 'Guru Besar'].includes(val),
    { message: 'Jabatan wajib dipilih dari daftar yang tersedia' },
  ),

  // Kepegawaian
  npwp: z.string().optional().nullable(),
  nama_bank: z.string().optional().nullable(),
  no_rek: z.string().optional().nullable(),
  bpjs_kesehatan: z.string().optional().nullable(),
  bpjs_tkerja: z.string().optional().nullable(),
  no_kk: z.string().optional().nullable(),
});

export const ValidatePendingUpdateSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  catatan: z.string().optional().nullable(),
}).superRefine((data, ctx) => {
  if (data.status === 'REJECTED' && (!data.catatan || data.catatan.trim() === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['catatan'],
      message: 'Catatan penolakan wajib diisi.',
    });
  }
});

export type CreatePendingUpdateDto = z.infer<typeof CreatePendingUpdateSchema>;
export type ValidatePendingUpdateDto = z.infer<typeof ValidatePendingUpdateSchema>;