import z, { email } from "zod";

export const baseResponseSchema = z.object({
    success: z.boolean(),
    message: z.string().nullable(),
});


export const fakultasItemSchema = z.object({
    idFakultas: z.number(),
    namaFakultas: z.string(),
    kodeFakultas: z.string(),
});

export const prodiItemSchema = z.object({
    idJurusan: z.number(),
    namaJurusan: z.string(),
    kelas: z.string(),
    kodeFakultas: z.string(),
    kodeJurusan: z.string(),
    kodeFp: z.string(),
    programStudi: z.string(),
    perkelas: z.number(),
    programPendidikan: z.string(),
    jenjang: z.string(),
    stt: z.string(),
});

export const dosenByProdiItemSchema = z.object({
    id: z.number(),
    nama: z.string(),
    genderId: z.number(),
    fakultas: z.string(),
    prodi: z.string(),
    kodeFp: z.string(),
    nik: z.string(),
    nidn: z.string().nullable().or(z.literal("")),
    email: z.string(),
});

export const getFakultasResponse = baseResponseSchema.extend({
    data: z.array(fakultasItemSchema),
});

export const getProdiResponse = baseResponseSchema.extend({
    data: z.array(prodiItemSchema),
});

export const getDosenByProdiResponse = baseResponseSchema.extend({
    data: z.array(dosenByProdiItemSchema)
});