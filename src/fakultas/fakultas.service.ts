import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateFakultasDto, UpdateFakultasDto } from './dto/fakultas.dto';

@Injectable()
export class FakultasService {
  constructor(private prisma: PrismaService) {}

  async create(createFakultasDto: CreateFakultasDto) {
    const { kode, nama } = createFakultasDto;

    const [existingKode, existingNama] = await Promise.all([
      this.prisma.fakultas.findUnique({ where: { kode } }),
      this.prisma.fakultas.findFirst({ where: { nama } })
    ]);

    const errors: Record<string, string> = {};

    if (existingKode) {
      errors.kode = 'Kode fakultas sudah digunakan';
    }
    if (existingNama) {
      errors.nama = 'Nama fakultas sudah digunakan';
    }

    if (Object.keys(errors).length > 0) {
      throw new BadRequestException({ message: errors });
    }

    try {
      const created = await this.prisma.fakultas.create({
        data: createFakultasDto,
      });

      return {
        success: true,
        message: 'Fakultas berhasil dibuat',
        data: created,
      };
    } catch (error) {
      throw new BadRequestException('Gagal membuat fakultas');
    }
  }

  async findAll() {
    try {
      const data = await this.prisma.fakultas.findMany({
        orderBy: { createdAt: 'desc' },
      });

      return {
        success: true,
        message: 'Data fakultas berhasil diambil',
        data,
      };
    } catch (error) {
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

  async update(id: number, updateFakultasDto: UpdateFakultasDto) {
    const { kode, nama } = updateFakultasDto;

    const existingFakultas = await this.prisma.fakultas.findUnique({ where: { id } });
    if (!existingFakultas) {
      throw new NotFoundException('Fakultas tidak ditemukan');
    }

    const errors: Record<string, string> = {};
    
    const checkPromises: Promise<{ field: string; exists: boolean }>[] = [];

    if (kode && kode !== existingFakultas.kode) {
      checkPromises.push(
        this.prisma.fakultas.findUnique({ where: { kode } })
          .then(result => ({ field: 'kode', exists: !!result }))
      );
    }

    if (nama && nama !== existingFakultas.nama) {
      checkPromises.push(
        this.prisma.fakultas.findFirst({
          where: {
            nama,
            NOT: { id },
          },
        }).then(result => ({ field: 'nama', exists: !!result }))
      );
    }

    if (checkPromises.length > 0) {
      const results = await Promise.all(checkPromises);
      
      results.forEach(result => {
        if (result.exists) {
          if (result.field === 'kode') {
            errors.kode = 'Kode fakultas sudah digunakan oleh data lain';
          } else if (result.field === 'nama') {
            errors.nama = 'Nama fakultas sudah digunakan oleh data lain';
          }
        }
      });
    }

    if (Object.keys(errors).length > 0) {
      throw new BadRequestException({ message: errors });
    }

    try {
      const updated = await this.prisma.fakultas.update({
        where: { id },
        data: updateFakultasDto,
      });

      return {
        success: true,
        message: 'Fakultas berhasil diperbarui',
        data: updated,
      };
    } catch (error) {
      throw new BadRequestException('Gagal memperbarui fakultas');
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