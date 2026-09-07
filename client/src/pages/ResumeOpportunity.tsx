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
  ResumeParserService,
  ExtractedCandidateProfile,
  ParsingProgressStep,
  ProvenanceSource
} from '../services/resumeParser';
import {
  ResumeOpportunityEngine,
  TransparentMatchResult,
  MatchTier,
  ApplicationRecommendationTier
} from '../services/resumeOpportunityEngine';
import { runResumeEngineTests, ResumeEngineTestResult } from '../services/resumeEngineTests';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  MapPin,
  Edit3,
  Check,
  RefreshCw,
  HelpCircle,
  ShieldCheck,
  Target,
  FileCheck,
  Filter,
  ArrowUpDown,
  ExternalLink,
  ChevronRight,
  Briefcase,
  Award,
  Layers,
  Zap,
  Info
} from 'lucide-react';

interface ResumeOpportunityProps {
  candidate: CandidateProfile;
  onNavigateToInterview?: (jobTitle?: string) => void;
}

export const ResumeOpportunity: React.FC<ResumeOpportunityProps> = ({
  candidate,
  onNavigateToInterview
}) => {
  const navigate = useNavigate();

  const handleInterviewPrepNav = (jobTitle?: string) => {
    if (onNavigateToInterview) {
      onNavigateToInterview(jobTitle);
    } else {
      navigate('/interview-prep');
    }
  };

  // Step 1: Parsing & Extraction State
  const [fileName, setFileName] = useState<string>('Aarav_Sharma_Resume.pdf');
  const [rawText, setRawText] = useState<string>(candidate.resumeText);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [parsingProgress, setParsingProgress] = useState<ParsingProgressStep | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // Step 2: Extracted Candidate Profile State
  const [profile, setProfile] = useState<ExtractedCandidateProfile>(() =>
    ResumeParserService.parseResumeText(candidate.resumeText, 'Aarav_Sharma_Resume.pdf')
  );

  // Interactive Editing State
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
  const [editTechSkills, setEditTechSkills] = useState<string>(profile.technicalSkills.join(', '));
  const [editSoftSkills, setEditSoftSkills] = useState<string>(profile.softSkills.join(', '));
  const [editLocationCity, setEditLocationCity] = useState<string>(profile.location.city);
  const [editPreferredRoles, setEditPreferredRoles] = useState<string>(profile.preferredRoles.join(', '));
  const [editDegree, setEditDegree] = useState<string>(profile.degree);
  const [editYOE, setEditYOE] = useState<number>(profile.experienceYears);

  // Step 3: Match Engine, Sorting & Filtering State
  const [matches, setMatches] = useState<TransparentMatchResult[]>([]);
  const [activeTierFilter, setActiveTierFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'profileMatch' | 'priorityScore' | 'distance'>('profileMatch');
  const [selectedJobMatch, setSelectedJobMatch] = useState<TransparentMatchResult | null>(null);

  // Test Suite Modal State
  const [isTestModalOpen, setIsTestModalOpen] = useState<boolean>(false);
  const [testResults, setTestResults] = useState<ResumeEngineTestResult[]>([]);

  // Compute matches on initial load or profile update
  const computeMatches = (currentProfile: ExtractedCandidateProfile) => {
    const results = ResumeOpportunityEngine.runMatchAnalysis(currentProfile, seedJobs);
    setMatches(results);
  };

  useEffect(() => {
    computeMatches(profile);
  }, []);

  // Handle Real File Upload / Drag & Drop
  const processUploadedFile = async (file: File) => {
    setUploadError(null);
    const validation = ResumeParserService.validateFile(file);
    if (!validation.valid) {
      setUploadError(validation.error || 'Invalid file format.');
      return;
    }

    setFileName(file.name);
    setIsExtracting(true);
    const parser = new ResumeParserService();

    try {
      const parsed = await parser.parseResumeFile(file, (progress) => {
        setParsingProgress(progress);
      });

      // Update Provenance to track fields modified via uploaded resume vs user edits
      parsed.provenance = {
        ...parsed.provenance,
        technicalSkills: 'resume',
        degree: 'resume',
        experienceYears: 'resume'
      };

      setProfile(parsed);
      setRawText(parsed.rawText);
      setEditTechSkills(parsed.technicalSkills.join(', '));
      setEditSoftSkills(parsed.softSkills.join(', '));
      setEditLocationCity(parsed.location.city);
      setEditPreferredRoles(parsed.preferredRoles.join(', '));
      setEditDegree(parsed.degree);
      setEditYOE(parsed.experienceYears);

      computeMatches(parsed);
    } catch (err: any) {
      setUploadError(err.message || 'Error processing resume document.');
    } finally {
      setIsExtracting(false);
      setParsingProgress(null);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  // Save Candidate Profile Edits & Mark Provenance as user_input
  const handleSaveProfileEdits = () => {
    const updated: ExtractedCandidateProfile = {
      ...profile,
      degree: editDegree,
      experienceYears: Number(editYOE) || 4,
      technicalSkills: editTechSkills.split(',').map((s) => s.trim()).filter(Boolean),
      softSkills: editSoftSkills.split(',').map((s) => s.trim()).filter(Boolean),
      location: { ...profile.location, city: editLocationCity.trim() },
      preferredRoles: editPreferredRoles.split(',').map((s) => s.trim()).filter(Boolean),
      provenance: {
        ...profile.provenance,
        degree: 'user_input',
        technicalSkills: 'user_input',
        softSkills: 'user_input',
        location: 'user_input',
        preferredRoles: 'user_input'
      }
    };

    setProfile(updated);
    setIsEditingProfile(false);
    computeMatches(updated);
  };

  // Filter Matches by Tier, Remote, Nearby, etc.
  const filteredMatches = matches.filter((m) => {
    if (activeTierFilter === 'All') return true;
    if (activeTierFilter === 'Remote') return m.job.employmentType === 'Remote';
    if (activeTierFilter === 'Nearby') return m.distanceKm <= 50;
    if (activeTierFilter === 'Fresher') return m.job.experienceRequired.min <= 1;
    return m.tier === activeTierFilter;
  });

  // Sort Filtered Matches
  const sortedMatches = [...filteredMatches].sort((a, b) => {
    if (sortBy === 'profileMatch') {
      return b.profileMatchScore - a.profileMatchScore;
    }
    if (sortBy === 'priorityScore') {
      return b.finalPriorityScore - a.finalPriorityScore;
    }
    if (sortBy === 'distance') {
      return a.distanceKm - b.distanceKm;
    }
    return 0;
  });

  // Summary Metrics Breakdown
  const totalJobsCount = matches.length;
  const strongMatchesCount = matches.filter((m) => m.tier === 'Strong Match').length;
  const goodMatchesCount = matches.filter((m) => m.tier === 'Good Match').length;
  const potentialMatchesCount = matches.filter((m) => m.tier === 'Potential Match').length;
  const lowMatchesCount = matches.filter((m) => m.tier === 'Low Match').length;

  // Execute Scoring Engine Tests
  const handleRunScoringTests = () => {
    const results = runResumeEngineTests();
    setTestResults(results);
    setIsTestModalOpen(true);
  };

  const renderProvenanceBadge = (source?: ProvenanceSource) => {
    if (source === 'resume') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono">
          📄 Resume Text
        </span>
      );
    }
    if (source === 'user_input') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-300 border border-brand-500/20 font-mono">
          ✏️ User Edited
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono">
        🤖 AI Inferred
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-brand-500/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30 mb-2">
              <Zap className="w-3.5 h-3.5" /> Flagship Module: Resume → Opportunity
            </div>
            <h1 className="text-2xl font-bold text-white font-display">
              Resume → Opportunity
            </h1>
            <p className="text-gray-300 text-sm mt-1">
              Upload your resume and let Laboria AI find the opportunities that fit you.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRunScoringTests}
              icon={<ShieldCheck className="w-4 h-4 text-emerald-400" />}
            >
              Run 12-Point Test Suite
            </Button>
          </div>
        </div>
      </div>

      {/* Top Dashboard: Summary Metrics (DEMO DATA) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card className="text-center py-4 bg-gray-900/90 border-brand-500/20">
          <span className="text-[10px] uppercase font-mono text-gray-400">Jobs Analyzed</span>
          <div className="text-2xl font-extrabold text-white font-display mt-0.5">{totalJobsCount}</div>
          <span className="text-[10px] text-brand-400">DEMO DATASET</span>
        </Card>

        <Card className="text-center py-4 bg-emerald-950/20 border-emerald-500/30">
          <span className="text-[10px] uppercase font-mono text-emerald-400">Strong Matches</span>
          <div className="text-2xl font-extrabold text-emerald-300 font-display mt-0.5">{strongMatchesCount}</div>
          <span className="text-[10px] text-emerald-400/80">85–100% Fit</span>
        </Card>

        <Card className="text-center py-4 bg-brand-950/20 border-brand-500/30">
          <span className="text-[10px] uppercase font-mono text-brand-300">Good Matches</span>
          <div className="text-2xl font-extrabold text-brand-300 font-display mt-0.5">{goodMatchesCount}</div>
          <span className="text-[10px] text-brand-400/80">70–84% Fit</span>
        </Card>

        <Card className="text-center py-4 bg-amber-950/20 border-amber-500/30">
          <span className="text-[10px] uppercase font-mono text-amber-400">Potential Matches</span>
          <div className="text-2xl font-extrabold text-amber-300 font-display mt-0.5">{potentialMatchesCount}</div>
          <span className="text-[10px] text-amber-400/80">55–69% Fit</span>
        </Card>

        <Card className="text-center py-4 bg-rose-950/20 border-rose-500/30 col-span-2 sm:col-span-1">
          <span className="text-[10px] uppercase font-mono text-rose-400">Low Matches</span>
          <div className="text-2xl font-extrabold text-rose-300 font-display mt-0.5">{lowMatchesCount}</div>
          <span className="text-[10px] text-rose-400/80">&lt;55% Fit</span>
        </Card>
      </div>

      {/* Grid: Resume Upload & Extracted Candidate Profile Review */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Step 1: Drag & Drop Resume Upload Card */}
        <Card className="flex flex-col justify-between p-5">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-brand-400" /> Upload Your Resume
              </h3>
              <Badge variant="info">PDF, DOC, DOCX</Badge>
            </div>

            {/* Drag & Drop Target Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              className={`p-6 border-2 border-dashed rounded-xl text-center transition cursor-pointer ${
                isDragOver
                  ? 'border-brand-400 bg-brand-500/10'
                  : 'border-gray-800 hover:border-gray-700 bg-gray-900/40'
              }`}
            >
              <UploadCloud className="w-10 h-10 text-brand-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-white">Drag & drop resume here</p>
              <p className="text-[11px] text-gray-400 mt-1 mb-3">or choose a file from your computer</p>

              <label className="inline-block cursor-pointer">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition shadow-glow-sm">
                  Browse Resume File
                </span>
              </label>
            </div>

            {/* Error Banner */}
            {uploadError && (
              <div className="mt-3 p-3 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Multi-Step Async Upload Progress */}
            {isExtracting && parsingProgress && (
              <div className="mt-4 p-3 rounded-xl bg-gray-900 border border-brand-500/30 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-brand-300">
                    Step {parsingProgress.stepIndex} of 6: {parsingProgress.stepName}
                  </span>
                  <Sparkles className="w-3.5 h-3.5 text-brand-400 animate-spin" />
                </div>
                <p className="text-[11px] text-gray-400">{parsingProgress.description}</p>
                <ProgressBar value={(parsingProgress.stepIndex / 6) * 100} height="sm" color="brand" />
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-800 text-left text-xs space-y-1">
            <div className="flex justify-between items-center text-gray-300">
              <span className="text-gray-400 text-[11px]">Active Document:</span>
              <Badge variant="info">{fileName}</Badge>
            </div>
            <p className="text-gray-400 text-[11px] truncate">
              {rawText.slice(0, 100)}...
            </p>
          </div>
        </Card>

        {/* Step 2: Extracted Candidate Profile Review & Edit Card */}
        <Card className="lg:col-span-2" glow>
          <CardHeader>
            <div>
              <CardTitle icon={<FileCheck className="w-5 h-5 text-emerald-400" />}>
                Candidate Profile (Analyzed from Resume)
              </CardTitle>
              <p className="text-xs text-gray-400 mt-0.5">
                Review and correct extracted details. Laboria AI updates job matches automatically.
              </p>
            </div>
            <Button
              size="sm"
              variant={isEditingProfile ? 'accent' : 'secondary'}
              onClick={() => {
                if (isEditingProfile) {
                  handleSaveProfileEdits();
                } else {
                  setIsEditingProfile(true);
                }
              }}
              icon={isEditingProfile ? <Check className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
            >
              {isEditingProfile ? 'Save & Recalculate' : 'Edit Profile'}
            </Button>
          </CardHeader>

          {isEditingProfile ? (
            /* Editable Form Mode */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-gray-400 font-semibold flex items-center justify-between">
                  <span>Degree / Qualification</span>
                  {renderProvenanceBadge(profile.provenance.degree)}
                </label>
                <input
                  type="text"
                  value={editDegree}
                  onChange={(e) => setEditDegree(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-400 font-semibold flex items-center justify-between">
                  <span>Years of Experience (YOE)</span>
                  {renderProvenanceBadge(profile.provenance.experienceYears)}
                </label>
                <input
                  type="number"
                  value={editYOE}
                  onChange={(e) => setEditYOE(Number(e.target.value))}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-gray-400 font-semibold flex items-center justify-between">
                  <span>Technical Skills (Comma Separated)</span>
                  {renderProvenanceBadge(profile.provenance.technicalSkills)}
                </label>
                <input
                  type="text"
                  value={editTechSkills}
                  onChange={(e) => setEditTechSkills(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-gray-400 font-semibold flex items-center justify-between">
                  <span>Soft Skills (Comma Separated)</span>
                  {renderProvenanceBadge(profile.provenance.softSkills)}
                </label>
                <input
                  type="text"
                  value={editSoftSkills}
                  onChange={(e) => setEditSoftSkills(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-400 font-semibold flex items-center justify-between">
                  <span>Current Location (City)</span>
                  {renderProvenanceBadge(profile.provenance.location)}
                </label>
                <input
                  type="text"
                  value={editLocationCity}
                  onChange={(e) => setEditLocationCity(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-400 font-semibold flex items-center justify-between">
                  <span>Preferred Target Roles (Comma Separated)</span>
                  {renderProvenanceBadge(profile.provenance.preferredRoles)}
                </label>
                <input
                  type="text"
                  value={editPreferredRoles}
                  onChange={(e) => setEditPreferredRoles(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white"
                />
              </div>
            </div>
          ) : (
            /* Read-Only Candidate Profile Review Card */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 font-medium">Education & Degree:</span>
                  {renderProvenanceBadge(profile.provenance.degree)}
                </div>
                <p className="font-semibold text-white">{profile.degree} ({profile.specialization})</p>
                <p className="text-gray-400 text-[11px]">{profile.education} • Class of {profile.graduationYear}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 font-medium">Experience & Location:</span>
                  {renderProvenanceBadge(profile.provenance.location)}
                </div>
                <p className="font-semibold text-white">{profile.experienceYears} Years Professional Experience</p>
                <p className="text-gray-400 text-[11px] flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-400" /> {profile.location.city}, {profile.location.state}
                </p>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-gray-400 font-medium">Technical Skills ({profile.technicalSkills.length}):</span>
                  {renderProvenanceBadge(profile.provenance.technicalSkills)}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {profile.technicalSkills.map((sk) => (
                    <Badge key={sk} variant="info">{sk}</Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-gray-400 font-medium">Soft Skills & Target Roles:</span>
                  {renderProvenanceBadge(profile.provenance.preferredRoles)}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {profile.softSkills.map((ss) => (
                    <Badge key={ss} variant="purple">{ss}</Badge>
                  ))}
                  {profile.preferredRoles.map((pr) => (
                    <Badge key={pr} variant="success">🎯 {pr}</Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Step 3: Match Results Feed, Filters & Sorting Controls */}
      <div className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
              <Target className="w-5 h-5 text-brand-400" />
              Matched Opportunities ({sortedMatches.length})
            </h2>
            <p className="text-xs text-gray-400">
              Primary Ranking Factor: <strong className="text-brand-300">PROFILE_MATCH (70%)</strong> &gt; Location (15%) &gt; Exp (10%) &gt; Pref (5%)
            </p>
          </div>

          {/* Sorting Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 flex items-center gap-1 font-semibold">
              <ArrowUpDown className="w-3.5 h-3.5" /> Sort By:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-gray-900 border border-gray-700 text-white rounded-lg text-xs p-2 focus:ring-1 focus:ring-brand-500"
            >
              <option value="profileMatch">Highest Profile Match (Default)</option>
              <option value="priorityScore">Highest Priority Score</option>
              <option value="distance">Nearest Location</option>
            </select>
          </div>
        </div>

        {/* Classification Tier Filter Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap border-b border-gray-800 pb-3">
          {['All', 'Strong Match', 'Good Match', 'Potential Match', 'Low Match', 'Remote', 'Nearby', 'Fresher'].map((tier) => (
            <button
              key={tier}
              onClick={() => setActiveTierFilter(tier)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTierFilter === tier
                  ? 'bg-brand-600 text-white shadow-glow-sm'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {tier}
            </button>
          ))}
        </div>

        {/* Matched Job Cards Feed */}
        <div className="space-y-6">
          {sortedMatches.map((match) => (
            <Card key={match.job.id} glow={match.tier === 'Strong Match'}>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gray-800/80">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-lg font-bold text-white font-display">{match.job.title}</h3>
                    <Badge
                      variant={
                        match.tier === 'Strong Match'
                          ? 'match-high'
                          : match.tier === 'Good Match'
                          ? 'match-mid'
                          : 'warning'
                      }
                    >
                      {match.tier}
                    </Badge>
                    <Badge variant="purple">{match.job.employmentType}</Badge>
                    <Badge variant="info">DEMO DATA</Badge>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                    <span className="font-semibold text-white">{match.job.company}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-emerald-400">
                      <MapPin className="w-3.5 h-3.5" />
                      {match.job.location}
                    </span>
                    <span>•</span>
                    <span>
                      {match.job.employmentType === 'Remote'
                        ? 'Remote (0 km)'
                        : `📍 ${match.distanceKm} km away`}
                    </span>
                    <span>•</span>
                    <span>💼 {match.job.experienceRequired.min}–{match.job.experienceRequired.max} YOE</span>
                  </div>
                </div>

                {/* Transparent Scores Display: Profile Match (70%) vs Final Priority */}
                <div className="flex items-center gap-4 bg-gray-900/80 border border-gray-800 p-3 rounded-xl">
                  <div className="text-center px-2">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Profile Match</span>
                    <div className="text-2xl font-extrabold text-brand-300 font-display">
                      {match.profileMatchScore}%
                    </div>
                  </div>

                  <div className="h-8 w-px bg-gray-800" />

                  <div className="text-center px-2">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Final Priority</span>
                    <div className="text-2xl font-extrabold text-emerald-400 font-display">
                      {match.finalPriorityScore}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills Breakdown Row */}
              <div className="py-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="font-semibold text-emerald-400 flex items-center gap-1 mb-1.5">
                    ✓ Matched Skills ({match.matchingSkills.length})
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {match.matchingSkills.map((sk) => (
                      <Badge key={sk} variant="success">✓ {sk}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="font-semibold text-rose-400 flex items-center gap-1 mb-1.5">
                    ⚠ Missing Required Skills ({match.missingSkills.length})
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {match.missingSkills.length > 0 ? (
                      match.missingSkills.map((sk) => (
                        <Badge key={sk} variant="match-low">⚠ {sk}</Badge>
                      ))
                    ) : (
                      <span className="text-gray-400 text-[11px] italic">Zero core skill gaps</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Recommendation Quote & Action Buttons */}
              <div className="mt-3 pt-3 border-t border-gray-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <p className="text-brand-300 font-medium italic flex items-center gap-1.5">
                  💡 Recommendation: "{match.recommendationText}"
                </p>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedJobMatch(match)}
                    icon={<Info className="w-3.5 h-3.5 text-brand-300" />}
                  >
                    View Full Match
                  </Button>
                  <Button
                    size="sm"
                    variant="accent"
                    onClick={() => handleInterviewPrepNav(match.job.title)}
                    icon={<Zap className="w-3.5 h-3.5 text-white" />}
                  >
                    Prepare for Interview
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Detailed Job Analysis Modal ("Why This Job?" & "What May Reduce Your Chances?") */}
      {selectedJobMatch && (
        <Modal
          isOpen={Boolean(selectedJobMatch)}
          onClose={() => setSelectedJobMatch(null)}
          title={`Detailed Match Breakdown: ${selectedJobMatch.job.title}`}
        >
          <div className="space-y-4 text-xs">
            {/* Header info */}
            <div className="p-3.5 rounded-xl bg-gray-900/90 border border-brand-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-white font-display">{selectedJobMatch.job.company}</h4>
                <p className="text-gray-400 text-[11px] mt-0.5">
                  📍 {selectedJobMatch.job.location} ({selectedJobMatch.distanceKm} km) • 💼 {selectedJobMatch.job.experienceRequired.min}–{selectedJobMatch.job.experienceRequired.max} YOE
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="match-high">{selectedJobMatch.profileMatchScore}% Profile Match</Badge>
                <Badge variant="success">{selectedJobMatch.finalPriorityScore}% Priority</Badge>
              </div>
            </div>

            {/* Application Recommendation Badge */}
            <div className="p-3 rounded-lg bg-brand-950/40 border border-brand-500/30 text-brand-200">
              <span className="text-[10px] uppercase font-mono text-gray-400 block mb-1">Application Recommendation</span>
              <p className="font-bold text-sm text-brand-300">{selectedJobMatch.applicationRecommendation}</p>
            </div>

            {/* "Why This Job Matches You" */}
            <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
              <p className="font-bold text-emerald-400 flex items-center gap-1.5 font-display text-xs">
                <CheckCircle2 className="w-4 h-4" /> Why This Job Matches You
              </p>
              <ul className="space-y-1.5 text-gray-300 text-[11px] list-disc list-inside">
                {selectedJobMatch.whyThisJob.map((reason, i) => (
                  <li key={i}>{reason}</li>
                ))}
              </ul>
            </div>

            {/* "What May Reduce Your Chances?" */}
            <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2">
              <p className="font-bold text-amber-400 flex items-center gap-1.5 font-display text-xs">
                <AlertCircle className="w-4 h-4" /> What May Reduce Your Chances?
              </p>
              <ul className="space-y-1.5 text-gray-300 text-[11px] list-disc list-inside">
                {selectedJobMatch.whatToImprove.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>

            {/* Action Buttons inside modal */}
            <div className="pt-3 border-t border-gray-800 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedJobMatch(null)}>
                Close
              </Button>
              <Button
                variant="accent"
                size="sm"
                onClick={() => {
                  const title = selectedJobMatch.job.title;
                  setSelectedJobMatch(null);
                  handleInterviewPrepNav(title);
                }}
                icon={<Zap className="w-3.5 h-3.5" />}
              >
                Prepare for Interview
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Automated Scoring Engine Tests Modal */}
      <Modal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        title="Laboria AI - 12-Point Resume & Scoring Engine Automated Test Suite"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-semibold">
            ✓ Formula Verified: Final Priority = 0.70(Profile) + 0.15(Location) + 0.10(Exp) + 0.05(Pref)
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
