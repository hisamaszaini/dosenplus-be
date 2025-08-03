import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import * as path from 'path';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'prisma/prisma.service';
import { Prisma, PrismaClient, TypeUserRole, UserRole, UserStatus } from '@prisma/client';
import { HashAndEncryptService } from 'src/utils/hashAndEncrypt';

import { BaseUpdateUserSchema, ChangePasswordDto, ChangePasswordSchema, CreateFlexibleUserSchema, CreatePendingBiodataDosenSchema, CreatePendingDataKepegawaianSchema, CreatePendingUpdateDto, CreatePendingUpdateSchema, UpdateDosenProfileSchema, UpdateFlexibleUserDto, UpdateFlexibleUserSchema, UpdatePendingStatusDto, UpdatePendingStatusSchema, UpdateValidatorProfileSchema, type CreateFlexibleUserDto } from './dto/user.dto';
import z, { success, ZodError } from 'zod';
import { DataAndFileService } from 'src/utils/dataAndFile';
import { LogActivityService } from 'src/utils/logActivity';

const SALT_ROUNDS = 10;
type TransactionClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;

@Injectable()
export class UsersService {
    private readonly UPLOAD_PATH = path.resolve(process.cwd(), 'uploads/profil');

    constructor(private prisma: PrismaService, private hashEncryptUtil: HashAndEncryptService, private readonly fileUtil: DataAndFileService, private logActivityUtil: LogActivityService
    ) { }

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

    async create(dto: CreateFlexibleUserDto, file?: Express.Multer.File) {
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

        const filePath = file?.path || file?.filename;
        const savedFileName = file ? this.fileUtil.generateFileName(file.originalname) : undefined;

        if (file && savedFileName) {
            if (validatedData.dosenBiodata) {
                validatedData.dosenBiodata.fotoPath = savedFileName;
            }
            if (validatedData.validatorBiodata) {
                validatedData.validatorBiodata.fotoPath = savedFileName;
            }
        }

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

        try {
            if (file && savedFileName) {
                await this.fileUtil.writeFile(file, savedFileName);
            }

            const result = await this.prisma.$transaction(async (tx) => {
                const user = await this.createUserWithRoles(tx, validatedData.dataUser, roles);
                await this.handleProfileCreationByRole(tx, user.id, validatedData);
                const { password, hashedRefreshToken, ...userData } = user;
                return userData;
            });

            return {
                success: true,
                message: 'User berhasil ditambahkan',
                userData: result,
            };

        } catch (error) {
            if (file && savedFileName) {
                await this.fileUtil.deleteFile(savedFileName);
            }
            throw new InternalServerErrorException('Gagal menyimpan user');
        }
    }

    async updateFlexibleUser(userId: number, dto: UpdateFlexibleUserDto, file?: Express.Multer.File) {
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

        let savedFileName: string | undefined;
        if (file) {
            savedFileName = this.fileUtil.generateFileName(file.originalname);

            if (validated.dosenBiodata) {
                validated.dosenBiodata.fotoPath = savedFileName;
            }
            if (validated.validatorBiodata) {
                validated.validatorBiodata.fotoPath = savedFileName;
            }
        }

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

                if (file && savedFileName) {
                    await this.fileUtil.writeFile(file, savedFileName);
                }

                const updatedUser = await tx.user.findUnique({
                    where: { id: userId },
                    include: {
                        userRoles: { include: { role: true } },
                        dosen: true,
                        validator: true,
                    },
                });

                const userData = updatedUser;

                return {
                    success: true,
                    message: 'User berhasil diperbarui',
                    data: userData,
                };
            });
        } catch (error) {

            if (file && savedFileName) {
                await this.fileUtil.deleteFile(savedFileName);
            }

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

    async updatePhoto(userId: number, file?: Express.Multer.File) {
        if (!file) return;

        const savedFileName = this.fileUtil.generateFileName(file.originalname);
        console.log(savedFileName);

        const existingUser = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { fotoPath: true },
        });

        try {
            await this.fileUtil.writeFile(file, savedFileName);

            await this.prisma.user.update({
                where: { id: userId },
                data: { fotoPath: savedFileName },
            });

            if (existingUser?.fotoPath) {
                await this.fileUtil.deleteFile(existingUser.fotoPath);
            }

            return {
                success: true,
                message: 'Foto profil berhasil diperbarui',
            };
        } catch (error) {
            await this.fileUtil.deleteFile(savedFileName);
            throw new Error(`Gagal mengganti foto: ${error.message}`);
        }
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
        role?: TypeUserRole | '';
        status?: UserStatus | '';
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

        const take = Number(limit) || 10;

        const allowedSortFields = ['nama', 'email', 'status', 'createdAt'];
        const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
        const safeSortOrder: 'asc' | 'desc' = sortOrder === 'asc' ? 'asc' : 'desc';

        const where: any = {
            AND: [],
        };

        if (search) {
            where.AND.push({
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                    { username: { contains: search, mode: 'insensitive' } },
                ],
            });
        }

        if (status) {
            where.AND.push({ status });
        }

        if (role) {
            where.AND.push({
                userRoles: {
                    some: { role: { name: role } },
                },
            });
        }

        try {
            const [data, total] = await this.prisma.$transaction([
                this.prisma.user.findMany({
                    where,
                    orderBy: { [safeSortBy]: safeSortOrder },
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        status: true,
                        createdAt: true,
                        userRoles: {
                            select: {
                                role: { select: { name: true } },
                            },
                        }
                    },
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

    async findAllDosen(params: {
        page?: number;
        limit?: number;
        search?: string;
        jabatan?: string;
        fakultasId?: number;
        prodiId?: number;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }) {
        const {
            page = 1,
            limit = 20,
            search,
            jabatan,
            fakultasId,
            prodiId,
            sortBy = 'nama',
            sortOrder = 'asc',
        } = params;

        const take = Number(limit) || 20;
        const skip = (page - 1) * take;

        const allowedSortFields = ['nama', 'nip', 'nuptk', 'jabatan', 'createdAt'];
        const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'nama';
        const safeSortOrder: 'asc' | 'desc' = sortOrder === 'desc' ? 'desc' : 'asc';

        const where: any = { AND: [] };

        if (search) {
            where.AND.push({
                OR: [
                    { nama: { contains: search, mode: 'insensitive' } },
                    { nip: { contains: search, mode: 'insensitive' } },
                    { nuptk: { contains: search, mode: 'insensitive' } },
                ],
            });
        }

        if (jabatan) {
            where.AND.push({ jabatan });
        }

        if (fakultasId) {
            where.AND.push({ fakultasId: Number(fakultasId) });
        }

        if (prodiId) {
            where.AND.push({ prodiId: Number(prodiId) });
        }

        if (where.AND.length === 0) delete where.AND;

        const [data, total] = await this.prisma.$transaction([
            this.prisma.dosen.findMany({
                where,
                skip,
                take,
                orderBy: { [safeSortBy]: safeSortOrder },
                include: {
                    prodi: true,
                    fakultas: true,
                },
            }),
            this.prisma.dosen.count({ where }),
        ]);

        const result = data.map((d) => ({
            id: d.id,
            nama: d.nama,
            nip: d.nip ?? '-',
            nuptk: d.nuptk ?? '-',
            jabatan: d.jabatan ?? '-',
            prodi: d.prodi?.nama ?? '-',
            fakultas: d.fakultas?.nama ?? '-',
        }));

        return {
            success: true,
            message: 'Data dosen berhasil diambil',
            data: result,
            meta: {
                page,
                limit: take,
                total,
                totalPages: Math.ceil(total / take),
            },
        };
    }

    async findAllValidator(params: {
        page?: number;
        limit?: number;
        search?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }) {
        const {
            page = 1,
            limit = 20,
            search = '',
            sortBy = 'nama',
            sortOrder = 'asc',
        } = params;

        const take = Math.min(Number(limit) || 20, 100);
        const skip = (Number(page) - 1) * take;

        const allowedSortFields = ['nama', 'nip', 'no_hp', 'createdAt'];
        const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'nama';
        const safeSortOrder: 'asc' | 'desc' = sortOrder === 'desc' ? 'desc' : 'asc';

        const where: any = {};

        if (search) {
            where.OR = [
                { nama: { contains: search, mode: 'insensitive' } },
                { nip: { contains: search, mode: 'insensitive' } },
                { no_hp: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [validators, total] = await this.prisma.$transaction([
            this.prisma.validator.findMany({
                where,
                skip,
                take,
                orderBy: { [safeSortBy]: safeSortOrder },
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

    async submitPendingUpdate(dosenId: number, dto: CreatePendingUpdateDto) {
        const parsed = CreatePendingUpdateSchema.safeParse(dto);
        if (!parsed.success) {
            throw new BadRequestException({
                success: false,
                message: this.formatZodErrors(parsed.error),
                data: null,
            });
        }

        const { biodata, kepegawaian } = parsed.data;

        return this.prisma.$transaction(async (tx) => {
            if (biodata) {
                const savedBiodata = await tx.pendingBiodataDosen.upsert({
                    where: { dosenId },
                    update: {
                        ...biodata,
                        status: 'PENDING',
                    },
                    create: {
                        ...biodata,
                        dosenId,
                        status: 'PENDING',
                    },
                });

                await this.logActivityUtil.createLog(dosenId, 'BIODATA', savedBiodata.id, 'CREATE')
            }

            if (kepegawaian) {
                const savedDataKepegawaian = await tx.pendingDataKepegawaian.upsert({
                    where: { dosenId },
                    update: {
                        ...kepegawaian,
                        status: 'PENDING',
                    },
                    create: {
                        ...kepegawaian,
                        dosenId,
                        status: 'PENDING',
                    },
                });

                await this.logActivityUtil.createLog(dosenId, 'DATA KEPEGAWAIAN', savedDataKepegawaian.id, 'CREATE')
            }

            return {
                success: true,
                message: 'Permintaan update telah dikirim dan menunggu peninjauan.',
            };
        });
    }

    async updatePendingStatus(type: 'biodata' | 'kepegawaian', id: number, reviewerId: number, dto: UpdatePendingStatusDto
    ) {
        const parsed = UpdatePendingStatusSchema.safeParse(dto);
        if (!parsed.success) {
            throw new BadRequestException({
                success: false,
                message: this.formatZodErrors(parsed.error),
                data: null,
            });
        }

        const { status, catatan } = parsed.data;

        return this.prisma.$transaction(async (tx) => {
            if (type === 'biodata') {
                const pending = await tx.pendingBiodataDosen.findUnique({
                    where: { id },
                });
                if (!pending) throw new NotFoundException('Data pending biodata tidak ditemukan');

                if (pending.status !== 'PENDING') {
                    throw new BadRequestException('Data ini sudah pernah divalidasi');
                }

                await tx.pendingBiodataDosen.update({
                    where: { id },
                    data: { status, reviewerId, catatan },
                });

                await this.logActivityUtil.createLog(
                    reviewerId,
                    'BIODATA',
                    id,
                    status
                );

                if (status === 'APPROVED') {
                    const exists = await tx.dosen.findUnique({ where: { id: pending.dosenId } });
                    const data = {
                        nama: pending.nama,
                        nip: pending.nip,
                        nuptk: pending.nuptk,
                        jenis_kelamin: pending.jenis_kelamin,
                        no_hp: pending.no_hp,
                        jabatan: pending.jabatan,
                        prodi: { connect: { id: pending.prodiId } },
                        fakultas: { connect: { id: pending.fakultasId } },
                    };

                    await tx.dosen.update({ where: { id: pending.dosenId }, data });

                    await tx.pendingBiodataDosen.delete({ where: { id } });
                }

                return { success: true, message: `Validasi biodata ${status.toLowerCase()}` };
            }

            if (type === 'kepegawaian') {
                const pending = await tx.pendingDataKepegawaian.findUnique({ where: { id } });
                if (!pending) throw new NotFoundException('Data pending kepegawaian tidak ditemukan');

                await tx.pendingDataKepegawaian.update({
                    where: { id },
                    data: { status, reviewerId, catatan },
                });

                await this.logActivityUtil.createLog(
                    reviewerId,
                    'DATA KEPEGAWAIAN',
                    id,
                    status
                );

                if (status === 'APPROVED') {
                    const exists = await tx.dataKepegawaian.findUnique({ where: { id: pending.dosenId } });
                    const data = {
                        npwp: pending.npwp,
                        nama_bank: pending.nama_bank,
                        no_rek: pending.no_rek,
                        bpjs_kesehatan: pending.bpjs_kesehatan,
                        bpjs_tkerja: pending.bpjs_tkerja,
                        no_kk: pending.no_kk,
                    };

                    if (exists) {
                        await tx.dataKepegawaian.update({ where: { id: pending.dosenId }, data });
                    } else {
                        await tx.dataKepegawaian.create({ data: { id: pending.dosenId, ...data } });
                    }

                    await tx.pendingDataKepegawaian.delete({ where: { id } });
                }

                return { success: true, message: `Validasi data kepegawaian ${status.toLowerCase()}` };
            }

            throw new BadRequestException('Tipe data tidak valid');
        });
    }

    private formatZodErrors(error: ZodError) {
        const result: Record<string, string> = {};
        for (const issue of error.issues) {
            result[issue.path.join('.')] = issue.message;
        }
        return result;
    }

}