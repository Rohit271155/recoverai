import React, { useState, useEffect } from 'react';
import { Users, RefreshCw, Search, ShieldCheck } from 'lucide-react';
import api from '../services/api';

export const CustomersPage = ({ title, categoryFilter, onSelectTransaction }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      if (categoryFilter) {
        const res = await api.getTransactions({ eventType: categoryFilter, limit: 50 });
        setItems(res.data || []);
      } else {
        const res = await api.getCustomers({ limit: 50 });
        setItems(res.data || []);
      }
    } catch (err) {
      console.error('[CustomersPage] Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [categoryFilter]);

  const isScenario = Boolean(categoryFilter);

  const filtered = items.filter(item => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      item.customerName?.toLowerCase().includes(s) ||
      item.customerEmail?.toLowerCase().includes(s) ||
      item.name?.toLowerCase().includes(s) ||
      item.email?.toLowerCase().includes(s) ||
      item.transactionId?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#141A26] border border-[#242F45]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-white tracking-tight">{title || 'Customer Payment Profiles'}</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
              {isScenario ? `${categoryFilter.replace(/_/g, ' ')} RECORDS` : 'HISTORICAL TRACK RECORD'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isScenario
              ? `Scenario-specific event monitoring and recovery tracking for ${categoryFilter.replace(/_/g, ' ')}`
              : 'Customer reliability ratings, total recovered lifetime value, and payment method health'}
          </p>
        </div>

        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#1A2234] hover:bg-[#1E2638] text-slate-200 text-xs font-semibold border border-[#242F45]"
        >
          <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
          Refresh Stream
        </button>
      </div>

      <div className="p-4 rounded-xl bg-[#141A26] border border-[#242F45]">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search Txn ID, Customer Name or Email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-[#0D111A] border border-[#242F45] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-[#141A26] border border-[#242F45]">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400 font-mono">Loading scenario profiles...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#0D111A] text-[11px] uppercase tracking-wider text-slate-400 border-b border-[#242F45] font-mono">
                <tr>
                  {isScenario && <th className="py-3 px-4 font-semibold">Txn ID</th>}
                  <th className="py-3 px-4 font-semibold">Customer</th>
                  <th className="py-3 px-4 font-semibold">{isScenario ? 'Failure Mechanism' : 'Email'}</th>
                  <th className="py-3 px-4 font-semibold text-center">{isScenario ? 'Payment Method' : 'Payment History'}</th>
                  <th className="py-3 px-4 font-semibold text-right">{isScenario ? 'Amount' : 'Lifetime Recovered'}</th>
                  <th className="py-3 px-4 font-semibold text-center">{isScenario ? 'Status' : 'Reliability Rating'}</th>
                  {isScenario && <th className="py-3 px-4 font-semibold text-center">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#242F45]/60">
                {filtered.map((item) => {
                  const isResolved = item.resolved || item.recoveryStatus === 'RECOVERED';
                  return (
                    <tr key={item.transactionId || item._id || item.email} className="hover:bg-[#1A2234] transition-colors">
                      {isScenario && (
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                          {item.transactionId}
                        </td>
                      )}
                      <td className="py-3.5 px-4 font-medium text-white">
                        {item.customerName || item.name}
                        {isScenario && item.customerEmail && (
                          <span className="block text-[11px] text-slate-400 font-mono font-normal">{item.customerEmail}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 capitalize">
                        {isScenario ? item.failureReason : item.email}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-slate-300">
                        {isScenario ? item.paymentMethod : `${item.successfulPaymentsCount || 11} Successful`}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                        ₹{(item.amount || item.totalRecoveredAmount || 18999).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {isScenario ? (
                          isResolved ? (
                            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
                              ✓ RECOVERED
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950/60 text-rose-300 border border-rose-800/40">
                              {item.recoveryStatus || 'AT_RISK'}
                            </span>
                          )
                        ) : (
                          <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {item.reliabilityTier || 'HIGH RELIABILITY'}
                          </span>
                        )}
                      </td>
                      {isScenario && (
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => onSelectTransaction?.(item)}
                            className="px-3 py-1 rounded bg-[#1E2638] hover:bg-slate-700 text-emerald-300 text-xs font-bold border border-emerald-500/30 transition-colors"
                          >
                            Inspect Risk
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomersPage;
