import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileBottomNav } from './MobileBottomNav';
import { PwaInstallPrompt } from '../pwa/PwaInstallPrompt';
import { OfflineBanner } from '../pwa/OfflineBanner';
import { CandidateProfile } from '../../types';

interface LayoutProps {
  candidate: CandidateProfile;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ candidate, children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-dark-bg text-slate-100 flex flex-col">
      {/* Offline Status Top Alert */}
      <OfflineBanner />

      <div className="flex-1 flex min-w-0">
        {/* Desktop & Mobile Slide-over Sidebar */}
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        {/* Main Content Workspace */}
        <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
          <Header candidate={candidate} onMobileMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
          <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6 pb-24 lg:pb-12">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile Fixed Bottom Navigation */}
      <MobileBottomNav />

      {/* PWA Install Prompt Banner */}
      <PwaInstallPrompt />
    </div>
  );
};
