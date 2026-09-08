import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Stop,
  Edge,
  IncidenceMatrixData,
  AdjacencyMatrixData,
  LaplacianData,
} from '../types/network';
import { MatrixTable } from '../components/matrix/MatrixTable';
import { NetworkGraph } from '../components/network/NetworkGraph';
import { MathBlock, MathInline } from '../components/common/MathBlock';
import { DisclaimerBanner } from '../components/common/DisclaimerBanner';
import {
  Grid3X3,
  Layers,
  Sparkles,
  Info,
  CheckCircle2,
  Sliders,
} from 'lucide-react';

export const MatrixLabPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'incidence' | 'adjacency' | 'degree' | 'laplacian'>('incidence');
  const [stops, setStops] = useState<Stop[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  const [incidenceData, setIncidenceData] = useState<IncidenceMatrixData | null>(null);
  const [adjacencyData, setAdjacencyData] = useState<AdjacencyMatrixData | null>(null);
  const [laplacianData, setLaplacianData] = useState<LaplacianData | null>(null);

  const [adjacencyMode, setAdjacencyMode] = useState<'binary' | 'distance' | 'time'>('binary');
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadAllMatrices() {
      try {
        setLoading(true);
        const [net, inc, adj, lap] = await Promise.all([
          api.getNetwork(),
          api.getIncidenceMatrix(),
          api.getAdjacencyMatrices(),
          api.getLaplacianMatrix(),
        ]);
        setStops(net.stops);
        setEdges(net.edges);
        setIncidenceData(inc);
        setAdjacencyData(adj);
        setLaplacianData(lap);
      } catch (err) {
        console.error('Failed to load matrix lab data', err);
      } finally {
        setLoading(false);
      }
    }
    loadAllMatrices();
  }, []);

  // Map selected edge to row index in incidence matrix
  const selectedRowIndex = selectedEdgeId && incidenceData
    ? incidenceData.row_labels.indexOf(selectedEdgeId)
    : null;

  const handleRowClick = (rIdx: number) => {
    if (!incidenceData) return;
    const edgeId = incidenceData.row_labels[rIdx];
    setSelectedEdgeId(edgeId === selectedEdgeId ? null : edgeId);
  };

  const handleColClick = (cIdx: number) => {
    if (!incidenceData) return;
    const stopId = incidenceData.col_labels[cIdx];
    setSelectedNodeId(stopId === selectedNodeId ? null : stopId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Grid3X3 className="w-6 h-6 text-blue-600" />
            <span>Matrix Lab</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Incidence Matrix \(A\), Adjacency \(G\), Degree \(D\), and Graph Laplacian \(L = A^T A\)
          </p>
        </div>

        {/* Tab selection */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-medium">
          <button
            onClick={() => setActiveTab('incidence')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'incidence'
                ? 'bg-white text-blue-700 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Incidence Matrix A
          </button>
          <button
            onClick={() => setActiveTab('adjacency')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'adjacency'
                ? 'bg-white text-blue-700 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Adjacency Matrix G
          </button>
          <button
            onClick={() => setActiveTab('degree')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'degree'
                ? 'bg-white text-blue-700 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Degree Matrix D
          </button>
          <button
            onClick={() => setActiveTab('laplacian')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'laplacian'
                ? 'bg-white text-blue-700 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Graph Laplacian L
          </button>
        </div>
      </div>

      <DisclaimerBanner />

      {/* Synchronized Graph and Matrix Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Matrix Table (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span>
                  {activeTab === 'incidence' && 'Incidence Matrix A'}
                  {activeTab === 'adjacency' && 'Adjacency Matrix G'}
                  {activeTab === 'degree' && 'Degree Matrix D'}
                  {activeTab === 'laplacian' && 'Graph Laplacian L = D - G = AᵀA'}
                </span>
                <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  {activeTab === 'incidence'
                    ? `A ∈ ℝ^(${incidenceData?.dimensions.rows ?? 26} × ${incidenceData?.dimensions.cols ?? 16})`
                    : `G ∈ ℝ^(16 × 16)`}
                </span>
              </h2>
            </div>

            {/* Sub-controls for Adjacency */}
            {activeTab === 'adjacency' && (
              <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-md border border-slate-200 text-xs">
                <button
                  onClick={() => setAdjacencyMode('binary')}
                  className={`px-2 py-0.5 rounded ${
                    adjacencyMode === 'binary' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-600'
                  }`}
                >
                  Binary (0/1)
                </button>
                <button
                  onClick={() => setAdjacencyMode('distance')}
                  className={`px-2 py-0.5 rounded ${
                    adjacencyMode === 'distance' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-600'
                  }`}
                >
                  Distance (km)
                </button>
                <button
                  onClick={() => setAdjacencyMode('time')}
                  className={`px-2 py-0.5 rounded ${
                    adjacencyMode === 'time' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-600'
                  }`}
                >
                  Time (min)
                </button>
              </div>
            )}
          </div>

          {/* Render Active Matrix Table */}
          {loading ? (
            <div className="h-64 flex items-center justify-center text-xs text-slate-400">
              Computing matrices...
            </div>
          ) : activeTab === 'incidence' && incidenceData ? (
            <MatrixTable
              matrix={incidenceData.matrix}
              rowLabels={incidenceData.row_labels}
              colLabels={incidenceData.col_labels}
              selectedRowIndex={selectedRowIndex}
              selectedColIndex={selectedNodeId ? incidenceData.col_labels.indexOf(selectedNodeId) : null}
              onRowClick={handleRowClick}
              onColClick={handleColClick}
            />
          ) : activeTab === 'adjacency' && adjacencyData ? (
            <MatrixTable
              matrix={
                adjacencyMode === 'binary'
                  ? adjacencyData.binary_adjacency
                  : adjacencyMode === 'distance'
                  ? adjacencyData.distance_adjacency
                  : adjacencyData.time_adjacency
              }
              rowLabels={adjacencyData.stop_labels}
              colLabels={adjacencyData.stop_labels}
              dense
            />
          ) : activeTab === 'degree' && laplacianData ? (
            <MatrixTable
              matrix={laplacianData.degree_matrix}
              rowLabels={stops.map((s) => s.id)}
              colLabels={stops.map((s) => s.id)}
              dense
            />
          ) : activeTab === 'laplacian' && laplacianData ? (
            <MatrixTable
              matrix={laplacianData.laplacian_D_minus_G}
              rowLabels={stops.map((s) => s.id)}
              colLabels={stops.map((s) => s.id)}
              dense
            />
          ) : null}

          {/* Educational Note Box */}
          <div className="p-3.5 rounded-lg bg-blue-50/70 border border-blue-200/80 text-xs text-blue-950 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              {activeTab === 'incidence' && (
                <p>
                  <strong>Gilbert Strang 10.1 Convention:</strong> Each row represents one direct transit edge.
                  <span className="font-semibold text-amber-800"> -1 </span> indicates where the edge leaves a stop (source),
                  <span className="font-semibold text-blue-800"> +1 </span> indicates where the edge enters a stop (destination),
                  and <strong>0</strong> indicates that the node is not connected to that edge.
                </p>
              )}
              {activeTab === 'adjacency' && (
                <p>
                  The Adjacency Matrix <MathInline math="G" /> records direct connectivity between stops. In binary mode,{' '}
                  <MathInline math="G_{ij} = 1" /> if an edge exists from <MathInline math="i" /> to <MathInline math="j" />. In weighted mode, cells represent
                  segment distance in km or estimated travel time in minutes.
                </p>
              )}
              {activeTab === 'degree' && (
                <p>
                  The Degree Matrix <MathInline math="D" /> is a diagonal matrix where each diagonal entry <MathInline math="D_{ii}" /> represents
                  the total number of transit connections incident to stop <MathInline math="i" />.
                </p>
              )}
              {activeTab === 'laplacian' && (
                <p>
                  The Graph Laplacian <MathInline math="L = D - G = A^T A" /> is symmetric and positive semi-definite.
                  Its smallest eigenvalue is always <MathInline math="\lambda_1 = 0" /> (eigenvector <MathInline math="\mathbf{1}" />),
                  and the second eigenvalue <MathInline math="\lambda_2" /> = {laplacianData?.algebraic_connectivity} (Fiedler value)
                  measures network algebraic connectivity!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Linked Network Graph & Stats (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Bi-Directional Highlight Graph
              </h3>
              <span className="text-[11px] text-slate-400">Click edge or row to link</span>
            </div>

            <NetworkGraph
              stops={stops}
              edges={edges}
              selectedEdgeId={selectedEdgeId}
              selectedNodeId={selectedNodeId}
              onSelectEdge={setSelectedEdgeId}
              onSelectNode={setSelectedNodeId}
            />

            {/* Edge Selection Callout */}
            {selectedEdgeId && (
              <div className="mt-3 p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs">
                <div className="font-semibold text-blue-900 flex items-center justify-between">
                  <span>Selected Edge: {selectedEdgeId}</span>
                  <span className="font-mono text-[11px] text-blue-700">Row {selectedRowIndex}</span>
                </div>
                <div className="mt-1 text-slate-600">
                  {(() => {
                    const e = edges.find((item) => item.id === selectedEdgeId);
                    if (!e) return null;
                    const u = stops.find((s) => s.id === e.source)?.name;
                    const v = stops.find((s) => s.id === e.target)?.name;
                    return `${u} (${e.source}) → ${v} (${e.target}) • ${e.distance_km} km • ${e.travel_time_min} mins`;
                  })()}
                </div>
              </div>
            )}
          </div>

          {/* Linear Algebra Subspace Dimension Summary */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-3 text-xs">
            <h3 className="font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Subspace Dimensions & Rank Analysis</span>
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded bg-slate-50 border border-slate-100">
                <span className="text-slate-400 text-[10px] uppercase font-semibold">Matrix Size</span>
                <p className="font-mono font-bold text-slate-800">26 × 16</p>
                <p className="text-[11px] text-slate-500">26 rows, 16 cols</p>
              </div>

              <div className="p-2 rounded bg-slate-50 border border-slate-100">
                <span className="text-slate-400 text-[10px] uppercase font-semibold">Rank(A)</span>
                <p className="font-mono font-bold text-blue-700">15</p>
                <p className="text-[11px] text-slate-500">rank = n - 1</p>
              </div>

              <div className="p-2 rounded bg-slate-50 border border-slate-100">
                <span className="text-slate-400 text-[10px] uppercase font-semibold">Nullspace N(A)</span>
                <p className="font-mono font-bold text-slate-800">dim = 1</p>
                <p className="text-[11px] text-slate-500">Vector (1, 1, ..., 1)</p>
              </div>

              <div className="p-2 rounded bg-slate-50 border border-slate-100">
                <span className="text-slate-400 text-[10px] uppercase font-semibold">Left Nullspace N(Aᵀ)</span>
                <p className="font-mono font-bold text-emerald-700">dim = 11</p>
                <p className="text-[11px] text-slate-500">m - rank = 26 - 15</p>
              </div>
            </div>

            <p className="text-slate-600 text-[11px] leading-relaxed">
              <strong>Transportation Meaning:</strong> In a connected network of 16 stops, exactly
              15 direct connections form a spanning tree that establishes transit access to every stop.
              The remaining 11 edges introduce independent alternative loops (cycles).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
