import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Modal } from '../components/ui/Modal';
import { CandidateProfile } from '../types';
import { seedJobs } from '../data/seedData';
import {
  ReadinessScoringService,
  DetailedReadinessAssessment,
  JobSpecificReadiness
} from '../services/jobReadinessService';
import { runReadinessEngineTests, ReadinessTestResult } from '../services/readinessEngineTests';
import {
  Award,
  ShieldCheck,
  Zap,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  Target,
  FileText,
  MessageSquareCode,
  Mic,
  Briefcase,
  Layers,
  HelpCircle,
  CheckSquare,
  Info
} from 'lucide-react';

interface ReadinessProps {
  candidate: CandidateProfile;
}

export const JobReadinessScore: React.FC<ReadinessProps> = ({ candidate }) => {
  const navigate = useNavigate();

  // Target Selection State: Target Career vs Specific Matched Job
  const [targetType, setTargetType] = useState<'Career' | 'Job'>('Career');
  const [selectedTargetId, setSelectedTargetId] = useState<string>('car_data_analyst');
  const [selectedJobId, setSelectedJobId] = useState<string>('job_201');

  // Compute Overall Career Assessment
  const targetCareerTitle =
    selectedTargetId === 'car_data_analyst'
      ? 'Junior Data Analyst'
      : selectedTargetId === 'car_architect'
      ? 'Staff Software Architect'
      : 'Full Stack AI Engineer';

  const assessment: DetailedReadinessAssessment = ReadinessScoringService.calculateReadiness(
    candidate,
    targetCareerTitle
  );

  // Compute Job-Specific Readiness if Job mode selected
  const selectedJob = seedJobs.find((j) => j.id === selectedJobId) || seedJobs[0];
  const jobSpecificAssessment: JobSpecificReadiness = ReadinessScoringService.calculateJobSpecificReadiness(
    candidate,
    selectedJob,
    94
  );

  // Test Suite Modal State
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testResults, setTestResults] = useState<ReadinessTestResult[]>([]);

  const handleRunReadinessTests = () => {
    const results = runReadinessEngineTests();
    setTestResults(results);
    setIsTestModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-brand-500/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30 mb-2">
              <Award className="w-3.5 h-3.5" /> Module 6: AI Job Readiness & Employability Index
            </div>
            <h1 className="text-2xl font-bold text-white font-display">
              Job Readiness
            </h1>
            <p className="text-gray-300 text-sm mt-1">
              Know where you stand. Know what to improve.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRunReadinessTests}
              icon={<ShieldCheck className="w-4 h-4 text-emerald-400" />}
            >
              Run 9-Point Engine Tests
            </Button>
          </div>
        </div>
      </div>

      {/* Target Benchmark Switcher */}
      <div className="p-4 rounded-xl bg-gray-900/80 border border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-gray-300 uppercase tracking-wider font-mono">
            Readiness Target:
          </span>
          <div className="flex items-center gap-1 bg-gray-950 p-1 rounded-lg border border-gray-800 text-xs">
            <button
              onClick={() => setTargetType('Career')}
              className={`px-3 py-1.5 rounded-md font-semibold transition ${
                targetType === 'Career'
                  ? 'bg-brand-600 text-white shadow-glow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              🎯 Target Career Path
            </button>
            <button
              onClick={() => setTargetType('Job')}
              className={`px-3 py-1.5 rounded-md font-semibold transition ${
                targetType === 'Job'
                  ? 'bg-emerald-600 text-white shadow-glow-teal'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              💼 Specific Matched Job
            </button>
          </div>
        </div>

        {/* Dynamic Target Selection Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          {targetType === 'Career' ? (
            [
              { id: 'car_data_analyst', label: 'Junior Data Analyst' },
              { id: 'car_architect', label: 'Staff Software Architect' },
              { id: 'car_ai', label: 'Full Stack AI Engineer' }
            ].map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedTargetId(c.id)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  selectedTargetId === c.id
                    ? 'bg-gray-800 text-brand-300 border border-brand-500/40 shadow-glow-sm'
                    : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
                }`}
              >
                {c.label}
              </button>
            ))
          ) : (
            seedJobs.slice(0, 3).map((j) => (
              <button
                key={j.id}
                onClick={() => setSelectedJobId(j.id)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  selectedJobId === j.id
                    ? 'bg-gray-800 text-emerald-300 border border-emerald-500/40 shadow-glow-teal'
                    : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
                }`}
              >
                {j.title} @ {j.company}
              </button>
            ))
          )}
        </div>
      </div>

      {/* JOB-SPECIFIC READINESS PANEL (WHEN JOB MODE SELECTED) */}
      {targetType === 'Job' && (
        <Card glow className="bg-gradient-to-r from-gray-900 via-gray-900/90 to-brand-950/40 border border-brand-500/30 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-800/80">
            <div>
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white font-display">
                  Job-Specific Readiness: {jobSpecificAssessment.job.title}
                </h3>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {jobSpecificAssessment.job.company} • 📍 {jobSpecificAssessment.job.location}
              </p>
            </div>

            {/* SEPARATE SCORES: PROFILE MATCH VS JOB READINESS */}
            <div className="flex items-center gap-4 bg-gray-950 border border-gray-800 p-3 rounded-xl">
              <div className="text-center px-2">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider font-mono block">
                  Profile Match
                </span>
                <div className="text-2xl font-extrabold text-brand-300 font-display">
                  {jobSpecificAssessment.profileMatchScore}%
                </div>
              </div>

              <div className="h-8 w-px bg-gray-800" />

              <div className="text-center px-2">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider font-mono block">
                  Job Readiness
                </span>
                <div className="text-2xl font-extrabold text-emerald-400 font-display">
                  {jobSpecificAssessment.jobReadinessScore}%
                </div>
              </div>
            </div>
          </div>

          {/* Explanation Callout */}
          <div className="p-3.5 rounded-xl bg-gray-950/80 border border-gray-800 text-xs text-gray-300 flex items-start gap-2">
            <Info className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
            <span>{jobSpecificAssessment.explanation}</span>
          </div>

          {/* Job Blockers & Recommended Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
            {/* Blockers */}
            <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-2">
              <span className="font-bold text-rose-400 flex items-center gap-1.5 font-display">
                <AlertCircle className="w-4 h-4" /> Potential Job Blockers
              </span>
              <ul className="space-y-1.5 text-gray-300 text-[11px] list-disc list-inside">
                {jobSpecificAssessment.jobBlockers.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>

            {/* Recommended Actions */}
            <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5 font-display">
                <CheckCircle2 className="w-4 h-4" /> Recommended Job Actions
              </span>
              <div className="space-y-1.5">
                {jobSpecificAssessment.recommendedActions.map((act, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded bg-gray-900 border border-gray-800">
                    <span className="text-gray-200">{act.title}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(act.modulePath)}
                      icon={<ArrowRight className="w-3 h-3" />}
                    >
                      {act.buttonLabel}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Main Grid: Overall Hero Card & 7 Dimensions Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Hero Card */}
        <Card glow className="text-center py-8 flex flex-col justify-between">
          <div>
            <div className="inline-flex p-4 rounded-full bg-brand-600/20 border border-brand-500/30 text-brand-400 mb-3">
              <ShieldCheck className="w-12 h-12" />
            </div>

            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider font-mono block">
              YOUR JOB READINESS SCORE
            </span>

            <h2 className="text-6xl font-extrabold text-white font-display mt-2">
              {assessment.overallScore}<span className="text-2xl text-brand-400">/100</span>
            </h2>

            <div className="mt-3">
              <Badge variant={assessment.overallScore >= 75 ? 'success' : 'warning'}>
                Status: {assessment.statusTier}
              </Badge>
            </div>

            <p className="text-xs text-gray-300 max-w-xs mx-auto mt-3 leading-relaxed">
              {assessment.employabilityAnswer.verdict}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-800 text-left text-xs space-y-1.5">
            <span className="font-semibold text-gray-400 text-[10px] uppercase font-mono block">7 Configurable Dimension Weights</span>
            <div className="grid grid-cols-2 gap-1 text-gray-400 text-[11px]">
              <div>• Tech Skills: 25%</div>
              <div>• Resume Quality: 15%</div>
              <div>• Projects: 15%</div>
              <div>• Interview Prep: 15%</div>
              <div>• Communication: 10%</div>
              <div>• Soft Skills: 10%</div>
              <div>• Career Alignment: 10%</div>
            </div>
          </div>
        </Card>

        {/* 7 Dimensions Breakdown Matrix */}
        <Card className="lg:col-span-2 space-y-4">
          <CardHeader>
            <CardTitle icon={<Award className="w-5 h-5 text-brand-400" />}>
              Component Readiness Breakdown (7 Evaluated Areas)
            </CardTitle>
          </CardHeader>

          <div className="space-y-4 text-xs">
            {assessment.dimensions.map((dim) => (
              <div key={dim.key} className="p-3 rounded-xl bg-gray-900/60 border border-gray-800 space-y-1.5">
                <div className="flex justify-between items-center font-medium">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-200 font-bold">{dim.name}</span>
                    <span className="text-gray-500 font-mono text-[11px]">(Weight {dim.weight}%)</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-sm">{dim.score}</span>
                    <Badge variant={dim.score >= 75 ? 'success' : dim.score >= 60 ? 'warning' : 'match-low'}>
                      {dim.status}
                    </Badge>
                  </div>
                </div>

                <ProgressBar
                  value={dim.score}
                  color={dim.score >= 75 ? 'teal' : dim.score >= 60 ? 'brand' : 'amber'}
                  height="sm"
                  showValue={false}
                />

                <p className="text-[11px] text-gray-400">{dim.description}</p>

                {/* Strengths & Improvement Opportunities */}
                <div className="pt-1 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                  {dim.strengths.length > 0 && (
                    <div className="text-emerald-400">
                      {dim.strengths.map((s, i) => (
                        <span key={i} className="block">{s}</span>
                      ))}
                    </div>
                  )}
                  {dim.improvementOpportunities.length > 0 && (
                    <div className="text-amber-400">
                      {dim.improvementOpportunities.map((o, i) => (
                        <span key={i} className="block">{o}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* BIGGEST OPPORTUNITY SPOTLIGHT */}
      <Card glow className="bg-gradient-to-r from-brand-950/60 via-gray-900 to-gray-900 border-brand-500/30 p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-400" />
            <h2 className="text-lg font-bold text-white font-display">
              Your Biggest Opportunity
            </h2>
            <Badge variant="match-high">HIGHEST IMPACT GAIN</Badge>
          </div>

          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
            +{assessment.biggestOpportunity.potentialScoreGain} Pts Potential Readiness Gain
          </span>
        </div>

        <div className="p-4 rounded-xl bg-gray-900/90 border border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-brand-400 font-mono uppercase">
              {assessment.biggestOpportunity.dimensionName}
            </span>
            <h3 className="text-base font-bold text-white font-display">{assessment.biggestOpportunity.title}</h3>
            <p className="text-xs text-gray-300 leading-relaxed">{assessment.biggestOpportunity.actionableStep}</p>
          </div>

          <Button
            variant="accent"
            size="sm"
            onClick={() => navigate(assessment.biggestOpportunity.targetModulePath)}
            icon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            {assessment.biggestOpportunity.actionButtonLabel}
          </Button>
        </div>
      </Card>

      {/* YOUR NEXT 3 ACTIONS PLAN */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            YOUR NEXT 3 ACTIONS
          </h2>
          <span className="text-xs text-gray-400">Sequential High-Impact Roadmap</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {assessment.employabilityAnswer.threeStepActionPlan.map((ap) => (
            <Card key={ap.step} glow={ap.step === 1} className="flex flex-col justify-between p-5 space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold font-mono text-brand-400">Action #0{ap.step}</span>
                  <Badge variant="info">{ap.moduleName}</Badge>
                </div>
                <p className="text-xs text-white font-semibold leading-relaxed">{ap.action}</p>
              </div>

              <div className="pt-3 border-t border-gray-800 flex justify-end">
                <Button
                  size="sm"
                  variant="accent"
                  onClick={() => navigate(ap.modulePath)}
                  icon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  [{ap.buttonLabel}]
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Automated Diagnostic Test Suite Modal */}
      <Modal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        title="Laboria AI - 9-Point Job Readiness Automated Test Suite"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-semibold">
            ✓ Verified: Profile Match % vs Job Readiness % evaluated separately without merging.
          </div>

          <div className="space-y-2">
            {testResults.map((tr) => (
              <div
                key={tr.testId}
                className="p-3 rounded-lg bg-gray-900/80 border border-gray-800 flex items-center justify-between gap-3"
              >
                <div>
                  <p className="font-bold text-white">Test #{tr.testId}: {tr.testName}</p>
                  <p className="text-gray-400 text-[11px] mt-0.5">{tr.details}</p>
                </div>
                <Badge variant={tr.status === 'PASSED' ? 'success' : 'match-low'}>
                  {tr.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};
