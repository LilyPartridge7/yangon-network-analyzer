export interface Stop {
  id: string;
  name: string;
  name_my?: string;
  latitude: number;
  longitude: number;
  area: string;
  demand_rate: number;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  distance_km: number;
  travel_time_min: number;
  capacity: number;
  route_name: string;
  bidirectional: boolean;
}

export interface RouteLine {
  id: string;
  name: string;
  description: string;
  color: string;
  start_stop: string;
  end_stop: string;
}

export interface NetworkStats {
  num_nodes: number;
  num_edges: number;
  rank: number;
  num_connected_components: number;
  is_connected: boolean;
  nullity_A: number;
  nullity_At_cycle_space: number;
  avg_travel_time_min: number;
  total_network_length_km: number;
  components?: string[][];
  isolated_stops?: string[];
  strang_identity_satisfied?: boolean;
  explanation: string;
}

export interface IncidenceMatrixData {
  matrix: number[][];
  dimensions: { rows: number; cols: number };
  row_labels: string[];
  col_labels: string[];
  rank: number;
  nullity_A: number;
  nullity_At_cycle_space: number;
  is_connected: boolean;
  explanation: string;
}

export interface AdjacencyMatrixData {
  binary_adjacency: number[][];
  distance_adjacency: number[][];
  time_adjacency: number[][];
  stop_labels: string[];
}

export interface LaplacianData {
  degree_matrix: number[][];
  degrees: number[];
  laplacian_D_minus_G: number[][];
  AtA_matrix: number[][];
  eigenvalues: number[];
  algebraic_connectivity: number;
  identity_verified: boolean;
}

export interface DijkstraStep {
  from_node: string;
  to_node: string;
  edge_id: string;
  relaxed_weight: number;
  new_cumulative_cost: number;
}

export interface RouteSubmatrix {
  submatrix: number[][];
  row_labels: string[];
  col_labels: string[];
  x_route_vector: number[];
  algebraic_telescoping_sum: number[];
}

export interface RouteResult {
  found: boolean;
  origin: string;
  destination: string;
  criterion?: string;
  stops?: string[];
  edges?: string[];
  edge_details?: Edge[];
  total_distance_km?: number;
  total_travel_time_min?: number;
  edge_count?: number;
  dijkstra_steps?: DijkstraStep[];
  linear_algebra?: RouteSubmatrix;
  error?: string;
}

export interface NodeFlowStatus {
  stop_id: string;
  stop_name: string;
  net_flow: number;
  status: 'conserved' | 'net_sink' | 'net_source';
  is_conserved: boolean;
}

export interface EdgeUtilization {
  edge_id: string;
  flow: number;
  capacity: number;
  utilization_percent: number;
  is_congested: boolean;
}

export interface FlowAnalysisResult {
  b_vector: number[];
  node_flows: NodeFlowStatus[];
  edge_utilizations: EdgeUtilization[];
  total_imbalance: number;
  conserved_node_count: number;
  total_nodes: number;
  global_sum: number;
  is_globally_balanced: boolean;
  explanation: string;
}

export interface SourceSinkResult {
  success: boolean;
  source_id: string;
  target_id: string;
  demand: number;
  path_edge_ids: string[];
  path_stops?: string[];
  demand_vector_b: number[];
  flow_vector_y: number[];
  At_y: number[];
  equation_satisfied: boolean;
  simple_explanation: string;
  advanced_math_explanation: string;
  error?: string;
}

export interface CycleInfo {
  cycle_id: string;
  edge_ids: string[];
  node_ids: string[];
  y_vector: number[];
  length: number;
  At_y_result: number[];
  is_in_nullspace: boolean;
  max_residual: number;
  explanation: string;
}

export interface CyclesAnalysisResult {
  num_cycles_detected: number;
  cycle_space_dimension: number;
  formula: string;
  cycles: CycleInfo[];
  theoretical_meaning: string;
}

export interface DisruptionSnapshot {
  num_nodes: number;
  num_edges: number;
  rank: number;
  components: number;
  is_connected: boolean;
  nullity_A: number;
  nullity_At: number;
  benchmark_route_time?: number | null;
  benchmark_route_found?: boolean;
}

export interface DisruptionResult {
  before: DisruptionSnapshot;
  after: DisruptionSnapshot;
  disruption: {
    disabled_stops: string[];
    disabled_edges: string[];
    removed_nodes_count: number;
    removed_edges_count: number;
    network_severed: boolean;
    newly_isolated_stops: string[];
  };
}
