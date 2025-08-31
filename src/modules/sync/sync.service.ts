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
                },
                create: {
                    externalId: item.idJurusan,
                    kode: item.kodeJurusan,
                    kodeFp: item.kodeFp,
                    nama: item.programStudi,
                    jenjang: item.jenjang,
                    fakultasId: fakultas.id,
                },
            });
        }

        return `${items.length} prodi berhasil disinkronkan`;
    }

    async syncDosen() {
        // const res = await this.httpService.axiosRef.get(
        //     'https://apikey.umpo.ac.id/lpsi/api/vdosen/find-all-kodefp',
        // );
        const res = await this.httpService.axiosRef.get('http://154.26.131.207:3444/api/dosen');
        const items = res.data?.data || [];

        const DEFAULT_PASSWORD = await hashPassword('dosen123');

        for (const item of items) {
            const prodi = await this.prisma.prodi.findUnique({
                where: { kodeFp: item.kodeFp },
                include: { fakultas: true },
            });

            if (!prodi) {
                console.warn(`Prodi dengan kodeFp ${item.kodeFp} tidak ditemukan. Skip dosen: ${item.nama}`);
                continue;
            }

            // Buat atau update User
            const user = await this.prisma.user.upsert({
                where: { externalId: item.id },
                update: {},
                create: {
                    email: item.email,
                    username: item.nik,
                    name: item.nama,
                    password: DEFAULT_PASSWORD,
                },
            });

            await this.prisma.dosen.upsert({
                where: { externalId: item.id },
                update: {
                    nama: item.nama,
                    nik: item.nik || null,
                    jenis_kelamin: item.genderId === 1 ? 'Laki-laki' : 'Perempuan',
                    prodiId: prodi.id,
                    fakultasId: prodi.fakultasId,
                },
                create: {
                    id: user.id,
                    externalId: item.id,
                    nama: item.nama,
                    nik: item.nik || null,
                    jenis_kelamin: item.genderId === 1 ? 'Laki-laki' : 'Perempuan',
                    prodiId: prodi.id,
                    fakultasId: prodi.fakultasId,
                    jabatan: ''
                },
            });
        }

        return `${items.length} dosen berhasil disinkronkan`;
    }

}