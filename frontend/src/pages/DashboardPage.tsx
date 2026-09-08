import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Stop, Edge, NetworkStats } from '../types/network';
import { MetricCard } from '../components/common/MetricCard';
import { DisclaimerBanner } from '../components/common/DisclaimerBanner';
import { NetworkGraph } from '../components/network/NetworkGraph';
import { LeafletMapView } from '../components/network/LeafletMapView';
import {
  MapPin,
  ArrowRightLeft,
  Clock,
  Network,
  Binary,
  RotateCcw,
  Sparkles,
  Map,
  Compass,
} from 'lucide-react';

interface DashboardPageProps {
  onNavigateToMatrix?: () => void;
  onNavigateToFlow?: () => void;
  onNavigateToTheory?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = () => {
  const [stops, setStops] = useState<Stop[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [stats, setStats] = useState<NetworkStats | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'network' | 'map'>('network');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [netData, statsData] = await Promise.all([
          api.getNetwork(),
          api.getNetworkStats(),
        ]);
        setStops(netData.stops);
        setEdges(netData.edges);
        setStats(statsData);
      } catch (err: any) {
        setError(err.message || 'Failed to load network data');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Yangon Bus Transportation Network Analyzer
        </h1>
        <p className="text-sm font-medium text-slate-500 mt-1">
          Graphs • Incidence Matrices • Network Flow (Gilbert Strang, Chapter 10.1)
        </p>
      </div>

      <DisclaimerBanner />

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
          {error}
        </div>
      )}

      {/* Primary Linear Algebra Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard
          title="Stops (Nodes)"
          value={stats?.num_nodes ?? stops.length}
          formula="n = 16"
          icon={MapPin}
          subtitle="Matrix Columns"
          badge="Nodes"
          badgeColor="blue"
        />
        <MetricCard
          title="Direct Segments"
          value={stats?.num_edges ?? edges.length}
          formula="m = 26"
          icon={ArrowRightLeft}
          subtitle="Matrix Rows"
          badge="Edges"
          badgeColor="slate"
        />
        <MetricCard
          title="Avg Travel Time"
          value={`${stats?.avg_travel_time_min ?? 11.2} m`}
          icon={Clock}
          subtitle="Edge Weights"
          badge="Weights"
          badgeColor="amber"
        />
        <MetricCard
          title="Components"
          value={stats?.num_connected_components ?? 1}
          formula="c = 1"
          icon={Network}
          subtitle={stats?.is_connected ? 'Fully Connected' : 'Disconnected'}
          badge={stats?.is_connected ? 'Connected' : 'Warning'}
          badgeColor={stats?.is_connected ? 'emerald' : 'amber'}
        />
        <MetricCard
          title="Matrix Rank"
          value={stats?.rank ?? 15}
          formula="rank(A) = n - 1"
          icon={Binary}
          subtitle="Independent nodes"
          badge="r = 15"
          badgeColor="purple"
        />
        <MetricCard
          title="Cycle Space"
          value={stats?.nullity_At_cycle_space ?? 11}
          formula="m - r = 11"
          icon={RotateCcw}
          subtitle="dim(N(Aᵀ))"
          badge="Cycles"
          badgeColor="emerald"
        />
      </div>

      {/* Main Network Visualizer & Educational Translation Card */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Visualizer Canvas (3 cols) */}
        <div className="lg:col-span-3 bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-800">Yangon Transit Topology</h2>
              <p className="text-xs text-slate-500">
                Click any bus stop or route edge to highlight corresponding rows and nodes
              </p>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
              <button
                onClick={() => setViewMode('network')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all ${
                  viewMode === 'network'
                    ? 'bg-white text-blue-700 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Force Graph</span>
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all ${
                  viewMode === 'map'
                    ? 'bg-white text-blue-700 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Map className="w-3.5 h-3.5" />
                <span>Geographic Map</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="h-[520px] flex items-center justify-center text-xs text-slate-400">
              Loading Yangon transit graph...
            </div>
          ) : viewMode === 'network' ? (
            <NetworkGraph
              stops={stops}
              edges={edges}
              selectedEdgeId={selectedEdgeId}
              selectedNodeId={selectedNodeId}
              onSelectEdge={setSelectedEdgeId}
              onSelectNode={setSelectedNodeId}
            />
          ) : (
            <LeafletMapView
              stops={stops}
              edges={edges}
              selectedEdgeId={selectedEdgeId}
              selectedNodeId={selectedNodeId}
              onSelectEdge={setSelectedEdgeId}
              onSelectNode={setSelectedNodeId}
            />
          )}

          {/* Selection details footer */}
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <div>
              {selectedEdgeId ? (
                <span>
                  Selected Edge:{' '}
                  <strong className="text-slate-800 font-mono font-semibold">{selectedEdgeId}</strong>
                </span>
              ) : selectedNodeId ? (
                <span>
                  Selected Stop:{' '}
                  <strong className="text-slate-800 font-semibold">
                    {stops.find((s) => s.id === selectedNodeId)?.name} ({selectedNodeId})
                  </strong>
                </span>
              ) : (
                <span>Hover or click elements to inspect attributes</span>
              )}
            </div>
            <div className="text-[11px] text-slate-400">
              {stats?.explanation.slice(0, 95)}...
            </div>
          </div>
        </div>

        {/* Educational Translation Panel: "How is this Linear Algebra?" */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-4 flex flex-col">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">How is this Linear Algebra?</h2>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Gilbert Strang Section 10.1 models transportation networks directly using the fundamental
            subspaces of the incidence matrix \(A\).
          </p>

          <div className="space-y-3 flex-1 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1">
                <span>Bus Stops (16)</span>
                <span className="font-mono text-blue-600 font-bold">Columns of A</span>
              </div>
              <p className="text-slate-700">
                Each stop corresponds to a column in \(A\). Potentials \(x_i\) represent stop values.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1">
                <span>Transit Roads (26)</span>
                <span className="font-mono text-blue-600 font-bold">Rows of A</span>
              </div>
              <p className="text-slate-700">
                Each segment has \(-1\) at source, \(+1\) at destination, and \(0\) elsewhere.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1">
                <span>Passenger Flows</span>
                <span className="font-mono text-emerald-600 font-bold">Vector y ∈ ℝᵐ</span>
              </div>
              <p className="text-slate-700">
                Number of passengers traveling along each road segment per hour.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1">
                <span>Conservation Law</span>
                <span className="font-mono text-purple-600 font-bold">Aᵀy = b</span>
              </div>
              <p className="text-slate-700">
                At intermediate stops, net accumulation is zero. At origins/destinations, it equals demand.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1">
                <span>Network Loops</span>
                <span className="font-mono text-amber-600 font-bold">Aᵀy = 0</span>
              </div>
              <p className="text-slate-700">
                Circulation vectors form the Left Nullspace \(N(A^T)\). Dimension is \(m - r = 11\).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
