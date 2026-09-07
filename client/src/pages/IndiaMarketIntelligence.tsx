import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Sparkles,
  MapPin,
  Briefcase,
  Compass,
  ShieldCheck,
  Zap,
  ExternalLink,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Cpu,
  RefreshCw,
  Search,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { MarketIntelligenceService } from '../services/marketIntelligenceService';
import { runMarketIntelligenceEngineTests, TestResultItem } from '../services/marketIntelligenceEngineTests';
import { DataAttribution } from '../types';

export const IndiaMarketIntelligence: React.FC = () => {
  const [keywordFilter, setKeywordFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [activeTab, setActiveTab] = useState<
    'growing' | 'declining' | 'emerging' | 'demand' | 'location' | 'remote' | 'experience' | 'transitions'
  >('growing');

  const [testResultsModalOpen, setTestResultsModalOpen] = useState(false);
  const [testSuiteOutput, setTestSuiteOutput] = useState<{ passed: boolean; results: TestResultItem[] } | null>(null);

  // Fetch intelligence bundle based on current state
  const bundle = MarketIntelligenceService.getMarketIntelligenceBundle({
    keyword: keywordFilter,
    location: locationFilter,
    skill: skillFilter
  });

  const handleTestRun = () => {
    const res = runMarketIntelligenceEngineTests();
    setTestSuiteOutput(res);
    setTestResultsModalOpen(true);
  };

  const triggerSparseQuery = () => {
    setKeywordFilter('Quantum Cryptography Underwater Architecture');
    setLocationFilter('Antarctica Hub');
  };

  const resetFilters = () => {
    setKeywordFilter('');
    setLocationFilter('');
    setSkillFilter('');
  };

  const renderAttributionFooter = (attr: DataAttribution) => (
    <div className="mt-4 pt-3 border-t border-slate-700/60 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
      <div className="flex items-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span className="font-medium text-slate-300">Source:</span> {attr.source}
        {attr.sourceUrl && (
          <a
            href={attr.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:underline flex items-center gap-0.5 ml-1"
          >
            Link <ExternalLink className="w-3 h-3 inline" />
          </a>
        )}
      </div>
      <div className="flex items-center gap-3">
        <span>Observed: {attr.observedDate}</span>
        <span>Updated: {attr.updatedDate}</span>
        <Badge variant={attr.confidence === 'High' ? 'success' : 'warning'}>
          {attr.confidence} Confidence
        </Badge>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/20 rounded-2xl p-6 sm:p-8 shadow-2xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="purple" className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" /> India Labor Market Intelligence
              </Badge>
              <span className="text-xs text-slate-400">Step 24 Module</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              India Tech & Labor Market Trends
            </h1>
            <p className="text-slate-300 mt-2 max-w-2xl text-sm leading-relaxed">
              Real-time, verified insights across 8 economic dimensions. Laboria strictly attributes every metric to official benchmarks (NASSCOM, MSDE, India Skills Report) and enforces an explicit <span className="text-cyan-300 font-semibold">"Insufficient data" policy</span> when data is sparse.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button variant="secondary" onClick={handleTestRun} className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Run 12-Point Diagnostics
            </Button>
          </div>
        </div>
      </div>

      {/* Search & Filter Control Panel */}
      <Card className="bg-slate-900/80 border-slate-800 p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-grow">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Keyword (e.g. Cybersecurity, AI)"
                value={keywordFilter}
                onChange={e => setKeywordFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Location (e.g. Bengaluru, Pune)"
                value={locationFilter}
                onChange={e => setLocationFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="relative">
              <Cpu className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Skill (e.g. Vector DB, Rust)"
                value={skillFilter}
                onChange={e => setSkillFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {(keywordFilter || locationFilter || skillFilter) && (
              <Button variant="ghost" onClick={resetFilters} className="text-xs text-slate-400">
                <RefreshCw className="w-3.5 h-3.5 mr-1" /> Clear
              </Button>
            )}
            <Button
              variant="outline"
              onClick={triggerSparseQuery}
              className="text-xs text-amber-300 border-amber-500/30 hover:bg-amber-500/10 flex items-center gap-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Test Sparse Query Policy
            </Button>
          </div>
        </div>
      </Card>

      {/* Sparse Data Alert Banner */}
      {bundle.isSparseDataResult && (
        <div className="p-4 bg-amber-950/40 border border-amber-500/40 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-amber-300 text-sm">Insufficient Data Policy Triggered</span>
              <Badge variant="warning">Zero Fabricated Numbers</Badge>
            </div>
            <p className="text-xs text-amber-200/90 leading-relaxed">
              {bundle.sparseDataReason}
            </p>
            <button
              onClick={resetFilters}
              className="text-xs text-cyan-400 hover:underline font-medium pt-1 inline-block"
            >
              Reset filters to return to verified market benchmarks
            </button>
          </div>
        </div>
      )}

      {/* 8 Market Dimensions Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 no-scrollbar">
        {[
          { key: 'growing', label: 'Growing Careers', icon: TrendingUp, count: bundle.growingCareers.length },
          { key: 'declining', label: 'Declining Careers', icon: TrendingDown, count: bundle.decliningCareers.length },
          { key: 'emerging', label: 'Emerging Skills', icon: Sparkles, count: bundle.emergingSkills.length },
          { key: 'demand', label: 'Skill Demand', icon: Cpu, count: bundle.skillDemand.length },
          { key: 'location', label: 'Location Trends', icon: MapPin, count: bundle.locationTrends.length },
          { key: 'remote', label: 'Remote & Hybrid', icon: Briefcase, count: bundle.remoteOpportunities.length },
          { key: 'experience', label: 'Experience Trends', icon: Layers, count: bundle.experienceTrends.length },
          { key: 'transitions', label: 'Career Transitions', icon: Compass, count: bundle.careerTransitions.length }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-xs whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-slate-800'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
              {tab.label}
              <span
                className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${
                  isActive ? 'bg-cyan-500/30 text-cyan-200' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Display */}
      <div className="space-y-4">
        {/* TAB 1: GROWING CAREERS */}
        {activeTab === 'growing' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bundle.growingCareers.length === 0 ? (
              <Card className="col-span-2 p-8 text-center bg-slate-900/40 border-slate-800 text-slate-400 text-sm">
                No growing careers match the applied search filter.
              </Card>
            ) : (
              bundle.growingCareers.map(item => (
                <Card key={item.id} className="bg-slate-900/90 border-slate-800 hover:border-indigo-500/40 p-5 transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="purple">{item.category}</Badge>
                        <Badge variant="success" className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" /> +{item.growthRatePercent}% YoY
                        </Badge>
                      </div>
                      <h3 className="text-lg font-bold text-white mt-2">{item.title}</h3>
                    </div>
                  </div>

                  <p className="text-xs text-cyan-300 mt-2 font-medium">Demand Volume: {item.demandVolume}</p>

                  <div className="mt-3 space-y-2">
                    <div>
                      <span className="text-xs font-semibold text-slate-400 block mb-1">Key Growth Drivers:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {item.keyDrivers.map((driver, idx) => (
                          <span key={idx} className="bg-slate-800 text-slate-300 text-xs px-2 py-0.5 rounded">
                            {driver}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-400 block mb-1">Top Tech Hubs:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {item.topLocations.map((loc, idx) => (
                          <span key={idx} className="bg-indigo-950/60 text-indigo-300 border border-indigo-800/40 text-xs px-2 py-0.5 rounded">
                            📍 {loc}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {renderAttributionFooter(item.attribution)}
                </Card>
              ))
            )}
          </div>
        )}

        {/* TAB 2: DECLINING CAREERS */}
        {activeTab === 'declining' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bundle.decliningCareers.length === 0 ? (
              <Card className="col-span-2 p-8 text-center bg-slate-900/40 border-slate-800 text-slate-400 text-sm">
                No declining careers match the applied search filter.
              </Card>
            ) : (
              bundle.decliningCareers.map(item => (
                <Card key={item.id} className="bg-slate-900/90 border-slate-800 hover:border-red-500/40 p-5 transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="info">{item.category}</Badge>
                        <Badge variant="warning" className="flex items-center gap-1">
                          <TrendingDown className="w-3 h-3" /> {item.growthRatePercent}% YoY
                        </Badge>
                      </div>
                      <h3 className="text-lg font-bold text-white mt-2">{item.title}</h3>
                    </div>
                  </div>

                  <p className="text-xs text-rose-300 mt-2 font-medium">Demand Trend: {item.demandVolume}</p>

                  <div className="mt-3">
                    <span className="text-xs font-semibold text-slate-400 block mb-1">Automation / Decline Causes:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {item.keyDrivers.map((driver, idx) => (
                        <span key={idx} className="bg-rose-950/40 text-rose-300 border border-rose-800/30 text-xs px-2 py-0.5 rounded">
                          {driver}
                        </span>
                      ))}
                    </div>
                  </div>

                  {renderAttributionFooter(item.attribution)}
                </Card>
              ))
            )}
          </div>
        )}

        {/* TAB 3: EMERGING SKILLS */}
        {activeTab === 'emerging' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {bundle.emergingSkills.length === 0 ? (
              <Card className="col-span-3 p-8 text-center bg-slate-900/40 border-slate-800 text-slate-400 text-sm">
                No emerging skills match the applied search filter.
              </Card>
            ) : (
              bundle.emergingSkills.map(item => (
                <Card key={item.id} className="bg-slate-900/90 border-slate-800 hover:border-cyan-500/40 p-5 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <Badge variant="purple">{item.category}</Badge>
                      <Badge variant="success">+{item.growthRatePercent}% Growth</Badge>
                    </div>
                    <h3 className="text-base font-bold text-white mt-2">{item.skillName}</h3>
                    <p className="text-xs text-slate-300 mt-1">Open Postings: {item.openPostingsCount.toLocaleString()}</p>
                    <div className="mt-3">
                      <span className="text-xs font-semibold text-slate-400 block mb-1">Associated Roles:</span>
                      <div className="flex flex-wrap gap-1">
                        {item.topAssociatedRoles.map((role, idx) => (
                          <span key={idx} className="bg-slate-800 text-slate-300 text-[11px] px-2 py-0.5 rounded">
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  {renderAttributionFooter(item.attribution)}
                </Card>
              ))
            )}
          </div>
        )}

        {/* TAB 4: SKILL DEMAND */}
        {activeTab === 'demand' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {bundle.skillDemand.length === 0 ? (
              <Card className="col-span-3 p-8 text-center bg-slate-900/40 border-slate-800 text-slate-400 text-sm">
                No skill demand items match the applied search filter.
              </Card>
            ) : (
              bundle.skillDemand.map(item => (
                <Card key={item.id} className="bg-slate-900/90 border-slate-800 hover:border-cyan-500/40 p-5 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <Badge variant="info">{item.category}</Badge>
                      <Badge variant="success">{item.demandLevel} Demand</Badge>
                    </div>
                    <h3 className="text-base font-bold text-white mt-2">{item.skillName}</h3>
                    <p className="text-xs text-cyan-300 mt-1">Total Postings: {item.openPostingsCount.toLocaleString()}</p>
                    <div className="mt-3">
                      <span className="text-xs font-semibold text-slate-400 block mb-1">Demanded Roles:</span>
                      <div className="flex flex-wrap gap-1">
                        {item.topAssociatedRoles.map((role, idx) => (
                          <span key={idx} className="bg-slate-800 text-slate-300 text-[11px] px-2 py-0.5 rounded">
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  {renderAttributionFooter(item.attribution)}
                </Card>
              ))
            )}
          </div>
        )}

        {/* TAB 5: LOCATION TRENDS */}
        {activeTab === 'location' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bundle.locationTrends.length === 0 ? (
              <Card className="col-span-2 p-8 text-center bg-slate-900/40 border-slate-800 text-slate-400 text-sm">
                No location trends match the applied search filter.
              </Card>
            ) : (
              bundle.locationTrends.map(item => (
                <Card key={item.id} className="bg-slate-900/90 border-slate-800 hover:border-emerald-500/40 p-5 transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-extrabold text-white">📍 {item.city}</span>
                        <span className="text-xs text-slate-400">({item.state})</span>
                      </div>
                      <Badge variant="purple" className="mt-1">{item.tier}</Badge>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-emerald-400 font-bold block">+{item.growthYoYPercent}% YoY Growth</span>
                      <span className="text-xs text-slate-400">Remote Share: {item.remoteSharePercent}%</span>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 bg-slate-950/60 p-3 rounded-lg border border-slate-800 text-xs">
                    <div>
                      <span className="text-slate-400 block">Avg Tech Salary Range:</span>
                      <span className="text-cyan-300 font-bold">{item.avgSalaryRangeINR}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Hiring Sectors:</span>
                      <span className="text-slate-200">{item.topHiringSectors.slice(0, 2).join(', ')}</span>
                    </div>
                  </div>

                  {renderAttributionFooter(item.attribution)}
                </Card>
              ))
            )}
          </div>
        )}

        {/* TAB 6: REMOTE OPPORTUNITIES */}
        {activeTab === 'remote' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {bundle.remoteOpportunities.map(item => (
              <Card key={item.id} className="bg-slate-900/90 border-slate-800 hover:border-cyan-500/40 p-5 transition-all flex flex-col justify-between">
                <div>
                  <Badge variant={item.growthTrend === 'Expanding' ? 'success' : 'warning'}>
                    {item.growthTrend} Trend
                  </Badge>
                  <h3 className="text-base font-bold text-white mt-2">{item.roleCategory}</h3>

                  <div className="mt-3 space-y-2 text-xs">
                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Remote</span>
                        <span className="font-semibold">{item.remoteSharePercent}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-400 h-full" style={{ width: `${item.remoteSharePercent}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Hybrid</span>
                        <span className="font-semibold">{item.hybridSharePercent}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-cyan-400 h-full" style={{ width: `${item.hybridSharePercent}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>On-site</span>
                        <span className="font-semibold">{item.onsiteSharePercent}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-slate-500 h-full" style={{ width: `${item.onsiteSharePercent}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {renderAttributionFooter(item.attribution)}
              </Card>
            ))}
          </div>
        )}

        {/* TAB 7: EXPERIENCE TRENDS */}
        {activeTab === 'experience' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bundle.experienceTrends.map(item => (
              <Card key={item.id} className="bg-slate-900/90 border-slate-800 hover:border-indigo-500/40 p-5 transition-all">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">{item.experienceLevel}</h3>
                  <Badge variant="purple">{item.hiringVolumeSharePercent}% Hiring Share</Badge>
                </div>

                <p className="text-xs text-cyan-300 font-semibold mt-2">Avg Compensation: {item.avgSalaryINR}</p>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">{item.trendDescription}</p>

                <div className="mt-3">
                  <span className="text-xs font-semibold text-slate-400 block mb-1">Top Demanded Skills:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {item.topDemandedSkills.map((sk, idx) => (
                      <span key={idx} className="bg-indigo-950/60 text-indigo-300 border border-indigo-800/40 text-xs px-2 py-0.5 rounded">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                {renderAttributionFooter(item.attribution)}
              </Card>
            ))}
          </div>
        )}

        {/* TAB 8: CAREER TRANSITIONS */}
        {activeTab === 'transitions' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {bundle.careerTransitions.map(item => (
              <Card key={item.id} className="bg-slate-900/90 border-slate-800 hover:border-cyan-500/40 p-5 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <Badge variant={item.transitionDifficulty === 'Easy' ? 'success' : 'warning'}>
                      {item.transitionDifficulty} Feasibility
                    </Badge>
                    <span className="text-emerald-400 font-bold">{item.successRatePercent}% Success Rate</span>
                  </div>

                  <div className="mt-3 bg-slate-950/80 p-3 rounded-lg border border-slate-800">
                    <div className="text-xs text-slate-400">From: <span className="text-slate-200 font-medium">{item.fromCareer}</span></div>
                    <div className="flex justify-center my-1 text-cyan-400">↓</div>
                    <div className="text-xs text-slate-400">To: <span className="text-cyan-300 font-bold">{item.toCareer}</span></div>
                  </div>

                  <div className="mt-3 text-xs">
                    <span className="text-slate-400 block mb-1">Bridge Skills Needed:</span>
                    <div className="flex flex-wrap gap-1">
                      {item.commonBridgeSkills.map((sk, idx) => (
                        <span key={idx} className="bg-slate-800 text-slate-300 text-[11px] px-2 py-0.5 rounded">
                          {sk}
                        </span>
                      ))}
                    </div>
                    <span className="text-slate-400 block mt-2">Avg Timeline: <span className="text-slate-200 font-medium">{item.avgTransitionMonths} months</span></span>
                  </div>
                </div>

                {renderAttributionFooter(item.attribution)}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* 4 Connected Laboria Modules Card */}
      <Card className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border-indigo-500/30 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">4 Connected Laboria Intelligence Modules</h2>
          </div>
          <Badge variant="purple">Cross-System Intelligence Integration</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Module 1: Future Skills Radar */}
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs mb-2">
                <Sparkles className="w-4 h-4" /> Future Skills Radar
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {bundle.moduleConnections.futureSkillsRadarPayload.recommendedRadarFocus}
              </p>
            </div>
            <a
              href="/future-skills"
              className="mt-3 inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-medium"
            >
              Open Radar <ArrowRight className="w-3 h-3" />
            </a>
          </div>

          {/* Module 2: Career Navigator */}
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs mb-2">
                <Compass className="w-4 h-4" /> Career Navigator
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Recommended Path: <span className="text-white font-bold">{bundle.moduleConnections.careerNavigatorPayload.recommendedPath}</span> ({bundle.moduleConnections.careerNavigatorPayload.marketGrowthFactor})
              </p>
            </div>
            <a
              href="/career-path"
              className="mt-3 inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
            >
              Navigate Path <ArrowRight className="w-3 h-3" />
            </a>
          </div>

          {/* Module 3: Job Matching */}
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs mb-2">
                <Briefcase className="w-4 h-4" /> Job Matching
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Boosting jobs in <span className="text-emerald-300 font-semibold">{bundle.moduleConnections.jobMatchingPayload.hotLocations.join(', ')}</span> matching high-demand tags by x{bundle.moduleConnections.jobMatchingPayload.boostFactor}.
              </p>
            </div>
            <a
              href="/jobs"
              className="mt-3 inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-medium"
            >
              View Job Matches <ArrowRight className="w-3 h-3" />
            </a>
          </div>

          {/* Module 4: AI Mentor */}
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs mb-2">
                <BookOpen className="w-4 h-4" /> AI Mentor
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {bundle.moduleConnections.aiMentorPayload.recommendedActionItem}
              </p>
            </div>
            <a
              href="/ai-mentor"
              className="mt-3 inline-flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 font-medium"
            >
              Ask AI Mentor <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      </Card>

      {/* Diagnostics Test Results Modal */}
      {testResultsModalOpen && testSuiteOutput && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">Step 24 Diagnostics Suite</h3>
              </div>
              <Button variant="ghost" onClick={() => setTestResultsModalOpen(false)} className="text-xs text-slate-400">
                Close
              </Button>
            </div>

            <div className="flex items-center justify-between bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-300">Overall Suite Status:</span>
              <Badge variant={testSuiteOutput.passed ? 'success' : 'warning'}>
                {testSuiteOutput.passed ? '12/12 PASSED' : 'SOME TESTS FAILED'}
              </Badge>
            </div>

            <div className="space-y-2">
              {testSuiteOutput.results.map((r, idx) => (
                <div key={idx} className="bg-slate-950/80 p-3 rounded-lg border border-slate-800/80 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-200">{r.name}</span>
                    <Badge variant={r.passed ? 'success' : 'warning'}>
                      {r.passed ? 'PASSED' : 'FAILED'}
                    </Badge>
                  </div>
                  <p className="text-slate-400">{r.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IndiaMarketIntelligence;
