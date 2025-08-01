import { Dosen, TypeUserRole, UserStatus, Validator } from '@prisma/client';
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
  nama: z.string().min(3),
  nip: z.string().optional().nullable().transform((val) => (val?.trim() === '' ? null : val)),
  nuptk: z.string().optional().nullable().transform((val) => (val?.trim() === '' ? null : val)),
  jenis_kelamin: z.enum(['Laki-laki', 'Perempuan']),
  no_hp: z.string().optional().nullable().transform((val) => (val?.trim() === '' ? null : val)),
  prodiId: z.preprocess((val) => Number(val), z.number().int()),
  fakultasId: z.preprocess((val) => Number(val), z.number().int()),
  jabatan: z.enum(['Asisten Ahli', 'Lektor', 'Lektor Kepala', 'Guru Besar']),
});

export const CreateValidatorBiodataSchema = z.object({
  nama: z.string().min(3),
  nip: z.string().optional().nullable().transform((val) => (val?.trim() === '' ? null : val)),
  jenis_kelamin: z.enum(['Laki-laki', 'Perempuan']),
  no_hp: z.string().optional().nullable().transform((val) => (val?.trim() === '' ? null : val)),
});

export const CreateDataKepegawaianSchema = z.object({
  npwp: z.string().optional().nullable().transform((val) => (val?.trim() === '' ? null : val)),
  nama_bank: z.string().optional(),
  no_rek: z.string().optional(),
  bpjs_kesehatan: z.string().optional(),
  bpjs_tkerja: z.string().optional(),
  no_kk: z.string().optional(),
});

export const UserStatusEnum = Object.values(USER_STATUSES) as [string, ...string[]];
export const UserRoleEnum = Object.values(USER_ROLES) as [string, ...string[]];

export const CreateUserSchema = z
  .object({
    email: z.string().email(),
    username: z.string().min(3),
    name: z.string().min(3),
    // status: z.nativeEnum(UserStatus).optional(),
    status: z.enum(UserStatusEnum).optional(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
    // roles: z.array(z.nativeEnum(TypeUserRole)).optional(),
    // roles: z.array(z.enum(UserRoleEnum)).optional(),
    roles: z.array(z.nativeEnum(USER_ROLES)).optional()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Password dan konfirmasi password tidak cocok',
    path: ['confirmPassword'],
  });
  // .transform(({ confirmPassword, ...rest }) => rest);

export const CreateFlexibleUserSchema = z.object({
  dataUser: CreateUserSchema,
  dosenBiodata: CreateDosenBiodataSchema.optional(),
  validatorBiodata: CreateValidatorBiodataSchema.optional(),
  dataKepegawaian: CreateDataKepegawaianSchema.optional(),
});

export const RoleDataSchema = z.object({
  id: z.number(),
  // name: z.nativeEnum(TypeUserRole),
  name: z.enum(UserRoleEnum),
});

export const UserRoleSchema = z.object({
  id: z.number(),
  userId: z.number(),
  roleId: z.number(),
  role: RoleDataSchema,
});

export const DataKepegawaianSchema = z.object({
  id: z.number().optional(),
  npwp: z.string().optional().nullable().transform((val) => (val?.trim() === '' ? null : val)),
  nama_bank: z.string().nullable(),
  no_rek: z.string().nullable(),
  bpjs_kesehatan: z.string().nullable(),
  bpjs_tkerja: z.string().nullable(),
  no_kk: z.string().nullable(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const BaseUpdateUserSchema = z
  .object({
    email: z.string().email(),
    username: z.string().min(3),
    name: z.string().min(3),
    status: z.nativeEnum(UserStatus),
    password: z.string().min(8).optional().or(z.literal('')),
    confirmPassword: z.string().min(8).optional().or(z.literal('')),
    roles: z.array(z.nativeEnum(USER_ROLES)).optional()
  })
  .refine((data) => {
    if (data.password || data.confirmPassword) {
      return data.password === data.confirmPassword;
    }
    return true;
  }, {
    message: 'Password dan konfirmasi password tidak cocok',
    path: ['confirmPassword'],
  });

export const UpdateAdminProfileSchema = z.object({
  dataUser: BaseUpdateUserSchema,
});

export const UpdateDosenProfileSchema = z.object({
  dataUser: BaseUpdateUserSchema,
  biodata: CreateDosenBiodataSchema,
  dataKepegawaian: CreateDataKepegawaianSchema.optional(),
});

export const UpdateValidatorProfileSchema = z.object({
  dataUser: BaseUpdateUserSchema,
  biodata: CreateValidatorBiodataSchema,
});

export const UpdateFlexibleUserSchema = z.object({
  dataUser: BaseUpdateUserSchema,
}).and(z.object({
  dosenBiodata: CreateDosenBiodataSchema,
  dataKepegawaian: CreateDataKepegawaianSchema.optional(),
}).partial())
  .and(z.object({
    validatorBiodata: CreateValidatorBiodataSchema,
  }).partial())
  .refine(data => !(data.dataUser.roles?.includes('DOSEN') && !data.dosenBiodata), {
    message: 'Biodata DOSEN wajib diisi karena role DOSEN dipilih.',
    path: ['dosenBiodata']
  })
  .refine(data => !(data.dataUser.roles?.includes('VALIDATOR') && !data.validatorBiodata), {
    message: 'Biodata VALIDATOR wajib diisi karena role VALIDATOR dipilih.',
    path: ['validatorBiodata']
  })
  .refine(data => !(data.dosenBiodata && !data.dataUser.roles?.includes('DOSEN')), {
    message: 'Role DOSEN tidak dipilih, tetapi biodata DOSEN dikirim.',
    path: ['dosenBiodata']
  })
  .refine(data => !(data.validatorBiodata && !data.dataUser.roles?.includes('VALIDATOR')), {
    message: 'Role VALIDATOR tidak dipilih, tetapi biodata VALIDATOR dikirim.',
    path: ['validatorBiodata']
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
  status: UserStatus;
  userRoles: UserRole[];
  dosen?: Dosen | null;
  validator?: Validator | null;
};


export type LoginDto = z.infer<typeof LoginSchema>;

export type CreateFlexibleUserDto = z.infer<typeof CreateFlexibleUserSchema>;

// export type CreateAdminUserDto = z.infer<typeof CreateAdminUserSchema>;
// export type CreateValidatorUserDto = z.infer<typeof CreateValidatorUserSchema>;
// export type CreateDosenUserDto = z.infer<typeof CreateDosenUserSchema>;

export type UpdateDosenProfileDto = z.infer<typeof UpdateDosenProfileSchema>;
export type UpdateAdminProfileDto = z.infer<typeof UpdateAdminProfileSchema>;
export type UpdateValidatorProfileDto = z.infer<typeof UpdateValidatorProfileSchema>;
export type ChangePasswordDto = z.infer<typeof ChangePasswordSchema>;
export type UpdateUserStatusDto = z.infer<typeof UpdateUserStatusSchema>;
export type UpdateDataKepegawaianDto = z.infer<typeof DataKepegawaianSchema>;
export type UpdateFlexibleUserDto = z.infer<typeof UpdateFlexibleUserSchema>;
export type RoleData = z.infer<typeof RoleDataSchema>;
export type UserRole = z.infer<typeof UserRoleSchema>;
