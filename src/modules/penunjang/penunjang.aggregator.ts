import { Prisma, PrismaClient } from "@prisma/client";
import { AggregationNode, AggregationResult } from "./penunjang.types";

export const PENUNJANG_MAPPING = {
  ANGGOTA_PANITIA_PT: {
    hasJenis: true,
    jenisValues: ['KETUA_WAKIL_KEPALA_ANGGOTA_TAHUNAN', 'ANGGOTA_TAHUNAN'] as const
  },
  ANGGOTA_PANITIA_LEMBAGA_PEMERINTAH: {
    hasJenis: true,
    jenisValues: [
      'KETUA_WAKIL_PANITIA_PUSAT',
      'ANGGOTA_PANITIA_PUSAT',
      'KETUA_WAKIL_PANITIA_DAERAH',
      'ANGGOTA_PANITIA_DAERAH'
    ] as const
  },
  ANGGOTA_ORGANISASI_PROFESI_INTERNASIONAL: {
    hasJenis: true,
    jenisValues: ['PENGURUS', 'ANGGOTA_ATAS_PERMINTAAN', 'ANGGOTA'] as const
  },
  ANGGOTA_ORGANISASI_PROFESI_NASIONAL: {
    hasJenis: true,
    jenisValues: ['PENGURUS', 'ANGGOTA_ATAS_PERMINTAAN', 'ANGGOTA'] as const
  },
  WAKIL_PT_PANITIA_ANTAR_LEMBAGA: {
    hasJenis: false
  },
  DELEGASI_NASIONAL_PERTEMUAN_INTERNASIONAL: {
    hasJenis: true,
    jenisValues: ['KETUA_DELEGASI', 'ANGGOTA_DELEGASI'] as const
  },
  AKTIF_PERTEMUAN_ILMIAH_INT_NAS_REG: {
    hasJenis: true,
    jenisValues: ['KETUA', 'ANGGOTA'] as const
  },
  AKTIF_PERTEMUAN_ILMIAH_INTERNAL_PT: {
    hasJenis: true,
    jenisValues: ['KETUA', 'ANGGOTA'] as const
  },
  TANDA_JASA_PENGHARGAAN: {
    hasJenis: true,
    jenisValues: [
      'SATYA_LENCANA_30_TAHUN',
      'SATYA_LENCANA_20_TAHUN',
      'SATYA_LENCANA_10_TAHUN',
      'PENGHARGAAN_INTERNASIONAL',
      'PENGHARGAAN_NASIONAL',
      'PENGHARGAAN_DAERAH'
    ] as const
  },
  MENULIS_BUKU_SLTA_NASIONAL: {
    hasJenis: true,
    jenisValues: ['BUKU_SMTA', 'BUKU_SMTP', 'BUKU_SD'] as const
  },
  PRESTASI_OLAHRAGA_HUMANIORA: {
    hasJenis: true,
    jenisValues: [
      'PIAGAM_MEDALI_INTERNASIONAL',
      'PIAGAM_MEDALI_NASIONAL',
      'PIAGAM_MEDALI_DAERAH'
    ] as const
  },
  TIM_PENILAI_JABATAN_AKADEMIK: {
    hasJenis: false
  }
} as const;

export class PenunjangAggregator {
  constructor(private prisma: PrismaClient) { }

  async aggregateByDosen(
    dosenId: number,
    options: {
      includeJenis?: boolean;
      includeStatus?: boolean;
      filter?: any;
    } = {}
  ): Promise<AggregationResult> {
    const { includeJenis = true, includeStatus = true, filter = {} } = options;

    const rawData = await this.prisma.$queryRaw<Array<{
      kategori: string;
      jenisKegiatan?: string;
      total: number;
      count: number;
      pending: number;
      approved: number;
      rejected: number;
    }>>`
      SELECT 
        "kategori",
        ${includeJenis ? Prisma.sql`"jenisKegiatan",` : Prisma.sql`NULL as "jenisKegiatan",`}
        SUM("nilaiPak")::float as total,
        COUNT(*)::int as count,
        COUNT(CASE WHEN "statusValidasi" = 'PENDING' THEN 1 END)::int as pending,
        COUNT(CASE WHEN "statusValidasi" = 'APPROVED' THEN 1 END)::int as approved,
        COUNT(CASE WHEN "statusValidasi" = 'REJECTED' THEN 1 END)::int as rejected
      FROM "Penunjang"
      WHERE "dosenId" = ${dosenId}
      GROUP BY "kategori", ${includeJenis ? Prisma.sql`"jenisKegiatan"` : Prisma.empty}
      ORDER BY "kategori"
    `;

    return this.buildStructuredResult(rawData, includeJenis);
  }

  private buildStructuredResult(
    rawData: any[],
    includeJenis: boolean
  ): AggregationResult {
    const result = this.prefillStructure(includeJenis);

    for (const row of rawData) {
      const { kategori, jenisKegiatan, total, count, pending, approved, rejected } = row;

      const nodeData = {
        total,
        count,
        statusCounts: { pending, approved, rejected }
      };

      // Update kategori level
      if (result[kategori]) {
        Object.assign(result[kategori], this.mergeNodes(result[kategori], nodeData));
      }

      // Update jenisKegiatan level
      if (includeJenis && jenisKegiatan && result[kategori]?.jenisKegiatan?.[jenisKegiatan]) {
        result[kategori].jenisKegiatan![jenisKegiatan] = nodeData;
      }
    }

    return result;
  }

  private prefillStructure(includeJenis: boolean): AggregationResult {
    const result: AggregationResult = {};

    Object.entries(PENUNJANG_MAPPING).forEach(([kategori, config]) => {
      result[kategori] = {
        total: 0,
        count: 0,
        statusCounts: { pending: 0, approved: 0, rejected: 0 }
      };

      if (includeJenis && config.hasJenis) {
        result[kategori].jenisKegiatan = {};
        config.jenisValues.forEach(jenis => {
          result[kategori].jenisKegiatan![jenis] = {
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