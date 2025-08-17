export function cleanRelasi(data: any, parentKeys: string[] = []): any {
  return Object.fromEntries(
    Object.entries(data)
      .map(([key, value]) => {
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          // rekursif hanya untuk object (relasi)
          const cleaned = cleanRelasi(value, [...parentKeys, key]);
          if (Object.keys(cleaned).length === 0) return [key, undefined]; // hapus object kosong
          return [key, cleaned];
        }
        // scalar field (termasuk null) tetap dikembalikan
        return [key, value];
      })
      .filter(([_, value]) => value !== undefined)
  );
}
