import React from 'react';
import { AlertCircle } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  return (
    <div className="bg-amber-50/80 border border-amber-200/90 rounded-xl p-3.5 flex items-start gap-3 text-xs text-amber-900 mb-6">
      <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
      <div className="leading-relaxed">
        <strong className="font-semibold text-amber-950">Educational Sample Yangon Network:</strong>{' '}
        Bus stop coordinates reflect authentic Yangon geography (Sule, Hledan, Myaynigone, Tamwe, Insein, etc.).
        Transit connections, passenger flows, travel times, and capacities are synthetic educational data formulated
        to demonstrate Gilbert Strang Section 10.1 (incidence matrices, cycle rank, and flow conservation).
      </div>
    </div>
  );
};
