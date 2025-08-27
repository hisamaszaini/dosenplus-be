import { Prisma, PrismaClient } from "@prisma/client";
import { AggregationResult } from "./pelaksanaan.types";

const PELAKSANAAN_DETAIL_MAPPING = {
    PERKULIAHAN: { hasDetail: false },
    BIMBINGAN_SEMINAR: { hasDetail: false },
    BIMBINGAN_TUGAS_AKHIR: { table: 'BimbinganTugasAkhir', detailField: 'jenis', hasDetail: true },
    BIMBINGAN_KKN_PKN_PKL: { hasDetail: false },
    PENGUJI_UJIAN_AKHIR: { table: 'PengujiUjianAkhir', detailField: 'peran', hasDetail: true },
    PEMBINA_KEGIATAN_MHS: { hasDetail: false },
    PENGEMBANGAN_PROGRAM: { hasDetail: false },
    BAHAN_PENGAJARAN: { table: 'BahanPengajaran', detailField: 'jenis', hasDetail: true },
    ORASI_ILMIAH: { hasDetail: false },
    JABATAN_STRUKTURAL: { table: 'JabatanStruktural', detailField: 'namaJabatan', hasDetail: true },
    BIMBING_DOSEN: { table: 'BimbingDosen', detailField: 'bidangAhli', hasDetail: true },
    DATA_SERING_PENCAKOKAN: { table: 'DataseringPencakokan', detailField: 'jenis', hasDetail: true },
    PENGEMBANGAN_DIRI: { table: 'PengembanganDiri', detailField: 'namaKegiatan', hasDetail: true }
} as const;

export class PelaksanaanPendidikanAggregator {
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

        // --- variabel bagian conditional ---
        const selectDetail = includeDetail
            ? Prisma.sql`
        CASE 
          WHEN p."kategori" = 'BIMBINGAN_TUGAS_AKHIR' THEN bta."jenis"::text
          WHEN p."kategori" = 'PENGUJI_UJIAN_AKHIR' THEN pu."peran"::text
          WHEN p."kategori" = 'BAHAN_PENGAJARAN' THEN bp."jenis"::text
          WHEN p."kategori" = 'JABATAN_STRUKTURAL' THEN js."namaJabatan"::text
          WHEN p."kategori" = 'BIMBING_DOSEN' THEN bd."bidangAhli"::text
          WHEN p."kategori" = 'DATA_SERING_PENCAKOKAN' THEN dp."jenis"::text
          WHEN p."kategori" = 'PENGEMBANGAN_DIRI' THEN pd."namaKegiatan"::text
          ELSE NULL
        END as detail
      `
            : Prisma.sql`NULL as detail`;

        const joinDetail = includeDetail
            ? Prisma.sql`
        LEFT JOIN "BimbinganTugasAkhir" bta ON p."id" = bta."pelaksanaanId" AND p."kategori" = 'BIMBINGAN_TUGAS_AKHIR'
        LEFT JOIN "PengujiUjianAkhir" pu ON p."id" = pu."pelaksanaanId" AND p."kategori" = 'PENGUJI_UJIAN_AKHIR'
        LEFT JOIN "BahanPengajaran" bp ON p."id" = bp."pelaksanaanId" AND p."kategori" = 'BAHAN_PENGAJARAN'
        LEFT JOIN "JabatanStruktural" js ON p."id" = js."pelaksanaanId" AND p."kategori" = 'JABATAN_STRUKTURAL'
        LEFT JOIN "BimbingDosen" bd ON p."id" = bd."pelaksanaanId" AND p."kategori" = 'BIMBING_DOSEN'
        LEFT JOIN "DataseringPencakokan" dp ON p."id" = dp."pelaksanaanId" AND p."kategori" = 'DATA_SERING_PENCAKOKAN'
        LEFT JOIN "PengembanganDiri" pd ON p."id" = pd."pelaksanaanId" AND p."kategori" = 'PENGEMBANGAN_DIRI'
      `
            : Prisma.empty;

        const groupByClause = includeDetail
            ? Prisma.sql`GROUP BY "kategori", "detail"`
            : Prisma.sql`GROUP BY "kategori"`;

        // --- query utama ---
        const rawData = await this.prisma.$queryRaw<Array<{
            kategori: string;
            detail?: string;
            total: number;
            count: number;
            pending: number;
            approved: number;
            rejected: number;
        }>>`
    WITH pelaksanaan_summary AS (
      SELECT 
        p."kategori",
        p."nilaiPak",
        p."statusValidasi",
        ${selectDetail}
      FROM "PelaksanaanPendidikan" p
      ${joinDetail}
      WHERE ${whereClause}
    )
    SELECT
      "kategori",
      ${includeDetail ? Prisma.sql`"detail"` : Prisma.sql`NULL as detail`},
      SUM("nilaiPak")::float as total,
      COUNT(*)::int as count,
      COUNT(CASE WHEN "statusValidasi" = 'PENDING' THEN 1 END)::int as pending,
      COUNT(CASE WHEN "statusValidasi" = 'APPROVED' THEN 1 END)::int as approved,
      COUNT(CASE WHEN "statusValidasi" = 'REJECTED' THEN 1 END)::int as rejected
    FROM pelaksanaan_summary
    ${groupByClause}
    ORDER BY "kategori"
  `;

        return this.buildStructuredResult(rawData, includeDetail);
    }

    private buildWhereClause(dosenId: number, filter: any): Prisma.Sql {
        let conditions = Prisma.sql`"dosenId" = ${dosenId}`;

        if (filter.semesterId) {
            conditions = Prisma.sql`${conditions} AND "semesterId" = ${filter.semesterId}`;
        }

        if (filter.tahun) {
            conditions = Prisma.sql`${conditions} AND EXTRACT(YEAR FROM "createdAt") = ${filter.tahun}`;
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
        const result: AggregationResult = {};

        for (const row of rawData) {
            const { kategori, detail, total, count, pending, approved, rejected } = row;

            if (!result[kategori]) {
                result[kategori] = {
                    total: 0,
                    count: 0,
                    statusCounts: { pending: 0, approved: 0, rejected: 0 }
                };
            }

            result[kategori].total += total;
            result[kategori].count += count;
            result[kategori].statusCounts.pending += pending;
            result[kategori].statusCounts.approved += approved;
            result[kategori].statusCounts.rejected += rejected;

            if (includeDetail && detail && result[kategori]) {
                if (!result[kategori].detail) {
                    result[kategori].detail = {};
                }
                result[kategori].detail![detail] = { total, count, statusCounts: { pending, approved, rejected } };
            }
        }

        return result;
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