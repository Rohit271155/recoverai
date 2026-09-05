import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  TrendingUp,
  AlertOctagon,
  ShieldCheck,
  Zap,
  Clock,
  ArrowRight,
  Play,
  Layers,
  Cpu,
} from 'lucide-react';
import ArcReactorCore from '../components/ArcReactorCore';
import FuturisticPipeline from '../components/FuturisticPipeline';
import RecoveryTrendChart from '../charts/RecoveryTrendChart';
import RecoveryQueueTable from '../components/RecoveryQueueTable';
import AIActivityFeed from '../components/AIActivityFeed';
import BatchRecoveryModal from '../components/BatchRecoveryModal';

gsap.registerPlugin(ScrollTrigger);

export const OverviewPage = ({ dashboardData, loading, onSelectTransaction, onNavigateQueue, onRefresh }) => {
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !dashboardData) return;

    const ctx = gsap.context(() => {
      // 1. Initial entrance animation sequence
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(
        '.gsap-arc-core',
        { opacity: 0, scale: 0.95, y: -16 },
        { opacity: 1, scale: 1, y: 0, duration: 0.7 }
      )
      .fromTo(
        '.gsap-pipeline-section',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5 },
        '-=0.3'
      );

      // 2. ScrollTrigger reveal for Priority Queue
      gsap.fromTo(
        '.gsap-queue-section',
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.gsap-queue-section',
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        }
      );

      // 3. ScrollTrigger reveal for Queue Rows Stagger
      gsap.fromTo(
        '.gsap-queue-row',
        { opacity: 0, x: -16 },
        {
          opacity: 1,
          x: 0,
          duration: 0.4,
          stagger: 0.04,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.gsap-queue-section',
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );

      // 4. ScrollTrigger reveal for Trajectory Chart & Activity Feed
      gsap.fromTo(
        '.gsap-analytics-grid',
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.gsap-analytics-grid',
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );

      // 5. ScrollTrigger reveal for Recent Monitored Events Table
      gsap.fromTo(
        '.gsap-recent-events',
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.gsap-recent-events',
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [dashboardData]);

  if (loading && !dashboardData) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400 font-mono">Initializing financial command telemetry...</p>
      </div>
    );
  }

  const kpis = dashboardData?.kpis || {
    revenueAtRisk: 0,
    revenueRecovered: 0,
    recoveryRate: 0,
    actionsExecuted: 0,
    atRiskCount: 0,
    recoveredCount: 0,
  };

  const dailyTrends = dashboardData?.dailyTrends || [];
  const recoveryQueue = dashboardData?.recoveryQueue || [];
  const aiActivityFeed = dashboardData?.aiActivityFeed || [];
  const recentTransactions = dashboardData?.recentTransactions || [];

  const eligibleAmount = recoveryQueue
    .filter(t => t.recoveryStatus !== 'RECOVERED')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  return (
    <div ref={containerRef} className="space-y-8">
      {/* SIGNATURE SECTION A: Stark Arc Reactor Financial Core Visualizer */}
      <div className="gsap-arc-core">
        <ArcReactorCore
          revenueRecovered={kpis.revenueRecovered}
          revenueAtRisk={kpis.revenueAtRisk}
          eligibleAmount={eligibleAmount}
          recoveryRate={kpis.recoveryRate}
          actionsExecuted={kpis.actionsExecuted}
          atRiskCount={kpis.atRiskCount}
          recoveredCount={kpis.recoveredCount}
        />
      </div>

      {/* SIGNATURE SECTION B: Autonomous Recovery Data Pipeline */}
      <div className="gsap-pipeline-section">
        <FuturisticPipeline
          activeStep={6}
          transactionId="TXN_DEMO_001"
          amount={18999}
        />
      </div>

      {/* PRIMARY WORK SURFACE: Priority Recovery Queue */}
      <div className="gsap-queue-section p-6 rounded-2xl bg-[#131822]/90 border border-[#1E2638] space-y-4 shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1E2638] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-tight uppercase font-mono flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400" />
                PRIORITY RECOVERY QUEUE
              </h2>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#1A2232] text-emerald-400 border border-[#242F45]">
                {recoveryQueue.length} Active Items
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-sans">
              Ranked by recovery probability score and policy check status
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsBatchModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md hover:shadow-emerald-900/40 transition-all transform active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Run Recovery Queue</span>
            </button>

            <button
              onClick={onNavigateQueue}
              className="text-xs font-semibold text-slate-300 hover:text-white transition-colors flex items-center gap-1 font-mono"
            >
              View Full Queue
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <RecoveryQueueTable
          transactions={recoveryQueue}
          onSelectTransaction={onSelectTransaction}
        />
      </div>

      {/* Analytics & Operations Activity Feed */}
      <div className="gsap-analytics-grid grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recovery Trend Chart (2 Cols) */}
        <div className="lg:col-span-2 p-6 rounded-2xl fintech-card backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between border-b border-[#1E2638] pb-3">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
                Recovery Trajectory vs Risk Ingestion
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                14-day aggregated recovery performance computed directly from transaction records
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium font-mono">
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Recovered
              </span>
              <span className="flex items-center gap-1 text-rose-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-rose-400"></span> At Risk
              </span>
            </div>
          </div>

          <RecoveryTrendChart data={dailyTrends} />
        </div>

        {/* Operations Activity Feed (1 Col) */}
        <div className="p-6 rounded-2xl fintech-card backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between border-b border-[#1E2638] pb-3">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                Operational Event Trail
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Live tool executions & audit records
              </p>
            </div>
          </div>

          <AIActivityFeed activities={aiActivityFeed} />
        </div>
      </div>

      {/* Recent Monitored Events */}
      <div className="gsap-recent-events p-6 rounded-2xl fintech-card backdrop-blur-md space-y-4">
        <div className="border-b border-[#1E2638] pb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
            Recent Monitored Failure Events
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Payment webhooks across subscriptions, checkout, and receivables
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0D111A] text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-[#1E2638] font-mono">
              <tr>
                <th className="py-3 px-4">Txn ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Event</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#161D2B]">
              {recentTransactions.slice(0, 6).map((txn) => (
                <tr key={txn.transactionId} className="hover:bg-[#1A2232] transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-emerald-400">
                    {txn.transactionId}
                  </td>
                  <td className="py-3 px-4 font-medium text-white">{txn.customerName}</td>
                  <td className="py-3 px-4 capitalize text-slate-300">
                    {txn.eventType?.replace(/_/g, ' ')}
                  </td>
                  <td className="py-3 px-4 text-slate-400 font-mono">{txn.paymentMethod}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-white">
                    ₹{txn.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-500 font-mono text-[11px]">
                    {new Date(txn.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Batch Recovery Modal */}
      <BatchRecoveryModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        onBatchComplete={() => {
          onRefresh?.();
        }}
      />
    </div>
  );
};

export default OverviewPage;
