import { deleteFileFromDisk, handleUpload } from '@/common/utils/dataFile';
import { handleCreateError, handleDeleteError, handleFindError, handleUpdateError } from '@/common/utils/prisma-error-handler';
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { KategoriPenelitian, Prisma, StatusValidasi, TypeUserRole } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { cleanRelasi } from '@/common/utils/cleanRelasi';
import { parseAndThrow } from '@/common/utils/zod-helper';
import { fullCreatePenelitianSchema, UpdateStatusValidasiDto, updateStatusValidasiSchema } from './dto/create-penelitian.dto';
import { fullUpdatePenelitianSchema } from './dto/update-penelitian.dto';

@Injectable()
export class PenelitianService {
  private readonly UPLOAD_PATH = 'penelitian';

  constructor(private readonly prisma: PrismaService) {
  }

  private kategoriToRelationKey(kategori: KategoriPenelitian): string {
    const map: Record<KategoriPenelitian, string> = {
      KARYA_ILMIAH: 'karyaIlmiah',
      DISEMINASI: 'penelitianDiseminasi',
      PENELITIAN_TIDAK_DIPUBLIKASIKAN: 'penelitianTidakDipublikasi',
      MENERJEMAHKAN_BUKU: 'menerjemahkanBuku',
      EDITING_BUKU: 'editingBuku',
      PATEN_HAKI: 'karyaPatenHki',
      TEKNOLOGI_NON_PATEN: 'karyaNonPaten',
      SENI_NON_HKI: 'seniNonHki',
    };
    return map[kategori];
  }

  private getNilaiPak(kategori: string, jenisProduk?: string, jenisKegiatan?: string): number {
    let nilaiPak = 0;

    switch (kategori) {
      case 'KARYA_ILMIAH': {
        switch (jenisProduk) {
          case 'BUKU_REFERENSI':
            nilaiPak = 40;
            break;
          case 'MONOGRAF':
            nilaiPak = 20;
            break;
          case 'INTERNASIONAL':
            nilaiPak = 15;
            break;
          case 'NASIONAL':
            nilaiPak = 10;
            break;
          case 'JURNAL_INT_BEREPUTASI':
            nilaiPak = 40;
            break;
          case 'JURNAL_INT_TERINDEKS':
            nilaiPak = 30;
            break;
          case 'JURNAL_INT':
            nilaiPak = 20;
            break;
          case 'JURNAL_NAS_DIKTI':
            nilaiPak = 25;
            break;
          case 'JURNAL_NAS_SINTA_1_2':
            nilaiPak = 25;
            break;
          case 'JURNAL_NAS_KEMENRISTEKDIKTI':
            nilaiPak = 20;
            break;
          case 'JURNAL_NAS_SINTA_3_4':
            nilaiPak = 15;
            break;
          case 'JURNAL_NAS':
            nilaiPak = 10;
            break;
          case 'JURNAL_PBB':
            nilaiPak = 10;
            break;
        }
        break;
      }

      case 'DISEMINASI': {

        switch (jenisKegiatan) {
          // Prosiding dipublikasikan
          case 'PROSIDING_DIPUBLIKASIKAN':
            switch (jenisProduk) {
              case 'INTERNASIONAL_BEREPUTASI':
                nilaiPak = 30;
                break;
              case 'INTERNASIONAL_NON_INDEKS':
                nilaiPak = 15;
                break;
              case 'NASIONAL':
                nilaiPak = 10;
                break;
            }
            break;

          // Seminar tanpa prosiding
          case 'SEMINAR_TANPA_PROSIDING':
            switch (jenisProduk) {
              case 'SEMINAR_INTERNASIONAL':
                nilaiPak = 5;
                break;
              case 'SEMINAR_NASIONAL':
                nilaiPak = 3;
                break;
            }
            break;

          // Prosiding tanpa presentasi
          case 'PROSIDING_TANPA_PRESENTASI':
            switch (jenisProduk) {
              case 'PROSIDING_INTERNASIONAL':
                nilaiPak = 10;
                break;
              case 'PROSIDING_NASIONAL':
                nilaiPak = 5;
                break;
            }
            break;

          // Publikasi populer
          case 'PUBLIKASI_POPULER':
            nilaiPak = 1;
            break;
        }

        break;
      }

      case 'PENELITIAN_TIDAK_DIPUBLIKASIKAN': nilaiPak = 2; break;
      case 'MENERJEMAHKAN_BUKU': nilaiPak = 15; break;
      case 'EDITING_BUKU': nilaiPak = 10; break;

      case 'PATEN_HAKI': {
        switch (jenisKegiatan) {
          case 'INTERNASIONAL_INDUSTRI': {
            nilaiPak = 60;
            break;
          }
          case 'INTERNASIONAL': {
            nilaiPak = 50;
            break;
          }
          case 'NASIONAL_INDUSTRI': {
            nilaiPak = 40;
            break;
          }
          case 'NASIONAL': {
            nilaiPak = 30;
            break;
          }
          case 'PATEN_SEDERHANA_KI': {
            nilaiPak = 20;
            break;
          }
          case 'SERTIFIKAT_KI': {
            nilaiPak = 15;
            break;
          }
          case 'SERTIFIKAT_BAHAN_AJAR': {
            nilaiPak = 15;
            break;
          }
        }

        break;
      }

      case 'TEKNOLOGI_NON_PATEN': {
        switch (jenisKegiatan) {
          case 'INTERNASIONAL': {
            nilaiPak = 20;
            break;
          }
          case 'NASIONAL': {
            nilaiPak = 15;
            break;
          }
          case 'LOKAL': {
            nilaiPak = 10;
            break;
          }
        }

        break;
      }

      case 'SENI_NON_HKI': nilaiPak = 10; break;

    }
    return nilaiPak;
  }

  async create(dosenId: number, rawData: any, file: Express.Multer.File) {
    const data = parseAndThrow(fullCreatePenelitianSchema, rawData);
    console.log(`[CREATE] Data setelah parse: ${JSON.stringify(data, null, 2)}`);
    console.log(`dosenId: ${dosenId}`);

    let relativePath: string | undefined;

    try {
      const dosen = await this.prisma.dosen.findUniqueOrThrow({
        where: { id: dosenId },
      });

      relativePath = await handleUpload({
        file,
        uploadSubfolder: this.UPLOAD_PATH,
      });

      let nilaiPak = 0;

      if ('jenisProduk' in data || 'jenisKegiatan' in data) {
        nilaiPak = this.getNilaiPak(
          data.kategori,
          'jenisProduk' in data ? data.jenisProduk : undefined,
          'jenisKegiatan' in data ? data.jenisKegiatan : undefined
        );
      }
      console.log(`Nilai PAK: ${nilaiPak}`);

      const { kategori, semesterId, ...kategoriFields } = data;
      const relationKey = this.kategoriToRelationKey(data.kategori);

      return {
        success: true,
        message: 'Data berhasil ditambahkan',
        data: await this.prisma.penelitian.create({
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
        console.error('CREATE Penelitian FAILED:', error);
      }
      if (relativePath) {
        await deleteFileFromDisk(relativePath);
      }
      handleCreateError(error, 'Penelitian');
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

    const where: Prisma.PenelitianWhereInput = {};

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
      if (kategori && Object.values(KategoriPenelitian).includes(kategori as KategoriPenelitian)) {
        where.kategori = kategori as KategoriPenelitian;
      } else if (kategori) {
        throw new BadRequestException(`Kategori tidak valid: ${kategori}`);
      }
    }

    if (semesterId) {
      where.semesterId = semesterId;
    }

    const [total, data] = await this.prisma.$transaction([
      this.prisma.penelitian.count({ where }),
      this.prisma.penelitian.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortField]: sortOrder },
        include: {
          dosen: { select: { id: true, nama: true } },
          semester: true,

          karyaIlmiah: true,
          penelitianDiseminasi: true,
          penelitianTidakDipublikasi: true,
          menerjemahkanBuku: true,
          editingBuku: true,
          karyaPatenHki: true,
          karyaNonPaten: true,
          seniNonHki: true,
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
    console.log(TypeUserRole);

    try {
      const data = await this.prisma.penelitian.findUniqueOrThrow({
        where: { id },
        include: {
          dosen: { select: { id: true, nama: true } },
          semester: true,

          karyaIlmiah: true,
          penelitianDiseminasi: true,
          penelitianTidakDipublikasi: true,
          menerjemahkanBuku: true,
          editingBuku: true,
          karyaPatenHki: true,
          karyaNonPaten: true,
          seniNonHki: true,
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
      handleFindError(error, "Penelitian");
    }
  }

  async update(id: number,
    dosenId: number,
    rawData: any,
    roles: TypeUserRole,
    file?: Express.Multer.File) {

    const data = parseAndThrow(fullUpdatePenelitianSchema, rawData);
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
        const existing = await tx.penelitian.findUniqueOrThrow({
          where: { id }
        });

        if (!roles.includes(TypeUserRole.ADMIN) && existing.dosenId !== dosenId) {
          throw new ForbiddenException('Anda tidak diizinkan mengakses data ini');
        }

        let nilaiPak = 0;

        if ('jenisProduk' in data || 'jenisKegiatan' in data) {
          nilaiPak = this.getNilaiPak(
            data.kategori,
            'jenisProduk' in data ? data.jenisProduk : undefined,
            'jenisKegiatan' in data ? data.jenisKegiatan : undefined
          );
        }

        const { kategori, semesterId, ...kategoriFields } = data;
        const relationKey = this.kategoriToRelationKey(data.kategori);
        const updated = await tx.penelitian.update({
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
        console.error('UPDATE Penelitian FAILED:', error);
      }

      if (newFilePath) {
        await deleteFileFromDisk(newFilePath);
      }
      handleUpdateError(error, 'Penelitian');
    }
  }

  async validate(id: number, rawData: UpdateStatusValidasiDto, reviewerId: number,
  ) {
    try {
      const parsed = parseAndThrow(updateStatusValidasiSchema, rawData);
      const { statusValidasi, catatan } = parsed;

      const existing = await this.prisma.penelitian.findUnique({ where: { id } });

      if (!existing) throw new NotFoundException('Data pendidikan tidak ditemukan');

      return this.prisma.penelitian.update({
        where: { id },
        data: {
          statusValidasi: statusValidasi,
          reviewerId: reviewerId,
          catatan: statusValidasi === 'REJECTED' ? catatan : catatan || null,
        },
      });
    } catch (error) {
      handleUpdateError(error, 'Validasi data Penelitian');
    }
  }

  async delete(id: number, dosenId: number, roles: TypeUserRole | TypeUserRole[]) {
    try {
      const existing = await this.prisma.penelitian.findUniqueOrThrow({
        where: { id },
      });

      if (!roles.includes(TypeUserRole.ADMIN) && existing.dosenId !== dosenId) {
        throw new ForbiddenException('Anda tidak diizinkan mengakses data ini');
      }

      await this.prisma.$transaction(async (tx) => {
        await tx.penelitian.delete({ where: { id } });
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
      handleDeleteError(error, 'Penelitian');
    }
  }
}
