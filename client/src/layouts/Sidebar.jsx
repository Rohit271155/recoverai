import React from 'react';
import {
  LayoutDashboard,
  ShieldAlert,
  Inbox,
  RefreshCw,
  FileText,
  ShoppingCart,
  Bot,
  BarChart3,
  ScrollText,
  Settings,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import RecoverAILogo from '../components/RecoverAILogo';

const NAV_GROUPS = [
  {
    title: 'RECOVERY',
    items: [
      { id: 'overview', label: 'Overview', icon: LayoutDashboard },
      { id: 'queue', label: 'Recovery Queue', icon: Inbox, badge: 'Live' },
      { id: 'risk', label: 'Revenue Risk', icon: ShieldAlert },
    ],
  },
  {
    title: 'CUSTOMERS',
    items: [
      { id: 'subscriptions', label: 'Subscriptions', icon: RefreshCw },
      { id: 'receivables', label: 'Receivables', icon: FileText },
      { id: 'checkout', label: 'Checkout Loss', icon: ShoppingCart },
    ],
  },
  {
    title: 'INTELLIGENCE',
    items: [
      { id: 'agent', label: 'Recovery Strategy', icon: Bot },
      { id: 'analytics', label: 'Recovery Analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'SYSTEM',
    items: [
      { id: 'settings', label: 'Policy Engine', icon: Settings },
      { id: 'audit', label: 'Audit Logs', icon: ScrollText },
    ],
  },
];

export const Sidebar = ({ activeTab, onSelectTab }) => {
  return (
    <aside className="w-64 bg-[#0B0E14] border-r border-[#1E2638] flex flex-col shrink-0 h-screen sticky top-0 z-20">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#1E2638]">
        <div className="flex items-center gap-3">
          <RecoverAILogo size="md" />
          <div>
            <div className="font-bold text-base tracking-tight text-white flex items-center gap-1">
              Recover<span className="text-emerald-400">AI</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">
              Orbital Recovery Console
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Links Grouped */}
      <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
        {NAV_GROUPS.map((group) => (
          <div key={group.title} className="space-y-1">
            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
              {group.title}
            </div>
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-[#1D2636] text-white border border-[#2E3C54] font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#131822] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                        isActive
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-[#1A2232] text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer System Controls */}
      <div className="p-4 border-t border-[#1E2638] bg-[#0D111A]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-medium text-slate-300">Policy Engine</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#131822] text-emerald-400 border border-[#1E2638] font-bold">
            ACTIVE
          </span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
