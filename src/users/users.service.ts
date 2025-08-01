import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'prisma/prisma.service';
import { Prisma, PrismaClient, TypeUserRole, UserRole, UserStatus } from '@prisma/client';
import { HashAndEncryptService } from 'src/utils/hashAndEncrypt';

import { BaseUpdateUserSchema, ChangePasswordDto, ChangePasswordSchema, CreateFlexibleUserSchema, UpdateDosenProfileSchema, UpdateFlexibleUserDto, UpdateFlexibleUserSchema, UpdateValidatorProfileSchema, type CreateFlexibleUserDto } from './dto/user.dto';
import z from 'zod';

const SALT_ROUNDS = 10;
type TransactionClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService, private hashEncryptUtil: HashAndEncryptService) { }

    private async validateUniqueUser(email: string, username: string) {
        const existingUser = await this.prisma.user.findFirst({ where: { OR: [{ email }, { username }] } });
        const errors: Record<string, string> = {};
        if (existingUser) {
            if (existingUser.email === email) errors.email = 'Email sudah digunakan.';
            if (existingUser.username === username) errors.username = 'Username sudah digunakan.';
        }
        if (Object.keys(errors).length > 0) throw new BadRequestException(errors);
    }

    private async validateFakultasProdi(fakultasId: number, prodiId: number) {
        const fakultas = await this.prisma.fakultas.findUnique({ where: { id: fakultasId } });
        if (!fakultas) throw new BadRequestException('Fakultas tidak ditemukan.');
        const prodi = await this.prisma.prodi.findUnique({ where: { id: prodiId, fakultasId } });
        if (!prodi) throw new BadRequestException('Program Studi tidak ditemukan atau tidak sesuai dengan fakultas.');
    }

    private async validateUniqueBiodata(userId: number, dto: UpdateFlexibleUserDto) {
        const errors: Record<string, string> = {};

        if (dto.dosenBiodata) {
            const { nip, nuptk, no_hp } = dto.dosenBiodata;

            if (nip) {
                const existing = await this.prisma.dosen.findFirst({
                    where: { nip, NOT: { id: userId } },
                });
                if (existing) errors['dosenBiodata.nip'] = 'NIP sudah digunakan oleh dosen lain.';
            }

            if (nuptk) {
                const existing = await this.prisma.dosen.findFirst({
                    where: { nuptk, NOT: { id: userId } },
                });
                if (existing) errors['dosenBiodata.nuptk'] = 'NUPTK sudah digunakan oleh dosen lain.';
            }

            if (no_hp) {
                const existing = await this.prisma.dosen.findFirst({
                    where: { no_hp, NOT: { id: userId } },
                });
                if (existing) errors['dosenBiodata.no_hp'] = 'No. HP sudah digunakan oleh dosen lain.';
            }
        }

        if (dto.validatorBiodata) {
            const { nip, no_hp } = dto.validatorBiodata;

            if (nip) {
                const existing = await this.prisma.validator.findFirst({
                    where: { nip, NOT: { id: userId } },
                });
                if (existing) errors['validatorBiodata.nip'] = 'NIP sudah digunakan oleh validator lain.';
            }

            if (no_hp) {
                const existing = await this.prisma.validator.findFirst({
                    where: { no_hp, NOT: { id: userId } },
                });
                if (existing) errors['validatorBiodata.no_hp'] = 'No. HP sudah digunakan oleh validator lain.';
            }
        }

        if (Object.keys(errors).length > 0) {
            throw new BadRequestException({ success: false, message: errors, data: null });
        }
    }


    private async getRoleId(tx: PrismaService | TransactionClient, roleName: TypeUserRole): Promise<number> {
        const role = await tx.role.findUnique({ where: { name: roleName } });
        if (!role) throw new BadRequestException(`Role ${roleName} not found`);
        return role.id;
    }

    async findById(id: number) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                userRoles: { include: { role: true } },
                dosen: { include: { dataKepegawaian: true, fakultas: true, prodi: true, pendidikan: true } },
                validator: true,
            },
        });
        if (!user) throw new NotFoundException('User tidak ditemukan.');
        const { password, hashedRefreshToken, ...userData } = user;
        return { success: true, data: userData };
    }

    private async createUserWithRoles(tx: TransactionClient, dataUser: any, roles: TypeUserRole[]) {
        const hashedPassword = await this.hashEncryptUtil.hashPassword(dataUser.password);
        const user = await tx.user.create({
            data: {
                email: dataUser.email,
                username: dataUser.username,
                name: dataUser.name,
                password: hashedPassword,
                status: dataUser.status
            },
        });
        for (const roleName of roles) {
            const roleId = await this.getRoleId(tx, roleName);
            await tx.userRole.create({ data: { userId: user.id, roleId } });
        }
        return user;
    }

    private async handleProfileCreationByRole(tx: TransactionClient, userId: number, dto: any) {
        if (dto.dosenBiodata) {
            if (dto.dosenBiodata.nip === undefined) {
                dto.dosenBiodata.nip = null;
            }
            await tx.dosen.create({ data: { ...dto.dosenBiodata, id: userId } });
            if (dto.dataKepegawaian) {
                await tx.dataKepegawaian.create({ data: { ...dto.dataKepegawaian, id: userId } });
            }
        }
        if (dto.validatorBiodata) {
            await tx.validator.create({ data: { ...dto.validatorBiodata, id: userId } });
        }
    }

    async create(dto: CreateFlexibleUserDto) {
        const validationResult = CreateFlexibleUserSchema.safeParse(dto);

        if (!validationResult.success) {
            const zodErrors: Record<string, string> = {};
            for (const issue of validationResult.error.issues) {
                const path = issue.path.join('.');
                zodErrors[path] = issue.message;
            }
            throw new BadRequestException({
                success: false,
                message: zodErrors,
                data: null,
            });
        }

        const validatedData = validationResult.data;

        await this.validateUniqueUser(validatedData.dataUser.email, validatedData.dataUser.username);

        const roles = validatedData.dataUser.roles || [];
        const roleValidationErrors: string[] = [];

        if (roles.includes('DOSEN') && !validatedData.dosenBiodata) {
            roleValidationErrors.push('Role DOSEN ditentukan, tetapi biodata DOSEN tidak diberikan.');
        }
        if (roles.includes('VALIDATOR') && !validatedData.validatorBiodata) {
            roleValidationErrors.push('Role VALIDATOR ditentukan, tetapi biodata VALIDATOR tidak diberikan.');
        }
        if (!roles.includes('DOSEN') && validatedData.dosenBiodata) {
            roleValidationErrors.push('Role DOSEN tidak ditentukan, tetapi biodata DOSEN diberikan.');
        }
        if (!roles.includes('VALIDATOR') && validatedData.validatorBiodata) {
            roleValidationErrors.push('Role VALIDATOR tidak ditentukan, tetapi biodata VALIDATOR diberikan.');
        }

        if (roleValidationErrors.length > 0) {
            throw new BadRequestException({
                success: false,
                message: {
                    roles: roleValidationErrors.join(', '),
                },
                data: null,
            });
        }

        if (validatedData.dosenBiodata) {
            await this.validateFakultasProdi(validatedData.dosenBiodata.fakultasId, validatedData.dosenBiodata.prodiId);
        }

        return this.prisma.$transaction(async (tx) => {
            const user = await this.createUserWithRoles(tx, validatedData.dataUser, roles);
            await this.handleProfileCreationByRole(tx, user.id, validatedData);
            const { password, hashedRefreshToken, ...userData } = user;
            return {
                success: true,
                message: 'User berhasil ditambahkan',
                userData,
            };
        });
    }

    async updateFlexibleUser(userId: number, dto: UpdateFlexibleUserDto) {
        const result = UpdateFlexibleUserSchema.safeParse(dto);
        if (!result.success) {
            const errors: Record<string, string> = {};
            for (const issue of result.error.issues) {
                errors[issue.path.join('.')] = issue.message;
            }
            throw new BadRequestException({ success: false, message: errors, data: null });
        }


        const validated = result.data;

        console.log(validated);

        await this.validateUniqueBiodata(userId, validated);

        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                userRoles: { include: { role: true } },
                dosen: true,
                validator: true,
            },
        });

        if (!user) throw new NotFoundException('User tidak ditemukan.');

        try {
            const existingRoles = user.userRoles.map(r => r.role.name);
            const requestedRoles = validated.dataUser.roles ?? [];

            const newRoles = requestedRoles.filter(r => !existingRoles.includes(r));
            const removedRoles = existingRoles.filter(r => !requestedRoles.includes(r));

            if (validated.dosenBiodata) {
                await this.validateFakultasProdi(
                    validated.dosenBiodata.fakultasId,
                    validated.dosenBiodata.prodiId
                );
            }

            return this.prisma.$transaction(async (tx) => {
                await tx.user.update({
                    where: { id: userId },
                    data: {
                        email: validated.dataUser.email,
                        username: validated.dataUser.username,
                        name: validated.dataUser.name,
                        status: validated.dataUser.status,
                        ...(validated.dataUser.password
                            ? { password: await this.hashEncryptUtil.hashPassword(validated.dataUser.password) }
                            : {}),
                    },
                });

                for (const roleName of newRoles) {
                    const roleId = await this.getRoleId(tx, roleName);
                    await tx.userRole.create({ data: { userId: user.id, roleId } });
                }

                for (const roleName of removedRoles) {
                    const role = await tx.role.findUnique({ where: { name: roleName } });
                    if (!role) continue;
                    await tx.userRole.deleteMany({
                        where: { userId, roleId: role.id },
                    });
                }

                if (requestedRoles.includes('DOSEN') && validated.dosenBiodata) {
                    if (user.dosen) {
                        await tx.dosen.update({
                            where: { id: userId },
                            data: validated.dosenBiodata,
                        });
                    } else if (validated.dosenBiodata) {
                        await tx.dosen.create({
                            data: { ...validated.dosenBiodata, id: userId },
                        });
                    }

                    if (validated.dataKepegawaian) {
                        const existing = await tx.dataKepegawaian.findUnique({ where: { id: userId } });
                        if (existing) {
                            await tx.dataKepegawaian.update({
                                where: { id: userId },
                                data: validated.dataKepegawaian,
                            });
                        } else {
                            await tx.dataKepegawaian.create({
                                data: { ...validated.dataKepegawaian, id: userId },
                            });
                        }
                    }
                }

                if (requestedRoles.includes('VALIDATOR') && validated.validatorBiodata) {
                    if (user.validator) {
                        await tx.validator.update({
                            where: { id: userId },
                            data: validated.validatorBiodata,
                        });
                    } else if (validated.validatorBiodata) {
                        await tx.validator.create({
                            data: { ...validated.validatorBiodata, id: userId },
                        });
                    }
                }

                const { password, hashedRefreshToken, ...userData } = user;

                return {
                    success: true,
                    message: 'User berhasil diperbarui',
                    data: userData,
                };
            });
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002'
            ) {
                const message = this.translateP2002Error(error.meta?.target as string[] | undefined);
                throw new BadRequestException({ success: false, message, data: null });
            }
            throw error;
        }
    }

    private translateP2002Error(targets: string[] | undefined): Record<string, string> {
        const errors: Record<string, string> = {};
        const defaultMessage = (field: string) => `${field} sudah digunakan.`;
        const FIELD_TO_PATH_MAP: Record<string, string[]> = {
            nip: ['dosenBiodata.nip', 'validatorBiodata.nip'],
            no_hp: ['dosenBiodata.no_hp', 'validatorBiodata.no_hp'],
            nuptk: ['dosenBiodata.nuptk'],
            email: ['email'],
            username: ['username'],
        };

        targets?.forEach((field) => {
            const paths = FIELD_TO_PATH_MAP[field] ?? [field];
            paths.forEach((path) => {
                errors[path] = defaultMessage(field);
            });
        });

        return errors;
    }


    async updateSelfProfile(userId: number, dto: any) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                userRoles: { include: { role: true } },
                dosen: true,
                validator: true,
            },
        });

        if (!user) throw new NotFoundException('User tidak ditemukan.');

        const roles = user.userRoles.map(r => r.role.name);

        // ADMIN-only
        if (roles.includes('ADMIN') && !roles.includes('DOSEN') && !roles.includes('VALIDATOR')) {
            const result = z.object({ dataUser: BaseUpdateUserSchema }).safeParse(dto);
            if (!result.success) {
                const errors: Record<string, string> = {};
                for (const issue of result.error.issues) {
                    errors[issue.path.join('.')] = issue.message;
                }
                throw new BadRequestException({ success: false, message: errors, data: null });
            }

            const { dataUser } = result.data;

            await this.prisma.user.update({
                where: { id: userId },
                data: {
                    name: dataUser.name,
                    ...(dataUser.password
                        ? { password: await this.hashEncryptUtil.hashPassword(dataUser.password) }
                        : {}),
                },
            });

            return { success: true, message: 'Profil berhasil diperbarui' };
        }

        // DOSEN
        if (roles.includes('DOSEN')) {
            const result = UpdateDosenProfileSchema.safeParse(dto);
            if (!result.success) {
                const errors: Record<string, string> = {};
                for (const issue of result.error.issues) {
                    errors[issue.path.join('.')] = issue.message;
                }
                throw new BadRequestException({ success: false, message: errors, data: null });
            }

            const { dataUser, biodata, dataKepegawaian } = result.data;

            await this.validateFakultasProdi(biodata.fakultasId, biodata.prodiId);

            await this.prisma.$transaction(async (tx) => {
                await tx.user.update({
                    where: { id: userId },
                    data: {
                        name: dataUser.name,
                        ...(dataUser.password
                            ? { password: await this.hashEncryptUtil.hashPassword(dataUser.password) }
                            : {}),
                    },
                });

                if (user.dosen) {
                    await tx.dosen.update({ where: { id: userId }, data: biodata });
                } else {
                    await tx.dosen.create({ data: { ...biodata, id: userId } });
                }

                if (dataKepegawaian) {
                    const existing = await tx.dataKepegawaian.findUnique({ where: { id: userId } });
                    if (existing) {
                        await tx.dataKepegawaian.update({ where: { id: userId }, data: dataKepegawaian });
                    } else {
                        await tx.dataKepegawaian.create({ data: { ...dataKepegawaian, id: userId } });
                    }
                }
            });

            return { success: true, message: 'Profil berhasil diperbarui' };
        }

        // VALIDATOR
        if (roles.includes('VALIDATOR')) {
            const result = UpdateValidatorProfileSchema.safeParse(dto);
            if (!result.success) {
                const errors: Record<string, string> = {};
                for (const issue of result.error.issues) {
                    errors[issue.path.join('.')] = issue.message;
                }
                throw new BadRequestException({ success: false, message: errors, data: null });
            }

            const { dataUser, biodata } = result.data;

            await this.prisma.$transaction(async (tx) => {
                await tx.user.update({
                    where: { id: userId },
                    data: {
                        name: dataUser.name,
                        ...(dataUser.password
                            ? { password: await this.hashEncryptUtil.hashPassword(dataUser.password) }
                            : {}),
                    },
                });

                if (user.validator) {
                    await tx.validator.update({ where: { id: userId }, data: biodata });
                } else {
                    await tx.validator.create({ data: { ...biodata, id: userId } });
                }
            });

            const { password, hashedRefreshToken, ...userData } = user;

            return { success: true, message: 'Profil berhasil diperbarui', data: userData };
        }

        throw new ForbiddenException('Anda tidak memiliki hak untuk memperbarui profil.');
    }

    async changePassword(userId: number, dto: ChangePasswordDto) {
        const result = ChangePasswordSchema.safeParse(dto);
        if (!result.success) {
            const errors: Record<string, string> = {};
            for (const issue of result.error.issues) {
                errors[issue.path.join('.')] = issue.message;
            }
            throw new BadRequestException({ success: false, message: errors, data: null });
        }

        const { oldPassword, newPassword } = result.data;

        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundException('User tidak ditemukan.');

        const isMatch = await this.hashEncryptUtil.comparePassword(oldPassword, user.password);
        if (!isMatch) {
            throw new BadRequestException({
                success: false,
                message: { oldPassword: 'Password lama tidak sesuai' },
                data: null,
            });
        }

        const hashed = await this.hashEncryptUtil.hashPassword(newPassword);
        await this.prisma.user.update({
            where: { id: userId },
            data: { password: hashed },
        });

        return {
            success: true,
            message: 'Password berhasil diperbarui',
        };
    }

    async findAll(params: {
        page?: number;
        limit?: number;
        search?: string;
        role?: TypeUserRole;
        status?: UserStatus;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }) {
        const {
            page = 1,
            limit = 10,
            search,
            role,
            status,
            sortBy = 'createdAt',
            sortOrder = 'desc',
        } = params;

        const take = Number(limit) || 20;

        const allowedSortFields = ['nama', 'email', 'status', 'createdAt'];
        const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
        const safeSortOrder: 'asc' | 'desc' = sortOrder === 'asc' ? 'asc' : 'desc';

        const where: any = {};

        if (search) {
            where.OR = [
                { nama: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (role !== undefined) {
            where.userRoles = {
                some: {
                    role: {
                        name: role,
                    },
                },
            };
        }

        if (status !== undefined) {
            where.status = status;
        }

        try {
            const [data, total] = await this.prisma.$transaction([
                this.prisma.user.findMany({
                    where,
                    orderBy: { [safeSortBy]: safeSortOrder },
                    skip: (page - 1) * take,
                    take: take,
                }),
                this.prisma.user.count({ where }),
            ]);

            return {
                success: true,
                message: 'Data user berhasil diambil',
                data,
                meta: {
                    page,
                    limit: take,
                    total,
                    totalPages: Math.ceil(total / take),
                },
            };
        } catch (error) {
            console.error('UsersService.findAll error:', error);
            throw new BadRequestException('Gagal mengambil data user');
        }
    }

    // async findAll(query: any, currentUser: any) {
    //     const { page = 1, limit = 20, search = '', status, role, sortBy = 'name', sortOrder = 'asc', } = query;
    //     const take = Number(limit);
    //     const skip = (Number(page) - 1) * take;

    //     const where: any = {
    //         AND: [],
    //     };

    //     if (search) {
    //         where.AND.push({
    //             OR: [
    //                 { name: { contains: search, mode: 'insensitive' } },
    //                 { email: { contains: search, mode: 'insensitive' } },
    //                 { username: { contains: search, mode: 'insensitive' } },
    //             ],
    //         });
    //     }

    //     if (status) {
    //         where.AND.push({ status });
    //     }

    //     if (role) {
    //         where.AND.push({
    //             userRoles: {
    //                 some: { role: { name: role } },
    //             },
    //         });
    //     }

    //     if (!currentUser.roles.includes('ADMIN')) {
    //         throw new ForbiddenException('Anda tidak memiliki izin untuk mengakses data ini');
    //     }

    //     const [users, total] = await this.prisma.$transaction([
    //         this.prisma.user.findMany({
    //             where,
    //             skip,
    //             take,
    //             orderBy: {
    //                 [sortBy]: sortOrder,
    //             },
    //             include: {
    //                 userRoles: { include: { role: true } },
    //                 dosen: true,
    //                 validator: true,
    //             },
    //         }),
    //         this.prisma.user.count({ where }),
    //     ]);

    //     const data = users.map(({ password, hashedRefreshToken, ...user }) => user);

    //     return {
    //         success: true,
    //         meta: {
    //             page: Number(page),
    //             limit: take,
    //             total,
    //             totalPages: Math.ceil(total / take),
    //         },
    //         data,
    //     };
    // }

    async findAllDosen(query: any) {
        const {
            page = 1,
            limit = 20,
            search = '',
            fakultasId,
            prodiId,
            jabatan,
            sortBy = 'nama',
            sortOrder = 'asc',
        } = query;

        const take = Number(limit);
        const skip = (Number(page) - 1) * take;

        const where: any = {
            AND: [],
        };

        if (search) {
            where.AND.push({
                OR: [
                    { nama: { contains: search, mode: 'insensitive' } },
                    { nip: { contains: search, mode: 'insensitive' } },
                    { nuptk: { contains: search, mode: 'insensitive' } },
                ],
            });
        }

        if (fakultasId) {
            where.AND.push({ fakultasId: Number(fakultasId) });
        }

        if (prodiId) {
            where.AND.push({ prodiId: Number(prodiId) });
        }

        if (jabatan) {
            where.AND.push({ jabatan });
        }

        if (where.AND.length === 0) delete where.AND;

        const [dosenList, total] = await this.prisma.$transaction([
            this.prisma.dosen.findMany({
                where,
                skip,
                take,
                orderBy: {
                    [sortBy]: sortOrder,
                },
                include: {
                    prodi: true,
                    fakultas: true,
                },
            }),
            this.prisma.dosen.count({ where }),
        ]);

        const data = dosenList.map(d => ({
            id: d.id,
            nama: d.nama,
            nip: d.nip ?? '-',
            nuptk: d.nuptk ?? '-',
            jabatan: d.jabatan,
            prodi: d.prodi?.nama ?? '-',
            fakultas: d.fakultas?.nama ?? '-',
        }));

        return {
            success: true,
            meta: {
                page: Number(page),
                limit: take,
                total,
                totalPages: Math.ceil(total / take),
            },
            data,
        };
    }

    async findAllValidator(query: any) {
        const {
            page = 1,
            limit = 20,
            search = '',
            sortBy = 'nama',
            sortOrder = 'asc',
        } = query;

        const take = Number(limit);
        const skip = (Number(page) - 1) * take;

        const where: any = {
            AND: [],
        };

        if (search) {
            where.AND.push({
                OR: [
                    { nama: { contains: search, mode: 'insensitive' } },
                    { nip: { contains: search, mode: 'insensitive' } },
                    { no_hp: { contains: search, mode: 'insensitive' } },
                ],
            });
        }

        if (where.AND.length === 0) delete where.AND;

        const [validators, total] = await this.prisma.$transaction([
            this.prisma.validator.findMany({
                where,
                skip,
                take,
                orderBy: {
                    [sortBy]: sortOrder,
                },
            }),
            this.prisma.validator.count({ where }),
        ]);

        const data = validators.map(v => ({
            id: v.id,
            nama: v.nama,
            nip: v.nip ?? '-',
            jenis_kelamin: v.jenis_kelamin,
            no_hp: v.no_hp ?? '-',
        }));

        return {
            success: true,
            meta: {
                page: Number(page),
                limit: take,
                total,
                totalPages: Math.ceil(total / take),
            },
            data,
        };
    }

    async remove(userId: number) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { userRoles: true },
        });

        if (!user) {
            throw new NotFoundException('User tidak ditemukan.');
        }

        // Hapus semua relasi roles
        await this.prisma.userRole.deleteMany({
            where: { userId },
        });

        // Hapus entitas spesifik jika ada
        await this.prisma.dataKepegawaian.deleteMany({
            where: { id: userId },
        });

        await this.prisma.dosen.deleteMany({
            where: { id: userId },
        });

        await this.prisma.validator.deleteMany({
            where: { id: userId },
        });

        // Hapus user
        await this.prisma.user.delete({
            where: { id: userId },
        });

        return {
            success: true,
            message: 'User berhasil dihapus.',
        };
    }

}