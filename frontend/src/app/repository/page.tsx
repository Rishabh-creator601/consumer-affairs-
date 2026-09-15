'use client';

import React, { useState, useEffect } from 'react';
import { SearchBar } from '@/components/ui/SearchBar';
import { Table, Column } from '@/components/ui/Table';
import { StatusPill } from '@/components/ui/StatusPill';
import { Product } from '@/types/product';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RepositoryPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [verdict, setVerdict] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    // Mock fetch
    setLoading(true);
    setTimeout(() => {
      const mockProducts: Product[] = [
        {
          _id: '1',
          brand: 'Parle-G',
          genericName: 'Biscuits',
          category: 'Food',
          complianceHistory: [
            { inspectionId: 'INS-8942', verdict: 'compliant', date: '2023-10-25', violations: 0, ref: 'INS-8942' },
          ],
          createdAt: '2023-01-01',
          updatedAt: '2023-10-25',
        },
        {
          _id: '2',
          brand: 'Dove',
          genericName: 'Soap',
          category: 'Personal Care',
          complianceHistory: [
            { inspectionId: 'INS-8935', verdict: 'non_compliant', date: '2023-10-22', violations: 2, ref: 'INS-8935' },
          ],
          createdAt: '2023-02-15',
          updatedAt: '2023-10-22',
        }
      ];
      setProducts(mockProducts);
      setTotalPages(5);
      setLoading(false);
    }, 800);
  }, [search, category, verdict, page]);

  const columns: Column<Product>[] = [
    { key: 'brand', label: 'Brand', sortable: true },
    { key: 'genericName', label: 'Generic Name', sortable: true },
    { key: 'category', label: 'Category', sortable: true },
    { 
      key: 'lastInspected', 
      label: 'Last Inspected', 
      render: (p) => p.complianceHistory[0]?.date || 'N/A' 
    },
    { 
      key: 'lastVerdict', 
      label: 'Last Verdict', 
      render: (p) => p.complianceHistory.length > 0 ? <StatusPill status={p.complianceHistory[0].verdict as any} /> : 'N/A'
    },
    { 
      key: 'inspections', 
      label: '# Inspections', 
      render: (p) => p.complianceHistory.length 
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#083344]">Product Repository</h1>
          <p className="text-sm text-gray-500 mt-1">Search and filter packaged commodities and their compliance history.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-[#ECFEFF] mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <SearchBar onSearch={setSearch} placeholder="Search by brand, generic name, or GTIN..." />
        </div>
        <div className="flex gap-2">
          <select 
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
            className="border border-gray-300 rounded-lg text-sm px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#06B6D4]"
          >
            <option value="">All Categories</option>
            <option value="Food">Food</option>
            <option value="Personal Care">Personal Care</option>
            <option value="Chemical">Chemical</option>
            <option value="Textile">Textile</option>
            <option value="Hardware">Hardware</option>
            <option value="Special">Special</option>
          </select>
          <select 
            value={verdict} 
            onChange={(e) => setVerdict(e.target.value)}
            className="border border-gray-300 rounded-lg text-sm px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#06B6D4]"
          >
            <option value="">All Verdicts</option>
            <option value="compliant">Compliant</option>
            <option value="non_compliant">Non-Compliant</option>
            <option value="review">Review</option>
          </select>
        </div>
      </div>

      <Table
        columns={columns}
        data={products}
        isLoading={loading}
        onRowClick={(item) => router.push(`/results/${item.complianceHistory[0]?.ref || ''}`)}
        pagination={{
          currentPage: page,
          totalPages: totalPages,
          onPageChange: setPage,
          totalItems: 120
        }}
        emptyMessage="No products found matching your filters."
      />
    </div>
  );
}
