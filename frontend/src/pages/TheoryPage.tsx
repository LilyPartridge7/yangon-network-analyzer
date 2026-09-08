import React, { useState } from 'react';
import { MathBlock, MathInline } from '../components/common/MathBlock';
import { DisclaimerBanner } from '../components/common/DisclaimerBanner';
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  ArrowRight,
  Layers,
  Network,
  CheckCircle2,
} from 'lucide-react';

export const TheoryPage: React.FC = () => {
  // 4-Node Mini Example State
  const [selectedMiniEdge, setSelectedMiniEdge] = useState<number | null>(null);

  const miniNodes = [
    { id: '1', name: 'Sule (Origin)', x: 60, y: 150 },
    { id: '2', name: 'Hledan (West)', x: 190, y: 70 },
    { id: '3', name: 'Tamwe (East)', x: 190, y: 230 },
    { id: '4', name: 'Junction (Dest)', x: 320, y: 150 },
  ];

  const miniEdges = [
    { id: 0, label: 'e1: Sule → Hledan', source: '1', target: '2', row: [-1, 1, 0, 0], desc: 'Leaves Sule (-1), enters Hledan (+1)' },
    { id: 1, label: 'e2: Sule → Tamwe', source: '1', target: '3', row: [-1, 0, 1, 0], desc: 'Leaves Sule (-1), enters Tamwe (+1)' },
    { id: 2, label: 'e3: Hledan → Junction', source: '2', target: '4', row: [0, -1, 0, 1], desc: 'Leaves Hledan (-1), enters Junction (+1)' },
    { id: 3, label: 'e4: Tamwe → Junction', source: '3', target: '4', row: [0, 0, -1, 1], desc: 'Leaves Tamwe (-1), enters Junction (+1)' },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-blue-600" />
          <span>Linear Algebra Behind Transportation Networks</span>
        </h1>
        <p className="text-sm font-medium text-slate-500 mt-1">
          Gilbert Strang, <em>Introduction to Linear Algebra (5th Edition)</em>, Section 10.1: Graphs and Networks
        </p>
      </div>

      <DisclaimerBanner />

      {/* SECTION 21: INTERACTIVE 4-NODE MINI EDUCATIONAL MODEL */}
      <div className="bg-white p-6 rounded-2xl border border-blue-200/80 shadow-xs space-y-6 ring-4 ring-blue-50/50">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">
              Interactive 4-Node Educational Example (Strang Section 10.1)
            </h2>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800">
            Educational Model
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Consider a miniature network with \(n = 4\) bus stops and \(m = 4\) directed transit segments.
          Click any edge in the diagram or row in the incidence matrix to see the exact correspondence:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Mini SVG Graph */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 flex flex-col items-center">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              4-Node Transit Graph
            </span>
            <svg width="380" height="300" className="overflow-visible">
              <defs>
                <marker
                  id="mini-arrow"
                  viewBox="0 -5 10 10"
                  refX="20"
                  refY="0"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto"
                >
                  <path d="M0,-5L10,0L0,5" fill="#475569" />
                </marker>
                <marker
                  id="mini-arrow-active"
                  viewBox="0 -5 10 10"
                  refX="22"
                  refY="0"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto"
                >
                  <path d="M0,-5L10,0L0,5" fill="#2563eb" />
                </marker>
              </defs>

              {/* Mini Edges */}
              {miniEdges.map((e) => {
                const s = miniNodes.find((n) => n.id === e.source)!;
                const t = miniNodes.find((n) => n.id === e.target)!;
                const isActive = selectedMiniEdge === e.id;
                return (
                  <g key={e.id} onClick={() => setSelectedMiniEdge(isActive ? null : e.id)} className="cursor-pointer">
                    <line
                      x1={s.x}
                      y1={s.y}
                      x2={t.x}
                      y2={t.y}
                      stroke={isActive ? '#2563eb' : '#94a3b8'}
                      strokeWidth={isActive ? 3.5 : 2}
                      markerEnd={isActive ? 'url(#mini-arrow-active)' : 'url(#mini-arrow)'}
                    />
                    <text
                      x={(s.x + t.x) / 2 + (e.id % 2 === 0 ? -12 : 12)}
                      y={(s.y + t.y) / 2 + (e.id < 2 ? -8 : 14)}
                      fontSize="10"
                      fontFamily="JetBrains Mono"
                      fontWeight="bold"
                      fill={isActive ? '#1d4ed8' : '#64748b'}
                    >
                      e{e.id + 1}
                    </text>
                  </g>
                );
              })}

              {/* Mini Nodes */}
              {miniNodes.map((n) => (
                <g key={n.id} transform={`translate(${n.x},${n.y})`}>
                  <circle
                    r="14"
                    fill="#ffffff"
                    stroke="#1e293b"
                    strokeWidth="2"
                    filter="drop-shadow(0 1px 2px rgb(0 0 0 / 0.1))"
                  />
                  <text textAnchor="middle" dy="0.35em" fontSize="10" fontWeight="bold" fill="#0f172a">
                    {n.id}
                  </text>
                  <text textAnchor="middle" dy="24" fontSize="10" fill="#334155" fontWeight="500">
                    {n.name}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          {/* Mini Incidence Matrix Table */}
          <div className="space-y-3">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Incidence Matrix <MathInline math="A \in \mathbb{R}^{4 \times 4}" />
            </span>

            <div className="border border-slate-200 rounded-xl overflow-hidden font-mono text-xs shadow-2xs">
              <table className="min-w-full text-center">
                <thead className="bg-slate-100 border-b border-slate-200 text-slate-600">
                  <tr>
                    <th className="p-2 text-[10px] text-left">Edge \ Node</th>
                    <th className="p-2">Node 1</th>
                    <th className="p-2">Node 2</th>
                    <th className="p-2">Node 3</th>
                    <th className="p-2">Node 4</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {miniEdges.map((e) => {
                    const isActive = selectedMiniEdge === e.id;
                    return (
                      <tr
                        key={e.id}
                        onClick={() => setSelectedMiniEdge(isActive ? null : e.id)}
                        className={`cursor-pointer transition-colors ${
                          isActive ? 'bg-blue-100/90 text-blue-950 font-bold' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="p-2 text-left font-semibold text-slate-700">{e.label}</td>
                        {e.row.map((val, idx) => (
                          <td
                            key={idx}
                            className={`p-2 ${
                              val === -1
                                ? 'text-amber-700 font-bold'
                                : val === 1
                                ? 'text-blue-700 font-bold'
                                : 'text-slate-300'
                            }`}
                          >
                            {val === 1 ? '+1' : val === -1 ? '-1' : '0'}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Explanation of Selected Row */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
              {selectedMiniEdge !== null ? (
                <div>
                  <strong className="text-blue-700">{miniEdges[selectedMiniEdge].label}:</strong>{' '}
                  {miniEdges[selectedMiniEdge].desc}.
                </div>
              ) : (
                <span className="text-slate-400">
                  Click any matrix row or graph edge above to inspect its linear algebra definition.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CORE THEORETICAL MODULES (STRANG 10.1) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        {/* Module 1: The Incidence Matrix A */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>1. The Incidence Matrix A</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            For a network with \(n\) nodes and \(m\) directed edges, \(A\) has \(m\) rows and \(n\) columns.
            For each edge \(e_k = (i \to j)\):
          </p>
          <MathBlock
            math="A_{k, i} = -1 \quad (\text{leaves } i), \qquad A_{k, j} = +1 \quad (\text{enters } j)"
          />
          <p className="text-slate-600 leading-relaxed">
            The columns of \(A\) always add to the zero vector \(\mathbf{0}\) because every row contains
            exactly one \(-1\) and one \(+1\). This implies that the all-ones vector \(\mathbf{1} = (1, 1, \dots, 1)^T\)
            is always in the nullspace \(N(A)\):
          </p>
          <MathBlock math="A \mathbf{1} = \mathbf{0}" />
        </div>

        {/* Module 2: Network Connectivity & Rank */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Network className="w-4 h-4 text-purple-600" />
            <span>2. Rank and Spanning Trees</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            For any connected graph with \(n\) nodes:
          </p>
          <MathBlock math="\operatorname{rank}(A) = n - 1" />
          <p className="text-slate-600 leading-relaxed">
            If the graph splits into \(c\) disconnected components, the rank becomes:
          </p>
          <MathBlock math="\operatorname{rank}(A) = n - c" />
          <p className="text-slate-600 leading-relaxed">
            Any subset of \(n - 1\) linearly independent rows forms a <strong>spanning tree</strong> connecting all
            stops without closed loops.
          </p>
        </div>

        {/* Module 3: Network Flow & Kirchhoff's Law */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>3. Flow Conservation (<MathInline math="A^T \mathbf{y} = \mathbf{b}" />)</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            Let <MathInline math="\mathbf{y} \in \mathbb{R}^m" /> represent the flow along edges. The matrix-vector multiplication{' '}
            <MathInline math="A^T \mathbf{y}" /> produces the net inflow at every node:
          </p>
          <MathBlock math="(A^T \mathbf{y})_i = \text{Inflow}(i) - \text{Outflow}(i) = b_i" />
          <p className="text-slate-600 leading-relaxed">
            At transfer stops where passengers do not originate or terminate, <MathInline math="b_i = 0" />. Global conservation
            guarantees that total boardings equal total alightings:
          </p>
          <MathBlock math="\sum_{i=1}^n b_i = 0 \iff \mathbf{b} \perp \mathbf{1} \iff \mathbf{b} \in C(A^T)" />
        </div>

        {/* Module 4: The Graph Laplacian L = A^T A */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            <span>4. Graph Laplacian (<MathInline math="L = D - G = A^T A" />)</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            The unweighted Graph Laplacian is constructed directly from the incidence matrix:
          </p>
          <MathBlock math="L = A^T A = D - G" />
          <p className="text-slate-600 leading-relaxed">
            Where <MathInline math="D" /> is the diagonal degree matrix and <MathInline math="G" /> is the adjacency matrix. The diagonal
            elements <MathInline math="(A^T A)_{ii}" /> count the total connections at stop <MathInline math="i" />, while off-diagonal elements{' '}
            <MathInline math="(A^T A)_{ij} = -1" /> if stops <MathInline math="i" /> and <MathInline math="j" /> are directly linked.
          </p>
        </div>
      </div>
    </div>
  );
};
