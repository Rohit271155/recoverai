import React from 'react';
import { Bot, ShieldCheck, Zap, Activity, CheckCircle2, Lock } from 'lucide-react';

export const AgentOpsPage = () => {
  const AGENTS = [
    {
      name: 'Risk Detector Agent',
      role: 'Surveillance & Anomaly Detection',
      status: 'ACTIVE',
      latency: '42ms',
      description: 'Monitors gateway webhooks, authentication drop-offs, and failure codes to classify risk levels.',
      checks: 'Evaluates transaction value, error codes, and customer payment history.',
    },
    {
      name: 'Recovery Strategist Agent',
      role: 'Diagnosis & Policy Recommendation',
      status: 'ACTIVE',
      latency: '120ms',
      description: 'Invokes machine learning reasoning models or fallback decision engine to select optimal intervention action.',
      checks: 'Computes recovery probability %, recommended action, and fallback strategy.',
    },
    {
      name: 'Deterministic Policy Engine',
      role: 'Safety Boundary Enforcement',
      status: 'AUTHORITATIVE',
      latency: '8ms',
      description: 'Evaluates hard policy safety constraints (max retries, contact caps, high-value limits).',
      checks: 'Validates MAX_RETRIES (3), RETRY_INTERVAL (6h), ESCALATION_THRESHOLD (₹50,000).',
    },
    {
      name: 'Recovery Executor & Analyst',
      role: 'Tool Execution & Audit Ledger',
      status: 'ACTIVE',
      latency: '210ms',
      description: 'Executes approved recovery tools (retryPayment, generatePaymentLink) and records immutable audit logs.',
      checks: 'Verifies tool output settlement and updates real-time database metrics.',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#141A26] border border-[#242F45]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-white tracking-tight">Recovery Engine Telemetry</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              4 CORE MODULES ACTIVE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Operational status of the autonomous recovery agents and policy engine safety guards</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {AGENTS.map((agent) => (
          <div key={agent.name} className="p-6 rounded-2xl bg-[#141A26] border border-[#242F45] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">{agent.name}</h3>
                  <span className="text-xs text-slate-400 font-mono">{agent.role}</span>
                </div>
              </div>

              <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold border ${
                agent.status === 'AUTHORITATIVE' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}>
                {agent.status}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{agent.description}</p>

            <div className="p-3 rounded-xl bg-[#0D111A] border border-[#242F45] text-xs space-y-1.5 font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Operational Check:</span>
                <span className="text-emerald-400 font-bold">100% Policy Bound</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>P99 Decision Latency:</span>
                <span className="text-slate-200">{agent.latency}</span>
              </div>
              <div className="text-slate-300 pt-1 border-t border-[#242F45]/60">
                {agent.checks}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgentOpsPage;
