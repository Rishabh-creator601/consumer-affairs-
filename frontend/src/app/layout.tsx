'use client';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider, useAuth } from '@/lib/auth';
import Sidebar from '@/components/layout/Sidebar';
import { usePathname } from 'next/navigation';

const inter = Inter({ subsets: ['latin'] });

function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();

  if (isLoading) return <div>Loading...</div>;

  const isAuthPage = pathname === '/login';

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <AppLayout>{children}</AppLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
