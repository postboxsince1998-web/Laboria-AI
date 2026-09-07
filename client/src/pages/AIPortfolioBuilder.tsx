import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import {
  CandidateProfile,
  CandidatePortfolio,
  PortfolioProject,
  SkillEvidenceMapping,
  SkillEvidenceSourceType
} from '../types';
import { PortfolioService } from '../services/portfolioService';
import { runPortfolioEngineTests, PortfolioTestReport } from '../services/portfolioEngineTests';
import {
  FolderGit2,
  Plus,
  Github,
  Linkedin,
  Globe,
  ExternalLink,
  Code2,
  Award,
  BookOpen,
  Briefcase,
  Layers,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Target,
  Bot,
  FileText,
  MessageSquareCode,
  Trash2,
  Edit3,
  Link,
  FileCheck
} from 'lucide-react';

interface AIPortfolioBuilderProps {
  candidate: CandidateProfile;
}

type TabType = 'overview' | 'projects' | 'evidence' | 'certifications' | 'experience';

export const AIPortfolioBuilder: React.FC<AIPortfolioBuilderProps> = ({ candidate }) => {
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState<CandidatePortfolio>(() => PortfolioService.getPortfolio(candidate));
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Modals state
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Partial<PortfolioProject>>({});

  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [selectedSkillForEvidence, setSelectedSkillForEvidence] = useState<string>('');
  const [evidenceSourceType, setEvidenceSourceType] = useState<SkillEvidenceSourceType>('Project');
  const [evidenceTitle, setEvidenceTitle] = useState('');
  const [evidenceDescription, setEvidenceDescription] = useState('');

  // Test Suite Modal State
  const [testReport, setTestReport] = useState<PortfolioTestReport | null>(null);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);

  useEffect(() => {
    const updated = PortfolioService.getPortfolio(candidate);
    setPortfolio(updated);
  }, [candidate]);

  const refreshPortfolio = () => {
    const refreshed = PortfolioService.getPortfolio(candidate);
    setPortfolio(refreshed);
  };

  // Handle Save Project in Project Builder Form
  const handleSaveProject = () => {
    if (!editingProject.title || !editingProject.problem) {
      alert('Please fill in at least the Project Title and Problem Statement.');
      return;
    }

    const projectToSave: PortfolioProject = {
      id: editingProject.id || `proj_${Date.now()}`,
      title: editingProject.title || 'Untitled Project',
      problem: editingProject.problem || '',
      technologies: Array.isArray(editingProject.technologies)
        ? editingProject.technologies
        : typeof editingProject.technologies === 'string'
        ? (editingProject.technologies as string).split(',').map((t) => t.trim()).filter(Boolean)
        : ['TypeScript', 'React'],
      role: editingProject.role || 'Full Stack Engineer',
      process: editingProject.process || '',
      outcome: editingProject.outcome || '',
      learnings: editingProject.learnings || '',
      demoUrl: editingProject.demoUrl,
      repoUrl: editingProject.repoUrl,
      featured: editingProject.featured ?? true,
    };

    const updated = PortfolioService.saveProject(candidate, projectToSave);
    setPortfolio(updated);
    setIsProjectModalOpen(false);
    setEditingProject({});
  };

  // Handle Delete Project
  const handleDeleteProject = (projectId: string) => {
    if (confirm('Are you sure you want to remove this project from your portfolio?')) {
      const updated = PortfolioService.deleteProject(candidate, projectId);
      setPortfolio(updated);
    }
  };

  // Handle Save Skill Evidence Mapping
  const handleSaveEvidenceMapping = () => {
    if (!selectedSkillForEvidence || !evidenceTitle) {
      alert('Please select a skill and enter an evidence title.');
      return;
    }

    const mapping: SkillEvidenceMapping = {
      id: `ev_${Date.now()}`,
      skillName: selectedSkillForEvidence,
      sourceType: evidenceSourceType,
      title: evidenceTitle,
      description: evidenceDescription || `Demonstrated ${selectedSkillForEvidence} in ${evidenceTitle}`,
      dateLinked: new Date().toISOString().split('T')[0],
      verificationStatus: 'Verified'
    };

    PortfolioService.addSkillEvidence(candidate, mapping);
    refreshPortfolio();
    setIsEvidenceModalOpen(false);
    setEvidenceTitle('');
    setEvidenceDescription('');
  };

  // Handle Run Automated Engine Tests
  const handleRunTests = () => {
    const report = runPortfolioEngineTests();
    setTestReport(report);
    setIsTestModalOpen(true);
  };

  const evidenceLevelLabel =
    portfolio.evidenceScore >= 80
      ? 'High Verification'
      : portfolio.evidenceScore >= 60
      ? 'Moderate Verification'
      : 'Basic Portfolio';

  const resumeSnippet = PortfolioService.generateResumePortfolioSection(portfolio);
  const jdBoost = PortfolioService.calculateJobMatchingEvidenceBoost(portfolio, candidate.skills.map((s) => s.name));
  const mentorAdvice = PortfolioService.generateMentorPortfolioAdvice(portfolio);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <Card glow className="bg-gradient-to-r from-gray-900 via-brand-950/40 to-gray-900 border-brand-500/30">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-300">
                <FolderGit2 className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-white font-display flex items-center gap-2">
                  Skill & Project Portfolio
                  <Badge variant="info">{evidenceLevelLabel}</Badge>
                </h1>
                <p className="text-gray-400 text-xs">
                  Curate your technical projects, case studies, and verified skill evidence.
                </p>
              </div>
            </div>

            {/* Candidate Links */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
              {portfolio.githubUrl && (
                <a
                  href={portfolio.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-950 border border-gray-800 text-gray-300 hover:text-white hover:border-gray-700 font-mono text-[11px]"
                >
                  <Github className="w-3.5 h-3.5" /> GitHub Portfolio
                </a>
              )}
              {portfolio.linkedinUrl && (
                <a
                  href={portfolio.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-950 border border-gray-800 text-gray-300 hover:text-white hover:border-gray-700 font-mono text-[11px]"
                >
                  <Linkedin className="w-3.5 h-3.5 text-blue-400" /> LinkedIn Profile
                </a>
              )}
              {portfolio.websiteUrl && (
                <a
                  href={portfolio.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-950 border border-gray-800 text-gray-300 hover:text-white hover:border-gray-700 font-mono text-[11px]"
                >
                  <Globe className="w-3.5 h-3.5 text-teal-400" /> Portfolio Site
                </a>
              )}
            </div>
          </div>

          {/* Scores & Header Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            <div className="flex items-center gap-3 bg-gray-950/80 border border-gray-800 p-3 rounded-2xl">
              <div className="text-center px-3 border-r border-gray-800">
                <span className="text-[10px] text-gray-400 font-mono uppercase block">Evidence Score</span>
                <span className="text-2xl font-extrabold text-brand-300 font-display">
                  {portfolio.evidenceScore}%
                </span>
              </div>
              <div className="text-center px-3">
                <span className="text-[10px] text-gray-400 font-mono uppercase block">Profile Clarity</span>
                <span className="text-2xl font-extrabold text-emerald-400 font-display">
                  {portfolio.profileUnderstandingScore}%
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                variant="accent"
                size="sm"
                onClick={() => {
                  setEditingProject({});
                  setIsProjectModalOpen(true);
                }}
                icon={<Plus className="w-4 h-4" />}
              >
                Add New Project
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRunTests}
                icon={<Sparkles className="w-4 h-4 text-brand-400" />}
              >
                Run Step 20 Tests
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* 4-Module Integration Callout Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
        <Card className="bg-gray-900/90 border-gray-800 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-brand-400 font-mono font-bold uppercase flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" /> ATS Resume Sync
            </span>
            <p className="text-gray-300 text-[11px]">
              Export {portfolio.projects.length} verified projects to ATS Resume Builder.
            </p>
          </div>
          <button
            onClick={() => navigate('/resume-builder')}
            className="text-brand-300 hover:text-brand-200 text-[11px] font-semibold flex items-center gap-1 mt-2"
          >
            Open Resume Builder &rarr;
          </button>
        </Card>

        <Card className="bg-gray-900/90 border-gray-800 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase flex items-center gap-1">
              <Target className="w-3.5 h-3.5" /> JD Matching Boost
            </span>
            <p className="text-gray-300 text-[11px]">
              +{jdBoost.evidenceBoostPoints}% match confidence for verified skills.
            </p>
          </div>
          <button
            onClick={() => navigate('/discover')}
            className="text-emerald-400 hover:text-emerald-300 text-[11px] font-semibold flex items-center gap-1 mt-2"
          >
            View Matched Jobs &rarr;
          </button>
        </Card>

        <Card className="bg-gray-900/90 border-gray-800 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-purple-400 font-mono font-bold uppercase flex items-center gap-1">
              <MessageSquareCode className="w-3.5 h-3.5" /> Interview Prompts
            </span>
            <p className="text-gray-300 text-[11px]">
              Generate STAR prompts from project roles and outcomes.
            </p>
          </div>
          <button
            onClick={() => navigate('/interview-prep')}
            className="text-purple-300 hover:text-purple-200 text-[11px] font-semibold flex items-center gap-1 mt-2"
          >
            Practice Simulator &rarr;
          </button>
        </Card>

        <Card className="bg-gray-900/90 border-gray-800 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-amber-400 font-mono font-bold uppercase flex items-center gap-1">
              <Bot className="w-3.5 h-3.5" /> AI Mentor Strategy
            </span>
            <p className="text-gray-300 text-[11px]">
              Portfolio depth increases interview selection rates by up to 2.4x.
            </p>
          </div>
          <button
            onClick={() => navigate('/mentor')}
            className="text-amber-300 hover:text-amber-200 text-[11px] font-semibold flex items-center gap-1 mt-2"
          >
            Consult AI Mentor &rarr;
          </button>
        </Card>
      </div>

      {/* Category Navigation Tabs */}
      <div className="flex border-b border-gray-800 overflow-x-auto text-xs">
        {[
          { id: 'overview', label: 'Full Portfolio Overview', icon: Layers },
          { id: 'projects', label: `Projects & Case Studies (${portfolio.projects.length})`, icon: FolderGit2 },
          { id: 'evidence', label: 'Skill Evidence Map', icon: ShieldCheck },
          { id: 'certifications', label: `Certifications & Awards (${portfolio.certifications.length + portfolio.achievements.length})`, icon: Award },
          { id: 'experience', label: 'Experience & Education', icon: Briefcase }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-4 py-3 font-semibold border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'border-brand-500 text-brand-300 bg-brand-500/10'
                  : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-800/40'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6 text-xs">
          {/* Candidate Headline & Bio */}
          <Card>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Candidate Summary & Technical Focus
                </h3>
                <Badge variant="info">{portfolio.skills.length} Target Skills</Badge>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">{portfolio.bio}</p>

              {/* Skills Overview Badges */}
              <div className="flex flex-wrap gap-2 pt-2">
                {portfolio.skills.map((s, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gray-950 border border-gray-800 text-gray-200 font-mono text-[11px]"
                  >
                    <span>{s.name}</span>
                    <span className="text-brand-400 text-[10px]">({s.level})</span>
                    {s.evidenceCount > 0 && (
                      <Badge variant="match-high" className="py-0 px-1 text-[9px]">
                        {s.evidenceCount} Evidences
                      </Badge>
                    )}
                  </span>
                ))}
              </div>
            </div>
          </Card>

          {/* Featured Projects Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-brand-400" /> Featured Projects & Case Studies
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab('projects')}
              >
                View All {portfolio.projects.length} Projects &rarr;
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {portfolio.projects.map((p) => (
                <Card key={p.id} glow className="flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-white font-display">{p.title}</h4>
                        <span className="text-brand-400 font-semibold text-[11px]">{p.role}</span>
                      </div>
                      {p.featured && <Badge variant="info">Featured</Badge>}
                    </div>

                    <p className="text-gray-300 text-[11px]">
                      <strong className="text-gray-200">Problem:</strong> {p.problem}
                    </p>

                    <div className="p-2.5 rounded-xl bg-gray-950 border border-gray-800 space-y-1">
                      <span className="text-emerald-400 font-semibold text-[11px] block">
                        Factual Outcome & Impact:
                      </span>
                      <p className="text-gray-300 text-[11px]">{p.outcome}</p>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {p.technologies.map((t, tidx) => (
                        <span
                          key={tidx}
                          className="px-2 py-0.5 rounded bg-gray-900 border border-gray-800 text-gray-400 text-[10px] font-mono"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 mt-3 border-t border-gray-800/80">
                    <div className="flex items-center gap-2">
                      {p.demoUrl && (
                        <a
                          href={p.demoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-brand-400 hover:text-brand-300 flex items-center gap-1 font-semibold text-[11px]"
                        >
                          <ExternalLink className="w-3 h-3" /> Live Demo
                        </a>
                      )}
                      {p.repoUrl && (
                        <a
                          href={p.repoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-gray-400 hover:text-white flex items-center gap-1 font-semibold text-[11px]"
                        >
                          <Github className="w-3 h-3" /> Repo
                        </a>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setEditingProject(p);
                        setIsProjectModalOpen(true);
                      }}
                      className="text-gray-400 hover:text-white flex items-center gap-1 font-semibold text-[11px]"
                    >
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Work Samples Showcase */}
          <Card>
            <h3 className="text-base font-bold text-white font-display mb-3 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-teal-400" /> Work Samples & Architecture Artifacts
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {portfolio.workSamples.map((ws) => (
                <div key={ws.id} className="p-3 rounded-xl bg-gray-950 border border-gray-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">{ws.title}</span>
                    <Badge variant="match-high">{ws.type}</Badge>
                  </div>
                  <p className="text-gray-400 text-[11px]">{ws.description}</p>
                  <a
                    href={ws.urlOrContent}
                    target="_blank"
                    rel="noreferrer"
                    className="text-teal-400 hover:text-teal-300 text-[11px] font-semibold flex items-center gap-1"
                  >
                    View Artifact Link &rarr;
                  </a>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: PROJECTS & CASE STUDIES */}
      {activeTab === 'projects' && (
        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-brand-400" /> Structured Project Builder & Case Studies
            </h3>
            <Button
              variant="accent"
              size="sm"
              onClick={() => {
                setEditingProject({});
                setIsProjectModalOpen(true);
              }}
              icon={<Plus className="w-4 h-4" />}
            >
              Add Project
            </Button>
          </div>

          <div className="space-y-4">
            {portfolio.projects.map((p) => (
              <Card key={p.id} className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-lg font-bold text-white font-display">{p.title}</h4>
                    <span className="text-brand-300 font-semibold text-xs">{p.role}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingProject(p);
                        setIsProjectModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg bg-gray-900 text-gray-300 hover:text-white border border-gray-800"
                      title="Edit Project"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProject(p.id)}
                      className="p-1.5 rounded-lg bg-gray-900 text-rose-400 hover:text-rose-300 border border-gray-800"
                      title="Delete Project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 rounded-xl bg-gray-950 border border-gray-800 space-y-1">
                    <span className="text-gray-400 font-mono font-semibold text-[11px] uppercase block">
                      Problem Statement
                    </span>
                    <p className="text-gray-200 text-xs leading-relaxed">{p.problem}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-gray-950 border border-gray-800 space-y-1">
                    <span className="text-gray-400 font-mono font-semibold text-[11px] uppercase block">
                      Process & Architecture
                    </span>
                    <p className="text-gray-200 text-xs leading-relaxed">{p.process}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40 space-y-1">
                    <span className="text-emerald-400 font-mono font-semibold text-[11px] uppercase block">
                      Factual Outcome & Results
                    </span>
                    <p className="text-emerald-200 text-xs leading-relaxed">{p.outcome}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-gray-950 border border-gray-800 space-y-1">
                    <span className="text-gray-400 font-mono font-semibold text-[11px] uppercase block">
                      Key Technical Learnings
                    </span>
                    <p className="text-gray-200 text-xs leading-relaxed">{p.learnings}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-800">
                  <div className="flex flex-wrap gap-1.5">
                    {p.technologies.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 rounded bg-gray-900 border border-gray-800 text-gray-300 font-mono text-[10px]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-3">
                    {p.demoUrl && (
                      <a
                        href={p.demoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-brand-300 hover:text-brand-200 font-semibold flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Live Demo URL
                      </a>
                    )}
                    {p.repoUrl && (
                      <a
                        href={p.repoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-gray-300 hover:text-white font-semibold flex items-center gap-1"
                      >
                        <Github className="w-3.5 h-3.5" /> GitHub Repository
                      </a>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SKILL EVIDENCE MAP */}
      {activeTab === 'evidence' && (
        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Skill Evidence Connection Matrix
              </h3>
              <p className="text-gray-400 text-xs mt-0.5">
                Connect candidate skills to Projects, Experience, Certifications, Assessments, and Courses.
              </p>
            </div>
            <Button
              variant="accent"
              size="sm"
              onClick={() => {
                setSelectedSkillForEvidence(portfolio.skills[0]?.name || '');
                setIsEvidenceModalOpen(true);
              }}
              icon={<Link className="w-4 h-4" />}
            >
              Add Skill Evidence Link
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {portfolio.skills.map((skill, sIdx) => {
              const mappings = PortfolioService.getSkillEvidenceMappings(candidate).filter(
                (m) => m.skillName.toLowerCase() === skill.name.toLowerCase()
              );

              return (
                <Card key={sIdx} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white font-display">{skill.name}</h4>
                      <span className="text-gray-400 text-[11px]">Level: {skill.level}</span>
                    </div>
                    <Badge variant={skill.evidenceCount > 0 ? 'success' : 'warning'}>
                      {skill.evidenceCount} Verified Links
                    </Badge>
                  </div>

                  {mappings.length > 0 ? (
                    <div className="space-y-2">
                      {mappings.map((m) => (
                        <div
                          key={m.id}
                          className="p-2.5 rounded-xl bg-gray-950 border border-gray-800 flex items-start justify-between gap-2"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <Badge variant="info">{m.sourceType}</Badge>
                              <span className="font-semibold text-gray-200 text-xs">{m.title}</span>
                            </div>
                            <p className="text-gray-400 text-[11px]">{m.description}</p>
                          </div>
                          <button
                            onClick={() => {
                              PortfolioService.removeSkillEvidence(candidate, m.id);
                              refreshPortfolio();
                            }}
                            className="text-gray-500 hover:text-rose-400 p-1"
                            title="Remove link"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-gray-950/60 border border-gray-800/60 text-center text-gray-400 text-[11px]">
                      No evidence connected yet. Click to map to a project or certification.
                    </div>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setSelectedSkillForEvidence(skill.name);
                      setIsEvidenceModalOpen(true);
                    }}
                  >
                    + Connect Evidence for {skill.name}
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: CERTIFICATIONS & ACHIEVEMENTS */}
      {activeTab === 'certifications' && (
        <div className="space-y-6 text-xs">
          {/* Certifications */}
          <Card>
            <h3 className="text-base font-bold text-white font-display mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-brand-400" /> Verified Industry Certifications
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {portfolio.certifications.map((c) => (
                <div key={c.id} className="p-3 rounded-xl bg-gray-950 border border-gray-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">{c.title}</span>
                    <Badge variant="success">Verified</Badge>
                  </div>
                  <p className="text-gray-400 text-[11px]">Issuer: {c.issuer} ({c.date})</p>
                  {c.credentialUrl && (
                    <a
                      href={c.credentialUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-brand-300 hover:text-brand-200 text-[11px] font-semibold flex items-center gap-1 pt-1"
                    >
                      <ExternalLink className="w-3 h-3" /> View Credential Verification
                    </a>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Achievements */}
          <Card>
            <h3 className="text-base font-bold text-white font-display mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" /> Hackathons & Technical Awards
            </h3>
            <div className="space-y-3">
              {portfolio.achievements.map((a) => (
                <div key={a.id} className="p-3 rounded-xl bg-gray-950 border border-gray-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">{a.title}</span>
                    <Badge variant="match-high">{a.category}</Badge>
                  </div>
                  <p className="text-gray-400 text-[11px]">{a.issuerOrOrg} • {a.date}</p>
                  <p className="text-gray-300 text-xs">{a.description}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 5: EXPERIENCE & EDUCATION */}
      {activeTab === 'experience' && (
        <div className="space-y-6 text-xs">
          {/* Work Experience */}
          <Card>
            <h3 className="text-base font-bold text-white font-display mb-3 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-brand-400" /> Work Experience
            </h3>
            <div className="space-y-4">
              {portfolio.experience.map((exp: any, idx: number) => (
                <div key={idx} className="p-4 rounded-xl bg-gray-950 border border-gray-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white font-display">{exp.role}</h4>
                    <span className="text-gray-400 text-xs font-mono">{exp.startDate} - {exp.endDate}</span>
                  </div>
                  <p className="text-brand-300 font-semibold text-xs">{exp.company}</p>
                  <p className="text-gray-300 text-xs leading-relaxed">{exp.description}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Education */}
          <Card>
            <h3 className="text-base font-bold text-white font-display mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-teal-400" /> Education & Academic Credentials
            </h3>
            <div className="space-y-3">
              {portfolio.education.map((edu: any, idx: number) => (
                <div key={idx} className="p-3 rounded-xl bg-gray-950 border border-gray-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">{edu.degree} in {edu.field}</span>
                    <span className="text-gray-400 font-mono text-xs">{edu.year}</span>
                  </div>
                  <p className="text-gray-300 text-xs">{edu.institution}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* MODAL 1: PROJECT BUILDER */}
      <Modal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        title={editingProject.id ? 'Edit Portfolio Project' : 'Project Builder — Add Case Study'}
      >
        <div className="space-y-4 text-xs max-h-[75vh] overflow-y-auto pr-1">
          <div>
            <label className="text-gray-300 font-semibold block mb-1">Project Title *</label>
            <input
              type="text"
              value={editingProject.title || ''}
              onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
              placeholder="e.g. Real-Time Telemetry & Analytics Dashboard"
              className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl p-2.5 font-bold focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="text-gray-300 font-semibold block mb-1">Role / Contribution *</label>
            <input
              type="text"
              value={editingProject.role || ''}
              onChange={(e) => setEditingProject({ ...editingProject, role: e.target.value })}
              placeholder="e.g. Lead Full Stack Architect & Analytics Engineer"
              className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl p-2.5 focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="text-gray-300 font-semibold block mb-1">Problem Statement *</label>
            <textarea
              rows={2}
              value={editingProject.problem || ''}
              onChange={(e) => setEditingProject({ ...editingProject, problem: e.target.value })}
              placeholder="What business or technical problem did this project address?"
              className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl p-2.5 focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="text-gray-300 font-semibold block mb-1">Process & Methodology *</label>
            <textarea
              rows={3}
              value={editingProject.process || ''}
              onChange={(e) => setEditingProject({ ...editingProject, process: e.target.value })}
              placeholder="Describe your design choices, engineering process, and architecture."
              className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl p-2.5 focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="text-gray-300 font-semibold block mb-1">Factual Outcome & Results (Zero Invented Data) *</label>
            <textarea
              rows={2}
              value={editingProject.outcome || ''}
              onChange={(e) => setEditingProject({ ...editingProject, outcome: e.target.value })}
              placeholder="State factual results and quantitative impact."
              className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl p-2.5 focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="text-gray-300 font-semibold block mb-1">Key Technical Learnings *</label>
            <textarea
              rows={2}
              value={editingProject.learnings || ''}
              onChange={(e) => setEditingProject({ ...editingProject, learnings: e.target.value })}
              placeholder="What key learnings or technical growth did you gain?"
              className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl p-2.5 focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="text-gray-300 font-semibold block mb-1">Technologies (Comma separated)</label>
            <input
              type="text"
              value={
                Array.isArray(editingProject.technologies)
                  ? editingProject.technologies.join(', ')
                  : (editingProject.technologies as any) || ''
              }
              onChange={(e) => setEditingProject({ ...editingProject, technologies: e.target.value as any })}
              placeholder="TypeScript, React, Node.js, PostgreSQL"
              className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl p-2.5 font-mono focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-gray-300 font-semibold block mb-1">Live Demo URL</label>
              <input
                type="url"
                value={editingProject.demoUrl || ''}
                onChange={(e) => setEditingProject({ ...editingProject, demoUrl: e.target.value })}
                placeholder="https://demo.laboria.ai/project"
                className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl p-2.5 focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="text-gray-300 font-semibold block mb-1">GitHub / Repo URL</label>
              <input
                type="url"
                value={editingProject.repoUrl || ''}
                onChange={(e) => setEditingProject({ ...editingProject, repoUrl: e.target.value })}
                placeholder="https://github.com/candidate/project"
                className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl p-2.5 focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-800">
            <Button variant="ghost" onClick={() => setIsProjectModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="accent" onClick={handleSaveProject}>
              Save Project
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL 2: SKILL EVIDENCE MAPPING */}
      <Modal
        isOpen={isEvidenceModalOpen}
        onClose={() => setIsEvidenceModalOpen(false)}
        title="Connect Skill to Evidence Source"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="text-gray-300 font-semibold block mb-1">Candidate Skill *</label>
            <select
              value={selectedSkillForEvidence}
              onChange={(e) => setSelectedSkillForEvidence(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl p-2.5 font-bold focus:ring-2 focus:ring-brand-500"
            >
              {portfolio.skills.map((s, idx) => (
                <option key={idx} value={s.name}>
                  {s.name} ({s.level})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-gray-300 font-semibold block mb-1">Evidence Source Type *</label>
            <select
              value={evidenceSourceType}
              onChange={(e) => setEvidenceSourceType(e.target.value as SkillEvidenceSourceType)}
              className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl p-2.5 focus:ring-2 focus:ring-brand-500"
            >
              <option value="Project">Project / Case Study</option>
              <option value="Experience">Work Experience</option>
              <option value="Certification">Industry Certification</option>
              <option value="Assessment">Technical Assessment</option>
              <option value="Course">Verified Course</option>
            </select>
          </div>

          <div>
            <label className="text-gray-300 font-semibold block mb-1">Evidence Title *</label>
            <input
              type="text"
              value={evidenceTitle}
              onChange={(e) => setEvidenceTitle(e.target.value)}
              placeholder="e.g. Telemetry Ingestion Pipeline Project"
              className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl p-2.5 font-bold focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="text-gray-300 font-semibold block mb-1">Evidence Description</label>
            <textarea
              rows={2}
              value={evidenceDescription}
              onChange={(e) => setEvidenceDescription(e.target.value)}
              placeholder="How was this skill demonstrated in this evidence source?"
              className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl p-2.5 focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-800">
            <Button variant="ghost" onClick={() => setIsEvidenceModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="accent" onClick={handleSaveEvidenceMapping}>
              Save Evidence Link
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL 3: AUTOMATED ENGINE TEST RESULTS */}
      <Modal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        title="Step 20: Skill & Project Portfolio Test Report"
      >
        {testReport && (
          <div className="space-y-4 text-xs max-h-[70vh] overflow-y-auto pr-1">
            <div className="p-3 rounded-xl bg-gray-950 border border-gray-800 flex items-center justify-between">
              <div>
                <span className="font-mono text-gray-400">Total Executed: {testReport.totalTests}</span>
                <div className="text-base font-bold text-white font-display mt-0.5">
                  {testReport.passCount} PASSED / {testReport.failCount} FAILED
                </div>
              </div>
              <Badge variant={testReport.passed ? 'success' : 'match-low'}>
                {testReport.passed ? 'ALL TESTS PASSED' : 'TESTS FAILED'}
              </Badge>
            </div>

            <div className="space-y-2">
              {testReport.details.map((t, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-gray-950 border border-gray-800 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">Test #{idx + 1}: {t.name}</span>
                    <Badge variant={t.status === 'PASS' ? 'success' : 'match-low'}>{t.status}</Badge>
                  </div>
                  <p className="text-gray-400 text-[11px]">{t.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
