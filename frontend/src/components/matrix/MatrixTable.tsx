import React from 'react';

interface MatrixTableProps {
  matrix: number[][];
  rowLabels: string[];
  colLabels: string[];
  selectedRowIndex?: number | null;
  selectedColIndex?: number | null;
  onRowClick?: (rowIndex: number) => void;
  onColClick?: (colIndex: number) => void;
  onRowHover?: (rowIndex: number | null) => void;
  highlightedRowIndices?: number[];
  highlightedColIndices?: number[];
  dense?: boolean;
  valueFormatter?: (val: number) => string;
}

export const MatrixTable: React.FC<MatrixTableProps> = ({
  matrix,
  rowLabels,
  colLabels,
  selectedRowIndex = null,
  selectedColIndex = null,
  onRowClick,
  onColClick,
  onRowHover,
  highlightedRowIndices = [],
  highlightedColIndices = [],
  dense = false,
  valueFormatter,
}) => {
  if (!matrix || matrix.length === 0 || !matrix[0]) {
    return (
      <div className="p-8 text-center text-xs text-slate-400">
        No matrix data available.
      </div>
    );
  }

  const formatValue = (val: number) => {
    if (valueFormatter) return valueFormatter(val);
    if (val === 0) return '0';
    if (val === 1) return '+1';
    if (val === -1) return '-1';
    return Number.isInteger(val) ? val.toString() : val.toFixed(1);
  };

  const getCellColor = (val: number, isRowActive: boolean, isColActive: boolean) => {
    if (isRowActive || isColActive) {
      if (val === -1) return 'bg-amber-100 text-amber-900 font-bold';
      if (val === 1) return 'bg-blue-100 text-blue-900 font-bold';
      return 'bg-blue-50/50 text-slate-400';
    }
    if (val === -1) return 'bg-amber-50/70 text-amber-700 font-semibold';
    if (val === 1) return 'bg-blue-50/70 text-blue-700 font-semibold';
    if (val !== 0) return 'bg-slate-100 text-slate-800 font-medium';
    return 'text-slate-300';
  };

  return (
    <div className="overflow-x-auto overflow-y-auto max-h-[500px] border border-slate-200 rounded-xl bg-white shadow-2xs">
      <table className="min-w-full border-collapse font-mono text-xs text-center">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 sticky top-0 z-20">
            <th className="p-2.5 text-[11px] font-semibold text-slate-500 bg-slate-100/90 border-r border-slate-200 sticky left-0 z-30 min-w-[75px]">
              Edge \ Node
            </th>
            {colLabels.map((col, cIdx) => {
              const isColActive = selectedColIndex === cIdx || highlightedColIndices.includes(cIdx);
              return (
                <th
                  key={col}
                  onClick={() => onColClick && onColClick(cIdx)}
                  className={`p-2 text-[11px] font-semibold tracking-wider transition-colors cursor-pointer min-w-[50px] ${
                    isColActive
                      ? 'bg-blue-100 text-blue-800'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                  title={`Node ${col}`}
                >
                  {col}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, rIdx) => {
            const isRowActive = selectedRowIndex === rIdx || highlightedRowIndices.includes(rIdx);
            return (
              <tr
                key={rowLabels[rIdx] || rIdx}
                onClick={() => onRowClick && onRowClick(rIdx)}
                onMouseEnter={() => onRowHover && onRowHover(rIdx)}
                onMouseLeave={() => onRowHover && onRowHover(null)}
                className={`transition-colors cursor-pointer border-b border-slate-100 ${
                  isRowActive ? 'bg-blue-50/80 ring-1 ring-blue-400/50' : 'hover:bg-slate-50/70'
                }`}
              >
                {/* Row Header */}
                <td
                  className={`p-2 font-semibold text-[11px] border-r border-slate-200 sticky left-0 z-10 ${
                    isRowActive ? 'bg-blue-100 text-blue-900' : 'bg-slate-50 text-slate-700'
                  }`}
                >
                  {rowLabels[rIdx]}
                </td>

                {/* Cells */}
                {row.map((cell, cIdx) => {
                  const isColActive = selectedColIndex === cIdx || highlightedColIndices.includes(cIdx);
                  return (
                    <td
                      key={cIdx}
                      className={`transition-all ${dense ? 'p-1' : 'p-2'} ${getCellColor(
                        cell,
                        isRowActive,
                        isColActive
                      )}`}
                    >
                      {formatValue(cell)}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
