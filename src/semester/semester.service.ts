import { Prisma, NamaSemester } from '@prisma/client';
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateSemesterDto, UpdateSemesterDto } from './dto/semester.dto';

type ValidSemesterField = 'kode' | 'nama' | 'tipe' | 'tahunMulai' | 'tahunSelesai';
type StringOrInt = string | number;

@Injectable()
export class SemesterService {
  constructor(private prisma: PrismaService) { }

  private generateKodeDanNama(tipe: NamaSemester, tahunMulai: number, tahunSelesai: number) {
    const kode = Number(`${tahunMulai}${tahunSelesai}${tipe === 'GENAP' ? 1 : 0}`);
    const nama = `${tipe === 'GENAP' ? 'Genap' : 'Ganjil'} ${tahunMulai}/${tahunSelesai}`;
    return { kode, nama };
  }

  private async validateUniqueSemester(kode: number, nama: string, excludeId?: number) {
    const errors: Record<string, string> = {};

    const existing = await this.prisma.semester.findFirst({
      where: {
        OR: [{ kode }, { nama }],
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
    });
    if (existing) {
      if (existing.kode === kode && existing.id !== excludeId) {
        errors.tahunMulai = 'Semester dengan periode dan tipe ini sudah ada';
        errors.tahunSelesai = 'Semester dengan periode dan tipe ini sudah ada';
      }
      if (existing.nama === nama && existing.id !== excludeId) {
        errors.tipe = 'Semester dengan periode dan tipe ini sudah ada';
      }
    }
    return errors;
  }

  async create(createSemesterDto: CreateSemesterDto) {
    const { tipe, tahunMulai, tahunSelesai, status } = createSemesterDto;
    const { kode, nama } = this.generateKodeDanNama(tipe, tahunMulai, tahunSelesai);

    const errors = await this.validateUniqueSemester(kode, nama);
    if (Object.keys(errors).length > 0) {
      throw new BadRequestException({ message: errors });
    }

    try {
      const created = await this.prisma.semester.create({
        data: { kode, nama, tipe, tahunMulai, tahunSelesai, status },
      });

      return {
        success: true,
        message: 'Semester berhasil dibuat',
        data: created,
      };
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Gagal membuat semester');
    }
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    tahunMulai?: number;
    tahunSelesai?: number;
    tipe?: NamaSemester;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const {
      page = 1,
      limit = 10,
      search,
      tahunMulai,
      tahunSelesai,
      tipe,
      sortBy = 'kode',
      sortOrder = 'desc',
    } = params;

    const where: Prisma.SemesterWhereInput = {};

    if (search) {
      where.OR = [{ nama: { contains: search, mode: 'insensitive' } }];

      const searchAsNumber = parseInt(search, 10);
      if (!isNaN(searchAsNumber)) {
        where.OR.push({ kode: searchAsNumber });
      }
    }

    if (tipe) {
      where.tipe = tipe;
    }

    if (tahunMulai) {
      where.tahunMulai = { gte: Number(tahunMulai) };
    }

    if (tahunSelesai) {
      where.tahunSelesai = { lte: Number(tahunSelesai) };
    }

    const take = Number(limit);

    const allowedSortFields = ['kode', 'nama', 'tipe', 'tahunMulai', 'tahunSelesai', 'createdAt'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const safeSortOrder = sortOrder === 'asc' ? 'asc' : 'desc';

    try {
      const [data, total] = await this.prisma.$transaction([
        this.prisma.semester.findMany({
          where,
          orderBy: { [safeSortBy]: safeSortOrder },
          skip: (page - 1) * take,
          take: take,
        }),
        this.prisma.semester.count({ where }),
      ]);

      return {
        success: true,
        message: 'Data semester berhasil diambil',
        data,
        meta: {
          page: Number(page),
          limit: take,
          total,
          totalPages: Math.ceil(total / take),
        },
      };
    } catch (error) {
      console.error('SemesterService.findAll error:', error);
      throw new BadRequestException('Gagal mengambil data semester');
    }
  }

  async findOne(id: number) {
    const data = await this.prisma.semester.findUnique({ where: { id } });
    if (!data) {
      throw new NotFoundException('Semester tidak ditemukan');
    }

    return { success: true, data };
  }

  async findByOne(param: ValidSemesterField, value: StringOrInt) {
    const data = await this.prisma.semester.findFirst({ where: { [param]: value } });
    return { success: true, data };
  }

  async findByMany(param: ValidSemesterField, value: StringOrInt) {
    const data = await this.prisma.semester.findMany({ where: { [param]: value } });
    return { success: true, data };
  }

  async update(id: number, updateSemesterDto: UpdateSemesterDto) {
    const existing = await this.prisma.semester.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Semester tidak ditemukan');
    }

    const { tipe, tahunMulai, tahunSelesai, status } = updateSemesterDto;
    const { kode, nama } = this.generateKodeDanNama(tipe, tahunMulai, tahunSelesai);

    const errors = await this.validateUniqueSemester(kode, nama, id);
    if (Object.keys(errors).length > 0) {
      throw new BadRequestException({ message: errors });
    }

    try {
      const updated = await this.prisma.semester.update({
        where: { id },
        data: { kode, nama, tipe, tahunMulai, tahunSelesai, status },
      });

      return {
        success: true,
        message: 'Semester berhasil diperbarui',
        data: updated,
      };
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Gagal memperbarui semester');
    }
  }

  async remove(id: number) {
    const existing = await this.prisma.semester.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Semester tidak ditemukan');
    }

    try {
      const deleted = await this.prisma.semester.delete({ where: { id } });
      return {
        success: true,
        message: 'Semester berhasil dihapus',
        data: deleted,
      };
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Gagal menghapus semester');
    }
  }
}
