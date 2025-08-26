import z from "zod";
import { aktifPertemuanIlmiahInternalPTSchema, aktifPertemuanIlmiahIntNasRegSchema, anggotaOrganisasiProfesiInternasionalSchema, anggotaOrganisasiProfesiNasionalSchema, anggotaPanitiaLPSchema, anggotaPanitiaPTSchema, delegasiNasionalPertemuanInterSchema, menulisBukuSLTANasionalSchema, penunjangBaseSchema, prestasiOlahragaHumanioraSchema, tandaJasaPenghargaanSchema, timPenilaiJabatanAkademikDosenSchema, wakilPTPanitiaAntarLembagaSchema } from "./create-penunjang.dto";

function createUpdateSchema<T extends z.ZodObject<any>>(schema: T) {
    return schema.partial().extend({
        kategori: schema.shape.kategori,
    });
}

export const updatePenunjangDtoSchema = z.discriminatedUnion("kategori", [
  createUpdateSchema(anggotaPanitiaPTSchema),
  createUpdateSchema(anggotaPanitiaLPSchema),
  createUpdateSchema(anggotaOrganisasiProfesiInternasionalSchema),
  createUpdateSchema(anggotaOrganisasiProfesiNasionalSchema),
  createUpdateSchema(wakilPTPanitiaAntarLembagaSchema),
  createUpdateSchema(delegasiNasionalPertemuanInterSchema),
  createUpdateSchema(aktifPertemuanIlmiahIntNasRegSchema),
  createUpdateSchema(aktifPertemuanIlmiahInternalPTSchema),
  createUpdateSchema(tandaJasaPenghargaanSchema),
  createUpdateSchema(menulisBukuSLTANasionalSchema),
  createUpdateSchema(prestasiOlahragaHumanioraSchema),
  createUpdateSchema(timPenilaiJabatanAkademikDosenSchema),
]);

export const fullUpdatePenunjangSchema = penunjangBaseSchema.partial().and(updatePenunjangDtoSchema);

export type UpdatePenunjangFullDto = z.infer<typeof fullUpdatePenunjangSchema>;