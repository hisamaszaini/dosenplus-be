import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { JenisKategoriPelaksanaan, KategoriPelaksanaanPendidikan, Prisma, Role, StatusValidasi, subJenisPelaksanaan, TypeUserRole } from '@prisma/client';
import { fullPelaksanaanPendidikanSchema, fullUpdatePelaksanaanSchema, jenisKategoriBahanPengajaranEnum, UpdateStatusValidasiDto, updateStatusValidasiSchema } from './dto/create-pelaksanaan-pendidikan.dto';
import { parseAndThrow } from '@/common/utils/zod-helper';
import { handleCreateError, handleDeleteError, handleFindError, handleUpdateError } from '@/common/utils/prisma-error-handler';
import { PrismaService } from '../../../prisma/prisma.service';
import { deleteFileFromDisk, handleUpload } from '@/common/utils/dataFile';
import { cleanRelasi } from '@/common/utils/cleanRelasi';

@Injectable()
export class PelaksanaanPendidikanService {
  private readonly UPLOAD_PATH = 'pendidikan';

  constructor(private readonly prisma: PrismaService) {
  }

  private kategoriToRelationKey(kategori: KategoriPelaksanaanPendidikan): string {
    const map: Record<KategoriPelaksanaanPendidikan, string> = {
      PERKULIAHAN: 'perkuliahan',
      MEMBIMBING_SEMINAR: 'bimbingPengujiMhs',
      MEMBIMBING_KKN_PKN_PKL: 'bimbingPengujiMhs',
      MEMBIMBING_TUGAS_AKHIR: 'bimbingPengujiMhs',
      PENGUJI_UJIAN_AKHIR: 'bimbingPengujiMhs',
      MEMBINA_KEGIATAN_MHS: 'pembinaKegiatanMhs',
      MENGEMBANGKAN_PROGRAM: 'pengembanganProgram',
      BAHAN_PENGAJARAN: 'bahanPengajaran',
      ORASI_ILMIAH: 'orasiIlmiah',
      MENDUDUKI_JABATAN: 'jabatanStruktural',
      MEMBIMBING_DOSEN: 'bimbingDosen',
      DATASERING_PENCANGKOKAN: 'dataseringPencangkokan',
      PENGEMBANGAN_DIRI: 'pengembanganDiri',
    };
    return map[kategori];
  }

  private async hitungTotalSksPerkuliahan(dosenId: number, semesterId: number): Promise<number> {
    const result = await this.prisma.perkuliahan.aggregate({
      _sum: {
        totalSks: true,
      },
      where: {
        pelaksanaan: {
          dosenId,
          semesterId,
          kategori: 'PERKULIAHAN',
        },
      },
    });

    return result._sum.totalSks || 0;
  }

  private async getNilaiPakByKategori(kategori: string, dosenId: number, data: any, id?: number): Promise<number> {
    console.log(`PelaksanaanPendidikan: ${kategori}`);
    console.log(`dosenId: ${dosenId}, semester: ${data.semesterId}`);

    switch (kategori) {
      case 'PERKULIAHAN': {
        return await this.prisma.$transaction(async (tx) => {
          let oldSks = 0;
          let oldSemesterId: number | null = null;

          if (id) {
            const existing = await tx.pelaksanaanPendidikan.findUnique({
              where: { id },
              select: {
                semesterId: true,
                perkuliahan: {
                  select: { totalSks: true },
                },
              },
            });

            if (existing) {
              oldSemesterId = existing.semesterId;
              if (existing.perkuliahan?.totalSks) {
                oldSks = existing.perkuliahan.totalSks;
              }
            }
          }

          let totalSksSemesterIni = await this.hitungTotalSksPerkuliahan(
            dosenId,
            data.semesterId
          );

          // Jika semester sama, kurangi oldSks supaya tidak double count
          if (oldSemesterId === data.semesterId) {
            totalSksSemesterIni -= oldSks;
            console.log(`Total SKS sebelumnya: ${oldSks}`);
          }

          console.log(`Total SKS semester ini setelah adjustment: ${totalSksSemesterIni}`);

          const kuotaNilaiMaksimalSks = 10; // Kuota tiap semester
          const sisaKuota = kuotaNilaiMaksimalSks - totalSksSemesterIni;
          const awalCount = Math.max(0, Math.min(sisaKuota, data.totalSks));
          const lanjutCount = Math.max(0, data.totalSks - awalCount);

          console.log(`Sisa kuota: ${sisaKuota}, awalCount: ${awalCount}, lanjutCount: ${lanjutCount}`);

          let bobot: number;
          if (data.jabatanFungsional === 'Asisten Ahli') {
            bobot = awalCount * 0.5 + lanjutCount * 0.25;
          } else {
            bobot = awalCount * 1 + lanjutCount * 0.5;
          }

          return bobot;
        });
      }

      case 'MEMBIMBING_SEMINAR':
      case 'MEMBIMBING_KKN_PKN_PKL':
        return data.jumlahMhs * 1


      case 'MEMBIMBING_TUGAS_AKHIR': {
        let nilaiPak = 0;
        const { jenisKategori, subJenis, jumlahMhs } = data;

        if (jenisKategori === 'PEMBIMBING_UTAMA') {
          switch (subJenis) {
            case 'DISERTASI':
              nilaiPak = 8 * jumlahMhs;
              break;
            case 'TESIS':
              nilaiPak = 3 * jumlahMhs;
              break;
            case 'SKRIPSI':
            case 'LAPORAN_AKHIR_STUDI':
              nilaiPak = 1 * jumlahMhs;
              break;
            default:
              nilaiPak = 0;
          }
        } else if (jenisKategori === 'PEMBIMBING_PENDAMPING') {
          switch (subJenis) {
            case 'DISERTASI':
              nilaiPak = 6 * jumlahMhs;
              break;
            case 'TESIS':
              nilaiPak = 2 * jumlahMhs;
              break;
            case 'SKRIPSI':
            case 'LAPORAN_AKHIR_STUDI':
              nilaiPak = 0.5 * jumlahMhs;
              break;
            default:
              nilaiPak = 0;
          }
        }

        return nilaiPak;
      }

      case 'PENGUJI_UJIAN_AKHIR':
        return data.peran === 'KETUA_PENGUJI' ? 1 * data.jumlahMhs : 0.5 * data.jumlahMhs

      case 'MEMBINA_KEGIATAN_MHS':
        return 2

      case 'MENGEMBANGKAN_PROGRAM':
        return 2

      case 'BAHAN_PENGAJARAN':
        return data.subJenis === 'BUKU_AJAR' ? 20 : 5

      case 'ORASI_ILMIAH':
        return 5

      case 'MENDUDUKI_JABATAN': {
        const map = {
          'REKTOR': 6,
          'WAKIL': 5,
          'KETUA_SEKOLAH': 4,
          'PEMBANTU_KETUA_SEKOLAH': 4,
          'DIREKTUR_AKADEMI': 4,
          'PEMBANTU_DIREKTUR': 3,
          'SEKRETARIS_JURUSAN': 3,
        }
        return map[data.namaJabatan] || 0
      }

      case 'MEMBIMBING_DOSEN':
        return data.jenisKategori === 'PEMBIMBING_PENCANGKOKAN' ? 2 : 1

      case 'DATASERING_PENCANGKOKAN':
        return data.jenisKategori === 'DATASERING' ? 5 : 4

      case 'PENGEMBANGAN_DIRI': {
        switch (data.jenisKategori) {
          case 'LEBIH_DARI_960': return 15;
          case 'ANTARA_641_960': return 9;
          case 'ANTARA_481_640': return 6;
          case 'ANTARA_161_480': return 3;
          case 'ANTARA_81_160': return 2;
          case 'ANTARA_30_80': return 1;
          case 'ANTARA_10_30': return 0.5
        }
      }

      default:
        return 0
    }
  }

  private buildWhereClause(
    filter: Record<string, any>,
    tableName: string = 'PelaksanaanPendidikan',
  ): Prisma.Sql {
    const parts: Prisma.Sql[] = [];

    // 1. kategori
    if (filter.kategori) {
      parts.push(
        Prisma.sql`"${Prisma.raw(tableName)}"."kategori" = ${filter.kategori}::"KategoriPelaksanaanPendidikan"`,
      );
    }

    // 2. jenisKategori
    if (filter.jenisKategori) {
      parts.push(
        Prisma.sql`"${Prisma.raw(tableName)}"."jenisKategori" = ${filter.jenisKategori}::"JenisKategoriPelaksanaan"`,
      );
    }

    // 3. subJenis
    if (filter.subJenis) {
      parts.push(
        Prisma.sql`"${Prisma.raw(tableName)}"."subJenis" = ${filter.subJenis}::"subJenisPelaksanaan"`,
      );
    }

    // 4. dosenId
    if (filter.dosenId) {
      parts.push(Prisma.sql`"${Prisma.raw(tableName)}"."dosenId" = ${filter.dosenId}`);
    }

    // 5. semesterId
    if (filter.semesterId) {
      parts.push(Prisma.sql`"${Prisma.raw(tableName)}"."semesterId" = ${filter.semesterId}`);
    }

    // 6. statusValidasi
    if (filter.statusValidasi) {
      parts.push(
        Prisma.sql`"${Prisma.raw(tableName)}"."statusValidasi" = ${filter.statusValidasi}::"StatusValidasi"`,
      );
    }

    // 7. createdAt / updatedAt (opsional)
    if (filter.createdAt) {
      parts.push(Prisma.sql`"${Prisma.raw(tableName)}"."createdAt" = ${filter.createdAt}`);
    }
    if (filter.updatedAt) {
      parts.push(Prisma.sql`"${Prisma.raw(tableName)}"."updatedAt" = ${filter.updatedAt}`);
    }

    return parts.length === 0 ? Prisma.empty : Prisma.join(parts, ' AND ');
  }

  private async aggregateByDosenRaw(
    dosenId: number,
    filter: Prisma.PelaksanaanPendidikanWhereInput = {},
  ) {
    const whereClause = Prisma.sql`"PelaksanaanPendidikan"."dosenId" = ${dosenId}`;
    const additional = this.buildWhereClause(filter, 'PelaksanaanPendidikan');
    const fullWhere = additional === Prisma.empty
      ? whereClause
      : Prisma.sql`${whereClause} AND ${additional}`;

    const raw = await this.prisma.$queryRaw<Array<{
      kategori: string;
      jenisKategori: string | null;
      subJenis: string | null;
      total: number;
    }>>`
    SELECT
      "kategori",
      "jenisKategori",
      "subJenis",
      SUM("nilaiPak")::float AS total
    FROM "PelaksanaanPendidikan"
    WHERE ${fullWhere}
    GROUP BY "kategori", "jenisKategori", "subJenis"
    ORDER BY "kategori", "jenisKategori", "subJenis"
  `;

    const result: any = {};

    for (const row of raw) {
      const { kategori, jenisKategori, subJenis, total } = row;

      result[kategori] ??= { total: 0 };
      result[kategori].total += total;

      if (jenisKategori) {
        result[kategori].jenis ??= {};
        result[kategori].jenis[jenisKategori] ??= { total: 0 };
        result[kategori].jenis[jenisKategori].total += total;

        if (subJenis) {
          result[kategori].jenis[jenisKategori].sub ??= {};
          result[kategori].jenis[jenisKategori].sub[subJenis] =
            (result[kategori].jenis[jenisKategori].sub[subJenis] || 0) + total;
        }
      }
    }

    return result;
  }

  async create(dosenId: number, rawData: any, file: Express.Multer.File) {
    const data = parseAndThrow(fullPelaksanaanPendidikanSchema, rawData);
    console.log(`[CREATE] Data setelah parse: ${JSON.stringify(data, null, 2)}`);
    console.log(`dosenId: ${dosenId}`);

    if (data.kategori === KategoriPelaksanaanPendidikan.PERKULIAHAN) {
      data.totalSks = data.jumlahKelas * data.sks;
    }

    let relativePath: string | undefined;

    try {
      const dosen = await this.prisma.dosen.findUniqueOrThrow({
        where: { id: dosenId },
        select: { jabatan: true },
      });

      if (!dosen.jabatan) {
        throw new BadRequestException({
          success: false,
          message: { jabatan: 'Jabatan harus diisi terlebih dahulu, mohon lengkapi biodata.' },
          data: null,
        });
      }

      relativePath = await handleUpload({
        file,
        uploadSubfolder: this.UPLOAD_PATH,
      });

      const nilaiPak = await this.getNilaiPakByKategori(data.kategori, dosenId, {
        ...data,
        jabatanFungsional: dosen.jabatan,
      });
      console.log(`Nilai PAK: ${nilaiPak}`);

      const relationKey = this.kategoriToRelationKey(data.kategori);

      const { kategori, semesterId, ...rest } = data;

      const jenisKategori = 'jenisKategori' in rest ? rest.jenisKategori : undefined;
      const subJenis = 'subJenis' in rest ? rest.subJenis : undefined;

      const kategoriFields = Object.fromEntries(
        Object.entries(rest).filter(
          ([key]) => !['jenisKategori', 'subJenis'].includes(key)
        )
      );

      return {
        success: true,
        message: 'Data berhasil ditambahkan',
        data: await this.prisma.pelaksanaanPendidikan.create({
          data: {
            dosenId,
            semesterId,
            kategori: data.kategori,
            jenisKategori,
            subJenis,
            filePath: relativePath,
            nilaiPak,
            [relationKey]: {
              create: kategoriFields,
            },
          },
          include: {
            [relationKey]: true,
          },
        }),
      };
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('UPDATE PelaksanaanPendidikan FAILED:', error);
      }

      if (relativePath) {
        await deleteFileFromDisk(relativePath);
      }
      handleCreateError(error, 'Pelaksanaan Pendidikan');
    }
  }

  async update(
    id: number,
    dosenId: number,
    rawData: any,
    roles: TypeUserRole,
    file?: Express.Multer.File,
  ) {
    const data = parseAndThrow(fullUpdatePelaksanaanSchema, rawData);
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
        const existing = await tx.pelaksanaanPendidikan.findUniqueOrThrow({
          where: { id },
        });

        if (!roles.includes(TypeUserRole.ADMIN) && existing.dosenId !== dosenId) {
          throw new ForbiddenException('Anda tidak diizinkan mengakses data ini');
        }

        if (
          data.kategori === KategoriPelaksanaanPendidikan.PERKULIAHAN &&
          data.jumlahKelas &&
          data.sks
        ) {
          data.totalSks = data.jumlahKelas * data.sks;
        }

        const dosen = await tx.dosen.findUnique({
          where: { id: dosenId },
          select: { jabatan: true },
        });

        const nilaiPak = await this.getNilaiPakByKategori(
          data.kategori,
          existing.dosenId,
          { ...data, jabatanFungsional: dosen?.jabatan },
          id,
        );

        const {
          kategori,
          semesterId,
          dosenId: _,
          jenisKategori,
          subJenis,
          ...kategoriFields
        } = data as any; // aman karena sudah divalidasi

        const relationKey = this.kategoriToRelationKey(kategori);

        const updated = await tx.pelaksanaanPendidikan.update({
          where: { id },
          data: {
            dosenId,
            semesterId,
            jenisKategori: jenisKategori ?? undefined,
            subJenis: subJenis ?? undefined,
            filePath: newFilePath ?? existing.filePath,
            nilaiPak,
            statusValidasi: StatusValidasi.PENDING,
            catatan: null,
            [relationKey]: { update: kategoriFields },
          },
          include: {
            [relationKey]: true,
          },
        });

        return { updated, existing };
      });

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
        console.error('UPDATE PelaksanaanPendidikan FAILED:', error);
      }

      if (newFilePath) {
        await deleteFileFromDisk(newFilePath);
      }

      handleUpdateError(error, 'Pelaksanaan Pendidikan');
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
    const allowedSortFields = ['createdAt', 'updatedAt', 'nilaiPak', 'kategori', 'statusValidasi', 'jenjang'];
    const sortBy = query.sortBy && allowedSortFields.includes(query.sortBy)
      ? query.sortBy
      : 'createdAt';

    const where: Prisma.PelaksanaanPendidikanWhereInput = {};

    if (finalDosenId) {
      where.dosenId = finalDosenId;
    }

    if (query.search) {
      const search = query.search.toLowerCase();
      where.OR = [
        { dosen: { nama: { contains: search, mode: 'insensitive' } } },
        { perkuliahan: { mataKuliah: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (query.status) {
      where.statusValidasi = query.status.toUpperCase() as StatusValidasi;
    }

    if (kategori) {
      if (kategori && Object.values(KategoriPelaksanaanPendidikan).includes(kategori as KategoriPelaksanaanPendidikan)) {
        where.kategori = kategori as KategoriPelaksanaanPendidikan;
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

          perkuliahan: true,
          bimbingPengujiMhs: true,
          pembinaKegiatanMhs: true,
          pengembanganProgram: true,
          bahanPengajaran: true,
          orasiIlmiah: true,
          jabatanStruktural: true,
          bimbingDosen: true,
          dataseringPencangkokan: true,
          pengembanganDiri: true,
        },
      }),
    ]);

    const removeNullData = data.map(item =>
      Object.fromEntries(
        Object.entries(item).filter(([_, value]) => value !== null)
      )
    );

    let aggregate: any = null;
    if (finalDosenId) {
      aggregate = await this.aggregateByDosenRaw(
        finalDosenId,
        where
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
      data: removeNullData,
      ...(aggregate && { aggregate }),
    };
  }

  async findOne(id: number, dosenId: number, roles: TypeUserRole | TypeUserRole[]) {
    console.log(TypeUserRole);

    try {
      const data = await this.prisma.pelaksanaanPendidikan.findUniqueOrThrow({
        where: { id },
        include: {
          dosen: { select: { id: true, nama: true } },
          semester: true,

          perkuliahan: true,
          bimbingPengujiMhs: true,
          pembinaKegiatanMhs: true,
          pengembanganProgram: true,
          bahanPengajaran: true,
          orasiIlmiah: true,
          jabatanStruktural: true,
          bimbingDosen: true,
          dataseringPencangkokan: true,
          pengembanganDiri: true,
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
      handleFindError(error, "Pelaksanaan Pendidikan");
    }
  }

  async validate(id: number, rawData: UpdateStatusValidasiDto, reviewerId: number,
  ) {
    try {
      const parsed = parseAndThrow(updateStatusValidasiSchema, rawData);
      const { statusValidasi, catatan } = parsed;

      const existing = await this.prisma.pelaksanaanPendidikan.findUnique({ where: { id } });

      if (!existing) throw new NotFoundException('Data pendidikan tidak ditemukan');

      return this.prisma.pelaksanaanPendidikan.update({
        where: { id },
        data: {
          statusValidasi: statusValidasi,
          reviewerId: reviewerId,
          catatan: statusValidasi === 'REJECTED' ? catatan : catatan || null,
        },
      });
    } catch (error) {
      handleUpdateError(error, 'Validasi data pendidikan');
    }
  }

  async delete(id: number, dosenId: number, roles: TypeUserRole | TypeUserRole[]) {
    try {
      const existing = await this.prisma.pelaksanaanPendidikan.findUniqueOrThrow({
        where: { id },
      });

      if (!roles.includes(TypeUserRole.ADMIN) && existing.dosenId !== dosenId) {
        throw new ForbiddenException('Anda tidak diizinkan mengakses data ini');
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
      console.error(error);
      handleDeleteError(error, 'Pelaksanaan Pendidikan');
    }
  }
}