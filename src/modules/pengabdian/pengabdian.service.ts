import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { JenisKegiatanPengabdian, KategoriPengabdian, Prisma, StatusValidasi, Tingkat, TingkatPengabdian, TypeUserRole } from '@prisma/client';
import { fullCreatePengabdianSchema, UpdateStatusValidasiDto, updateStatusValidasiSchema } from './dto/create-pengabdian.dto';
import { parseAndThrow } from '@/common/utils/zod-helper';
import { deleteFileFromDisk, handleUpload } from '@/common/utils/dataFile';
import { handleCreateError, handleDeleteError, handleFindError, handleUpdateError } from '@/common/utils/prisma-error-handler';
import { cleanRelasi } from '@/common/utils/cleanRelasi';
import { fullUpdatePengabdianSchema } from './dto/update-pengabdian.dto';
import { buildWhereClause } from '@/common/utils/buildWhere';

@Injectable()
export class PengabdianService {
  private readonly UPLOAD_PATH = 'pengabdian';

  constructor(private readonly prisma: PrismaService) {
  }

  private getNilaiPak(kategori: string, tingkat?: string, jenisKegiatan?: string): number {

    console.log(`Kategori: ${kategori} Tingkat: ${tingkat} jenisKegiatan: ${jenisKegiatan}`)

    let nilaiPak = 0;

    switch (kategori) {
      case 'JABATAN_PIMPINAN_LEMBAGA_PEMERINTAHAN': nilaiPak = 5.5; break;
      case 'PENGEMBANGAN_HASIL_PENDIDIKAN_PENELITIAN': nilaiPak = 3; break;

      case 'PENYULUHAN_MASYARAKAT_SEMESTER': {
        switch (tingkat) {
          case 'INTERNASIONAL': nilaiPak = 4; break;
          case 'NASIONAL': nilaiPak = 3; break;
          case 'LOKAL': nilaiPak = 2; break;
        }
        break;
      }

      case 'PENYULUHAN_MASYARAKAT_KURANG_SEMESTER': {
        switch (tingkat) {
          case 'INTERNASIONAL': nilaiPak = 3; break;
          case 'NASIONAL': nilaiPak = 2; break;
          case 'LOKAL': nilaiPak = 1; break;
          case 'INSENDENTAL': nilaiPak = 1; break;
        }
        break;
      }

      case 'PELAYANAN_MASYARAKAT': {
        switch (jenisKegiatan) {
          case 'BIDANG_KEAHLIAN': nilaiPak = 1.5; break;
          case 'PENUGASAN_PT': nilaiPak = 1; break;
          case 'FUNGSI_JABATAN': nilaiPak = 0.5; break;
        }
        break;
      }

      case 'KARYA_TIDAK_DIPUBLIKASIKAN': nilaiPak = 3; break;
      case 'KARYA_DIPUBLIKASIKAN': nilaiPak = 5; break;

      case 'PENGELOLAAN_JURNAL': {
        switch (tingkat) {
          case 'JURNAL_INTERNASIONAL': nilaiPak = 1; break;
          case 'JURNAL_NASIONAL': nilaiPak = 0.5; break;
        }
        break;
      }
    }

    return nilaiPak;
  }

  private async aggregateByDosenRaw(
    dosenId: number,
    filter: Prisma.PengabdianWhereInput = {},
    deepKategori = true,
    deepJenis = false,
    deepTingkat = false,
  ): Promise<any> {

    const whereClause = Prisma.sql`"dosenId" = ${dosenId}`;
    const additional = buildWhereClause(filter, 'Pengabdian');
    const fullWhere =
      additional === Prisma.empty
        ? whereClause
        : Prisma.sql`${whereClause} AND ${additional}`;

    const groupCols: string[] = [];
    if (deepKategori) groupCols.push('"kategori"');
    if (deepJenis) groupCols.push('"jenisKegiatan"');
    if (deepTingkat) groupCols.push('"tingkat"');

    if (groupCols.length === 0) return {};

    const raw = await this.prisma.$queryRaw<any[]>`
    SELECT
      ${Prisma.raw(groupCols.join(', '))},
      SUM("nilaiPak")::float AS total
    FROM "Pengabdian"
    WHERE ${fullWhere}
    GROUP BY ${Prisma.raw(groupCols.join(', '))}
    ORDER BY ${Prisma.raw(groupCols.join(', '))}
  `;

    const result: any = {};
    for (const row of raw) {
      const { kategori, total } = row;

      result[kategori] = result[kategori] || { total: 0 };
      result[kategori].total += total;

      if (deepJenis) {
        const jk = row.jenisKegiatan ?? '_null';
        result[kategori].jenis = result[kategori].jenis || {};
        result[kategori].jenis[jk] = (result[kategori].jenis[jk] || 0) + total;
      }

      if (deepTingkat) {
        const tk = row.tingkat ?? '_null';
        result[kategori].tingkat = result[kategori].tingkat || {};
        result[kategori].tingkat[tk] = (result[kategori].tingkat[tk] || 0) + total;
      }
    }

    return result;
  }

  async create(dosenId: number, rawData: any, file: Express.Multer.File) {
    const data = parseAndThrow(fullCreatePengabdianSchema, rawData);
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

      const jenisKegiatan: JenisKegiatanPengabdian | null =
        "jenisKegiatan" in data ? (data.jenisKegiatan as JenisKegiatanPengabdian) : null;

      const tingkat: TingkatPengabdian | null =
        "tingkat" in data ? (data.tingkat as TingkatPengabdian) : null;

      let nilaiPak = 0;

      nilaiPak = this.getNilaiPak(
        data.kategori,
        tingkat ?? undefined,
        jenisKegiatan ?? undefined,
      );

      console.log(`Nilai PAK: ${nilaiPak}`);
      const { kategori, semesterId, ...kategoriFields } = data;

      delete (kategoriFields as any).jenisKegiatan;
      delete (kategoriFields as any).tingkat;

      return {
        success: true,
        message: 'Data berhasil ditambahkan',
        data: await this.prisma.pengabdian.create({
          data: {
            dosenId,
            semesterId,
            kategori,
            jenisKegiatan,
            tingkat,
            nilaiPak,
            filePath: relativePath,
            detail: kategoriFields
          },
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
    const finalDosenId = dosenId ?? (query.dosenId ? Number(query.dosenId) : undefined);

    const sortField = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';

    // Sorting
    const allowedSortFields = ['createdAt', 'updatedAt', 'nilaiPak', 'kategori', 'statusValidasi'];

    const sortBy = query.sortBy && allowedSortFields.includes(query.sortBy)
      ? query.sortBy
      : 'createdAt';

    const where: Prisma.PengabdianWhereInput = {};

    // Filtering
    if (finalDosenId) {
      where.dosenId = finalDosenId;
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
          semester: {
            select: { id: true, nama: true }
          }
        },
      }),
    ]);

    let aggregate: any = null;
    if (finalDosenId) {
      aggregate = await this.aggregateByDosenRaw(
        finalDosenId,
        where,
        true,
        false,
        false,
      );
    }

    return {
      success: true,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      data: data,
      ...(aggregate && { aggregate }),
    };
  }

  async findOne(id: number, dosenId: number, roles: TypeUserRole | TypeUserRole[]) {
    try {
      const data = await this.prisma.pengabdian.findUniqueOrThrow({
        where: { id },
        include: {
          dosen: { select: { id: true, nama: true } },
          semester: {
            select: { id: true, nama: true }
          },
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

  async update(
    id: number,
    dosenId: number,
    rawData: any,
    roles: TypeUserRole,
    file?: Express.Multer.File
  ) {
    const data = parseAndThrow(fullUpdatePengabdianSchema, rawData);

    let newFilePath: string | undefined;
    if (file) {
      newFilePath = await handleUpload({
        file,
        uploadSubfolder: this.UPLOAD_PATH,
      });
    }

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const existing = await tx.pengabdian.findUniqueOrThrow({ where: { id } });

        if (!roles.includes(TypeUserRole.ADMIN) && existing.dosenId !== dosenId) {
          throw new ForbiddenException('Anda tidak diizinkan mengakses data ini');
        }

        const payload: any = {};

        if ('semesterId' in data) payload.semesterId = data.semesterId;
        if ('kategori' in data) payload.kategori = data.kategori;

        if ('jenisKegiatan' in data) payload.jenisKegiatan = data.jenisKegiatan;
        if ('tingkat' in data) payload.tingkat = data.tingkat;

        const needRecalc =
          'kategori' in payload ||
          'tingkat' in payload ||
          'jenisKegiatan' in payload;

        if (needRecalc) {
          payload.nilaiPak = this.getNilaiPak(
            payload.kategori ?? existing.kategori,
            payload.tingkat ?? existing.tingkat,
            payload.jenisKegiatan ?? existing.jenisKegiatan,
          );
        }

        const { kategori, semesterId, jenisKegiatan, tingkat, ...detailRest } = data;
        if (Object.keys(detailRest).length) {
          payload.detail = {
            ...(typeof existing.detail === 'object' && existing.detail !== null
              ? existing.detail
              : {}),
            ...detailRest,
          };
        }

        if (newFilePath) payload.filePath = newFilePath;

        payload.statusValidasi = StatusValidasi.PENDING;
        payload.catatan = null;

        const updated = await tx.pengabdian.update({
          where: { id },
          data: payload,
        });

        return { updated, existing };
      });

      // Hapus file lama jika ada
      if (newFilePath && result.existing.filePath) {
        await deleteFileFromDisk(result.existing.filePath);
      }

      return {
        success: true,
        message: 'Data berhasil diperbarui',
        data: result.updated,
      };
    } catch (err) {
      if (newFilePath) await deleteFileFromDisk(newFilePath);
      handleUpdateError(err, 'Pengabdian');
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
