'use client';
import { clsx } from 'clsx';

interface StatusPillProps {
  verdict?: 'PASS' | 'FAIL' | 'REVIEW' | 'NOT_APPLICABLE' | 'compliant' | 'non_compliant' | 'review' | 'draft';
  status?: string;
  label?: string;
}

export function StatusPill({ verdict, status, label }: StatusPillProps) {
  const getVerdictStyle = (v: string) => {
    switch (v.toUpperCase()) {
      case 'PASS':
      case 'COMPLIANT': return 'bg-verdict-pass/10 text-verdict-pass border-verdict-pass/20';
      case 'FAIL':
      case 'NON_COMPLIANT': return 'bg-verdict-fail/10 text-verdict-fail border-verdict-fail/20';
      case 'REVIEW': return 'bg-verdict-review/10 text-verdict-review border-verdict-review/20';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const displayText = label || status || verdict || 'UNKNOWN';
  const styleClass = verdict ? getVerdictStyle(verdict) : 'bg-cyan-soft text-cyan-deep border-cyan-brand/20';

  return (
    <span className={clsx("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", styleClass)}>
      {displayText}
    </span>
  );
}
