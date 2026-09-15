'use client';
import { StatusPill } from '@/components/ui/StatusPill';
import { Button } from '@/components/ui/Button';

export default function ResultsPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            Inspection {params.id}
            <StatusPill verdict="REVIEW" />
          </h1>
          <p className="text-sm text-slate-500 mt-1">Product: Example Packaged Water</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary">Download Report</Button>
          <Button variant="primary">Adjudicate</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-cyan-brand/10 p-6">
          <h2 className="text-lg font-bold mb-4">Extracted Declarations</h2>
          <div className="text-sm text-slate-500 italic">Table placeholder...</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-cyan-brand/10 p-6">
          <h2 className="text-lg font-bold mb-4">Compliance Checklist</h2>
          <div className="text-sm text-slate-500 italic">Checklist placeholder...</div>
        </div>
      </div>
    </div>
  );
}
