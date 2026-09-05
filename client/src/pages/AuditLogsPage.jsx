import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ScrollText,
  ShieldCheck,
  Zap,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  UserCheck,
  Search,
  Filter,
  RefreshCw,
  Clock,
  Lock,
} from 'lucide-react';
import api from '../services/api';

gsap.registerPlugin(ScrollTrigger);

const EVENT_CONFIG = {
  RECOVERY_SUCCEEDED: {
    color: 'emerald',
    icon: CheckCircle2,
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  },
  PAYMENT_RECOVERED: {
    color: 'emerald',
    icon: CheckCircle2,
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  },
  POLICY_CHECK_COMPLETED: {
    color: 'blue',
    icon: ShieldCheck,
    badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  },
  POLICY_REVALIDATED: {
    color: 'blue',
    icon: ShieldCheck,
    badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  },
  HUMAN_ESCALATION_CREATED: {
    color: 'amber',
    icon: UserCheck,
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  },
  RECOVERY_BLOCKED: {
    color: 'rose',
    icon: Lock,
    badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
  },
  RECOVERY_FAILED: {
    color: 'rose',
    icon: XCircle,
    badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
  },
  RECOVERY_EXECUTION_STARTED: {
    color: 'emerald',
    icon: Zap,
    badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  },
  DEFAULT: {
    color: 'slate',
    icon: ScrollText,
    badgeBg: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
  },
};

export const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEvent, setFilterEvent] = useState('ALL');
  const containerRef = useRef(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getAuditLogs({ limit: 100 });
      setLogs(res.data || []);
    } catch (err) {
      console.error('[AuditLogsPage] Error loading audit logs:', err);
      setError(err.message || 'Failed to fetch audit trail records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    if (!containerRef.current || logs.length === 0) return;
    const ctx = gsap.context(() => {
      // Header entrance
      gsap.fromTo(
        '.gsap-audit-header',
        { opacity: 0, y: -16 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }
      );

      // Staggered timeline card reveals on scroll
      const items = containerRef.current.querySelectorAll('.gsap-reveal-item');
      items.forEach((item) => {
        gsap.fromTo(
          item,
          { opacity: 0, x: -16 },
          {
            opacity: 1,
            x: 0,
            duration: 0.4,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: item,
              start: 'top 92%',
              toggleActions: 'play none none none',
            },
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, [logs, filterEvent, searchQuery]);

  const filteredLogs = logs.filter(log => {
    const matchesSearch =
      !searchQuery ||
      log.transactionId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.event?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = filterEvent === 'ALL' || log.event === filterEvent;

    return matchesSearch && matchesFilter;
  });

  return (
    <div ref={containerRef} className="space-y-8">
      {/* Header Bar */}
      <div className="gsap-audit-header flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#141A26] border border-[#242F45] shadow-lg">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-white tracking-tight font-mono">
              IMMUTABLE AUDIT TRAIL & LEDGER
            </h1>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
              ACCOUNTABILITY VERIFIED
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Complete event stream recording every risk signal, policy check result, and autonomous execution outcome
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1A2234] hover:bg-[#1E2638] text-slate-200 text-xs font-semibold border border-[#242F45] transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
          Refresh Event Stream
        </button>
      </div>

      {/* Filter Controls */}
      <div className="p-5 rounded-xl bg-[#141A26] border border-[#242F45] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by Transaction ID, Event, or Actor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#0D111A] border border-[#242F45] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'RECOVERY_SUCCEEDED', 'HUMAN_ESCALATION_CREATED', 'RECOVERY_FAILED', 'RECOVERY_BLOCKED'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilterEvent(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium whitespace-nowrap transition-all border ${
                filterEvent === cat
                  ? 'bg-emerald-600 text-white border-emerald-500 font-bold'
                  : 'bg-[#1A2234] text-slate-400 border-[#242F45] hover:border-slate-600'
              }`}
            >
              {cat.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Loading / Error States */}
      {loading && (
        <div className="p-12 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-400 font-mono">Retrieving audit event stream...</p>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs">
          {error}
        </div>
      )}

      {/* Timeline Stream View */}
      {!loading && !error && (
        <div className="p-6 rounded-2xl bg-[#141A26] border border-[#242F45] space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#242F45] pb-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Chronological Audit Event Timeline ({filteredLogs.length} Events)
            </span>
          </div>

          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-500 font-mono text-xs">
              No audit log events match your filter criteria.
            </div>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#242F45]">
              {filteredLogs.map((log) => {
                const conf = EVENT_CONFIG[log.event] || EVENT_CONFIG.DEFAULT;
                const Icon = conf.icon;
                const date = new Date(log.timestamp || log.createdAt);

                return (
                  <div key={log._id} className="gsap-reveal-item relative group">
                    {/* Timeline Node Icon */}
                    <div className="absolute -left-6 top-1.5 w-5 h-5 rounded-full bg-[#0D111A] border-2 border-slate-700 flex items-center justify-center group-hover:border-emerald-500 transition-colors">
                      <Icon className="w-3 h-3 text-slate-300" />
                    </div>

                    {/* Timeline Content Card */}
                    <div className="p-4.5 rounded-xl bg-[#0D111A] border border-[#242F45] hover:border-slate-600 transition-all space-y-2.5 shadow-md">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold border ${conf.badgeBg}`}>
                            {log.event.replace(/_/g, ' ')}
                          </span>
                          <span className="font-mono font-bold text-white text-xs">
                            {log.transactionId}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                          <span>Actor: <strong className="text-slate-200">{log.actor?.replace(/_/g, ' ')}</strong></span>
                          <span>•</span>
                          <span>{date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                        </div>
                      </div>

                      {/* Log Metadata Details */}
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <div className="p-3.5 rounded-lg bg-[#141A26] border border-[#242F45] text-xs font-mono text-slate-300 space-y-1">
                          {log.metadata.amountRecovered && (
                            <div className="text-emerald-400 font-bold">
                              Amount Recovered: ₹{log.metadata.amountRecovered.toLocaleString('en-IN')}
                            </div>
                          )}
                          {log.metadata.action && (
                            <div>Action Driver: <span className="text-slate-200">{log.metadata.action}</span></div>
                          )}
                          {log.metadata.reason && (
                            <div className="text-slate-400">Reason: {log.metadata.reason}</div>
                          )}
                          {log.metadata.ticketId && (
                            <div className="text-amber-400">Escalation Ticket ID: {log.metadata.ticketId}</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AuditLogsPage;
