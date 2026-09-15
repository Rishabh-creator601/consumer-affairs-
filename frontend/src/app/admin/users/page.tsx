'use client';

import React, { useState } from 'react';
import { Table, Column } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { ROLE_LABELS } from '@/lib/constants';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  jurisdiction: string;
  isActive: boolean;
  lastLogin: string;
}

const mockUsers: User[] = [
  { id: '1', name: 'Arjun Singh', email: 'arjun@lm.gov.in', role: 'field_inspector', jurisdiction: 'Delhi South', isActive: true, lastLogin: '2023-10-25' },
  { id: '2', name: 'Meera Patel', email: 'meera@lm.gov.in', role: 'senior_inspector', jurisdiction: 'Delhi State', isActive: true, lastLogin: '2023-10-24' },
  { id: '3', name: 'Rajesh Kumar', email: 'rajesh@lm.gov.in', role: 'controller', jurisdiction: 'Delhi State', isActive: true, lastLogin: '2023-10-25' },
];

export default function UsersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const columns: Column<User>[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { 
      key: 'role', 
      label: 'Role',
      render: (u) => {
        const colors: Record<string, string> = {
          field_inspector: 'bg-blue-100 text-blue-800',
          senior_inspector: 'bg-indigo-100 text-indigo-800',
          controller: 'bg-purple-100 text-purple-800',
          legal_officer: 'bg-amber-100 text-amber-800',
          auditor: 'bg-gray-100 text-gray-800',
        };
        return <span className={`px-2 py-1 rounded text-xs font-semibold ${colors[u.role] || colors.auditor}`}>{ROLE_LABELS[u.role] || u.role}</span>;
      }
    },
    { key: 'jurisdiction', label: 'Jurisdiction' },
    { 
      key: 'isActive', 
      label: 'Status',
      render: (u) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${u.isActive ? 'bg-[#047857]/10 text-[#047857] border-[#047857]/20' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
          {u.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    },
    { key: 'lastLogin', label: 'Last Login' },
    {
      key: 'actions',
      label: 'Actions',
      render: (u) => (
        <div className="flex gap-2">
          <button 
            onClick={() => { setEditingUser(u); setIsModalOpen(true); }}
            className="text-[#0E7490] hover:text-[#083344] text-sm font-medium"
          >
            Edit
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#083344]">User Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage official access and jurisdictions.</p>
        </div>
        <button 
          onClick={() => { setEditingUser(null); setIsModalOpen(true); }}
          className="bg-[#06B6D4] hover:bg-[#0E7490] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Add User
        </button>
      </div>

      <Table
        columns={columns}
        data={mockUsers}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Edit User' : 'Add New User'}
      >
        <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); setIsModalOpen(false); }}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input type="text" defaultValue={editingUser?.name} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-[#06B6D4] focus:border-[#06B6D4]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" defaultValue={editingUser?.email} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-[#06B6D4] focus:border-[#06B6D4]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select defaultValue={editingUser?.role || 'field_inspector'} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-[#06B6D4] focus:border-[#06B6D4]">
              {Object.entries(ROLE_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jurisdiction</label>
            <input type="text" defaultValue={editingUser?.jurisdiction} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-[#06B6D4] focus:border-[#06B6D4]" />
          </div>
          <div className="flex items-center gap-2 mt-2">
            <input type="checkbox" id="isActive" defaultChecked={editingUser ? editingUser.isActive : true} className="rounded text-[#06B6D4] focus:ring-[#06B6D4]" />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Account is Active</label>
          </div>
          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-[#06B6D4] rounded-lg hover:bg-[#0E7490]">Save User</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
