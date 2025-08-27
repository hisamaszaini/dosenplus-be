export interface AggregationNode {
  total: number;
  count: number;
  statusCounts: {
    pending: number;
    approved: number;
    rejected: number;
  };
}

export interface AggregationResult {
  [kategori: string]: AggregationNode & {
    jenjang?: {
      [jenjang: string]: AggregationNode;
    };
    jenis?: {
      [jenis: string]: AggregationNode;
    };
  };
}