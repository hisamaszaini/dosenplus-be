export interface StatusCounts {
  pending: number;
  approved: number;
  rejected: number;
}

export interface AggregationNode {
  totalNilai: number;
  count: number;
  statusCounts: StatusCounts;
}

export interface AggregationResult {
  [kategori: string]: AggregationNode & {
    detail?: {
      [key: string]: AggregationNode;
    };
  };
}