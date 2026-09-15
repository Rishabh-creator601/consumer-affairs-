'use client';

import React, { useState } from 'react';
import { SearchBar } from '@/components/ui/SearchBar';
import { Table, Column } from '@/components/ui/Table';

interface RuleInfo {
  citation: string;
  subject: string;
  requirements: string;
  severity: 'critical' | 'major' | 'minor';
  automation: 'full' | 'assisted' | 'flagged';
}

const hardcodedRules: RuleInfo[] = [
  { citation: '6(1)(a)', subject: 'Name and Address', requirements: 'Manufacturer/packer/importer name and address', severity: 'critical', automation: 'full' },
  { citation: '6(1)(b)', subject: 'Generic Name', requirements: 'Common or generic name', severity: 'major', automation: 'full' },
  { citation: '6(1)(c)', subject: 'Net Quantity', requirements: 'Net quantity in standard unit', severity: 'critical', automation: 'assisted' },
  { citation: '6(1)(d)', subject: 'Date of Mfg/Pkg', requirements: 'Month and year of manufacture/packing', severity: 'major', automation: 'full' },
  { citation: '6(1)(e)', subject: 'Retail Sale Price', requirements: 'Retail sale price (MRP)', severity: 'critical', automation: 'full' },
  { citation: '6(2)', subject: 'Consumer Care', requirements: 'Consumer care details', severity: 'major', automation: 'full' },
  { citation: '7(2)', subject: 'Numeral Height', requirements: 'Numeral height (Table I and II)', severity: 'minor', automation: 'assisted' },
  { citation: '7(3)', subject: 'Letter Proportions', requirements: 'Letter height and width ratio', severity: 'minor', automation: 'flagged' },
  { citation: '8(1)', subject: 'PDP Placement', requirements: 'Principal display panel placement and clear space', severity: 'minor', automation: 'flagged' },
  { citation: '9(1)', subject: 'Legibility', requirements: 'Legibility and contrast', severity: 'minor', automation: 'assisted' },
  { citation: '9(4)', subject: 'Language', requirements: 'Language (Hindi or English)', severity: 'minor', automation: 'full' },
  { citation: '11(2)-(3)', subject: 'Qualifier', requirements: 'When packed qualifier', severity: 'minor', automation: 'assisted' },
  { citation: '12(2)', subject: 'Unit Class', requirements: 'Correct unit class', severity: 'major', automation: 'full' },
  { citation: '12(6)', subject: 'Misleading Quantity', requirements: 'Misleading quantity wording', severity: 'critical', automation: 'flagged' },
  { citation: '13(2)', subject: 'Unit Subdivision', requirements: 'Unit subdivision', severity: 'minor', automation: 'full' },
  { citation: '18(2)', subject: 'Sale Above MRP', requirements: 'Sale above MRP', severity: 'critical', automation: 'assisted' },
];

export default function RulesPage() {
  const [search, setSearch] = useState('');

  const filteredRules = hardcodedRules.filter((rule) => 
    rule.citation.toLowerCase().includes(search.toLowerCase()) ||
    rule.subject.toLowerCase().includes(search.toLowerCase()) ||
    rule.requirements.toLowerCase().includes(search.toLowerCase())
  );

  const columns: Column<RuleInfo>[] = [
    { key: 'citation', label: 'Citation', sortable: true, render: (r) => <span className="font-mono text-sm font-semibold">{r.citation}</span> },
    { key: 'subject', label: 'Subject', sortable: true, render: (r) => <span className="font-medium text-[#083344]">{r.subject}</span> },
    { key: 'requirements', label: 'What It Requires' },
    { 
      key: 'severity', 
      label: 'Severity', 
      sortable: true,
      render: (r) => {
        const colors = {
          critical: 'bg-[#A61B1B]/10 text-[#A61B1B]',
          major: 'bg-[#9A5B08]/10 text-[#9A5B08]',
          minor: 'bg-blue-100 text-blue-800'
        };
        return <span className={`px-2 py-1 rounded text-xs font-semibold ${colors[r.severity]}`}>{r.severity.toUpperCase()}</span>;
      }
    },
    { 
      key: 'automation', 
      label: 'Automation Level',
      sortable: true,
      render: (r) => {
        const colors = {
          full: 'bg-[#047857]/10 text-[#047857] border-[#047857]',
          assisted: 'bg-[#9A5B08]/10 text-[#9A5B08] border-[#9A5B08]',
          flagged: 'bg-[#A61B1B]/10 text-[#A61B1B] border-[#A61B1B]'
        };
        return <span className={`px-2 py-1 rounded-full text-xs font-medium border ${colors[r.automation]}`}>{r.automation.replace('_', ' ').toUpperCase()}</span>;
      }
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#083344]">Legal Metrology (PCR) 2011 Rules</h1>
        <p className="text-sm text-gray-500 mt-1">Reference guide for compliance checks and automation capabilities.</p>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-[#ECFEFF] mb-6">
        <SearchBar onSearch={setSearch} placeholder="Search rules by citation, subject, or keyword..." />
      </div>

      <Table
        columns={columns}
        data={filteredRules}
        emptyMessage="No rules match your search."
      />
    </div>
  );
}
