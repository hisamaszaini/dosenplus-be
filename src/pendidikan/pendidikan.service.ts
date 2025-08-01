import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from 'prisma/prisma.service';
import { KategoriPendidikan, TypeUserRole } from '@prisma/client';
import { CreatePendidikanDto, fullPendidikanSchema } from './dto/create-pendidikan.dto';
import { fullUpdatePendidikanSchema, UpdatePendidikanDto } from './dto/update-pendidikan.dto';
import { DataAndFileService } from 'src/utils/dataAndFile';

@Injectable()
export class PendidikanService {
  private readonly UPLOAD_PATH = path.resolve(process.cwd(), 'uploads/pendidikan');

  constructor(
    private readonly prisma: PrismaService,
    private readonly fileUtil: DataAndFileService,
  ) { }

  private getNilaiPak(data: CreatePendidikanDto | UpdatePendidikanDto): number {
    if (data.kategori === KategoriPendidikan.DIKLAT) return 3;

    if (data.kategori === KategoriPendidikan.FORMAL) {
      if (data.jenjang === 'S2') return 150;
      if (data.jenjang === 'S3') return 200;
    }

    return 0;
  }

  async create(dosenId: number, rawData: any, file: Express.Multer.File) {
    const savedFileName = this.fileUtil.generateFileName(file.originalname);

    const parsedData = this.fileUtil.validateAndInjectFilePath(
      fullPendidikanSchema,
      { ...rawData, dosenId },
      savedFileName
    );

    const dosen = await this.prisma.dosen.findUnique({
      where: { id: dosenId },
    });

    if (!dosen) {
      throw new BadRequestException('Dosen tidak ditemukan');
    }

    try {
      await this.fileUtil.writeFile(file, savedFileName);

      const nilaiPak = await this.getNilaiPak(parsedData);

      const pendidikan = await this.prisma.pendidikan.create({
        data: {
          dosenId,
          kategori: parsedData.kategori,
          filePath: savedFileName,
          nilaiPak,
        },
      });

      if (parsedData.kategori === 'FORMAL') {
        await this.prisma.pendidikanFormal.create({
          data: {
            pendidikanId: pendidikan.id,
            jenjang: parsedData.jenjang,
            prodi: parsedData.prodi,
            fakultas: parsedData.fakultas,
            perguruanTinggi: parsedData.perguruanTinggi,
            lulusTahun: parsedData.lulusTahun,
          },
        });
      } else if (parsedData.kategori === 'DIKLAT') {
        await this.prisma.pendidikanDiklat.create({
          data: {
            pendidikanId: pendidikan.id,
            jenisDiklat: parsedData.jenisDiklat,
            namaDiklat: parsedData.namaDiklat,
            penyelenggara: parsedData.penyelenggara,
            peran: parsedData.peran,
            tingkatan: parsedData.tingkatan,
            jumlahJam: parsedData.jumlahJam,
            noSertifikat: parsedData.noSertifikat,
            tglSertifikat: parsedData.tglSertifikat,
            tempat: parsedData.tempat,
            tglMulai: parsedData.tglMulai,
            tglSelesai: parsedData.tglSelesai,
          },
        });
      }

      return {
        success: true,
        message: 'Data berhasil ditambahkan',
        data: pendidikan,
      };
    } catch (error) {
      console.error('Error saat menyimpan pendidikan:', error);
      await this.fileUtil.deleteFile(savedFileName);
      throw new InternalServerErrorException('Gagal menyimpan pendidikan');
    }
  }

  async update(
    id: number,
    dosenId: number,
    rawData: any,
    file?: Express.Multer.File,
    role?: TypeUserRole,
  ) {
    const schema = fullUpdatePendidikanSchema;
    const parsed = schema.safeParse(rawData);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.format());
    }

    const data = parsed.data;

    const existing = await this.prisma.pendidikan.findUnique({
      where: { id },
      include: { Formal: true, Diklat: true },
    });

    if (!existing) throw new NotFoundException('Data pendidikan tidak ditemukan');

    if (role !== TypeUserRole.ADMIN && existing.dosenId !== dosenId) {
      throw new ForbiddenException('Anda tidak berhak memperbarui data ini');
    }

    let filePath = existing.filePath;
    if (file) {
      await this.fileUtil.deleteFile(filePath);
      filePath = this.fileUtil.generateFileName(file.originalname);
      await this.fileUtil.writeFile(file, filePath);
    }

    const nilaiPak = this.getNilaiPak(data);

    return this.prisma.$transaction(async (tx) => {
      const baseUpdate: any = {
        filePath,
        nilaiPak,
      };

      if (data.kategori === 'FORMAL') {
        const { jenjang, prodi, fakultas, perguruanTinggi, lulusTahun } = data;

        await tx.pendidikan.update({
          where: { id },
          data: {
            ...baseUpdate,
            Formal: {
              upsert: {
                update: {
                  ...(jenjang && { jenjang }),
                  ...(prodi && { prodi }),
                  ...(fakultas && { fakultas }),
                  ...(perguruanTinggi && { perguruanTinggi }),
                  ...(lulusTahun && { lulusTahun }),
                },
                create: {
                  jenjang: jenjang!,
                  prodi: prodi!,
                  fakultas: fakultas!,
                  perguruanTinggi: perguruanTinggi!,
                  lulusTahun: lulusTahun!,
                },
              },
            },
            Diklat: { delete: true },
          },
        });
      } else {
        const {
          jenisDiklat,
          namaDiklat,
          penyelenggara,
          peran,
          tingkatan,
          jumlahJam,
          noSertifikat,
          tglSertifikat,
          tempat,
          tglMulai,
          tglSelesai,
        } = data;

        await tx.pendidikan.update({
          where: { id },
          data: {
            ...baseUpdate,
            Diklat: {
              upsert: {
                update: {
                  ...(jenisDiklat && { jenisDiklat }),
                  ...(namaDiklat && { namaDiklat }),
                  ...(penyelenggara && { penyelenggara }),
                  ...(peran && { peran }),
                  ...(tingkatan && { tingkatan }),
                  ...(jumlahJam && { jumlahJam }),
                  ...(noSertifikat && { noSertifikat }),
                  ...(tglSertifikat && { tglSertifikat }),
                  ...(tempat && { tempat }),
                  ...(tglMulai && { tglMulai }),
                  ...(tglSelesai && { tglSelesai }),
                },
                create: {
                  jenisDiklat: jenisDiklat!,
                  namaDiklat: namaDiklat!,
                  penyelenggara: penyelenggara!,
                  peran: peran!,
                  tingkatan: tingkatan!,
                  jumlahJam: jumlahJam!,
                  noSertifikat: noSertifikat!,
                  tglSertifikat: tglSertifikat!,
                  tempat: tempat!,
                  tglMulai: tglMulai!,
                  tglSelesai: tglSelesai!,
                },
              },
            },
            Formal: { delete: true },
          },
        });
      }

      return { success: true, message: 'Pendidikan berhasil diperbarui' };
    });
  }

  async findAll(userId: number, role: TypeUserRole, query: any) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (role !== TypeUserRole.ADMIN) {
      where.dosenId = userId;
    }

    if (query.kategori) where.kategori = query.kategori;
    if (query.jenjang) where.Formal = { jenjang: query.jenjang };

    const allowedSortFields = ['createdAt', 'updatedAt', 'nilaiPak', 'kegiatan'];
    const sortBy = allowedSortFields.includes(query.sortBy) ? query.sortBy : 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';

    if (query.search) {
      const search = query.search.toLowerCase();

      where.OR = [
        { kegiatan: { contains: search, mode: 'insensitive' } },
        { Formal: { prodi: { contains: search, mode: 'insensitive' } } },
        { Formal: { perguruanTinggi: { contains: search, mode: 'insensitive' } } },
        { Diklat: { namaDiklat: { contains: search, mode: 'insensitive' } } },
        { Diklat: { penyelenggara: { contains: search, mode: 'insensitive' } } },
        { dosen: { nama: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.pendidikan.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          Formal: true,
          Diklat: true,
          dosen: { select: { id: true, nama: true } },
        },
      }),
      this.prisma.pendidikan.count({ where }),
    ]);

    return {
      success: true,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      data,
    };
  }

  async findOne(id: number, userId: number, role: TypeUserRole) {
    const pendidikan = await this.prisma.pendidikan.findUnique({
      where: { id },
      include: {
        Formal: true,
        Diklat: true,
        dosen: { select: { id: true, nama: true } },
      },
    });

    if (!pendidikan) throw new NotFoundException('Data tidak ditemukan');
    if (role !== TypeUserRole.ADMIN && pendidikan.dosenId !== userId) {
      throw new ForbiddenException('Anda tidak berhak mengakses data ini');
    }

    return { success: true, data: pendidikan };
  }

  async delete(id: number, userId: number, role: TypeUserRole) {
    const existing = await this.prisma.pendidikan.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Data tidak ditemukan');
    if (role !== TypeUserRole.ADMIN && existing.dosenId !== userId) {
      throw new ForbiddenException('Tidak diizinkan menghapus data ini');
    }

    await this.prisma.pendidikan.delete({ where: { id } });
    await this.fileUtil.deleteFile(existing.filePath);

    return { success: true, message: 'Data berhasil dihapus' };
  }
}
