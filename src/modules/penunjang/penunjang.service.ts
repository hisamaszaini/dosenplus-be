import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { parseAndThrow } from '@/common/utils/zod-helper';
import { fullCreatePenunjangSchema, UpdateStatusValidasiDto, updateStatusValidasiSchema } from './dto/create-penunjang.dto';
import { deleteFileFromDisk, handleUpload } from '@/common/utils/dataFile';
import { JenisKategoriPenunjang, KategoriPenunjang, Prisma, StatusValidasi, TypeUserRole } from '@prisma/client';
import { handleCreateError, handleDeleteError, handleFindError, handleUpdateError } from '@/common/utils/prisma-error-handler';
import { buildWhereClause } from '@/common/utils/buildWhere';
import { cleanRelasi } from '@/common/utils/cleanRelasi';
import { fullUpdatePenunjangSchema } from './dto/update-penunjang.dto';

@Injectable()
export class PenunjangService {
  private readonly UPLOAD_PATH = 'penunjang';

  constructor(private readonly prisma: PrismaService) {
  }

  private getNilaiPak(kategori: string, jenisKategori?: string): number {
    console.log(`Kategori: ${kategori} jenisKategori: ${jenisKategori}`);

    let nilaiPak = 0;

    switch (kategori) {
      case 'ANGGOTA_PANITIA_PT': {
        switch (jenisKategori) {
          case 'KETUA_WAKIL_KEPALA_ANGGOTA_TAHUNAN': nilaiPak = 3; break;
          case 'ANGGOTA_TAHUNAN': nilaiPak = 2; break;
        }
        break;
      }

      case 'ANGGOTA_PANITIA_LEMBAGA_PEMERINTAH': {
        switch (jenisKategori) {
          case 'KETUA_WAKIL_PANITIA_PUSAT': nilaiPak = 3; break;
          case 'ANGGOTA_PANITIA_PUSAT': nilaiPak = 2; break;
          case 'KETUA_WAKIL_PANITIA_DAERAH': nilaiPak = 2; break;
          case 'ANGGOTA_PANITIA_DAERAH': nilaiPak = 1; break;
        }
        break;
      }

      case 'ANGGOTA_ORGANISASI_PROFESI_INTERNASIONAL': {
        switch (jenisKategori) {
          case 'PENGURUS': nilaiPak = 2; break;
          case 'ANGGOTA_ATAS_PERMINTAAN': nilaiPak = 1; break;
          case 'ANGGOTA': nilaiPak = 0.5; break;
        }
        break;
      }

      case 'ANGGOTA_ORGANISASI_PROFESI_NASIONAL': {
        switch (jenisKategori) {
          case 'PENGURUS': nilaiPak = 1.5; break;
          case 'ANGGOTA_ATAS_PERMINTAAN': nilaiPak = 1; break;
          case 'ANGGOTA': nilaiPak = 0.5; break;
        }
        break;
      }

      case 'WAKIL_PT_PANITIA_ANTAR_LEMBAGA': {
        nilaiPak = 1; break;
      }

      case 'DELEGASI_NASIONAL_PERTEMUAN_INTERNASIONAL': {
        switch (jenisKategori) {
          case 'KETUA_DELEGASI': nilaiPak = 3; break;
          case 'ANGGOTA_DELEGASI': nilaiPak = 2; break;
        }

        break;
      }

      case 'AKTIF_PERTEMUAN_ILMIAH_INT_NAS_REG': {
        switch (jenisKategori) {
          case 'KETUA': nilaiPak = 3; break;
          case 'ANGGOTA': nilaiPak = 2; break;
        }

        break;
      }


      case 'AKTIF_PERTEMUAN_ILMIAH_INTERNAL_PT': {
        switch (jenisKategori) {
          case 'KETUA': nilaiPak = 2; break;
          case 'ANGGOTA': nilaiPak = 1; break;
        }

        break;
      }

      case 'TANDA_JASA_PENGHARGAAN': {
        switch (jenisKategori) {
          case 'SATYA_LENCANA_30_TAHUN': nilaiPak = 3; break;
          case 'SATYA_LENCANA_20_TAHUN': nilaiPak = 2; break;
          case 'SATYA_LENCANA_10_TAHUN': nilaiPak = 1; break;
          case 'PENGHARGAAN_INTERNASIONAL': nilaiPak = 5; break;
          case 'PENGHARGAAN_NASIONAL': nilaiPak = 3; break;
          case 'PENGHARGAAN_DAERAH': nilaiPak = 1; break;
        }
      }

      case 'MENULIS_BUKU_SLTA_NASIONAL': {
        nilaiPak = 5;
        break;
      }

      case 'PRESTASI_OLAHRAGA_HUMANIORA': {
        switch (jenisKategori) {
          case 'PIAGAM_MEDALI_INTERNASIONAL': nilaiPak = 5; break;
          case 'PIAGAM_MEDALI_NASIONAL': nilaiPak = 3; break;
          case 'PIAGAM_MEDALI_DAERAH': nilaiPak = 1; break;
        }
        break;
      }

      case 'TIM_PENILAI_JABATAN_AKADEMIK': {
        nilaiPak = 0.5;
        break;
      }
    }

    return nilaiPak;
  }

  private async aggregateByDosenRaw(
    dosenId: number,
    filter: Prisma.PenunjangWhereInput = {},
    deepKategori = true,
    deepJenis = false,
  ): Promise<any> {

    const whereClause = Prisma.sql`"dosenId" = ${dosenId}`;
    const additional = buildWhereClause(filter, 'Penunjang');
    const fullWhere =
      additional === Prisma.empty
        ? whereClause
        : Prisma.sql`${whereClause} AND ${additional}`;

    const groupCols: string[] = [];
    if (deepKategori) groupCols.push('"kategori"');
    if (deepJenis) groupCols.push('"jenisKategori"');

    if (groupCols.length === 0) return {};

    const raw = await this.prisma.$queryRaw<any[]>`
    SELECT
      ${Prisma.raw(groupCols.join(', '))},
      SUM("nilaiPak")::float AS total
    FROM "Penunjang"
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
        const jk = row.jenisKategori ?? '_null';
        result[kategori].jenis = result[kategori].jenis || {};
        result[kategori].jenis[jk] = (result[kategori].jenis[jk] || 0) + total;
      }
    }

    return result;
  }

  async create(dosenId: number, rawData: any, file: Express.Multer.File) {
    const data = parseAndThrow(fullCreatePenunjangSchema, rawData);
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

      const jenisKategori: JenisKategoriPenunjang | null =
        "jenisKategori" in data ? (data.jenisKategori as JenisKategoriPenunjang) : null;

      let nilaiPak = 0;

      nilaiPak = this.getNilaiPak(
        data.kategori,
        jenisKategori ?? undefined,
      );

      console.log(`Nilai PAK: ${nilaiPak}`);
      const { kategori, semesterId, instansi, ...kategoriFields } = data;

      delete (kategoriFields as any).jenisKategori;

      return {
        success: true,
        message: 'Data berhasil ditambahkan',
        data: await this.prisma.penunjang.create({
          data: {
            dosenId,
            semesterId,
            kategori,
            jenisKategori,
            nilaiPak,
            instansi,
            filePath: relativePath,
            detail: kategoriFields
          },
        })
      }

    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('CREATE Penunjang FAILED:', error);
      }
      if (relativePath) {
        await deleteFileFromDisk(relativePath);
      }
      handleCreateError(error, 'Penunjang');
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

    const where: Prisma.PenunjangWhereInput = {};

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
      if (kategori && Object.values(KategoriPenunjang).includes(kategori as KategoriPenunjang)) {
        where.kategori = kategori as KategoriPenunjang;
      } else if (kategori) {
        throw new BadRequestException(`Kategori tidak valid: ${kategori}`);
      }
    }

    if (semesterId) {
      where.semesterId = semesterId;
    }

    const [total, data] = await this.prisma.$transaction([
      this.prisma.penunjang.count({ where }),
      this.prisma.penunjang.findMany({
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
      const data = await this.prisma.penunjang.findUniqueOrThrow({
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

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      console.error(error);
      handleFindError(error, "Penunjang");
    }
  }

  async update(
    id: number,
    dosenId: number,
    rawData: any,
    roles: TypeUserRole,
    file?: Express.Multer.File
  ) {
    const data = parseAndThrow(fullUpdatePenunjangSchema, rawData);
    console.log(`[UPDATE] Data setelah parse: ${JSON.stringify(data, null, 2)}`);

    let newFilePath: string | undefined;
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const existing = await tx.penunjang.findUniqueOrThrow({
          where: { id },
        });

        if (!roles.includes(TypeUserRole.ADMIN) && existing.dosenId !== dosenId) {
          throw new ForbiddenException('Anda tidak diizinkan mengakses data ini');
        }

        if (file) {
          newFilePath = await handleUpload({
            file,
            uploadSubfolder: this.UPLOAD_PATH,
          });
        }

        const jenisKategori: JenisKategoriPenunjang | null =
          "jenisKategori" in data ? (data.jenisKategori as JenisKategoriPenunjang) : null;

        let nilaiPak = this.getNilaiPak(
          data.kategori,
          jenisKategori ?? undefined,
        );

        const { kategori, semesterId, instansi, ...kategoriFields } = data;

        delete (kategoriFields as any).jenisKategori;

        const updated = await tx.penunjang.update({
          where: { id },
          data: {
            dosenId,
            semesterId,
            kategori,
            jenisKategori,
            nilaiPak,
            instansi,
            statusValidasi: StatusValidasi.PENDING,
            catatan: null,
            filePath: newFilePath ?? existing.filePath,
            detail: kategoriFields,
          },
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
      };
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('UPDATE Penunjang FAILED:', error);
      }

      if (newFilePath) {
        await deleteFileFromDisk(newFilePath);
      }
      handleUpdateError(error, 'Penunjang');
    }
  }

  async validate(id: number, rawData: UpdateStatusValidasiDto, reviewerId: number,
  ) {
    try {
      const parsed = parseAndThrow(updateStatusValidasiSchema, rawData);
      const { statusValidasi, catatan } = parsed;

      const existing = await this.prisma.penunjang.findUnique({ where: { id } });

      if (!existing) throw new NotFoundException('Data pendidikan tidak ditemukan');

      return this.prisma.penunjang.update({
        where: { id },
        data: {
          statusValidasi: statusValidasi,
          reviewerId: reviewerId,
          catatan: statusValidasi === 'REJECTED' ? catatan : catatan || null,
        },
      });
    } catch (error) {
      handleUpdateError(error, 'Validasi data Penunjang');
    }
  }

  async delete(id: number, dosenId: number, roles: TypeUserRole | TypeUserRole[]) {
    try {
      const existing = await this.prisma.penunjang.findUniqueOrThrow({
        where: { id },
      });

      if (!roles.includes(TypeUserRole.ADMIN) && existing.dosenId !== dosenId) {
        throw new ForbiddenException('Anda tidak diizinkan mengakses data ini');
      }

      await this.prisma.$transaction(async (tx) => {
        await tx.penunjang.delete({ where: { id } });
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
      handleDeleteError(error, 'Penunjang');
    }
  }
}