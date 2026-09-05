import React from 'react';
import { X, Sparkles, Shield, User, CreditCard, AlertTriangle, ArrowRight } from 'lucide-react';
import StatusBadge from './StatusBadge';

export const TransactionModal = ({ transaction, onClose }) => {
  if (!transaction) return null;

  const isDemo = transaction.transactionId === 'TXN_DEMO_001';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-[#0D1322] border border-slate-700/80 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-sm font-bold text-white">
              {transaction.transactionId}
            </span>
            {isDemo && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                FLAGSHIP DEMO
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Main stats callout */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400">Revenue at Risk</span>
              <div className="text-2xl font-bold font-mono text-white">
                ₹{transaction.amount?.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">Recovery Probability</span>
              <div className="text-xl font-bold font-mono text-emerald-400">
                {transaction.recoveryProbability}%
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/80">
              <span className="text-slate-400 block mb-1">Customer</span>
              <span className="font-semibold text-white">{transaction.customerName}</span>
              <span className="text-slate-500 block text-[11px] truncate">{transaction.customerEmail}</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/80">
              <span className="text-slate-400 block mb-1">Event Type</span>
              <StatusBadge type="eventType" value={transaction.eventType} />
            </div>

            <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/80">
              <span className="text-slate-400 block mb-1">Failure Reason</span>
              <span className="font-medium text-rose-300 capitalize">{transaction.failureReason}</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/80">
              <span className="text-slate-400 block mb-1">Payment Method</span>
              <span className="font-medium text-slate-200">{transaction.paymentMethod}</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/80">
              <span className="text-slate-400 block mb-1">Retry Count</span>
              <span className="font-mono font-semibold text-white">{transaction.retryCount} of 3</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/80">
              <span className="text-slate-400 block mb-1">Recommended Action</span>
              <span className="font-semibold text-indigo-300">
                {transaction.recommendedAction?.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          {/* Phase Notice */}
          <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-semibold text-indigo-200 block">
                Ready for Phase 2 Autonomous Diagnosis
              </span>
              <span className="text-indigo-300/80">
                In Phase 2, the Risk Detector and Recovery Strategist will provide full multi-factor root cause diagnosis, policy verification checkmarks, and automated execution workflow.
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;
