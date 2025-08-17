export function cleanRelasi(data: any) {
    return Object.fromEntries(
        Object.entries(data).map(([key, value]) => {
            if (value && typeof value === 'object') {
                if (Object.keys(value).length === 0) return [key, undefined];
                return [key, cleanRelasi(value)];
            }
            return [key, value];
        }).filter(([_, value]) => value !== undefined)
    );
}
