import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CandidateProfile, CareerTransitionPlan } from '../types';
import {
  CareerNavigatorService,
  RecommendedCareerPath,
  DISCLAIMER_TEXT
} from '../services/careerNavigatorService';
import { runCareerEngineTests, CareerTestResult } from '../services/careerEngineTests';
import { ReadinessScoringService } from '../services/jobReadinessService';

import { CareerComparisonView } from '../components/career/CareerComparisonView';
import {
  Compass,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Clock,
  BookOpen,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Layers,
  ArrowRight,
  UserCheck,
  Award,
  Target,
  Briefcase,
  Bot,
  Radar,
  Play,
  X,
  FileText,
  Building2,
  MapPin,
  ExternalLink,
  HelpCircle,
  CheckSquare
} from 'lucide-react';

interface CareerNavigatorProps {
  candidate: CandidateProfile;
}

export const CareerNavigator: React.FC<CareerNavigatorProps> = ({ candidate }) => {
  const navigate = useNavigate();

  // Recommendations Catalog
  const recommendations = CareerNavigatorService.recommendCareers(candidate);
  const availableRoles = CareerNavigatorService.getAvailableTransitionRoles();

  // State Management
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([
    recommendations[0]?.id,
    recommendations[1]?.id
  ]);
  const [isComparing, setIsComparing] = useState<boolean>(false);
  const [selectedCareerDetail, setSelectedCareerDetail] = useState<RecommendedCareerPath | null>(null);

  // Transition Mode State ("Move from X to Y")
  const [transitionCurrentRole, setTransitionCurrentRole] = useState<string>(
    candidate.targetRoles[0] || 'Full Stack Engineer'
  );
  const [transitionTargetRole, setTransitionTargetRole] = useState<string>(
    'AI Solutions Architect'
  );
  const [activeTransitionPlan, setActiveTransitionPlan] = useState<CareerTransitionPlan | null>(() =>
    CareerNavigatorService.calculateCareerTransition(
      candidate,
      candidate.targetRoles[0] || 'Full Stack Engineer',
      'AI Solutions Architect'
    )
  );

  // Diagnostics Modal State
  const [isTestModalOpen, setIsTestModalOpen] = useState<boolean>(false);
  const [testResults, setTestResults] = useState<CareerTestResult[]>([]);

  // Overall Job Readiness Score (Synced from Step 6)
  const readinessAssessment = ReadinessScoringService.calculateReadiness(candidate);



  const toggleSelectForComparison = (id: string) => {
    if (selectedForComparison.includes(id)) {
      setSelectedForComparison(selectedForComparison.filter((i) => i !== id));
    } else {
      if (selectedForComparison.length >= 3) return; // Cap at 3
      setSelectedForComparison([...selectedForComparison, id]);
    }
  };

  const handleCalculateTransition = (e: React.FormEvent) => {
    e.preventDefault();
    const plan = CareerNavigatorService.calculateCareerTransition(
      candidate,
      transitionCurrentRole,
      transitionTargetRole
    );
    setActiveTransitionPlan(plan);
  };

  const handleRunCareerTests = () => {
    const results = runCareerEngineTests();
    setTestResults(results);
    setIsTestModalOpen(true);
  };

  const selectedCareerObjects = recommendations.filter((r) => selectedForComparison.includes(r.id));

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header Banner */}
      <div className="glass-card p-6 rounded-2xl border border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-teal flex items-center justify-center text-white shadow-glow-sm">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-extrabold text-white tracking-wide">
                AI Career Path Navigator
              </h1>
              <p className="text-xs text-gray-400 font-mono">
                Discover where you are, where you can go, what to learn, and target roles.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleRunCareerTests}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gray-800/80 hover:bg-gray-700 text-gray-200 border border-gray-700 transition-all shadow-sm"
          >
            <Play className="w-3.5 h-3.5 text-accent-teal" />
            Run Diagnostics (10 Tests)
          </button>

          {selectedForComparison.length >= 2 && (
            <button
              onClick={() => setIsComparing(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white shadow-glow-sm transition-all"
            >
              <Layers className="w-4 h-4" />
              Compare ({selectedForComparison.length})
            </button>
          )}
        </div>
      </div>

      {/* SECTION 1: CURRENT PROFILE OVERVIEW */}
      <div className="glass-card p-6 rounded-2xl border border-gray-800 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-800/80 pb-3">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-brand-400" />
            <h2 className="text-base font-bold text-white font-display">1. Current Profile Baseline</h2>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-brand-950 text-accent-teal border border-brand-500/30">
            Auto-Synced with Resume & Profile
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          {/* Current Skills */}
          <div className="p-4 rounded-xl bg-gray-900/80 border border-gray-800 space-y-2">
            <span className="text-[10px] font-mono font-bold text-gray-400 uppercase block">
              Verified Candidate Skills ({candidate.skills.length})
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {candidate.skills.map((s, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded bg-brand-950/60 text-brand-300 border border-brand-500/30 text-[11px] font-medium"
                >
                  {s.name} {s.level ? `(${s.level})` : ''}
                </span>
              ))}
            </div>
          </div>

          {/* Experience & Education */}
          <div className="p-4 rounded-xl bg-gray-900/80 border border-gray-800 space-y-2">
            <span className="text-[10px] font-mono font-bold text-gray-400 uppercase block">
              Experience & Education
            </span>
            <p className="font-semibold text-white">
              {candidate.yearsOfExperience} Years Experience
            </p>
            <p className="text-gray-400">
              {typeof candidate.education === 'string'
                ? candidate.education
                : candidate.education && candidate.education[0]?.degree
                ? `${candidate.education[0].degree} in ${candidate.education[0].field}`
                : 'B.Tech in Computer Science'}
            </p>
          </div>

          {/* Current Target Roles */}
          <div className="p-4 rounded-xl bg-gray-900/80 border border-gray-800 space-y-2">
            <span className="text-[10px] font-mono font-bold text-gray-400 uppercase block">
              Current Target Roles
            </span>
            <div className="flex flex-wrap gap-1.5">
              {candidate.targetRoles.map((role, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-gray-800 text-gray-200 border border-gray-700 text-[11px] font-semibold"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>

          {/* Market Readiness Score */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-brand-950/60 to-gray-900 border border-brand-500/30 space-y-2 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold text-brand-300 uppercase block">
                Market Readiness Score
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-display font-extrabold text-accent-teal">
                  {readinessAssessment.overallScore}%
                </span>
                <span className="text-[11px] font-semibold text-emerald-400">
                  {readinessAssessment.statusTier}
                </span>

              </div>
            </div>
            <button
              onClick={() => navigate('/readiness')}
              className="text-[11px] font-semibold text-accent-teal hover:text-white flex items-center gap-1 transition-colors"
            >
              View Readiness Breakdown <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 2: ADJACENT CAREER OPTIONS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-accent-teal" />
            <h2 className="text-base font-bold text-white font-display">2. Recommended Adjacent Career Paths</h2>
          </div>
          <span className="text-xs text-gray-400 font-mono">
            Ranked by candidate skill overlap & Future Skills Radar signals
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommendations.map((path) => {
            const isSelected = selectedForComparison.includes(path.id);

            return (
              <div
                key={path.id}
                className={`glass-card p-6 rounded-2xl border transition-all space-y-4 bg-gray-900/90 shadow-md ${
                  isSelected ? 'border-brand-500 ring-1 ring-brand-500/50' : 'border-gray-800 hover:border-gray-700'
                }`}
              >
                {/* Path Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-brand-400 uppercase tracking-wider">
                      {path.category}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-0.5">{path.title}</h3>
                  </div>

                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-brand-950 text-accent-teal border border-brand-500/40">
                      {path.careerMatchScore}% Match
                    </span>
                  </div>
                </div>

                {/* Why It Matches Rationale */}
                <p className="text-xs text-gray-300 leading-relaxed bg-gray-950/50 p-3 rounded-xl border border-gray-800">
                  {path.whyItMatches}
                </p>

                {/* Market Signals */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-gray-950/60 border border-gray-800">
                    <span className="text-[10px] font-mono text-gray-500 block">Growth Rate</span>
                    <span className="font-bold text-emerald-400">{path.futurePotential.growthRate}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-gray-950/60 border border-gray-800">
                    <span className="text-[10px] font-mono text-gray-500 block">Demand Index</span>
                    <span className="font-bold text-purple-300">{path.futurePotential.demandIndex} / 100</span>
                  </div>
                  <div className="p-2 rounded-lg bg-gray-950/60 border border-gray-800">
                    <span className="text-[10px] font-mono text-gray-500 block">Salary Range (IN)</span>
                    <span className="font-semibold text-gray-200 text-[11px]">{path.futurePotential.salaryRangeIndia}</span>
                  </div>
                </div>

                {/* Possessed vs Missing Skills */}
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase block mb-1">
                      ✓ Possessed Skills ({path.possessedSkills.length}):
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {path.possessedSkills.map((sk, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 text-[11px]">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-amber-400 font-bold uppercase block mb-1">
                      ⚠ Skills to Acquire ({path.missingSkills.length}):
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {path.missingSkills.map((sk, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-amber-950/40 text-amber-300 border border-amber-500/30 text-[11px]">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Disclaimer Badge */}
                <div className="p-2 rounded-lg bg-gray-950/80 border border-gray-800 text-[10px] text-gray-400 flex items-start gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-gray-500 flex-shrink-0 mt-0.5" />
                  <span>{path.disclaimer}</span>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 border-t border-gray-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => toggleSelectForComparison(path.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      isSelected
                        ? 'bg-brand-600/30 text-white border-brand-500'
                        : 'bg-gray-800 text-gray-300 border-gray-700 hover:text-white'
                    }`}
                  >
                    {isSelected ? '✓ Selected for Compare' : '+ Select for Compare'}
                  </button>

                  <button
                    onClick={() => setSelectedCareerDetail(path)}
                    className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white shadow-glow-sm transition-all"
                  >
                    View Career Path View
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: CAREER TRANSITION MODE ("Move from X to Y") */}
      <div className="glass-card p-6 rounded-2xl border border-gray-800 space-y-6">
        <div className="flex items-center justify-between border-b border-gray-800/80 pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            <div>
              <h2 className="text-base font-bold text-white font-display">3. Interactive Career Transition Mode</h2>
              <p className="text-xs text-gray-400 font-mono">
                "I want to move from Role X to Role Y" — Calculate skill gaps & transition roadmap
              </p>
            </div>
          </div>
        </div>

        {/* Role Selector Controls */}
        <form onSubmit={handleCalculateTransition} className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-950/60 p-4 rounded-xl border border-gray-800">
          <div>
            <label className="text-xs font-mono uppercase text-gray-400 font-bold block mb-1.5">
              Current Role (From)
            </label>
            <select
              value={transitionCurrentRole}
              onChange={(e) => setTransitionCurrentRole(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
            >
              {availableRoles.currentRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-mono uppercase text-gray-400 font-bold block mb-1.5">
              Target Career Role (To)
            </label>
            <select
              value={transitionTargetRole}
              onChange={(e) => setTransitionTargetRole(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
            >
              {availableRoles.targetRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2 px-4 rounded-xl text-xs font-semibold bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white shadow-glow-sm transition-all"
            >
              Calculate Transition Roadmap
            </button>
          </div>
        </form>

        {/* Transition Plan Results Blueprint */}
        {activeTransitionPlan && (
          <div className="space-y-6 pt-2">
            {/* Header Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-gray-950/80 border border-gray-800 space-y-1">
                <span className="text-[10px] font-mono text-gray-400 uppercase block">Transition Route</span>
                <p className="text-xs font-bold text-white">
                  {activeTransitionPlan.currentRole} → {activeTransitionPlan.targetRole}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gray-950/80 border border-gray-800 space-y-1">
                <span className="text-[10px] font-mono text-gray-400 uppercase block">Transition Readiness</span>
                <span className="text-xl font-display font-extrabold text-accent-teal">
                  {activeTransitionPlan.readinessScore}%
                </span>
              </div>

              <div className="p-4 rounded-xl bg-gray-950/80 border border-gray-800 space-y-1">
                <span className="text-[10px] font-mono text-gray-400 uppercase block">Est. Duration</span>
                <span className="text-xl font-display font-extrabold text-purple-300">
                  {activeTransitionPlan.estimatedTransitionMonths} Months
                </span>
              </div>

              <div className="p-4 rounded-xl bg-gray-950/80 border border-gray-800 space-y-1">
                <span className="text-[10px] font-mono text-gray-400 uppercase block">Active Job Market Openings</span>
                <span className="text-xl font-display font-extrabold text-emerald-400">
                  {activeTransitionPlan.matchingJobsCount} Jobs
                </span>
              </div>
            </div>

            {/* Missing Skills Breakdown */}
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold uppercase text-gray-300 block">
                Target Skill Gaps & Priority Matrix
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {activeTransitionPlan.missingSkills.map((gap, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-gray-950/60 border border-gray-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-white">{gap.skill}</span>
                      <span className="text-[10px] text-gray-400 block font-mono">Est. {gap.estimatedHours} hrs learning</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        gap.priority === 'Critical'
                          ? 'bg-red-950/60 text-red-400 border border-red-800/60'
                          : gap.priority === 'Recommended'
                          ? 'bg-amber-950/60 text-amber-400 border border-amber-800/60'
                          : 'bg-blue-950/60 text-blue-400 border border-blue-800/60'
                      }`}
                    >
                      {gap.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Step-by-Step Learning Milestones */}
            <div className="space-y-3">
              <span className="text-xs font-mono font-bold uppercase text-gray-300 block">
                Transition Learning Path Milestones
              </span>
              <div className="space-y-3">
                {activeTransitionPlan.milestones.map((m) => (
                  <div key={m.step} className="p-4 rounded-xl bg-gray-950/60 border border-gray-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-brand-300 font-mono">
                        Step {m.step}: {m.title}
                      </span>
                      <span className="text-[11px] font-mono text-purple-300 bg-purple-950/40 px-2 py-0.5 rounded border border-purple-800/40">
                        {m.duration}
                      </span>
                    </div>
                    <p className="text-xs text-gray-300">{m.description}</p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {m.skillsToAcquire.map((sk, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-gray-900 text-gray-300 text-[10px] border border-gray-700">
                          + {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cross-Module Quick Action Buttons */}
            <div className="p-4 rounded-xl bg-brand-950/20 border border-brand-500/20 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-brand-200 font-mono">
                Connect transition roadmap with Laboria AI modules:
              </span>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => navigate('/skill-gap')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 transition-colors"
                >
                  <Target className="w-3.5 h-3.5 text-brand-400" />
                  Skill Gap Analyzer
                </button>

                <button
                  onClick={() => navigate('/radar')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 transition-colors"
                >
                  <Radar className="w-3.5 h-3.5 text-accent-teal" />
                  Future Skills Radar
                </button>

                <button
                  onClick={() => navigate('/mentor')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 transition-colors"
                >
                  <Bot className="w-3.5 h-3.5 text-purple-400" />
                  Ask AI Mentor
                </button>

                <button
                  onClick={() => navigate('/discover')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white transition-colors"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  Target Jobs ({activeTransitionPlan.matchingJobsCount})
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: DETAILED CAREER PATH VIEW */}
      {selectedCareerDetail && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-3xl rounded-2xl border border-gray-800 overflow-hidden bg-gray-900 max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-gray-800 flex items-center justify-between bg-gray-950">
              <div>
                <span className="text-[10px] font-mono text-brand-400 font-bold uppercase">
                  {selectedCareerDetail.category}
                </span>
                <h3 className="text-lg font-bold text-white">{selectedCareerDetail.title}</h3>
              </div>
              <button
                onClick={() => setSelectedCareerDetail(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Overview Rationale */}
              <div className="p-4 rounded-xl bg-gray-950/60 border border-gray-800 space-y-2">
                <span className="font-mono font-bold text-gray-400 uppercase text-[10px] block">
                  Match Rationale ({selectedCareerDetail.careerMatchScore}% Fit)
                </span>
                <p className="text-gray-200 leading-relaxed">{selectedCareerDetail.whyItMatches}</p>
              </div>

              {/* Typical Job Titles */}
              <div>
                <span className="font-mono font-bold text-gray-400 uppercase text-[10px] block mb-2">
                  Target Job Titles in Industry
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedCareerDetail.typicalJobRoles.map((role, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-lg bg-gray-800 text-gray-200 border border-gray-700 font-medium">
                      {role}
                    </span>
                  ))}
                </div>
              </div>

              {/* Learning Roadmap */}
              <div className="space-y-3">
                <span className="font-mono font-bold text-gray-300 uppercase text-[11px] block">
                  Detailed Learning Roadmap
                </span>
                <div className="space-y-3">
                  {selectedCareerDetail.learningRoadmap.map((m) => (
                    <div key={m.step} className="p-4 rounded-xl bg-gray-950/50 border border-gray-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-brand-300 font-mono">
                          Milestone {m.step}: {m.title}
                        </span>
                        <span className="text-[11px] font-mono text-purple-300">{m.duration}</span>
                      </div>
                      <p className="text-gray-400">{m.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Portfolio Projects */}
              <div className="space-y-3">
                <span className="font-mono font-bold text-gray-300 uppercase text-[11px] block">
                  Recommended Portfolio Projects
                </span>
                {selectedCareerDetail.recommendedProjects.map((proj, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-gray-950/50 border border-gray-800 space-y-2">
                    <h4 className="font-bold text-white">{proj.name}</h4>
                    <p className="text-gray-400">{proj.description}</p>
                  </div>
                ))}
              </div>

              {/* Disclaimer */}
              <div className="p-3 rounded-xl bg-gray-950/80 border border-gray-800 text-[11px] text-gray-400">
                {selectedCareerDetail.disclaimer}
              </div>
            </div>

            <div className="p-4 border-t border-gray-800 bg-gray-950 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedCareerDetail(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 text-white"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: COMPARISON VIEW */}
      {isComparing && (
        <CareerComparisonView
          careers={selectedCareerObjects}
          onClose={() => setIsComparing(false)}
        />
      )}

      {/* MODAL: DIAGNOSTICS TEST RESULTS */}
      {isTestModalOpen && testResults.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-2xl rounded-2xl border border-gray-800 overflow-hidden bg-gray-900 max-h-[85vh] flex flex-col">
            <div className="p-5 border-b border-gray-800 flex items-center justify-between bg-gray-950">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-accent-teal" />
                <div>
                  <h3 className="text-base font-bold text-white">Career Navigator Diagnostic Results</h3>
                  <p className="text-xs text-gray-400 font-mono">10-Point Automated Engine Verification</p>
                </div>
              </div>
              <button
                onClick={() => setIsTestModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3 flex-1">
              {testResults.map((r) => (
                <div
                  key={r.testId}
                  className="p-3 rounded-xl border border-gray-800 bg-gray-950 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-semibold text-white">
                      <span className="text-brand-400 font-mono">#{r.testId}</span>
                      <span>{r.testName}</span>
                    </div>
                    <p className="text-gray-400 leading-relaxed">{r.details}</p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                      r.status === 'PASSED'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-red-500/20 text-red-300 border border-red-500/40'
                    }`}
                  >
                    {r.status}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-gray-800 bg-gray-950 flex items-center justify-between">
              <span className="text-xs text-gray-400 font-mono">
                {testResults.filter((t) => t.status === 'PASSED').length} / {testResults.length} Tests Passed
              </span>
              <button
                onClick={() => setIsTestModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white"
              >
                Close Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
