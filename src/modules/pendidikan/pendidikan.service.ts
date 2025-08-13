import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { KategoriPendidikan, StatusValidasi, TypeUserRole } from '@prisma/client';
import { CreatePendidikanDto, fullPendidikanSchema, UpdateStatusValidasiDto, updateStatusValidasiSchema } from './dto/create-pendidikan.dto';
import { fullUpdatePendidikanSchema, UpdatePendidikanDto } from './dto/update-pendidikan.dto';
import { handleDeleteError, handleFindError, handlePrismaError, handleUpdateError } from '@/common/utils/prisma-error-handler';
import { PrismaService } from '../../../prisma/prisma.service';
import { deleteFileFromDisk, handleUpload, handleUploadAndUpdate, validateAndInjectFilePath } from '@/common/utils/dataFile';
import { parseAndThrow } from '@/common/utils/zod-helper';
import { hasAnyRole, hasRole } from '@/common/utils/hasRole';

@Injectable()
export class PendidikanService {
  private readonly UPLOAD_PATH = 'pendidikan';

  constructor(
    private readonly prisma: PrismaService,
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
    if (!file) {
      throw new BadRequestException('File pendidikan wajib diunggah');
    }

    const relativePath = await handleUpload({
      file,
      uploadSubfolder: this.UPLOAD_PATH,
    });

    const parsedData = validateAndInjectFilePath(
      fullPendidikanSchema,
      { ...rawData, dosenId },
      relativePath
    );

    const dosen = await this.prisma.dosen.findUnique({ where: { id: dosenId } });
    if (!dosen) {
      await deleteFileFromDisk(relativePath);
      throw new BadRequestException('Dosen tidak ditemukan');
    }

    try {
      const nilaiPak = await this.getNilaiPak(parsedData);

      const pendidikan = await this.prisma.pendidikan.create({
        data: {
          dosenId,
          kategori: parsedData.kategori,
          filePath: relativePath,
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
      if (process.env.NODE_ENV !== 'production') {
        console.error('ERROR SAAT SIMPAN PENDIDIKAN:', error);
      }

      await deleteFileFromDisk(relativePath);
      handlePrismaError(error);
      throw new InternalServerErrorException('Gagal menyimpan pendidikan');
    }
  }

  async update(
    id: number,
    dosenId: number,
    rawData: any,
    roles: TypeUserRole[] = [],
    file?: Express.Multer.File,
  ) {
    const parsed = fullUpdatePendidikanSchema.safeParse({ ...rawData, id, dosenId });
    if (!parsed.success) {
      throw new BadRequestException({
        success: false,
        message: parsed.error.format(),
        data: null,
      });
    }

    const data = parsed.data;

    const existing = await this.prisma.pendidikan.findUnique({
      where: { id },
      include: { Formal: true, Diklat: true },
    });

    if (!existing) throw new NotFoundException('Data pendidikan tidak ditemukan');

    if (
      !roles.includes(TypeUserRole.ADMIN) &&
      !roles.includes(TypeUserRole.VALIDATOR) &&
      existing.dosenId !== dosenId
    ) {
      throw new ForbiddenException('Anda tidak berhak mengakses data ini');
    }

    let filePath = existing.filePath;
    if (file) {
      filePath = await handleUploadAndUpdate({
        file,
        oldFilePath: existing.filePath,
        uploadSubfolder: this.UPLOAD_PATH,
      });
    }

    const nilaiPak = await this.getNilaiPak(data);

    try {
      return await this.prisma.$transaction(async (tx) => {
        const baseUpdate: any = { filePath, nilaiPak };

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
              ...(existing.Diklat && { Diklat: { delete: true } }),
            },
          });
        } else if (data.kategori === 'DIKLAT') {
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
              ...(existing.Formal && { Formal: { delete: true } }),
            },
          });
        }

        return {
          success: true,
          message: 'Pendidikan berhasil diperbarui',
        };
      });
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('ERROR SAAT UPDATE PENDIDIKAN:', error);
      }

      if (file && filePath) {
        await deleteFileFromDisk(filePath);
      }

      handlePrismaError(error);
      throw new InternalServerErrorException('Gagal memperbarui pendidikan');
    }
  }

  async findAll(
    query: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
      filterType?: string;
      filterValue?: string;
      dosenId?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
    dosenId?: number,
  ) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (dosenId) {
      where.dosenId = dosenId;
    }

    if (query.filterType && query.filterValue) {
      const { filterType, filterValue } = query;
      switch (filterType) {
        case 'kategori':
          where.kategori = filterValue;
          break;
        case 'jenjang':
          where.Formal = { jenjang: filterValue };
          break;
        default:
          break;
      }
    }

    if (query.status) {
      where.statusValidasi = query.status.toUpperCase() as StatusValidasi;
    }

    // Search
    if (query.search) {
      const search = query.search.toLowerCase();
      where.OR = [
        { Diklat: { namaDiklat: { contains: search, mode: 'insensitive' } } },
        { Diklat: { penyelenggara: { contains: search, mode: 'insensitive' } } },
        { Formal: { prodi: { contains: search, mode: 'insensitive' } } },
        { Formal: { perguruanTinggi: { contains: search, mode: 'insensitive' } } },
        { dosen: { nama: { contains: search, mode: 'insensitive' } } },
      ];
    }

    // Sorting
    const allowedSortFields = ['createdAt', 'updatedAt', 'nilaiPak', 'kategori', 'statusValidasi', 'jenjang'];
    const sortBy = query.sortBy && allowedSortFields.includes(query.sortBy)
      ? query.sortBy
      : 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';

    let orderBy: any;
    switch (sortBy) {
      case 'jenjang':
        orderBy = { Formal: { jenjang: sortOrder } };
        break;
      case 'statusValidasi':
        orderBy = { statusValidasi: sortOrder };
        break;
      case 'nilaiPak':
        orderBy = { nilaiPak: sortOrder };
        break;
      case 'kategori':
        orderBy = { kategori: sortOrder };
        break;
      case 'namaDosen':
        orderBy = { dosen: { nama: sortOrder } };
        break;
      default:
        orderBy = { [sortBy]: sortOrder };
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.pendidikan.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          Formal: true,
          Diklat: true,
          dosen: {
            select: { id: true, nama: true },
          },
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

  async findOne(id: number, dosenId: number, roles: TypeUserRole | TypeUserRole[]) {
    try {
      const pendidikan = await this.prisma.pendidikan.findUniqueOrThrow({
        where: { id },
        include: {
          Formal: true,
          Diklat: true,
          dosen: { select: { id: true, nama: true } },
        },
      });

      console.log(roles);
      
      // const roleArray = Object.values(roles);

      // if (!roleArray.includes(TypeUserRole.ADMIN) && !roleArray.includes(TypeUserRole.VALIDATOR)
      //   && pendidikan.dosenId !== dosenId) {
      //   throw new ForbiddenException('Anda tidak diizinkan mengakses data ini');
      // }

      return { success: true, data: pendidikan };
    } catch (error) {
      handleFindError(error, "Pendidikan");
    }
  }

  async validate(id: number, rawData: UpdateStatusValidasiDto, reviewerId: number,
  ) {
    try {
      const parsed = parseAndThrow(updateStatusValidasiSchema, rawData);
      const { statusValidasi, catatan } = parsed;

      const existing = await this.prisma.pendidikan.findUnique({ where: { id } });

      if (!existing) throw new NotFoundException('Data pendidikan tidak ditemukan');

      return this.prisma.pendidikan.update({
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
      const existing = await this.prisma.pendidikan.findUniqueOrThrow({ where: { id } });

      // const roleArray = Object.values(roles);

      // if (!roleArray.includes(TypeUserRole.ADMIN) && existing.dosenId !== dosenId) {
      //   throw new ForbiddenException('Anda tidak berhak mengakses data ini');
      // }

      await this.prisma.pendidikan.delete({ where: { id } });

      if (existing.filePath) {
        await deleteFileFromDisk(existing.filePath);
      }

      return { success: true, message: 'Data berhasil dihapus' };
    } catch (error) {
      handleDeleteError(error, 'Pendidikan');
    }
  }
}