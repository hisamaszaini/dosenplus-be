import { Prisma } from "@prisma/client";

export type UpdatePenelitianInput = Partial<
  Omit<Prisma.PenelitianUpdateInput, 'detail'> & {
    detail?: Record<string, unknown>;
    jumlahPenulis?: number;
    corespondensi?: boolean;
    jenisKategori?: string;
    subJenis?: string;
  }
>;

export interface StatusCounts {
  pending: number;
  approved: number;
  rejected: number;
}

export interface AggregationNode {
  totalNilai: number;
  count: number;
  statusCounts: StatusCounts;
}

export interface AggregationResult {
  [kategori: string]: AggregationNode & {
    jenis?: {
      [jenis: string]: AggregationNode & {
        sub?: {
          [sub: string]: AggregationNode;
        };
      };
    };
  };
}