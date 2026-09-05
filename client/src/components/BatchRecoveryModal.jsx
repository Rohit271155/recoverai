import React, { useState } from 'react';
import { Play, CheckCircle2, AlertTriangle, RefreshCw, X, Zap, ShieldCheck } from 'lucide-react';
import api from '../services/api';

export const BatchRecoveryModal = ({ isOpen, onClose, onBatchComplete }) => {
  const [batchSize, setBatchSize] = useState(25);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleRunBatch = async () => {
    try {
      setIsRunning(true);
      setError(null);
      setResult(null);

      const res = await api.runBatchRecovery(batchSize);
      setResult(res.data);
      if (onBatchComplete) {
        onBatchComplete(res.data);
      }
    } catch (err) {
      console.error('[BatchRecoveryModal] Error running batch:', err);
      setError(err.message || 'Batch recovery execution failed');
    } finally {
      setIsRunning(false);
    }
  };

  const handleClose = () => {
    setResult(null);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-150 p-4">
      <div className="w-full max-w-lg bg-[#141A26] border border-[#242F45] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-[#242F45] bg-[#0D111A] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">AUTONOMOUS RECOVERY</h3>
              <p className="text-xs text-slate-400">Process eligible transactions under policy boundaries</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E2638] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {!result && !isRunning && (
            <>
              <div className="p-4 rounded-xl bg-[#1A2234] border border-[#242F45] space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Policy Boundary Protection
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  This action will process eligible transactions using the same recovery policies applied to individual transactions.
                </p>
              </div>

              {/* Batch Size Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 block uppercase tracking-wider font-mono">
                  Batch Execution Size:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[10, 25, 50, 100].map((size) => (
                    <button
                      key={size}
                      onClick={() => setBatchSize(size)}
                      className={`py-2.5 rounded-lg font-mono text-xs font-bold transition-all border ${
                        batchSize === size
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                          : 'bg-[#1A2234] text-slate-300 border-[#242F45] hover:border-slate-600'
                      }`}
                    >
                      [ {size} ]
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Running State */}
          {isRunning && (
            <div className="p-8 text-center space-y-4">
              <div className="relative inline-flex items-center justify-center">
                <div className="w-14 h-14 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin"></div>
                <Zap className="w-6 h-6 text-emerald-400 absolute" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-white">Running Autonomous Recovery Batch...</p>
                <p className="text-xs text-slate-400 font-mono">
                  Evaluating policy constraints for {batchSize} items
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && !isRunning && (
            <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800/60 flex items-center gap-3 text-rose-300 text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Completed Result Summary */}
          {result && !isRunning && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-center space-y-1">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="text-lg font-bold text-white uppercase tracking-wider font-mono">BATCH COMPLETE</h4>
                <p className="text-xs text-emerald-300 font-mono">
                  Transactions processed: <strong>{result.processed ?? result.processedCount ?? 0}</strong>
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-[#1A2234] border border-[#242F45] text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Revenue Recovered</span>
                  <span className="text-lg font-bold font-mono text-emerald-400">
                    ₹{(result.revenueRecovered ?? result.totalRecoveredAmount ?? 0).toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    Recovered: {result.successfulRecoveries ?? result.recoveredCount ?? 0}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#1A2234] border border-[#242F45] text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Escalated</span>
                  <span className="text-lg font-bold font-mono text-amber-400">
                    {result.escalated ?? result.escalatedCount ?? 0}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono">Policy bounded</span>
                </div>

                <div className="p-3 rounded-xl bg-[#1A2234] border border-[#242F45] text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Failed</span>
                  <span className="text-lg font-bold font-mono text-slate-400">
                    {result.failedRecoveries ?? result.failedCount ?? 0}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono">Unrecoverable</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-[#242F45] bg-[#0D111A] flex justify-end gap-3">
          {result ? (
            <button
              onClick={handleClose}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors"
            >
              Done & Update Telemetry
            </button>
          ) : (
            <>
              <button
                onClick={handleClose}
                disabled={isRunning}
                className="px-4 py-2 rounded-xl bg-[#1A2234] hover:bg-[#1E2638] text-slate-300 text-xs font-semibold border border-[#242F45]"
              >
                Cancel
              </button>
              <button
                onClick={handleRunBatch}
                disabled={isRunning}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                Run Autonomous Recovery ({batchSize})
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BatchRecoveryModal;
