/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from '@nestjs/common';
import { JenisKategoriPenelitian, JenisKegiatanPengabdian, JenisKegiatanPenunjang, KategoriPenelitian, KategoriPengabdian, KategoriPenunjang, Prisma, PrismaClient, SubJenisPenelitian, TingkatPengabdian, TypeUserRole } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { buildWhereClause } from '@/common/utils/buildWhere';

type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

type EnumValues = readonly string[];

@Injectable()
export class KesimpulanService {
    constructor(private readonly prisma: PrismaService) {
    }

    async aggregatePenelitianByDosen(
        prisma: PrismaClient,
        dosenId: number,
        filter: Prisma.PenelitianWhereInput = {},
        deepKategori = true,
        deepJenis = false,
        deepSub = false,
        includeStatus = true,
    ) {
        const additional = buildWhereClause(filter, 'Penelitian');
        const fullWhere =
            additional === Prisma.empty
                ? Prisma.sql`"dosenId" = ${dosenId}`
                : Prisma.sql`"dosenId" = ${dosenId} AND ${additional}`;

        const groupCols: string[] = [];
        if (deepKategori) groupCols.push('"kategori"');
        if (deepJenis) groupCols.push('"jenisKategori"');
        if (deepSub) groupCols.push('"subJenis"');
        if (groupCols.length === 0) return {};

        const raw = await prisma.$queryRaw<any[]>`
    SELECT ${Prisma.raw(groupCols.join(', '))},
           SUM("nilaiPak")::float AS total
           ${includeStatus
                ? Prisma.raw(`, COUNT(CASE WHEN "statusValidasi" = 'PENDING' THEN 1 END)::int AS pending,
                            COUNT(CASE WHEN "statusValidasi" = 'APPROVED' THEN 1 END)::int AS approved,
                            COUNT(CASE WHEN "statusValidasi" = 'REJECTED' THEN 1 END)::int AS rejected`)
                : Prisma.empty}
    FROM "Penelitian"
    WHERE ${fullWhere}
    GROUP BY ${Prisma.raw(groupCols.join(', '))}
    ORDER BY ${Prisma.raw(groupCols.join(', '))}
  `;

        const result = this.prefillEnum(
            Object.values(KategoriPenelitian),
            {
                jenis: deepJenis ? Object.values(JenisKategoriPenelitian) : undefined,
                sub: deepSub ? Object.values(SubJenisPenelitian) : undefined,
            },
            includeStatus,
        );

        for (const row of raw) {
            const k = row.kategori as KategoriPenelitian;
            result[k].total += row.total || 0;
            if (includeStatus) {
                result[k].statusCounts.pending += row.pending || 0;
                result[k].statusCounts.approved += row.approved || 0;
                result[k].statusCounts.rejected += row.rejected || 0;
            }

            if (deepJenis && row.jenisKategori) {
                const j = row.jenisKategori as JenisKategoriPenelitian;
                result[k].jenis[j].total += row.total || 0;
                if (includeStatus) {
                    result[k].jenis[j].statusCounts.pending += row.pending || 0;
                    result[k].jenis[j].statusCounts.approved += row.approved || 0;
                    result[k].jenis[j].statusCounts.rejected += row.rejected || 0;
                }

                if (deepSub && row.subJenis) {
                    const s = row.subJenis as SubJenisPenelitian;
                    result[k].jenis[j].sub[s].total += row.total || 0;
                    if (includeStatus) {
                        result[k].jenis[j].sub[s].statusCounts.pending += row.pending || 0;
                        result[k].jenis[j].sub[s].statusCounts.approved += row.approved || 0;
                        result[k].jenis[j].sub[s].statusCounts.rejected += row.rejected || 0;
                    }
                }
            }
        }

        return result;
    }

    async aggregatePengabdianByDosen(
        prisma: PrismaClient,
        dosenId: number,
        filter: Prisma.PengabdianWhereInput = {},
        deepKategori = true,
        deepJenis = false,
        deepTingkat = false,
        includeStatus = false,
    ): Promise<any> {
        const additional = buildWhereClause(filter, 'Pengabdian');
        const fullWhere =
            additional === Prisma.empty
                ? Prisma.sql`"dosenId" = ${dosenId}`
                : Prisma.sql`"dosenId" = ${dosenId} AND ${additional}`;

        const groupCols: string[] = [];
        if (deepKategori) groupCols.push('"kategori"');
        if (deepJenis) groupCols.push('"jenisKegiatan"');
        if (deepTingkat) groupCols.push('"tingkat"');

        if (groupCols.length === 0) return {};

        const raw = await prisma.$queryRaw<any[]>`
    SELECT
      ${Prisma.raw(groupCols.join(', '))},
      SUM("nilaiPak")::float AS total
      ${includeStatus
                ? Prisma.raw(`, COUNT(CASE WHEN "statusValidasi" = 'PENDING' THEN 1 END)::int AS pending,
                       COUNT(CASE WHEN "statusValidasi" = 'APPROVED' THEN 1 END)::int AS approved,
                       COUNT(CASE WHEN "statusValidasi" = 'REJECTED' THEN 1 END)::int AS rejected`)
                : Prisma.empty}
    FROM "Pengabdian"
    WHERE ${fullWhere}
    GROUP BY ${Prisma.raw(groupCols.join(', '))}
    ORDER BY ${Prisma.raw(groupCols.join(', '))}
  `;

        const result: any = {};

        if (deepKategori) {
            for (const k of Object.values(KategoriPengabdian)) {
                result[k] = { total: 0 };
                if (includeStatus) {
                    result[k].statusCounts = { pending: 0, approved: 0, rejected: 0 };
                }

                if (deepJenis) {
                    result[k].jenis = {};
                    for (const j of Object.values(JenisKegiatanPengabdian)) {
                        result[k].jenis[j] = {
                            total: 0,
                            ...(includeStatus && {
                                statusCounts: { pending: 0, approved: 0, rejected: 0 },
                            }),
                        };
                    }
                }

                if (deepTingkat) {
                    result[k].tingkat = {};
                    for (const t of Object.values(TingkatPengabdian)) {
                        result[k].tingkat[t] = {
                            total: 0,
                            ...(includeStatus && {
                                statusCounts: { pending: 0, approved: 0, rejected: 0 },
                            }),
                        };
                    }
                }
            }
        }

        for (const row of raw) {
            const k = row.kategori;
            if (!result[k]) continue;

            result[k].total += row.total;
            if (includeStatus) {
                result[k].statusCounts.pending += row.pending || 0;
                result[k].statusCounts.approved += row.approved || 0;
                result[k].statusCounts.rejected += row.rejected || 0;
            }

            if (deepJenis && row.jenisKegiatan) {
                const j = row.jenisKegiatan;
                if (result[k].jenis[j]) {
                    result[k].jenis[j].total += row.total;
                    if (includeStatus) {
                        result[k].jenis[j].statusCounts.pending += row.pending || 0;
                        result[k].jenis[j].statusCounts.approved += row.approved || 0;
                        result[k].jenis[j].statusCounts.rejected += row.rejected || 0;
                    }
                }
            }

            if (deepTingkat && row.tingkat) {
                const t = row.tingkat;
                if (result[k].tingkat[t]) {
                    result[k].tingkat[t].total += row.total;
                    if (includeStatus) {
                        result[k].tingkat[t].statusCounts.pending += row.pending || 0;
                        result[k].tingkat[t].statusCounts.approved += row.approved || 0;
                        result[k].tingkat[t].statusCounts.rejected += row.rejected || 0;
                    }
                }
            }
        }

        return result;
    }

    async aggregatePenunjangByDosen(
        prisma: PrismaClient,
        dosenId: number,
        filter: Prisma.PenunjangWhereInput = {},
        deepKategori = true,
        deepJenis = false,
        includeStatus = false,
    ): Promise<any> {
        const additional = buildWhereClause(filter, 'Penunjang');
        const fullWhere =
            additional === Prisma.empty
                ? Prisma.sql`"dosenId" = ${dosenId}`
                : Prisma.sql`"dosenId" = ${dosenId} AND ${additional}`;

        const groupCols: string[] = [];
        if (deepKategori) groupCols.push('"kategori"');
        if (deepJenis) groupCols.push('"jenisKegiatan"');

        if (groupCols.length === 0) return {};

        const raw = await prisma.$queryRaw<any[]>`
    SELECT
      ${Prisma.raw(groupCols.join(', '))},
      SUM("nilaiPak")::float AS total
      ${includeStatus
                ? Prisma.raw(`, COUNT(CASE WHEN "statusValidasi" = 'PENDING' THEN 1 END)::int AS pending,
                       COUNT(CASE WHEN "statusValidasi" = 'APPROVED' THEN 1 END)::int AS approved,
                       COUNT(CASE WHEN "statusValidasi" = 'REJECTED' THEN 1 END)::int AS rejected`)
                : Prisma.empty}
    FROM "Penunjang"
    WHERE ${fullWhere}
    GROUP BY ${Prisma.raw(groupCols.join(', '))}
    ORDER BY ${Prisma.raw(groupCols.join(', '))}
  `;

        const result: any = {};

        if (deepKategori) {
            for (const k of Object.values(KategoriPenunjang)) {
                result[k] = { total: 0 };
                if (includeStatus) {
                    result[k].statusCounts = { pending: 0, approved: 0, rejected: 0 };
                }

                if (deepJenis) {
                    result[k].jenis = {};
                    for (const j of Object.values(JenisKegiatanPenunjang)) {
                        result[k].jenis[j] = {
                            total: 0,
                            ...(includeStatus && {
                                statusCounts: { pending: 0, approved: 0, rejected: 0 },
                            }),
                        };
                    }
                }
            }
        }

        for (const row of raw) {
            const k = row.kategori;
            if (!result[k]) continue;

            result[k].total += row.total;
            if (includeStatus) {
                result[k].statusCounts.pending += row.pending || 0;
                result[k].statusCounts.approved += row.approved || 0;
                result[k].statusCounts.rejected += row.rejected || 0;
            }

            if (deepJenis && row.jenisKegiatan) {
                const j = row.jenisKegiatan;
                if (result[k].jenis[j]) {
                    result[k].jenis[j].total += row.total;
                    if (includeStatus) {
                        result[k].jenis[j].statusCounts.pending += row.pending || 0;
                        result[k].jenis[j].statusCounts.approved += row.approved || 0;
                        result[k].jenis[j].statusCounts.rejected += row.rejected || 0;
                    }
                }
            }
        }

        return result;
    }

    async findById(dosenId: number, roles: TypeUserRole | TypeUserRole[]) {
        try {
            const data = await this.prisma.dosen.findUniqueOrThrow({
                where: { id: dosenId },
            });

            const [dataPenelitian, dataPengabdian, dataPenunjang] = await Promise.all([
                this.aggregatePenelitianByDosen(
                    this.prisma,
                    dosenId,
                    {},
                    true,
                    true,
                    true,
                    true
                ),
                this.aggregatePengabdianByDosen(
                    this.prisma,
                    dosenId,
                    {},
                    true,
                    true,
                    true,
                    true
                ),
                this.aggregatePenunjangByDosen(
                    this.prisma,
                    dosenId,
                    {},
                    true,
                    true,
                    true
                ),
            ]);

            return {
                dosen: data,
                penelitian: dataPenelitian,
                pengabdian: dataPengabdian,
                penunjang: dataPenunjang,
            };
        } catch (error) {
            throw error;
        }
    }


    prefillEnum<T extends EnumValues>(
        keys: T,
        deepKeys?: { jenis?: EnumValues; sub?: EnumValues; tingkat?: EnumValues },
        includeStatus = false,
    ): Record<string, any> {
        const res: Record<string, any> = {};
        for (const k of keys) {
            res[k] = { total: 0 };
            if (includeStatus) res[k].statusCounts = { pending: 0, approved: 0, rejected: 0 };

            if (deepKeys?.jenis) {
                res[k].jenis = {};
                for (const j of deepKeys.jenis) {
                    res[k].jenis[j] = { total: 0 };
                    if (includeStatus) res[k].jenis[j].statusCounts = { pending: 0, approved: 0, rejected: 0 };

                    if (deepKeys?.sub) {
                        res[k].jenis[j].sub = {};
                        for (const s of deepKeys.sub) {
                            res[k].jenis[j].sub[s] = { total: 0 };
                            if (includeStatus) res[k].jenis[j].sub[s].statusCounts = { pending: 0, approved: 0, rejected: 0 };
                        }
                    }
                }
            }

            if (deepKeys?.tingkat) {
                res[k].tingkat = {};
                for (const t of deepKeys.tingkat) {
                    res[k].tingkat[t] = { total: 0 };
                    if (includeStatus) res[k].tingkat[t].statusCounts = { pending: 0, approved: 0, rejected: 0 };
                }
            }
        }
        return res;
    }
}
