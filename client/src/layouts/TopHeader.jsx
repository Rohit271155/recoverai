import React, { useState, useEffect } from 'react';
import { RefreshCw, Database, ShieldCheck, Activity, Cpu } from 'lucide-react';
import RecoverAILogo from '../components/RecoverAILogo';

export const TopHeader = ({ onRefresh, onSeed, isRefreshing, isSeeding }) => {
  const [time, setTime] = useState(new Date().toLocaleTimeString('en-IN'));

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-IN'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 bg-[#0B0E14]/90 backdrop-blur-md border-b border-[#1E2638] px-6 flex items-center justify-between sticky top-0 z-20 shadow-md">
      {/* Brand Title & System Telemetry */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <RecoverAILogo size="sm" />
          <div>
            <h1 className="text-sm lg:text-base font-bold text-white tracking-tight flex items-center gap-2 font-mono">
              RECOVER<span className="text-emerald-400">AI</span>
              <span className="text-slate-400 text-xs font-normal font-sans">| Revenue Recovery Operations</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-mono">
              Autonomous financial recovery command center
            </p>
          </div>
        </div>

        {/* JARVIS System Telemetry Badges */}
        <div className="hidden xl:flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#131822] border border-[#1E2638] text-[10px] text-emerald-400 font-mono font-bold shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>SYSTEM OPERATIONAL</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#131822] border border-[#1E2638] text-[10px] text-blue-400 font-mono">
            <Cpu className="w-3 h-3 text-blue-400" />
            <span>POLICY ENGINE ENFORCED</span>
          </div>
        </div>
      </div>

      {/* Header Controls */}
      <div className="flex items-center gap-3">
        {/* Sync Time & Telemetry */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-lg bg-[#131822] border border-[#1E2638] text-xs text-slate-300 font-mono">
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-400 text-[11px]">STREAM LIVE</span>
          <span className="text-slate-500 text-[11px]">{time}</span>
        </div>

        {/* Reset Data */}
        <button
          onClick={onSeed}
          disabled={isSeeding}
          title="Reset database seed transactions"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#131822] hover:bg-[#1A2232] text-slate-300 hover:text-white border border-[#1E2638] text-xs font-medium transition-colors disabled:opacity-50"
        >
          <Database className={`w-3.5 h-3.5 text-slate-400 ${isSeeding ? 'animate-spin text-emerald-400' : ''}`} />
          <span>{isSeeding ? 'Resetting...' : 'Reset Data'}</span>
        </button>

        {/* Sync Data */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md hover:shadow-emerald-900/40 transition-all active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Syncing...' : 'Sync Telemetry'}</span>
        </button>
      </div>
    </header>
  );
};

export default TopHeader;
