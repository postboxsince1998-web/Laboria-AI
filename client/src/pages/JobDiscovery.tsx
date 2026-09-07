import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { AdvancedSearchFilters, CandidateProfile, SavedSearchQuery, SearchSortOption } from '../types';
import { seedJobs } from '../data/seedData';
import {
  LocationService,
  CandidateLocationPreferences,
  normalizeCityName
} from '../services/locationService';
import { evaluateDeterministicMatch } from '../services/resumeOpportunityEngine';
import { ResumeParserService } from '../services/resumeParser';
import { DuplicateDetectionService } from '../services/jobDataProvider';
import { runLocationEngineTests, LocationTestResult } from '../services/locationDiscoveryEngineTests';
import {
  executeAdvancedSearch,
  generateFilterExplanations,
  getDefaultAdvancedFilters,
  SavedSearchService,
  createJobWatchRuleFromSavedSearch
} from '../services/advancedSearchService';
import { runAdvancedSearchEngineTests, AdvancedSearchTestReport } from '../services/advancedSearchEngineTests';
import { InteractiveJobMap } from '../components/location/InteractiveJobMap';
import {
  Compass,
  MapPin,
  Search,
  Filter,
  SlidersHorizontal,
  Bookmark,
  Zap,
  ShieldCheck,
  Map as MapIcon,
  List,
  ArrowUpDown,
  Calendar,
  Building2,
  Briefcase,
  HelpCircle,
  Save,
  Bell,
  BellOff,
  Trash2,
  Sparkles,
  DollarSign,
  Award,
  Clock,
  RotateCcw,
  CheckCircle2,
  Layers
} from 'lucide-react';

interface JobDiscoveryProps {
  candidate: CandidateProfile;
}

export const JobDiscovery: React.FC<JobDiscoveryProps> = ({ candidate }) => {
  const navigate = useNavigate();

  // View Mode State: List View vs Map View
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [activeTab, setActiveTab] = useState<'all' | 'recommended' | 'nearby' | 'remote' | 'saved' | 'saved_searches'>('all');

  // Search Query & Advanced Multi-Criteria Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<AdvancedSearchFilters>(getDefaultAdvancedFilters());
  const [sortBy, setSortBy] = useState<SearchSortOption>('bestMatch');

  // Multi-select Skill Input helper
  const [skillInput, setSkillInput] = useState('');

  // Saved Searches State
  const [savedSearches, setSavedSearches] = useState<SavedSearchQuery[]>([]);
  const [saveSearchModalOpen, setSaveSearchModalOpen] = useState(false);
  const [newSavedSearchName, setNewSavedSearchName] = useState('');
  const [newSavedSearchNotify, setNewSavedSearchNotify] = useState(true);

  // Saved Jobs State & Active Map Selected Job State
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  // UI Drawer / Modal States
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [isExplanationModalOpen, setIsExplanationModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testResults, setTestResults] = useState<LocationTestResult[]>([]);
  const [advTestReport, setAdvTestReport] = useState<AdvancedSearchTestReport | null>(null);

  // Candidate Location Preferences
  const [prefs, setPrefs] = useState<CandidateLocationPreferences>({
    currentLocation: {
      city: candidate.currentLocation?.city || 'Bengaluru',
      state: candidate.currentLocation?.state || 'Karnataka',
      country: candidate.currentLocation?.country || 'India',
      latitude: candidate.currentLocation?.latitude || 12.9716,
      longitude: candidate.currentLocation?.longitude || 77.5946
    },
    preferredLocations: candidate.preferredLocations || [],
    preferredRadiusKm: filters.maxRadiusKm || 50,
    willingToRelocate: true,
    remotePreference: true,
    hybridPreference: true,
    officePreference: true
  });

  // Load Saved Searches on Mount
  useEffect(() => {
    setSavedSearches(SavedSearchService.getSavedSearches());
  }, []);

  // Update preferences when maxRadiusKm changes
  useEffect(() => {
    if (filters.maxRadiusKm > 0) {
      setPrefs((prev) => ({ ...prev, preferredRadiusKm: filters.maxRadiusKm }));
    }
  }, [filters.maxRadiusKm]);

  // Compute Matched & Normalized Jobs from Provider
  const rawJobsList = DuplicateDetectionService.deduplicateJobs(seedJobs).filter(
    (j) => j.status !== 'Expired'
  );

  // Convert seed jobs into standard JobOpening objects for Advanced Search Engine
  const parsedCandidate = ResumeParserService.parseResumeText(candidate.resumeText);

  // Execute Advanced Search Engine with Profile/JD Primacy (60% Profile match weighting)
  const advancedResults = executeAdvancedSearch(candidate, rawJobsList as any[], searchQuery, filters, sortBy);

  // Apply tab filters if applicable
  const tabFilteredResults = advancedResults.filter((m) => {
    if (activeTab === 'recommended') {
      return m.overallMatchScore >= 75;
    }
    if (activeTab === 'nearby') {
      return m.job.workType === 'Remote' || (m.distanceKm > 0 && m.distanceKm <= (filters.maxRadiusKm || 50));
    }
    if (activeTab === 'remote') {
      return m.job.workType === 'Remote';
    }
    if (activeTab === 'saved') {
      return savedJobIds.includes(m.job.id);
    }
    return true;
  });

  // Filter explanations generated dynamically
  const filterExplanations = generateFilterExplanations(
    filters,
    searchQuery,
    rawJobsList.length,
    tabFilteredResults.length
  );

  // Handlers for Filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setFilters(getDefaultAdvancedFilters());
    setSortBy('bestMatch');
  };

  const handleAddSkillFilter = (skill: string) => {
    if (!skill.trim()) return;
    const clean = skill.trim();
    if (!filters.skills.includes(clean)) {
      setFilters({ ...filters, skills: [...filters.skills, clean] });
    }
    setSkillInput('');
  };

  const handleRemoveSkillFilter = (skill: string) => {
    setFilters({ ...filters, skills: filters.skills.filter((s) => s !== skill) });
  };

  const handleToggleWorkMode = (mode: string) => {
    const exists = filters.workModes.includes(mode);
    const updated = exists
      ? filters.workModes.filter((m) => m !== mode)
      : [...filters.workModes, mode];
    setFilters({ ...filters, workModes: updated });
  };

  const handleToggleEmploymentType = (type: string) => {
    const exists = filters.employmentTypes.includes(type);
    const updated = exists
      ? filters.employmentTypes.filter((t) => t !== type)
      : [...filters.employmentTypes, type];
    setFilters({ ...filters, employmentTypes: updated });
  };

  // Handlers for Saved Searches
  const handleSaveSearchSubmit = () => {
    if (!newSavedSearchName.trim()) return;
    const created = SavedSearchService.saveSearchQuery({
      name: newSavedSearchName.trim(),
      searchQuery,
      filters,
      sortBy,
      notifyJobWatch: newSavedSearchNotify,
      matchCountAtSave: tabFilteredResults.length,
    });
    setSavedSearches(SavedSearchService.getSavedSearches());
    setSaveSearchModalOpen(false);
    setNewSavedSearchName('');
  };

  const handleApplySavedSearch = (saved: SavedSearchQuery) => {
    setSearchQuery(saved.searchQuery || '');
    setFilters(saved.filters);
    setSortBy(saved.sortBy);
  };

  const handleDeleteSavedSearch = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    SavedSearchService.deleteSavedSearch(id);
    setSavedSearches(SavedSearchService.getSavedSearches());
  };

  const handleToggleJobWatchSavedSearch = (id: string, currentVal: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    SavedSearchService.toggleSavedSearchJobWatch(id, !currentVal);
    setSavedSearches(SavedSearchService.getSavedSearches());
  };

  // Toggle Save Job
  const handleToggleSaveJob = (jobId: string) => {
    if (savedJobIds.includes(jobId)) {
      setSavedJobIds(savedJobIds.filter((id) => id !== jobId));
    } else {
      setSavedJobIds([...savedJobIds, jobId]);
    }
  };

  // Diagnostics Suite
  const handleRunDiagnostics = () => {
    const locResults = runLocationEngineTests();
    const advReport = runAdvancedSearchEngineTests();
    setTestResults(locResults);
    setAdvTestReport(advReport);
    setIsTestModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-brand-500/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30 mb-2">
              <Compass className="w-3.5 h-3.5" /> Step 16: Advanced Job Search Engine
            </div>
            <h1 className="text-2xl font-bold text-white font-display">
              Advanced Job Discovery & Search
            </h1>
            <p className="text-gray-300 text-sm mt-1">
              Multi-parameter search, custom filters & saved searches. Primary ranking: <strong className="text-brand-300">PROFILE/JD MATCH (60%)</strong> &gt; Location (20%).
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
              onClick={() => setIsSettingsOpen(true)}
              icon={<SlidersHorizontal className="w-4 h-4" />}
            >
              Location Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Main Search & Filter Control Bar */}
      <div className="p-4 rounded-xl bg-gray-900/90 border border-gray-800 space-y-4">
        {/* Row 1: Search Input Bar + Filter Toggle + Saved Search Button */}
        <div className="flex flex-col md:flex-row items-center gap-3 justify-between">
          <div className="relative w-full md:w-2/5">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by job title, skill, company, or keywords..."
              className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:ring-2 focus:ring-brand-500 font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end flex-wrap">
            <Button
              variant={isFilterPanelOpen ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
              icon={<Filter className="w-3.5 h-3.5" />}
            >
              Advanced Filters {filters.minMatchScore > 0 || filters.skills.length > 0 || filters.workModes.length > 0 ? '(Active)' : ''}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExplanationModalOpen(true)}
              icon={<HelpCircle className="w-3.5 h-3.5 text-brand-400" />}
            >
              Filter Explanations
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setSaveSearchModalOpen(true)}
              icon={<Save className="w-3.5 h-3.5 text-emerald-400" />}
            >
              Save Search
            </Button>
          </div>
        </div>

        {/* Row 2: Secondary Quick Filter Chips & Sort Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-2 border-t border-gray-800 text-xs">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Minimum Profile Match % Quick Pill */}
            <div className="flex items-center gap-1.5 bg-gray-950 px-3 py-1.5 rounded-lg border border-gray-800">
              <Award className="w-3.5 h-3.5 text-brand-400" />
              <span className="text-gray-400 font-semibold">Min Profile Match:</span>
              <select
                value={filters.minMatchScore}
                onChange={(e) => setFilters({ ...filters, minMatchScore: Number(e.target.value) })}
                className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
              >
                <option value={0} className="bg-gray-900">Any Match %</option>
                <option value={60} className="bg-gray-900">&ge; 60% Match</option>
                <option value={70} className="bg-gray-900">&ge; 70% Match</option>
                <option value={80} className="bg-gray-900">&ge; 80% Match (High)</option>
                <option value={90} className="bg-gray-900">&ge; 90% Match (Top)</option>
              </select>
            </div>

            {/* Work Mode Quick Pills */}
            <div className="flex items-center gap-1">
              {['Remote', 'Hybrid', 'Onsite'].map((wm) => {
                const isActive = filters.workModes.includes(wm);
                return (
                  <button
                    key={wm}
                    onClick={() => handleToggleWorkMode(wm)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                      isActive
                        ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/50'
                        : 'bg-gray-950 text-gray-400 border-gray-800 hover:text-white'
                    }`}
                  >
                    {wm}
                  </button>
                );
              })}
            </div>

            {/* Clear All Filters Button */}
            {(filters.minMatchScore > 0 ||
              filters.skills.length > 0 ||
              filters.workModes.length > 0 ||
              filters.locationQuery ||
              filters.company ||
              filters.maxRadiusKm > 0 ||
              searchQuery) && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1 text-rose-400 hover:text-rose-300 font-semibold text-xs transition"
              >
                <RotateCcw className="w-3 h-3" /> Reset Filters
              </button>
            )}
          </div>

          {/* Sort Dropdown & List / Map Toggle */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-1.5">
              <span className="text-gray-400 font-semibold flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SearchSortOption)}
                className="bg-gray-950 border border-gray-800 text-white rounded-lg text-xs p-2 font-semibold focus:ring-1 focus:ring-brand-500"
              >
                <option value="bestMatch">Best Match (Profile Primacy 60%)</option>
                <option value="scoreDesc">Highest Profile Match %</option>
                <option value="distanceAsc">Nearest Distance (km)</option>
                <option value="dateDesc">Newest Postings</option>
                <option value="salaryDesc">Highest Salary</option>
              </select>
            </div>

            {/* Map / List View Toggle */}
            <div className="flex items-center bg-gray-950 p-1 rounded-xl border border-gray-800 text-xs">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1.5 ${
                  viewMode === 'list'
                    ? 'bg-brand-600 text-white shadow-glow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <List className="w-3.5 h-3.5" /> LIST
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1.5 ${
                  viewMode === 'map'
                    ? 'bg-emerald-600 text-white shadow-glow-teal'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" /> MAP
              </button>
            </div>
          </div>
        </div>

        {/* Collapsible Multi-Criteria Advanced Filter Panel */}
        {isFilterPanelOpen && (
          <div className="p-4 rounded-xl bg-gray-950 border border-brand-500/30 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-gray-800">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-brand-400" /> Multi-Criteria Search Filters
              </h3>
              <span className="text-xs text-gray-400">All filters evaluate concurrently</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Filter Column 1: Company & Career Role */}
              <div className="space-y-3">
                <div>
                  <label className="text-gray-300 font-semibold block mb-1">Company Name</label>
                  <input
                    type="text"
                    value={filters.company}
                    onChange={(e) => setFilters({ ...filters, company: e.target.value })}
                    placeholder="e.g. Analytics India, TechCorp"
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="text-gray-300 font-semibold block mb-1">Target Career Path / Role</label>
                  <input
                    type="text"
                    value={filters.careerTarget}
                    onChange={(e) => setFilters({ ...filters, careerTarget: e.target.value })}
                    placeholder="e.g. Data Analyst, Full Stack"
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-white text-xs"
                  />
                </div>
              </div>

              {/* Filter Column 2: Location, Radius & Work Modes */}
              <div className="space-y-3">
                <div>
                  <label className="text-gray-300 font-semibold block mb-1">City / Location</label>
                  <input
                    type="text"
                    value={filters.locationQuery}
                    onChange={(e) => setFilters({ ...filters, locationQuery: e.target.value })}
                    placeholder="e.g. Bengaluru, Hyderabad, Remote"
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="text-gray-300 font-semibold block mb-1">
                    Max Commute Radius: <strong className="text-emerald-400">{filters.maxRadiusKm === 0 ? 'Any distance' : `${filters.maxRadiusKm} km`}</strong>
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={200}
                    step={10}
                    value={filters.maxRadiusKm}
                    onChange={(e) => setFilters({ ...filters, maxRadiusKm: Number(e.target.value) })}
                    className="w-full accent-brand-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                    <span>Any</span>
                    <span>25km</span>
                    <span>50km</span>
                    <span>100km</span>
                    <span>200km</span>
                  </div>
                </div>
              </div>

              {/* Filter Column 3: Required Skills Multi-Tag */}
              <div className="space-y-3">
                <div>
                  <label className="text-gray-300 font-semibold block mb-1">Target Required Skills</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSkillFilter(skillInput);
                        }
                      }}
                      placeholder="Add skill (e.g. Python, SQL)"
                      className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-white text-xs"
                    />
                    <Button size="sm" variant="accent" onClick={() => handleAddSkillFilter(skillInput)}>
                      Add
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-2 max-h-20 overflow-y-auto">
                    {filters.skills.map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-brand-500/20 text-brand-300 text-[11px] font-semibold border border-brand-500/30"
                      >
                        {s}
                        <button
                          onClick={() => handleRemoveSkillFilter(s)}
                          className="hover:text-rose-400 transition"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                    {filters.skills.length === 0 && (
                      <span className="text-[11px] text-gray-500 italic">No skill tags added</span>
                    )}
                  </div>
                </div>

                {/* Date Posted Filter */}
                <div>
                  <label className="text-gray-300 font-semibold block mb-1">Date Posted</label>
                  <select
                    value={filters.postedWithinDays}
                    onChange={(e) => setFilters({ ...filters, postedWithinDays: Number(e.target.value) })}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-white text-xs font-semibold"
                  >
                    <option value={0}>Anytime</option>
                    <option value={1}>Past 24 hours</option>
                    <option value={7}>Past week</option>
                    <option value={30}>Past month</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs Row: All, Recommended, Nearby, Remote, Saved Jobs, Saved Searches */}
      <div className="flex items-center justify-between gap-4 border-b border-gray-800 pb-3 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: 'all', label: `🎯 All Matches (${advancedResults.length})` },
            { id: 'recommended', label: '🔥 Recommended (>75%)' },
            { id: 'nearby', label: '📍 Jobs Near You' },
            { id: 'remote', label: '🌐 Remote' },
            { id: 'saved', label: `🔖 Saved Jobs (${savedJobIds.length})` },
            { id: 'saved_searches', label: `💾 Saved Searches (${savedSearches.length})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
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

      {/* SAVED SEARCHES TAB VIEW */}
      {activeTab === 'saved_searches' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-gray-900/90 border border-gray-800 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                <Save className="w-4 h-4 text-emerald-400" /> Saved Search Queries & Job Watch Alerts
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Saved search queries automatically evaluate incoming jobs and sync with AI Job Watch.
              </p>
            </div>
            <Button size="sm" variant="accent" onClick={() => setSaveSearchModalOpen(true)} icon={<Save className="w-3.5 h-3.5" />}>
              Save Current Search
            </Button>
          </div>

          {savedSearches.length === 0 ? (
            <Card className="text-center py-12">
              <Save className="w-10 h-10 text-gray-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white font-display">No saved searches yet</h3>
              <p className="text-xs text-gray-400 mt-1">Configure your search parameters and click "Save Search" to monitor opportunities.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedSearches.map((ss) => (
                <Card key={ss.id} className="relative hover:border-brand-500/50 transition">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-white text-sm font-display flex items-center gap-2">
                        {ss.name}
                        {ss.notifyJobWatch && (
                          <Badge variant="success" className="text-[10px]">
                            <Bell className="w-3 h-3 mr-1" /> Job Watch Active
                          </Badge>
                        )}
                      </h4>
                      <p className="text-xs text-gray-400 mt-1">
                        Query: <strong className="text-brand-300">"{ss.searchQuery || 'All'}"</strong> • Min Match: <strong className="text-emerald-400">{ss.filters.minMatchScore}%</strong>
                      </p>
                      {ss.filters.workModes.length > 0 && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          Work Modes: {ss.filters.workModes.join(', ')}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => handleToggleJobWatchSavedSearch(ss.id, ss.notifyJobWatch, e)}
                        title={ss.notifyJobWatch ? 'Disable Job Watch Notifications' : 'Enable Job Watch Notifications'}
                        className={`p-1.5 rounded-lg border transition ${
                          ss.notifyJobWatch
                            ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/50'
                            : 'bg-gray-900 text-gray-400 border-gray-800 hover:text-white'
                        }`}
                      >
                        {ss.notifyJobWatch ? <Bell className="w-3.5 h-3.5 text-emerald-400" /> : <BellOff className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={(e) => handleDeleteSavedSearch(ss.id, e)}
                        className="p-1.5 rounded-lg bg-gray-900 text-gray-400 hover:text-rose-400 border border-gray-800 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-800 flex items-center justify-between text-xs">
                    <span className="text-gray-500 text-[11px]">Saved {new Date(ss.createdAt).toLocaleDateString()}</span>
                    <Button size="sm" variant="outline" onClick={() => handleApplySavedSearch(ss)}>
                      Apply Search
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MAP VIEW MODE */}
      {viewMode === 'map' && activeTab !== 'saved_searches' && (
        <div className="space-y-4">
          <InteractiveJobMap
            candidateLocation={{
              city: prefs.currentLocation.city,
              state: prefs.currentLocation.state,
              latitude: prefs.currentLocation.latitude || 12.9716,
              longitude: prefs.currentLocation.longitude || 77.5946
            }}
            candidateRadiusKm={filters.maxRadiusKm || 50}
            jobs={tabFilteredResults.map((item) => ({
              id: item.job.id,
              title: item.job.title,
              company: item.job.company,
              city: typeof item.job.location === 'string' ? item.job.location.split(',')[0] : item.job.location?.city || 'Bengaluru',
              state: typeof item.job.location === 'string' ? item.job.location.split(',')[1] || 'Karnataka' : item.job.location?.state || 'Karnataka',
              latitude: item.job.latitude || 12.9716,
              longitude: item.job.longitude || 77.5946,
              workType: item.job.workType || 'Onsite',
              profileMatchScore: item.overallMatchScore
            }))}
            onSelectJob={(id) => setActiveJobId(id)}
          />
        </div>
      )}

      {/* LIST VIEW MODE */}
      {viewMode === 'list' && activeTab !== 'saved_searches' && (
        <div className="space-y-4">
          {tabFilteredResults.length === 0 ? (
            <Card className="text-center py-12">
              <Compass className="w-10 h-10 text-gray-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white font-display">No matching opportunities found</h3>
              <p className="text-xs text-gray-400 mt-1">Try adjusting your search criteria or resetting filters.</p>
              <div className="mt-4">
                <Button size="sm" variant="outline" onClick={handleResetFilters}>
                  Reset All Filters
                </Button>
              </div>
            </Card>
          ) : (
            tabFilteredResults.map((item) => {
              const isSaved = savedJobIds.includes(item.job.id);

              return (
                <Card key={item.job.id} glow={item.overallMatchScore >= 85}>
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gray-800/80">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-bold text-white font-display">{item.job.title}</h3>
                        <Badge variant={item.overallMatchScore >= 85 ? 'match-high' : 'match-mid'}>
                          {item.overallMatchScore >= 85 ? 'Top Match' : 'Good Match'}
                        </Badge>
                        <Badge variant="purple">{item.job.workType || 'On-site'}</Badge>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                        <span className="font-semibold text-white flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-gray-400" /> {item.job.company}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-emerald-400">
                          <MapPin className="w-3.5 h-3.5" />
                          {typeof item.job.location === 'string' ? item.job.location : `${item.job.location?.city}, ${item.job.location?.state}`}
                        </span>
                        <span>•</span>
                        <span>
                          {item.job.workType === 'Remote'
                            ? '🌐 Remote (0 km)'
                            : `📍 ${item.distanceKm} km away`}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-gray-400">
                          <Calendar className="w-3.5 h-3.5" /> Posted {item.job.postedDate || 'Recent'}
                        </span>
                      </div>
                    </div>

                    {/* Scores & Save Button */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-4 bg-gray-900/80 border border-gray-800 p-3 rounded-xl">
                        <div className="text-center px-2">
                          <span className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Profile Match</span>
                          <div className="text-2xl font-extrabold text-brand-300 font-display">
                            {item.breakdown.profileMatch}%
                          </div>
                        </div>

                        <div className="h-8 w-px bg-gray-800" />

                        <div className="text-center px-2">
                          <span className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Overall Score</span>
                          <div className="text-2xl font-extrabold text-emerald-400 font-display">
                            {item.overallMatchScore}%
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleToggleSaveJob(item.job.id)}
                        className={`p-2.5 rounded-xl border transition ${
                          isSaved
                            ? 'bg-brand-600 text-white border-brand-400 shadow-glow-sm'
                            : 'bg-gray-900 text-gray-400 border-gray-800 hover:text-white'
                        }`}
                      >
                        <Bookmark className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Skills Breakdown */}
                  <div className="py-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="font-semibold text-emerald-400 flex items-center gap-1 mb-1">
                        ✓ Key Strengths ({item.keyStrengths.length})
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {item.keyStrengths.map((sk) => (
                          <Badge key={sk} variant="success">✓ {sk}</Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="font-semibold text-rose-400 flex items-center gap-1 mb-1">
                        ⚠ Skill Gaps ({item.skillGaps.length})
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {item.skillGaps.length > 0 ? (
                          item.skillGaps.map((sk) => (
                            <Badge key={sk} variant="match-low">⚠ {sk}</Badge>
                          ))
                        ) : (
                          <span className="text-gray-400 text-[11px] italic">Zero core skill gaps</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Explanation Footer & Action Buttons */}
                  <div className="mt-3 pt-3 border-t border-gray-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <p className="text-brand-300 font-medium italic flex items-center gap-1.5">
                      💡 {item.explanation}
                    </p>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate('/resume-match')}
                      >
                        View Full Match
                      </Button>
                      <Button
                        size="sm"
                        variant="accent"
                        onClick={() => navigate('/interview-prep')}
                        icon={<Zap className="w-3.5 h-3.5 text-white" />}
                      >
                        Prepare for Interview
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Save Search Modal */}
      <Modal
        isOpen={saveSearchModalOpen}
        onClose={() => setSaveSearchModalOpen(false)}
        title="Save Current Search Query"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="text-gray-300 font-semibold block mb-1">Search Name</label>
            <input
              type="text"
              value={newSavedSearchName}
              onChange={(e) => setNewSavedSearchName(e.target.value)}
              placeholder="e.g. Remote Python Jobs (>80% Match)"
              className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 text-white text-xs font-medium"
            />
          </div>

          <div className="p-3 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-between">
            <div>
              <span className="font-bold text-white block">Automated AI Job Watch Monitoring</span>
              <p className="text-gray-400 text-[11px]">Notify me when new jobs matching this search criteria arrive</p>
            </div>
            <button
              onClick={() => setNewSavedSearchNotify(!newSavedSearchNotify)}
              className={`w-11 h-6 rounded-full transition-colors p-0.5 flex items-center ${
                newSavedSearchNotify ? 'bg-emerald-500 justify-end' : 'bg-gray-700 justify-start'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white shadow-md" />
            </button>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button size="sm" variant="outline" onClick={() => setSaveSearchModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="accent" onClick={handleSaveSearchSubmit}>
              Save Search Query
            </Button>
          </div>
        </div>
      </Modal>

      {/* Beginner-Friendly Filter Explanations Modal */}
      <Modal
        isOpen={isExplanationModalOpen}
        onClose={() => setIsExplanationModalOpen(false)}
        title="Beginner-Friendly Filter Explanations"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 rounded-lg bg-brand-950/40 border border-brand-500/30 text-brand-300">
            <p className="font-semibold">How Laboria AI filters and ranks opportunities:</p>
            <p className="mt-1 text-[11px] text-gray-300">
              Laboria AI prioritizes your candidate skills and resume experience as the primary decision factor (60%), followed by location commute radius (20%).
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Active Search Criteria Summary:</h4>
            {filterExplanations.map((exp, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-gray-900 border border-gray-800 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <span className="text-gray-300 text-xs">{exp}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 flex justify-end">
            <Button size="sm" variant="accent" onClick={() => setIsExplanationModalOpen(false)}>
              Got it
            </Button>
          </div>
        </div>
      </Modal>

      {/* Location Preference Settings Modal */}
      <Modal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="Location & Mobility Settings"
      >
        <div className="space-y-4 text-xs">
          <div className="space-y-2">
            <span className="font-semibold text-gray-300 block">Preferred Commute Radius</span>
            <div className="flex items-center gap-2">
              {[5, 10, 25, 50, 100].map((r) => (
                <button
                  key={r}
                  onClick={() => setFilters({ ...filters, maxRadiusKm: r })}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs border transition ${
                    filters.maxRadiusKm === r
                      ? 'bg-brand-600 text-white border-brand-400'
                      : 'bg-gray-900 text-gray-400 border-gray-800'
                  }`}
                >
                  {r} km
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-between">
            <div>
              <span className="font-bold text-white block">Willing to Relocate</span>
              <p className="text-gray-400 text-[11px]">Allow recommendations outside preferred radius</p>
            </div>
            <button
              onClick={() => setPrefs({ ...prefs, willingToRelocate: !prefs.willingToRelocate })}
              className={`w-11 h-6 rounded-full transition-colors p-0.5 flex items-center ${
                prefs.willingToRelocate ? 'bg-emerald-500 justify-end' : 'bg-gray-700 justify-start'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white shadow-md" />
            </button>
          </div>

          <div className="pt-2 flex justify-end">
            <Button size="sm" variant="accent" onClick={() => setIsSettingsOpen(false)}>
              Save Preferences
            </Button>
          </div>
        </div>
      </Modal>

      {/* Automated Diagnostic Test Suite Modal */}
      <Modal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        title="Laboria AI - 12-Point Advanced Search & Location Test Suite"
      >
        <div className="space-y-4 text-xs">
          {advTestReport && (
            <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-semibold flex items-center justify-between">
              <span>Step 16 Advanced Search Suite: {advTestReport.passCount}/{advTestReport.totalTests} Passed</span>
              <Badge variant={advTestReport.passed ? 'success' : 'match-low'}>
                {advTestReport.passed ? 'ALL PASSED' : 'FAILED'}
              </Badge>
            </div>
          )}

          <div className="space-y-2">
            {advTestReport?.details.map((tr, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-gray-900/80 border border-gray-800 flex items-center justify-between gap-3"
              >
                <div>
                  <p className="font-bold text-white">Advanced Search Test #{idx + 1}: {tr.name}</p>
                  <p className="text-gray-400 text-[11px] mt-0.5">{tr.message}</p>
                </div>
                <Badge variant={tr.status === 'PASS' ? 'success' : 'match-low'}>
                  {tr.status}
                </Badge>
              </div>
            ))}

            {testResults.map((tr) => (
              <div
                key={tr.testId}
                className="p-3 rounded-lg bg-gray-900/80 border border-gray-800 flex items-center justify-between gap-3"
              >
                <div>
                  <p className="font-bold text-white">Location Test #{tr.testId}: {tr.testName}</p>
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
