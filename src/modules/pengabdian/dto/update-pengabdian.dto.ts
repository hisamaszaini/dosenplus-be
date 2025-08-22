import z from "zod";
import { jabatanPimpinanSchema, pengembanganDimanfaatkanSchema, penyuluhanSatuSemesterSchema, penyuluhanKurangSatuSemesterSchema, pelayananMasyarakatSchema, karyaPengabianTidakPublisSchema, karyaPengabianDipublisSchema, pengelolaJurnalSchema, pengabdianBaseSchema } from "./create-pengabdian.dto";

function createUpdateSchema<T extends z.ZodObject<any>>(schema: T) {
    return schema.partial().extend({
        kategori: schema.shape.kategori,
    });
}

const updatePengabdianDtoSchema = z.discriminatedUnion('kategori', [
    createUpdateSchema(jabatanPimpinanSchema),
    createUpdateSchema(pengembanganDimanfaatkanSchema),
    createUpdateSchema(penyuluhanSatuSemesterSchema),
    createUpdateSchema(penyuluhanKurangSatuSemesterSchema),
    createUpdateSchema(pelayananMasyarakatSchema),
    createUpdateSchema(karyaPengabianTidakPublisSchema),
    createUpdateSchema(karyaPengabianDipublisSchema),
    createUpdateSchema(pengelolaJurnalSchema),
]);

export const fullUpdatePengabdianSchema = pengabdianBaseSchema.partial().and(updatePengabdianDtoSchema);

export type UpdatePengabdianFullDto = z.infer<typeof fullUpdatePengabdianSchema>;