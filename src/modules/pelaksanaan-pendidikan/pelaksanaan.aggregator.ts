import { Prisma, PrismaClient } from "@prisma/client";
import { AggregationResult, AggregationNode } from "./pelaksanaan.types";

export const PELAKSANAAN_MAPPING = {
    PERKULIAHAN: {},
    MEMBIMBING_SEMINAR: {},
    MEMBINA_KEGIATAN_MHS: {},
    MENGEMBANGKAN_PROGRAM: {},

    MEMBIMBING_KKN_PKN_PKL: {
        detail: { KKN: {}, PKN: {}, PKL: {} }
    },
    PENGUJI_UJIAN_AKHIR: {
        detail: { KETUA_PENGUJI: {}, ANGGOTA_PENGUJI: {} }
    },
    BAHAN_PENGAJARAN: {
        detail: {
            BUKU_AJAR: {}, DIKTAT: {}, MODUL: {}, PETUNJUK_PRAKTIKUM: {},
            ALAT_BANTU: {}, AUDIO_VISUAL: {}, NASKAH_TUTORIAL: {}, JOBSHEET: {}
        }
    },
    ORASI_ILMIAH: {
        detail: { LOKAL: {}, DAERAH: {}, NASIONAL: {}, INTERNASIONAL: {} }
    },
    MENDUDUKI_JABATAN: {
        detail: {
            REKTOR: {}, WAKIL: {}, KETUA_SEKOLAH: {}, PEMBANTU_KETUA_SEKOLAH: {},
            DIREKTUR_AKADEMI: {}, PEMBANTU_DIREKTUR: {}, SEKRETARIS_JURUSAN: {}
        }
    },
    MEMBIMBING_DOSEN: {
        detail: { PEMBIMBING_PENCANGKOKAN: {}, PEMBIMBING_REGULER: {} }
    },
    DATASERING_PENCANGKOKAN: {
        detail: { DATASERING: {}, PENCANGKOKAN: {} }
    },
    PENGEMBANGAN_DIRI: {
        detail: {
            LEBIH_DARI_960: {}, ANTARA_641_960: {}, ANTARA_481_640: {}, ANTARA_161_480: {},
            ANTARA_81_160: {}, ANTARA_30_80: {}, ANTARA_10_30: {}
        }
    },

    MEMBIMBING_TUGAS_AKHIR: {
        detail: {
            PEMBIMBING_UTAMA: {
                subDetail: { DISERTASI: {}, TESIS: {}, SKRIPSI: {}, LAPORAN_AKHIR_STUDI: {} }
            },
            PEMBIMBING_PENDAMPING: {
                subDetail: { DISERTASI: {}, TESIS: {}, SKRIPSI: {}, LAPORAN_AKHIR_STUDI: {} }
            }
        }
    }
} as const;

export class PelaksanaanPendidikanAggregator {
    constructor(private prisma: PrismaClient) { }

    public async aggregateGlobal(options: {
        includeDetail?: boolean;
        includeStatus?: boolean;
        filter?: any;
    } = {}): Promise<AggregationResult> {
        const { includeDetail = true, includeStatus = true, filter = {} } = options;
        const whereClause = this.buildWhereClause(undefined, filter);
        return this.executeAggregation(whereClause, includeDetail, includeStatus, false);
    }

    public async aggregateByDosen(
        dosenId: number,
        options: { includeDetail?: boolean; includeStatus?: boolean; filter?: any } = {}
    ): Promise<AggregationResult> {
        const { includeDetail = true, includeStatus = true, filter = {} } = options;
        const whereClause = this.buildWhereClause(dosenId, filter);
        return this.executeAggregation(whereClause, includeDetail, includeStatus, true);
    }

    private async executeAggregation(
        whereClause: Prisma.Sql,
        includeDetail: boolean,
        includeStatus: boolean,
        includeTotal: boolean
    ): Promise<AggregationResult> {

        // Logika dinamis untuk GROUP BY
        const groupByFields = [Prisma.sql`kategori`];
        if (includeDetail) {
            groupByFields.push(Prisma.sql`detail`, Prisma.sql`"subDetail"`);
        }

        // Logika dinamis untuk kolom status
        const statusFields = includeStatus
            ? Prisma.sql`
        COUNT(CASE WHEN "statusValidasi" = 'PENDING' THEN 1 END)::int as pending,
        COUNT(CASE WHEN "statusValidasi" = 'APPROVED' THEN 1 END)::int as approved,
        COUNT(CASE WHEN "statusValidasi" = 'REJECTED' THEN 1 END)::int as rejected`
            : Prisma.sql`0 as pending, 0 as approved, 0 as rejected`;

        // Logika dinamis untuk kolom totalNilai
        const totalField = includeTotal
            ? Prisma.sql`COALESCE(SUM("nilaiPak"), 0)::float as "totalNilai"`
            : Prisma.sql`0::float as "totalNilai"`;

        const query = Prisma.sql`
    WITH AggregationData AS (
      SELECT
        "kategori",
        "nilaiPak",
        "statusValidasi",
        -- CASE statement untuk membuat alias diletakkan DI DALAM CTE
        (CASE 
           WHEN "kategori" = 'MEMBIMBING_TUGAS_AKHIR' THEN "jenisKategori"::TEXT
           ELSE "jenisKategori"::TEXT
         END) AS detail,
        (CASE 
           WHEN "kategori" = 'MEMBIMBING_TUGAS_AKHIR' THEN "subJenis"::TEXT
           ELSE NULL
         END) AS "subDetail"
      FROM "PelaksanaanPendidikan"
      WHERE ${whereClause}
    )
    -- Query utama melakukan agregasi DARI CTE
    SELECT
      kategori,
      ${includeDetail ? Prisma.sql`detail, "subDetail",` : Prisma.sql`NULL as detail, NULL as "subDetail",`}
      ${totalField},
      COUNT(*)::int as count,
      ${statusFields}
    FROM AggregationData
    GROUP BY ${Prisma.join(groupByFields, ', ')}
  `;

        const rawData = await this.prisma.$queryRaw(query) as any[];

        const result = this.prefillStructure(includeDetail, includeTotal);
        this.populateData(result, rawData, includeDetail);
        if (includeTotal) {
            this.rollupTotals(result);
        }

        return result;
    }

    private prefillStructure(includeDetail: boolean, includeTotal: boolean): AggregationResult {
        const prefillRecursive = (mapping: object, isDetailAllowed: boolean): any => {
            const levelResult: { [key: string]: any } = {};
            Object.keys(mapping).forEach(key => {
                levelResult[key] = {
                    count: 0,
                    statusCounts: { pending: 0, approved: 0, rejected: 0 },
                    ...(includeTotal && { totalNilai: 0 })
                };
                const node = (mapping as any)[key];
                if (isDetailAllowed) {
                    if (node.detail) levelResult[key].detail = prefillRecursive(node.detail, true);
                    else if (node.subDetail) levelResult[key].subDetail = prefillRecursive(node.subDetail, true);
                }
            });
            return levelResult;
        };
        return prefillRecursive(PELAKSANAAN_MAPPING, includeDetail);
    }

    // Disesuaikan untuk menempatkan data ke 'subDetail' jika ada
    private populateData(result: AggregationResult, rawData: any[], includeDetail: boolean): void {
        for (const row of rawData) {
            const { kategori, detail, subDetail, ...nodeDataValues } = row;

            if (!kategori || !result[kategori]) continue;

            const nodeData: AggregationNode = {
                totalNilai: nodeDataValues.totalNilai,
                count: nodeDataValues.count,
                statusCounts: {
                    pending: nodeDataValues.pending,
                    approved: nodeDataValues.approved,
                    rejected: nodeDataValues.rejected
                }
            };

            // Jika detail tidak diminta, hanya isi data di level teratas
            if (!includeDetail) {
                Object.assign(result[kategori], nodeData);
                continue; // Lanjut ke baris data berikutnya
            }

            // Jika detail diminta, jalankan logika percabangan Anda
            if (kategori === 'MEMBIMBING_TUGAS_AKHIR' && detail && subDetail) {
                if (result[kategori].detail?.[detail]?.subDetail?.[subDetail]) {
                    Object.assign(result[kategori].detail[detail].subDetail[subDetail], nodeData);
                }
            } else if (detail && result[kategori].detail?.[detail]) {
                Object.assign(result[kategori].detail[detail], nodeData);
            } else {
                // Fallback jika tidak ada detail, meskipun includeDetail=true
                Object.assign(result[kategori], nodeData);
            }
        }
    }

    // Disesuaikan untuk menjumlahkan dari 'detail' atau 'subDetail'
    private rollupTotals(data: any): void {
        const rollupRecursive = (node: any): AggregationNode => {
            const childrenContainer = node.detail || node.subDetail; // Penyesuaian: Cek keduanya
            if (!childrenContainer) {
                return { totalNilai: node.totalNilai, count: node.count, statusCounts: node.statusCounts };
            }

            let aggregatedNode: AggregationNode = {
                totalNilai: 0, count: 0, statusCounts: { pending: 0, approved: 0, rejected: 0 }
            };

            Object.values(childrenContainer).forEach(childNode => {
                const childTotals = rollupRecursive(childNode);
                aggregatedNode = this.mergeNodes(aggregatedNode, childTotals);
            });

            Object.assign(node, aggregatedNode);
            return aggregatedNode;
        };
        Object.values(data).forEach(kategoriNode => rollupRecursive(kategoriNode));
    }

    // --- Helper Functions (Tidak perlu diubah) ---
    private mergeNodes(existing: AggregationNode, incoming: Partial<AggregationNode>): AggregationNode {
        return {
            totalNilai: (existing.totalNilai || 0) + (incoming.totalNilai || 0),
            count: (existing.count || 0) + (incoming.count || 0),
            statusCounts: {
                pending: (existing.statusCounts.pending || 0) + (incoming.statusCounts?.pending || 0),
                approved: (existing.statusCounts.approved || 0) + (incoming.statusCounts?.approved || 0),
                rejected: (existing.statusCounts.rejected || 0) + (incoming.statusCounts?.rejected || 0),
            }
        };
    }

    private buildWhereClause(dosenId?: number, filter: any = {}): Prisma.Sql {
        const conditions: Prisma.Sql[] = [Prisma.sql`TRUE`];
        if (dosenId !== undefined) conditions.push(Prisma.sql`"dosenId" = ${dosenId}`);
        if (filter.semesterId) conditions.push(Prisma.sql`"semesterId" = ${filter.semesterId}`);
        return Prisma.join(conditions, ' AND ');
    }

    public formatForAPI(result: AggregationResult) {
        const summary = this.calculateSummary(result);
        return {
            data: result,
            summary: summary,
            lastUpdated: new Date().toISOString(),
        };
    }

    calculateSummary(result: AggregationResult): AggregationNode {
        let summary: AggregationNode = {
            totalNilai: 0, count: 0, statusCounts: { pending: 0, approved: 0, rejected: 0 }
        };
        Object.values(result).forEach((kategori) => {
            summary = this.mergeNodes(summary, kategori);
        });
        return summary;
    }
}