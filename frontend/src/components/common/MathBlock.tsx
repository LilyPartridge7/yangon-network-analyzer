import React, { useMemo } from 'react';
import katex from 'katex';

interface MathProps {
  math: string;
  className?: string;
}

export const MathBlock: React.FC<MathProps> = ({ math, className = '' }) => {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math, {
        displayMode: true,
        throwOnError: false,
      });
    } catch {
      return math;
    }
  }, [math]);

  return (
    <div
      className={`my-3 overflow-x-auto py-1 text-slate-800 ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export const MathInline: React.FC<MathProps> = ({ math, className = '' }) => {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math, {
        displayMode: false,
        throwOnError: false,
      });
    } catch {
      return math;
    }
  }, [math]);

  return (
    <span
      className={`inline-block font-medium ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
