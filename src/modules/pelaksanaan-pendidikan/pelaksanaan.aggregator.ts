import { Prisma, PrismaClient } from "@prisma/client";
import { AggregationResult, AggregationNode } from "./pelaksanaan.types";

export class PelaksanaanPendidikanAggregator {
    constructor(private prisma: PrismaClient) { }

    /* ---------- public ---------- */
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
        const detailField = includeDetail
            ? Prisma.sql`
      CASE 
        WHEN p.kategori = 'MEMBIMBING_TUGAS_AKHIR' THEN p."subJenis"::TEXT
        ELSE p."jenisKategori"::TEXT
      END AS detail,
      CASE 
        WHEN p.kategori = 'MEMBIMBING_TUGAS_AKHIR' THEN p."jenisKategori"::TEXT
        ELSE NULL
      END AS detail2`
            : Prisma.sql`NULL::TEXT AS detail, NULL::TEXT AS detail2`;

        const statusFields = includeStatus
            ? Prisma.sql`
          SUM(CASE WHEN p."statusValidasi" = 'PENDING' THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN p."statusValidasi" = 'APPROVED' THEN 1 ELSE 0 END) as approved,
          SUM(CASE WHEN p."statusValidasi" = 'REJECTED' THEN 1 ELSE 0 END) as rejected`
            : Prisma.sql`0 as pending, 0 as approved, 0 as rejected`;

        const query = Prisma.sql`
      SELECT
        p.kategori,
        ${detailField},
        ${includeTotal ? Prisma.sql`COALESCE(SUM(p."nilaiPak"), 0) as "totalNilai"` : Prisma.sql`0 as "totalNilai"`},
        COUNT(*) as count,
        ${statusFields}
      FROM "PelaksanaanPendidikan" p
      WHERE ${whereClause}
      GROUP BY p.kategori, detail, detail2
    `;

        const rawData = (await this.prisma.$queryRaw(query)) as any[];
        return this.buildStructuredResult(rawData, includeDetail, includeStatus, includeTotal);
    }

    private buildWhereClause(
        dosenId?: number,
        filter: any = {}
    ): Prisma.Sql {
        const conditions: Prisma.Sql[] = [];

        if (dosenId !== undefined) conditions.push(Prisma.sql`"dosenId" = ${dosenId}`);
        if (filter.semesterId) conditions.push(Prisma.sql`"semesterId" = ${filter.semesterId}`);
        if (filter.tahun) conditions.push(Prisma.sql`EXTRACT(YEAR FROM "createdAt") = ${filter.tahun}`);
        if (filter.statusValidasi) conditions.push(Prisma.sql`"statusValidasi" = ${filter.statusValidasi}`);
        if (filter.kategori) conditions.push(Prisma.sql`kategori = ${filter.kategori}`);
        if (filter.prodiId) conditions.push(Prisma.sql`"prodiId" = ${filter.prodiId}`);
        if (filter.fakultasId) conditions.push(Prisma.sql`"fakultasId" = ${filter.fakultasId}`);

        return conditions.length ? Prisma.join(conditions, ' AND ') : Prisma.sql`TRUE`;
    }

    private buildStructuredResult(
        rawData: any[],
        includeDetail: boolean,
        includeStatus: boolean,
        includeTotal: boolean
    ): AggregationResult {
        const result: AggregationResult = {};

        // Inisialisasi semua kategori
        const kategoriList = [
            'PERKULIAHAN',
            'MEMBIMBING_SEMINAR',
            'MEMBIMBING_KKN_PKN_PKL',
            'MEMBIMBING_TUGAS_AKHIR',
            'PENGUJI_UJIAN_AKHIR',
            'MEMBINA_KEGIATAN_MHS',
            'MENGEMBANGKAN_PROGRAM',
            'BAHAN_PENGAJARAN',
            'ORASI_ILMIAH',
            'MENDUDUKI_JABATAN',
            'MEMBIMBING_DOSEN',
            'DATASERING_PENCANGKOKAN',
            'PENGEMBANGAN_DIRI'
        ];

        kategoriList.forEach(kat => {
            result[kat] = {
                count: 0,
                statusCounts: { pending: 0, approved: 0, rejected: 0 },
                ...(includeTotal && { totalNilai: 0 }),
                ...(includeDetail && { detail: {} })
            };
        });

        // Proses data
        for (const row of rawData) {
            const { kategori, detail, detail2, totalNilai, count, pending, approved, rejected } = row;

            if (!result[kategori]) continue;

            const nilai = Number(totalNilai);
            const cnt = Number(count);
            const pend = Number(pending);
            const appr = Number(approved);
            const rej = Number(rejected);

            result[kategori].count += cnt;
            result[kategori].statusCounts.pending += pend;
            result[kategori].statusCounts.approved += appr;
            result[kategori].statusCounts.rejected += rej;
            if (includeTotal && result[kategori].totalNilai !== undefined) {
                result[kategori].totalNilai += nilai;
            }

            if (includeDetail && detail !== null) {
                const detailMap = result[kategori].detail as Record<string, any>;

                if (kategori === 'MEMBIMBING_TUGAS_AKHIR') {
                    // detail = subJenis, detail2 = jenisKategori
                    if (!detailMap[detail]) detailMap[detail] = {};
                    const subMap = detailMap[detail];

                    if (!subMap[detail2]) {
                        subMap[detail2] = {
                            count: 0,
                            statusCounts: { pending: 0, approved: 0, rejected: 0 },
                            ...(includeTotal && { totalNilai: 0 })
                        };
                    }

                    const node = subMap[detail2];
                    node.count += cnt;
                    node.statusCounts.pending += pend;
                    node.statusCounts.approved += appr;
                    node.statusCounts.rejected += rej;
                    if (includeTotal && node.totalNilai !== undefined) {
                        node.totalNilai += nilai;
                    }
                } else {
                    // detail = jenisKategori
                    if (!detailMap[detail]) {
                        detailMap[detail] = {
                            count: 0,
                            statusCounts: { pending: 0, approved: 0, rejected: 0 },
                            ...(includeTotal && { totalNilai: 0 })
                        };
                    }

                    const node = detailMap[detail];
                    node.count += cnt;
                    node.statusCounts.pending += pend;
                    node.statusCounts.approved += appr;
                    node.statusCounts.rejected += rej;
                    if (includeTotal && node.totalNilai !== undefined) {
                        node.totalNilai += nilai;
                    }
                }
            }
        }

        return result;
    }

    /* ---------- utilities ---------- */
    formatForAPI(result: AggregationResult): any {
        return {
            data: result,
            summary: this.calculateSummary(result),
            lastUpdated: new Date().toISOString(),
        };
    }

    calculateSummary(result: AggregationResult): any {
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

            // Include detail counts
            if (k.detail) {
                Object.values(k.detail).forEach((d) => {
                    if (typeof d.count === 'number') {
                        // Level 2: non-tugas akhir
                        summary.count += d.count;
                        summary.totalNilai += d.totalNilai || 0;
                        summary.statusCounts.pending += d.statusCounts.pending;
                        summary.statusCounts.approved += d.statusCounts.approved;
                        summary.statusCounts.rejected += d.statusCounts.rejected;
                    } else {
                        // Level 3: tugas akhir (subJenis → jenisKategori)
                        Object.values(d).forEach((jd: any) => {
                            summary.count += jd.count;
                            summary.totalNilai += jd.totalNilai || 0;
                            summary.statusCounts.pending += jd.statusCounts.pending;
                            summary.statusCounts.approved += jd.statusCounts.approved;
                            summary.statusCounts.rejected += jd.statusCounts.rejected;
                        });
                    }
                });
            }
        });

        return summary;
    }
}