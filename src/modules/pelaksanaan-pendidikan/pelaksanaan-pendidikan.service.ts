import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { KategoriKegiatan, Prisma, Role, TypeUserRole } from '@prisma/client';
import { fullPelaksanaanPendidikanSchema } from './dto/create-pelaksanaan-pendidikan.dto';
import { fullUpdatePelaksanaanSchema } from './dto/update-pelaksanaan-pendidikan.dto';
import { parseAndThrow } from '@/common/utils/zod-helper';
import { handleCreateError, handleDeleteError, handleFindError, handleUpdateError } from '@/common/utils/prisma-error-handler';
import { hasRole } from '@/common/utils/hasRole';
import { PrismaService } from '../../../prisma/prisma.service';
import { deleteFileFromDisk, handleUpload } from '@/common/utils/dataFile';

@Injectable()
export class PelaksanaanPendidikanService {
  private readonly UPLOAD_PATH = 'pendidikan';

  constructor(private readonly prisma: PrismaService) {
  }

  private async hitungTotalSksPerkuliahan(dosenId: number, semesterId: number): Promise<number> {
    const pelaksanaan = await this.prisma.pelaksanaanPendidikan.findMany({
      where: {
        dosenId,
        semesterId,
        kategori: 'PERKULIAHAN',
      },
      select: { id: true },
    });

    const pelaksanaanIds = pelaksanaan.map(p => p.id);

    if (pelaksanaanIds.length === 0) return 0;

    const total = await this.prisma.perkuliahan.aggregate({
      where: {
        pelaksanaanId: { in: pelaksanaanIds },
      },
      _sum: { totalSks: true },
    });

    return total._sum.totalSks ?? 0;
  }

  private async getNilaiPakByKategori(kategori: string, dosenId: number, data: any): Promise<number> {
    console.log(`[CREATE] PelaksanaanPendidikan: ${kategori}`);
    console.log(`[CREATE] dosenId: ${dosenId}, semester: ${data.semesterId}`);
    const dosen = await this.prisma.dosen.findUniqueOrThrow({
      where: { id: dosenId },
      select: { jabatan: true },
    });

    switch (kategori) {
      case 'PERKULIAHAN': {
        return await this.prisma.$transaction(async (tx) => {
          // Hitung total SKS yang sudah ada semester ini
          const result = await tx.$queryRawUnsafe<{ totalSks: number }[]>(
            `
          SELECT COALESCE(SUM(sks), 0) AS "totalSks"
          FROM "PelaksanaanPendidikan"
          WHERE "dosenId" = $1
            AND "semesterId" = $2
            AND kategori = 'PERKULIAHAN'
          FOR UPDATE
          `,
            dosenId,
            data.semesterId
          );

          const totalSksBefore = Number(result[0]?.totalSks || 0);

          // Hitung sisa kuota awal
          const availableAwal = Math.max(0, 10 - totalSksBefore);
          const awalCount = Math.min(availableAwal, data.sks);
          const lanjutCount = Math.max(0, data.sks - awalCount);

          // Hitung bobot
          let bobot: number;
          if (data.jabatanFungsional === 'Asisten Ahli') {
            bobot = awalCount * 0.5 + lanjutCount * 0.25;
          } else {
            bobot = awalCount * 1 + lanjutCount * 0.5;
          }

          return bobot;
        });
      }

      case 'BIMBINGAN_SEMINAR':
      case 'BIMBINGAN_KKN':
        return data.jumlahMahasiswa * 1

      case 'PENGUJI_UJIAN_AKHIR':
        return data.peran === 'Ketua Penguji' ? 1 * data.jumlahMahasiswa : 0.5 * data.jumlahMahasiswa

      case 'PEMBINA_KEGIATAN_MHS':
        return 2

      case 'PENGEMBANGAN_PROGRAM':
        return 2

      case 'BAHAN_PENGAJARAN':
        return data.jenisProduk === 'Buku Ajar' ? 20 : 5

      case 'ORASI_ILMIAH':
        return 5

      case 'JABATAN_STRUKTURAL': {
        const map = {
          'Rektor': 6,
          'Wakil Rektor': 5,
          'Ketua Sekolah': 4,
          'Pembantu Ketua Sekolah': 4,
          'Direktur Akademi': 4,
          'Pembantu Direktur': 3,
          'Sekretaris Jurusan': 3,
        }
        return map[data.namaJabatan] || 0
      }

      case 'BIMBING_DOSEN':
        return data.jenisBimbingan === 'Pencangkokan' ? 2 : 1

      case 'DATA_SERING':
        return data.jenis === 'Datasering' ? 5 : 4

      case 'PENGEMBANGAN_DIRI': {
        const jam = data.lamaJam
        if (jam > 960) return 15
        else if (jam >= 641) return 9
        else if (jam >= 481) return 6
        else if (jam >= 161) return 3
        else if (jam >= 81) return 2
        else if (jam >= 30) return 1
        else if (jam >= 10) return 0.5
        return 0
      }

      default:
        return 0
    }
  }

  async create(
    dosenId: number,
    rawData: any,
    file: Express.Multer.File,
  ) {
    const data = parseAndThrow(fullPelaksanaanPendidikanSchema, rawData);
    console.log(`[CREATE] Data setelah parse: ${JSON.stringify(data, null, 2)}`);

    const totalSks = data.jumlahKelas * data.sks;
    console.log(totalSks);

    let relativePath: string | undefined;

    try {
      const dosen = await this.prisma.dosen.findUniqueOrThrow({
        where: { id: dosenId },
        select: { jabatan: true },
      });

      relativePath = await handleUpload({
        file,
        uploadSubfolder: this.UPLOAD_PATH,
      });

      const kategori = data.kategori;
      console.log(dosen.jabatan);

      const nilaiPak = await this.getNilaiPakByKategori(kategori, dosenId, {
        ...data,
        jabatanFungsional: dosen.jabatan,
      });

      console.log(`Nilai PAK: ${nilaiPak}`);

      return {
        success: true,
        message: 'Data berhasil ditambahkan',
        data: await this.prisma.pelaksanaanPendidikan.create({
          data: {
            dosenId,
            semesterId: data.semesterId,
            kategori: data.kategori,
            filePath: relativePath,
            nilaiPak,
          },
        }),
      };
    } catch (error) {
      if (relativePath) {
        await deleteFileFromDisk(relativePath);
      }
      handleCreateError(error, 'Pelaksanaan Pendidikan');
    }
  }

  async update(id: number, dosenId: number, rawData: any, role: TypeUserRole, file?: Express.Multer.File) {
    const data = parseAndThrow(fullUpdatePelaksanaanSchema, rawData);

    const existing = await this.prisma.pelaksanaanPendidikan.findUniqueOrThrow({ where: { id } });

    if (!hasRole(role, TypeUserRole.ADMIN) && existing.dosenId !== dosenId) {
      throw new ForbiddenException('Anda tidak berhak memperbarui data ini');
    }

    let newFilePath: string | undefined = undefined;

    try {
      if (file) {
        newFilePath = await handleUpload({
          file,
          uploadSubfolder: this.UPLOAD_PATH,
        });
      }

      const dosen = await this.prisma.dosen.findUnique({
        where: { id: dosenId },
        select: { jabatan: true },
      });

      const nilaiPak = await this.getNilaiPakByKategori(data.kategori, existing.dosenId, {
        ...data,
        jabatanFungsional: dosen?.jabatan,
      });

      const updated = await this.prisma.pelaksanaanPendidikan.update({
        where: { id },
        data: {
          ...data,
          filePath: newFilePath ?? existing.filePath,
          nilaiPak,
        },
      });

      if (newFilePath && existing.filePath) {
        await deleteFileFromDisk(existing.filePath);
      }

      return {
        success: true,
        message: 'Data berhasil diperbarui',
        data: updated,
      };
    } catch (error) {
      if (newFilePath) {
        await deleteFileFromDisk(newFilePath);
      }
      handleUpdateError(error, 'Pelaksanaan Pendidikan');
    }
  }

  async findAll(query: any, dosenId: number, role: TypeUserRole) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const kategori = query.kategori as string | undefined;
    const semesterId = query.semesterId ? Number(query.semesterId) : undefined;

    const sortField = query.sortBy || 'createdAt';
    const sortOrder = query.order === 'asc' ? 'asc' : 'desc';

    const where: Prisma.PelaksanaanPendidikanWhereInput = {};

    if (role === TypeUserRole.DOSEN) {
      where.dosenId = dosenId;
    }

    if (kategori) {
      if (kategori && Object.values(KategoriKegiatan).includes(kategori as KategoriKegiatan)) {
        where.kategori = kategori as KategoriKegiatan;
      } else if (kategori) {
        throw new BadRequestException(`Kategori tidak valid: ${kategori}`);
      }
    }

    if (semesterId) {
      where.semesterId = semesterId;
    }

    const [total, data] = await this.prisma.$transaction([
      this.prisma.pelaksanaanPendidikan.count({ where }),
      this.prisma.pelaksanaanPendidikan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortField]: sortOrder },
        include: {
          dosen: { select: { id: true, nama: true } },
          semester: true,
        },
      }),
    ]);

    return {
      success: true,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      data,
    };
  }

  async findOne(id: number, dosenId: number, role: TypeUserRole) {
    try {
      const data = await this.prisma.pelaksanaanPendidikan.findUniqueOrThrow({
        where: { id },
        include: {
          dosen: { select: { id: true, nama: true } },
          semester: true,
        },
      });

      if (!hasRole(role, TypeUserRole.ADMIN) && data.dosenId !== dosenId) {
        throw new ForbiddenException('Anda tidak diizinkan mengakses data ini');
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      handleFindError(error, "Pelaksanaan Pendidikan");
    }
  }

  async delete(id: number, dosenId: number, role: TypeUserRole) {
    try {
      const existing = await this.prisma.pelaksanaanPendidikan.findUniqueOrThrow({
        where: { id },
      });

      if (!hasRole(role, TypeUserRole.ADMIN) && existing.dosenId !== dosenId) {
        throw new ForbiddenException('Anda tidak diizinkan menghapus data ini');
      }

      await this.prisma.$transaction(async (tx) => {
        await tx.pelaksanaanPendidikan.delete({ where: { id } });
      });

      if (existing.filePath) {
        await deleteFileFromDisk(existing.filePath);
      }

      return {
        success: true,
        message: 'Data berhasil dihapus',
      };
    } catch (error) {
      handleDeleteError(error, 'Pelaksanaan Pendidikan');
    }
  }
}