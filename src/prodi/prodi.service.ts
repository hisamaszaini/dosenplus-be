import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateProdiDto, UpdateProdiDto } from './dto/prodi.dto';

@Injectable()
export class ProdiService {
  constructor(private prisma: PrismaService) { }

  async create(createProdiDto: CreateProdiDto) {
    const { kode, nama } = createProdiDto;

    const existing = await this.prisma.prodi.findFirst({
      where: {
        OR: [{ kode }, { nama }],
      },
    });

    const errors: Record<string, string> = {};

    if (existing) {
      if (existing.kode === kode) {
        errors.kode = 'Kode prodi sudah digunakan';
      }
      if (existing.nama === nama) {
        errors.nama = 'Nama prodi sudah digunakan';
      }
    }

    if (Object.keys(errors).length > 0) {
      throw new BadRequestException({ message: errors });
    }

    try {

      const created = await this.prisma.prodi.create({
        data: createProdiDto,
      });

      return {
        success: true,
        message: 'Program studi berhasil dibuat',
        data: created,
      };
    } catch (error) {
      throw new BadRequestException('Gagal membuat prodi');
    }
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    fakultasId?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const {
      page = 1,
      limit = 10,
      search,
      fakultasId,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = params;

    const fakultasIdNum = fakultasId !== undefined ? Number(fakultasId) : undefined;

    const take = Number(limit) || 20;

    const allowedSortFields = ['kode', 'nama', 'fakultasId', 'createdAt'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const safeSortOrder: 'asc' | 'desc' = sortOrder === 'asc' ? 'asc' : 'desc';

    const where: any = {};

    if (search) {
      where.OR = [
        { nama: { contains: search, mode: 'insensitive' } },
        { kode: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (fakultasIdNum !== undefined) {
      where.fakultasId = fakultasIdNum;
    }

    try {
      const [data, total] = await this.prisma.$transaction([
        this.prisma.prodi.findMany({
          where,
          orderBy: { [safeSortBy]: safeSortOrder },
          skip: (page - 1) * take,
          take: take,
          include: { fakultas: true },
        }),
        this.prisma.prodi.count({ where }),
      ]);

      return {
        success: true,
        message: 'Data program studi berhasil diambil',
        data,
        meta: {
          page,
          limit: take,
          total,
          totalPages: Math.ceil(total / take),
        },
      };
    } catch (error) {
      console.error('ProdiService.findAll error:', error);
      throw new BadRequestException('Gagal mengambil data program studi');
    }
  }

  async findOne(id: number) {
    const data = await this.prisma.prodi.findUnique({ where: { id }, include: { fakultas: true } });

    if (!data) {
      throw new NotFoundException('Program studi tidak ditemukan');
    }

    return {
      success: true,
      data,
    };
  }

  async update(id: number, updateProdiDto: UpdateProdiDto) {
    const { kode, nama } = updateProdiDto;

    const existing = await this.prisma.prodi.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Program studi tidak ditemukan');
    }

    const errors: Record<string, string> = {};

    if (kode) {
      const existingKode = await this.prisma.prodi.findUnique({ where: { kode } });
      if (existingKode && existingKode.id !== id) {
        errors.kode = 'Kode prodi sudah digunakan oleh data lain';
      }
    }

    if (nama) {
      const existingNama = await this.prisma.prodi.findFirst({
        where: {
          nama,
          NOT: { id },
        },
      });
      if (existingNama) {
        errors.nama = 'Nama prodi sudah digunakan oleh data lain';
      }
    }

    if (Object.keys(errors).length > 0) {
      throw new BadRequestException({ message: errors });
    }

    try {

      const updated = await this.prisma.prodi.update({
        where: { id },
        data: updateProdiDto,
      });

      return {
        success: true,
        message: 'Program studi berhasil diperbarui',
        data: updated,
      };
    } catch (error) {
      throw new BadRequestException('Gagal memperbarui prodi');
    }
  }

  async remove(id: number) {
    const data = await this.prisma.prodi.findUnique({ where: { id }, include: { fakultas: true } });

    if (!data) {
      throw new NotFoundException('Program studi tidak ditemukan');
    }

    const deleted = await this.prisma.prodi.delete({ where: { id } });

    return {
      success: true,
      message: 'Program studi berhasil dihapus',
      data: deleted,
    };
  }
}