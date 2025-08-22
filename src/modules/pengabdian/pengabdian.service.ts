import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { KategoriPengabdian, Prisma, StatusValidasi, TypeUserRole } from '@prisma/client';
import { fullCreatePengabdianSchema, UpdateStatusValidasiDto, updateStatusValidasiSchema } from './dto/create-pengabdian.dto';
import { parseAndThrow } from '@/common/utils/zod-helper';
import { deleteFileFromDisk, handleUpload } from '@/common/utils/dataFile';
import { handleCreateError, handleDeleteError, handleFindError, handleUpdateError } from '@/common/utils/prisma-error-handler';
import { cleanRelasi } from '@/common/utils/cleanRelasi';
import { fullUpdatePengabdianSchema } from './dto/update-pengabdian.dto';

@Injectable()
export class PengabdianService {
  private readonly UPLOAD_PATH = 'pengabdian';

  constructor(private readonly prisma: PrismaService) {
  }

  private kategoriToRelationKey(kategori: KategoriPengabdian): string {
    const map: Record<KategoriPengabdian, string> = {
      JABATAN_PIMPINAN: 'jabatanPimpinan',
      PENGEMBANGAN_DIMANFAATKAN: 'pengembanganDimanfaatkan',
      PENYULUHAN_SATU_SEMESTER: 'penyuluhanSatuSemester',
      PENYULUHAN_KURANG_SATU_SEMESTER: 'penyuluhanKurangSatuSemester',
      PELAYANAN_MASYARAKAT: 'pelayananMasyarakat',
      KARYA_PENGABDIAN_TIDAKPUBLIS: 'karyaPengabdianTidakPublis',
      KARYA_PENGABDIAN_DIPUBLIKASI: 'karyaPengabdianDipublis',
      PENGELOLA_JURNAL: 'pengelolaJurnal',
    };
    return map[kategori];
  }

  private getNilaiPak(kategori: string, tingkat?: string, jenisKegiatan?: string): number {
    let nilaiPak = 0;

    switch (kategori) {
      case 'JABATAN_PIMPINAN': nilaiPak = 5.5; break;
      case 'PENGEMBANGAN_DIMANFAATKAN': nilaiPak = 3; break;

      case 'PENYULUHAN_SATU_SEMESTER': {
        switch (tingkat) {
          case 'INTERNASIONAL': nilaiPak = 4; break;
          case 'NASIONAL': nilaiPak = 3; break;
          case 'LOKAL': nilaiPak = 2; break;
        }
        break;
      }

      case 'PENYULUHAN_KURANG_SATU_SEMESTER': {
        switch (tingkat) {
          case 'INTERNASIONAL': nilaiPak = 3; break;
          case 'NASIONAL': nilaiPak = 2; break;
          case 'LOKAL': nilaiPak = 1; break;
          case 'INSIDENTAL': nilaiPak = 1; break;
        }
        break;
      }

      case 'PELAYANAN_MASYARAKAT': {
        switch (jenisKegiatan) {
          case 'KEAHLIAN': nilaiPak = 1.5; break;
          case 'PENUGASAN': nilaiPak = 1; break;
          case 'FUNGSI_JABATAN': nilaiPak = 0.5; break;
        }
        break;
      }

      case 'KARYA_PENGABDIAN_TIDAKPUBLIS': nilaiPak = 3; break;
      case 'KARYA_PENGABDIAN_DIPUBLIKASI': nilaiPak = 5; break;

      case 'PENGELOLA_JURNAL': {
        switch (tingkat) {
          case 'INTERNASIONAL': nilaiPak = 1; break;
          case 'NASIONAL': nilaiPak = 0.5; break;
        }
        break;
      }
    }

    return nilaiPak;
  }

  async create(dosenId: number, rawData: any, file: Express.Multer.File) {
    const data = parseAndThrow(fullCreatePengabdianSchema, rawData);
    console.log(`[CREATE] Data setelah parse: ${JSON.stringify(data, null, 2)}`);
    console.log(`dosenId: ${dosenId}`);

    let relativePath: string | undefined;

    try {
      const dosen = await this.prisma.pengabdian.findUniqueOrThrow({
        where: { id: dosenId },
      });

      relativePath = await handleUpload({
        file,
        uploadSubfolder: this.UPLOAD_PATH,
      });

      let nilaiPak = 0;

      if ('tingkat' in data || 'jenisKegiatan' in data) {
        nilaiPak = this.getNilaiPak(
          data.kategori,
          'tingkat' in data ? data.tingkat : undefined,
          'jenisKegiatan' in data ? data.jenisKegiatan : undefined
        );
      }
      console.log(`Nilai PAK: ${nilaiPak}`);
      const { kategori, semesterId, ...kategoriFields } = data;
      const relationKey = this.kategoriToRelationKey(data.kategori);

      return {
        success: true,
        message: 'Data berhasil ditambahkan',
        data: await this.prisma.pengabdian.create({
          data: {
            dosenId,
            semesterId,
            filePath: relativePath,
            nilaiPak,
            kategori,
            [relationKey]: {
              create: kategoriFields,
            },
          },
          include: {
            [relationKey]: true,
          }
        })
      }

    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('CREATE Pengabdian FAILED:', error);
      }
      if (relativePath) {
        await deleteFileFromDisk(relativePath);
      }
      handleCreateError(error, 'Pengabdian');
    }
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    dosenId?: number;
    sortBy?: string;
    sortOrder?: string;
    kategori?: string;
    semesterId?: number;
  }, dosenId?: number) {

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const kategori = query.kategori as string | undefined;
    const semesterId = query.semesterId ? Number(query.semesterId) : undefined;

    const sortField = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';

    // Sorting
    const allowedSortFields = ['createdAt', 'updatedAt', 'nilaiPak', 'kategori', 'statusValidasi'];

    const sortBy = query.sortBy && allowedSortFields.includes(query.sortBy)
      ? query.sortBy
      : 'createdAt';

    const where: Prisma.PengabdianWhereInput = {};

    // Filtering
    if (dosenId) {
      where.dosenId = dosenId;
    }

    if (query.search) {
      const search = query.search.toLowerCase();
      where.OR = [
        { dosen: { nama: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (query.status) {
      where.statusValidasi = query.status.toUpperCase() as StatusValidasi;
    }

    if (kategori) {
      if (kategori && Object.values(KategoriPengabdian).includes(kategori as KategoriPengabdian)) {
        where.kategori = kategori as KategoriPengabdian;
      } else if (kategori) {
        throw new BadRequestException(`Kategori tidak valid: ${kategori}`);
      }
    }

    if (semesterId) {
      where.semesterId = semesterId;
    }

    const [total, data] = await this.prisma.$transaction([
      this.prisma.pengabdian.count({ where }),
      this.prisma.pengabdian.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortField]: sortOrder },
        include: {
          dosen: { select: { id: true, nama: true } },
          semester: true,

          jabatanPimpinan: true,
          pengembanganDimanfaatkan: true,
          penyuluhanSatuSemester: true,
          penyuluhanKurangSatuSemester: true,
          pelayananMasyarakat: true,
          karyaPengabdianTidakPublis: true,
          karyaPengabdianDipublis: true,
          pengelolaJurnal: true,
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
      data: data,
    };
  }

  async findOne(id: number, dosenId: number, roles: TypeUserRole | TypeUserRole[]) {
    try {
      const data = await this.prisma.pengabdian.findUniqueOrThrow({
        where: { id },
        include: {
          dosen: { select: { id: true, nama: true } },
          semester: true,

          jabatanPimpinan: true,
          pengembanganDimanfaatkan: true,
          penyuluhanSatuSemester: true,
          penyuluhanKurangSatuSemester: true,
          pelayananMasyarakat: true,
          karyaPengabdianTidakPublis: true,
          karyaPengabdianDipublis: true,
          pengelolaJurnal: true,
        },
      });

      if (!roles.includes(TypeUserRole.ADMIN) && !roles.includes(TypeUserRole.VALIDATOR) && data.dosenId !== dosenId) {
        throw new ForbiddenException('Anda tidak diizinkan mengakses data ini');
      }

      const cleanData = cleanRelasi(data);

      return {
        success: true,
        data: cleanData,
      };
    } catch (error) {
      console.error(error);
      handleFindError(error, "Pengabdian");
    }
  }

  async update(id: number,
    dosenId: number,
    rawData: any,
    roles: TypeUserRole,
    file?: Express.Multer.File) {
    const data = parseAndThrow(fullUpdatePengabdianSchema, rawData);
    console.log(`[UPDATE] Data setelah parse: ${JSON.stringify(data, null, 2)}`);

    let newFilePath: string | undefined;
    try {
      if (file) {
        newFilePath = await handleUpload({
          file,
          uploadSubfolder: this.UPLOAD_PATH,
        });
      }

      const result = await this.prisma.$transaction(async (tx) => {
        const existing = await tx.pengabdian.findUniqueOrThrow({
          where: { id }
        });

        if (!roles.includes(TypeUserRole.ADMIN) && existing.dosenId !== dosenId) {
          throw new ForbiddenException('Anda tidak diizinkan mengakses data ini');
        }

        let nilaiPak = 0;

        if ('tingkat' in data || 'jenisKegiatan' in data) {
          nilaiPak = this.getNilaiPak(
            data.kategori,
            'tingkat' in data ? data.tingkat : undefined,
            'jenisKegiatan' in data ? data.jenisKegiatan : undefined
          );
        }

        const { kategori, semesterId, ...kategoriFields } = data;
        const relationKey = this.kategoriToRelationKey(data.kategori);
        const updated = await tx.pengabdian.update({
          where: { id },
          data: {
            dosenId,
            semesterId,
            filePath: newFilePath ?? existing.filePath,
            nilaiPak,
            statusValidasi: StatusValidasi.PENDING,
            catatan: null,
            [relationKey]: {
              update: kategoriFields,
            },
          },
          include: {
            [relationKey]: true,
          }
        });

        return { updated, existing };
      });

      // Hapus file lama setelah transaksi berhasil
      if (newFilePath && result.existing.filePath) {
        await deleteFileFromDisk(result.existing.filePath);
      }

      return {
        success: true,
        message: 'Data berhasil diperbarui',
        data: result.updated,
      }
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('UPDATE Pengabdian FAILED:', error);
      }

      if (newFilePath) {
        await deleteFileFromDisk(newFilePath);
      }
      handleUpdateError(error, 'Pengabdian');
    }
  }

  async validate(id: number, rawData: UpdateStatusValidasiDto, reviewerId: number,
    ) {
      try {
        const parsed = parseAndThrow(updateStatusValidasiSchema, rawData);
        const { statusValidasi, catatan } = parsed;
  
        const existing = await this.prisma.pengabdian.findUnique({ where: { id } });
  
        if (!existing) throw new NotFoundException('Data pendidikan tidak ditemukan');
  
        return this.prisma.pengabdian.update({
          where: { id },
          data: {
            statusValidasi: statusValidasi,
            reviewerId: reviewerId,
            catatan: statusValidasi === 'REJECTED' ? catatan : catatan || null,
          },
        });
      } catch (error) {
        handleUpdateError(error, 'Validasi data Pengabdian');
      }
    }

  async delete(id: number, dosenId: number, roles: TypeUserRole | TypeUserRole[]) {
    try {
      const existing = await this.prisma.pengabdian.findUniqueOrThrow({
        where: { id },
      });

      if (!roles.includes(TypeUserRole.ADMIN) && existing.dosenId !== dosenId) {
        throw new ForbiddenException('Anda tidak diizinkan mengakses data ini');
      }

      await this.prisma.$transaction(async (tx) => {
        await tx.pengabdian.delete({ where: { id } });
      });

      if (existing.filePath) {
        await deleteFileFromDisk(existing.filePath);
      }

      return {
        success: true,
        message: 'Data berhasil dihapus',
      };
    } catch (error) {
      console.error(error);
      handleDeleteError(error, 'Pengabdian');
    }
  }
}
