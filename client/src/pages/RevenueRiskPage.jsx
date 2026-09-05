import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, RefreshCw, Filter, Bot, Zap, ArrowRight } from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';

export const RevenueRiskPage = ({ onSelectTransaction }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await api.getTransactions();
      setTransactions(res.data || []);
    } catch (err) {
      console.error('Failed to load risk transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleAddToQueue = async (txnId) => {
    try {
      await api.addToQueue(txnId);
      setTransactions(prev =>
        prev.map(t => (t.transactionId === txnId ? { ...t, isInRecoveryQueue: true } : t))
      );
    } catch (err) {
      console.error('Failed to add to queue:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#141A26] border border-[#242F45]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-white tracking-tight">Revenue Risk Surveillance</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
              SURVEILLANCE ACTIVE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Real-time payment failure monitoring across gateway webhooks and auth drop-offs</p>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center font-mono text-xs text-slate-400">Loading risk surveillance stream...</div>
      ) : (
        <div className="p-5 rounded-2xl bg-[#141A26] border border-[#242F45] space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#0D111A] text-[11px] uppercase tracking-wider text-slate-400 border-b border-[#242F45]">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Txn ID</th>
                  <th className="py-2.5 px-4 font-semibold">Customer</th>
                  <th className="py-2.5 px-4 font-semibold">Failure Mechanism</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Amount</th>
                  <th className="py-2.5 px-4 font-semibold text-center">Risk Status</th>
                  <th className="py-2.5 px-4 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#242F45]/60">
                {transactions.map((t) => {
                  const isResolved = t.resolved || t.recoveryStatus === 'RECOVERED';
                  const isQueued = t.isInRecoveryQueue;
                  return (
                    <tr key={t.transactionId} className="hover:bg-[#1A2234]">
                      <td className="py-3 px-4 font-mono font-bold text-emerald-400">{t.transactionId}</td>
                      <td className="py-3 px-4 text-white font-medium">{t.customerName}</td>
                      <td className="py-3 px-4 capitalize text-slate-300">{t.failureReason}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-white">₹{t.amount?.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4 text-center">
                        {isResolved ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
                            ✓ RESOLVED (₹{(t.amountRecovered || t.amount).toLocaleString('en-IN')})
                          </span>
                        ) : isQueued ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-950/60 text-blue-300 border border-blue-800/40">
                            IN RECOVERY QUEUE
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950/60 text-rose-300 border border-rose-800/40">
                            {t.metadata?.riskAnalysis?.riskLevel || 'HIGH'} RISK
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center space-x-2">
                        <button
                          onClick={() => onSelectTransaction(t)}
                          className="px-3 py-1 rounded bg-[#1E2638] hover:bg-slate-700 text-emerald-300 text-xs font-bold border border-emerald-500/30"
                        >
                          Inspect Risk
                        </button>
                        {!isResolved && !isQueued && (
                          <button
                            onClick={() => handleAddToQueue(t.transactionId)}
                            className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm"
                          >
                            + Add to Queue
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default RevenueRiskPage;
