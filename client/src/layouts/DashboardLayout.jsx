import React from 'react';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';
import GalaxyBackground from '../components/GalaxyBackground';

export const DashboardLayout = ({
  children,
  activeTab,
  onSelectTab,
  onRefresh,
  onSeed,
  isRefreshing,
  isSeeding,
}) => {
  return (
    <div className="relative flex h-screen bg-[#06080E] overflow-hidden text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Signature Layer - Deep-Space Multi-Layer Galaxy Canvas */}
      <GalaxyBackground />

      {/* Layer 1 & 2 - Workspace Layout */}
      <Sidebar activeTab={activeTab} onSelectTab={onSelectTab} />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto relative z-10">
        <TopHeader
          onRefresh={onRefresh}
          onSeed={onSeed}
          isRefreshing={isRefreshing}
          isSeeding={isSeeding}
        />
        <main className="flex-1 p-6 md:p-8 space-y-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
