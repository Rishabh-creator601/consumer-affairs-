'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

const mockData = [
  { name: 'Jan', rate: 72 },
  { name: 'Feb', rate: 75 },
  { name: 'Mar', rate: 74 },
  { name: 'Apr', rate: 78 },
  { name: 'May', rate: 82 },
  { name: 'Jun', rate: 80 },
  { name: 'Jul', rate: 85 },
  { name: 'Aug', rate: 84 },
  { name: 'Sep', rate: 88 },
  { name: 'Oct', rate: 91 },
  { name: 'Nov', rate: 90 },
  { name: 'Dec', rate: 93 },
];

export function ComplianceChart() {
  return (
    <div className="w-full h-[300px] bg-white rounded-xl border border-[#ECFEFF] shadow-sm p-4">
      <h3 className="text-sm font-semibold text-[#083344] mb-4">Compliance Rate (Last 12 Months)</h3>
      <div className="w-full h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={mockData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ECFEFF" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} domain={[0, 100]} />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: '1px solid #ECFEFF', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              labelStyle={{ color: '#083344', fontWeight: 'bold' }}
            />
            <Area type="monotone" dataKey="rate" stroke="#0E7490" strokeWidth={3} fillOpacity={1} fill="url(#colorRate)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
