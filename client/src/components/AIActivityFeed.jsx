import React from 'react';
import { Bot, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export const AIActivityFeed = ({ activities = [] }) => {
  if (!activities || activities.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-slate-500">
        No recent activity recorded yet.
      </div>
    );
  }

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Just now';
    const diffMs = Date.now() - new Date(timestamp).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const getToneIcon = (tone, event) => {
    if (tone === 'success' || event?.includes('SUCCEEDED') || event?.includes('RECOVERED')) {
      return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
    }
    if (tone === 'warning' || event?.includes('FAILED') || event?.includes('RISK')) {
      return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
    }
    return <Bot className="w-3.5 h-3.5 text-indigo-400" />;
  };

  return (
    <div className="space-y-3">
      {activities.slice(0, 8).map((item) => (
        <div
          key={item.id || item.transactionId + item.timestamp}
          className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/60 hover:border-slate-700/60 transition-colors flex items-start gap-3"
        >
          <div className="mt-0.5 p-1.5 rounded-md bg-slate-800/80 shrink-0">
            {getToneIcon(item.tone, item.event)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-200 truncate">
                {item.title || item.event}
              </span>
              <span className="text-[11px] text-slate-500 shrink-0 font-mono">
                {formatTimeAgo(item.timestamp)}
              </span>
            </div>

            <p className="text-xs text-slate-400 mt-0.5 truncate">
              {item.metadata?.reason || item.metadata?.action || `Ref: ${item.transactionId}`}
              {item.metadata?.amountRecovered ? ` • ₹${item.metadata.amountRecovered.toLocaleString('en-IN')} recovered` : ''}
              {item.metadata?.amount ? ` • ₹${item.metadata.amount.toLocaleString('en-IN')} at risk` : ''}
            </p>

            <div className="flex items-center gap-2 mt-1.5">
              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-500 uppercase">
                Actor: {item.actor?.replace(/_/g, ' ')}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AIActivityFeed;
