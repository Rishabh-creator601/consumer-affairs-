'use client';

export default function DashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-cyan-brand/10">
          <p className="text-sm text-slate-500 font-medium">Total Scanned</p>
          <p className="text-3xl font-bold text-cyan-deep mt-2">1,284</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-cyan-brand/10">
          <p className="text-sm text-slate-500 font-medium">Compliance Rate</p>
          <p className="text-3xl font-bold text-verdict-pass mt-2">84%</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-cyan-brand/10">
          <p className="text-sm text-slate-500 font-medium">Violations</p>
          <p className="text-3xl font-bold text-verdict-fail mt-2">156</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-cyan-brand/10">
          <p className="text-sm text-slate-500 font-medium">Pending Review</p>
          <p className="text-3xl font-bold text-verdict-review mt-2">49</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-cyan-brand/10">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Recent Inspections</h2>
          <div className="text-sm text-slate-500 italic">Table placeholder...</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-cyan-brand/10">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Pending Review Queue</h2>
          <div className="text-sm text-slate-500 italic">Queue placeholder...</div>
        </div>
      </div>
    </div>
  );
}
