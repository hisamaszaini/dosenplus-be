export function cleanRelasi(data: any): any {
  return Object.fromEntries(
    Object.entries(data)
      .map(([key, value]) => {
        if (value === null) return [key, undefined]; // hapus null
        if (typeof value === 'object' && value !== null) {
          const cleaned = cleanRelasi(value);
          if (Object.keys(cleaned).length === 0) return [key, undefined]; // hapus object kosong
          return [key, cleaned];
        }
        return [key, value]; // scalar tetap
      })
      .filter(([_, value]) => value !== undefined)
  );
}
