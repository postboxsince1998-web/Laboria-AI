import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { CandidateProfile, JobOpening, ResumeAnalysisReport, ResumeVersion, JobTailoringAnalysis } from '../types';
import { seedJobs } from '../data/seedData';
import { AuthService } from '../services/authService';
import {
  analyzeResume,
  enhanceExperienceBullet,
  enhanceProjectDescription,
  generateSummaryOptions,
  getDefaultResumeVersion,
  importResumeFromText,
  SavedResumeVersionService,
  tailorResumeForJob
} from '../services/resumeBuilderService';
import { runResumeBuilderEngineTests, ResumeBuilderTestReport } from '../services/resumeBuilderEngineTests';
import {
  FileText,
  Sparkles,
  Award,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Copy,
  Printer,
  Upload,
  Sliders,
  ShieldCheck,
  Zap,
  Target,
  Edit3,
  Layers,
  ArrowRight,
  BookOpen,
  Building2,
  Calendar,
  Briefcase,
  HelpCircle,
  CheckSquare,
  FileCheck
} from 'lucide-react';

interface AIResumeBuilderProps {
  candidate: CandidateProfile;
}

export const AIResumeBuilder: React.FC<AIResumeBuilderProps> = ({ candidate }) => {
  // Tabs: 'versions' | 'editor' | 'import' | 'analyzer' | 'tailor' | 'preview'
  const [activeTab, setActiveTab] = useState<'versions' | 'editor' | 'import' | 'analyzer' | 'tailor' | 'preview'>('editor');

  // Resume Versions State
  const [versions, setVersions] = useState<ResumeVersion[]>([]);
  const [activeVersion, setActiveVersion] = useState<ResumeVersion>(getDefaultResumeVersion(candidate));

  // Import State
  const [importText, setImportText] = useState('');
  const [importName, setImportName] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  // Tailor State
  const [selectedJob, setSelectedJob] = useState<JobOpening>(seedJobs[0]);
  const [tailoringResult, setTailoringResult] = useState<JobTailoringAnalysis | null>(null);

  // Analyzer State
  const [analysisReport, setAnalysisReport] = useState<ResumeAnalysisReport | null>(null);

  // AI Summary Generator Modal
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [summaryOptions, setSummaryOptions] = useState<string[]>([]);

  // Diagnostics Modal State
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testReport, setTestReport] = useState<ResumeBuilderTestReport | null>(null);

  // Load versions on mount
  useEffect(() => {
    const loaded = SavedResumeVersionService.getVersions(candidate);
    setVersions(loaded);
    const def = loaded.find((v) => v.isDefault) || loaded[0];
    if (def) setActiveVersion(def);
  }, [candidate]);

  // Re-run analysis whenever active version changes
  useEffect(() => {
    if (activeVersion) {
      setAnalysisReport(analyzeResume(activeVersion));
      setTailoringResult(tailorResumeForJob(activeVersion, selectedJob));
    }
  }, [activeVersion, selectedJob]);

  // Handlers for Versions
  const handleSaveCurrentVersion = () => {
    const updated = SavedResumeVersionService.saveVersion(activeVersion, candidate);
    setVersions(updated);
    
    // Persist active version to user profile
    const updatedCandidate: CandidateProfile = {
      ...candidate,
      resumeFileName: activeVersion.versionName,
      headline: activeVersion.targetRole ? `${activeVersion.targetRole} | ${activeVersion.skills.map(s => s.name).slice(0, 3).join(', ')}` : candidate.headline,
      technicalSkills: activeVersion.skills.map(s => s.name),
      skills: activeVersion.skills
    };
    AuthService.saveProfile(updatedCandidate);
  };

  const handleSwitchVersion = (version: ResumeVersion) => {
    setActiveVersion(version);
  };

  const handleSetDefaultVersion = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = SavedResumeVersionService.setDefaultVersion(id, candidate);
    setVersions(updated);
    const def = updated.find((v) => v.id === id);
    if (def) setActiveVersion(def);
  };

  const handleDeleteVersion = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = SavedResumeVersionService.deleteVersion(id, candidate);
    setVersions(updated);
    if (activeVersion.id === id) {
      setActiveVersion(updated[0]);
    }
  };

  const handleCreateNewVersion = () => {
    const newVer: ResumeVersion = {
      ...activeVersion,
      id: `res_ver_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      versionName: `Tailored Version (${new Date().toLocaleDateString()})`,
      isDefault: false,
      lastUpdated: new Date().toISOString()
    };
    const updated = SavedResumeVersionService.saveVersion(newVer, candidate);
    setVersions(updated);
    setActiveVersion(newVer);
  };

  // Handlers for Import
  const handleImportSubmit = () => {
    if (!importText.trim()) return;
    setIsImporting(true);
    setTimeout(() => {
      const imported = importResumeFromText(importText, importName || 'Imported Resume', candidate);
      const updated = SavedResumeVersionService.saveVersion(imported, candidate);
      setVersions(updated);
      setActiveVersion(imported);
      
      const updatedCandidate: CandidateProfile = {
        ...candidate,
        resumeText: importText,
        resumeFileName: importName || 'Imported_Resume.pdf',
        technicalSkills: imported.skills.map(s => s.name),
        skills: imported.skills
      };
      AuthService.saveProfile(updatedCandidate);

      setIsImporting(false);
      setImportText('');
      setImportName('');
      setActiveTab('editor');
    }, 600);
  };

  const handleImportFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = (event.target?.result as string) || '';
      setImportText(text || `Uploaded Document: ${file.name}`);
    };
    reader.readAsText(file);
  };

  // Handlers for AI Summary Generator
  const handleOpenSummaryGenerator = () => {
    const options = generateSummaryOptions(activeVersion, activeVersion.targetRole);
    setSummaryOptions(options);
    setIsSummaryModalOpen(true);
  };

  const handleApplySummaryOption = (summaryText: string) => {
    setActiveVersion({ ...activeVersion, summary: summaryText });
    setIsSummaryModalOpen(false);
  };

  // Handlers for Wording Enhancements
  const handleEnhanceBullet = (expIndex: number, bulletIndex: number) => {
    const exp = activeVersion.experience[expIndex];
    const orig = exp.bulletPoints[bulletIndex];
    const enhanced = enhanceExperienceBullet(orig, exp.role, exp.skillsUsed);
    const updatedBullets = [...exp.bulletPoints];
    updatedBullets[bulletIndex] = enhanced;
    const updatedExp = [...activeVersion.experience];
    updatedExp[expIndex] = { ...exp, bulletPoints: updatedBullets };
    setActiveVersion({ ...activeVersion, experience: updatedExp });
  };

  const handleEnhanceProject = (projIndex: number) => {
    const proj = activeVersion.projects[projIndex];
    const enhanced = enhanceProjectDescription(proj.description, proj.techStack);
    const updatedProj = [...activeVersion.projects];
    updatedProj[projIndex] = { ...proj, description: enhanced };
    setActiveVersion({ ...activeVersion, projects: updatedProj });
  };

  // Print PDF Trigger
  const handlePrintPDF = () => {
    window.print();
  };

  // Diagnostics Suite
  const handleRunDiagnostics = () => {
    const report = runResumeBuilderEngineTests();
    setTestReport(report);
    setIsTestModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-brand-500/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-2">
              <FileText className="w-3.5 h-3.5" /> Step 17: AI Resume Builder & Job Tailoring
            </div>
            <h1 className="text-2xl font-bold text-white font-display">
              AI Resume Builder & Tailoring Engine
            </h1>
            <p className="text-gray-300 text-sm mt-1">
              Create, import, analyze, tailor & export ATS-friendly resumes. <strong className="text-brand-300">Factual truth preserved — Zero unearned claims.</strong>
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRunDiagnostics}
              icon={<ShieldCheck className="w-4 h-4 text-emerald-400" />}
            >
              Run 12-Point Tests
            </Button>
            <Button
              variant="accent"
              size="sm"
              onClick={handleSaveCurrentVersion}
              icon={<Sparkles className="w-4 h-4" />}
            >
              Save Version Changes
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handlePrintPDF}
              icon={<Printer className="w-4 h-4" />}
            >
              Export PDF / Print
            </Button>
          </div>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-3 gap-2 overflow-x-auto">
        <div className="flex items-center gap-1.5 flex-nowrap">
          {[
            { id: 'versions', label: `📂 Versions (${versions.length})` },
            { id: 'editor', label: '✍️ Resume Editor' },
            { id: 'import', label: '📥 Import Resume' },
            { id: 'analyzer', label: `📊 ATS Quality Analyzer (${analysisReport?.atsCompatibilityScore || 0}%)` },
            { id: 'tailor', label: '🎯 Job-Specific Tailor' },
            { id: 'preview', label: '📄 Printable PDF Preview' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                activeTab === tab.id
                  ? 'bg-brand-600 text-white shadow-glow-sm'
                  : 'bg-gray-900 text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: MY RESUME VERSIONS */}
      {activeTab === 'versions' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-gray-900/90 border border-gray-800 flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                <Layers className="w-4 h-4 text-brand-400" /> Multiple Resume Versions Manager
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Maintain specialized resume versions for different target career paths.
              </p>
            </div>
            <Button size="sm" variant="accent" onClick={handleCreateNewVersion} icon={<Plus className="w-3.5 h-3.5" />}>
              Create New Version
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {versions.map((ver) => {
              const isCurrent = ver.id === activeVersion.id;
              return (
                <Card
                  key={ver.id}
                  glow={isCurrent}
                  className={`cursor-pointer transition ${isCurrent ? 'border-brand-500' : 'hover:border-gray-700'}`}
                  onClick={() => handleSwitchVersion(ver)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-base font-display">{ver.versionName}</h4>
                        {ver.isDefault && <Badge variant="success">Default</Badge>}
                        {isCurrent && <Badge variant="purple">Active Editing</Badge>}
                      </div>
                      <p className="text-xs text-brand-300 font-semibold mt-1">
                        Target Role: {ver.targetRole || 'General'}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {ver.experience.length} experiences • {ver.skills.length} skills • {ver.projects.length} projects
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {!ver.isDefault && (
                        <button
                          onClick={(e) => handleSetDefaultVersion(ver.id, e)}
                          className="px-2.5 py-1 rounded-lg bg-gray-900 text-gray-400 hover:text-emerald-400 border border-gray-800 text-[11px] font-semibold transition"
                        >
                          Make Default
                        </button>
                      )}
                      {versions.length > 1 && (
                        <button
                          onClick={(e) => handleDeleteVersion(ver.id, e)}
                          className="p-1.5 rounded-lg bg-gray-900 text-gray-400 hover:text-rose-400 border border-gray-800 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-800 flex items-center justify-between text-xs text-gray-400">
                    <span>Updated {new Date(ver.lastUpdated).toLocaleDateString()}</span>
                    <Button size="sm" variant={isCurrent ? 'accent' : 'outline'} onClick={() => { handleSwitchVersion(ver); setActiveTab('editor'); }}>
                      {isCurrent ? 'Edit Active Version' : 'Switch & Edit'}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: RESUME EDITOR */}
      {activeTab === 'editor' && (
        <div className="space-y-6">
          {/* Version Header Indicator */}
          <div className="p-3 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-between">
            <span className="text-xs text-gray-300 font-semibold">
              Editing Version: <strong className="text-brand-300">{activeVersion.versionName}</strong> ({activeVersion.targetRole})
            </span>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={handleSaveCurrentVersion} icon={<Sparkles className="w-3.5 h-3.5 text-emerald-400" />}>
                Save Changes
              </Button>
            </div>
          </div>

          {/* Section 1: Contact Info */}
          <Card>
            <h3 className="text-base font-bold text-white font-display mb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-brand-400" /> 1. Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="text-gray-400 font-semibold block mb-1">Full Name</label>
                <input
                  type="text"
                  value={activeVersion.contactInfo.fullName}
                  onChange={(e) => setActiveVersion({ ...activeVersion, contactInfo: { ...activeVersion.contactInfo, fullName: e.target.value } })}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2 text-white"
                />
              </div>
              <div>
                <label className="text-gray-400 font-semibold block mb-1">Email</label>
                <input
                  type="text"
                  value={activeVersion.contactInfo.email}
                  onChange={(e) => setActiveVersion({ ...activeVersion, contactInfo: { ...activeVersion.contactInfo, email: e.target.value } })}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2 text-white"
                />
              </div>
              <div>
                <label className="text-gray-400 font-semibold block mb-1">Phone</label>
                <input
                  type="text"
                  value={activeVersion.contactInfo.phone}
                  onChange={(e) => setActiveVersion({ ...activeVersion, contactInfo: { ...activeVersion.contactInfo, phone: e.target.value } })}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2 text-white"
                />
              </div>
              <div>
                <label className="text-gray-400 font-semibold block mb-1">Location</label>
                <input
                  type="text"
                  value={activeVersion.contactInfo.location}
                  onChange={(e) => setActiveVersion({ ...activeVersion, contactInfo: { ...activeVersion.contactInfo, location: e.target.value } })}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2 text-white"
                />
              </div>
              <div>
                <label className="text-gray-400 font-semibold block mb-1">LinkedIn Profile URL</label>
                <input
                  type="text"
                  value={activeVersion.contactInfo.linkedin || ''}
                  onChange={(e) => setActiveVersion({ ...activeVersion, contactInfo: { ...activeVersion.contactInfo, linkedin: e.target.value } })}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2 text-white"
                />
              </div>
              <div>
                <label className="text-gray-400 font-semibold block mb-1">GitHub / Portfolio</label>
                <input
                  type="text"
                  value={activeVersion.contactInfo.github || ''}
                  onChange={(e) => setActiveVersion({ ...activeVersion, contactInfo: { ...activeVersion.contactInfo, github: e.target.value } })}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2 text-white"
                />
              </div>
            </div>
          </Card>

          {/* Section 2: Professional Summary */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-brand-400" /> 2. Professional Summary
              </h3>
              <Button size="sm" variant="accent" onClick={handleOpenSummaryGenerator} icon={<Zap className="w-3.5 h-3.5" />}>
                AI Summary Generator
              </Button>
            </div>
            <textarea
              rows={4}
              value={activeVersion.summary}
              onChange={(e) => setActiveVersion({ ...activeVersion, summary: e.target.value })}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-white placeholder-gray-500"
              placeholder="Write a concise 2-3 sentence overview highlighting your career accomplishments and core skills..."
            />
          </Card>

          {/* Section 3: Work Experience */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-brand-400" /> 3. Work Experience ({activeVersion.experience.length})
              </h3>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const newExp = {
                    id: `exp_${Date.now()}`,
                    company: 'Company Name',
                    role: 'Software Role',
                    startDate: '2023-01',
                    endDate: 'Present',
                    description: 'Role overview...',
                    bulletPoints: ['Engineered scalable components improving operational throughput.'],
                    skillsUsed: ['TypeScript', 'React']
                  };
                  setActiveVersion({ ...activeVersion, experience: [...activeVersion.experience, newExp] });
                }}
                icon={<Plus className="w-3.5 h-3.5" />}
              >
                Add Experience
              </Button>
            </div>

            <div className="space-y-4 text-xs">
              {activeVersion.experience.map((exp, expIdx) => (
                <div key={exp.id} className="p-4 rounded-xl bg-gray-950 border border-gray-800 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    <input
                      type="text"
                      value={exp.role}
                      onChange={(e) => {
                        const updated = [...activeVersion.experience];
                        updated[expIdx].role = e.target.value;
                        setActiveVersion({ ...activeVersion, experience: updated });
                      }}
                      placeholder="Role Title"
                      className="bg-gray-900 border border-gray-800 rounded-lg p-2 text-white font-bold"
                    />
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => {
                        const updated = [...activeVersion.experience];
                        updated[expIdx].company = e.target.value;
                        setActiveVersion({ ...activeVersion, experience: updated });
                      }}
                      placeholder="Company Name"
                      className="bg-gray-900 border border-gray-800 rounded-lg p-2 text-white font-semibold"
                    />
                    <input
                      type="text"
                      value={exp.startDate}
                      onChange={(e) => {
                        const updated = [...activeVersion.experience];
                        updated[expIdx].startDate = e.target.value;
                        setActiveVersion({ ...activeVersion, experience: updated });
                      }}
                      placeholder="Start Date"
                      className="bg-gray-900 border border-gray-800 rounded-lg p-2 text-white"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={exp.endDate}
                        onChange={(e) => {
                          const updated = [...activeVersion.experience];
                          updated[expIdx].endDate = e.target.value;
                          setActiveVersion({ ...activeVersion, experience: updated });
                        }}
                        placeholder="End Date"
                        className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-white"
                      />
                      <button
                        onClick={() => {
                          const updated = activeVersion.experience.filter((_, i) => i !== expIdx);
                          setActiveVersion({ ...activeVersion, experience: updated });
                        }}
                        className="p-2 text-rose-400 hover:text-rose-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Bullet Points */}
                  <div className="space-y-2 pt-2 border-t border-gray-800">
                    <span className="font-semibold text-gray-400 block">Achievement Bullet Points:</span>
                    {exp.bulletPoints.map((bullet, bIdx) => (
                      <div key={bIdx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={bullet}
                          onChange={(e) => {
                            const updatedExp = [...activeVersion.experience];
                            updatedExp[expIdx].bulletPoints[bIdx] = e.target.value;
                            setActiveVersion({ ...activeVersion, experience: updatedExp });
                          }}
                          className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-white"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEnhanceBullet(expIdx, bIdx)}
                          icon={<Zap className="w-3 h-3 text-emerald-400" />}
                          title="Enhance wording with strong action verb"
                        >
                          Enhance
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Section 4: Projects */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-brand-400" /> 4. Projects ({activeVersion.projects.length})
              </h3>
            </div>
            <div className="space-y-4 text-xs">
              {activeVersion.projects.map((proj, pIdx) => (
                <div key={proj.id} className="p-4 rounded-xl bg-gray-950 border border-gray-800 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={proj.title}
                      onChange={(e) => {
                        const updated = [...activeVersion.projects];
                        updated[pIdx].title = e.target.value;
                        setActiveVersion({ ...activeVersion, projects: updated });
                      }}
                      className="w-1/2 bg-gray-900 border border-gray-800 rounded-lg p-2 text-white font-bold"
                    />
                    <Button
                      size="sm"
                      variant="accent"
                      onClick={() => handleEnhanceProject(pIdx)}
                      icon={<Zap className="w-3 h-3" />}
                    >
                      Enhance Description
                    </Button>
                  </div>
                  <textarea
                    rows={2}
                    value={proj.description}
                    onChange={(e) => {
                      const updated = [...activeVersion.projects];
                      updated[pIdx].description = e.target.value;
                      setActiveVersion({ ...activeVersion, projects: updated });
                    }}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-white"
                  />
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: IMPORT RESUME */}
      {activeTab === 'import' && (
        <Card>
          <div className="space-y-4 text-xs">
            <div>
              <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                <Upload className="w-4 h-4 text-brand-400" /> Import Existing Resume Text or Document
              </h3>
              <p className="text-gray-400 mt-1">
                Paste your resume text below to parse skills, experience, and education into a new structured version.
              </p>
            </div>

            <div className="p-4 border-2 border-dashed border-gray-800 hover:border-brand-500/50 rounded-xl bg-gray-950/60 text-center space-y-2">
              <Upload className="w-8 h-8 text-brand-400 mx-auto" />
              <p className="font-semibold text-white">Upload Resume File from Computer</p>
              <p className="text-[11px] text-gray-400">Supports PDF, DOC, DOCX, TXT documents</p>
              <label className="inline-block cursor-pointer">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleImportFileUpload}
                  className="hidden"
                />
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition shadow-glow-sm">
                  Select Resume Document
                </span>
              </label>
            </div>

            <div>
              <label className="text-gray-300 font-semibold block mb-1">New Version Name</label>
              <input
                type="text"
                value={importName}
                onChange={(e) => setImportName(e.target.value)}
                placeholder="e.g. Imported Senior Developer Resume"
                className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-white font-semibold"
              />
            </div>

            <div>
              <label className="text-gray-300 font-semibold block mb-1">Resume Raw Content / Text</label>
              <textarea
                rows={10}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="Paste full text from your resume document..."
                className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-white font-mono"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                variant="accent"
                onClick={handleImportSubmit}
                disabled={isImporting || !importText.trim()}
                icon={<Upload className="w-4 h-4" />}
              >
                {isImporting ? 'Parsing & Creating Version...' : 'Parse & Create Resume Version'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* TAB 4: RESUME ANALYZER & ATS CHECKER */}
      {activeTab === 'analyzer' && analysisReport && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card glow className="text-center py-6">
              <span className="text-xs text-gray-400 uppercase tracking-wider font-mono font-semibold">Overall Quality Score</span>
              <div className="text-4xl font-extrabold text-brand-300 font-display mt-2">
                {analysisReport.overallScore}%
              </div>
              <Badge variant="match-high" className="mt-2">Good Structural Quality</Badge>
            </Card>

            <Card glow className="text-center py-6">
              <span className="text-xs text-gray-400 uppercase tracking-wider font-mono font-semibold">Structural ATS Compatibility</span>
              <div className="text-4xl font-extrabold text-emerald-400 font-display mt-2">
                {analysisReport.atsCompatibilityScore}%
              </div>
              <p className="text-[11px] text-gray-400 mt-2">Heuristic parser structural compatibility</p>
            </Card>

            <Card className="p-4 flex flex-col justify-center space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Action Verbs Found:</span>
                <span className="font-bold text-brand-300">{analysisReport.actionVerbCount} verbs</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Quantifiable Metrics:</span>
                <span className="font-bold text-emerald-400">{analysisReport.metricCount} metrics</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Verified Skills Count:</span>
                <span className="font-bold text-purple-400">{activeVersion.skills.length} skills</span>
              </div>
            </Card>
          </div>

          {/* Section Breakdown Scores */}
          <Card>
            <h3 className="text-base font-bold text-white font-display mb-3">Section Quality Breakdown</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
              {Object.entries(analysisReport.sectionScores).map(([key, val]) => (
                <div key={key} className="p-3 rounded-xl bg-gray-950 border border-gray-800 text-center">
                  <span className="text-gray-400 capitalize block font-semibold">{key}</span>
                  <span className="text-xl font-bold text-white mt-1 block">{val}%</span>
                </div>
              ))}
            </div>
          </Card>

          {/* ATS Formatting Checklist */}
          <Card>
            <h3 className="text-base font-bold text-white font-display mb-3 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-400" /> ATS Structural Formatting Checklist
            </h3>
            <div className="space-y-2 text-xs">
              {analysisReport.formattingChecklist.map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-gray-950 border border-gray-800 flex items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-white block">{item.checkName}</span>
                    <span className="text-gray-400 text-[11px]">{item.tip}</span>
                  </div>
                  <Badge variant={item.passed ? 'success' : 'match-low'}>
                    {item.passed ? 'PASSED' : 'RECOMMENDED'}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 5: JOB-SPECIFIC TAILOR */}
      {activeTab === 'tailor' && tailoringResult && (
        <div className="space-y-6">
          <Card>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
              <div>
                <span className="text-gray-400 font-semibold block">Select Target Opportunity to Tailor Against:</span>
                <select
                  value={selectedJob.id}
                  onChange={(e) => {
                    const found = seedJobs.find((j) => j.id === e.target.value);
                    if (found) setSelectedJob(found);
                  }}
                  className="mt-1 bg-gray-950 border border-gray-800 text-white rounded-xl p-2.5 font-bold text-xs focus:ring-1 focus:ring-brand-500"
                >
                  {seedJobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title} — {j.company} ({j.location})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-4 bg-gray-900 border border-gray-800 p-3 rounded-xl">
                <div className="text-center">
                  <span className="text-[10px] text-gray-400 uppercase font-mono">Job Tailoring Fit</span>
                  <div className="text-2xl font-extrabold text-brand-300 font-display">
                    {tailoringResult.matchScore}%
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Missing Keywords & Keyword Suggestions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <Card>
              <h4 className="font-bold text-rose-400 text-sm mb-2 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" /> Missing Target Keywords ({tailoringResult.missingKeywords.length})
              </h4>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tailoringResult.missingKeywords.length > 0 ? (
                  tailoringResult.missingKeywords.map((kw) => (
                    <Badge key={kw} variant="match-low">+{kw}</Badge>
                  ))
                ) : (
                  <span className="text-gray-400 italic">Zero missing keywords detected for this job!</span>
                )}
              </div>
            </Card>

            <Card>
              <h4 className="font-bold text-emerald-400 text-sm mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Strong Section Alignments ({tailoringResult.strongSections.length})
              </h4>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tailoringResult.strongSections.map((sec) => (
                  <Badge key={sec} variant="success">✓ {sec}</Badge>
                ))}
              </div>
            </Card>
          </div>

          {/* Tailored Summary Options */}
          <Card>
            <h3 className="text-base font-bold text-white font-display mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-400" /> Tailored Professional Summary Options (Truth-Preserved)
            </h3>
            <div className="space-y-3 text-xs">
              {tailoringResult.tailoredSummarySuggestions.map((opt, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-gray-950 border border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <p className="text-gray-300 font-medium">{opt}</p>
                  <Button size="sm" variant="accent" onClick={() => handleApplySummaryOption(opt)} icon={<CheckCircle2 className="w-3.5 h-3.5" />}>
                    Apply Option #{idx + 1}
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 6: PREVIEW & PDF EXPORT */}
      {activeTab === 'preview' && (
        <Card className="bg-white text-gray-900 p-8 rounded-2xl font-sans space-y-6 shadow-2xl max-w-4xl mx-auto printable-resume">
          {/* Header */}
          <div className="border-b border-gray-300 pb-4">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{activeVersion.contactInfo.fullName}</h1>
            <p className="text-sm text-gray-600 font-semibold mt-1">
              {activeVersion.contactInfo.email} • {activeVersion.contactInfo.phone} • {activeVersion.contactInfo.location}
            </p>
            {activeVersion.contactInfo.linkedin && (
              <p className="text-xs text-blue-700 font-mono mt-0.5">{activeVersion.contactInfo.linkedin}</p>
            )}
          </div>

          {/* Summary */}
          <div>
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-gray-200 pb-1 mb-2">Professional Summary</h2>
            <p className="text-xs text-gray-800 leading-relaxed">{activeVersion.summary}</p>
          </div>

          {/* Experience */}
          <div>
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-gray-200 pb-1 mb-2">Work Experience</h2>
            <div className="space-y-3">
              {activeVersion.experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="font-bold text-gray-900">{exp.role} — <span className="font-semibold text-gray-700">{exp.company}</span></span>
                    <span className="text-gray-500 font-mono text-[11px]">{exp.startDate} – {exp.endDate}</span>
                  </div>
                  <ul className="list-disc list-inside text-xs text-gray-700 space-y-1 mt-1 pl-1">
                    {exp.bulletPoints.map((b, idx) => (
                      <li key={idx}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div>
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-gray-200 pb-1 mb-2">Technical Skills</h2>
            <p className="text-xs text-gray-800 font-medium">
              {activeVersion.skills.map((s) => s.name).join(' • ')}
            </p>
          </div>

          {/* Education */}
          <div>
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-gray-200 pb-1 mb-2">Education</h2>
            {activeVersion.education.map((edu) => (
              <div key={edu.id} className="flex justify-between items-baseline text-xs">
                <span className="font-bold text-gray-900">{edu.degree} in {edu.field} — <span className="font-semibold text-gray-700">{edu.institution}</span></span>
                <span className="text-gray-500 font-mono text-[11px]">{edu.year}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* AI Summary Generator Modal */}
      <Modal
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        title="AI Professional Summary Options Generator"
      >
        <div className="space-y-4 text-xs">
          <p className="text-gray-300">
            Select a generated summary option based on your candidate profile skills and experience:
          </p>

          <div className="space-y-3">
            {summaryOptions.map((opt, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-gray-900 border border-gray-800 space-y-2">
                <p className="text-white font-medium">{opt}</p>
                <Button size="sm" variant="accent" onClick={() => handleApplySummaryOption(opt)}>
                  Use Option #{idx + 1}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* Automated Diagnostic Test Suite Modal */}
      <Modal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        title="Laboria AI - 12-Point AI Resume Builder Test Suite"
      >
        <div className="space-y-4 text-xs">
          {testReport && (
            <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-semibold flex items-center justify-between">
              <span>Step 17 AI Resume Builder Suite: {testReport.passCount}/{testReport.totalTests} Passed</span>
              <Badge variant={testReport.passed ? 'success' : 'match-low'}>
                {testReport.passed ? 'ALL PASSED' : 'FAILED'}
              </Badge>
            </div>
          )}

          <div className="space-y-2">
            {testReport?.details.map((tr, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-gray-900/80 border border-gray-800 flex items-center justify-between gap-3"
              >
                <div>
                  <p className="font-bold text-white">Test #{idx + 1}: {tr.name}</p>
                  <p className="text-gray-400 text-[11px] mt-0.5">{tr.message}</p>
                </div>
                <Badge variant={tr.status === 'PASS' ? 'success' : 'match-low'}>
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
