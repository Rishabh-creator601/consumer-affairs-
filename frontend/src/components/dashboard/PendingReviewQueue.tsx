'use client';

import React from 'react';
import Link from 'next/link';

const mockQueue = [
  { id: 'INS-8940', product: 'Amul Butter 500g', reason: 'Low OCR confidence on MRP', date: '2023-10-24' },
  { id: 'INS-8935', product: 'Dove Soap 3-pack', reason: 'Missing Month/Year of Mfg', date: '2023-10-22' },
  { id: 'INS-8921', product: 'Aashirvaad Atta 5kg', reason: 'Uncalibrated image for area', date: '2023-10-20' },
];

export function PendingReviewQueue() {
  return (
    <div className="bg-white rounded-xl border border-[#ECFEFF] shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-[#ECFEFF] flex justify-between items-center bg-[#F8FAFC]">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-[#083344]">Pending Review</h3>
          <span className="bg-[#9A5B08] text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {mockQueue.length}
          </span>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto">
        <ul className="divide-y divide-gray-100">
          {mockQueue.length === 0 ? (
            <li className="p-8 text-center text-gray-500 text-sm">No items pending review.</li>
          ) : (
            mockQueue.map((item) => (
              <li key={item.id} className="p-4 hover:bg-[#ECFEFF]/50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium text-sm text-[#083344]">{item.product}</div>
                  <div className="text-xs text-gray-500">{item.date}</div>
                </div>
                <div className="text-xs text-[#9A5B08] mb-3 bg-orange-50 inline-block px-2 py-1 rounded">
                  {item.reason}
                </div>
                <div>
                  <Link 
                    href={`/results/${item.id}`} 
                    className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium bg-white border border-[#06B6D4] text-[#0E7490] rounded hover:bg-[#ECFEFF] transition-colors"
                  >
                    Review Now
                  </Link>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
