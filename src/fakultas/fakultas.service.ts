import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateFakultasDto, createFakultasSchema, UpdateFakultasDto, updateFakultasSchema } from './dto/fakultas.dto';
import { parseAndThrow } from 'src/common/utils/zod-helper';
import { handleCreateError, handleUpdateError } from 'src/common/utils/prisma-error-handler';

@Injectable()
export class FakultasService {
  constructor(private prisma: PrismaService) { }

  async create(rawData: CreateFakultasDto) {
    const data = parseAndThrow(createFakultasSchema, rawData);

    try {
      const created = await this.prisma.fakultas.create({
        data: data,
      });

      return {
        success: true,
        message: 'Fakultas berhasil dibuat',
        data: created,
      };
    } catch (error) {
      handleCreateError(error, 'fakultas');
    }
  }

  async update(id: number, rawData: UpdateFakultasDto) {

    const data = parseAndThrow(updateFakultasSchema, rawData);

    try {
      const updated = await this.prisma.fakultas.update({
        where: { id },
        data: data,
      });

      return {
        success: true,
        message: 'Fakultas berhasil diperbarui',
        data: updated,
      };
    } catch (error) {
      handleUpdateError(error, 'fakultas');
    }
  }

  async findAll(params: {
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const {
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = params;

    const allowedSortFields = ['kode', 'nama', 'createdAt'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const safeSortOrder: 'asc' | 'desc' = sortOrder === 'asc' ? 'asc' : 'desc';

    try {
      const data = await this.prisma.fakultas.findMany({
        where: search
          ? {
            OR: [
              { nama: { contains: search, mode: 'insensitive' } },
              { kode: { contains: search, mode: 'insensitive' } },
            ],
          }
          : undefined,
        orderBy: {
          [safeSortBy]: safeSortOrder,
        },
      });

      return {
        success: true,
        message: 'Data fakultas berhasil diambil',
        data,
      };
    } catch (error) {
      console.error('FakultasService.findAll error:', error);
      throw new BadRequestException('Gagal mengambil data fakultas');
    }
  }

  async findOne(id: number) {
    try {
      const data = await this.prisma.fakultas.findUnique({ where: { id } });

      if (!data) {
        throw new NotFoundException('Fakultas tidak ditemukan');
      }

      return {
        success: true,
        message: 'Data fakultas ditemukan',
        data,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Gagal mengambil data fakultas');
    }
  }

  async remove(id: number) {
    const existing = await this.prisma.fakultas.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Fakultas tidak ditemukan');
    }

    try {
      const isUsed = await this.checkFakultasUsage(id);
      if (isUsed) {
        throw new BadRequestException('Fakultas tidak dapat dihapus karena masih digunakan');
      }

      const deleted = await this.prisma.fakultas.delete({ where: { id } });

      return {
        success: true,
        message: 'Fakultas berhasil dihapus',
        data: deleted,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Gagal menghapus fakultas');
    }
  }

  private async checkFakultasUsage(fakultasId: number): Promise<boolean> {
    const prodiCount = await this.prisma.prodi.count({
      where: { fakultasId }
    });
    return prodiCount > 0;

    return false;
  }

  async validateFakultasExists(id: number): Promise<boolean> {
    const count = await this.prisma.fakultas.count({ where: { id } });
    return count > 0;
  }

  async createMany(createFakultasDtos: CreateFakultasDto[]) {
    const kodes = createFakultasDtos.map(dto => dto.kode);
    const namas = createFakultasDtos.map(dto => dto.nama);

    const existingData = await this.prisma.fakultas.findMany({
      where: {
        OR: [
          { kode: { in: kodes } },
          { nama: { in: namas } }
        ]
      }
    });

    if (existingData.length > 0) {
      const errors: string[] = [];
      existingData.forEach(existing => {
        if (kodes.includes(existing.kode)) {
          errors.push(`Kode '${existing.kode}' sudah digunakan`);
        }
        if (namas.includes(existing.nama)) {
          errors.push(`Nama '${existing.nama}' sudah digunakan`);
        }
      });
      throw new BadRequestException(errors.join(', '));
    }

    try {
      const created = await this.prisma.fakultas.createMany({
        data: createFakultasDtos,
      });

      return {
        success: true,
        message: `${created.count} fakultas berhasil dibuat`,
        data: { count: created.count },
      };
    } catch (error) {
      throw new BadRequestException('Gagal membuat fakultas secara bulk');
    }
  }
}