import {
  Stop,
  Edge,
  RouteLine,
  NetworkStats,
  IncidenceMatrixData,
  AdjacencyMatrixData,
  LaplacianData,
  RouteResult,
  FlowAnalysisResult,
  SourceSinkResult,
  CyclesAnalysisResult,
  DisruptionResult,
} from '../types/network';

const API_BASE = '/api';

export const api = {
  async getNetwork(): Promise<{ dataset_disclaimer: string; stops: Stop[]; edges: Edge[]; routes: RouteLine[] }> {
    const res = await fetch(`${API_BASE}/network`);
    if (!res.ok) throw new Error(`Failed to load network: ${res.statusText}`);
    return res.json();
  },

  async getNetworkStats(): Promise<NetworkStats> {
    const res = await fetch(`${API_BASE}/network/stats`);
    if (!res.ok) throw new Error(`Failed to load network stats: ${res.statusText}`);
    return res.json();
  },

  async getIncidenceMatrix(): Promise<IncidenceMatrixData> {
    const res = await fetch(`${API_BASE}/matrices/incidence`);
    if (!res.ok) throw new Error(`Failed to load incidence matrix: ${res.statusText}`);
    return res.json();
  },

  async getAdjacencyMatrices(): Promise<AdjacencyMatrixData> {
    const res = await fetch(`${API_BASE}/matrices/adjacency`);
    if (!res.ok) throw new Error(`Failed to load adjacency matrices: ${res.statusText}`);
    return res.json();
  },

  async getLaplacianMatrix(): Promise<LaplacianData> {
    const res = await fetch(`${API_BASE}/matrices/laplacian`);
    if (!res.ok) throw new Error(`Failed to load laplacian: ${res.statusText}`);
    return res.json();
  },

  async computeRoute(origin: string, destination: string, criterion = 'time'): Promise<RouteResult> {
    const res = await fetch(`${API_BASE}/route`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origin, destination, criterion }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || 'Failed to compute route');
    }
    return res.json();
  },

  async analyzeFlows(flows: Record<string, number> = {}): Promise<FlowAnalysisResult> {
    const res = await fetch(`${API_BASE}/flow/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flows }),
    });
    if (!res.ok) throw new Error(`Failed to analyze flow: ${res.statusText}`);
    return res.json();
  },

  async analyzeSourceSink(source_id: string, target_id: string, demand = 500): Promise<SourceSinkResult> {
    const res = await fetch(`${API_BASE}/flow/source-sink`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source_id, target_id, demand }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || 'Failed to run source-sink experiment');
    }
    return res.json();
  },

  async analyzeCycles(): Promise<CyclesAnalysisResult> {
    const res = await fetch(`${API_BASE}/cycles/analyze`);
    if (!res.ok) throw new Error(`Failed to analyze cycles: ${res.statusText}`);
    return res.json();
  },

  async analyzeDisruption(disabled_stop_ids: string[], disabled_edge_ids: string[]): Promise<DisruptionResult> {
    const res = await fetch(`${API_BASE}/disruption/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ disabled_stop_ids, disabled_edge_ids }),
    });
    if (!res.ok) throw new Error(`Failed to simulate disruption: ${res.statusText}`);
    return res.json();
  },
};
