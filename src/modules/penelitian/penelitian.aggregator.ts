import { Prisma, PrismaClient } from "@prisma/client";
import { AggregationNode, AggregationResult } from "./penelitian.types";

export const KATEGORI_MAPPING = {
  KARYA_ILMIAH: {
    jenis: {
      BUKU: ['BUKU_REFERENSI', 'MONOGRAF'] as const,
      BOOK_CHAPTER: ['INTERNASIONAL', 'NASIONAL'] as const,
      JURNAL: [
        'JURNAL_INTERNASIONAL_BEREPUTASI',
        'JURNAL_INTERNASIONAL_INDEKS_BEREPUTASI',
        'JURNAL_INTERNASIONAL',
        'JURNAL_INTERNASIONAL_TIDAK_TERINDEKS',
        'JURNAL_NASIONAL_DIKTI',
        'JURNAL_NASIONAL_TERAKREDITASI_P1_P2',
        'JURNAL_NASIONAL_BERBAHASA_PBB_INDEKS',
        'JURNAL_NASIONAL_TERAKREDITASI_P3_P4',
        'JURNAL_NASIONAL',
        'JURNAL_PBB_TIDAK_MEMENUHI'
      ] as const
    }
  },
  PENELITIAN_DIDEMINASI: {
    jenis: {
      PROSIDING_DIPUBLIKASIKAN: [
        'PROSIDING_INTERNASIONAL_TERINDEKS',
        'PROSIDING_INTERNASIONAL_TIDAK_TERINDEKS',
        'PROSIDING_NASIONAL_TIDAK_TERINDEKS'
      ] as const,
      SEMINAR_TANPA_PROSIDING: ['INTERNASIONAL', 'NASIONAL'] as const,
      PROSIDING_TANPA_SEMINAR: ['INTERNASIONAL', 'NASIONAL'] as const,
      KORAN_MAJALAH: [] as const 
    }
  },
  PENELITIAN_TIDAK_DIPUBLIKASI: {
    jenis: {} as const
  },
  TERJEMAHAN_BUKU: {
    jenis: {} as const
  },
  SUNTINGAN_BUKU: {
    jenis: {} as const
  },
  KARYA_BERHAKI: {
    jenis: {
      PATEN_INTERNASIONAL_INDUSTRI: [] as const,
      PATEN_INTERNASIONAL: [] as const,
      PATEN_NASIONAL_INDUSTRI: [] as const,
      PATEN_NASIONAL: [] as const,
      PATEN_SEDERHANA: [] as const,
      CIPTAAN_DESAIN_GEOGRAFIS: [] as const,
      CIPTAAN_BAHAN_PENGAJAR: [] as const
    }
  },
  KARYA_NON_HAKI: {
    jenis: {
      INTERNASIONAL: [] as const,
      NASIONAL: [] as const,
      LOKAL: [] as const
    }
  },
  SENI_NON_HAKI: {
    jenis: {
      INTERNASIONAL: [] as const,
      NASIONAL: [] as const,
      LOKAL: [] as const
    }
  }
} as const;

export class PenelitianAggregator {
  constructor(private prisma: PrismaClient) {}

  async aggregateByDosen(
    dosenId: number,
    options: {
      includeJenis?: boolean;
      includeSub?: boolean;
      includeStatus?: boolean;
      filter?: any;
    } = {}
  ): Promise<AggregationResult> {
    const { 
      includeJenis = true, 
      includeSub = true, 
      includeStatus = true, 
      filter = {} 
    } = options;

    // Build dynamic query
    const groupFields = ['"kategori"'];
    if (includeJenis) groupFields.push('"jenisKategori"');
    if (includeSub) groupFields.push('"subJenis"');

    const whereClause = this.buildWhereClause(dosenId, filter);

    const rawData = await this.prisma.$queryRaw<Array<{
      kategori: string;
      jenisKategori?: string;
      subJenis?: string;
      total: number;
      count: number;
      pending: number;
      approved: number;
      rejected: number;
    }>>`
      SELECT 
        "kategori",
        ${includeJenis ? Prisma.sql`"jenisKategori",` : Prisma.sql`NULL as "jenisKategori",`}
        ${includeSub ? Prisma.sql`"subJenis",` : Prisma.sql`NULL as "subJenis",`}
        SUM("nilaiPak")::float as total,
        COUNT(*)::int as count,
        COUNT(CASE WHEN "statusValidasi" = 'PENDING' THEN 1 END)::int as pending,
        COUNT(CASE WHEN "statusValidasi" = 'APPROVED' THEN 1 END)::int as approved,
        COUNT(CASE WHEN "statusValidasi" = 'REJECTED' THEN 1 END)::int as rejected
      FROM "Penelitian"
      WHERE ${whereClause}
      GROUP BY ${Prisma.raw(groupFields.join(', '))}
      ORDER BY "kategori"
    `;

    return this.buildStructuredResult(rawData, { includeJenis, includeSub });
  }

  private buildStructuredResult(
    rawData: any[],
    options: { includeJenis: boolean; includeSub: boolean }
  ): AggregationResult {
    const result = this.prefillStructure(options);

    for (const row of rawData) {
      const { kategori, jenisKategori, subJenis, total, count, pending, approved, rejected } = row;
      
      const nodeData: AggregationNode = {
        total,
        count,
        statusCounts: { pending, approved, rejected }
      };

      // Update kategori level
      if (result[kategori]) {
        Object.assign(result[kategori], this.mergeNodes(result[kategori], nodeData));
      }

      // Update jenis level
      if (options.includeJenis && jenisKategori && result[kategori]?.jenis?.[jenisKategori]) {
        Object.assign(
          result[kategori].jenis![jenisKategori], 
          this.mergeNodes(result[kategori].jenis![jenisKategori], nodeData)
        );

        // Update sub level
        if (options.includeSub && subJenis && result[kategori].jenis![jenisKategori].sub?.[subJenis]) {
          result[kategori].jenis![jenisKategori].sub![subJenis] = nodeData;
        }
      }
    }

    return result;
  }

  private prefillStructure(options: { includeJenis: boolean; includeSub: boolean }): AggregationResult {
    const result: AggregationResult = {};
    
    Object.entries(KATEGORI_MAPPING).forEach(([kategori, config]) => {
      result[kategori] = {
        total: 0,
        count: 0,
        statusCounts: { pending: 0, approved: 0, rejected: 0 }
      };

      if (options.includeJenis && Object.keys(config.jenis).length > 0) {
        result[kategori].jenis = {};
        
        Object.entries(config.jenis).forEach(([jenis, subList]) => {
          result[kategori].jenis![jenis] = {
            total: 0,
            count: 0,
            statusCounts: { pending: 0, approved: 0, rejected: 0 }
          };

          if (options.includeSub && subList.length > 0) {
            result[kategori].jenis![jenis].sub = {};
            
            subList.forEach(sub => {
              result[kategori].jenis![jenis].sub![sub] = {
                total: 0,
                count: 0,
                statusCounts: { pending: 0, approved: 0, rejected: 0 }
              };
            });
          }
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

  private buildWhereClause(dosenId: number, filter: any): Prisma.Sql {
    let conditions = Prisma.sql`"dosenId" = ${dosenId}`;
    
    if (filter.semesterId) {
      conditions = Prisma.sql`${conditions} AND "semesterId" = ${filter.semesterId}`;
    }
    
    if (filter.tahun) {
      conditions = Prisma.sql`${conditions} AND EXTRACT(YEAR FROM "tglTerbit") = ${filter.tahun}`;
    }
    
    if (filter.statusValidasi) {
      conditions = Prisma.sql`${conditions} AND "statusValidasi" = ${filter.statusValidasi}`;
    }
    
    return conditions;
  }

  // Additional helper methods
  async getSummary(dosenId: number, filter?: any) {
    const result = await this.aggregateByDosen(dosenId, { 
      includeJenis: false, 
      includeSub: false, 
      filter 
    });
    
    return this.calculateSummary(result);
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

  // Format API response
  formatForAPI(result: AggregationResult) {
    return {
      data: result,
      summary: this.calculateSummary(result),
      lastUpdated: new Date().toISOString()
    };
  }
}