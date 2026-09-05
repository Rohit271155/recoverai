import React, { useState, useEffect } from 'react';
import { Inbox, RefreshCw, Filter, Search } from 'lucide-react';
import api from '../services/api';
import RecoveryQueueTable from '../components/RecoveryQueueTable';

export const QueuePage = ({ onSelectTransaction }) => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  const loadQueue = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (filterType !== 'ALL') params.eventType = filterType;
      const res = await api.getRecoveryQueue(params);
      setQueue(res.data || []);
    } catch (err) {
      console.error('[QueuePage] Failed to load recovery queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, [search, filterType]);

  const filtered = queue;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#141A26] border border-[#242F45]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-white tracking-tight">Autonomous Recovery Queue</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              PRIORITIZED LIVE QUEUE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">High-probability opportunities ranked by recovery expected value and policy check status</p>
        </div>

        <button
          onClick={loadQueue}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#1A2234] hover:bg-[#1E2638] text-slate-200 text-xs font-semibold border border-[#242F45]"
        >
          <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
          Refresh Queue
        </button>
      </div>

      <div className="p-4 rounded-xl bg-[#141A26] border border-[#242F45] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search Customer or Transaction ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-[#0D111A] border border-[#242F45] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'PAYMENT_FAILURE', 'CHECKOUT_ABANDONMENT', 'SUBSCRIPTION_FAILURE', 'OVERDUE_RECEIVABLE'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-medium whitespace-nowrap border ${
                filterType === type ? 'bg-emerald-600 text-white border-emerald-500 font-bold' : 'bg-[#1A2234] text-slate-400 border-[#242F45]'
              }`}
            >
              {type.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-[#141A26] border border-[#242F45]">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400 font-mono">Loading recovery queue...</div>
        ) : (
          <RecoveryQueueTable transactions={filtered} onSelectTransaction={onSelectTransaction} />
        )}
      </div>
    </div>
  );
};

export default QueuePage;
