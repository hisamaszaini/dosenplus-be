import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { PenelitianAggregator } from '../penelitian/penelitian.aggregator';
import { PengabdianAggregator } from '../pengabdian/pengabdian.aggregator';
import { PenunjangAggregator } from '../penunjang/penunjang.aggregator';
import { PendidikanAggregator } from '../pendidikan/pendidikan.aggregator';

@Injectable()
export class KesimpulanService {
    private pendidikanAggregator: PendidikanAggregator;
    private penelitianAggregator: PenelitianAggregator;
    private pengabdianAggregator: PengabdianAggregator;
    private penunjangAggregator: PenunjangAggregator;

    constructor(private readonly prisma: PrismaService) {
        this.pendidikanAggregator = new PendidikanAggregator(prisma);
        this.penelitianAggregator = new PenelitianAggregator(prisma);
        this.pengabdianAggregator = new PengabdianAggregator(prisma);
        this.penunjangAggregator = new PenunjangAggregator(prisma);
    }

    async findById(
        dosenId: number,
        options: {
            includeDetails?: boolean;
            semesterId?: number;
            tahun?: number;
            status?: string;
        } = {}
    ) {
        try {
            // Ambil data dosen
            const dosen = await this.prisma.dosen.findUniqueOrThrow({
                where: { id: dosenId },
            });

            // Build filter
            const filter: any = {};
            if (options.semesterId) filter.semesterId = options.semesterId;
            if (options.tahun) filter.tahun = options.tahun;
            if (options.status) filter.statusValidasi = options.status;

            // Hitung aggregasi untuk semua kategori

            const [pendidikan, penelitian, pengabdian, penunjang] = await Promise.all([

                this.pendidikanAggregator.aggregateByDosen(dosenId, {
                    includeDetail: true,
                    includeStatus: true,
                }),

                this.penelitianAggregator.aggregateByDosen(dosenId, {
                    includeJenis: options.includeDetails ?? true,
                    includeSub: options.includeDetails ?? true,
                    includeStatus: true,
                    filter
                }),

                this.pengabdianAggregator.aggregateByDosen(dosenId, {
                    includeDetail: options.includeDetails ?? true,
                    includeStatus: true,
                    filter
                }),

                this.penunjangAggregator.aggregateByDosen(dosenId, {
                    includeJenis: options.includeDetails ?? true,
                    includeStatus: true,
                    filter
                })
            ]);

            // Hitung summary total
            const totalSummary = this.calculateTotalSummary(pendidikan, penelitian, pengabdian, penunjang);

            return {
                dosen,
                summary: totalSummary,
                details: {
                    pendidikan: this.pendidikanAggregator.formatForAPI(pendidikan),
                    penelitian: this.penelitianAggregator.formatForAPI(penelitian),
                    pengabdian: this.pengabdianAggregator.formatForAPI(pengabdian),
                    penunjang: this.penunjangAggregator.formatForAPI(penunjang)
                }
            };
        } catch (error) {
            throw error;
        }
    }

    async getQuickSummary(
        dosenId: number,
        options: {
            semesterId?: number;
            tahun?: number;
        } = {}
    ) {
        try {
            const filter: any = {};
            if (options.semesterId) filter.semesterId = options.semesterId;
            if (options.tahun) filter.tahun = options.tahun;

            // Get summaries only (tanpa detail)
            const [penelitianSummary, pengabdianSummary, penunjangSummary] = await Promise.all([
                this.penelitianAggregator.getSummary(dosenId, filter),
                this.pengabdianAggregator.calculateSummary(
                    await this.pengabdianAggregator.aggregateByDosen(dosenId, {
                        includeDetail: false,
                        filter
                    })
                ),
                this.penunjangAggregator.calculateSummary(
                    await this.penunjangAggregator.aggregateByDosen(dosenId, {
                        includeJenis: false,
                        filter
                    })
                )
            ]);

            const total = {
                total: penelitianSummary.total + pengabdianSummary.total + penunjangSummary.total,
                count: penelitianSummary.count + pengabdianSummary.count + penunjangSummary.count,
                statusCounts: {
                    pending: penelitianSummary.statusCounts.pending +
                        pengabdianSummary.statusCounts.pending +
                        penunjangSummary.statusCounts.pending,
                    approved: penelitianSummary.statusCounts.approved +
                        pengabdianSummary.statusCounts.approved +
                        penunjangSummary.statusCounts.approved,
                    rejected: penelitianSummary.statusCounts.rejected +
                        pengabdianSummary.statusCounts.rejected +
                        penunjangSummary.statusCounts.rejected
                }
            };

            return {
                total,
                breakdown: {
                    penelitian: penelitianSummary,
                    pengabdian: pengabdianSummary,
                    penunjang: penunjangSummary
                }
            };
        } catch (error) {
            throw error;
        }
    }

    private calculateTotalSummary(
        pendidikan: any,
        penelitian: any,
        pengabdian: any,
        penunjang: any
    ) {
        const pendidikanSummary = this.pendidikanAggregator.calculateSummary(pendidikan);
        const penelitianSummary = this.penelitianAggregator.calculateSummary(penelitian);
        const pengabdianSummary = this.pengabdianAggregator.calculateSummary(pengabdian);
        const penunjangSummary = this.penunjangAggregator.calculateSummary(penunjang);

        return {
            total: pendidikanSummary.total + penelitianSummary.total + pengabdianSummary.total + penunjangSummary.total,
            count: pendidikanSummary.count + penelitianSummary.count + pengabdianSummary.count + penunjangSummary.count,
            statusCounts: {
                pending: pendidikanSummary.statusCounts.pending +
                    penelitianSummary.statusCounts.pending +
                    pengabdianSummary.statusCounts.pending +
                    penunjangSummary.statusCounts.pending,
                approved: pendidikanSummary.statusCounts.approved +
                    penelitianSummary.statusCounts.approved +
                    pengabdianSummary.statusCounts.approved +
                    penunjangSummary.statusCounts.approved,
                rejected: pendidikanSummary.statusCounts.rejected +
                    penelitianSummary.statusCounts.rejected +
                    pengabdianSummary.statusCounts.rejected +
                    penunjangSummary.statusCounts.rejected
            },
            categories: {
                pendidikan: pendidikanSummary,
                penelitian: penelitianSummary,
                pengabdian: pengabdianSummary,
                penunjang: penunjangSummary
            }
        };
    }
}