import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  TrendingUp,
  AlertOctagon,
  ShieldCheck,
  Zap,
  BarChart3,
  Lightbulb,
  CheckCircle2,
  XCircle,
  UserCheck,
  RefreshCw,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import api from '../services/api';
import KPICard from '../components/KPICard';

gsap.registerPlugin(ScrollTrigger);

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

export const RecoveryAnalyticsPage = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getAnalytics();
      setAnalyticsData(res.data);
    } catch (err) {
      console.error('[RecoveryAnalyticsPage] Error loading analytics:', err);
      setError(err.message || 'Failed to load recovery analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  useEffect(() => {
    if (!containerRef.current || !analyticsData) return;

    const ctx = gsap.context(() => {
      // Entrance Timeline for top section
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(
        '.gsap-analytics-header',
        { opacity: 0, y: -16 },
        { opacity: 1, y: 0, duration: 0.5 }
      )
      .fromTo(
        '.gsap-analytics-kpi',
        { opacity: 0, y: 20, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.45, stagger: 0.08 },
        '-=0.2'
      );

      // ScrollTrigger for Charts Grid
      gsap.fromTo(
        '.gsap-charts-grid',
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.gsap-charts-grid',
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );

      // ScrollTrigger for Breakdown Table & Donut
      gsap.fromTo(
        '.gsap-breakdown-grid',
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.gsap-breakdown-grid',
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [analyticsData]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400 font-mono">Aggregating portfolio analytics from database...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs flex justify-between items-center">
        <span>{error}</span>
        <button
          onClick={fetchAnalytics}
          className="px-3 py-1.5 rounded bg-rose-900 hover:bg-rose-800 text-white font-bold"
        >
          Retry
        </button>
      </div>
    );
  }

  const summary = analyticsData?.summary || {};
  const recoveryByAction = analyticsData?.recoveryByAction || [];
  const recoveryByEventType = analyticsData?.recoveryByEventType || [];

  // Compute deterministic operational insights from real data
  let topActionInsight = null;
  let lowestEventInsight = null;

  if (recoveryByAction.length > 0) {
    const sortedActions = [...recoveryByAction].sort((a, b) => b.recoveredAmount - a.recoveredAmount);
    const top = sortedActions[0];
    if (top) {
      topActionInsight = `${top.action.replace(/_/g, ' ')} is currently the highest-performing recovery action, yielding ₹${top.recoveredAmount.toLocaleString('en-IN')} across ${top.count} executions with a ${top.successRate}% success rate.`;
    }
  }

  if (recoveryByEventType.length > 0) {
    const sortedEvents = [...recoveryByEventType].sort((a, b) => a.recoveryRate - b.recoveryRate);
    const lowest = sortedEvents[0];
    if (lowest) {
      lowestEventInsight = `${lowest.eventType.replace(/_/g, ' ')} has the lowest recovery rate at ${lowest.recoveryRate}% (₹${lowest.atRiskAmount.toLocaleString('en-IN')} remains at risk).`;
    }
  }

  // Outcome data for Pie chart
  const outcomeData = [
    { name: 'Recovered', value: summary.successfulRecoveries || 0, color: '#10B981' },
    { name: 'Escalated', value: summary.escalations || 0, color: '#F59E0B' },
    { name: 'Failed', value: summary.failedRecoveries || 0, color: '#EF4444' },
    { name: 'Blocked', value: summary.blockedActions || 0, color: '#64748B' },
  ].filter(d => d.value > 0);

  return (
    <div ref={containerRef} className="space-y-8">
      {/* Page Header */}
      <div className="gsap-analytics-header flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#141A26] border border-[#242F45] shadow-lg">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-white tracking-tight font-mono">
              RECOVERY PERFORMANCE ANALYTICS
            </h1>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              REAL-TIME DATABASE TELEMETRY
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Quantitative evaluation of revenue recovery yield, tool effectiveness, and event-type conversion
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1A2234] hover:bg-[#1E2638] text-slate-200 text-xs font-semibold border border-[#242F45] transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
          Refresh Analytics
        </button>
      </div>

      {/* SECTION A: Key Performance Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="gsap-analytics-kpi">
          <KPICard
            title="Revenue At Risk"
            value={summary.totalRevenueAtRisk || 0}
            prefix="₹"
            isCurrency={true}
            subtitle="Identified financial exposure"
            icon={AlertOctagon}
            variant="risk"
          />
        </div>

        <div className="gsap-analytics-kpi">
          <KPICard
            title="Revenue Recovered"
            value={summary.totalRevenueRecovered || 0}
            prefix="₹"
            isCurrency={true}
            subtitle="Settled & captured revenue"
            icon={TrendingUp}
            variant="recovered"
          />
        </div>

        <div className="gsap-analytics-kpi">
          <KPICard
            title="Recovery Efficiency Rate"
            value={summary.recoveryRate || 0}
            suffix="%"
            subtitle="Overall portfolio recovery yield"
            icon={ShieldCheck}
            variant="neutral"
          />
        </div>

        <div className="gsap-analytics-kpi">
          <KPICard
            title="Total Interventions"
            value={(summary.successfulRecoveries || 0) + (summary.escalations || 0) + (summary.failedRecoveries || 0)}
            subtitle={`${summary.escalations || 0} policy bounded escalations`}
            icon={Zap}
            variant="amber"
          />
        </div>
      </div>

      {/* SECTION B: Deterministic Operational Insights Callout */}
      {(topActionInsight || lowestEventInsight) && (
        <div className="p-5 rounded-xl bg-gradient-to-r from-[#141A26] via-[#1A2234] to-[#141A26] border border-blue-500/30 flex items-start gap-3 shadow-md">
          <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/30 shrink-0 mt-0.5">
            <Lightbulb className="w-5 h-5 text-blue-400" />
          </div>
          <div className="space-y-1 text-xs">
            <span className="font-bold text-white uppercase tracking-wider block font-mono">
              Deterministic Operational Insight
            </span>
            {topActionInsight && <p className="text-slate-200">{topActionInsight}</p>}
            {lowestEventInsight && <p className="text-slate-400">{lowestEventInsight}</p>}
          </div>
        </div>
      )}

      {/* SECTION C & D: Recharts Event Breakdown & Action Effectiveness */}
      <div className="gsap-charts-grid grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recovery by Event Type Chart */}
        <div className="p-6 rounded-2xl bg-[#141A26] border border-[#242F45] space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Revenue Yield by Loss Scenario
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Recovered funds vs. at-risk amount across event classifications
            </p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={recoveryByEventType} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#242F45" />
                <XAxis dataKey="eventType" tick={{ fill: '#94A3B8', fontSize: 10 }} tickFormatter={v => v.replace(/_/g, ' ')} />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 10 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0D111A', borderColor: '#242F45', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Amount']}
                />
                <Bar dataKey="recoveredAmount" name="Recovered" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="atRiskAmount" name="At Risk" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Action Effectiveness Chart */}
        <div className="p-6 rounded-2xl bg-[#141A26] border border-[#242F45] space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Action Effectiveness & Revenue Yield
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Total recovered amount generated by each autonomous tool driver
            </p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={recoveryByAction} layout="vertical" margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#242F45" />
                <XAxis type="number" tick={{ fill: '#94A3B8', fontSize: 10 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <YAxis dataKey="action" type="category" tick={{ fill: '#94A3B8', fontSize: 10 }} tickFormatter={v => v.replace(/_/g, ' ')} width={130} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0D111A', borderColor: '#242F45', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Recovered']}
                />
                <Bar dataKey="recoveredAmount" fill="#3B82F6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SECTION E: Detailed Breakdown Tables */}
      <div className="gsap-breakdown-grid grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Action Driver Details Table (2 Cols) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#141A26] border border-[#242F45] space-y-4">
          <h3 className="text-sm font-bold text-white tracking-tight">
            Intervention Tool Driver Performance Table
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#0D111A] text-[11px] uppercase tracking-wider text-slate-400 border-b border-[#242F45]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Action Driver</th>
                  <th className="py-3 px-4 font-semibold text-center">Executions</th>
                  <th className="py-3 px-4 font-semibold text-right">Recovered Amount</th>
                  <th className="py-3 px-4 font-semibold text-center">Success Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#242F45]/60">
                {recoveryByAction.map((act) => (
                  <tr key={act._id} className="hover:bg-[#1A2234] transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {act.action.replace(/_/g, ' ')}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-slate-300">
                      {act.count}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">
                      ₹{act.recoveredAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {act.successRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Outcome Breakdown Donut (1 Col) */}
        <div className="p-6 rounded-2xl bg-[#141A26] border border-[#242F45] space-y-4">
          <h3 className="text-sm font-bold text-white tracking-tight">
            Outcome Distribution
          </h3>
          <div className="h-48 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={outcomeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {outcomeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0D111A', borderColor: '#242F45', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2.5 pt-3 border-t border-[#242F45]">
            {outcomeData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-300 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                  {item.name}
                </span>
                <span className="font-mono font-bold text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecoveryAnalyticsPage;
