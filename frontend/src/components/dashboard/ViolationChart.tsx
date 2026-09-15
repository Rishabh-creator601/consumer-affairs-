'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockData = [
  { rule: '6(1)(a) Name/Address', count: 145 },
  { rule: '6(1)(e) MRP', count: 112 },
  { rule: '6(1)(d) Month/Year', count: 98 },
  { rule: '6(1)(b) Generic Name', count: 76 },
  { rule: '6(2) Consumer Care', count: 65 },
  { rule: '11(2) When Packed', count: 42 },
];

export function ViolationChart() {
  return (
    <div className="w-full h-[300px] bg-white rounded-xl border border-[#ECFEFF] shadow-sm p-4">
      <h3 className="text-sm font-semibold text-[#083344] mb-4">Top Violated Rules</h3>
      <div className="w-full h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart layout="vertical" data={mockData} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#ECFEFF" />
            <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
            <YAxis dataKey="rule" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} width={120} />
            <Tooltip 
              cursor={{ fill: '#F8FAFC' }}
              contentStyle={{ borderRadius: '8px', border: '1px solid #ECFEFF' }}
            />
            <Bar dataKey="count" fill="#A61B1B" radius={[0, 4, 4, 0]} barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
