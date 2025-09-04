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
  constructor(private prisma: PrismaClient) { }

  async aggregateByDosen(
    dosenId: number,
    options: {
      includeDetail?: boolean;
      includeStatus?: boolean;
      filter?: any;
    } = {}
  ): Promise<AggregationResult> {
    const { includeDetail = true, includeStatus = true, filter = {} } = options;
    const whereClause = this.buildWhereClause(dosenId, filter);

    const rawData = await this.prisma.$queryRaw<Array<{
      kategori: string;
      detail?: string;
      totalNilai: number;
      count: number;
      pending: number;
      approved: number;
      rejected: number;
    }>>`
      WITH pengabdian_data AS (
        SELECT
          "kategori",
          ${includeDetail
        ? Prisma.sql`
              CASE 
                WHEN "jenisKegiatan" IS NOT NULL THEN "jenisKegiatan"::text
                WHEN "tingkat" IS NOT NULL THEN "tingkat"::text
                ELSE NULL
              END as detail
            `
        : Prisma.sql`NULL::text as detail`
      },
          "nilaiPak",
          "statusValidasi"
        FROM "Pengabdian"
        WHERE ${whereClause}
      )
      SELECT
        "kategori",
        ${includeDetail ? Prisma.sql`"detail"` : Prisma.sql`NULL as detail`},
        SUM("nilaiPak")::float as "totalNilai",
        COUNT(*)::int as count,
        COUNT(CASE WHEN "statusValidasi" = 'PENDING' THEN 1 END)::int as pending,
        COUNT(CASE WHEN "statusValidasi" = 'APPROVED' THEN 1 END)::int as approved,
        COUNT(CASE WHEN "statusValidasi" = 'REJECTED' THEN 1 END)::int as rejected
      FROM pengabdian_data
      GROUP BY "kategori" ${includeDetail ? Prisma.sql`, "detail"` : Prisma.empty} ORDER BY "kategori"
    `;

    return this.buildStructuredResult(rawData, includeDetail);
  }

  private buildWhereClause(dosenId: number, filter: any): Prisma.Sql {
    let conditions = Prisma.sql`"dosenId" = ${dosenId}`;

    if (filter.semesterId) {
      conditions = Prisma.sql`${conditions} AND "semesterId" = ${filter.semesterId}`;
    }

    if (filter.tahun) {
      conditions = Prisma.sql`${conditions} AND EXTRACT(YEAR FROM "tglMulai") = ${filter.tahun}`;
    }

    if (filter.statusValidasi) {
      conditions = Prisma.sql`${conditions} AND "statusValidasi" = ${filter.statusValidasi}`;
    }

    return conditions;
  }

  private buildStructuredResult(
    rawData: any[],
    includeDetail: boolean
  ): AggregationResult {
    const result = this.prefillStructure(includeDetail);

    for (const row of rawData) {
      const { kategori, detail, totalNilai, count, pending, approved, rejected } = row;

      const nodeData: AggregationNode = {
        totalNilai,
        count,
        statusCounts: { pending, approved, rejected }
      };

      if (result[kategori]) {
        Object.assign(result[kategori], this.mergeNodes(result[kategori], nodeData));
      }

      if (includeDetail && detail && result[kategori]?.detail) {
        result[kategori].detail![detail] = nodeData;
      }
    }

    return result;
  }

  private prefillStructure(includeDetail: boolean): AggregationResult {
    const result: AggregationResult = {};

    Object.entries(PENGABDIAN_MAPPING).forEach(([kategori, config]) => {
      result[kategori] = {
        totalNilai: 0,
        count: 0,
        statusCounts: { pending: 0, approved: 0, rejected: 0 }
      };

      if (includeDetail && config.hasDetail) {
        result[kategori].detail = {};
        config.values.forEach(value => {
          result[kategori].detail![value] = {
            totalNilai: 0,
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
      totalNilai: existing.totalNilai + (incoming.totalNilai || 0),
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
      totalNilai: 0,
      count: 0,
      statusCounts: { pending: 0, approved: 0, rejected: 0 }
    };

    Object.values(result).forEach(kategori => {
      summary.totalNilai += kategori.totalNilai;
      summary.count += kategori.count;
      summary.statusCounts.pending += kategori.statusCounts.pending;
      summary.statusCounts.approved += kategori.statusCounts.approved;
      summary.statusCounts.rejected += kategori.statusCounts.rejected;
    });

    return summary;
  }
}