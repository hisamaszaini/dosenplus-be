import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from 'prisma/prisma.service';
import { KategoriKegiatan, Prisma, Role, TypeUserRole } from '@prisma/client';
import { fullPelaksanaanPendidikanSchema } from './dto/create-pelaksanaan-pendidikan.dto';
import { fullUpdatePelaksanaanSchema } from './dto/update-pelaksanaan-pendidikan.dto';
import { DataAndFileService } from 'src/utils/dataAndFile';

@Injectable()
export class PelaksanaanPendidikanService {
  private readonly UPLOAD_PATH = path.resolve(process.cwd(), 'uploads/pendidikan');

  constructor(private readonly prisma: PrismaService, private readonly fileUtil: DataAndFileService) {
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

  private async getNilaiPakByKategori(kategori: string, data: any): Promise<number> {
    switch (kategori) {
      case 'PERKULIAHAN': {
        const totalSks = await this.hitungTotalSksPerkuliahan(data.dosenId, data.semesterId);

        const awal = Math.min(10, totalSks);
        const lanjut = Math.max(0, totalSks - 10);

        if (data.jabatanFungsional === 'Asisten Ahli') {
          return awal * 0.5 + lanjut * 0.25;
        } else {
          return awal * 1 + lanjut * 0.5;
        }
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
    file: Express.Multer.File
  ) {
    const schema = fullPelaksanaanPendidikanSchema;
    const parsed = schema.safeParse(rawData);

    if (!parsed.success) {
      throw new BadRequestException(parsed.error.format());
    }

    const data = parsed.data;
    const kategori = data.kategori;

    const dosen = await this.prisma.dosen.findUnique({
      where: { id: dosenId },
      select: { jabatan: true },
    });

    if (!dosen) throw new NotFoundException('Dosen tidak ditemukan');

    const savedFileName = this.fileUtil.generateFileName(file.originalname);

    try {
      await this.fileUtil.writeFile(file, savedFileName);

      const nilaiPak = await this.getNilaiPakByKategori(kategori, {
        ...data,
        jabatanFungsional: dosen.jabatan,
      });

      return {
        success: true,
        message: 'Data berhasil ditambahkan',
        data: await this.prisma.pelaksanaanPendidikan.create({
          data: {
            dosenId,
            semesterId: data.semesterId,
            kategori: data.kategori,
            filePath: savedFileName,
            nilaiPak,
          },
        }),
      };
    } catch (error) {
      console.error('Error saat menyimpan pelaksanaan pendidikan:', error);
      await this.fileUtil.deleteFile(savedFileName);
      throw new InternalServerErrorException('Gagal menyimpan pelaksanaan pendidikan');
    }
  }

  async update(id: number, dosenId: number, rawData: any, file?: Express.Multer.File, role?: TypeUserRole) {
    const schema = fullUpdatePelaksanaanSchema;
    const parsed = schema.safeParse(rawData);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.format());
    }

    const data = parsed.data;

    const existing = await this.prisma.pelaksanaanPendidikan.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Data pelaksanaan pendidikan tidak ditemukan');
    }

    if (role !== TypeUserRole.ADMIN && existing.dosenId !== dosenId) {
      throw new ForbiddenException('Anda tidak berhak memperbarui data ini');
    }

    let filePath = existing.filePath;
    if (file) {
      await this.fileUtil.deleteFile(filePath);
      filePath = this.fileUtil.generateFileName(file.originalname);
      await this.fileUtil.writeFile(file, filePath);
    }

    const nilaiPak = await this.getNilaiPakByKategori(data.kategori, {
      ...data,
      jabatanFungsional: (await this.prisma.dosen.findUnique({ where: { id: dosenId }, select: { jabatan: true } }))?.jabatan,
    });

    const updated = await this.prisma.pelaksanaanPendidikan.update({
      where: { id },
      data: {
        ...data,
        filePath,
        nilaiPak,
      },
    });

    return {
      success: true,
      message: 'Data berhasil diperbarui',
      data: updated,
    };
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
    const data = await this.prisma.pelaksanaanPendidikan.findUnique({
      where: { id },
      include: {
        dosen: { select: { id: true, nama: true } },
        semester: true,
      },
    });

    if (!data) {
      throw new NotFoundException('Data tidak ditemukan');
    }

    if (role !== TypeUserRole.ADMIN && data.dosenId !== dosenId) {
      throw new ForbiddenException('Anda tidak diizinkan mengakses data ini');
    }

    return {
      success: true,
      data,
    };
  }

  async delete(id: number, dosenId: number, role: TypeUserRole) {
    const existing = await this.prisma.pelaksanaanPendidikan.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Data tidak ditemukan');
    }

    if (role !== TypeUserRole.ADMIN && existing.dosenId !== dosenId) {
      throw new ForbiddenException('Anda tidak diizinkan menghapus data ini');
    }

    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.pelaksanaanPendidikan.delete({ where: { id } });
      });

      if (existing.filePath) {
        await this.fileUtil.deleteFile(existing.filePath);
      }

      return {
        success: true,
        message: 'Data berhasil dihapus',
      };
    } catch (error) {
      throw new InternalServerErrorException('Gagal menghapus data');
    }
  }
}