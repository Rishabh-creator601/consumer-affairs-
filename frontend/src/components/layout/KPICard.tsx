import React from 'react';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    direction: 'up' | 'down';
    value: string;
  };
  colorClass?: string;
}

export function KPICard({ title, value, icon, trend, colorClass = 'text-[#06B6D4]' }: KPICardProps) {
  return (
    <div className="bg-white rounded-xl p-5 border border-[#ECFEFF] shadow-sm flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className={`p-2 rounded-lg bg-[#ECFEFF] ${colorClass}`}>
          {icon}
        </div>
      </div>
      
      <div className="mt-auto">
        <div className="text-3xl font-bold text-[#083344] mb-1">{value}</div>
        
        {trend && (
          <div className={`text-xs font-medium flex items-center ${trend.direction === 'up' ? 'text-[#047857]' : 'text-[#A61B1B]'}`}>
            {trend.direction === 'up' ? (
              <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            ) : (
              <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            )}
            {trend.value}
          </div>
        )}
      </div>
    </div>
  );
}
