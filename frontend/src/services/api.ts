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
import {
  localEngine,
  LOCAL_STOPS,
  LOCAL_EDGES,
  LOCAL_ROUTES,
} from './localEngine';

const API_BASE = '/api';

export const api = {
  async getNetwork(): Promise<{ dataset_disclaimer: string; stops: Stop[]; edges: Edge[]; routes: RouteLine[] }> {
    try {
      const res = await fetch(`${API_BASE}/network`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback to local engine
    }
    return {
      dataset_disclaimer: 'Educational Sample Yangon Network: Realistic Yangon coordinates with synthetic educational transit parameters.',
      stops: LOCAL_STOPS,
      edges: LOCAL_EDGES,
      routes: LOCAL_ROUTES,
    };
  },

  async getNetworkStats(): Promise<NetworkStats> {
    try {
      const res = await fetch(`${API_BASE}/network/stats`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback to local engine
    }
    return localEngine.getNetworkStats();
  },

  async getIncidenceMatrix(): Promise<IncidenceMatrixData> {
    try {
      const res = await fetch(`${API_BASE}/matrices/incidence`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return localEngine.getIncidenceData();
  },

  async getAdjacencyMatrices(): Promise<AdjacencyMatrixData> {
    try {
      const res = await fetch(`${API_BASE}/matrices/adjacency`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return localEngine.getAdjacencyData();
  },

  async getLaplacianMatrix(): Promise<LaplacianData> {
    try {
      const res = await fetch(`${API_BASE}/matrices/laplacian`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return localEngine.getLaplacianData();
  },

  async computeRoute(origin: string, destination: string, criterion = 'time'): Promise<RouteResult> {
    try {
      const res = await fetch(`${API_BASE}/route`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin, destination, criterion }),
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return localEngine.dijkstra(origin, destination, criterion);
  },

  async analyzeFlows(flows: Record<string, number> = {}): Promise<FlowAnalysisResult> {
    try {
      const res = await fetch(`${API_BASE}/flow/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flows }),
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return localEngine.analyzeFlows(flows);
  },

  async analyzeSourceSink(source_id: string, target_id: string, demand = 500): Promise<SourceSinkResult> {
    try {
      const res = await fetch(`${API_BASE}/flow/source-sink`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source_id, target_id, demand }),
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return localEngine.sourceSinkExperiment(source_id, target_id, demand);
  },

  async analyzeCycles(): Promise<CyclesAnalysisResult> {
    try {
      const res = await fetch(`${API_BASE}/cycles/analyze`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return localEngine.analyzeCycles();
  },

  async analyzeDisruption(disabled_stop_ids: string[], disabled_edge_ids: string[]): Promise<DisruptionResult> {
    try {
      const res = await fetch(`${API_BASE}/disruption/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disabled_stop_ids, disabled_edge_ids }),
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return localEngine.analyzeDisruption(disabled_stop_ids, disabled_edge_ids);
  },
};
