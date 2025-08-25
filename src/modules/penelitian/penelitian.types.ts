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