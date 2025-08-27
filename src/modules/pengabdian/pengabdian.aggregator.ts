import { Prisma, PrismaClient } from '@prisma/client';
import { AggregationNode, AggregationResult } from './pengabdian.types';

export const PENGABDIAN_MAPPING = {
  JABATAN_PIMPINAN_LEMBAGA_PEMERINTAHAN: {
    hasDetail: false
  },
  PENGEMBANGAN_HASIL_PENDIDIKAN_PENELITIAN: {
    hasDetail: false
  },
  PENYULUHAN_MASYARAKAT_SEMESTER: {
    hasDetail: true,
    detailType: 'tingkat',
    values: ['INTERNASIONAL', 'NASIONAL', 'LOKAL'] as const
  },
  PENYULUHAN_MASYARAKAT_KURANG_SEMESTER: {
    hasDetail: true,
    detailType: 'tingkat',
    values: ['INTERNASIONAL', 'NASIONAL', 'LOKAL', 'INSENDENTAL'] as const
  },
  PELAYANAN_MASYARAKAT: {
    hasDetail: true,
    detailType: 'jenisKegiatan',
    values: ['BIDANG_KEAHLIAN', 'PENUGASAN_PT', 'FUNGSI_JABATAN'] as const
  },
  KARYA_TIDAK_DIPUBLIKASIKAN: {
    hasDetail: false
  },
  KARYA_DIPUBLIKASIKAN: {
    hasDetail: false
  },
  PENGELOLAAN_JURNAL: {
    hasDetail: true,
    detailType: 'tingkat',
    values: ['JURNAL_INTERNASIONAL', 'JURNAL_NASIONAL'] as const
  }
} as const;

export class PengabdianAggregator {
  constructor(private prisma: PrismaClient) {}

  async aggregateByDosen(
    dosenId: number,
    options: {
      includeDetail?: boolean;
      includeStatus?: boolean;
      filter?: any;
    } = {}
  ): Promise<AggregationResult> {
    const { includeDetail = true, includeStatus = true, filter = {} } = options;

    const detailField = includeDetail 
      ? Prisma.sql`COALESCE("jenisKegiatan", "tingkat") as detail`
      : Prisma.sql`NULL as detail`;

    const rawData = await this.prisma.$queryRaw<Array<{
      kategori: string;
      detail?: string;
      total: number;
      count: number;
      pending: number;
      approved: number;
      rejected: number;
    }>>`
      SELECT 
        "kategori",
        ${detailField},
        SUM("nilaiPak")::float as total,
        COUNT(*)::int as count,
        COUNT(CASE WHEN "statusValidasi" = 'PENDING' THEN 1 END)::int as pending,
        COUNT(CASE WHEN "statusValidasi" = 'APPROVED' THEN 1 END)::int as approved,
        COUNT(CASE WHEN "statusValidasi" = 'REJECTED' THEN 1 END)::int as rejected
      FROM "Pengabdian"
      WHERE "dosenId" = ${dosenId}
      GROUP BY "kategori", ${includeDetail ? Prisma.sql`COALESCE("jenisKegiatan", "tingkat")` : Prisma.empty}
      ORDER BY "kategori"
    `;

    return this.buildStructuredResult(rawData, includeDetail);
  }

  private buildStructuredResult(
    rawData: any[],
    includeDetail: boolean
  ): AggregationResult {
    const result = this.prefillStructure();

    for (const row of rawData) {
      const { kategori, detail, total, count, pending, approved, rejected } = row;
      
      const nodeData: AggregationNode = {
        total,
        count,
        statusCounts: { pending, approved, rejected }
      };

      // Update kategori level
      if (result[kategori]) {
        Object.assign(result[kategori], this.mergeNodes(result[kategori], nodeData));
      }

      // Update detail level (jenisKegiatan OR tingkat)
      if (includeDetail && detail && result[kategori]?.detail) {
        result[kategori].detail![detail] = nodeData;
      }
    }

    return result;
  }

  private prefillStructure(): AggregationResult {
    const result: AggregationResult = {};
    
    Object.entries(PENGABDIAN_MAPPING).forEach(([kategori, config]) => {
      result[kategori] = {
        total: 0,
        count: 0,
        statusCounts: { pending: 0, approved: 0, rejected: 0 }
      };

      if (config.hasDetail) {
        result[kategori].detail = {};
        config.values.forEach(value => {
          result[kategori].detail![value] = {
            total: 0,
            count: 0,
            statusCounts: { pending: 0, approved: 0, rejected: 0 }
          };
        });
      }
    });

    return result;
  }

  private mergeNodes(existing: AggregationNode, incoming: Partial<AggregationNode>): AggregationNode {
    return {
      total: existing.total + (incoming.total || 0),
      count: existing.count + (incoming.count || 0),
      statusCounts: {
        pending: existing.statusCounts.pending + (incoming.statusCounts?.pending || 0),
        approved: existing.statusCounts.approved + (incoming.statusCounts?.approved || 0),
        rejected: existing.statusCounts.rejected + (incoming.statusCounts?.rejected || 0),
      }
    };
  }

  formatForAPI(result: AggregationResult) {
    return {
      data: result,
      summary: this.calculateSummary(result),
      lastUpdated: new Date().toISOString()
    };
  }

  calculateSummary(result: AggregationResult) {
    const summary = {
      total: 0,
      count: 0,
      statusCounts: { pending: 0, approved: 0, rejected: 0 }
    };

    Object.values(result).forEach(kategori => {
      summary.total += kategori.total;
      summary.count += kategori.count;
      summary.statusCounts.pending += kategori.statusCounts.pending;
      summary.statusCounts.approved += kategori.statusCounts.approved;
      summary.statusCounts.rejected += kategori.statusCounts.rejected;
    });

    return summary;
  }
}
