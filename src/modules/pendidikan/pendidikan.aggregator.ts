import { Prisma, PrismaClient } from "@prisma/client";
import { AggregationNode, AggregationResult } from "./pendidikan.types";

export const PENDIDIKAN_MAPPING = {
    FORMAL: {
        hasDetail: true,
        detailField: 'jenjang',
        values: ['S1', 'S2', 'S3'] as const
    },
    DIKLAT: {
        hasDetail: false,
        detailField: 'jenis',
        values: [null] as const
    }
} as const;

export class PendidikanAggregator {
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
            total: number;
            count: number;
            pending: number;
            approved: number;
            rejected: number;
        }>>`
      WITH pendidikan_summary AS (
        SELECT 
          p."kategori",
          p."nilaiPak",
          p."statusValidasi",
          ${includeDetail
                ? Prisma.sql`
              CASE 
                WHEN p."kategori" = 'FORMAL' THEN pf."jenjang"
                WHEN p."kategori" = 'DIKLAT' THEN pd."jenisDiklat"
                ELSE NULL
              END as detail
            `
                : Prisma.sql`NULL as detail`
            }
        FROM "Pendidikan" p
        ${includeDetail
                ? Prisma.sql`
            LEFT JOIN "PendidikanFormal" pf ON p."id" = pf."pendidikanId" AND p."kategori" = 'FORMAL'
            LEFT JOIN "PendidikanDiklat" pd ON p."id" = pd."pendidikanId" AND p."kategori" = 'DIKLAT'
          `
                : Prisma.empty
            }
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
      FROM pendidikan_summary
      GROUP BY "kategori", ${includeDetail ? Prisma.sql`"detail"` : Prisma.empty}
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

        Object.entries(PENDIDIKAN_MAPPING).forEach(([kategori, config]) => {
            result[kategori] = {
                total: 0,
                count: 0,
                statusCounts: { pending: 0, approved: 0, rejected: 0 }
            };

            if (includeDetail && config.hasDetail) {
                result[kategori][config.detailField] = {};
                config.values.forEach(value => {
                    result[kategori][config.detailField]![value] = {
                        total: 0,
                        count: 0,
                        statusCounts: { pending: 0, approved: 0, rejected: 0 }
                    };
                });
            }
        });

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

            if (includeDetail && detail) {
                const detailField = kategori === 'FORMAL' ? 'jenjang' : 'jenis';

                if (!result[kategori][detailField]) {
                    result[kategori][detailField] = {};
                }

                if (!result[kategori][detailField]![detail]) {
                    result[kategori][detailField]![detail] = {
                        total: 0,
                        count: 0,
                        statusCounts: { pending: 0, approved: 0, rejected: 0 }
                    };
                }

                result[kategori][detailField]![detail].total += total;
                result[kategori][detailField]![detail].count += count;
                result[kategori][detailField]![detail].statusCounts.pending += pending;
                result[kategori][detailField]![detail].statusCounts.approved += approved;
                result[kategori][detailField]![detail].statusCounts.rejected += rejected;
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