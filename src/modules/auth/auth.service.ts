import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { MailService } from '@/modules/mail/mail.service';
import { randomBytes } from 'crypto';
import { PrismaService } from '../../../prisma/prisma.service';
import { UsersService } from '@/modules/users/users.service';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private configService: ConfigService,
        private mailService: MailService,
        private usersService: UsersService,
    ) { }

    // Validasi Login
    // async validateUser(identifier: string, pass: string): Promise<any> {
    //     const loginPayload = {
    //         usernameOrEmail: identifier,
    //         password: pass,
    //     };

    //     let apiResult;
    //     try {
    //         const response = await fetch('https://apikey.umpo.ac.id/lpsi/api/login-users', {
    //             method: 'POST',
    //             headers: { 'Content-Type': 'application/json' },
    //             body: JSON.stringify(loginPayload),
    //         });

    //         apiResult = await response.json();

    //         if (!response.ok || apiResult.success !== true) {
    //             throw new UnauthorizedException('Email/Username atau password salah.');
    //         }
    //     } catch (error) {
    //         if (error instanceof UnauthorizedException) throw error;
    //         throw new UnauthorizedException('Gagal terhubung ke layanan autentikasi.');
    //     }

    //     const user = await this.prisma.user.findFirst({
    //         where: {
    //             OR: [
    //                 { email: { equals: identifier, mode: 'insensitive' } },
    //                 { username: { equals: identifier, mode: 'insensitive' } },
    //             ],
    //         },
    //         include: { userRoles: { include: { role: true } } },
    //     });

    //     if (!user) {
    //         throw new UnauthorizedException('Akun tidak ditemukan di sistem lokal.');
    //     }

    //     if (user.status === 'INACTIVE') {
    //         throw new ForbiddenException('Akun Anda tidak aktif. Silakan hubungi administrator.');
    //     }

    //     const { password, ...result } = user;
    //     return result;
    // }

    async validateUser(identifier: string, pass: string): Promise<any> {
        const user = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { email: { equals: identifier, mode: 'insensitive' } },
                    { username: { equals: identifier, mode: 'insensitive' } },
                ],
            },
            include: { userRoles: { include: { role: true } } },
        });

        if (!user) {
            throw new UnauthorizedException('Email/Username atau password salah.');
        }

        if (user.status === 'INACTIVE') {
            throw new ForbiddenException('Akun Anda tidak aktif. Silakan hubungi administrator.');
        }

        const passwordMatches = await bcrypt.compare(pass, user.password);
        if (!passwordMatches) {
            throw new UnauthorizedException('Email/Username atau password salah.');
        }

        const { password, ...result } = user;
        return result;
    }

    // Login
    async login(user: any) {
        const roles = user.userRoles.map(userRole => userRole.role.name);

        const payload = {
            sub: user.id,
            name: user.name,
            email: user.email,
            username: user.username,
            roles,
        };

        const [accessToken, refreshToken] = await this.getTokens(payload);
        await this.updateRefreshTokenHash(user.id, refreshToken);

        return {
            success: true,
            message: 'Login berhasil!',
            accessToken, refreshToken
        };
    }

    // Logout
    async logout(userId: number) {
        await this.prisma.user.updateMany({
            where: {
                id: userId,
                hashedRefreshToken: {
                    not: null,
                },
            },
            data: {
                hashedRefreshToken: null,
            },
        });
    }

    // Refresh Token
    async refreshTokens(userId: number, rt: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { userRoles: { include: { role: true } } },
        });

        if (!user || !user.hashedRefreshToken) {
            throw new ForbiddenException('Akses Ditolak');
        }

        const hashedRt = await this.hashToken(rt);
        const rtMatches = hashedRt === user.hashedRefreshToken;

        console.log('[REFRESH TOKEN] Token:', hashedRt);
        console.log('[REFRESH TOKEN] Token in DB:', user.hashedRefreshToken);

        if (!rtMatches) throw new ForbiddenException('Akses Ditolak');

        const roles = user.userRoles.map(userRole => userRole.role.name);

        const payload = {
            sub: user.id,
            name: user.name,
            email: user.email,
            username: user.username,
            roles,
        };

        const [accessToken, refreshToken] = await this.getTokens(payload);
        await this.updateRefreshTokenHash(user.id, refreshToken);
        console.log(`[REFRESH] Token diperbarui untuk user ${user.email}`);
        console.log(`[REFRESH] Token baru user ${user.email}: ${accessToken}`);

        return {
            success: true,
            mesaage: 'Refresh token berhasil',
            accessToken, refreshToken
        };
    }

    // Lupa Password
    async forgotPassword(email: string) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new NotFoundException('Email Pengguna tidak ditemukan.');
        }

        const resetToken = randomBytes(32).toString('hex');
        const hashedResetToken = await this.hashToken(resetToken);
        const resetExpires = new Date(Date.now() + 10 * 60 * 1000);

        await this.prisma.user.update({
            where: { email },
            data: {
                passwordResetToken: hashedResetToken,
                passwordResetExpires: resetExpires,
            },
        });

        console.log('[FORGOT PASSWORD] Memulai reset untuk:', email);
        console.log('[FORGOT PASSWORD] Token:', resetToken);
        console.log('[FORGOT PASSWORD] Expire:', resetExpires);
        console.log('[FORGOT PASSWORD] Kirim email...');

        try {
            await this.mailService.sendPasswordResetEmail(user.email, resetToken);
            return { success: true, message: 'Link reset password telah dikirim ke email Anda.' };
        } catch (error) {
            await this.prisma.user.update({
                where: { email },
                data: {
                    passwordResetToken: null,
                    passwordResetExpires: null,
                },
            });

            console.error('[MAIL ERROR]', error);
            throw new Error(error.message || 'Gagal mengirim email reset password');
        }
    }

    // Reset Password
    async resetPassword(token: string, newPass: string) {
        const hashedToken = await this.hashToken(token);

        const user = await this.prisma.user.findFirst({
            where: {
                passwordResetToken: hashedToken,
                passwordResetExpires: { gt: new Date() },
            },
        });

        if (!user) {
            throw new NotFoundException('Token tidak valid atau sudah kedaluwarsa.');
        }

        const newHashedPassword = await this.hashData(newPass);

        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                password: newHashedPassword,
                passwordResetToken: null,
                passwordResetExpires: null,
            },
        });

        return {
            success: true,
            message: 'Password berhasil direset.'
        };
    }

    // --- FUNGSI BANTUAN ---
    private async hashData(data: string) {
        return bcrypt.hash(data, 10);
    }

    private async hashToken(data: string) {
        return crypto.createHash('sha256').update(data).digest('hex');
    }

    private async updateRefreshTokenHash(userId: number, refreshToken: string) {
        const hash = await this.hashToken(refreshToken);
        await this.prisma.user.update({
            where: { id: userId },
            data: { hashedRefreshToken: hash },
        });
    }

    private async getTokens(payload: { sub: number; email: string; username: string; roles: string[]; }) {
        const accessToken = await this.jwtService.signAsync(payload, {
            secret: this.configService.get<string>('JWT_SECRET'),
            expiresIn: this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRATION_TIME'),
        });

        // Refresh token
        const refreshToken = await this.jwtService.signAsync(payload, {
            secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
            expiresIn: this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRATION_TIME'),
        });

        return [accessToken, refreshToken];
    }
}