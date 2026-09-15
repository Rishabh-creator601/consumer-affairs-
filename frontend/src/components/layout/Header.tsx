import React from 'react';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[#083344] text-white sticky top-0 z-30">
      <button 
        onClick={onMenuClick}
        className="p-1 rounded-md hover:bg-[#0E7490] focus:outline-none focus:ring-2 focus:ring-[#06B6D4]"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      
      <h1 className="text-lg font-bold tracking-tight">LM-Verify</h1>
      
      <div className="w-8 h-8 rounded-full bg-[#0E7490] flex items-center justify-center text-sm font-medium border border-[#06B6D4]">
        U
      </div>
    </header>
  );
}
