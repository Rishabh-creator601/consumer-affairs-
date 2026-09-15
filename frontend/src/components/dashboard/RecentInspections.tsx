'use client';

import React from 'react';
import Link from 'next/link';
import { StatusPill } from '../ui/StatusPill';

const mockInspections = [
  { id: 'INS-8942', product: 'Parle-G Gold', verdict: 'compliant', date: '2023-10-25', time: '14:32' },
  { id: 'INS-8941', product: 'Haldiram Bhujia', verdict: 'non_compliant', date: '2023-10-25', time: '11:15' },
  { id: 'INS-8940', product: 'Amul Butter 500g', verdict: 'review', date: '2023-10-24', time: '09:45' },
  { id: 'INS-8939', product: 'Tata Salt 1kg', verdict: 'compliant', date: '2023-10-24', time: '16:20' },
  { id: 'INS-8938', product: 'Maggi Noodles', verdict: 'compliant', date: '2023-10-23', time: '10:05' },
];

export function RecentInspections() {
  return (
    <div className="bg-white rounded-xl border border-[#ECFEFF] shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-[#ECFEFF] flex justify-between items-center bg-[#F8FAFC]">
        <h3 className="text-sm font-semibold text-[#083344]">Recent Inspections</h3>
      </div>
      
      <div className="flex-1 overflow-auto">
        <ul className="divide-y divide-gray-100">
          {mockInspections.map((item) => (
            <li key={item.id} className="hover:bg-[#ECFEFF]/50 transition-colors">
              <Link href={`/results/${item.id}`} className="block p-4">
                <div className="flex justify-between items-start mb-1">
                  <div className="font-medium text-[#0E7490] text-sm">{item.id}</div>
                  <StatusPill status={item.verdict as any} />
                </div>
                <div className="flex justify-between items-center mt-2">
                  <div className="text-sm font-medium text-gray-800">{item.product}</div>
                  <div className="text-xs text-gray-500">{item.date} {item.time}</div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="p-3 border-t border-[#ECFEFF] text-center bg-gray-50 mt-auto">
        <Link href="/repository" className="text-sm text-[#0E7490] hover:text-[#083344] font-medium">
          View all inspections →
        </Link>
      </div>
    </div>
  );
}
