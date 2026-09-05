import React from 'react';
import { CheckCircle2, ShieldCheck, ArrowRight, Play } from 'lucide-react';
import StatusBadge from './StatusBadge';

export const RecoveryQueueTable = ({ transactions = [], onSelectTransaction }) => {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 font-mono text-xs border border-[#1E2638] rounded-xl bg-[#0D111A]">
        No at-risk transactions currently queued for recovery.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs text-slate-300">
        <thead className="bg-[#0D111A] text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-[#1E2638] font-mono">
          <tr>
            <th className="py-3.5 px-4">Priority</th>
            <th className="py-3.5 px-4">Customer</th>
            <th className="py-3.5 px-4">Failure Issue</th>
            <th className="py-3.5 px-4 text-right">Amount</th>
            <th className="py-3.5 px-4 text-center">Probability</th>
            <th className="py-3.5 px-4">Recommended Action</th>
            <th className="py-3.5 px-4">Policy State</th>
            <th className="py-3.5 px-4 text-center">Primary Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#161D2B]">
          {transactions.map((txn, index) => {
            const isDemo = txn.transactionId === 'TXN_DEMO_001';
            const isRecovered = txn.recoveryStatus === 'RECOVERED';
            const isExecuting = txn.recoveryStatus === 'EXECUTING';

            return (
              <tr
                key={txn.transactionId}
                className={`gsap-queue-row transition-all duration-200 hover:bg-[#1A2232] group ${
                  isDemo ? 'bg-[#131B2A] border-l-2 border-l-emerald-500' : ''
                }`}
              >
                {/* Priority */}
                <td className="py-4 px-4 font-mono text-slate-400">
                  #{index + 1}
                </td>

                {/* Customer */}
                <td className="py-4 px-4">
                  <div className="font-semibold text-white text-sm group-hover:text-emerald-300 transition-colors">
                    {txn.customerName || 'Customer'}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">{txn.transactionId}</div>
                </td>

                {/* Issue / Event */}
                <td className="py-4 px-4">
                  <div className="text-slate-200 capitalize font-medium">
                    {txn.failureReason || 'Payment failure'}
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase font-mono">
                    {txn.eventType?.replace(/_/g, ' ')}
                  </div>
                </td>

                {/* Amount */}
                <td className="py-4 px-4 text-right font-mono font-bold text-white text-sm">
                  ₹{txn.amount.toLocaleString('en-IN')}
                </td>

                {/* Probability */}
                <td className="py-4 px-4 text-center">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-bold bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 shadow-sm">
                    {txn.recoveryProbability ?? 87}%
                  </span>
                </td>

                {/* Recommended Action */}
                <td className="py-4 px-4 font-medium text-slate-200">
                  {txn.recommendedAction?.replace(/_/g, ' ') || 'Retry payment'}
                </td>

                {/* Policy State */}
                <td className="py-4 px-4">
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Eligible
                  </span>
                </td>

                {/* Action */}
                <td className="py-4 px-4 text-center">
                  {isRecovered ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Recovered
                    </span>
                  ) : isExecuting ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                      Executing...
                    </span>
                  ) : (
                    <button
                      onClick={() => onSelectTransaction?.(txn)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all transform active:scale-95"
                    >
                      <span>[ EXECUTE RECOVERY ]</span>
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default RecoveryQueueTable;
