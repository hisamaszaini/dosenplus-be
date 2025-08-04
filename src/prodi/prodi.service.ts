import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateProdiDto, createProdiSchema, UpdateProdiDto, updateProdiSchema } from './dto/prodi.dto';
import { parseAndThrow } from 'src/common/utils/zod-helper';
import { handleCreateError, handleDeleteError, handleUpdateError } from 'src/common/utils/prisma-error-handler';

@Injectable()
export class ProdiService {
  constructor(private prisma: PrismaService) { }

  async create(rawData: CreateProdiDto) {
    const data = parseAndThrow(createProdiSchema, rawData);

    try {

      const created = await this.prisma.prodi.create({
        data: data,
      });

      return {
        success: true,
        message: 'Program studi berhasil dibuat',
        data: created,
      };
    } catch (error) {
      handleCreateError(error, 'program studi');
    }
  }

  async update(id: number, rawData: UpdateProdiDto) {
    const data = parseAndThrow(updateProdiSchema, rawData);

    try {

      const updated = await this.prisma.prodi.update({
        where: { id },
        data: data,
      });

      return {
        success: true,
        message: 'Program studi berhasil diperbarui',
        data: updated,
      };
    } catch (error) {
      handleUpdateError(error, 'program studi');
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

  async remove(id: number) {
    try {
      const deleted = await this.prisma.prodi.delete({ where: { id } });

      return {
        success: true,
        message: 'Program studi berhasil dihapus',
        data: deleted,
      };
    } catch (error) {
      handleDeleteError(error, 'program studi');
    }
  }

}