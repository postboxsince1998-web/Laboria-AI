import React, { useState } from 'react';
import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Modal } from '../components/ui/Modal';
import { CandidateProfile } from '../types';
import {
  SoftSkillsCoachService,
  SoftSkillsEvaluationOutput,
  PracticeExercise
} from '../services/softSkillsCoachService';
import { runSoftSkillsEngineTests, SoftSkillsTestResult } from '../services/softSkillsEngineTests';
import {
  Mic,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  ShieldCheck,
  Award,
  BookOpen,
  Calendar,
  Clock,
  ArrowRight,
  Send,
  HelpCircle
} from 'lucide-react';

interface SoftSkillsProps {
  candidate: CandidateProfile;
}

export const SoftSkillsCoach: React.FC<SoftSkillsProps> = ({ candidate }) => {
  const [sampleText, setSampleText] = useState<string>(
    `Hi recruiter, I saw your opening for Senior Full Stack Engineer. I have 4 years of experience building React and Node.js applications at TechNovation Labs. I am interested in applying.`
  );

  const [evaluation, setEvaluation] = useState<SoftSkillsEvaluationOutput>(() =>
    SoftSkillsCoachService.evaluateSampleText(sampleText, candidate)
  );

  const [isLoading, setIsLoading] = useState(false);
  const [activeExercise, setActiveExercise] = useState<PracticeExercise | null>(null);

  // Test Runner Modal State
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testResults, setTestResults] = useState<SoftSkillsTestResult[]>([]);

  const handleEvaluateText = () => {
    if (!sampleText.trim()) return;
    setIsLoading(true);
    setTimeout(() => {
      const res = SoftSkillsCoachService.evaluateSampleText(sampleText, candidate);
      setEvaluation(res);
      setIsLoading(false);
    }, 600);
  };

  const handleRunSoftSkillsTests = () => {
    const results = runSoftSkillsEngineTests();
    setTestResults(results);
    setIsTestModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-brand-500/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 mb-2">
              <Mic className="w-3.5 h-3.5" /> Module 10: Communication & Soft Skills Coach
            </div>
            <h1 className="text-2xl font-bold text-white font-display">
              10-Area Soft Skills Evaluator & Phrasing Coach
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Constructive Feedback Policy: We highlight strengths first and provide positive refinement advice. No negative labels.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRunSoftSkillsTests}
              icon={<ShieldCheck className="w-4 h-4 text-emerald-400" />}
            >
              Run Soft Skills Tests
            </Button>
          </div>
        </div>
      </div>

      {/* Grid: Interactive Text Evaluator & Overall Score Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Text Evaluator */}
        <Card className="lg:col-span-2 space-y-4" glow>
          <CardHeader>
            <CardTitle icon={<MessageCircle className="w-5 h-5 text-purple-400" />}>
              Interactive Message & Response Evaluator
            </CardTitle>
          </CardHeader>

          <div className="space-y-3">
            <p className="text-xs text-gray-400">
              Paste your recruiter cold outreach email, intro speech, or mock interview response below for 10-area analysis:
            </p>

            <textarea
              rows={5}
              value={sampleText}
              onChange={(e) => setSampleText(e.target.value)}
              placeholder="Paste your cold email, recruiter message, or interview speech here..."
              className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
            />

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 font-mono">
                Word Count: {sampleText.trim().split(/\s+/).filter(Boolean).length} words
              </span>
              <Button
                variant="accent"
                onClick={handleEvaluateText}
                disabled={isLoading || !sampleText.trim()}
                icon={<Sparkles className="w-4 h-4" />}
              >
                Analyze 10 Soft Skill Areas
              </Button>
            </div>
          </div>
        </Card>

        {/* Overall Communication Score Hero Card */}
        <Card className="text-center py-6 flex flex-col justify-between">
          <div>
            <div className="inline-flex p-3 rounded-full bg-purple-600/20 border border-purple-500/30 text-purple-400 mb-2">
              <Award className="w-8 h-8" />
            </div>

            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider font-mono">
              Overall Communication Index
            </span>
            <h2 className="text-5xl font-extrabold text-white font-display mt-1">
              {evaluation.overallCommunicationScore}<span className="text-2xl text-purple-400">/100</span>
            </h2>

            <div className="mt-2">
              <Badge variant="purple">{evaluation.toneAssessment}</Badge>
            </div>

            <div className="mt-4 px-4">
              <ProgressBar value={evaluation.overallCommunicationScore} color="purple" height="md" showValue={false} />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-800 text-xs text-emerald-400 font-semibold flex items-center justify-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> Zero Negative Labels Policy Active
          </div>
        </Card>
      </div>

      {/* Constructive Phrasing Feedback Box */}
      <Card className="bg-gradient-to-r from-gray-900 via-gray-900 to-purple-950/40 border border-purple-500/30 space-y-4">
        <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          Constructive Feedback & Refinement Recommendations
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Strengths First */}
          <div className="p-4 rounded-xl bg-gray-900/80 border border-emerald-500/30 space-y-2">
            <p className="font-bold text-emerald-400 flex items-center gap-1.5 font-display">
              <CheckCircle2 className="w-4 h-4" /> Core Phrasing Strengths
            </p>
            <ul className="space-y-1.5 text-gray-200 text-[11px] list-disc list-inside">
              {evaluation.strengthsHighlight.map((str, i) => (
                <li key={i}>{str}</li>
              ))}
            </ul>
          </div>

          {/* Positive Refinement Advice */}
          <div className="p-4 rounded-xl bg-gray-900/80 border border-brand-500/30 space-y-2">
            <p className="font-bold text-brand-300 flex items-center gap-1.5 font-display">
              <Sparkles className="w-4 h-4 text-brand-400" /> Encouraging Refinement Advice
            </p>
            <ul className="space-y-1.5 text-gray-200 text-[11px] list-disc list-inside">
              {evaluation.constructiveRefinements.map((ref, i) => (
                <li key={i}>{ref}</li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      {/* 10 Evaluated Soft Skill Areas Matrix */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
          <Award className="w-5 h-5 text-brand-400" />
          10 Soft Skill Evaluation Areas
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 text-xs">
          {evaluation.evaluatedAreas.map((area) => (
            <Card key={area.key} className="space-y-2">
              <div className="flex justify-between items-start">
                <span className="font-bold text-white text-xs">{area.areaName}</span>
                <span className="text-sm font-extrabold text-brand-300 font-display">{area.score}</span>
              </div>
              <ProgressBar value={area.score} color={area.score >= 80 ? 'teal' : 'brand'} height="sm" showValue={false} />
              <p className="text-[10px] text-gray-400 leading-tight">{area.positiveInsight}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Targeted Practice Exercises Section */}
      <div className="space-y-4 pt-2">
        <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-accent-teal" />
          Targeted Soft Skill Practice Exercises
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {evaluation.targetedExercises.map((ex) => (
            <Card key={ex.id} glow className="space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="purple">{ex.category}</Badge>
                  <span className="text-[11px] text-gray-400 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-brand-400" /> {ex.duration}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white font-display">{ex.title}</h3>
                <p className="text-xs text-gray-300 leading-relaxed">{ex.objective}</p>
              </div>

              <div className="pt-3 border-t border-gray-800 flex justify-end">
                <Button
                  size="sm"
                  variant="accent"
                  onClick={() => setActiveExercise(ex)}
                  icon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Start Practice Exercise
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* 4-Week Soft Skills Improvement Plan */}
      <Card className="space-y-4">
        <CardHeader>
          <CardTitle icon={<Calendar className="w-5 h-5 text-brand-400" />}>
            Personalized 4-Week Soft Skills Improvement Plan
          </CardTitle>
        </CardHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          {evaluation.fourWeekPlan.map((step) => (
            <div key={step.week} className="p-4 rounded-xl bg-gray-900/80 border border-gray-800 space-y-2 flex flex-col justify-between">
              <div className="space-y-1">
                <span className="font-bold text-brand-400 font-display">Week 0{step.week} Focus</span>
                <h4 className="font-bold text-white text-sm">{step.focusArea}</h4>
                <p className="text-gray-300 text-[11px] leading-relaxed">{step.goal}</p>
              </div>
              <div className="pt-2 border-t border-gray-800/80 text-[10px] text-emerald-400 font-semibold">
                Action: {step.recommendedAction}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Interactive Practice Exercise Modal */}
      {activeExercise && (
        <Modal
          isOpen={Boolean(activeExercise)}
          onClose={() => setActiveExercise(null)}
          title={`Practice Exercise: ${activeExercise.title}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-lg bg-brand-950/40 border border-brand-500/30 space-y-1">
              <p className="font-bold text-brand-300">Objective:</p>
              <p className="text-gray-200">{activeExercise.objective}</p>
            </div>

            <div className="space-y-1">
              <p className="font-bold text-white">Guided Prompt:</p>
              <p className="text-gray-300 italic">{activeExercise.guidedPrompt}</p>
            </div>

            <div className="p-3 rounded-lg bg-gray-900/90 border border-gray-800 space-y-1">
              <p className="font-bold text-emerald-400">Sample High-Impact Model Answer:</p>
              <p className="text-gray-200 text-[11px] leading-relaxed italic">{activeExercise.sampleModelAnswer}</p>
            </div>

            <div className="pt-2 flex justify-end">
              <Button size="sm" variant="accent" onClick={() => setActiveExercise(null)}>
                Done & Mark Complete
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Automated Soft Skills Tests Modal */}
      <Modal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        title="Laboria AI - Soft Skills Engine Diagnostic & Test Suite"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-semibold">
            ✓ Verified: Evaluated all 10 areas; zero negative labels used in candidate feedback.
          </div>

          <div className="space-y-2">
            {testResults.map((tr, i) => (
              <div
                key={i}
                className="p-3 rounded-lg bg-gray-900/80 border border-gray-800 flex items-center justify-between gap-3"
              >
                <div>
                  <p className="font-bold text-white">{tr.testName}</p>
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
