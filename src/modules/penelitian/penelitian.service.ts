import { deleteFileFromDisk, handleUpload } from '@/common/utils/dataFile';
import { handleCreateError, handleDeleteError, handleFindError, handleUpdateError } from '@/common/utils/prisma-error-handler';
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { JenisKategoriPenelitian, KategoriPenelitian, Prisma, StatusValidasi, SubJenisPenelitian, TypeUserRole } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { cleanRelasi } from '@/common/utils/cleanRelasi';
import { parseAndThrow } from '@/common/utils/zod-helper';
import { fullCreatePenelitianSchema, UpdateStatusValidasiDto, updateStatusValidasiSchema } from './dto/create-penelitian.dto';
import { fullUpdatePenelitianSchema } from './dto/update-penelitian.dto';
import { buildWhereClause } from '@/common/utils/buildWhere';
import { UpdatePenelitianInput } from './penelitian.types';

@Injectable()
export class PenelitianService {
  private readonly UPLOAD_PATH = 'penelitian';

  constructor(private readonly prisma: PrismaService) {
  }

  private getNilaiPak(kategori: string, jenisKategori?: string, subJenis?: string, jumlahPenulis?: number, koresponden?: boolean): number {
    let nilaiPak = 0;

    switch (kategori) {
      case 'KARYA_ILMIAH': {
        switch (subJenis) {
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
          case 'JURNAL_INTERNASIONAL_BEREPUTASI':
            nilaiPak = 40;
            break;
          case 'JURNAL_INTERNASIONAL_INDEKS_BEREPUTASI':
            nilaiPak = 30;
            break;
          case 'JURNAL_INTERNASIONAL':
            nilaiPak = 20;
            break;
          case 'JURNAL_NASIONAL_TERAKREDITASI_P1_P2':
            nilaiPak = 25;
            break;
          case 'JURNAL_NASIONAL_DIKTI':
            nilaiPak = 25;
            break;
          case 'JURNAL_NASIONAL_BERBAHASA_PBB_INDEKS':
            nilaiPak = 20;
            break;
          case 'JURNAL_NASIONAL_TERAKREDITASI_P3_P4':
            nilaiPak = 15;
            break;
          case 'JURNAL_NASIONAL':
            nilaiPak = 10;
            break;
          case 'JURNAL_PBB_TIDAK_MEMENUHI':
            nilaiPak = 10;
            break;
        }
        break;
      }

      case 'PENELITIAN_DIDEMINASI': {

        switch (jenisKategori) {
          // Prosiding dipublikasikan
          case 'PROSIDING_DIPUBLIKASIKAN':
            switch (subJenis) {
              case 'PROSIDING_INTERNASIONAL_TERINDEKS':
                nilaiPak = 30;
                break;
              case 'PROSIDING_INTERNASIONAL_TIDAK_TERINDEKS':
                nilaiPak = 15;
                break;
              case 'PROSIDING_NASIONAL_TIDAK_TERINDEKS':
                nilaiPak = 10;
                break;
            }
            break;

          // Seminar tanpa prosiding
          case 'SEMINAR_TANPA_PROSIDING':
            switch (subJenis) {
              case 'INTERNASIONAL':
                nilaiPak = 5;
                break;
              case 'NASIONAL':
                nilaiPak = 3;
                break;
            }
            break;

          // Prosiding tanpa presentasi
          case 'PROSIDING_TANPA_SEMINAR':
            switch (subJenis) {
              case 'INTERNASIONAL':
                nilaiPak = 10;
                break;
              case 'NASIONAL':
                nilaiPak = 5;
                break;
            }
            break;

          // Koran Majalah Publikasi populer
          case 'KORAN_MAJALAH':
            nilaiPak = 1;
            break;
        }

        break;
      }

      case 'PENELITIAN_TIDAK_DIPUBLIKASI': nilaiPak = 2; break;
      case 'TERJEMAHAN_BUKU': nilaiPak = 15; break;
      case 'SUNTINGAN_BUKU': nilaiPak = 10; break;

      case 'KARYA_BERHAKI': {
        switch (jenisKategori) {
          case 'PATEN_INTERNASIONAL_INDUSTRI': {
            nilaiPak = 60;
            break;
          }
          case 'PATEN_INTERNASIONAL': {
            nilaiPak = 50;
            break;
          }
          case 'PATEN_NASIONAL_INDUSTRI': {
            nilaiPak = 40;
            break;
          }
          case 'PATEN_NASIONAL': {
            nilaiPak = 30;
            break;
          }
          case 'PATEN_SEDERHANA': {
            nilaiPak = 20;
            break;
          }
          case 'CIPTAAN_DESAIN_GEOGRAFIS': {
            nilaiPak = 15;
            break;
          }
          case 'CIPTAAN_BAHAN_PENGAJAR': {
            nilaiPak = 15;
            break;
          }
        }

        break;
      }

      case 'KARYA_NON_HAKI': {
        switch (jenisKategori) {
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

      case 'SENI_NON_HAKI': nilaiPak = 10; break;

    }

    if (jumlahPenulis && jumlahPenulis > 1) {
      if (koresponden) {
        return nilaiPak * 0.6;
      } else {
        return (nilaiPak * 0.4) / (jumlahPenulis - 1);
      }
    }

    return nilaiPak;
  }

  private async aggregateByDosenRaw(
    dosenId: number,
    filter: Prisma.PenelitianWhereInput = {},
    deepKategori = true,
    deepJenis = false,
    deepSub = false,
    includeStatus = false,
  ): Promise<any> {
    const additional = buildWhereClause(filter, 'Penelitian');
    const fullWhere =
      additional === Prisma.empty
        ? Prisma.sql`"dosenId" = ${dosenId}`
        : Prisma.sql`"dosenId" = ${dosenId} AND ${additional}`;

    const groupCols: string[] = [];
    if (deepKategori) groupCols.push('"kategori"');
    if (deepJenis) groupCols.push('"jenisKategori"');
    if (deepSub) groupCols.push('"subJenis"');

    if (groupCols.length === 0) return {};

    const raw = await this.prisma.$queryRaw<any[]>`
    SELECT
      ${Prisma.raw(groupCols.join(', '))},
      SUM("nilaiPak")::float AS total
      ${includeStatus
        ? Prisma.raw(`, COUNT(CASE WHEN "statusValidasi" = 'PENDING' THEN 1 END)::int AS pending,
                       COUNT(CASE WHEN "statusValidasi" = 'APPROVED' THEN 1 END)::int AS approved,
                       COUNT(CASE WHEN "statusValidasi" = 'REJECTED' THEN 1 END)::int AS rejected`)
        : Prisma.empty}
    FROM "Penelitian"
    WHERE ${fullWhere}
    GROUP BY ${Prisma.raw(groupCols.join(', '))}
    ORDER BY ${Prisma.raw(groupCols.join(', '))}
  `;

    const result: any = {};
    for (const row of raw) {
      let cursor = result;

      if (deepKategori) {
        const k = row.kategori;
        cursor[k] = cursor[k] || { total: 0 };
        if (includeStatus) {
          cursor[k].statusCounts = {
            pending: row.pending || 0,
            approved: row.approved || 0,
            rejected: row.rejected || 0,
          };
        }
        cursor[k].total += row.total;
        if (deepJenis) cursor = cursor[k];
      }

      if (deepJenis) {
        const jk = row.jenisKategori ?? '_null';
        cursor.jenis = cursor.jenis || {};
        cursor.jenis[jk] = cursor.jenis[jk] || { total: 0 };
        if (includeStatus) {
          cursor.jenis[jk].statusCounts = {
            pending: row.pending || 0,
            approved: row.approved || 0,
            rejected: row.rejected || 0,
          };
        }
        cursor.jenis[jk].total += row.total;
        if (deepSub) cursor = cursor.jenis[jk];
      }

      if (deepSub) {
        const sj = row.subJenis ?? '_null';
        cursor.sub = cursor.sub || {};
        cursor.sub[sj] = cursor.sub[sj] || { total: 0 };
        if (includeStatus) {
          cursor.sub[sj].statusCounts = {
            pending: row.pending || 0,
            approved: row.approved || 0,
            rejected: row.rejected || 0,
          };
        }
        cursor.sub[sj].total += row.total;
      }
    }

    return result;
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

      const { semesterId, kategori, judul, tglTerbit, ...kategoriFields } = data;
      const jenisKategori: JenisKategoriPenelitian | null =
        "jenisKategori" in data ? (data.jenisKategori as JenisKategoriPenelitian) : null;
      const subJenis: SubJenisPenelitian | null =
        "subJenis" in data ? (data.subJenis as SubJenisPenelitian) : null;
      const jumlahPenulis = "jumlahPenulis" in data ? (data.jumlahPenulis) : undefined;
      const koresponden = "corespondensi" in data ? (data.corespondensi) : undefined;

      let nilaiPak = 0;

      nilaiPak = this.getNilaiPak(
        kategori,
        jenisKategori ?? undefined,
        subJenis ?? undefined,
        jumlahPenulis,
        koresponden
      );
      console.log(`Nilai PAK: ${nilaiPak}`);

      delete (kategoriFields as any).jenisKategori;
      delete (kategoriFields as any).subJenis;

      return {
        success: true,
        message: 'Data berhasil ditambahkan',
        data: await this.prisma.penelitian.create({
          data: {
            dosenId,
            semesterId,
            kategori,
            jenisKategori,
            subJenis,
            judul,
            tglTerbit,
            nilaiPak,
            filePath: relativePath,
            detail: kategoriFields
          },
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
    const finalDosenId = dosenId ?? (query.dosenId ? Number(query.dosenId) : undefined);

    const sortField = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';

    // Sorting
    const allowedSortFields = ['createdAt', 'updatedAt', 'nilaiPak', 'kategori', 'statusValidasi'];
    const sortBy = query.sortBy && allowedSortFields.includes(query.sortBy)
      ? query.sortBy
      : 'createdAt';

    const where: Prisma.PenelitianWhereInput = {};

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
          semester: { select: { id: true, nama: true } },
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
        true,
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
    console.log(TypeUserRole);

    try {
      const data = await this.prisma.penelitian.findUniqueOrThrow({
        where: { id },
        include: {
          dosen: { select: { id: true, nama: true } },
          semester: { select: { id: true, nama: true } },
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

  async update(
    id: number,
    dosenId: number,
    rawData: any,
    roles: TypeUserRole[],
    file?: Express.Multer.File
  ) {
    const data = parseAndThrow(fullUpdatePenelitianSchema, rawData);
    console.log(`[UPDATE] Data setelah parse: ${JSON.stringify(data, null, 2)}`);

    let newFilePath: string | undefined;

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const existing = await tx.penelitian.findUniqueOrThrow({ where: { id } });

        // hanya admin atau pemilik data yang boleh update
        if (!roles.includes(TypeUserRole.ADMIN) && existing.dosenId !== dosenId) {
          throw new ForbiddenException('Anda tidak diizinkan mengakses data ini');
        }

        // upload file baru jika ada
        if (file) {
          newFilePath = await handleUpload({
            file,
            uploadSubfolder: this.UPLOAD_PATH,
          });
        }

        const { kategori, semesterId, judul, tglTerbit, ...kategoriFields } = data;

        // safe narrowing
        const jenisKategori: JenisKategoriPenelitian | null =
          "jenisKategori" in data ? (data.jenisKategori as JenisKategoriPenelitian) : null;
        const subJenis: SubJenisPenelitian | null =
          "subJenis" in data ? (data.subJenis as SubJenisPenelitian) : null;
        const jumlahPenulis = "jumlahPenulis" in data ? (data.jumlahPenulis) : undefined;
        const koresponden = "corespondensi" in data ? (data.corespondensi) : undefined;

        let nilaiPak = 0;

        nilaiPak = this.getNilaiPak(
          kategori,
          jenisKategori ?? undefined,
          subJenis ?? undefined,
          jumlahPenulis,
          koresponden
        );
        console.log(`Nilai PAK: ${nilaiPak}`);

        delete (kategoriFields as any).jenisKategori;
        delete (kategoriFields as any).subJenis;

        const updated = await tx.penelitian.update({
          where: { id },
          data: {
            dosenId,
            semesterId,
            kategori,
            jenisKategori: jenisKategori ?? undefined,
            subJenis: subJenis ?? undefined,
            judul,
            tglTerbit,
            nilaiPak,
            filePath: newFilePath ?? existing.filePath,
            detail: kategoriFields,
            statusValidasi: StatusValidasi.PENDING,
            catatan: null,
          },
        });

        return { updated, existing };
      });

      // hapus file lama setelah transaksi sukses
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
