import React from 'react';
import { ChevronLeft, ChevronRight, X, Play } from 'lucide-react';
import { NavTab } from './Sidebar';

export interface PresentationStep {
  stepNumber: number;
  title: string;
  tab: NavTab;
  highlightText: string;
  mathFocus: string;
}

export const PRESENTATION_STEPS: PresentationStep[] = [
  {
    stepNumber: 1,
    title: 'Yangon Network & Graph Modeling',
    tab: 'dashboard',
    highlightText: 'Nodes represent 16 bus stops; directed edges represent transit segments.',
    mathFocus: 'G = (V, E), \\quad |V| = 16, \\quad |E| = 26',
  },
  {
    stepNumber: 2,
    title: 'The Incidence Matrix A',
    tab: 'matrix-lab',
    highlightText: 'Each row corresponds to an edge. -1 marks where the edge leaves, +1 where it enters.',
    mathFocus: 'A \\in \\mathbb{R}^{26 \\times 16}, \\quad A_{k,i} = -1, \\quad A_{k,j} = +1',
  },
  {
    stepNumber: 3,
    title: 'Row-to-Edge Duality',
    tab: 'matrix-lab',
    highlightText: 'Hovering or clicking any edge highlights its physical row in A and vice-versa.',
    mathFocus: '\\text{Row } k \\longleftrightarrow \\text{Direct segment } (u \\to v)',
  },
  {
    stepNumber: 4,
    title: 'Shortest Path & Route Submatrix',
    tab: 'routing',
    highlightText: 'Dijkstra finds the route; linear algebra demonstrates intermediate node cancellation.',
    mathFocus: '\\sum_{k \\in \\text{path}} \\text{row}_k(A) = -\\mathbf{e}_{\\text{origin}} + \\mathbf{e}_{\\text{destination}}',
  },
  {
    stepNumber: 5,
    title: 'Passenger Flow Vector y',
    tab: 'flow-lab',
    highlightText: 'Each edge carries passenger flow y_k. Matrix-vector multiplication gives net inflows.',
    mathFocus: '\\mathbf{y} \\in \\mathbb{R}^m, \\quad \\mathbf{b} = A^T \\mathbf{y}',
  },
  {
    stepNumber: 6,
    title: 'Flow Conservation: Kirchhoff Law',
    tab: 'flow-lab',
    highlightText: 'For transfer stops, Inflow = Outflow, so (A^T y)_i = 0. Net boarding/alighting forms b.',
    mathFocus: 'A^T \\mathbf{y} = \\mathbf{b}, \\quad \\sum_{i=1}^n b_i = 0',
  },
  {
    stepNumber: 7,
    title: 'Circulations & Left Nullspace N(A^T)',
    tab: 'cycles',
    highlightText: 'Flows around closed loops create ZERO net accumulation at any stop: A^T y = 0.',
    mathFocus: 'A^T \\mathbf{y}_{\\text{cycle}} = \\mathbf{0} \\implies \\mathbf{y}_{\\text{cycle}} \\in N(A^T)',
  },
  {
    stepNumber: 8,
    title: 'Rank, Spanning Trees & Dimension',
    tab: 'matrix-lab',
    highlightText: 'For a connected network, rank(A) = n - 1 = 15. The remaining m - rank edges close loops.',
    mathFocus: '\\operatorname{rank}(A) = n - 1 = 15, \\quad \\dim(N(A^T)) = m - (n - 1) = 11',
  },
  {
    stepNumber: 9,
    title: 'Simulating Station Disruption',
    tab: 'disruption',
    highlightText: 'Closing a major hub (e.g., Hledan) removes incident edges and can sever connectivity.',
    mathFocus: 'A \\to A_{\\text{disrupted}}, \\quad \\operatorname{rank}(A) = n - c',
  },
  {
    stepNumber: 10,
    title: 'Before vs. After Mathematical Analysis',
    tab: 'disruption',
    highlightText: 'Direct comparison of rank, connected components, and travel time penalties.',
    mathFocus: '\\Delta \\operatorname{rank}, \\quad \\Delta \\text{Components}, \\quad \\Delta t_{\\text{travel}}',
  },
];

interface PresentationBarProps {
  currentStepIndex: number;
  onPrev: () => void;
  onNext: () => void;
  onExit: () => void;
  onSelectStep: (idx: number) => void;
}

export const PresentationBar: React.FC<PresentationBarProps> = ({
  currentStepIndex,
  onPrev,
  onNext,
  onExit,
  onSelectStep,
}) => {
  const step = PRESENTATION_STEPS[currentStepIndex];

  return (
    <div className="bg-slate-900 text-white px-6 py-3 border-b border-slate-800 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Step Info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="px-2.5 py-1 rounded bg-blue-600 font-mono text-xs font-bold text-white shrink-0">
            Slide {step.stepNumber} / {PRESENTATION_STEPS.length}
          </div>
          <div className="truncate">
            <h2 className="text-sm font-semibold tracking-tight text-slate-100 flex items-center gap-2">
              <span>{step.title}</span>
              <span className="text-[11px] font-normal text-slate-400">({step.highlightText})</span>
            </h2>
          </div>
        </div>

        {/* Center: Quick Slide Selector */}
        <div className="hidden lg:flex items-center gap-1 shrink-0">
          {PRESENTATION_STEPS.map((s, idx) => (
            <button
              key={s.stepNumber}
              onClick={() => onSelectStep(idx)}
              className={`w-6 h-6 rounded text-xs font-mono transition-all ${
                idx === currentStepIndex
                  ? 'bg-blue-600 text-white font-bold scale-110 shadow-xs'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
              title={s.title}
            >
              {s.stepNumber}
            </button>
          ))}
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onPrev}
            disabled={currentStepIndex === 0}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40 disabled:hover:bg-slate-800 transition-all text-xs flex items-center gap-1 px-2.5"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Prev</span>
          </button>
          <button
            onClick={onNext}
            disabled={currentStepIndex === PRESENTATION_STEPS.length - 1}
            className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 disabled:hover:bg-blue-600 transition-all text-xs flex items-center gap-1 px-3 font-semibold shadow-xs"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onExit}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-900/40 hover:text-red-300 text-slate-400 transition-all ml-2"
            title="Exit Presentation Mode"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
