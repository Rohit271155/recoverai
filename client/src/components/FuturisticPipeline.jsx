import React from 'react';
import { AlertOctagon, ShieldAlert, Bot, ShieldCheck, Zap, CheckCircle2, ArrowRight } from 'lucide-react';

export const FuturisticPipeline = ({
  activeStep = 5,
  transactionId = 'TXN_DEMO_001',
  amount = 18999,
  isRecovered = false,
  isExecuting = false,
  isFailed = false,
  isEscalated = false,
  isStopped = false,
  recoveredAmount = 0,
}) => {
  let stage6Label = 'Ready to Execute';
  let stage6Desc = 'Awaiting Execution';
  let stage6Icon = Zap;
  let stage6Color = 'blue';

  if (isRecovered) {
    const finalAmount = recoveredAmount || amount;
    stage6Label = 'Settlement Complete';
    stage6Desc = `₹${finalAmount.toLocaleString('en-IN')} Recovered`;
    stage6Icon = CheckCircle2;
    stage6Color = 'emerald';
  } else if (isExecuting) {
    stage6Label = 'Executing Retry';
    stage6Desc = 'Processing Payment';
    stage6Icon = Zap;
    stage6Color = 'emerald';
  } else if (isFailed) {
    stage6Label = 'Recovery Failed';
    stage6Desc = 'Retry Unsuccessful';
    stage6Icon = ShieldAlert;
    stage6Color = 'rose';
  } else if (isEscalated) {
    stage6Label = 'Human Escalation';
    stage6Desc = 'Support Ticket Created';
    stage6Icon = ShieldAlert;
    stage6Color = 'amber';
  } else if (isStopped) {
    stage6Label = 'Recovery Stopped';
    stage6Desc = 'Execution Terminated';
    stage6Icon = ShieldAlert;
    stage6Color = 'slate';
  }

  const STAGES = [
    { id: 1, label: 'Payment Failure', icon: AlertOctagon, desc: 'Webhook Received', color: 'rose' },
    { id: 2, label: 'Risk Ingestion', icon: ShieldAlert, desc: 'Failure Analyzed', color: 'amber' },
    { id: 3, label: 'Recovery Score', icon: Bot, desc: 'ML Model Scored', color: 'blue' },
    { id: 4, label: 'Recovery Strategy', icon: Bot, desc: 'Strategy Formulated', color: 'blue' },
    { id: 5, label: 'Policy Engine Check', icon: ShieldCheck, desc: 'Hard Bounds Validated', color: 'emerald' },
    { id: 6, label: stage6Label, icon: stage6Icon, desc: stage6Desc, color: stage6Color },
  ];

  return (
    <div className="p-6 rounded-2xl bg-[#0D111A]/90 border border-[#1E2638] space-y-4 shadow-lg backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-[#1E2638] pb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-mono font-bold text-white tracking-wider uppercase">
            AUTONOMOUS RECOVERY DATA PIPELINE — {transactionId}
          </span>
        </div>
        <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded">
          PIPELINE ACTIVE
        </span>
      </div>

      {/* Horizontal Pipeline Steps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3 items-center relative py-2">
        {STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const isPassed = activeStep >= stage.id;
          const isCurrent = activeStep === stage.id;

          return (
            <div key={stage.id} className="relative group">
              <div
                className={`p-3.5 rounded-xl border transition-all duration-300 ${
                  isCurrent
                    ? 'bg-emerald-950/40 border-emerald-500 shadow-[0_0_15px_-3px_rgba(16,185,129,0.4)] scale-105'
                    : isPassed
                    ? 'bg-[#131822] border-[#242F45] text-slate-200'
                    : 'bg-[#090D14] border-[#1E2638] opacity-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center border ${
                      isPassed
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-[#1A2232] text-slate-500 border-[#1E2638]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 font-bold">
                    0{stage.id}
                  </span>
                </div>

                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-white tracking-tight">
                    {stage.label}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono truncate">
                    {stage.desc}
                  </div>
                </div>
              </div>

              {/* Arrow Connector (hidden on last step & on small screens) */}
              {idx < STAGES.length - 1 && (
                <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-slate-600">
                  <ArrowRight className="w-4 h-4 text-emerald-500/60" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FuturisticPipeline;
