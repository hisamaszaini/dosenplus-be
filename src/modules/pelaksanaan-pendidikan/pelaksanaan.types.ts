// =============== BASE ===============

export interface StatusCounts {
  pending: number;
  approved: number;
  rejected: number;
}

/**
 * Generic AggregationNode untuk:
 * - level kategori
 * - level jenisKategori (umum)
 * - level subJenis → jenisKategori (khusus MEMBIMBING_TUGAS_AKHIR)
 */
export interface AggregationNode {
  count: number;
  statusCounts: StatusCounts;
  totalNilai?: number; // optional agar bisa dipakai di semua level
}

// =============== DETAIL STRUCTURE ===============

/**
 * Struktur detail untuk MEMBIMBING_TUGAS_AKHIR:
 * subJenis → jenisKategori → AggregationNode
 */
export type TugasAkhirDetail = Record<
  string, // subJenis (DISERTASI | TESIS | SKRIPSI | LAPORAN_AKHIR_STUDI)
  Record<string, AggregationNode> // jenisKategori (PEMBIMBING_UTAMA | PEMBIMBING_PENDAMPING)
>;

/**
 * Struktur detail untuk kategori lain:
 * jenisKategori → AggregationNode
 */
export type GeneralDetail = Record<string, AggregationNode>;

// =============== KATEGORI-LEVEL WRAPPER ===============

export interface PelaksanaanKategoriNode extends AggregationNode {
  detail?: GeneralDetail | TugasAkhirDetail;
}

/**
 * Root result:
 * key = KategoriPelaksanaanPendidikan
 */
export type AggregationResult = Record<string, PelaksanaanKategoriNode>;

// =============== API RESPONSE ===============

export interface PelaksanaanSummary {
  count: number;
  totalNilai: number;
  statusCounts: StatusCounts;
}

export interface PelaksanaanApiResponse {
  data: AggregationResult;
  summary: PelaksanaanSummary;
  lastUpdated: string;
}

// =============== FILTER ===============

export interface PelaksanaanFilter {
  semesterId?: number;
  tahun?: number;
  statusValidasi?: 'PENDING' | 'APPROVED' | 'REJECTED';
  kategori?: string;
  prodiId?: number;
  fakultasId?: number;
}

// =============== ENUM MIRROR (opsional, type-safe) ===============

export enum KategoriPelaksanaanPendidikan {
  PERKULIAHAN = 'PERKULIAHAN',
  MEMBIMBING_SEMINAR = 'MEMBIMBING_SEMINAR',
  MEMBIMBING_KKN_PKN_PKL = 'MEMBIMBING_KKN_PKN_PKL',
  MEMBIMBING_TUGAS_AKHIR = 'MEMBIMBING_TUGAS_AKHIR',
  PENGUJI_UJIAN_AKHIR = 'PENGUJI_UJIAN_AKHIR',
  MEMBINA_KEGIATAN_MHS = 'MEMBINA_KEGIATAN_MHS',
  MENGEMBANGKAN_PROGRAM = 'MENGEMBANGKAN_PROGRAM',
  BAHAN_PENGAJARAN = 'BAHAN_PENGAJARAN',
  ORASI_ILMIAH = 'ORASI_ILMIAH',
  MENDUDUKI_JABATAN = 'MENDUDUKI_JABATAN',
  MEMBIMBING_DOSEN = 'MEMBIMBING_DOSEN',
  DATASERING_PENCANGKOKAN = 'DATASERING_PENCANGKOKAN',
  PENGEMBANGAN_DIRI = 'PENGEMBANGAN_DIRI'
}

export enum SubJenisTugasAkhir {
  DISERTASI = 'DISERTASI',
  TESIS = 'TESIS',
  SKRIPSI = 'SKRIPSI',
  LAPORAN_AKHIR_STUDI = 'LAPORAN_AKHIR_STUDI'
}

export enum JenisBimbinganTugasAkhir {
  PEMBIMBING_UTAMA = 'PEMBIMBING_UTAMA',
  PEMBIMBING_PENDAMPING = 'PEMBIMBING_PENDAMPING'
}