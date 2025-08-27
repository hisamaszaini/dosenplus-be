export interface AggregationNode {
  total: number;
  count: number;
  statusCounts: { pending: number; approved: number; rejected: number };
}

export interface AggregationResult {
  [kategori: string]: AggregationNode & {
    detail?: { [detail: string]: AggregationNode };
  };
}