import React, { useEffect, useState } from 'react';
import { ShieldCheck, Rocket, FileText, Activity, FlaskConical, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { FinalLaunchState, SystemHealthMetric } from '../types';
import { getFinalLaunchState, runPreLaunchCleanup } from '../services/finalLaunchService';

const FinalLaunchCommandCenter: React.FC = () => {
  const [launchState, setLaunchState] = useState<FinalLaunchState | null>(null);
  const [isCleaning, setIsCleaning] = useState(false);

  useEffect(() => {
    loadState();
  }, []);

  const loadState = async () => {
    const state = await getFinalLaunchState();
    setLaunchState(state);
  };

  const handleCleanup = async () => {
    setIsCleaning(true);
    await runPreLaunchCleanup();
    // Refresh state after cleanup
    setTimeout(async () => {
      await loadState();
      setIsCleaning(false);
    }, 800);
  };

  if (!launchState) {
    return <div className="p-8 text-center text-slate-500 font-medium">Initializing Final Command Center...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Rocket className="w-8 h-8 text-indigo-600" />
            Final Launch Command Center (Steps 45-55)
          </h1>
          <p className="mt-2 text-sm text-slate-600 max-w-3xl">
            Master execution dashboard for final product audit, data quality, compliance validation, and launch readiness.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-col items-end">
          <span className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Launch Decision</span>
          <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold shadow-sm border ${
            launchState.decision === 'PUBLIC_LAUNCH_READY' 
              ? 'bg-green-50 text-green-700 border-green-200' 
              : 'bg-yellow-50 text-yellow-700 border-yellow-200'
          }`}>
            {launchState.decision.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      {/* Checklist */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-500" />
          Pre-Launch Checklist
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ChecklistItem label="Fake/Demo Data Removed" isChecked={launchState.checklist.fakeDataRemoved} />
          <ChecklistItem label="UX: Max 3 Primary Actions" isChecked={launchState.checklist.uxMaxThreeActions} />
          <ChecklistItem label="Misleading Claims Removed" isChecked={launchState.checklist.misleadingClaimsRemoved} />
          <ChecklistItem label="Data Cleaned & Validated" isChecked={launchState.checklist.dataCleaned} />
          <ChecklistItem label="All System Tests Passed" isChecked={launchState.checklist.allTestsPassed} />
        </div>
        <div className="mt-6 flex justify-end">
          <button 
            onClick={handleCleanup}
            disabled={isCleaning}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {isCleaning ? (
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
            ) : (
              <FlaskConical className="w-5 h-5" />
            )}
            Run Final System Audit & Cleanup
          </button>
        </div>
      </div>

      {/* Health Metrics */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-500" />
            System Health & Validation Matrices
          </h2>
          <p className="mt-1 text-sm text-slate-500">Continuous validation covering UX, Security, Matching AI, and Performance.</p>
        </div>
        <div className="divide-y divide-slate-200">
          {launchState.healthMetrics.map((metric, idx) => (
            <div key={idx} className="p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50 hover:bg-white transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${
                    metric.status === 'PASSED' ? 'bg-green-100 text-green-700 border-green-200' :
                    metric.status === 'WARNING' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                    'bg-red-100 text-red-700 border-red-200'
                  }`}>
                    {metric.category}
                  </span>
                  <span className="font-semibold text-slate-900">{metric.metricName}</span>
                </div>
                <p className="text-sm text-slate-600 ml-1 mt-1">{metric.details}</p>
              </div>
              <div className="flex items-center gap-6 md:min-w-[200px] justify-between">
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Value</div>
                  <div className="font-medium text-slate-900">{metric.value}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Target</div>
                  <div className="font-medium text-slate-600">{metric.threshold}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ChecklistItem: React.FC<{ label: string; isChecked: boolean }> = ({ label, isChecked }) => (
  <div className={`flex items-center gap-3 p-3 rounded-lg border ${isChecked ? 'bg-green-50 border-green-100' : 'bg-slate-50 border-slate-200'}`}>
    {isChecked ? (
      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
    ) : (
      <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0" />
    )}
    <span className={`text-sm font-medium ${isChecked ? 'text-green-800' : 'text-slate-700'}`}>{label}</span>
  </div>
);

export default FinalLaunchCommandCenter;
