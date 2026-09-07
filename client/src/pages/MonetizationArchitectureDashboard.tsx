import React, { useState } from 'react';
import {
  DollarSign,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Lock,
  Unlock,
  Building2,
  Users,
  Briefcase,
  GraduationCap,
  Play,
  RefreshCw,
  Award,
  CreditCard,
  Layers,
  ChevronRight,
  HelpCircle,
  Activity,
  Check,
  Plus,
  X,
  FileText
} from 'lucide-react';
import { MonetizationService } from '../services/monetizationService';
import { runMonetizationArchitectureEngineTests, TestResultItem } from '../services/monetizationArchitectureEngineTests';
import { Step40Report, PlanTier, EntitlementKey, Subscription } from '../types';

export const MonetizationArchitectureDashboard: React.FC = () => {
  const [report, setReport] = useState<Step40Report>(() => MonetizationService.getFinalReport());
  const [activeTab, setActiveTab] = useState<'revenue_models' | 'plan_tiers' | 'usage_limits' | 'payment_adapters' | 'diagnostics'>('revenue_models');

  // Interactive Test User State
  const [simulatedUserId] = useState<string>('usr_demo_101');
  const [currentSub, setCurrentSub] = useState<Subscription>(() => MonetizationService.getUserSubscription('usr_demo_101'));
  const [selectedEntitlementKey, setSelectedEntitlementKey] = useState<EntitlementKey>('resume_upload_limit');

  // Diagnostics state
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState<boolean>(false);
  const [diagnosticResults, setDiagnosticResults] = useState<{ passed: boolean; results: TestResultItem[] } | null>(null);

  const refreshData = () => {
    setReport(MonetizationService.getFinalReport());
    setCurrentSub(MonetizationService.getUserSubscription(simulatedUserId));
  };

  const handleRunDiagnostics = () => {
    setIsRunningDiagnostics(true);
    setTimeout(() => {
      const res = runMonetizationArchitectureEngineTests();
      setDiagnosticResults(res);
      setIsRunningDiagnostics(false);
      refreshData();
    }, 500);
  };

  const handleUpgradeSandbox = (tier: PlanTier) => {
    const updated = MonetizationService.upgradeSubscriptionSandbox(simulatedUserId, tier);
    setCurrentSub(updated);
    refreshData();
  };

  const handleRecordUsageSample = () => {
    MonetizationService.recordUsage(simulatedUserId, selectedEntitlementKey, 1);
    refreshData();
  };

  const usageLimitCheck = MonetizationService.checkUsageLimit(simulatedUserId, selectedEntitlementKey);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-indigo-950 text-white rounded-2xl p-6 shadow-xl border border-amber-500/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
              <DollarSign className="w-7 h-7 animate-pulse" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white">Monetization &amp; Entitlements Control Center</h1>
                <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-amber-500/30 text-amber-300 border border-amber-400/40">
                  STEP 40
                </span>
              </div>
              <p className="text-amber-200/80 text-sm">
                5 Plan Tiers • 8 Revenue Stream Analyses • Gateway Abstraction Layer • Zero Candidate Job Search Degradation
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={refreshData}
            className="px-3.5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 font-semibold text-xs transition flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Architecture
          </button>

          <button
            onClick={handleRunDiagnostics}
            disabled={isRunningDiagnostics}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center gap-2 disabled:opacity-50"
          >
            {isRunningDiagnostics ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-slate-950" />}
            Run 14 Monetization Tests
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="flex justify-between items-center text-slate-400 text-xs font-medium mb-1">
            <span>Commercial Plan Tiers</span>
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">
            5 Active Tiers
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Free, Premium, Employer, Institution, Admin
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="flex justify-between items-center text-slate-400 text-xs font-medium mb-1">
            <span>Revenue Models Architected</span>
            <Briefcase className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-sky-400">
            8 Revenue Streams
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Recruitment, SaaS, Campus, Affiliates
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="flex justify-between items-center text-slate-400 text-xs font-medium mb-1">
            <span>Payment Gateway Adapter</span>
            <CreditCard className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-400">
            Mock Sandbox Mode
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Stripe &amp; Razorpay Ready (Zero Charges)
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="flex justify-between items-center text-slate-400 text-xs font-medium mb-1">
            <span>Candidate Protection Guard</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">
            100% UN-DEGRADED
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Basic Candidate Job Search Completely Free
          </div>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('revenue_models')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-2 ${
            activeTab === 'revenue_models'
              ? 'bg-amber-600 text-slate-950 font-bold shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          8 Revenue Model Analyses
        </button>

        <button
          onClick={() => setActiveTab('plan_tiers')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-2 ${
            activeTab === 'plan_tiers'
              ? 'bg-amber-600 text-slate-950 font-bold shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          5 Plan Tiers &amp; Entitlement Matrix
        </button>

        <button
          onClick={() => setActiveTab('usage_limits')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-2 ${
            activeTab === 'usage_limits'
              ? 'bg-amber-600 text-slate-950 font-bold shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          Live Usage Limit Evaluator
        </button>

        <button
          onClick={() => setActiveTab('payment_adapters')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-2 ${
            activeTab === 'payment_adapters'
              ? 'bg-amber-600 text-slate-950 font-bold shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Payment Gateway Abstraction
        </button>

        <button
          onClick={() => setActiveTab('diagnostics')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-2 ${
            activeTab === 'diagnostics'
              ? 'bg-amber-600 text-slate-950 font-bold shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          14-Point Diagnostic Suite
          {diagnosticResults && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${diagnosticResults.passed ? 'bg-emerald-400 text-slate-950 font-bold' : 'bg-rose-500 text-white'}`}>
              {diagnosticResults.passed ? 'PASS' : 'FAIL'}
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: 8 Revenue Model Analyses */}
      {activeTab === 'revenue_models' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-amber-400" />
                  Sustainable Revenue Model Architecture (8 Channels)
                </h3>
                <p className="text-xs text-slate-400">
                  Comprehensive architectural evaluation of candidate, employer, institutional, and partnership monetization models.
                </p>
              </div>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold rounded-full">
                Zero Candidate Degradation
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.revenueModels.map((m) => (
                <div
                  key={m.id}
                  className="bg-slate-950 border border-slate-800 hover:border-amber-500/40 p-5 rounded-xl space-y-3 transition flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold rounded">
                        {m.category}
                      </span>
                      <span className="px-2 py-0.5 bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded text-[10px] font-semibold">
                        {m.readinessStatus}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-white">{m.modelName}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">{m.valueProposition}</p>

                    <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-xs space-y-1.5 font-mono">
                      <div>
                        <span className="text-slate-400">Target Audience:</span>{' '}
                        <span className="text-slate-200">{m.targetAudience}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Pricing Structure:</span>{' '}
                        <span className="text-amber-300 font-semibold">{m.pricingStructure}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-900 flex justify-between items-center text-xs">
                    <span className="text-slate-400">Candidate Experience Impact:</span>
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold rounded flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      {m.candidateImpact}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: 5 Plan Tiers & Entitlement Matrix */}
      {activeTab === 'plan_tiers' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-400" />
                  Commercial Plan Tiers &amp; Entitlement Matrix
                </h3>
                <p className="text-xs text-slate-400">
                  Detailed comparison of features and usage quotas across the 5 commercial plan tiers.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {report.plans.map((p) => (
                <div
                  key={p.id}
                  className={`p-5 rounded-xl border flex flex-col justify-between space-y-4 transition ${
                    p.tier === currentSub.tier
                      ? 'bg-slate-950 border-amber-500 shadow-xl shadow-amber-500/10'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="px-2.5 py-0.5 bg-slate-900 text-slate-300 border border-slate-800 text-[10px] font-bold rounded">
                        {p.tier} TIER
                      </span>
                      {p.tier === currentSub.tier && (
                        <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold rounded">
                          Active Sandbox Tier
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-white">{p.name}</h4>
                      <div className="text-xl font-bold text-amber-400 mt-1">
                        {p.priceMonthlyINR === 0 ? '₹0 Free' : `₹${p.priceMonthlyINR.toLocaleString()}/mo`}
                        <span className="text-xs text-slate-400 font-normal ml-1">
                          ({p.priceMonthlyUSD === 0 ? '$0' : `$${p.priceMonthlyUSD}/mo`})
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed">{p.description}</p>

                    <div className="space-y-1.5 pt-2">
                      <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Features Included</div>
                      {p.features.map((f, idx) => (
                        <div key={idx} className="text-xs text-slate-300 flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleUpgradeSandbox(p.tier)}
                    disabled={p.tier === currentSub.tier}
                    className={`w-full py-2 rounded-lg font-bold text-xs transition ${
                      p.tier === currentSub.tier
                        ? 'bg-slate-900 text-slate-500 border border-slate-800 cursor-default'
                        : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md'
                    }`}
                  >
                    {p.tier === currentSub.tier ? 'Current Active Tier' : `Switch to ${p.tier} Sandbox`}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Live Usage Limit Evaluator */}
      {activeTab === 'usage_limits' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-sky-400" />
                  Live Entitlement &amp; Usage Limit Evaluator
                </h3>
                <p className="text-xs text-slate-400">
                  Simulate user entitlement checks and test empirical usage quota enforcement.
                </p>
              </div>

              {/* Tier & Entitlement Switchers */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">Simulate Tier:</span>
                  {(['Free', 'Premium', 'Employer', 'Institution', 'Admin'] as PlanTier[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => handleUpgradeSandbox(t)}
                      className={`px-2.5 py-1 rounded text-xs font-semibold ${
                        currentSub.tier === t
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Evaluator Controls */}
              <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-4">
                <h4 className="text-sm font-bold text-white">Select Entitlement to Evaluate</h4>

                <div className="space-y-2">
                  {report.entitlements.map((e) => (
                    <label
                      key={e.key}
                      className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition ${
                        selectedEntitlementKey === e.key
                          ? 'bg-slate-900 border-amber-500/60'
                          : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="entitlement"
                          checked={selectedEntitlementKey === e.key}
                          onChange={() => setSelectedEntitlementKey(e.key)}
                          className="accent-amber-500"
                        />
                        <div>
                          <div className="text-xs font-bold text-white">{e.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{e.key}</div>
                        </div>
                      </div>

                      <span className="text-[10px] text-slate-400">
                        {e.allowedPlanTiers.includes(currentSub.tier) ? (
                          <span className="text-emerald-400 font-bold">Permitted</span>
                        ) : (
                          <span className="text-rose-400 font-bold">Restricted</span>
                        )}
                      </span>
                    </label>
                  ))}
                </div>

                <button
                  onClick={handleRecordUsageSample}
                  className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Simulate Usage (+1 Action)
                </button>
              </div>

              {/* Evaluation Output Result */}
              <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-4">
                <h4 className="text-sm font-bold text-white">Evaluation Output Result</h4>

                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Active User:</span>
                    <span className="text-slate-200">{simulatedUserId}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Active Subscription Tier:</span>
                    <span className="text-amber-400 font-bold">{currentSub.tier}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Evaluated Entitlement:</span>
                    <span className="text-sky-300">{selectedEntitlementKey}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Access Status:</span>
                    {usageLimitCheck.allowed ? (
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded font-bold">
                        ALLOWED (PERMITTED)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded font-bold">
                        EXCEEDED (PAYWALL / UPGRADE NEEDED)
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between pt-2 border-t border-slate-800">
                    <span className="text-slate-400">Current Empirical Usage:</span>
                    <span className="text-white font-bold">{usageLimitCheck.currentUsage} {usageLimitCheck.unitName}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Tier Quota Limit:</span>
                    <span className="text-white font-bold">
                      {usageLimitCheck.maxLimit === -1 ? 'Unlimited (-1)' : `${usageLimitCheck.maxLimit} ${usageLimitCheck.unitName}`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Payment Gateway Abstraction */}
      {activeTab === 'payment_adapters' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <span className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
                <CreditCard className="w-6 h-6" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-white">Payment Provider Gateway Abstraction Adapter</h3>
                <p className="text-xs text-slate-400">
                  Decoupled payment gateway abstraction interface preventing vendor lock-in.
                </p>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm text-slate-200">Active Gateway Adapter</span>
                <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full font-bold text-xs">
                  {report.paymentConfig.providerName} (Sandbox Mode)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs font-mono">
                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-1">
                  <div className="text-slate-400">Sandbox Endpoint</div>
                  <div className="text-sky-300 font-semibold">{report.paymentConfig.apiEndpoint}</div>
                </div>

                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-1">
                  <div className="text-slate-400">Webhook Signature Verification</div>
                  <div className="text-emerald-400 font-bold">✓ Enabled (`verifyWebhookSignature`)</div>
                </div>

                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-1">
                  <div className="text-slate-400">Live Payment Charges</div>
                  <div className="text-emerald-400 font-bold">✓ 0 Real Charges Processed</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: 14-Point Diagnostic Test Suite */}
      {activeTab === 'diagnostics' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-400" />
                  14-Point Sustainable Business Model Diagnostic Suite
                </h3>
                <p className="text-xs text-slate-400">
                  Automated test suite asserting 5 Plan Tiers, Candidate Non-Degradation Guard, Entitlements, and Sandbox Adapters.
                </p>
              </div>

              <button
                onClick={handleRunDiagnostics}
                disabled={isRunningDiagnostics}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center gap-2 disabled:opacity-50"
              >
                {isRunningDiagnostics ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-slate-950" />}
                Run Full Monetization Diagnostics
              </button>
            </div>

            {diagnosticResults ? (
              <div className="space-y-3">
                <div className={`p-4 rounded-xl border flex items-center justify-between ${
                  diagnosticResults.passed
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    <div>
                      <div className="font-bold text-sm">
                        {diagnosticResults.passed ? 'ALL 14 MONETIZATION DIAGNOSTICS PASSED' : 'SOME DIAGNOSTICS FAILED'}
                      </div>
                      <div className="text-xs opacity-80">
                        {diagnosticResults.results.filter(r => r.passed).length} of {diagnosticResults.results.length} assertions verified successfully.
                      </div>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-slate-950 rounded-full text-xs font-mono border border-slate-800">
                    Status: ARCHITECTURE READY
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                  {diagnosticResults.results.map((res, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border transition ${
                        res.passed
                          ? 'bg-slate-950 border-slate-800 hover:border-emerald-500/30'
                          : 'bg-rose-950/30 border-rose-800/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2">
                          <span className={`p-1 rounded mt-0.5 ${res.passed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                            <Check className="w-3.5 h-3.5" />
                          </span>
                          <div>
                            <div className="text-xs font-bold text-slate-200">{res.name}</div>
                            <div className="text-[11px] text-slate-400 mt-1">{res.message}</div>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${res.passed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                          {res.passed ? 'PASS' : 'FAIL'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-8 text-center space-y-3">
                <Activity className="w-10 h-10 text-slate-600 mx-auto animate-pulse" />
                <h4 className="text-sm font-bold text-slate-300">Monetization Diagnostic Suite Ready</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Click "Run Full Monetization Diagnostics" above to execute all 14 empirical tests for entitlement matrix evaluation, usage limits, candidate protection guard, and sandbox adapters.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
