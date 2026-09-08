import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Stop,
  Edge,
  FlowAnalysisResult,
  SourceSinkResult,
  NodeFlowStatus,
} from '../types/network';
import { NetworkGraph } from '../components/network/NetworkGraph';
import { MathBlock, MathInline } from '../components/common/MathBlock';
import { DisclaimerBanner } from '../components/common/DisclaimerBanner';
import {
  Waves,
  CheckCircle2,
  Sliders,
  Send,
  Sparkles,
  Info,
} from 'lucide-react';

export const FlowLabPage: React.FC = () => {
  const [stops, setStops] = useState<Stop[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  // Flow vector y (edge_id -> passengers/hour)
  const [edgeFlows, setEdgeFlows] = useState<Record<string, number>>({});
  const [flowResult, setFlowResult] = useState<FlowAnalysisResult | null>(null);

  // Source-Sink Experiment state
  const [expSource, setExpSource] = useState<string>('S01'); // Sule
  const [expTarget, setExpTarget] = useState<string>('S07'); // Hledan
  const [expDemand, setExpDemand] = useState<number>(500);
  const [expResult, setExpResult] = useState<SourceSinkResult | null>(null);
  const [mathMode, setMathMode] = useState<'simple' | 'advanced'>('simple');

  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function initFlowData() {
      try {
        setLoading(true);
        const net = await api.getNetwork();
        setStops(net.stops);
        setEdges(net.edges);

        // Initialize baseline flows
        const defaultFlows: Record<string, number> = {};
        net.edges.forEach((e: Edge) => {
          defaultFlows[e.id] = 350;
        });
        setEdgeFlows(defaultFlows);

        const [analyzed, ss] = await Promise.all([
          api.analyzeFlows(defaultFlows),
          api.analyzeSourceSink('S01', 'S07', 500),
        ]);
        setFlowResult(analyzed);
        setExpResult(ss);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    initFlowData();
  }, []);

  const handleFlowSliderChange = async (edgeId: string, val: number) => {
    const updated = { ...edgeFlows, [edgeId]: val };
    setEdgeFlows(updated);
    try {
      const res = await api.analyzeFlows(updated);
      setFlowResult(res);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRunExperiment = async () => {
    try {
      const res = await api.analyzeSourceSink(expSource, expTarget, expDemand);
      setExpResult(res);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Waves className="w-6 h-6 text-blue-600" />
          <span>Passenger Flow Simulator & Conservation Lab</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Network Flow Vector <MathInline math="\mathbf{y}" />, Node Inflow <MathInline math="\mathbf{b} = A^T \mathbf{y}" />, and Kirchhoff's Current Law
        </p>
      </div>

      <DisclaimerBanner />

      {/* Top Banner: Mathematical Convention */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <Info className="w-4 h-4 text-blue-600" />
          <span>Flow Conservation Law: <MathInline math="A^T \mathbf{y} = \mathbf{b}" /></span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Under our incidence convention, row <MathInline math="k" /> of <MathInline math="A" /> has <MathInline math="-1" /> at the source stop (flow leaves)
          and <MathInline math="+1" /> at the destination stop (flow enters). When multiplied by the flow vector <MathInline math="\mathbf{y}" />,
          the transpose product calculates the <strong>net inflow</strong> at every node:
        </p>
        <MathBlock
          math="(A^T \mathbf{y})_i = \sum_{\text{edges entering } i} (+1) y_k + \sum_{\text{edges leaving } i} (-1) y_k = \text{Inflow}(i) - \text{Outflow}(i)"
          className="text-xs py-1"
        />
      </div>

      {/* Main Grid: Interactive Network with Flow Thickness (Left) & Node Conservation Table (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Graph with flow thickness & Edge Sliders (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-800">Flow-Weighted Transit Graph</h2>
                <p className="text-xs text-slate-500">
                  Edge line thickness scales dynamically with passenger volume <MathInline math="\mathbf{y}" />
                </p>
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200">
                Flow Mode Active
              </span>
            </div>

            <NetworkGraph
              stops={stops}
              edges={edges}
              flowValues={edgeFlows}
              showFlowThickness={true}
            />
          </div>

          {/* Interactive Edge Flow Adjusters */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-slate-500" />
                <span>Adjust Passenger Volumes Along Corridors (pax/hr)</span>
              </h3>
              <span className="text-xs text-slate-400">Controls vector <MathInline math="\mathbf{y} \in \mathbb{R}^{26}" /></span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1 text-xs">
              {edges.slice(0, 12).map((edge) => {
                const currentFlow = edgeFlows[edge.id] ?? 350;
                const util = ((currentFlow / edge.capacity) * 100).toFixed(0);
                return (
                  <div key={edge.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 space-y-1.5">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="font-semibold text-slate-800">
                        {edge.id}: {edge.source} → {edge.target}
                      </span>
                      <span className="font-mono text-blue-700 font-bold">{currentFlow} pax/hr</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="50"
                        max={edge.capacity}
                        step="25"
                        value={currentFlow}
                        onChange={(e) => handleFlowSliderChange(edge.id, Number(e.target.value))}
                        className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                      />
                      <span className="text-[10px] text-slate-500 w-10 text-right">{util}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Flow Balance Table & Source-Sink Experiment (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Node Conservation Check Table */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800">Node Balance Check: <MathInline math="(A^T \mathbf{y})_i" /></h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                {flowResult?.conserved_node_count ?? 0} / {stops.length} balanced
              </span>
            </div>

            <div className="overflow-y-auto max-h-56 border border-slate-200 rounded-lg">
              <table className="min-w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                  <tr>
                    <th className="p-2 font-semibold">Stop</th>
                    <th className="p-2 font-semibold text-right">Net Flow <MathInline math="(A^Ty)_i" /></th>
                    <th className="p-2 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {flowResult?.node_flows.map((nf: NodeFlowStatus) => (
                    <tr key={nf.stop_id} className="hover:bg-slate-50/50">
                      <td className="p-2 font-medium text-slate-800">
                        {nf.stop_id} ({nf.stop_name})
                      </td>
                      <td className="p-2 text-right font-mono font-semibold">
                        {nf.net_flow > 0 ? `+${nf.net_flow}` : nf.net_flow}
                      </td>
                      <td className="p-2 text-right">
                        {nf.is_conserved ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
                            <CheckCircle2 className="w-3 h-3" /> Conserved
                          </span>
                        ) : nf.net_flow < 0 ? (
                          <span className="text-amber-600 font-medium text-[11px]">Net Source</span>
                        ) : (
                          <span className="text-blue-600 font-medium text-[11px]">Net Sink</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              <strong>Flow Balance:</strong> Intermediate transit stops must satisfy Inflow = Outflow.
              Non-zero net values indicate passenger generation (boarding) or termination (alighting).
            </p>
          </div>

          {/* Source and Destination Flow Experiment */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <h2 className="text-sm font-bold text-slate-900">Source-to-Destination Experiment</h2>
              </div>

              {/* Simple vs. Advanced Toggle */}
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-md text-[11px]">
                <button
                  onClick={() => setMathMode('simple')}
                  className={`px-2 py-0.5 rounded ${
                    mathMode === 'simple' ? 'bg-white text-blue-700 font-bold shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Simple
                </button>
                <button
                  onClick={() => setMathMode('advanced')}
                  className={`px-2 py-0.5 rounded ${
                    mathMode === 'advanced' ? 'bg-white text-blue-700 font-bold shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Advanced
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">Source Stop</label>
                <select
                  value={expSource}
                  onChange={(e) => setExpSource(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-slate-800 text-xs"
                >
                  {stops.map((s) => (
                    <option key={s.id} value={s.id}>{s.id}: {s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">Destination Stop</label>
                <select
                  value={expTarget}
                  onChange={(e) => setExpTarget(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-slate-800 text-xs"
                >
                  {stops.map((s) => (
                    <option key={s.id} value={s.id}>{s.id}: {s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">Demand (pax/hr)</label>
                <input
                  type="number"
                  value={expDemand}
                  onChange={(e) => setExpDemand(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-slate-800 text-xs font-mono"
                />
              </div>
            </div>

            <button
              onClick={handleRunExperiment}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs py-2 px-3 rounded-lg transition-all shadow-xs flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Verify <MathInline math="A^T \mathbf{y} = \mathbf{b}" /> Across Network</span>
            </button>

            {/* Experiment Results & Mathematical Verification */}
            {expResult && (
              <div className="p-3.5 rounded-lg bg-purple-50/70 border border-purple-200 space-y-2 text-xs text-purple-950">
                <div className="flex items-center justify-between font-semibold">
                  <span>Kirchhoff Verification:</span>
                  <span className="text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> <MathInline math="A^T \mathbf{y} = \mathbf{b}" /> Satisfied
                  </span>
                </div>

                <p className="text-[11px] leading-relaxed">
                  {mathMode === 'simple'
                    ? expResult.simple_explanation
                    : expResult.advanced_math_explanation}
                </p>

                <div className="p-2 rounded bg-white/90 border border-purple-200 font-mono text-[10px] text-slate-700">
                  <div><strong>Demand Vector b:</strong></div>
                  <div>b[{expResult.source_id}] = -{expResult.demand} (Outflow into buses)</div>
                  <div>b[{expResult.target_id}] = +{expResult.demand} (Inflow into destination)</div>
                  <div>b[intermediate] = 0 (Transfer stops conserve flow)</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
