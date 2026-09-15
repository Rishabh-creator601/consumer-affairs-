'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { LayoutDashboard, Camera, Upload, FileText, Package, BookOpen, Users, Settings, LogOut } from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Scan Camera', href: '/scan/camera', icon: Camera },
  { name: 'Upload Scan', href: '/scan/upload', icon: Upload },
  { name: 'Repository', href: '/repository', icon: Package },
  { name: 'Rules', href: '/rules', icon: BookOpen },
  { name: 'Users', href: '/admin/users', icon: Users, adminOnly: true },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="hidden lg:flex lg:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col h-0 flex-1 bg-cyan-deep">
          <div className="flex items-center h-16 flex-shrink-0 px-4 bg-cyan-deep border-b border-cyan-brand/30">
            <span className="text-xl font-bold text-white tracking-tight">LM-Verify</span>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-2 py-4 space-y-1">
              {navigation.map((item) => {
                if (item.adminOnly && user?.role !== 'controller') return null;
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive ? 'bg-cyan-brand text-white' : 'text-cyan-soft hover:bg-cyan-brand/50 hover:text-white'
                    }`}
                  >
                    <item.icon className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-cyan-brand/30 p-4">
            <div className="flex-shrink-0 w-full group block">
              <div className="flex items-center">
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">{user?.displayName}</p>
                  <button onClick={logout} className="text-xs font-medium text-cyan-soft group-hover:text-white flex items-center mt-1">
                    <LogOut className="h-4 w-4 mr-1" /> Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
