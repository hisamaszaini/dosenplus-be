import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
import { hashPassword } from "@/common/utils/hashAndEncrypt";

@Injectable()
export class SyncService {
    constructor(
        private readonly httpService: HttpService,
        private readonly prisma: PrismaService,
    ) { }

    async syncFakultas() {
        // const res = await this.httpService.axiosRef.get('https://apikey.umpo.ac.id/lpsi/api/fakultas/find-all');
        const res = await this.httpService.axiosRef.get('http://154.26.131.207:3444/api/fakultas');
        console.log(res.data);
        const items = res.data?.data || [];
        for (const item of items) {
            await this.prisma.fakultas.upsert({
                where: { externalId: item.idFakultas },
                update: { nama: item.namaFakultas, kode: item.kodeFakultas },
                create: { externalId: item.idFakultas, nama: item.namaFakultas, kode: item.kodeFakultas },
            });
        }
        return `${items.length} fakultas berhasil disinkronkan`;
    }

    async syncProdi() {
        // const res = await this.httpService.axiosRef.get('https://apikey.umpo.ac.id/lpsi/api/jurusan/find-All');
        const res = await this.httpService.axiosRef.get('http://154.26.131.207:3444/api/prodi');
        console.log(res);
        const items = res.data?.data || [];

        for (const item of items) {
            if (!item.kelas) {
                throw new Error(`Data prodi ${item.programStudi} tidak punya kelas`);
            }
            const fakultas = await this.prisma.fakultas.findUnique({
                where: { kode: item.kodeFakultas },
            });

            if (!fakultas) {
                console.warn(`Fakultas dengan kode ${item.kodeFakultas} tidak ditemukan. Skip prodi: ${item.programStudi}`);
                continue;
            }

            await this.prisma.prodi.upsert({
                where: { externalId: item.idJurusan },
                update: {
                    kode: item.kodeJurusan,
                    kodeFp: item.kodeFp,
                    nama: item.programStudi,
                    jenjang: item.jenjang,
                    fakultasId: fakultas.id,
                    kelas: item.kelas
                },
                create: {
                    externalId: item.idJurusan,
                    kode: item.kodeJurusan,
                    kodeFp: item.kodeFp,
                    nama: item.programStudi,
                    jenjang: item.jenjang,
                    fakultasId: fakultas.id,
                    kelas: item.kelas
                },
            });
        }

        return `${items.length} prodi berhasil disinkronkan`;
    }

    async syncDosen(): Promise<string> {
        const res = await this.httpService.axiosRef.get(
            'http://154.26.131.207:3444/api/dosenByProdi',
        );

        const items: Array<{
            id: string;
            nama: string;
            nik?: string | null;
            email?: string | null;
            genderId: 1 | 2;
            kodeSync: string;
        }> = res.data?.data || [];

        const DEFAULT_PASSWORD = await hashPassword('dosen123');
        let success = 0;

        for (const item of items) {
            if (!item.nik) {
                console.warn(`nik kosong – skip dosen ${item.nama}`);
                continue;
            }

            try {
                await this.prisma.$transaction(async (tx) => {
                    const prodi = await tx.prodi.findUnique({
                        where: { kodeFp: item.kodeSync },
                        include: { fakultas: true },
                    });
                    if (!prodi) {
                        console.warn(
                            `Prodi ${item.kodeSync} tidak ditemukan – skip ${item.nama}`,
                        );
                        return;
                    }

                    const roleDosen = await tx.role.findUnique({
                        where: { name: 'DOSEN' },
                    });
                    if (!roleDosen) throw new Error('Role DOSEN tidak ditemukan');

                    const user = await tx.user.upsert({
                        where: { externalId: Number(item.id) },
                        update: {},
                        create: {
                            email: item.email ?? `${item.nik}@umpo.ac.id`,
                            username: item.nik as string,
                            name: item.nama,
                            password: DEFAULT_PASSWORD,
                        },
                    });

                    const exists = await tx.userRole.findFirst({
                        where: { userId: user.id, roleId: roleDosen.id },
                    });
                    if (!exists) {
                        await tx.userRole.create({
                            data: { userId: user.id, roleId: roleDosen.id },
                        });
                    }

                    await tx.dosen.upsert({
                        where: { externalId: Number(item.id) },
                        update: {
                            nama: item.nama,
                            nik: item.nik,
                            jenis_kelamin: item.genderId === 1 ? 'Laki-laki' : 'Perempuan',
                            prodiId: prodi.id,
                            fakultasId: prodi.fakultasId,
                        },
                        create: {
                            id: user.id,
                            externalId: Number(item.id),
                            nama: item.nama,
                            nik: item.nik,
                            jenis_kelamin: item.genderId === 1 ? 'Laki-laki' : 'Perempuan',
                            prodiId: prodi.id,
                            fakultasId: prodi.fakultasId,
                        },
                    });
                });

                success++;
            } catch (err) {
                console.error(`Gagal sync dosen ${item.nama}:`, err.message);
            }
        }

        return `${success} dari ${items.length} dosen berhasil disinkronkan`;
    }
}