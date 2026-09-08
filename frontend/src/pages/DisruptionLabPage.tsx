import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Stop,
  Edge,
  DisruptionResult,
} from '../types/network';
import { NetworkGraph } from '../components/network/NetworkGraph';
import { MetricCard } from '../components/common/MetricCard';
import { DisclaimerBanner } from '../components/common/DisclaimerBanner';
import { MathInline } from '../components/common/MathBlock';
import {
  ShieldAlert,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  ArrowRightLeft,
  Binary,
  Network,
  Clock,
  Eye,
} from 'lucide-react';

export const DisruptionLabPage: React.FC = () => {
  const [stops, setStops] = useState<Stop[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  const [disabledStopIds, setDisabledStopIds] = useState<string[]>([]);
  const [disabledEdgeIds, setDisabledEdgeIds] = useState<string[]>([]);
  const [disruptionResult, setDisruptionResult] = useState<DisruptionResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const net = await api.getNetwork();
        setStops(net.stops);
        setEdges(net.edges);

        const dis = await api.analyzeDisruption([], []);
        setDisruptionResult(dis);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleToggleStop = async (stopId: string) => {
    const isCurrentlyDisabled = disabledStopIds.includes(stopId);
    const updated = isCurrentlyDisabled
      ? disabledStopIds.filter((id) => id !== stopId)
      : [...disabledStopIds, stopId];

    setDisabledStopIds(updated);
    try {
      const dis = await api.analyzeDisruption(updated, disabledEdgeIds);
      setDisruptionResult(dis);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleEdge = async (edgeId: string) => {
    const isCurrentlyDisabled = disabledEdgeIds.includes(edgeId);
    const updated = isCurrentlyDisabled
      ? disabledEdgeIds.filter((id) => id !== edgeId)
      : [...disabledEdgeIds, edgeId];

    setDisabledEdgeIds(updated);
    try {
      const dis = await api.analyzeDisruption(disabledStopIds, updated);
      setDisruptionResult(dis);
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetNetwork = async () => {
    setDisabledStopIds([]);
    setDisabledEdgeIds([]);
    try {
      const dis = await api.analyzeDisruption([], []);
      setDisruptionResult(dis);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-600" />
            <span>Network Disruption & Resilience Lab</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Simulate Station/Road Closures and Observe Real-Time Linear Algebra Rank & Topology Impacts
          </p>
        </div>

        {/* Reset Button */}
        <button
          onClick={handleResetNetwork}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all shadow-xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Network</span>
        </button>
      </div>

      <DisclaimerBanner />

      {/* Disconnection Warning Alert */}
      {disruptionResult?.disruption.network_severed && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold text-sm block">Network Severed into Multiple Components!</strong>
            <p className="mt-1 leading-relaxed">
              The closure of critical hubs has broken transit connectivity. The number of connected components has
              increased to {disruptionResult.after.components}, and <MathInline math="\operatorname{rank}(A)" /> dropped from{' '}
              {disruptionResult.before.rank} to {disruptionResult.after.rank}. Passengers cannot travel between
              disjoint areas without external detours.
            </p>
          </div>
        </div>
      )}

      {/* Side-by-Side Comparison (BEFORE vs. AFTER) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* BEFORE CARD */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
              <span>Baseline Network (Before Disruption)</span>
            </h2>
            <span className="text-xs font-semibold text-slate-700">Normal Operations</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 text-[10px] uppercase font-semibold">Nodes (Stops)</span>
              <p className="text-lg font-bold text-slate-900">{disruptionResult?.before.num_nodes ?? 16}</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 text-[10px] uppercase font-semibold">Edges (Segments)</span>
              <p className="text-lg font-bold text-slate-900">{disruptionResult?.before.num_edges ?? 26}</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 text-[10px] uppercase font-semibold">Incidence Rank</span>
              <p className="text-lg font-bold text-blue-700">{disruptionResult?.before.rank ?? 15}</p>
              <span className="text-[10px] text-slate-500">n - 1</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 text-[10px] uppercase font-semibold">Components</span>
              <p className="text-lg font-bold text-emerald-700">{disruptionResult?.before.components ?? 1}</p>
              <span className="text-[10px] text-slate-500">Connected</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 text-[10px] uppercase font-semibold">Cycle Dim</span>
              <p className="text-lg font-bold text-purple-700">{disruptionResult?.before.nullity_At ?? 11}</p>
              <span className="text-[10px] text-slate-500">m - rank</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 text-[10px] uppercase font-semibold">Benchmark Route</span>
              <p className="text-lg font-bold text-slate-900">
                {disruptionResult?.before.benchmark_route_time ?? 40} m
              </p>
              <span className="text-[10px] text-slate-500">Sule → Insein</span>
            </div>
          </div>
        </div>

        {/* AFTER CARD */}
        <div className={`p-5 rounded-xl border shadow-2xs space-y-4 transition-all ${
          disruptionResult?.disruption.network_severed
            ? 'bg-red-50/30 border-red-200'
            : 'bg-white border-slate-200/80'
        }`}>
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${
                disabledStopIds.length > 0 || disabledEdgeIds.length > 0 ? 'bg-red-600 animate-pulse' : 'bg-slate-400'
              }`}></span>
              <span>Disrupted Network (After Closures)</span>
            </h2>
            <span className={`text-xs font-semibold ${
              disabledStopIds.length > 0 ? 'text-red-700 font-bold' : 'text-slate-700'
            }`}>
              {disabledStopIds.length} stops, {disabledEdgeIds.length} roads closed
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-white border border-slate-200/70">
              <span className="text-slate-400 text-[10px] uppercase font-semibold">Active Nodes</span>
              <p className="text-lg font-bold text-slate-900">{disruptionResult?.after.num_nodes ?? 16}</p>
              <span className="text-[10px] text-red-600 font-medium">
                -{disruptionResult?.disruption.removed_nodes_count ?? 0}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-white border border-slate-200/70">
              <span className="text-slate-400 text-[10px] uppercase font-semibold">Active Edges</span>
              <p className="text-lg font-bold text-slate-900">{disruptionResult?.after.num_edges ?? 26}</p>
              <span className="text-[10px] text-red-600 font-medium">
                -{disruptionResult?.disruption.removed_edges_count ?? 0}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-white border border-slate-200/70">
              <span className="text-slate-400 text-[10px] uppercase font-semibold">Incidence Rank</span>
              <p className="text-lg font-bold text-blue-700">{disruptionResult?.after.rank ?? 15}</p>
              <span className="text-[10px] text-slate-500">n - c</span>
            </div>
            <div className="p-3 rounded-lg bg-white border border-slate-200/70">
              <span className="text-slate-400 text-[10px] uppercase font-semibold">Components</span>
              <p className={`text-lg font-bold ${
                (disruptionResult?.after.components ?? 1) > 1 ? 'text-red-600' : 'text-emerald-700'
              }`}>
                {disruptionResult?.after.components ?? 1}
              </p>
              <span className="text-[10px] text-slate-500">
                {(disruptionResult?.after.components ?? 1) > 1 ? 'Disconnected' : 'Connected'}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-white border border-slate-200/70">
              <span className="text-slate-400 text-[10px] uppercase font-semibold">Cycle Dim</span>
              <p className="text-lg font-bold text-purple-700">{disruptionResult?.after.nullity_At ?? 11}</p>
              <span className="text-[10px] text-slate-500">m - rank</span>
            </div>
            <div className="p-3 rounded-lg bg-white border border-slate-200/70">
              <span className="text-slate-400 text-[10px] uppercase font-semibold">Benchmark Route</span>
              <p className="text-lg font-bold text-slate-900">
                {disruptionResult?.after.benchmark_route_found
                  ? `${disruptionResult.after.benchmark_route_time} m`
                  : 'Blocked'}
              </p>
              <span className="text-[10px] text-slate-500">Sule → Insein</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Closure Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Disrupted Network Canvas (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800">Visual Disrupted Topology</h2>
            <span className="text-xs text-slate-400">Red elements mark closed transit stations</span>
          </div>

          <NetworkGraph
            stops={stops}
            edges={edges}
            disabledStopIds={disabledStopIds}
            disabledEdgeIds={disabledEdgeIds}
          />
        </div>

        {/* Closure Controls (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-600" />
            <span>Interactive Stop Disruption Toggles</span>
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Click any bus stop below to simulate a flood, road repair, or emergency station closure:
          </p>

          <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
            {stops.map((s) => {
              const isDisabled = disabledStopIds.includes(s.id);
              return (
                <button
                  key={s.id}
                  onClick={() => handleToggleStop(s.id)}
                  className={`p-2 rounded-lg border text-left text-xs transition-all flex items-center justify-between ${
                    isDisabled
                      ? 'bg-red-50 border-red-300 text-red-800 font-bold shadow-2xs'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <span className="truncate">{s.name}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      isDisabled ? 'bg-red-200 text-red-900' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isDisabled ? 'CLOSED' : s.id}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Scenario Buttons */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Suggested Test Scenarios
            </span>
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                onClick={() => handleToggleStop('S07')}
                className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium"
              >
                Close Hledan (S07)
              </button>
              <button
                onClick={() => handleToggleStop('S04')}
                className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium"
              >
                Close Myaynigone (S04)
              </button>
              <button
                onClick={() => handleToggleStop('S15')}
                className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium"
              >
                Close Bayint Naung (S15)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
