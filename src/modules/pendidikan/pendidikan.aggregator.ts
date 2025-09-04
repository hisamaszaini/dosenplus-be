import { Prisma, PrismaClient } from "@prisma/client";
import { AggregationResult, AggregationNode } from "./pendidikan.types";

export const PENDIDIKAN_MAPPING = {
    FORMAL: {
        hasDetail: true,
        detailField: 'jenjang',
        values: ['S1', 'S2', 'S3'] as const,
    },
    DIKLAT: {
        hasDetail: false,
        detailField: 'jenjang',
        values: [null] as const,
    },
} as const;

export class PendidikanAggregator {
    constructor(private prisma: PrismaClient) { }

    /* ---------- public methods ---------- */
    async aggregateGlobal(options: {
        includeDetail?: boolean;
        includeStatus?: boolean;
        filter?: any;
    } = {}): Promise<AggregationResult> {
        const { includeDetail = true, includeStatus = true, filter = {} } = options;
        const whereClause = this.buildWhereClause(undefined, filter);
        return this.executeAggregation(whereClause, includeDetail, includeStatus, false);
    }

    async aggregateByDosen(
        dosenId: number,
        options: { includeDetail?: boolean; includeStatus?: boolean; filter?: any } = {}
    ): Promise<AggregationResult> {
        const { includeDetail = true, includeStatus = true, filter = {} } = options;
        const whereClause = this.buildWhereClause(dosenId, filter);
        return this.executeAggregation(whereClause, includeDetail, includeStatus, true);
    }

    /* ---------- internal ---------- */
    private async executeAggregation(
        whereClause: Prisma.Sql,
        includeDetail: boolean,
        includeStatus: boolean,
        includeTotal: boolean
    ): Promise<AggregationResult> {
        const selectFields = [
            'p.kategori',
            includeDetail ? 'p.jenjang as detail' : 'NULL as detail',
            includeTotal ? 'COALESCE(SUM(p."nilaiPak"), 0) as "totalNilai"' : '0 as "totalNilai"',
            'COUNT(*) as count',
        ];

        if (includeStatus) {
            selectFields.push(
                'SUM(CASE WHEN p."statusValidasi" = \'PENDING\' THEN 1 ELSE 0 END) as pending',
                'SUM(CASE WHEN p."statusValidasi" = \'APPROVED\' THEN 1 ELSE 0 END) as approved',
                'SUM(CASE WHEN p."statusValidasi" = \'REJECTED\' THEN 1 ELSE 0 END) as rejected'
            );
        } else {
            selectFields.push('0 as pending', '0 as approved', '0 as rejected');
        }

        const groupByFields = ['p.kategori'];
        if (includeDetail) {
            groupByFields.push('p.jenjang');
        }

        const query = Prisma.sql`
        SELECT ${Prisma.raw(selectFields.join(', '))}
        FROM "Pendidikan" p
        WHERE ${whereClause}
        GROUP BY ${Prisma.raw(groupByFields.join(', '))}
    `;

        try {
            const rawData = await this.prisma.$queryRaw(query);
            return this.buildStructuredResult(rawData as any[], includeDetail, includeStatus, includeTotal);
        } catch (error) {
            console.error('Query execution error:', error);
            throw error;
        }
    }

    private buildWhereClause(
        dosenId?: number,
        filter: any = {}
    ): Prisma.Sql {
        const conditions: Prisma.Sql[] = [];
        if (dosenId !== undefined)
            conditions.push(Prisma.sql`"dosenId" = ${dosenId}`);
        if (filter.semesterId)
            conditions.push(Prisma.sql`"semesterId" = ${filter.semesterId}`);
        if (filter.tahun)
            conditions.push(Prisma.sql`EXTRACT(YEAR FROM "createdAt") = ${filter.tahun}`);
        if (filter.statusValidasi)
            conditions.push(Prisma.sql`"statusValidasi" = ${filter.statusValidasi}`);
        return conditions.length ? Prisma.join(conditions, ' AND ') : Prisma.sql`TRUE`;
    }

    private buildStructuredResult(
        rawData: any[],
        includeDetail: boolean,
        includeStatus: boolean,
        includeTotal: boolean
    ): AggregationResult {
        const result: AggregationResult = {};

        Object.entries(PENDIDIKAN_MAPPING).forEach(([kategori, config]) => {
            const baseNode: AggregationNode = {
                count: 0,
                statusCounts: { pending: 0, approved: 0, rejected: 0 },
                ...(includeTotal && { totalNilai: 0 }),
            };

            result[kategori] = baseNode;

            if (includeDetail && config.hasDetail) {
                const detailRecord: Record<string, AggregationNode> = {};
                config.values.forEach((value) => {
                    detailRecord[value as string] = {
                        count: 0,
                        statusCounts: { pending: 0, approved: 0, rejected: 0 },
                        ...(includeTotal && { totalNilai: 0 }),
                    };
                });
                result[kategori][config.detailField] = detailRecord;
            }
        });

        for (const row of rawData) {
            const { kategori, detail, totalNilai, count, pending, approved, rejected } = row;

            if (!result[kategori]) continue;

            if (includeTotal && result[kategori].totalNilai !== undefined) {
                result[kategori].totalNilai += Number(totalNilai);
            }
            result[kategori].count += Number(count);

            if (includeStatus && result[kategori].statusCounts) {
                result[kategori].statusCounts.pending += Number(pending);
                result[kategori].statusCounts.approved += Number(approved);
                result[kategori].statusCounts.rejected += Number(rejected);
            }

            if (includeDetail && detail !== null) {
                const detailField = PENDIDIKAN_MAPPING[kategori]?.detailField;
                const bucket = result[kategori][detailField]?.[detail];
                if (bucket) {
                    if (includeTotal && bucket.totalNilai !== undefined) {
                        bucket.totalNilai += Number(totalNilai);
                    }
                    bucket.count += Number(count);
                    if (bucket.statusCounts) {
                        bucket.statusCounts.pending += Number(pending);
                        bucket.statusCounts.approved += Number(approved);
                        bucket.statusCounts.rejected += Number(rejected);
                    }
                }
            }
        }

        return result;
    }

    /* ---------- utilities ---------- */
    formatForAPI(result: AggregationResult) {
        return {
            data: result,
            summary: this.calculateSummary(result),
            lastUpdated: new Date().toISOString(),
        };
    }

    calculateSummary(result: AggregationResult) {
        const summary = {
            count: 0,
            totalNilai: 0,
            statusCounts: { pending: 0, approved: 0, rejected: 0 },
        };

        Object.values(result).forEach((k) => {
            summary.count += k.count;
            summary.totalNilai += k.totalNilai || 0;
            summary.statusCounts.pending += k.statusCounts.pending;
            summary.statusCounts.approved += k.statusCounts.approved;
            summary.statusCounts.rejected += k.statusCounts.rejected;
        });

        return summary;
    }
}