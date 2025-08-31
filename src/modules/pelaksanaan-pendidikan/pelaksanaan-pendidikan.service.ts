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
    // const dosen = await this.prisma.dosen.findUniqueOrThrow({
    //   where: { id: dosenId },
    //   select: { jabatan: true },
    // });

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
        const { peran, jenis, jumlahMhs } = data;

        if (peran === 'PEMBIMBING_UTAMA') {
          switch (jenis) {
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
        } else if (peran === 'PEMBIMBING_PENDAMPING') {
          switch (jenis) {
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
        return data.peran === 'Ketua Penguji' ? 1 * data.jumlahMhs : 0.5 * data.jumlahMhs

      case 'MEMBINA_KEGIATAN_MHS':
        return 2

      case 'MENGEMBANGKAN_PROGRAM':
        return 2

      case 'BAHAN_PENGAJARAN':
        return data.jenisProduk === 'Buku Ajar' ? 20 : 5

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
        return data.jenisMEMBIMBING === 'PEMBIMBING_PENCANGKOKAN' ? 2 : 1

      case 'DATASERING_PENCANGKOKAN':
        return data.jenis === 'DATASERING' ? 5 : 4

      case 'PENGEMBANGAN_DIRI': {
        switch(data.lamaJam){
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

    private async aggregateByDosenRaw(
      dosenId: number,
      filter: Prisma.PelaksanaanPendidikanWhereInput = {},
      deepKategori = true,
      deepJenis = false,
      deepSub = false,
    ): Promise<any> {
      // base condition
      const baseWhere = Prisma.sql`"dosenId" = ${dosenId}`;
      const parts: Prisma.Sql[] = [baseWhere];
  
      // handle filter manual di sini
      if (filter.statusValidasi) {
        parts.push(
          Prisma.sql`"statusValidasi" = ${filter.statusValidasi}::"StatusValidasi"`
        );
      }
  
      if (filter.semesterId) {
        parts.push(
          Prisma.sql`"semesterId" = ${filter.semesterId}`
        );
      }
  
      if (filter.kategori) {
        parts.push(
          Prisma.sql`"kategori" = ${filter.kategori}::"KategoriPelaksanaanPendidikan"`
        );
      }
  
      const fullWhere = Prisma.join(parts, ' AND ');
  
      // tentukan grouping
      const groupCols: string[] = [];
      if (deepKategori) groupCols.push('"kategori"');
      if (deepJenis) groupCols.push('"jenisKategori"');
      if (deepSub) groupCols.push('"subJenis"');
  
      if (groupCols.length === 0) return {};
  
      // query raw dengan casting yang sudah benar
      const raw = await this.prisma.$queryRaw<any[]>`
      SELECT
        ${Prisma.raw(groupCols.join(', '))},
        SUM("nilaiPak")::float AS total
      FROM "Penelitian"
      WHERE ${fullWhere}
      GROUP BY ${Prisma.raw(groupCols.join(', '))}
      ORDER BY ${Prisma.raw(groupCols.join(', '))}
    `;
  
      // mapping hasil ke nested object
      const result: any = {};
      for (const row of raw) {
        let cursor = result;
  
        if (deepKategori) {
          const k = row.kategori;
          cursor[k] = cursor[k] || { total: 0 };
          cursor[k].total += row.total;
          if (deepJenis) cursor = cursor[k];
        }
  
        if (deepJenis) {
          const jk = row.jenisKategori ?? '_null';
          cursor.jenis = cursor.jenis || {};
          cursor.jenis[jk] = cursor.jenis[jk] || { total: 0 };
          cursor.jenis[jk].total += row.total;
          if (deepSub) cursor = cursor.jenis[jk];
        }
  
        if (deepSub) {
          const sj = row.subJenis ?? '_null';
          cursor.sub = cursor.sub || {};
          cursor.sub[sj] = (cursor.sub[sj] || 0) + row.total;
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

      relativePath = await handleUpload({
        file,
        uploadSubfolder: this.UPLOAD_PATH,
      });

      const nilaiPak = await this.getNilaiPakByKategori(data.kategori, dosenId, {
        ...data,
        jabatanFungsional: dosen.jabatan,
      });
      console.log(`Nilai PAK: ${nilaiPak}`);

      const { kategori, semesterId, ...kategoriFields } = data;
      const jenisKategori: JenisKategoriPelaksanaan | null =
        "jenisKategori" in data ? (data.jenisKategori as JenisKategoriPelaksanaan) : null;
      const subJenis: subJenisPelaksanaan | null =
        "subJenis" in data ? (data.subJenis as subJenisPelaksanaan) : null;
      // Kategori lain
      const relationKey = this.kategoriToRelationKey(data.kategori);

      return {
        success: true,
        message: 'Data berhasil ditambahkan',
        data: await this.prisma.pelaksanaanPendidikan.create({
          data: {
            dosenId,
            semesterId,
            kategori: data.kategori,
            jenisKategori: jenisKategori ?? undefined,
            subJenis: subJenis ?? undefined,
            filePath: relativePath,
            nilaiPak,
            [relationKey]: {
              create: kategoriFields,
            },
          },
          include: {
            [relationKey]: true,
          }
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
    file?: Express.Multer.File
  ) {
    const data = parseAndThrow(fullUpdatePelaksanaanSchema, rawData);
    console.log(`[UPDATE] Data setelah parse: ${JSON.stringify(data, null, 2)}`);

    let newFilePath: string | undefined;

    try {
      // Upload file di luar transaksi (karena file system operation)
      if (file) {
        newFilePath = await handleUpload({
          file,
          uploadSubfolder: this.UPLOAD_PATH,
        });
      }

      // Gunakan transaction untuk operasi database
      const result = await this.prisma.$transaction(async (tx) => {
        const existing = await tx.pelaksanaanPendidikan.findUniqueOrThrow({
          where: { id },
        });

        if (!roles.includes(TypeUserRole.ADMIN) && existing.dosenId !== dosenId) {
          throw new ForbiddenException('Anda tidak diizinkan mengakses data ini');
        }

        // Hitung total SKS untuk kategori PERKULIAHAN
        if (
          data.kategori === KategoriPelaksanaanPendidikan.PERKULIAHAN &&
          data.jumlahKelas &&
          data.sks
        ) {
          data.totalSks = data.jumlahKelas * data.sks;
        }

        // Hitung nilai PAK
        const dosen = await tx.dosen.findUnique({
          where: { id: dosenId },
          select: { jabatan: true },
        });
        const nilaiPak = await this.getNilaiPakByKategori(
          data.kategori,
          existing.dosenId,
          { ...data, jabatanFungsional: dosen?.jabatan },
          id
        );

        const { kategori, semesterId, ...kategoriFields } = data;
        const jenisKategori: JenisKategoriPelaksanaan | null =
          "jenisKategori" in data ? (data.jenisKategori as JenisKategoriPelaksanaan) : null;
        const subJenis: subJenisPelaksanaan | null =
          "subJenis" in data ? (data.subJenis as subJenisPelaksanaan) : null;

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
      };

    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('UPDATE PelaksanaanPendidikan FAILED:', error);
      }

      // Hapus file baru jika transaksi gagal
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

    const sortField = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';

    // Sorting
    const allowedSortFields = ['createdAt', 'updatedAt', 'nilaiPak', 'kategori', 'statusValidasi', 'jenjang'];
    const sortBy = query.sortBy && allowedSortFields.includes(query.sortBy)
      ? query.sortBy
      : 'createdAt';

    const where: Prisma.PelaksanaanPendidikanWhereInput = {};

    if (dosenId) {
      where.dosenId = dosenId;
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

    return {
      success: true,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      data: removeNullData,
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