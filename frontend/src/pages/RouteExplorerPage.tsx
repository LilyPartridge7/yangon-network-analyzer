import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Stop, Edge, RouteResult } from '../types/network';
import { NetworkGraph } from '../components/network/NetworkGraph';
import { MatrixTable } from '../components/matrix/MatrixTable';
import { MathBlock, MathInline } from '../components/common/MathBlock';
import { DisclaimerBanner } from '../components/common/DisclaimerBanner';
import {
  Route,
  Navigation,
  Clock,
  Milestone,
  Layers,
  ArrowRight,
  Sparkles,
  Info,
  CheckCircle2,
} from 'lucide-react';

export const RouteExplorerPage: React.FC = () => {
  const [stops, setStops] = useState<Stop[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [origin, setOrigin] = useState<string>('S01'); // Sule
  const [destination, setDestination] = useState<string>('S16'); // Insein
  const [criterion, setCriterion] = useState<string>('time');

  const [routeResult, setRouteResult] = useState<RouteResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadNetwork() {
      try {
        const net = await api.getNetwork();
        setStops(net.stops);
        setEdges(net.edges);
      } catch (err) {
        console.error(err);
      }
    }
    loadNetwork();
  }, []);

  const handleComputeRoute = async () => {
    if (!origin || !destination) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.computeRoute(origin, destination, criterion);
      setRouteResult(res);
    } catch (err: any) {
      setError(err.message || 'Route computation failed');
      setRouteResult(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (stops.length > 0) {
      handleComputeRoute();
    }
  }, [origin, destination, criterion, stops.length]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Route className="w-6 h-6 text-blue-600" />
          <span>Route Explorer</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Dijkstra Shortest Path & Linear Algebra Path Submatrix Decomposition
        </p>
      </div>

      <DisclaimerBanner />

      {/* Control Selector Panel */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          {/* Origin */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Origin Stop (Starting Node)
            </label>
            <select
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {stops.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.id}: {s.name} ({s.area})
                </option>
              ))}
            </select>
          </div>

          {/* Destination */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Destination Stop (Target Node)
            </label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {stops.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.id}: {s.name} ({s.area})
                </option>
              ))}
            </select>
          </div>

          {/* Optimization Criterion */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Optimization Objective
            </label>
            <select
              value={criterion}
              onChange={(e) => setCriterion(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="time">Fastest Travel Time (mins)</option>
              <option value="distance">Shortest Physical Distance (km)</option>
              <option value="stops">Fewest Edges / Stops</option>
            </select>
          </div>

          {/* Action */}
          <div>
            <button
              onClick={handleComputeRoute}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 px-4 rounded-lg transition-all shadow-xs flex items-center justify-center gap-2"
            >
              <Navigation className="w-4 h-4" />
              <span>{loading ? 'Routing...' : 'Calculate Route'}</span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
          {error}
        </div>
      )}

      {/* Main Grid: Graph with Path Highlight (Left) & Metrics/Linear Algebra (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Highlighted Graph (6 cols) */}
        <div className="lg:col-span-6 bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800">Visual Route Traversal</h2>
            <span className="text-xs text-slate-500 font-mono">
              {routeResult?.stops?.length ?? 0} stops • {routeResult?.edges?.length ?? 0} segments
            </span>
          </div>

          <NetworkGraph
            stops={stops}
            edges={edges}
            highlightedEdgeIds={routeResult?.edges || []}
            highlightedNodeIds={routeResult?.stops || []}
          />

          {/* Path Timeline */}
          {routeResult?.found && (
            <div className="pt-3 border-t border-slate-100">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Sequence of Stops & Transfers
              </h3>
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                {routeResult.stops?.map((stopId: string, idx: number) => {
                  const stopObj = stops.find((s) => s.id === stopId);
                  const isFirst = idx === 0;
                  const isLast = idx === (routeResult.stops?.length ?? 0) - 1;
                  return (
                    <React.Fragment key={stopId}>
                      <span
                        className={`px-2.5 py-1 rounded-md font-medium ${
                          isFirst
                            ? 'bg-blue-600 text-white font-bold'
                            : isLast
                            ? 'bg-emerald-600 text-white font-bold'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {stopObj?.name || stopId} ({stopId})
                      </span>
                      {idx < (routeResult.stops?.length ?? 0) - 1 && (
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Route Summary & Linear Algebra Decomposition (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Estimated Time</span>
              <p className="text-xl font-bold text-slate-900 mt-1 flex items-baseline gap-1">
                <span>{routeResult?.total_travel_time_min ?? 0}</span>
                <span className="text-xs font-normal text-slate-500">mins</span>
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Total Distance</span>
              <p className="text-xl font-bold text-slate-900 mt-1 flex items-baseline gap-1">
                <span>{routeResult?.total_distance_km ?? 0}</span>
                <span className="text-xs font-normal text-slate-500">km</span>
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Segments / Edges</span>
              <p className="text-xl font-bold text-slate-900 mt-1 flex items-baseline gap-1">
                <span>{routeResult?.edge_count ?? 0}</span>
                <span className="text-xs font-normal text-slate-500">hops</span>
              </p>
            </div>
          </div>

          {/* "Linear Algebra Behind This Route" Panel */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4.5 h-4.5 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">Linear Algebra Behind This Route</h2>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              In Gilbert Strang Section 10.1, a path from node \(s\) to node \(t\) corresponds to a sequence
              of rows in the incidence matrix \(A\).
            </p>

            {/* Path Submatrix */}
            {routeResult?.linear_algebra?.submatrix && routeResult.linear_algebra.submatrix.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">Path Submatrix of Incidence Matrix A</span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {routeResult.linear_algebra.row_labels.length} edges ×{' '}
                    {routeResult.linear_algebra.col_labels.length} nodes
                  </span>
                </div>

                <MatrixTable
                  matrix={routeResult.linear_algebra.submatrix}
                  rowLabels={routeResult.linear_algebra.row_labels}
                  colLabels={routeResult.linear_algebra.col_labels}
                  dense
                />
              </div>
            )}

            {/* Telescoping Sum Proof */}
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
              <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Algebraic Telescoping Cancellation</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                Notice what happens when we add the incidence rows along this path:
              </p>

              <MathBlock
                math="\sum_{k \in \text{path}} \text{row}_k(A) = (-1 \mathbf{e}_{\text{origin}}) + (+1 \mathbf{e}_{\text{destination}})"
                className="text-xs py-1"
              />

              <p className="text-slate-600 text-[11px] leading-relaxed">
                At every intermediate stop, an edge enters (\(+1\)) and the next edge leaves (\(-1\)), so
                \((+1) + (-1) = 0\)! All intermediate stops vanish algebraically, leaving only the origin
                (\(-1\)) and destination (\(+1\)).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
