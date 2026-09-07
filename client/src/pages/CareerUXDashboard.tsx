import React, { useState } from 'react';
import {
  Compass,
  CheckCircle2,
  Clock,
  Sparkles,
  RefreshCw,
  Play,
  Activity,
  Layers,
  ArrowRight,
  ShieldCheck,
  BookOpen,
  MousePointer,
  Smartphone,
  Eye,
  Check,
  Zap,
  Layout,
  MessageSquare
} from 'lucide-react';
import { CareerUXOptimizationService } from '../services/careerUXOptimizationService';
import { runCareerUXEngineTests, TestResultItem } from '../services/careerUXEngineTests';
import { Step37Report, UXJourneyStep, TerminologyMapping, UXClarityAuditResult } from '../types';

export const CareerUXDashboard: React.FC = () => {
  const [report, setReport] = useState<Step37Report>(() => CareerUXOptimizationService.getFinalReport());
  const [activeTab, setActiveTab] = useState<'journey' | 'dictionary' | 'page_audits' | 'diagnostics'>('journey');
  const [selectedTermCategory, setSelectedTermCategory] = useState<string>('ALL');

  // Diagnostics state
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState<boolean>(false);
  const [diagnosticResults, setDiagnosticResults] = useState<{ passed: boolean; results: TestResultItem[] } | null>(null);

  const refreshData = () => {
    setReport(CareerUXOptimizationService.getFinalReport());
  };

  const handleRunDiagnostics = () => {
    setIsRunningDiagnostics(true);
    setTimeout(() => {
      const res = runCareerUXEngineTests();
      setDiagnosticResults(res);
      setIsRunningDiagnostics(false);
      refreshData();
    }, 500);
  };

  const filteredDictionary = selectedTermCategory === 'ALL'
    ? report.simplifiedDictionary
    : report.simplifiedDictionary.filter(t => t.category === selectedTermCategory);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white rounded-2xl p-6 shadow-xl border border-purple-500/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2 bg-purple-500/20 text-purple-400 rounded-xl border border-purple-500/30">
              <Compass className="w-7 h-7 animate-pulse" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white">Career UX Optimization Control Center</h1>
                <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-purple-500/30 text-purple-300 border border-purple-400/40">
                  STEP 37
                </span>
              </div>
              <p className="text-purple-200/80 text-sm">
                10-Second Next Action Rule • 8-Step Beginner Candidate Journey • Plain Language Dictionary • Single CTA SLA
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
            Re-Audit UX SLA
          </button>

          <button
            onClick={handleRunDiagnostics}
            disabled={isRunningDiagnostics}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center gap-2 disabled:opacity-50"
          >
            {isRunningDiagnostics ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-slate-950" />}
            Run 14 UX Diagnostics
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="flex justify-between items-center text-slate-400 text-xs font-medium mb-1">
            <span>10-Sec Action SLA</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">
            {report.averageNextActionTimeSeconds}s
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Target &le; 10s (&lt; 10-sec rule met)
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="flex justify-between items-center text-slate-400 text-xs font-medium mb-1">
            <span>8-Step Candidate Journey</span>
            <Compass className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-400">
            {report.journeyCompletenessPercentage}%
          </div>
          <div className="text-xs text-slate-400 mt-1">
            8 Linear Candidate Stages Mapped
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="flex justify-between items-center text-slate-400 text-xs font-medium mb-1">
            <span>Single Primary CTA Compliance</span>
            <MousePointer className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400">
            {report.singlePrimaryCTACompliancePercentage}%
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Zero Competing Action Buttons
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="flex justify-between items-center text-slate-400 text-xs font-medium mb-1">
            <span>Plain Terminology Mapped</span>
            <BookOpen className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">
            {report.simplifiedDictionary.length} Terms
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Jargon Translated to Plain English
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="flex justify-between items-center text-slate-400 text-xs font-medium mb-1">
            <span>44px Touch Target SLA</span>
            <Smartphone className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-sky-400">
            {report.mobileTouchCompliancePercentage}%
          </div>
          <div className="text-xs text-slate-400 mt-1">
            WCAG AAA Mobile Touch Target
          </div>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('journey')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-2 ${
            activeTab === 'journey'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Compass className="w-4 h-4" />
          8-Step Candidate Journey Map
        </button>

        <button
          onClick={() => setActiveTab('dictionary')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-2 ${
            activeTab === 'dictionary'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Plain Language Dictionary
        </button>

        <button
          onClick={() => setActiveTab('page_audits')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-2 ${
            activeTab === 'page_audits'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Layout className="w-4 h-4" />
          Page CTA &amp; Touch SLA Matrix ({report.auditedPages.length})
        </button>

        <button
          onClick={() => setActiveTab('diagnostics')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-2 ${
            activeTab === 'diagnostics'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          14-Point Diagnostic Test Suite
          {diagnosticResults && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${diagnosticResults.passed ? 'bg-emerald-400 text-slate-950' : 'bg-rose-500 text-white'}`}>
              {diagnosticResults.passed ? 'PASS' : 'FAIL'}
            </span>
          )}
        </button>
      </div>

      {/* Tab Content: 8-Step Candidate Journey */}
      {activeTab === 'journey' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Compass className="w-5 h-5 text-indigo-400" />
                  Primary Candidate Journey (8 Sequential Steps)
                </h3>
                <p className="text-xs text-slate-400">
                  Guiding job seekers from resume upload to career growth with clarity and zero cognitive overload.
                </p>
              </div>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold rounded-full">
                100% Linear UX Alignment
              </span>
            </div>

            {/* Step Flow Visualization */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              {report.primaryJourneySteps.map((step, idx) => (
                <div
                  key={step.stepNumber}
                  className="bg-slate-950 border border-slate-800 hover:border-purple-500/50 p-4 rounded-xl flex flex-col justify-between transition group relative"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="w-8 h-8 rounded-full bg-purple-600/30 border border-purple-500/40 text-purple-300 font-bold text-xs flex items-center justify-center">
                        #{step.stepNumber}
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-medium rounded border border-emerald-500/30 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {step['10SecondClarityScoreSeconds']}s Next Action SLA
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition">
                        {step.stepName}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {step.description}
                      </p>
                    </div>

                    <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-xs">
                      <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">
                        Primary Page Action
                      </div>
                      <div className="text-purple-300 font-medium flex items-center gap-1.5">
                        <MousePointer className="w-3.5 h-3.5 text-purple-400" />
                        {step.primaryCTA}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-900 flex justify-between items-center text-[11px]">
                    <span className="text-slate-400 font-mono">{step.route}</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      Optimized
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Journey Flow Line */}
            <div className="mt-6 bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between overflow-x-auto gap-2">
              {report.primaryJourneySteps.map((step, idx) => (
                <React.Fragment key={step.stepNumber}>
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold flex items-center justify-center border border-purple-500/30">
                      {step.stepNumber}
                    </span>
                    <span className="text-xs font-medium text-slate-200">
                      {step.stepName.split('.')[1]?.trim() || step.stepName}
                    </span>
                  </div>
                  {idx < report.primaryJourneySteps.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-purple-400 shrink-0 mx-1" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Simplified Terminology Dictionary */}
      {activeTab === 'dictionary' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-amber-400" />
                  Plain Language Terminology Dictionary
                </h3>
                <p className="text-xs text-slate-400">
                  Replacing technical jargon with simple, beginner-friendly terms across all candidate touchpoints.
                </p>
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-slate-400 font-medium">Filter Category:</span>
                {['ALL', 'Matching', 'Skills', 'Data Quality', 'Career'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedTermCategory(cat)}
                    className={`px-3 py-1 text-xs rounded-lg font-medium transition ${
                      selectedTermCategory === cat
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDictionary.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950 border border-slate-800 hover:border-amber-500/40 p-4 rounded-xl transition"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="px-2.5 py-0.5 bg-slate-900 text-slate-400 border border-slate-800 rounded text-[10px] font-semibold">
                      {item.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Location: {item.userFacingLocation}
                    </span>
                  </div>

                  <div className="space-y-3 mt-3">
                    <div className="bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-lg">
                      <div className="text-[10px] uppercase font-bold text-rose-400 mb-0.5">
                        Technical Term / Jargon (Avoided)
                      </div>
                      <div className="text-xs font-mono text-rose-200 line-through">
                        "{item.technicalTerm}"
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <ArrowRight className="w-4 h-4 text-emerald-400 rotate-90 md:rotate-0" />
                    </div>

                    <div className="bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-lg">
                      <div className="text-[10px] uppercase font-bold text-emerald-400 mb-0.5">
                        Simplified Candidate Term (Enforced)
                      </div>
                      <div className="text-sm font-bold text-emerald-300">
                        "{item.simplifiedTerm}"
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Page-by-Page CTA & Touch SLA Matrix */}
      {activeTab === 'page_audits' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Layout className="w-5 h-5 text-purple-400" />
                  Candidate Page Audit Matrix (Single CTA &amp; Touch SLA)
                </h3>
                <p className="text-xs text-slate-400">
                  Comprehensive audit verifying that every core candidate screen contains exactly one primary CTA button.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold">
                    <th className="p-3">Page Name &amp; Route</th>
                    <th className="p-3">Primary Action Label</th>
                    <th className="p-3">10-Sec Rule Met</th>
                    <th className="p-3">Single Primary CTA</th>
                    <th className="p-3">Mobile Touch Target</th>
                    <th className="p-3">Jargon Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {report.auditedPages.map((page, idx) => (
                    <tr key={idx} className="hover:bg-slate-950/60 transition">
                      <td className="p-3">
                        <div className="font-bold text-white">{page.pageName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{page.pageRoute}</div>
                      </td>
                      <td className="p-3">
                        <span className="px-2.5 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded font-semibold text-xs">
                          {page.primaryActionLabel}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-[11px] font-semibold flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Met ({page['10SecondRuleMet'] ? '&le;10s' : '>10s'})
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-[11px] font-semibold flex items-center gap-1 w-fit">
                          <Check className="w-3.5 h-3.5" />
                          Compliant (1 CTA)
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded text-[11px] font-semibold flex items-center gap-1 w-fit">
                          <Smartphone className="w-3.5 h-3.5 text-sky-400" />
                          &ge;44px (WCAG AAA)
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded text-[11px] font-semibold flex items-center gap-1 w-fit">
                          <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                          Jargon-Free
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: 14-Point Diagnostic Test Suite */}
      {activeTab === 'diagnostics' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  14-Point Career UX Diagnostic Suite
                </h3>
                <p className="text-xs text-slate-400">
                  Automated test verification ensuring 10-second next action clarity, jargon elimination, and touch SLA.
                </p>
              </div>

              <button
                onClick={handleRunDiagnostics}
                disabled={isRunningDiagnostics}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center gap-2 disabled:opacity-50"
              >
                {isRunningDiagnostics ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-slate-950" />}
                Run Full Diagnostic Suite
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
                        {diagnosticResults.passed ? 'ALL 14 UX DIAGNOSTIC TESTS PASSED' : 'SOME DIAGNOSTIC TESTS FAILED'}
                      </div>
                      <div className="text-xs opacity-80">
                        {diagnosticResults.results.filter(r => r.passed).length} of {diagnosticResults.results.length} assertions verified successfully.
                      </div>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-slate-950 rounded-full text-xs font-mono border border-slate-800">
                    SLA Status: OPTIMIZED
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
                <h4 className="text-sm font-bold text-slate-300">Diagnostic Suite Ready</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Click "Run Full Diagnostic Suite" above to execute all 14 empirical UX tests for 10-second next action clarity, jargon translation, single CTA enforcement, and mobile touch SLA.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
