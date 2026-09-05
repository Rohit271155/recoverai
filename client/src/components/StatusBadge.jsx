import React from 'react';

export const StatusBadge = ({ type, value }) => {
  if (!value) return null;

  // Event Types
  if (type === 'eventType') {
    switch (value) {
      case 'PAYMENT_FAILURE':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-950/50 text-rose-300 border border-rose-800/40">
            Payment Failure
          </span>
        );
      case 'CHECKOUT_ABANDONMENT':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-950/50 text-cyan-300 border border-cyan-800/40">
            Abandoned Cart
          </span>
        );
      case 'SUBSCRIPTION_FAILURE':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-950/50 text-indigo-300 border border-indigo-800/40">
            Subscription Fail
          </span>
        );
      case 'OVERDUE_RECEIVABLE':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-950/50 text-amber-300 border border-amber-800/40">
            Overdue Invoice
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
            {value}
          </span>
        );
    }
  }

  // Recovery Status
  if (type === 'recoveryStatus') {
    switch (value) {
      case 'RECOVERED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Recovered
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-950/50 text-blue-300 border border-blue-800/40">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
            In Progress
          </span>
        );
      case 'ANALYZED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-950/50 text-violet-300 border border-violet-800/40">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400"></span>
            AI Diagnosed
          </span>
        );
      case 'ESCALATED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-950/50 text-amber-300 border border-amber-800/40">
            Escalated
          </span>
        );
      case 'STOPPED':
      case 'FAILED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
            Stopped
          </span>
        );
      case 'NOT_STARTED':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-900 text-slate-400 border border-slate-800">
            Queued
          </span>
        );
    }
  }

  // Recommended Action
  if (type === 'action') {
    const formatted = value.replace(/_/g, ' ');
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-200 border border-slate-700">
        {formatted}
      </span>
    );
  }

  // Probability Badge
  if (type === 'probability') {
    const num = Number(value);
    let colorClass = 'text-rose-400 bg-rose-950/40 border-rose-800/30';
    if (num >= 75) {
      colorClass = 'text-emerald-400 bg-emerald-950/40 border-emerald-800/30';
    } else if (num >= 50) {
      colorClass = 'text-amber-400 bg-amber-950/40 border-amber-800/30';
    }

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${colorClass}`}>
        {num}%
      </span>
    );
  }

  return <span>{value}</span>;
};

export default StatusBadge;
