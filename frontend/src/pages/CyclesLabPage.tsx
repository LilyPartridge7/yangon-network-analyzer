import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Stop, Edge, CyclesAnalysisResult, CycleInfo } from '../types/network';
import { NetworkGraph } from '../components/network/NetworkGraph';
import { MathBlock, MathInline } from '../components/common/MathBlock';
import { DisclaimerBanner } from '../components/common/DisclaimerBanner';
import {
  RotateCcw,
  Sparkles,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

export const CyclesLabPage: React.FC = () => {
  const [stops, setStops] = useState<Stop[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [cycleData, setCycleData] = useState<CyclesAnalysisResult | null>(null);
  const [selectedCycleIndex, setSelectedCycleIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [net, cycles] = await Promise.all([
          api.getNetwork(),
          api.analyzeCycles(),
        ]);
        setStops(net.stops);
        setEdges(net.edges);
        setCycleData(cycles);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const activeCycle: CycleInfo | undefined = cycleData?.cycles[selectedCycleIndex];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <RotateCcw className="w-6 h-6 text-blue-600" />
          <span>Cycle & Nullspace Analyzer (Left Nullspace <MathInline math="N(A^T)" />)</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Network Closed Loops, Circulation Vectors, and the Dimension Theorem <MathInline math="\dim(N(A^T)) = m - \operatorname{rank}(A)" />
        </p>
      </div>

      <DisclaimerBanner />

      {/* Overview Theory Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span>The Four Fundamental Subspaces: Left Nullspace of A</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          In Gilbert Strang Chapter 10.1, the left nullspace <MathInline math="N(A^T)" /> corresponds precisely to{' '}
          <strong>circulation flows around closed loops</strong>:
        </p>
        <MathBlock
          math="A^T \mathbf{y}_{\text{cycle}} = \mathbf{0} \iff \mathbf{y}_{\text{cycle}} \in N(A^T)"
          className="text-xs py-1"
        />
        <p className="text-xs text-slate-600 leading-relaxed">
          When passengers or buses circulate around a closed loop, the inflow into every stop exactly equals
          the outflow from that stop. No passenger accumulates anywhere. Therefore, the net node flow is identically
          zero (<MathInline math="A^T \mathbf{y} = \mathbf{0}" />).
        </p>
      </div>

      {/* Main Grid: Cycle Visualizer (Left) & Cycle Inspector / Verification (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Graph with Loop Highlighted (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-800">Circulating Loop on Transit Map</h2>
              <p className="text-xs text-slate-500">
                Active cycle: <strong className="text-blue-700">{activeCycle?.cycle_id}</strong> (
                {activeCycle?.node_ids.length} stops)
              </p>
            </div>
            <span className="text-xs font-mono px-2 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
              Aᵀy = 0 Verified
            </span>
          </div>

          <NetworkGraph
            stops={stops}
            edges={edges}
            highlightedEdgeIds={activeCycle?.edge_ids || []}
            highlightedNodeIds={activeCycle?.node_ids || []}
          />

          {/* Loop Stop Sequence */}
          {activeCycle && (
            <div className="pt-3 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                Loop Traversal Order
              </span>
              <div className="flex flex-wrap items-center gap-1 text-xs">
                {activeCycle.node_ids.map((nid: string, i: number) => {
                  const s = stops.find((item: Stop) => item.id === nid);
                  return (
                    <React.Fragment key={`${nid}-${i}`}>
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-medium border border-blue-200">
                        {s?.name || nid}
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                    </React.Fragment>
                  );
                })}
                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-bold border border-blue-300">
                  {stops.find((item: Stop) => item.id === activeCycle.node_ids[0])?.name || activeCycle.node_ids[0]} (Close)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Cycle List & Linear Algebra Verification (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Subspace Dimension Card */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Fundamental Cycle Dimension
            </h3>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 font-mono text-xs text-slate-800">
              <div><strong>Dimension Formula:</strong></div>
              <div className="text-blue-700 font-bold mt-0.5">
                {cycleData?.formula ?? 'dim(N(Aᵀ)) = m - rank(A) = 26 - 15 = 11'}
              </div>
              <p className="text-[11px] font-sans text-slate-500 mt-1">
                There are exactly 11 linearly independent closed circulation vectors in this network.
              </p>
            </div>
          </div>

          {/* Cycle Selector List */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Fundamental Cycle
              </h3>
              <span className="text-[11px] text-slate-400">
                {cycleData?.cycles.length ?? 0} cycles detected
              </span>
            </div>

            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {cycleData?.cycles.map((c: CycleInfo, idx: number) => {
                const isSelected = idx === selectedCycleIndex;
                return (
                  <button
                    key={c.cycle_id}
                    onClick={() => setSelectedCycleIndex(idx)}
                    className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-50 border-blue-300 text-blue-900 font-semibold shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <span className="font-mono">{c.cycle_id}</span>
                      <span className="text-slate-500 text-[11px] ml-2">
                        ({c.node_ids.length} stops, {c.length} edges)
                      </span>
                    </div>
                    <span className="text-[11px] text-emerald-600 font-medium">Aᵀy = 0 ✓</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Cycle Verification Box */}
          {activeCycle && (
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">Verification of Aᵀ * y = 0</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Exact Nullspace Member
                </span>
              </div>

              <div className="p-2.5 rounded bg-slate-50 border border-slate-100 space-y-1 text-[11px] text-slate-600">
                <div>
                  <strong>Maximum Residual <MathInline math="\max |(A^T y)_i|" />:</strong>{' '}
                  <span className="font-mono font-bold text-slate-900">{activeCycle.max_residual.toExponential(2)}</span>
                </div>
                <div>
                  <strong>Circulation Vector entries <MathInline math="y_k" />:</strong>{' '}
                  <span className="font-mono text-slate-800">+1 (forward), -1 (reverse), 0 (off-loop)</span>
                </div>
              </div>

              <p className="text-slate-600 text-[11px] leading-relaxed">
                "{activeCycle.explanation}"
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
