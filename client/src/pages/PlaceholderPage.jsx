import React from 'react';
import { Sparkles, Clock, ArrowLeft, Shield } from 'lucide-react';

export const PlaceholderPage = ({ title, description, phase, onBackToOverview }) => {
  return (
    <div className="p-8 rounded-xl fintech-card space-y-6 max-w-3xl mx-auto my-12 text-center">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
        <Sparkles className="w-7 h-7 text-indigo-400" />
      </div>

      <div className="space-y-2">
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
          {phase || 'Phase 2 / Phase 3 Implementation'}
        </span>
        <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
        <p className="text-sm text-slate-400 max-w-lg mx-auto">
          {description || 'This specialized module is scheduled for implementation in the next phase according to the project roadmap.'}
        </p>
      </div>

      <div className="pt-4 border-t border-slate-800/80 flex items-center justify-center gap-4">
        <button
          onClick={onBackToOverview}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Overview Dashboard
        </button>
      </div>
    </div>
  );
};

export default PlaceholderPage;
