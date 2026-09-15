'use client';

import React, { useState } from 'react';

interface ReportDownloaderProps {
  inspectionId: string;
}

export function ReportDownloader({ inspectionId }: ReportDownloaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loadingFormat, setLoadingFormat] = useState<string | null>(null);

  const handleDownload = async (format: string) => {
    setLoadingFormat(format);
    
    // Simulate API call
    setTimeout(() => {
      setLoadingFormat(null);
      setIsOpen(false);
      alert(`Downloaded ${inspectionId} report as ${format.toUpperCase()}`);
    }, 1500);
  };

  return (
    <div className="relative inline-block text-left">
      <div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#06B6D4] text-sm font-medium text-white hover:bg-[#0E7490] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#06B6D4]"
          id="options-menu"
          aria-expanded="true"
          aria-haspopup="true"
        >
          Download Report
          <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div 
          className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="options-menu"
        >
          <div className="py-1" role="none">
            {['pdf', 'docx', 'xlsx'].map((format) => (
              <button
                key={format}
                onClick={() => handleDownload(format)}
                disabled={loadingFormat !== null}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#ECFEFF] hover:text-[#083344] flex items-center justify-between"
                role="menuitem"
              >
                <span>{format.toUpperCase()} Report</span>
                {loadingFormat === format && (
                  <svg className="animate-spin h-4 w-4 text-[#06B6D4]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
