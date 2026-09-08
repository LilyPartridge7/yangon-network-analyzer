import React from 'react';
import {
  LayoutDashboard,
  Route,
  Grid3X3,
  Waves,
  RotateCcw,
  ShieldAlert,
  GraduationCap,
  Presentation,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'routing'
  | 'matrix-lab'
  | 'flow-lab'
  | 'cycles'
  | 'disruption'
  | 'theory';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isPresentationMode: boolean;
  onTogglePresentation: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isPresentationMode,
  onTogglePresentation,
}) => {
  const navItems: { id: NavTab; label: string; icon: any; mathLabel?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'routing', label: 'Route Explorer', icon: Route, mathLabel: 'Path Submatrix' },
    { id: 'matrix-lab', label: 'Matrix Lab', icon: Grid3X3, mathLabel: 'A, G, D, L' },
    { id: 'flow-lab', label: 'Flow Lab', icon: Waves, mathLabel: 'Aᵀy = b' },
    { id: 'cycles', label: 'Cycle / Nullspace', icon: RotateCcw, mathLabel: 'N(Aᵀ)' },
    { id: 'disruption', label: 'Disruption Lab', icon: ShieldAlert, mathLabel: 'Rank Impact' },
    { id: 'theory', label: 'Theory (Strang 10.1)', icon: GraduationCap, mathLabel: '4-Node Model' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col shrink-0 h-screen sticky top-0">
      {/* Header */}
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            Y
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 leading-tight">Yangon Transit</h1>
            <p className="text-[11px] text-slate-500 font-medium">Linear Algebra Analyzer</p>
          </div>
        </div>
        <div className="mt-3 px-2 py-1 rounded bg-slate-50 border border-slate-100 text-[10px] text-slate-500 font-mono">
          Gilbert Strang §10.1
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Linear Algebra Modules
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.mathLabel && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    isActive ? 'bg-blue-100/70 text-blue-800' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {item.mathLabel}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Presentation Mode Toggle */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <button
          onClick={onTogglePresentation}
          className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
            isPresentationMode
              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
          }`}
        >
          <Presentation className="w-4 h-4" />
          <span>{isPresentationMode ? 'Exit Presentation' : 'Presentation Mode'}</span>
        </button>
        <p className="mt-2 text-[10px] text-slate-400 text-center">
          Optimized for projector demo
        </p>
      </div>
    </aside>
  );
};
