'use client';

import { ReactNode, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Header } from './Header';

// Lazy-load Sidebar with dynamic import
const Sidebar = dynamic(() => import('./Sidebar').then(mod => ({ default: mod.Sidebar })), {
  ssr: true,
});

// Sidebar loading fallback
function SidebarSkeleton() {
  return (
    <aside
      className="sticky top-16 h-[calc(100vh-4rem)] w-64 border-r"
      style={{
        backgroundColor: 'var(--theme-surface)',
        borderColor: 'var(--theme-border)',
      }}
    >
      <nav className="flex h-full flex-col justify-between p-4">
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-9 w-full rounded-lg animate-pulse"
              style={{ backgroundColor: 'var(--theme-border)' }}
            />
          ))}
        </div>
        <div
          className="h-9 w-full rounded-lg animate-pulse"
          style={{ backgroundColor: 'var(--theme-border)' }}
        />
      </nav>
    </aside>
  );
}

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--theme-background)' }}>
      <Header />
      <div className="flex">
        <Suspense fallback={<SidebarSkeleton />}>
          <Sidebar />
        </Suspense>
        <main className="flex-1 overflow-x-hidden">
          <div className="container mx-auto px-6 py-8">{children}</div>
        </main>
      </div>
      <footer
        className="border-t px-6 py-4"
        style={{
          backgroundColor: 'var(--theme-surface)',
          borderColor: 'var(--theme-border)',
        }}
      >
        <div className="container flex items-center justify-between text-sm">
          <p style={{ color: 'var(--theme-text-tertiary)' }}>
            Pathfinder &copy; 2025
          </p>
        </div>
      </footer>
    </div>
  );
}
