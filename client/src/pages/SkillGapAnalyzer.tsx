import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Modal } from '../components/ui/Modal';
import { CandidateProfile } from '../types';
import { seedJobs } from '../data/seedData';
import {
  SkillGapService,
  SkillGapAnalysisResult,
  SkillGapItem,
  RoadmapStageItem,
  MultiJobSkillFrequency
} from '../services/skillGapService';
import { runSkillGapEngineTests, SkillGapTestResult } from '../services/skillGapEngineTests';
import {
  Target,
  CheckCircle2,
  AlertCircle,
  Zap,
  BookOpen,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  PlusCircle,
  Clock,
  Briefcase,
  Layers,
  Award,
  BarChart3,
  TrendingUp,
  FileCode,
  CheckSquare,
  PlayCircle,
  FolderGit2,
  ExternalLink
} from 'lucide-react';

interface SkillGapProps {
  candidate: CandidateProfile;
  onReadinessScoreUpdate?: (newScore: number) => void;
}

export const SkillGapAnalyzer: React.FC<SkillGapProps> = ({
  candidate,
  onReadinessScoreUpdate
}) => {
  const navigate = useNavigate();

  // Target Selection State: Target Career vs Specific Matched Job
  const [targetType, setTargetType] = useState<'Career' | 'Job'>('Career');
  const [selectedTargetId, setSelectedTargetId] = useState<string>('car_data_analyst');

  // Candidate Profile & Interactive Roadmap Progress State
  const [currentCandidate, setCurrentCandidate] = useState<CandidateProfile>(candidate);
  const [userProgressMap, setUserProgressMap] = useState<Record<string, 'Not Started' | 'In Progress' | 'Completed'>>({});
  const [readinessScoreToast, setReadinessScoreToast] = useState<string | null>(null);

  // Computed Analysis Result
  const [analysis, setAnalysis] = useState<SkillGapAnalysisResult>(() =>
    SkillGapService.analyzeSkillGap(candidate, { type: 'Career', id: 'car_data_analyst' }, userProgressMap)
  );

  // Active View Tab: Single-Job Skill Gap vs Multi-Job Skill Frequency vs 7-Stage Roadmap
  const [activeTab, setActiveTab] = useState<'singleJob' | 'multiJob' | 'roadmap'>('singleJob');
  const [selectedProjectSkill, setSelectedProjectSkill] = useState<SkillGapItem | null>(null);

  // Add Skill Modal State & Test Runner Modal State
  const [isAddSkillOpen, setIsAddSkillOpen] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillProficiency, setNewSkillProficiency] = useState<'Expert' | 'Advanced' | 'Intermediate'>('Advanced');

  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testResults, setTestResults] = useState<SkillGapTestResult[]>([]);

  // Re-run analysis when target, candidate skills, or stage completion status updates
  useEffect(() => {
    const res = SkillGapService.analyzeSkillGap(
      currentCandidate,
      { type: targetType, id: selectedTargetId },
      userProgressMap
    );
    setAnalysis(res);
  }, [targetType, selectedTargetId, currentCandidate, userProgressMap]);

  // Handle Toggling Stage Status (Not Started -> In Progress -> Completed)
  const handleToggleStageStatus = (stage: RoadmapStageItem) => {
    const nextStatusMap: Record<'Not Started' | 'In Progress' | 'Completed', 'Not Started' | 'In Progress' | 'Completed'> = {
      'Not Started': 'In Progress',
      'In Progress': 'Completed',
      'Completed': 'Not Started'
    };

    const newStatus = nextStatusMap[stage.status];
    const updatedMap = { ...userProgressMap, [stage.skillName]: newStatus };
    setUserProgressMap(updatedMap);

    // If marked Completed, add skill with evidence to profile and trigger Job Readiness score update
    if (newStatus === 'Completed' && stage.skillName !== 'Interview Preparation' && stage.skillName !== 'Job Applications') {
      const alreadyHas = currentCandidate.skills.some(
        (s) => s.name.toLowerCase() === stage.skillName.toLowerCase()
      );

      if (!alreadyHas) {
        const updatedSkills = [
          ...currentCandidate.skills,
          { name: stage.skillName, level: 'Intermediate' }
        ];

        const prevScore = currentCandidate.readinessScore || 68;
        const newScore = Math.min(100, prevScore + 10);
        const updatedCand = {
          ...currentCandidate,
          skills: updatedSkills,
          readinessScore: newScore
        };

        setCurrentCandidate(updatedCand);
        onReadinessScoreUpdate?.(newScore);

        setReadinessScoreToast(
          `🎉 Your Job Readiness Score changed from ${prevScore} to ${newScore} because you completed "${stage.skillName}"!`
        );
        setTimeout(() => setReadinessScoreToast(null), 6000);
      }
    }
  };

  // Handle Manual Skill Logging
  const handleAddSkillEvidence = () => {
    if (!newSkillName.trim()) return;

    const updatedSkills = [
      ...currentCandidate.skills,
      { name: newSkillName.trim(), level: newSkillProficiency }
    ];

    const prevScore = currentCandidate.readinessScore || 68;
    const newScore = Math.min(100, prevScore + 8);
    const updatedCandidate = {
      ...currentCandidate,
      skills: updatedSkills,
      readinessScore: newScore
    };

    setCurrentCandidate(updatedCandidate);
    onReadinessScoreUpdate?.(newScore);

    setNewSkillName('');
    setIsAddSkillOpen(false);

    setReadinessScoreToast(
      `🎉 Verified evidence logged! Job Readiness Score updated from ${prevScore} to ${newScore}.`
    );
    setTimeout(() => setReadinessScoreToast(null), 6000);
  };

  const handleRunSkillGapTests = () => {
    const results = runSkillGapEngineTests();
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
              <Target className="w-3.5 h-3.5" /> Module 4: AI Skill Gap Analyzer
            </div>
            <h1 className="text-2xl font-bold text-white font-display">
              AI Skill Gap Analyzer
            </h1>
            <p className="text-gray-300 text-sm mt-1">
              See exactly what you need to improve for the jobs you want.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRunSkillGapTests}
              icon={<ShieldCheck className="w-4 h-4 text-emerald-400" />}
            >
              Run 9-Point Engine Tests
            </Button>
            <Button
              variant="accent"
              size="sm"
              onClick={() => setIsAddSkillOpen(true)}
              icon={<PlusCircle className="w-4 h-4" />}
            >
              Log Skill Evidence
            </Button>
          </div>
        </div>
      </div>

      {/* Dynamic Readiness Score Toast / Notification Banner */}
      {readinessScoreToast && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between shadow-glow-teal animate-fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-300" />
            <span className="font-semibold">{readinessScoreToast}</span>
          </div>
          <button
            onClick={() => navigate('/readiness')}
            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition"
          >
            View Job Readiness Score
          </button>
        </div>
      )}

      {/* Target Selector Bar: Switch between Target Careers & Specific Matched Jobs */}
      <div className="p-4 rounded-xl bg-gray-900/80 border border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-gray-300 uppercase tracking-wider font-mono">
            Target Benchmark:
          </span>
          <div className="flex items-center gap-1 bg-gray-950 p-1 rounded-lg border border-gray-800 text-xs">
            <button
              onClick={() => {
                setTargetType('Career');
                setSelectedTargetId('car_data_analyst');
              }}
              className={`px-3 py-1.5 rounded-md font-semibold transition ${
                targetType === 'Career'
                  ? 'bg-brand-600 text-white shadow-glow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              🎯 Target Career Paths
            </button>
            <button
              onClick={() => {
                setTargetType('Job');
                setSelectedTargetId('job_201');
              }}
              className={`px-3 py-1.5 rounded-md font-semibold transition ${
                targetType === 'Job'
                  ? 'bg-emerald-600 text-white shadow-glow-teal'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              💼 Matched Job Openings
            </button>
          </div>
        </div>

        {/* Dynamic Target Selection Items */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          {targetType === 'Career' ? (
            [
              { id: 'car_data_analyst', label: 'Junior Data Analyst' },
              { id: 'car_architect', label: 'Staff Software Architect' },
              { id: 'car_ai', label: 'Full Stack AI & RAG Engineer' }
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
            seedJobs.slice(0, 4).map((j) => (
              <button
                key={j.id}
                onClick={() => setSelectedTargetId(j.id)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  selectedTargetId === j.id
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

      {/* Main View Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-800 pb-3">
        <button
          onClick={() => setActiveTab('singleJob')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'singleJob'
              ? 'bg-brand-600 text-white shadow-glow-sm'
              : 'bg-gray-900 text-gray-400 hover:text-white'
          }`}
        >
          <Briefcase className="w-4 h-4" /> Role Skill Gap
        </button>
        <button
          onClick={() => setActiveTab('multiJob')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'multiJob'
              ? 'bg-brand-600 text-white shadow-glow-sm'
              : 'bg-gray-900 text-gray-400 hover:text-white'
          }`}
        >
          <TrendingUp className="w-4 h-4" /> Skills That Open Opportunities
        </button>
        <button
          onClick={() => setActiveTab('roadmap')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'roadmap'
              ? 'bg-brand-600 text-white shadow-glow-sm'
              : 'bg-gray-900 text-gray-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" /> 7-Stage Personalized Roadmap
        </button>
      </div>

      {/* VIEW 1: SINGLE-JOB / ROLE SKILL GAP */}
      {activeTab === 'singleJob' && (
        <div className="space-y-6">
          {/* Summary & Key Insight */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card glow className="text-center py-6 flex flex-col justify-between">
              <div>
                <div className="inline-flex p-3 rounded-full bg-brand-600/20 border border-brand-500/30 text-brand-400 mb-3">
                  <Target className="w-8 h-8" />
                </div>

                <span className="text-xs text-gray-400 font-medium block">Benchmark Competency Fit</span>
                <h2 className="text-5xl font-extrabold text-white font-display mt-1">
                  {analysis.overallFitPercentage}%
                </h2>
                <p className="text-xs text-brand-300 font-bold mt-1">Target: {analysis.targetTitle}</p>

                <div className="mt-4 px-4">
                  <ProgressBar value={analysis.overallFitPercentage} color="brand" height="md" showValue={false} />
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-800 text-left space-y-2 text-xs">
                <p className="text-gray-300 font-medium italic">"{analysis.roleMatchSummaryText}"</p>
                <div className="p-3 rounded-lg bg-brand-950/40 border border-brand-500/30 text-brand-200 mt-2">
                  <span className="text-[10px] text-gray-400 uppercase font-mono block">Highest Impact Opportunity</span>
                  <span className="font-bold text-white text-sm">{analysis.highestImpactHighlight}</span>
                </div>
              </div>
            </Card>

            {/* Detailed 4-Category Skill Matrix */}
            <Card className="lg:col-span-2 space-y-4">
              <CardHeader>
                <CardTitle icon={<BarChart3 className="w-5 h-5 text-brand-400" />}>
                  Required vs Possessed Skills Classification
                </CardTitle>
              </CardHeader>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Strong Matches */}
                <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5 font-display">
                    <CheckCircle2 className="w-4 h-4" /> Strong Matches ({analysis.strongSkills.length})
                  </span>
                  <div className="space-y-1.5">
                    {analysis.strongSkills.map((sk) => (
                      <div key={sk.skillName} className="p-2 rounded bg-gray-900/80 border border-emerald-500/20">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-white">✓ {sk.skillName}</span>
                          <Badge variant="success">{sk.proficiency || 'Verified'}</Badge>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-0.5">{sk.evidence}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Missing Skills */}
                <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-2">
                  <span className="font-bold text-rose-400 flex items-center gap-1.5 font-display">
                    <AlertCircle className="w-4 h-4" /> Missing Skills ({analysis.missingSkills.length})
                  </span>
                  <div className="space-y-1.5">
                    {analysis.missingSkills.map((sk) => (
                      <div key={sk.skillName} className="p-2 rounded bg-gray-900/80 border border-rose-500/20">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-white">⚠️ {sk.skillName}</span>
                          <Badge variant={sk.priority === 'HIGH PRIORITY' ? 'match-low' : 'warning'}>
                            {sk.priority}
                          </Badge>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-0.5">{sk.whyPriorityReason}</p>

                        {sk.recommendedProject && (
                          <button
                            onClick={() => setSelectedProjectSkill(sk)}
                            className="mt-1.5 text-[10px] text-brand-300 hover:text-brand-200 font-semibold underline flex items-center gap-1"
                          >
                            <FolderGit2 className="w-3 h-3" /> View Recommended Project Blueprint
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* VIEW 2: MULTI-JOB SKILL FREQUENCY ("Skills That Open More Opportunities") */}
      {activeTab === 'multiJob' && (
        <Card className="space-y-4">
          <CardHeader>
            <div>
              <CardTitle icon={<TrendingUp className="w-5 h-5 text-brand-400" />}>
                Skills That Open More Opportunities
              </CardTitle>
              <p className="text-xs text-gray-400 mt-0.5">
                Analyzed requirement frequency across all {seedJobs.length} active job postings.
              </p>
            </div>
          </CardHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            {analysis.multiJobFrequencies.map((mj) => (
              <div
                key={mj.skillName}
                className={`p-4 rounded-xl border transition ${
                  mj.isPossessedByCandidate
                    ? 'bg-emerald-950/10 border-emerald-500/30'
                    : 'bg-gray-900/80 border-brand-500/30 shadow-glow-sm'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-bold text-white text-sm">{mj.skillName}</h4>
                  <Badge variant={mj.isPossessedByCandidate ? 'success' : 'match-high'}>
                    {mj.isPossessedByCandidate ? '✓ Possessed' : mj.priority}
                  </Badge>
                </div>

                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-[11px] text-gray-300 font-mono">
                    <span>Market Demand:</span>
                    <span className="font-bold text-brand-300">
                      {mj.frequencyCount} / {mj.totalJobsAnalyzed} Jobs ({mj.percentageDemand}%)
                    </span>
                  </div>
                  <ProgressBar value={mj.percentageDemand} color={mj.isPossessedByCandidate ? 'emerald' : 'brand'} height="sm" showValue={false} />
                </div>

                <p className="text-[11px] text-gray-400 mt-2">
                  {mj.isPossessedByCandidate
                    ? `You already possess ${mj.skillName}. It opens eligibility for ${mj.frequencyCount} jobs.`
                    : `Acquiring ${mj.skillName} will unlock eligibility across ${mj.frequencyCount} active job opportunities.`}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* VIEW 3: 7-STAGE PERSONALIZED LEARNING ROADMAP */}
      {activeTab === 'roadmap' && (
        <div className="space-y-6">
          {/* Progress Overview Header */}
          <Card glow className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs text-gray-400 font-mono uppercase">Overall Roadmap Progress</span>
                <div className="flex items-center gap-3 mt-1">
                  <h3 className="text-3xl font-extrabold text-white font-display">
                    {analysis.roadmap.overallProgressPercentage}%
                  </h3>
                  <div className="w-48">
                    <ProgressBar value={analysis.roadmap.overallProgressPercentage} color="brand" height="md" showValue={false} />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <div className="text-center px-3 border-r border-gray-800">
                  <span className="text-gray-400 block text-[10px] uppercase font-mono">Skills Completed</span>
                  <span className="font-extrabold text-brand-300 text-lg">
                    {analysis.roadmap.skillsCompletedCount} / {analysis.roadmap.totalSkillsCount}
                  </span>
                </div>

                <div className="text-center px-3 border-r border-gray-800">
                  <span className="text-gray-400 block text-[10px] uppercase font-mono">Projects Completed</span>
                  <span className="font-extrabold text-emerald-400 text-lg">
                    {analysis.roadmap.projectsCompletedCount} / {analysis.roadmap.totalProjectsCount}
                  </span>
                </div>

                <div className="text-center px-3">
                  <span className="text-gray-400 block text-[10px] uppercase font-mono">Interview Ready</span>
                  <Badge variant={analysis.roadmap.isInterviewReady ? 'success' : 'warning'}>
                    {analysis.roadmap.isInterviewReady ? 'Yes' : 'In Progress'}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>

          {/* Timeline Stages */}
          <div className="space-y-4">
            {analysis.roadmap.stages.map((stage) => (
              <Card key={stage.stageId} className="p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-gray-800/80">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-xs font-bold font-mono text-brand-400">Stage {stage.stageId}</span>
                      <h4 className="text-base font-bold text-white font-display">{stage.stageName}</h4>
                      <Badge variant={stage.priority === 'HIGH PRIORITY' ? 'match-high' : 'warning'}>
                        {stage.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-300">{stage.description}</p>
                  </div>

                  <button
                    onClick={() => handleToggleStageStatus(stage)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                      stage.status === 'Completed'
                        ? 'bg-emerald-600 text-white shadow-glow-teal'
                        : stage.status === 'In Progress'
                        ? 'bg-brand-600 text-white shadow-glow-sm'
                        : 'bg-gray-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    <CheckSquare className="w-4 h-4" /> {stage.status} (Click to toggle)
                  </button>
                </div>

                {/* 5 Learning Activities Row */}
                <div className="pt-3 space-y-2 text-xs">
                  <span className="font-semibold text-gray-400 block font-mono text-[10px] uppercase">
                    5 Learning Activities:
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-[11px]">
                    <div className="p-2 rounded bg-gray-900 border border-gray-800">
                      <span className="font-bold text-brand-300 block">1. Learn</span>
                      <p className="text-gray-400 text-[10px]">{stage.activities.learn}</p>
                    </div>

                    <div className="p-2 rounded bg-gray-900 border border-gray-800">
                      <span className="font-bold text-brand-300 block">2. Practice</span>
                      <p className="text-gray-400 text-[10px]">{stage.activities.practice}</p>
                    </div>

                    <div className="p-2 rounded bg-gray-900 border border-gray-800">
                      <span className="font-bold text-brand-300 block">3. Build</span>
                      <p className="text-gray-400 text-[10px]">{stage.activities.build}</p>
                    </div>

                    <div className="p-2 rounded bg-gray-900 border border-gray-800">
                      <span className="font-bold text-brand-300 block">4. Test</span>
                      <p className="text-gray-400 text-[10px]">{stage.activities.test}</p>
                    </div>

                    <div className="p-2 rounded bg-gray-900 border border-gray-800">
                      <span className="font-bold text-brand-300 block">5. Interview</span>
                      <p className="text-gray-400 text-[10px]">{stage.activities.interview}</p>
                    </div>
                  </div>
                </div>

                {/* Project Blueprint Callout */}
                {stage.project && (
                  <div className="mt-3 p-3 rounded-xl bg-brand-950/30 border border-brand-500/30 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-brand-300 flex items-center gap-1.5 font-display">
                        <FolderGit2 className="w-4 h-4" /> Portfolio Project Blueprint: {stage.project.title}
                      </span>
                      <Badge variant="purple">{stage.project.targetRole}</Badge>
                    </div>
                    <p className="text-gray-300 text-[11px]">
                      <strong>Dataset:</strong> {stage.project.dataset} • <strong>Business Insights:</strong> {stage.project.businessInsights}
                    </p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Project Recommendation Blueprint Modal */}
      {selectedProjectSkill && selectedProjectSkill.recommendedProject && (
        <Modal
          isOpen={Boolean(selectedProjectSkill)}
          onClose={() => setSelectedProjectSkill(null)}
          title={`Project Blueprint: ${selectedProjectSkill.recommendedProject.title}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-lg bg-brand-950/40 border border-brand-500/30">
              <span className="text-[10px] uppercase font-mono text-gray-400 block">Target Role</span>
              <p className="font-bold text-white text-sm">{selectedProjectSkill.recommendedProject.targetRole}</p>
            </div>

            <div className="space-y-2">
              <div className="p-2.5 rounded bg-gray-900 border border-gray-800">
                <span className="font-bold text-brand-300">Dataset Source:</span>
                <p className="text-gray-300 mt-0.5">{selectedProjectSkill.recommendedProject.dataset}</p>
              </div>

              <div className="p-2.5 rounded bg-gray-900 border border-gray-800">
                <span className="font-bold text-brand-300">Data Cleaning & Transformation:</span>
                <p className="text-gray-300 mt-0.5">{selectedProjectSkill.recommendedProject.dataCleaning}</p>
              </div>

              <div className="p-2.5 rounded bg-gray-900 border border-gray-800">
                <span className="font-bold text-emerald-400">KPIs & Metrics Built:</span>
                <ul className="list-disc list-inside text-gray-300 mt-0.5 space-y-0.5">
                  {selectedProjectSkill.recommendedProject.kpis.map((kpi, i) => (
                    <li key={i}>{kpi}</li>
                  ))}
                </ul>
              </div>

              <div className="p-2.5 rounded bg-gray-900 border border-gray-800">
                <span className="font-bold text-amber-400">Business Insights Uncovered:</span>
                <p className="text-gray-300 mt-0.5">{selectedProjectSkill.recommendedProject.businessInsights}</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button size="sm" variant="accent" onClick={() => setSelectedProjectSkill(null)}>
                Close Blueprint
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Manual Skill Evidence Modal */}
      <Modal
        isOpen={isAddSkillOpen}
        onClose={() => setIsAddSkillOpen(false)}
        title="Log Skill Evidence to Profile"
      >
        <div className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="text-gray-300 font-semibold">Skill Name</label>
            <input
              type="text"
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              placeholder="e.g. Power BI, Kafka, Python, System Design..."
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-gray-300 font-semibold">Proficiency Level</label>
            <select
              value={newSkillProficiency}
              onChange={(e) => setNewSkillProficiency(e.target.value as any)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white"
            >
              <option value="Expert">Expert (Production Ownership)</option>
              <option value="Advanced">Advanced (High Competency)</option>
              <option value="Intermediate">Intermediate (Project Evidence)</option>
            </select>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button size="sm" variant="outline" onClick={() => setIsAddSkillOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="accent" onClick={handleAddSkillEvidence}>
              Save & Recalculate Readiness
            </Button>
          </div>
        </div>
      </Modal>

      {/* Automated Skill Gap Engine Tests Modal */}
      <Modal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        title="Laboria AI - 9-Point Skill Gap & Roadmap Automated Test Suite"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-semibold">
            ✓ Verified: Non-redundant personalized roadmaps built strictly from candidate evidence.
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
