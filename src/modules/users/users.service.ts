import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { PrismaClient, TypeUserRole, UserStatus } from '@prisma/client';
import { BaseUpdateUserSchema, ChangePasswordDto, ChangePasswordSchema, CreateFlexibleUserSchema, CreatePendingUpdateDto, CreatePendingUpdateSchema, CreateValidatorBiodataSchema, UpdateDosenProfileSchema, UpdateFlexibleUserDto, UpdateFlexibleUserSchema, UpdateValidatorProfileSchema, ValidatePendingUpdateDto, ValidatePendingUpdateSchema, type CreateFlexibleUserDto } from './dto/user.dto';
import z, { ZodError } from 'zod';
import { LogActivityService } from '@/utils/logActivity';
import { handleFindError, handlePrismaError, handleUpdateError } from '@/common/utils/prisma-error-handler';
import { parseAndThrow } from '@/common/utils/zod-helper';
import { PrismaService } from '../../../prisma/prisma.service';
import { comparePassword, hashPassword } from '@/common/utils/hashAndEncrypt';
import { deleteFileFromDisk, handleUpload, handleUploadAndUpdate } from '@/common/utils/dataFile';

type TransactionClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;

@Injectable()
export class UsersService {
    private readonly UPLOAD_PATH = 'profil';

    constructor(private prisma: PrismaService, private logActivityUtil: LogActivityService
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
        try {
            const user = await this.prisma.user.findUniqueOrThrow({
                where: { id },
                include: {
                    userRoles: { include: { role: true } },
                    dosen: { include: { dataKepegawaian: true, fakultas: true, prodi: true, pendidikan: true } },
                    validator: true,
                },
            });
            const { password, hashedRefreshToken, ...userData } = user;
            return { success: true, data: userData };
        } catch (error) {
            handleFindError(error, 'User');
        }
    }

    private async createUserWithRoles(tx: TransactionClient, dataUser: any, roles: TypeUserRole[]) {
        const hashedPassword = await hashPassword(dataUser.password);
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
            dto.dosenBiodata.nama = dto.dataUser.name;

            if (dto.dosenBiodata.nip === undefined) {
                dto.dosenBiodata.nip = null;
            }
            await tx.dosen.create({ data: { ...dto.dosenBiodata, id: userId } });
            if (dto.dataKepegawaian) {
                await tx.dataKepegawaian.create({ data: { ...dto.dataKepegawaian, id: userId } });
            }
        }
        if (dto.validatorBiodata) {
            dto.validatorBiodata.nama = dto.dataUser.name;
            await tx.validator.create({ data: { ...dto.validatorBiodata, id: userId } });
        }
    }

    async create(dto: CreateFlexibleUserDto, file?: Express.Multer.File) {
        const validatedData = parseAndThrow(CreateFlexibleUserSchema, dto);
        const roles = validatedData.dataUser.roles || [];

        let relativePath: string | undefined;

        if (file) {
            relativePath = await handleUpload({
                file,
                uploadSubfolder: this.UPLOAD_PATH,
            });

            validatedData.dataUser.fotoPath = relativePath;
        }

        await this.validateUniqueUser(
            validatedData.dataUser.email,
            validatedData.dataUser.username,
        );

        const roleValidationErrors: string[] = [];

        if (roles.includes('DOSEN') && !validatedData.dosenBiodata) {
            roleValidationErrors.push(
                'Role DOSEN ditentukan, tetapi biodata DOSEN tidak diberikan.',
            );
        }
        if (roles.includes('VALIDATOR') && !validatedData.validatorBiodata) {
            roleValidationErrors.push(
                'Role VALIDATOR ditentukan, tetapi biodata VALIDATOR tidak diberikan.',
            );
        }
        if (!roles.includes('DOSEN') && validatedData.dosenBiodata) {
            roleValidationErrors.push(
                'Role DOSEN tidak ditentukan, tetapi biodata DOSEN diberikan.',
            );
        }
        if (!roles.includes('VALIDATOR') && validatedData.validatorBiodata) {
            roleValidationErrors.push(
                'Role VALIDATOR tidak ditentukan, tetapi biodata VALIDATOR diberikan.',
            );
        }

        if (roleValidationErrors.length > 0) {
            throw new BadRequestException({
                success: false,
                message: { roles: roleValidationErrors.join(', ') },
                data: null,
            });
        }

        if (validatedData.dosenBiodata) {
            await this.validateFakultasProdi(
                validatedData.dosenBiodata.fakultasId,
                validatedData.dosenBiodata.prodiId,
            );
        }

        try {
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
            if (process.env.NODE_ENV !== 'production') {
                console.error('CREATE USER FAILED:', error);
            }

            if (file && relativePath) {
                await deleteFileFromDisk(relativePath);
            }

            handlePrismaError(error);
            throw new InternalServerErrorException('Gagal menyimpan user');
        }
    }

    async updateFlexibleUser(userId: number, dto: UpdateFlexibleUserDto, file?: Express.Multer.File) {
        if (dto.dataUser?.name) {
            if (dto.dosenBiodata) dto.dosenBiodata.nama = dto.dataUser.name;
            if (dto.validatorBiodata) dto.validatorBiodata.nama = dto.dataUser.name;
        }

        const validated = parseAndThrow(UpdateFlexibleUserSchema, dto);
        let relativePath: string | undefined;

        try {
            const user = await this.prisma.user.findUniqueOrThrow({
                where: { id: userId },
                include: {
                    userRoles: { include: { role: true } },
                    dosen: true,
                    validator: true,
                },
            });

            const roles = validated.dataUser.roles ?? user.userRoles.map(r => r.role.name);
            if (!roles || roles.length === 0) {
                throw new BadRequestException('Minimal satu peran (role) harus dipilih.');
            }

            const existingRoles = user.userRoles.map(r => r.role.name);
            const newRoles = roles.filter(r => !existingRoles.includes(r));
            const removedRoles = existingRoles.filter(r => !roles.includes(r));

            if (file) {
                relativePath = await handleUploadAndUpdate({
                    file,
                    oldFilePath: user.fotoPath ?? undefined,
                    uploadSubfolder: this.UPLOAD_PATH,
                });
                validated.dataUser.fotoPath = relativePath;
            }

            await this.validateUniqueBiodata(userId, validated);

            if (validated.dosenBiodata) {
                await this.validateFakultasProdi(validated.dosenBiodata.fakultasId, validated.dosenBiodata.prodiId);
            }

            await this.prisma.$transaction(async (tx) => {
                // Update user
                await tx.user.update({
                    where: { id: userId },
                    data: {
                        ...(validated.dataUser.email !== undefined && { email: validated.dataUser.email }),
                        ...(validated.dataUser.username !== undefined && { username: validated.dataUser.username }),
                        ...(validated.dataUser.name !== undefined && { name: validated.dataUser.name }),
                        ...(validated.dataUser.status !== undefined && { status: validated.dataUser.status }),
                        ...(validated.dataUser.password
                            ? { password: await hashPassword(validated.dataUser.password) }
                            : {}),
                        ...(validated.dataUser.fotoPath && { fotoPath: validated.dataUser.fotoPath }),
                    },
                });

                // Update roles
                for (const role of newRoles) {
                    const roleId = await this.getRoleId(tx, role);
                    await tx.userRole.create({ data: { userId, roleId } });
                }

                for (const role of removedRoles) {
                    const roleData = await tx.role.findUnique({ where: { name: role } });
                    if (roleData) {
                        await tx.userRole.deleteMany({ where: { userId, roleId: roleData.id } });
                    }
                }

                // Dosen
                if (roles.includes('DOSEN')) {
                    if (user.dosen) {
                        if (validated.dosenBiodata) {
                            await tx.dosen.update({
                                where: { id: userId },
                                data: validated.dosenBiodata,
                            });
                        } else if (validated.dataUser.name) {
                            await tx.dosen.update({
                                where: { id: userId },
                                data: { nama: validated.dataUser.name },
                            });
                        }
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

                // Validator
                if (roles.includes('VALIDATOR')) {
                    if (user.validator && validated.dataUser.name) {
                        await tx.validator.update({
                            where: { id: userId },
                            data: { nama: validated.dataUser.name },
                        });
                    } else if (validated.validatorBiodata) {
                        await tx.validator.create({
                            data: { ...validated.validatorBiodata, id: userId },
                        });
                    }
                }
            });

            const updatedUser = await this.findById(userId);
            return {
                success: true,
                message: 'User berhasil diperbarui',
                data: updatedUser?.data,
            };
        } catch (error) {
            if (process.env.NODE_ENV !== 'production') {
                console.error('UPDATE USER FAILED:', error);
            }

            if (file && relativePath) {
                await deleteFileFromDisk(relativePath);
            }

            handleUpdateError(error, 'User');
        }
    }

    // Hanya Untuk Admin dan Validator, Dosen Wajib Melalui Pengajuan
    async updateSelfProfile(userId: number, dto: any) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                userRoles: { include: { role: true } },
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

            if (dataUser) {
                const updateData: any = {};

                if (dataUser.name) updateData.name = dataUser.name;
                if (dataUser.password) updateData.password = await hashPassword(dataUser.password);
                if (dataUser.email && dataUser.email !== user.email) {
                    const existing = await this.prisma.user.findFirst({
                        where: {
                            email: dataUser.email,
                            id: { not: userId },
                        },
                    });
                    if (existing) {
                        throw new BadRequestException('Email sudah digunakan oleh user lain.');
                    }
                    updateData.email = dataUser.email;
                }

                await this.prisma.user.update({
                    where: { id: userId },
                    data: updateData,
                });
            }

            const updatedUser = await this.findById(userId);
            return {
                success: true,
                message: 'Profil berhasil diperbarui',
                data: updatedUser?.data ?? null,
            };
        }

        // VALIDATOR
        if (roles.includes('VALIDATOR')) {
            const result = UpdateValidatorProfileSchema.safeParse(dto);
            if (!result.success) {
                throw new BadRequestException({
                    success: false,
                    message: this.formatZodErrors(result.error),
                    data: null,
                });
            }

            const { dataUser, validatorBiodata } = result.data;

            if (!validatorBiodata) {
                throw new BadRequestException('validatorBiodata validator wajib diisi.');
            }

            const finalNama = validatorBiodata.nama ?? dataUser?.name;
            if (!finalNama) {
                throw new BadRequestException('Nama validator wajib diisi.');
            }
            if (!validatorBiodata.jenis_kelamin) {
                throw new BadRequestException('Jenis kelamin wajib diisi.');
            }

            // Update user
            const updateUserData: any = { name: finalNama };
            if (dataUser?.password) {
                updateUserData.password = await hashPassword(dataUser.password);
            }
            if (dataUser?.email && dataUser.email !== user.email) {
                const existing = await this.prisma.user.findFirst({
                    where: {
                        email: dataUser.email,
                        id: { not: userId },
                    },
                });
                if (existing) {
                    throw new BadRequestException('Email sudah digunakan oleh user lain.');
                }
                updateUserData.email = dataUser.email;
            }

            await this.prisma.user.update({
                where: { id: userId },
                data: updateUserData,
            });

            // Upsert validator validatorBiodata
            await this.prisma.validator.upsert({
                where: { id: userId },
                update: {
                    nama: finalNama,
                    jenis_kelamin: validatorBiodata.jenis_kelamin,
                    nip: validatorBiodata?.nip ?? null,
                    no_hp: validatorBiodata?.no_hp ?? null,
                },
                create: {
                    id: userId,
                    nama: finalNama,
                    jenis_kelamin: validatorBiodata.jenis_kelamin,
                    nip: validatorBiodata?.nip ?? null,
                    no_hp: validatorBiodata?.no_hp ?? null,
                },
            });

            // Sinkronisasi ke dosen jika punya role dosen juga
            if (roles.includes('DOSEN')) {
                await this.prisma.dosen.updateMany({
                    where: { id: userId },
                    data: {
                        nama: finalNama,
                        ...(validatorBiodata.nip && { nip: validatorBiodata.nip }),
                        ...(validatorBiodata.no_hp && { no_hp: validatorBiodata.no_hp }),
                    },
                });
            }

            const updatedUser = await this.findById(userId);
            return {
                success: true,
                message: 'Profil berhasil diperbarui',
                data: updatedUser?.data ?? null,
            };
        }

        throw new ForbiddenException('Anda tidak memiliki hak untuk memperbarui profil.');
    }

    async updatePhoto(userId: number, file?: Express.Multer.File) {
        if (!file) return;

        const existingUser = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { fotoPath: true },
        });

        if (!existingUser) {
            throw new NotFoundException('User tidak ditemukan.');
        }

        try {
            const relativePath = await handleUploadAndUpdate({
                file,
                oldFilePath: existingUser.fotoPath ?? undefined,
                uploadSubfolder: this.UPLOAD_PATH,
            });

            await this.prisma.user.update({
                where: { id: userId },
                data: { fotoPath: relativePath },
            });

            return {
                success: true,
                message: 'Foto profil berhasil diperbarui',
                data: { fotoPath: relativePath },
            };
        } catch (error) {
            if (process.env.NODE_ENV !== 'production') {
                console.error('UPDATE PHOTO FAILED:', error);
            }

            handlePrismaError(error);
            throw new InternalServerErrorException('Gagal mengganti foto profil');
        }
    }

    async changePassword(userId: number, dto: ChangePasswordDto) {
        const { oldPassword, newPassword } = parseAndThrow(ChangePasswordSchema, dto);

        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundException('User tidak ditemukan.');

        const isMatch = await comparePassword(oldPassword, user.password);
        if (!isMatch) {
            throw new BadRequestException({
                success: false,
                message: { oldPassword: 'Password lama tidak sesuai' },
                data: null,
            });
        }

        const hashed = await hashPassword(newPassword);

        try {
            await this.prisma.user.update({
                where: { id: userId },
                data: { password: hashed },
            });

            return {
                success: true,
                message: 'Password berhasil diperbarui',
            };
        } catch (error) {
            if (process.env.NODE_ENV !== 'production') {
                console.error('CHANGE PASSWORD FAILED:', error);
            }

            handlePrismaError(error);
            throw new InternalServerErrorException('Gagal memperbarui password');
        }
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
        const data = parseAndThrow(CreatePendingUpdateSchema, dto);

        try {
            const saved = await this.prisma.pendingUpdateDosen.upsert({
                where: { dosenId },
                update: {
                    ...data,
                    status: 'PENDING',
                },
                create: {
                    ...data,
                    dosenId,
                    status: 'PENDING',
                },
            });

            await this.logActivityUtil.createLog(
                dosenId,
                'UPDATE_PROFILE',
                saved.id,
                'CREATE',
            );

            return {
                success: true,
                message: 'Permintaan update telah dikirim dan menunggu peninjauan.',
                data,
            };
        } catch (error) {
            console.error('Gagal submit pending update:', error);

            throw new InternalServerErrorException({
                success: false,
                message: 'Terjadi kesalahan saat menyimpan data.',
                data: null,
            });
        }
    }


    async validatePendingUpdate(dosenId: number, reviewerId: number, dto: ValidatePendingUpdateDto) {
        const { status, catatan } = parseAndThrow(ValidatePendingUpdateSchema, dto);

        const pending = await this.prisma.pendingUpdateDosen.findUnique({
            where: { dosenId },
        });

        if (!pending) {
            throw new NotFoundException({
                success: false,
                message: 'Data pengajuan tidak ditemukan.',
                data: null,
            });
        }

        if (status === 'APPROVED') {
            const allowedJabatan = ['Asisten Ahli', 'Lektor', 'Lektor Kepala', 'Guru Besar'];

            if (!pending.jabatan || !allowedJabatan.includes(pending.jabatan)) {
                throw new BadRequestException({
                    success: false,
                    message: 'Jabatan tidak valid atau belum diisi.',
                    data: null,
                });
            }

            // Salin ke Dosen
            await this.prisma.dosen.update({
                where: { id: dosenId },
                data: {
                    nama: pending.nama,
                    nip: pending.nip,
                    nuptk: pending.nuptk,
                    jenis_kelamin: pending.jenis_kelamin,
                    no_hp: pending.no_hp,
                    prodiId: pending.prodiId,
                    fakultasId: pending.fakultasId,
                    jabatan: pending.jabatan,
                },
            });

            // Salin ke DataKepegawaian
            await this.prisma.dataKepegawaian.upsert({
                where: { id: dosenId },
                update: {
                    npwp: pending.npwp,
                    nama_bank: pending.nama_bank,
                    no_rek: pending.no_rek,
                    bpjs_kesehatan: pending.bpjs_kesehatan,
                    bpjs_tkerja: pending.bpjs_tkerja,
                    no_kk: pending.no_kk,
                },
                create: {
                    id: dosenId,
                    npwp: pending.npwp,
                    nama_bank: pending.nama_bank,
                    no_rek: pending.no_rek,
                    bpjs_kesehatan: pending.bpjs_kesehatan,
                    bpjs_tkerja: pending.bpjs_tkerja,
                    no_kk: pending.no_kk,
                },
            });
        }

        // Update status dan log
        await this.prisma.pendingUpdateDosen.update({
            where: { dosenId },
            data: {
                status,
                catatan,
                reviewerId,
            },
        });

        await this.logActivityUtil.createLog(
            dosenId,
            'VALIDASI_PROFILE',
            pending.id,
            status,
        );

        return {
            success: true,
            message: `Data pengajuan berhasil ${status === 'APPROVED' ? 'disetujui' : 'ditolak'}.`,
            data: pending,
        };
    }

    private formatZodErrors(error: ZodError) {
        const result: Record<string, string> = {};
        for (const issue of error.issues) {
            result[issue.path.join('.')] = issue.message;
        }
        return result;
    }

    // private translateP2002Error(targets: string[] | undefined): Record<string, string> {
    //     const errors: Record<string, string> = {};
    //     const defaultMessage = (field: string) => `${field} sudah digunakan.`;
    //     const FIELD_TO_PATH_MAP: Record<string, string[]> = {
    //         nip: ['dosenBiodata.nip', 'validatorBiodata.nip'],
    //         no_hp: ['dosenBiodata.no_hp', 'validatorBiodata.no_hp'],
    //         nuptk: ['dosenBiodata.nuptk'],
    //         email: ['email'],
    //         username: ['username'],
    //     };

    //     targets?.forEach((field) => {
    //         const paths = FIELD_TO_PATH_MAP[field] ?? [field];
    //         paths.forEach((path) => {
    //             errors[path] = defaultMessage(field);
    //         });
    //     });

    //     return errors;
    // }

}