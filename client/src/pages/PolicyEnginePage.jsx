import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Zap,
  Bot,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Sliders,
  UserCheck,
} from 'lucide-react';
import api from '../services/api';

gsap.registerPlugin(ScrollTrigger);

export const PolicyEnginePage = () => {
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [testScenario, setTestScenario] = useState('ALLOWED'); // ALLOWED vs BLOCKED demo test
  const containerRef = useRef(null);

  const fetchPolicy = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getPolicies();
      setPolicy(res.data);
    } catch (err) {
      console.error('[PolicyEnginePage] Error loading policy:', err);
      setError(err.message || 'Failed to load policy engine settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicy();
  }, []);

  useEffect(() => {
    if (!containerRef.current || !policy) return;

    const ctx = gsap.context(() => {
      // Timeline for header & pipeline
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(
        '.gsap-policy-header',
        { opacity: 0, y: -16 },
        { opacity: 1, y: 0, duration: 0.5 }
      )
      .fromTo(
        '.gsap-pipeline-step',
        { opacity: 0, scale: 0.9, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.45, stagger: 0.15 },
        '-=0.2'
      );

      // ScrollTrigger for Rules Grid
      gsap.fromTo(
        '.gsap-rule-card',
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.gsap-rules-section',
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );

      // ScrollTrigger for Simulator Box
      gsap.fromTo(
        '.gsap-simulator-box',
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.gsap-simulator-box',
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [policy]);

  return (
    <div ref={containerRef} className="space-y-8">
      {/* Header Bar */}
      <div className="gsap-policy-header flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#141A26] border border-[#242F45] shadow-lg">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-white tracking-tight font-mono">
              DETERMINISTIC POLICY ENGINE & SAFETY BOUNDARIES
            </h1>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              BOUNDED AUTONOMY AUTHORITATIVE GUARD
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Enforcing hard safety parameters: retry limits, contact caps, discount limits, and human escalation rules
          </p>
        </div>

        <button
          onClick={fetchPolicy}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1A2234] hover:bg-[#1E2638] text-slate-200 text-xs font-semibold border border-[#242F45] transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
          Reload Policy Rules
        </button>
      </div>

      {/* SECTION 1: Bounded Autonomy Visual Architecture Diagram */}
      <div className="p-6 rounded-2xl bg-[#141A26] border border-[#242F45] space-y-4 shadow-xl">
        <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider font-mono">
          <Lock className="w-4 h-4 text-emerald-400" />
          Bounded Autonomy Execution Hierarchy
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center text-center">
          {/* Step 1: AI Recommendation */}
          <div className="gsap-pipeline-step p-4 rounded-xl bg-[#0D111A] border border-blue-500/40 space-y-1">
            <Bot className="w-6 h-6 text-blue-400 mx-auto" />
            <span className="text-xs font-bold text-white block">1. AI Recommends</span>
            <span className="text-[10px] text-slate-400 block font-mono">Strategy & probability</span>
          </div>

          <div className="hidden md:flex justify-center text-slate-500">
            <ArrowRight className="w-5 h-5" />
          </div>

          {/* Step 2: Deterministic Policy Engine */}
          <div className="gsap-pipeline-step p-4 rounded-xl bg-emerald-950/40 border-2 border-emerald-500/60 space-y-1 shadow-[0_0_20px_-3px_rgba(16,185,129,0.4)]">
            <ShieldCheck className="w-6 h-6 text-emerald-400 mx-auto" />
            <span className="text-xs font-bold text-emerald-300 block">2. Policy Engine Validates</span>
            <span className="text-[10px] text-emerald-400 block font-mono">Enforces hard constraints</span>
          </div>

          <div className="hidden md:flex justify-center text-slate-500">
            <ArrowRight className="w-5 h-5" />
          </div>

          {/* Step 3: Allowed / Blocked */}
          <div className="gsap-pipeline-step p-4 rounded-xl bg-[#0D111A] border border-[#242F45] space-y-1">
            <Zap className="w-6 h-6 text-amber-400 mx-auto" />
            <span className="text-xs font-bold text-white block">3. Execution Control</span>
            <span className="text-[10px] text-slate-400 block font-mono">Execute Tool / Escalate</span>
          </div>
        </div>
      </div>

      {/* SECTION 2: Active Policy Rules Grid */}
      <div className="gsap-rules-section space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
          Active Deterministic Policy Rules
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Rule 1: Max Retries */}
          <div className="gsap-rule-card p-6 rounded-2xl bg-[#141A26] border border-[#242F45] space-y-3 shadow-md hover:border-slate-600 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                Max Retries Limit
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                ACTIVE
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-white">
              {policy?.maxRetries ?? 3} Attempts
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Prevents endless payment retries that trigger card scheme penalties or bank flags.
            </p>
          </div>

          {/* Rule 2: Retry Interval */}
          <div className="gsap-rule-card p-6 rounded-2xl bg-[#141A26] border border-[#242F45] space-y-3 shadow-md hover:border-slate-600 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                Cooldown Interval
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                ACTIVE
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-white">
              {policy?.retryIntervalHours ?? 6} Hours
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Minimum delay required between retry attempts for temporary bank declines.
            </p>
          </div>

          {/* Rule 3: Max Contact Attempts */}
          <div className="gsap-rule-card p-6 rounded-2xl bg-[#141A26] border border-[#242F45] space-y-3 shadow-md hover:border-slate-600 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                Outreach Limit
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                ACTIVE
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-white">
              {policy?.maxContactAttempts ?? 3} Messages
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Caps customer communication to prevent outreach spamming and brand fatigue.
            </p>
          </div>

          {/* Rule 4: Max Discount */}
          <div className="gsap-rule-card p-6 rounded-2xl bg-[#141A26] border border-[#242F45] space-y-3 shadow-md hover:border-slate-600 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                Max Discount Incentive
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                ACTIVE
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-white">
              {policy?.maxDiscountPercent ?? 10}% Cap
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Maximum allowable checkout discount incentive that can be offered automatically.
            </p>
          </div>

          {/* Rule 5: High Value Escalation */}
          <div className="gsap-rule-card p-6 rounded-2xl bg-[#141A26] border border-[#242F45] space-y-3 shadow-md hover:border-slate-600 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                High-Value Escalation
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                ESCALATION GUARD
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-white">
              ₹{(policy?.escalationThreshold ?? 50000).toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Transactions above ₹50,000 require manual human approval and finance team routing.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 3: Interactive Policy Blocked Demo Simulator State */}
      <div className="gsap-simulator-box p-6 rounded-2xl bg-[#141A26] border border-[#242F45] space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#242F45] pb-3">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Policy Safety Demo Inspector
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Demonstrating policy validation outcomes for compliant vs. restricted recovery attempts
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setTestScenario('ALLOWED')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border ${
                testScenario === 'ALLOWED'
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : 'bg-[#1A2234] text-slate-400 border-[#242F45]'
              }`}
            >
              ✓ Policy Allowed Scenario
            </button>
            <button
              onClick={() => setTestScenario('BLOCKED')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border ${
                testScenario === 'BLOCKED'
                  ? 'bg-rose-600 text-white border-rose-500'
                  : 'bg-[#1A2234] text-slate-400 border-[#242F45]'
              }`}
            >
              ✕ Policy Blocked Scenario
            </button>
          </div>
        </div>

        {testScenario === 'ALLOWED' ? (
          <div className="p-5 rounded-xl bg-emerald-950/20 border border-emerald-500/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                POLICY CHECK PASSED — EXECUTION PERMITTED
              </span>
              <span className="text-xs font-mono text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded">
                TXN_DEMO_001
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Proposed intervention: <strong>RETRY PAYMENT (₹18,999)</strong>. Retry count is 0/3, cooldown requirement satisfied, amount within ₹50,000 threshold.
            </p>
          </div>
        ) : (
          <div className="p-5 rounded-xl bg-rose-950/30 border-2 border-rose-500/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-rose-400" />
                RECOVERY BLOCKED BY POLICY ENGINE
              </span>
              <span className="text-xs font-mono text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded">
                TXN_DEMO_EXCEEDED
              </span>
            </div>
            <div className="text-xs text-slate-300 space-y-1">
              <p><strong>Reason:</strong> Maximum retry limit reached for transaction (3/3 retries executed).</p>
              <p><strong>Rule Constraint:</strong> MAX_RETRIES = 3</p>
              <p className="text-amber-400 font-bold">
                Next Action Enforced: ESCALATE TO HUMAN SUPPORT
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PolicyEnginePage;
