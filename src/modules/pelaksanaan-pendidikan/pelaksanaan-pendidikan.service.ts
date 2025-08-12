import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { JenisBahanPengajaran, KategoriKegiatan, Prisma, Role, TypeUserRole } from '@prisma/client';
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

  private kategoriToRelationKey(kategori: KategoriKegiatan): string {
    const map: Record<KategoriKegiatan, string> = {
      PERKULIAHAN: 'perkuliahan',
      BIMBINGAN_SEMINAR: 'bimbinganSeminar',
      BIMBINGAN_TUGAS_AKHIR: 'bimbinganTugasAkhir',
      BIMBINGAN_KKN_PKN_PKL: 'bimbinganKknPknPkl',
      PENGUJI_UJIAN_AKHIR: 'pengujiUjianAkhir',
      PEMBINA_KEGIATAN_MHS: 'pembinaKegiatanMhs',
      PENGEMBANGAN_PROGRAM: 'pengembanganProgram',
      BAHAN_PENGAJARAN: 'bahanPengajaran',
      ORASI_ILMIAH: 'orasiIlmiah',
      JABATAN_STRUKTURAL: 'jabatanStruktural',
      BIMBING_DOSEN: 'bimbingDosen',
      DATA_SERING_PENCAKOKAN: 'dataseringPencakokan',
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

      case 'BIMBINGAN_SEMINAR':
      case 'BIMBINGAN_KKN_PKN_PKL':
        return data.jumlahMhs * 1


      case 'BIMBINGAN_TUGAS_AKHIR': {
        let nilaiPak = 0;
        const { peran, jenis, jumlahMhs } = data;

        if (peran === 'Pembimbing Utama') {
          switch (jenis) {
            case 'Disertasi':
              nilaiPak = 8 * jumlahMhs;
              break;
            case 'Tesis':
              nilaiPak = 3 * jumlahMhs;
              break;
            case 'Skripsi':
            case 'Laporan Akhir Studi':
              nilaiPak = 1 * jumlahMhs;
              break;
            default:
              nilaiPak = 0;
          }
        } else if (peran === 'Pembimbing Pendamping') {
          switch (jenis) {
            case 'Disertasi':
              nilaiPak = 6 * jumlahMhs;
              break;
            case 'Tesis':
              nilaiPak = 2 * jumlahMhs;
              break;
            case 'Skripsi':
            case 'Laporan Akhir Studi':
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

      case 'DATA_SERING_PENCAKOKAN':
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

  private async createBahanPengajaran(
    dosenId: number,
    semesterId: number,
    kategori: KategoriKegiatan,
    relativePath: string,
    nilaiPak: number,
    data: any
  ) {
    const { jenis, ...restData } = data;

    let bahanPengajaranData: any = { jenis };

    if (jenis === JenisBahanPengajaran.BUKU_AJAR) {
      const { judul, tglTerbit, penerbit, jumlahHalaman, isbn } = restData;
      bahanPengajaranData.bukuAjar = {
        create: { judul, tglTerbit, penerbit, jumlahHalaman, isbn }
      };
    } else if (jenis === JenisBahanPengajaran.PRODUK_LAIN) {
      const { jenisProduk, judul, jumlahHalaman, mataKuliah, prodiId, fakultasId } = restData;
      bahanPengajaranData.produkLain = {
        create: { jenisProduk, judul, jumlahHalaman, mataKuliah, prodiId, fakultasId }
      };
    } else {
      throw new Error(`Jenis bahan pengajaran tidak valid: ${jenis}`);
    }

    return {
      success: true,
      message: 'Data bahan pengajaran berhasil ditambahkan',
      data: await this.prisma.pelaksanaanPendidikan.create({
        data: {
          dosenId,
          semesterId,
          kategori,
          filePath: relativePath,
          nilaiPak,
          bahanPengajaran: {
            create: bahanPengajaranData
          }
        },
      }),
    };
  }

  async create(dosenId: number, rawData: any, file: Express.Multer.File) {
    const data = parseAndThrow(fullPelaksanaanPendidikanSchema, rawData);
    console.log(`[CREATE] Data setelah parse: ${JSON.stringify(data, null, 2)}`);

    if (data.kategori === KategoriKegiatan.PERKULIAHAN) {
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

      // Khusus Kategori Bahan Pengajaran
      let bahanPengajaranData;
      if (data.kategori === KategoriKegiatan.BAHAN_PENGAJARAN) {
        if (data.jenis === JenisBahanPengajaran.BUKU_AJAR) {
          const { judul, tglTerbit, penerbit, jumlahHalaman, isbn } = data;
          bahanPengajaranData = {
            jenis: data.jenis,
            bukuAjar: { create: { judul, tglTerbit, penerbit, jumlahHalaman, isbn } }
          };
        } else {
          const { jenisProduk, judul, jumlahHalaman, mataKuliah, prodiId, fakultasId } = data;
          bahanPengajaranData = {
            jenis: data.jenis,
            produkLain: { create: { jenisProduk, judul, jumlahHalaman, mataKuliah, prodiId, fakultasId } }
          };
        }

        return {
          success: true,
          message: 'Data berhasil ditambahkan',
          data: await this.prisma.pelaksanaanPendidikan.create({
            data: {
              dosenId,
              semesterId,
              kategori,
              filePath: relativePath,
              nilaiPak,
              bahanPengajaran: { create: bahanPengajaranData }
            },
          }),
        };
      }

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
            filePath: relativePath,
            nilaiPak,
            [relationKey]: {
              create: kategoriFields,
            },
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
    console.log(`[UPDATE] Data setelah parse: ${JSON.stringify(data, null, 2)}`);

    let newFilePath: string | undefined = undefined;

    try {
      const existing = await this.prisma.pelaksanaanPendidikan.findUniqueOrThrow({ where: { id } });

      if (!hasRole(role, TypeUserRole.ADMIN) && existing.dosenId !== dosenId) {
        throw new ForbiddenException('Anda tidak berhak memperbarui data ini');
      }

      if (data.kategori === KategoriKegiatan.PERKULIAHAN && data.jumlahKelas && data.sks) {
        const totalSks = data.jumlahKelas * data.sks;
        data.totalSks = totalSks;
        console.log(`Total SKS: ${totalSks}`);
      }

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
      }, id);
      console.log(`Nilai PAK: ${nilaiPak}`);

      const { kategori, semesterId, ...kategoriFields } = data;

      // Tentukan key relasi berdasar kategori
      const relationKey = this.kategoriToRelationKey(kategori);

      const updated = await this.prisma.pelaksanaanPendidikan.update({
        where: { id },
        data: {
          dosenId,
          semesterId,
          kategori,
          filePath: newFilePath ?? existing.filePath,
          nilaiPak,
          [relationKey]: {
            update: kategoriFields,
          },
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
          perkuliahan: true,
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