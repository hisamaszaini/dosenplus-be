import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { PenelitianAggregator } from '../penelitian/penelitian.aggregator';
import { PengabdianAggregator } from '../pengabdian/pengabdian.aggregator';
import { PenunjangAggregator } from '../penunjang/penunjang.aggregator';
import { PendidikanAggregator } from '../pendidikan/pendidikan.aggregator';
import { PelaksanaanPendidikanAggregator } from '../pelaksanaan-pendidikan/pelaksanaan.aggregator';

@Injectable()
export class KesimpulanService {
    private pendidikanAggregator: PendidikanAggregator;
    private pelaksanaanPendidikanAggregator: PelaksanaanPendidikanAggregator;
    private penelitianAggregator: PenelitianAggregator;
    private pengabdianAggregator: PengabdianAggregator;
    private penunjangAggregator: PenunjangAggregator;

    constructor(private readonly prisma: PrismaService) {
        this.pendidikanAggregator = new PendidikanAggregator(prisma);
        this.pelaksanaanPendidikanAggregator = new PelaksanaanPendidikanAggregator(prisma);
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
            const dosen = await this.prisma.dosen.findUniqueOrThrow({
                where: { id: dosenId },
            });

            const filter: any = {};
            if (options.semesterId) filter.semesterId = options.semesterId;
            if (options.tahun) filter.tahun = options.tahun;
            if (options.status) filter.statusValidasi = options.status;

            const [pendidikan, pelaksanaanPendidikan, penelitian, pengabdian, penunjang] = await Promise.all([
                this.pendidikanAggregator.aggregateByDosen(dosenId, {
                    includeDetail: options.includeDetails ?? true,
                    includeStatus: true,
                    filter
                }),
                this.pelaksanaanPendidikanAggregator.aggregateByDosen(dosenId, {
                    includeDetail: options.includeDetails ?? true,
                    includeStatus: true,
                    filter
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

            const totalSummary = this.calculateTotalSummary(
                pendidikan,
                pelaksanaanPendidikan,
                penelitian,
                pengabdian,
                penunjang
            );

            return {
                dosen,
                summary: totalSummary,
                details: {
                    pendidikan: this.pendidikanAggregator.formatForAPI(pendidikan),
                    pelaksanaanPendidikan: this.pelaksanaanPendidikanAggregator.formatForAPI(pelaksanaanPendidikan),
                    penelitian: this.penelitianAggregator.formatForAPI(penelitian),
                    pengabdian: this.pengabdianAggregator.formatForAPI(pengabdian),
                    penunjang: this.penunjangAggregator.formatForAPI(penunjang)
                }
            };
        } catch (error) {
            throw error;
        }
    }

    async findByIdSimple(
        dosenId: number,
        options: {
            semesterId?: number;
            tahun?: number;
            status?: string;
        } = {}
    ) {
        const dosen = await this.prisma.dosen.findUniqueOrThrow({
            where: { id: dosenId },
        });

        const filter: any = {};
        if (options.semesterId) filter.semesterId = options.semesterId;
        if (options.tahun) filter.tahun = options.tahun;
        if (options.status) filter.statusValidasi = options.status;

        const [pendidikan, pelaksanaanPendidikan, penelitian, pengabdian, penunjang] =
            await Promise.all([
                this.pendidikanAggregator.aggregateByDosen(dosenId, {
                    includeDetail: false,
                    includeStatus: true,
                    filter,
                }),
                this.pelaksanaanPendidikanAggregator.aggregateByDosen(dosenId, {
                    includeDetail: false,
                    includeStatus: true,
                    filter,
                }),
                this.penelitianAggregator.aggregateByDosen(dosenId, {
                    includeJenis: false,
                    includeSub: false,
                    includeStatus: true,
                    filter,
                }),
                this.pengabdianAggregator.aggregateByDosen(dosenId, {
                    includeDetail: false,
                    includeStatus: true,
                    filter,
                }),
                this.penunjangAggregator.aggregateByDosen(dosenId, {
                    includeJenis: false,
                    includeStatus: true,
                    filter,
                }),
            ]);

        const summary = this.calculateTotalSummary(
            pendidikan,
            pelaksanaanPendidikan,
            penelitian,
            pengabdian,
            penunjang
        );

        return {
            dosen,
            summary,
        };
    }

    private extractNodeData(aggregator: any): { totalNilai: number; count: number; statusCounts: { pending: number; approved: number; rejected: number } } {
        const summary = 'calculateSummary' in aggregator
            ? aggregator.calculateSummary(aggregator)
            : aggregator;

        return {
            totalNilai: summary.total,
            count: summary.count,
            statusCounts: summary.statusCounts
        };
    }

    private calculateTotalSummary(
        pendidikan: any,
        pelaksanaanPendidikan: any,
        penelitian: any,
        pengabdian: any,
        penunjang: any
    ) {
        const [p, pp, pe, pg, pn] = [
            this.pendidikanAggregator.calculateSummary(pendidikan),
            this.pelaksanaanPendidikanAggregator.calculateSummary(pelaksanaanPendidikan),
            this.penelitianAggregator.calculateSummary(penelitian),
            this.pengabdianAggregator.calculateSummary(pengabdian),
            this.penunjangAggregator.calculateSummary(penunjang)
        ];

        return {
            totalNilai: p.totalNilai + pp.totalNilai + pe.total + pg.totalNilai + pn.totalNilai,
            count: p.count + pp.count + pe.count + pg.count + pn.count,
            statusCounts: {
                pending: p.statusCounts.pending + pp.statusCounts.pending + pe.statusCounts.pending + pg.statusCounts.pending + pn.statusCounts.pending,
                approved: p.statusCounts.approved + pp.statusCounts.approved + pe.statusCounts.approved + pg.statusCounts.approved + pn.statusCounts.approved,
                rejected: p.statusCounts.rejected + pp.statusCounts.rejected + pe.statusCounts.rejected + pg.statusCounts.rejected + pn.statusCounts.rejected
            },
            categories: { pendidikan: p, pelaksanaanPendidikan: pp, penelitian: pe, pengabdian: pg, penunjang: pn }
        };
    }

    async getQuickSummary(
        dosenId: number,
        options: {
            semesterId?: number;
            tahun?: number;
        } = {}
    ) {
        const filter: any = {};
        if (options.semesterId) filter.semesterId = options.semesterId;
        if (options.tahun) filter.tahun = options.tahun;

        const [pendidikan, pelaksanaanPendidikan, penelitian, pengabdian, penunjang] = await Promise.all([
            this.pendidikanAggregator.aggregateByDosen(dosenId, { includeDetail: false, filter }),
            this.pelaksanaanPendidikanAggregator.aggregateByDosen(dosenId, { includeDetail: false, filter }),
            this.penelitianAggregator.aggregateByDosen(dosenId, { includeJenis: true, includeSub: true, includeStatus: true }),
            this.pengabdianAggregator.aggregateByDosen(dosenId, { includeDetail: false, filter }),
            this.penunjangAggregator.aggregateByDosen(dosenId, { includeJenis: false, filter })
        ]);

        return {
            totalNilai: this.calculateTotalSummary(pendidikan, pelaksanaanPendidikan, penelitian, pengabdian, penunjang),
            breakdown: { pendidikan, pelaksanaanPendidikan, penelitian, pengabdian, penunjang }
        };
    }
}