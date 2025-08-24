import { Prisma } from "@prisma/client";

export function buildWhereClause(
  filter: Record<string, any>,
  tableName: string = 'Penelitian',
): Prisma.Sql {
  const parts: Prisma.Sql[] = [];

  if (filter.statusValidasi)
    parts.push(Prisma.sql`"${Prisma.raw(tableName)}"."statusValidasi" = ${filter.statusValidasi}`);
  if (filter.semesterId)
    parts.push(Prisma.sql`"${Prisma.raw(tableName)}"."semesterId" = ${filter.semesterId}`);
  if (filter.kategori)
    parts.push(Prisma.sql`"${Prisma.raw(tableName)}"."kategori" = ${filter.kategori}`);

  return parts.length === 0 ? Prisma.empty : Prisma.join(parts, ' AND ');
}