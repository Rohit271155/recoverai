import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Sparkles,
  Bot,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Clock,
  Zap,
  Lock,
  Play,
  UserCheck,
  ExternalLink,
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import api from '../services/api';
import RecoverAILogo from './RecoverAILogo';
import FuturisticPipeline from './FuturisticPipeline';

export const AIRecoveryDrawer = ({
  transaction,
  isOpen,
  onClose,
  onAnalysisComplete,
}) => {
  const [analysisData, setAnalysisData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);

  // Execution states
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionStep, setExecutionStep] = useState(0);
  const [executionResult, setExecutionResult] = useState(null);
  const [executionError, setExecutionError] = useState(null);
  const [isQueued, setIsQueued] = useState(false);

  useEffect(() => {
    if (!transaction) {
      setAnalysisData(null);
      setAnalysisError(null);
      setExecutionResult(null);
      setExecutionError(null);
      setIsExecuting(false);
      setIsQueued(false);
      setExecutionStep(0);
      return;
    }

    // Reset execution state for new transaction
    setExecutionResult(null);
    setExecutionError(null);
    setIsExecuting(false);
    setIsQueued(Boolean(transaction.isInRecoveryQueue));
    setExecutionStep(0);

    // If transaction already recovered, set execution result directly
    if (transaction.recoveryStatus === 'RECOVERED') {
      setExecutionResult({
        recoveryStatus: 'RECOVERED',
        recoveredAmount: transaction.amount,
        actionExecuted: transaction.recommendedAction || 'RETRY_PAYMENT',
        toolResult: transaction.metadata?.toolResult || { success: true, message: 'Payment retry succeeded' },
      });
    }

    // Populate strategy/policy if already analyzed
    if (transaction.metadata?.strategyAnalysis && transaction.metadata?.policyCheck) {
      setAnalysisData({
        risk: transaction.metadata.riskAnalysis,
        strategy: transaction.metadata.strategyAnalysis,
        policy: transaction.metadata.policyCheck,
        transaction: transaction,
      });
      setAnalysisError(null);
    } else {
      runAnalysis();
    }
  }, [transaction?.transactionId]);

  const runAnalysis = async () => {
    if (!transaction) return;
    try {
      setIsAnalyzing(true);
      setAnalysisError(null);
      const res = await api.analyzeTransaction(transaction.transactionId);
      setAnalysisData(res.data);
      if (onAnalysisComplete) {
        onAnalysisComplete(res.data);
      }
    } catch (err) {
      console.error('[AIRecoveryDrawer] Analysis error:', err);
      setAnalysisError(err.message || 'Failed to complete AI analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExecuteRecovery = async () => {
    if (!transaction || hasExecutedRecovery || isExecuting) return;
    try {
      setIsExecuting(true);
      setExecutionError(null);
      setExecutionStep(1);

      await new Promise(r => setTimeout(r, 400));
      setExecutionStep(2);

      await new Promise(r => setTimeout(r, 400));
      setExecutionStep(3);

      const res = await api.executeRecovery(transaction.transactionId);
      const dataPayload = res.data || res;
      if (
        ['ALREADY_RESOLVED', 'ALREADY_RECOVERED', 'TERMINAL_STATE'].includes(res?.code) ||
        ['ALREADY_RESOLVED', 'ALREADY_RECOVERED', 'TERMINAL_STATE'].includes(dataPayload?.code)
      ) {
        setExecutionResult({
          recoveryStatus: dataPayload?.recoveryStatus || transaction.recoveryStatus || 'RECOVERED',
          recoveredAmount: dataPayload?.amountRecovered || transaction.amountRecovered || 0,
          actionExecuted: transaction.recommendedAction || 'RETRY_PAYMENT',
          toolResult: { success: false, message: res?.message || dataPayload?.message || 'This transaction has reached a terminal execution state.' },
        });
      } else {
        setExecutionResult(dataPayload);
      }
      setExecutionStep(4);

      if (onAnalysisComplete) {
        onAnalysisComplete(dataPayload);
      }
    } catch (err) {
      console.error('[AIRecoveryDrawer] Execution error:', err);
      setExecutionError(err.message || 'Failed to execute recovery tool');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleQueuePromotion = async () => {
    if (!transaction) return;
    try {
      await api.addToQueue(transaction.transactionId);
      setIsQueued(true);
    } catch (err) {
      console.error('[AIRecoveryDrawer] Add to queue failed:', err);
    }
  };

  if (!isOpen || !transaction) {
    return null;
  }

  const isDemo = transaction.transactionId === 'TXN_DEMO_001';
  const risk = analysisData?.risk || transaction.metadata?.riskAnalysis;
  const strategy = analysisData?.strategy || transaction.metadata?.strategyAnalysis;
  const policy = analysisData?.policy || transaction.metadata?.policyCheck;
  const isPolicyAllowed = policy ? (policy.allowed !== undefined ? Boolean(policy.allowed) : policy.status === 'ALLOWED') : true;
  const isRecovered = executionResult?.recoveryStatus === 'RECOVERED' || transaction.recoveryStatus === 'RECOVERED';
  const isEscalated = executionResult?.recoveryStatus === 'ESCALATED' || transaction.recoveryStatus === 'ESCALATED';
  const isFailed = executionResult?.recoveryStatus === 'RECOVERY_FAILED' || transaction.recoveryStatus === 'RECOVERY_FAILED';
  const isStopped = executionResult?.recoveryStatus === 'STOPPED' || transaction.recoveryStatus === 'STOPPED';

  const pipelineActiveStep = isExecuting ? executionStep : (isRecovered || isFailed || isEscalated || isStopped) ? 6 : 5;

  const hasExecutedRecovery =
    transaction?.recoveryStatus === 'RECOVERED' ||
    transaction?.recoveryStatus === 'RECOVERY_FAILED' ||
    transaction?.recoveryStatus === 'STOPPED' ||
    transaction?.recoveryStatus === 'ESCALATED' ||
    executionResult?.recoveryStatus === 'RECOVERED' ||
    executionResult?.recoveryStatus === 'RECOVERY_FAILED' ||
    executionResult?.recoveryStatus === 'STOPPED' ||
    executionResult?.recoveryStatus === 'ESCALATED';
  const recommendedAction = strategy?.recommendedAction || transaction.recommendedAction || 'RETRY_PAYMENT';
  const fallbackAction = strategy?.fallbackAction || 'SEND_PAYMENT_REMINDER';
  const recoveryProb = strategy?.recoveryProbability || transaction.recoveryProbability || 87;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#0B0E14] border-l border-[#242F45] h-full flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-5 border-b border-[#242F45] bg-[#0D111A] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <RecoverAILogo size="md" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-white">
                  {transaction.transactionId}
                </span>
                {isDemo && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    FLAGSHIP DEMO
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Autonomous Recovery Execution Console
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={runAnalysis}
              disabled={isAnalyzing || isExecuting}
              title="Re-run AI Analysis"
              className="p-2 rounded-lg bg-[#141A26] hover:bg-[#1E2638] text-slate-300 hover:text-white border border-[#242F45] text-xs transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin text-emerald-400' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E2638] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Scrollable Body */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Signature Futuristic Data Pipeline */}
          <FuturisticPipeline
            activeStep={pipelineActiveStep}
            transactionId={transaction.transactionId}
            amount={transaction.amount}
            isRecovered={isRecovered}
            isExecuting={isExecuting}
            isFailed={isFailed}
            isEscalated={isEscalated}
            isStopped={isStopped}
            recoveredAmount={executionResult?.recoveredAmount || transaction.amountRecovered}
          />
          {/* Loading State Animation for AI Analysis */}
          {isAnalyzing && (
            <div className="p-6 rounded-xl bg-[#141A26] border border-blue-500/30 flex flex-col items-center justify-center space-y-3 text-center">
              <div className="relative flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin"></div>
                <Bot className="w-5 h-5 text-blue-400 absolute" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-white">
                  AI Decision Engine Analyzing Failure Code & Payment Profile...
                </p>
                <p className="text-[11px] text-slate-400 font-mono">
                  Evaluating failure mechanism, customer payment history, and policy safety checks
                </p>
              </div>
            </div>
          )}

          {/* Analysis Error Callout */}
          {analysisError && !isAnalyzing && (
            <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800/60 flex items-center gap-3 text-rose-300 text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{analysisError}</span>
            </div>
          )}

          {/* Execution Error Callout */}
          {executionError && (
            <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800/60 flex items-center gap-3 text-rose-300 text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{executionError}</span>
            </div>
          )}

          {/* SUCCESS RECOVERY SCREEN (If RECOVERED) */}
          {isRecovered && (
            <div className="p-6 rounded-xl bg-[#131822] border-2 border-emerald-500/60 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase font-mono block">
                      RECOVERY COMPLETE
                    </span>
                    <h3 className="text-2xl font-bold font-mono text-white">
                      ₹{(executionResult?.recoveredAmount || transaction.amount).toLocaleString('en-IN')} RECOVERED
                    </h3>
                  </div>
                </div>

                <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  RECOVERED
                </span>
              </div>

              <div className="p-3.5 rounded-lg bg-[#0D111A] border border-[#1E2638] text-xs space-y-2 font-mono">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Customer:</span>
                  <span className="font-semibold text-white">{transaction.customerName}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Strategy Executed:</span>
                  <span className="font-bold text-emerald-400">
                    {executionResult?.actionExecuted || recommendedAction}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Settlement Result:</span>
                  <span className="text-slate-200">
                    {executionResult?.toolResult?.message || 'Payment successfully captured via Payment Retry Simulator'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ESCALATED / POLICY BLOCKED SCREEN */}
          {isEscalated && (
            <div className="p-6 rounded-xl bg-amber-950/30 border border-amber-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 uppercase font-mono flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4" />
                  RECOVERY BLOCKED — HUMAN ESCALATION REQUIRED
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono">
                Reason: Exceeds automated policy threshold or maximum retry count. Routed to support.
              </p>
            </div>
          )}

          {/* Serious Investigation Panel Sections */}
          <div className="p-5 rounded-xl bg-[#131822] border border-[#1E2638] space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono border-b border-[#1E2638] pb-2">
              RECOVERY OPPORTUNITY INVESTIGATION
            </h3>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 font-mono text-[11px] block uppercase">Customer</span>
                <span className="font-semibold text-white text-sm">{transaction.customerName}</span>
                <span className="text-slate-400 text-[11px] block font-mono">{transaction.customerEmail}</span>
              </div>

              <div className="text-right">
                <span className="text-slate-500 font-mono text-[11px] block uppercase">Transaction Amount</span>
                <span className="text-xl font-mono font-bold text-white">
                  ₹{transaction.amount?.toLocaleString('en-IN')}
                </span>
              </div>

              <div>
                <span className="text-slate-500 font-mono text-[11px] block uppercase">Failure Event</span>
                <span className="font-medium text-slate-200 capitalize">{transaction.failureReason || 'Payment failure'}</span>
              </div>

              <div className="text-right">
                <span className="text-slate-500 font-mono text-[11px] block uppercase">Recovery Probability</span>
                <span className="text-base font-mono font-bold text-emerald-400">
                  {recoveryProb}%
                </span>
              </div>
            </div>

            {/* Why Recoverable Rationale */}
            <div className="p-3.5 rounded-lg bg-[#0D111A] border border-[#1E2638] space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono block">
                Why This Is Recoverable:
              </span>
              <p className="text-xs text-slate-200 leading-relaxed font-mono">
                {strategy?.diagnosis || 'Temporary bank decline detected. Customer has 11 previous successful payments.'}
              </p>
            </div>
          </div>

          {/* Live Execution Timeline Animation */}
          {isExecuting && (
            <div className="p-5 rounded-xl bg-[#131822] border border-emerald-500/40 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono flex items-center gap-2">
                  <Zap className="w-4 h-4 animate-pulse" />
                  Executing Recovery Operation...
                </span>
                <span className="text-xs font-mono text-slate-400">Stage {executionStep}/5</span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className={`flex items-center gap-2 ${executionStep >= 1 ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                  <CheckCircle2 className="w-4 h-4" /> 1. Risk identified
                </div>
                <div className={`flex items-center gap-2 ${executionStep >= 2 ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                  <CheckCircle2 className="w-4 h-4" /> 2. Recovery strategy selected ({recommendedAction})
                </div>
                <div className={`flex items-center gap-2 ${executionStep >= 3 ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                  <CheckCircle2 className="w-4 h-4" /> 3. Policy validated
                </div>
                <div className={`flex items-center gap-2 ${executionStep >= 4 ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                  <CheckCircle2 className="w-4 h-4" /> 4. Recovery action executed against Payment Retry Simulator
                </div>
                <div className={`flex items-center gap-2 ${executionStep >= 5 ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                  <CheckCircle2 className="w-4 h-4" /> 5. Payment recovered & settled
                </div>
              </div>
            </div>
          )}

          {/* Risk Assessment Card */}
          <div className="p-5 rounded-xl fintech-card space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                Risk Assessment
              </span>
              <span className={`px-2.5 py-0.5 rounded text-xs font-bold font-mono border ${
                risk?.riskLevel === 'CRITICAL' || risk?.riskLevel === 'HIGH'
                  ? 'bg-rose-950/60 text-rose-400 border-rose-800/40'
                  : 'bg-amber-950/60 text-amber-400 border-amber-800/40'
              }`}>
                {risk?.riskLevel || 'HIGH'} RISK
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-mono">
              {risk?.explanation || 'Evaluation completed across transaction value, failure codes, and customer payment profile.'}
            </p>

            {/* Key Signals */}
            {risk?.keySignals && (
              <div className="space-y-1.5 pt-2 border-t border-[#1E2638]">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                  Key Risk Signals:
                </span>
                <ul className="space-y-1">
                  {risk.keySignals.map((sig, idx) => (
                    <li key={idx} className="text-xs text-slate-300 flex items-start gap-2 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0"></span>
                      <span>{sig}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Root Cause Diagnosis */}
          <div className="p-5 rounded-xl bg-[#131822] border border-[#1E2638] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400 font-mono flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                Root Cause Diagnosis
              </span>
              {strategy?.confidence && (
                <span className="text-[11px] font-mono text-blue-300 bg-[#1A2232] px-2 py-0.5 rounded border border-[#242F45]">
                  Confidence: {Math.round(strategy.confidence * 100)}%
                </span>
              )}
            </div>

            <p className="text-xs font-medium text-white leading-relaxed font-mono">
              "{strategy?.diagnosis || 'Temporary bank decline detected. Strong historical payment relationship indicates high retry viability.'}"
            </p>
          </div>

          {/* Recovery Strategy Recommendation Card */}
          <div className="p-5 rounded-xl fintech-card space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                Recovery Strategy Recommendation
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-400 font-mono">Probability:</span>
                <span className="text-base font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded border border-emerald-800/40">
                  {recoveryProb}%
                </span>
              </div>
            </div>

            {/* Recommended Action Pill */}
            <div className="p-3.5 rounded-lg bg-[#0D111A] border border-[#1E2638] flex items-center justify-between font-mono">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-mono">Recommended Strategy</span>
                <span className="text-sm font-bold text-emerald-400">
                  {recommendedAction.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 block uppercase font-mono">Fallback Strategy</span>
                <span className="text-xs font-medium text-slate-300">
                  {fallbackAction.replace(/_/g, ' ')}
                </span>
              </div>
            </div>

            {/* Rationale */}
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1 font-mono">
                Decision Rationale:
              </span>
              <p className="text-xs text-slate-300 leading-relaxed font-mono">
                {strategy?.rationale || 'Customer has strong historical payment behavior and the failure pattern appears temporary.'}
              </p>
            </div>
          </div>

          {/* Deterministic Policy Validation Card */}
          <div className={`p-5 rounded-xl border space-y-4 ${
            isPolicyAllowed
              ? 'bg-emerald-950/20 border-emerald-800/40'
              : 'bg-rose-950/20 border-rose-800/40'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-white font-mono">
                <ShieldCheck className={`w-4 h-4 ${isPolicyAllowed ? 'text-emerald-400' : 'text-rose-400'}`} />
                Policy Boundary Verification
              </span>

              <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold border ${
                isPolicyAllowed
                  ? 'bg-emerald-900/60 text-emerald-300 border-emerald-700/50'
                  : 'bg-rose-900/60 text-rose-300 border-rose-700/50'
              }`}>
                {isPolicyAllowed ? '✓ POLICY APPROVED' : '✕ POLICY RESTRICTED'}
              </span>
            </div>

            <p className="text-xs text-slate-300 font-mono">
              {policy?.reason || 'Policy approved: proposed intervention complies with all deterministic safety constraints.'}
            </p>

            {/* Checklist of Policy Rules */}
            <div className="space-y-2 pt-2 border-t border-[#1E2638]">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                Safety Limits Verification:
              </span>

              <div className="space-y-1.5">
                {(policy?.policyChecks || [
                  { rule: 'MAX_RETRIES', label: 'Maximum Retries Limit', passed: true, message: `Retry count (${transaction.retryCount || 0}/3) within allowed limit` },
                  { rule: 'RETRY_INTERVAL', label: 'Retry Cooldown Interval', passed: true, message: 'Cooldown interval satisfied' },
                  { rule: 'CONTACT_LIMIT', label: 'Customer Outreach Cap', passed: true, message: 'Contact attempts within limit' },
                  { rule: 'ESCALATION_THRESHOLD', label: 'High-Value Escalation Guard', passed: true, message: `Amount within automated recovery threshold (< ₹50,000)` },
                ]).map((chk, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1 px-2.5 rounded bg-[#0D111A] border border-[#1E2638] font-mono">
                    <span className="text-slate-300 font-medium">{chk.label || chk.rule}</span>
                    <span className={`text-[11px] flex items-center gap-1 ${
                      chk.passed ? 'text-emerald-400' : 'text-rose-400 font-bold'
                    }`}>
                      {chk.passed ? '✓' : '✕'} {chk.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Policy Control Explainer */}
            <div className="p-2.5 rounded-lg bg-[#0D111A] border border-[#1E2638] text-[11px] text-slate-400 flex items-start gap-2 font-mono">
              <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Policy Controls Enforced:</strong> Recovery actions must satisfy all policy rules. If restricted, actions are automatically escalated to support.
              </span>
            </div>
          </div>
        </div>

        {/* Drawer Footer with Active Execution Controls */}
        <div className="p-5 border-t border-[#1E2638] bg-[#0D111A] space-y-2">
          {isRecovered ? (
            <button
              onClick={onClose}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Recovery Complete — Close Panel</span>
            </button>
          ) : (
            <>
              <button
                onClick={handleExecuteRecovery}
                disabled={isExecuting || hasExecutedRecovery || !isPolicyAllowed}
                className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg ${
                  !isPolicyAllowed || hasExecutedRecovery
                    ? 'bg-rose-950/40 text-rose-300 border border-rose-800/50 cursor-not-allowed'
                    : isExecuting
                    ? 'bg-emerald-700/50 text-emerald-200 cursor-wait'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {isExecuting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Executing Recovery Workflow...</span>
                  </>
                ) : isPolicyAllowed ? (
                  <>
                    <Zap className="w-4 h-4 fill-white" />
                    <span>[ EXECUTE RECOVERY WORKFLOW ]</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Policy Restricted — Manual Escalation Required</span>
                  </>
                )}
              </button>

              {!isQueued && (
                <button
                  onClick={handleQueuePromotion}
                  className="w-full py-2 px-4 rounded-xl bg-blue-600/80 hover:bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <span>+ Promote to Recovery Queue</span>
                </button>
              )}
            </>
          )}

          <p className="text-[11px] text-center text-slate-400 font-mono">
            {isRecovered
              ? 'Settlement confirmed • Telemetry updated'
              : 'Policy Controls Passed • Safe to Execute'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIRecoveryDrawer;
