import React from 'react';
import AnimatedCounter from './AnimatedCounter';
import { ShieldCheck, TrendingUp, AlertOctagon, Layers, Activity } from 'lucide-react';

export const ArcReactorCore = ({
  revenueRecovered = 4780821,
  revenueAtRisk = 6542190,
  eligibleAmount = 317400,
  recoveryRate = 42.3,
  actionsExecuted = 270,
  atRiskCount = 84,
  recoveredCount = 38,
}) => {
  return (
    <div className="relative p-8 rounded-2xl bg-gradient-to-b from-[#131822]/90 via-[#0F141F]/90 to-[#0B0E14]/90 border border-[#1E2638] shadow-[0_0_50px_-10px_rgba(16,185,129,0.15)] overflow-hidden backdrop-blur-md">
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none orbital-glow" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header Telemetry Bar */}
      <div className="flex items-center justify-between border-b border-[#1E2638] pb-4 mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-mono font-bold text-white tracking-wider uppercase">
            ARC FINANCIAL CORE — AUTONOMOUS YIELD TELEMETRY
          </span>
        </div>
        <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#0D111A] border border-[#1E2638] text-[10px] font-mono text-emerald-400">
          <Activity className="w-3 h-3 text-emerald-400" />
          <span>RECOVERY ENGINE ONLINE</span>
        </div>
      </div>

      {/* Centerpiece Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        {/* Left Telemetry Quadrants (2 Cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Risk Card */}
          <div className="p-4 rounded-xl bg-[#0D111A]/80 border border-rose-500/30 space-y-1 shadow-sm">
            <div className="flex items-center justify-between text-[10px] font-mono font-bold text-rose-400 uppercase">
              <span>Revenue At Risk</span>
              <AlertOctagon className="w-3.5 h-3.5" />
            </div>
            <div className="text-xl font-bold font-mono text-white">
              <AnimatedCounter value={revenueAtRisk} prefix="₹" isCurrency={true} />
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              {atRiskCount} active payment failures
            </div>
          </div>

          {/* Eligible Card */}
          <div className="p-4 rounded-xl bg-[#0D111A]/80 border border-amber-500/30 space-y-1 shadow-sm">
            <div className="flex items-center justify-between text-[10px] font-mono font-bold text-amber-400 uppercase">
              <span>Eligible For Recovery</span>
              <Layers className="w-3.5 h-3.5" />
            </div>
            <div className="text-xl font-bold font-mono text-white">
              <AnimatedCounter value={eligibleAmount} prefix="₹" isCurrency={true} />
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Passed policy safety checks
            </div>
          </div>
        </div>

        {/* Center Signature Arc Reactor Visualizer (6 Cols) */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center my-2">
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
            {/* SVG Arc Reactor Ring System */}
            <svg viewBox="0 0 200 200" className="w-full h-full absolute inset-0 overflow-visible">
              <defs>
                <linearGradient id="arcGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.9" />
                  <stop offset="50%" stopColor="#3B82F6" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#34D399" stopOpacity="0.9" />
                </linearGradient>
                <filter id="arcGlow">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Outer Tick Mark Ring (36 ticks) */}
              <g stroke="#1E2638" strokeWidth="1.5">
                {Array.from({ length: 36 }).map((_, i) => {
                  const angle = (i * 10 * Math.PI) / 180;
                  const x1 = 100 + Math.cos(angle) * 92;
                  const y1 = 100 + Math.sin(angle) * 92;
                  const x2 = 100 + Math.cos(angle) * 85;
                  const y2 = 100 + Math.sin(angle) * 85;
                  return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={i % 3 === 0 ? '#2D3952' : '#1E2638'} />;
                })}
              </g>

              {/* Rotating Outer Arc 1 */}
              <circle
                cx="100"
                cy="100"
                r="82"
                fill="none"
                stroke="url(#arcGrad1)"
                strokeWidth="2.5"
                strokeDasharray="60 20 40 30 90 20"
                className="origin-center animate-[spin_16s_linear_infinite]"
                filter="url(#arcGlow)"
              />

              {/* Counter-Rotating Outer Arc 2 */}
              <circle
                cx="100"
                cy="100"
                r="72"
                fill="none"
                stroke="#3B82F6"
                strokeWidth="1.5"
                strokeDasharray="30 40 80 20"
                opacity="0.6"
                className="origin-center animate-[spin_24s_linear_infinite_reverse]"
              />

              {/* Inner Glowing Ring */}
              <circle
                cx="100"
                cy="100"
                r="60"
                fill="none"
                stroke="#10B981"
                strokeWidth="1"
                strokeDasharray="4 6"
                opacity="0.5"
              />

              {/* Cardinal Node Triangles / Points */}
              <circle cx="100" cy="18" r="3" fill="#34D399" />
              <circle cx="182" cy="100" r="3" fill="#34D399" />
              <circle cx="100" cy="182" r="3" fill="#34D399" />
              <circle cx="18" cy="100" r="3" fill="#34D399" />
            </svg>

            {/* Core Center Financial Display */}
            <div className="relative z-10 text-center space-y-1 bg-[#090D14]/90 p-6 rounded-full border border-[#1E2638] shadow-inner w-44 h-44 flex flex-col items-center justify-center">
              <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase">
                RECOVERED FUNDS
              </span>
              <div className="text-2xl font-bold font-mono text-white tracking-tight">
                <AnimatedCounter value={revenueRecovered} prefix="₹" isCurrency={true} />
              </div>
              <div className="flex items-center justify-center gap-1 text-[10px] font-mono font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30 mt-1">
                <TrendingUp className="w-3 h-3 text-emerald-400" />
                <span>{recoveredCount} SETTLED</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Telemetry Quadrants (3 Cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Recovery Rate Card */}
          <div className="p-4 rounded-xl bg-[#0D111A]/80 border border-emerald-500/30 space-y-1 shadow-sm">
            <div className="flex items-center justify-between text-[10px] font-mono font-bold text-emerald-400 uppercase">
              <span>Recovery Rate</span>
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <div className="text-xl font-bold font-mono text-white">
              <AnimatedCounter value={recoveryRate} suffix="%" />
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Portfolio recovery conversion
            </div>
          </div>

          {/* Interventions Card */}
          <div className="p-4 rounded-xl bg-[#0D111A]/80 border border-blue-500/30 space-y-1 shadow-sm">
            <div className="flex items-center justify-between text-[10px] font-mono font-bold text-blue-400 uppercase">
              <span>Interventions</span>
              <Activity className="w-3.5 h-3.5" />
            </div>
            <div className="text-xl font-bold font-mono text-white">
              <AnimatedCounter value={actionsExecuted} suffix=" Executions" />
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              100% Policy-bounded actions
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArcReactorCore;
